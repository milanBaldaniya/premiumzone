import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';
import Coupon from '../models/coupon.model.js';
import Address from '../models/address.model.js';
import Notification from '../models/notification.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from '../constants/index.js';
import { buildLineItems, applyCoupon, computeTotals } from './pricing.service.js';
import { sendOrderConfirmationEmail } from './email.service.js';

const toSnapshot = (addr) => ({
  fullName: addr.fullName,
  phone: addr.phone,
  line1: addr.line1,
  line2: addr.line2,
  city: addr.city,
  state: addr.state,
  postalCode: addr.postalCode,
  country: addr.country,
});

/**
 * Atomically decrements stock for each line item using a conditional update.
 * Rolls back already-applied decrements if any item is out of stock.
 */
const reserveStock = async (lineItems) => {
  const applied = [];
  for (const item of lineItems) {
    const filter = { _id: item.product };
    const update = { $inc: { stock: -item.quantity, soldCount: item.quantity } };
    if (item.variantId) {
      filter['variants._id'] = item.variantId;
      filter['variants.stock'] = { $gte: item.quantity };
      update.$inc['variants.$.stock'] = -item.quantity;
    } else {
      filter.stock = { $gte: item.quantity };
    }
    const updated = await Product.findOneAndUpdate(filter, update);
    if (!updated) {
      // rollback
      await Promise.all(
        applied.map((a) =>
          Product.updateOne(
            { _id: a.product },
            { $inc: { stock: a.quantity, soldCount: -a.quantity } }
          )
        )
      );
      throw ApiError.badRequest(`"${item.name}" just went out of stock`);
    }
    applied.push(item);
  }
};

export const placeOrder = async (user, payload) => {
  const {
    addressId,
    shippingAddress,
    paymentMethod = PAYMENT_METHOD.COD,
    couponCode,
    notes,
    // Set only by the Razorpay verify/webhook flow once payment has actually been captured.
    paymentStatus = PAYMENT_STATUS.PENDING,
    paymentResult,
    razorpayOrderId,
  } = payload;

  const cart = await Cart.findOne({ user: user._id });
  if (!cart || !cart.items.length) throw ApiError.badRequest('Your cart is empty');

  // Resolve shipping address (saved id OR inline snapshot)
  let addr = shippingAddress;
  if (addressId) {
    const saved = await Address.findOne({ _id: addressId, user: user._id });
    if (!saved) throw ApiError.badRequest('Shipping address not found');
    addr = toSnapshot(saved);
  }
  if (!addr?.line1) throw ApiError.badRequest('A shipping address is required');

  const { lineItems, itemsTotal } = await buildLineItems(cart.items);

  // Coupon (optional)
  let discount = 0;
  let couponDoc = null;
  const code = couponCode || cart.coupon;
  if (code) {
    const resolvedCode = typeof code === 'string' ? code : (await Coupon.findById(code))?.code;
    if (resolvedCode) {
      const applied = await applyCoupon(resolvedCode, itemsTotal, user._id);
      discount = applied.discount;
      couponDoc = applied.coupon;
    }
  }

  const totals = await computeTotals({ itemsTotal, discount });

  // Reserve stock before persisting the order
  await reserveStock(lineItems);

  const order = await Order.create({
    user: user._id,
    items: lineItems,
    shippingAddress: toSnapshot(addr),
    billingAddress: toSnapshot(addr),
    itemsTotal: totals.itemsTotal,
    shippingFee: totals.shippingFee,
    taxAmount: totals.taxAmount,
    discountAmount: totals.discountAmount,
    grandTotal: totals.grandTotal,
    currency: totals.currency,
    coupon: couponDoc ? { code: couponDoc.code, discount } : undefined,
    paymentMethod,
    paymentStatus,
    paymentResult,
    razorpayOrderId,
    notes,
  });

  // Record coupon usage
  if (couponDoc) {
    const usage = couponDoc.usedBy.find((u) => u.user.toString() === user._id.toString());
    if (usage) usage.count += 1;
    else couponDoc.usedBy.push({ user: user._id, count: 1 });
    couponDoc.usedCount += 1;
    await couponDoc.save();
  }

  // Clear cart + notify (best-effort)
  cart.items = [];
  cart.coupon = null;
  await cart.save();

  await Notification.create({
    user: user._id,
    type: 'order',
    title: 'Order placed',
    message: `Your order ${order.orderNumber} has been placed successfully.`,
    link: `/orders/${order.orderNumber}`,
  }).catch(() => {});
  await sendOrderConfirmationEmail(user.email, user.name, order).catch(() => {});

  return order;
};

export const cancelOrder = async (user, orderId) => {
  const order = await Order.findOne({ _id: orderId, user: user._id });
  if (!order) throw ApiError.notFound('Order not found');
  const cancellable = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
  if (!cancellable.includes(order.status)) {
    throw ApiError.badRequest(`Order cannot be cancelled once ${order.status}`);
  }

  // Restore stock
  await Promise.all(
    order.items.map((item) => {
      const filter = { _id: item.product };
      const update = { $inc: { stock: item.quantity, soldCount: -item.quantity } };
      if (item.variantId) {
        filter['variants._id'] = item.variantId;
        update.$inc['variants.$.stock'] = item.quantity;
      }
      return Product.updateOne(filter, update);
    })
  );

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelReason = 'Cancelled by customer';
  order.statusHistory.push({ status: ORDER_STATUS.CANCELLED, note: 'Cancelled by customer', by: user._id });
  await order.save();
  return order;
};

export const updateOrderStatus = async (adminUser, orderId, { status, trackingNumber, courier, note }) => {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound('Order not found');

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courier) order.courier = courier;
  if (status === ORDER_STATUS.DELIVERED) {
    order.deliveredAt = new Date();
    order.paymentStatus = PAYMENT_STATUS.PAID; // COD collected on delivery
  }
  order.statusHistory.push({ status, note: note || `Marked as ${status}`, by: adminUser._id });
  await order.save();

  await Notification.create({
    user: order.user,
    type: 'order',
    title: 'Order update',
    message: `Your order ${order.orderNumber} is now ${status}.`,
    link: `/orders/${order.orderNumber}`,
  }).catch(() => {});

  return order;
};
