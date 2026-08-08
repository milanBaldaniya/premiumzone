import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import Address from '../models/address.model.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../constants/index.js';
import { buildLineItems, applyCoupon, computeTotals } from '../services/pricing.service.js';
import { razorpay, createRazorpayOrder, verifyPaymentSignature, verifyWebhookSignature } from '../services/razorpay.service.js';
import * as orderService from '../services/order.service.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/** Quotes the cart total and opens a Razorpay order for it (INR — required for UPI). */
export const createOrder = asyncHandler(async (req, res) => {
  const { addressId, couponCode } = req.body;
  if (!addressId) throw ApiError.badRequest('A shipping address is required');

  const address = await Address.findOne({ _id: addressId, user: req.user._id });
  if (!address) throw ApiError.badRequest('Shipping address not found');

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart?.items.length) throw ApiError.badRequest('Your cart is empty');

  const { itemsTotal } = await buildLineItems(cart.items);
  let discount = 0;
  if (couponCode) {
    discount = (await applyCoupon(couponCode, itemsTotal, req.user._id)).discount;
  }
  const { grandTotal } = await computeTotals({ itemsTotal, discount });

  const rpOrder = await createRazorpayOrder({
    amount: grandTotal,
    receipt: `rcpt_${Date.now()}`,
    notes: { userId: req.user._id.toString(), addressId, couponCode: couponCode || '' },
  });

  sendResponse(res, {
    statusCode: 201,
    data: {
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: env.RAZORPAY_KEY_ID,
    },
    message: 'Razorpay order created',
  });
});

/** Shared by the client-side verify call and the webhook — idempotent on razorpayOrderId. */
const finalizeOrder = async ({ razorpayOrderId, paymentId, notes }) => {
  const existing = await Order.findOne({ razorpayOrderId });
  if (existing) return existing;

  const user = await User.findById(notes.userId);
  if (!user) throw ApiError.badRequest('User for this payment no longer exists');

  return orderService.placeOrder(user, {
    addressId: notes.addressId,
    couponCode: notes.couponCode || undefined,
    paymentMethod: PAYMENT_METHOD.RAZORPAY,
    paymentStatus: PAYMENT_STATUS.PAID,
    paymentResult: { transactionId: paymentId, provider: 'razorpay', paidAt: new Date() },
    razorpayOrderId,
  });
};

/** Client calls this immediately after Razorpay Checkout succeeds. */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } =
    req.body;
  if (!razorpayOrderId || !paymentId || !signature) throw ApiError.badRequest('Missing payment details');

  const valid = verifyPaymentSignature({ orderId: razorpayOrderId, paymentId, signature });
  if (!valid) throw ApiError.badRequest('Payment verification failed');

  const rpOrder = await razorpay.orders.fetch(razorpayOrderId);
  const notes = rpOrder.notes || {};
  if (notes.userId !== req.user._id.toString()) throw ApiError.forbidden('This payment does not belong to you');

  const order = await finalizeOrder({ razorpayOrderId, paymentId, notes });
  sendResponse(res, { statusCode: 201, data: order, message: 'Payment verified — order placed' });
});

/** Razorpay server-to-server event delivery — the reliable source of truth. */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const valid = verifyWebhookSignature(req.rawBody, signature);
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid webhook signature' });

    const event = req.body;
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      await finalizeOrder({
        razorpayOrderId: payment.order_id,
        paymentId: payment.id,
        notes: payment.notes || {},
      });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    logger.error(`Razorpay webhook error: ${err.message}`);
    // Ack anyway — a bug on our side shouldn't make Razorpay hammer this endpoint with retries.
    res.status(200).json({ success: false });
  }
};
