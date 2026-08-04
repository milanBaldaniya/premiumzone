import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { buildLineItems, applyCoupon, computeTotals } from '../services/pricing.service.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

/** Returns the cart with recomputed live line items and totals. */
const summarize = async (cart) => {
  if (!cart.items.length) {
    const totals = await computeTotals({ itemsTotal: 0 });
    return { cart, lineItems: [], summary: { ...totals, discountAmount: 0 } };
  }
  const { lineItems, itemsTotal } = await buildLineItems(cart.items);

  let discount = 0;
  let couponCode;
  if (cart.coupon) {
    await cart.populate('coupon');
    try {
      const applied = await applyCoupon(cart.coupon.code, itemsTotal, cart.user);
      discount = applied.discount;
      couponCode = applied.coupon.code;
    } catch {
      cart.coupon = null;
      await cart.save();
    }
  }
  const totals = await computeTotals({ itemsTotal, discount });
  return { cart, lineItems, summary: { ...totals, coupon: couponCode } };
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const data = await summarize(cart);
  sendResponse(res, { data, message: 'Cart' });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId = null, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find(
    (i) => i.product.toString() === productId && String(i.variantId) === String(variantId)
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      variantId,
      quantity,
      priceSnapshot: product.finalPrice,
    });
  }
  await cart.save();
  const data = await summarize(cart);
  sendResponse(res, { data, message: 'Added to cart' });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Cart item not found');

  if (quantity <= 0) item.deleteOne();
  else item.quantity = quantity;
  await cart.save();
  const data = await summarize(cart);
  sendResponse(res, { data, message: 'Cart updated' });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Cart item not found');
  item.deleteOne();
  await cart.save();
  const data = await summarize(cart);
  sendResponse(res, { data, message: 'Item removed' });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = null;
  await cart.save();
  sendResponse(res, { data: { cart }, message: 'Cart cleared' });
});

export const applyCartCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const { lineItems, itemsTotal } = await buildLineItems(cart.items);
  if (!lineItems.length) throw ApiError.badRequest('Cart is empty');
  const { coupon } = await applyCoupon(req.body.code, itemsTotal, req.user._id);
  cart.coupon = coupon._id;
  await cart.save();
  const data = await summarize(cart);
  sendResponse(res, { data, message: 'Coupon applied' });
});

export const removeCartCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = null;
  await cart.save();
  const data = await summarize(cart);
  sendResponse(res, { data, message: 'Coupon removed' });
});
