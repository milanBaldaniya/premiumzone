import Product from '../models/product.model.js';
import Coupon from '../models/coupon.model.js';
import Setting from '../models/setting.model.js';
import { COUPON_TYPE } from '../constants/index.js';
import { ApiError } from '../utils/ApiError.js';

/** Resolves the live unit price for a product/variant. */
const unitPrice = (product, variantId) => {
  if (variantId) {
    const variant = product.variants.id(variantId);
    if (variant) {
      const p = variant.price ?? product.price;
      const d = variant.discountPrice ?? product.discountPrice;
      return d && d > 0 ? d : p;
    }
  }
  return product.finalPrice;
};

/**
 * Builds detailed line items from raw cart items, validating stock and
 * pulling live prices. Returns { lineItems, itemsTotal }.
 */
export const buildLineItems = async (items = []) => {
  if (!items.length) throw ApiError.badRequest('Cart is empty');

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const map = new Map(products.map((p) => [p._id.toString(), p]));

  let itemsTotal = 0;
  const lineItems = items.map((item) => {
    const product = map.get(item.product.toString());
    if (!product) throw ApiError.badRequest('A product in your cart no longer exists');

    const variant = item.variantId ? product.variants.id(item.variantId) : null;
    const available = variant ? variant.stock : product.stock;
    if (available < item.quantity) {
      throw ApiError.badRequest(`Insufficient stock for "${product.name}"`);
    }

    const price = unitPrice(product, item.variantId);
    const subtotal = price * item.quantity;
    itemsTotal += subtotal;

    return {
      product: product._id,
      variantId: item.variantId || null,
      name: variant ? `${product.name} (${variant.name})` : product.name,
      sku: variant?.sku || product.sku,
      image: product.thumbnail?.url,
      price,
      quantity: item.quantity,
      subtotal,
      paymentMethod: product.paymentMethod,
    };
  });

  return { lineItems, itemsTotal: Math.round(itemsTotal * 100) / 100 };
};

/** Applies and validates a coupon against the running subtotal + user. */
export const applyCoupon = async (code, itemsTotal, userId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.isValid) throw ApiError.badRequest('Invalid or expired coupon');
  if (itemsTotal < coupon.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order of ${coupon.minOrderAmount} required for this coupon`);
  }
  const usage = coupon.usedBy.find((u) => u.user.toString() === userId?.toString());
  if (usage && usage.count >= coupon.perUserLimit) {
    throw ApiError.badRequest('You have already used this coupon');
  }

  let discount =
    coupon.type === COUPON_TYPE.PERCENTAGE ? (itemsTotal * coupon.value) / 100 : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, itemsTotal);

  return { coupon, discount: Math.round(discount * 100) / 100 };
};

/** Computes the full money breakdown for a cart/checkout. */
export const computeTotals = async ({ itemsTotal, discount = 0 }) => {
  const settings = await Setting.getSettings();
  const { freeShippingThreshold, flatRate, taxPercent } = settings.shipping;

  const shippingFee = itemsTotal >= freeShippingThreshold ? 0 : flatRate;
  const taxable = Math.max(0, itemsTotal - discount);
  const taxAmount = Math.round(((taxable * taxPercent) / 100) * 100) / 100;
  const grandTotal = Math.round((taxable + shippingFee + taxAmount) * 100) / 100;

  return {
    itemsTotal,
    discountAmount: discount,
    shippingFee,
    taxAmount,
    grandTotal,
    currency: settings.store.currency,
  };
};
