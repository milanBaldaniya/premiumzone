import Order from '../models/order.model.js';
import Cart from '../models/cart.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, buildMeta } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';
import { buildLineItems, applyCoupon, computeTotals } from '../services/pricing.service.js';
import * as orderService from '../services/order.service.js';

/** Preview totals for the checkout screen without placing the order. */
export const checkoutPreview = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart?.items.length) throw ApiError.badRequest('Your cart is empty');
  const { lineItems, itemsTotal } = await buildLineItems(cart.items);

  let discount = 0;
  let couponCode;
  if (req.body.couponCode) {
    const applied = await applyCoupon(req.body.couponCode, itemsTotal, req.user._id);
    discount = applied.discount;
    couponCode = applied.coupon.code;
  }
  const totals = await computeTotals({ itemsTotal, discount });
  sendResponse(res, { data: { lineItems, summary: { ...totals, coupon: couponCode } }, message: 'Checkout preview' });
});

export const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user, req.body);
  sendResponse(res, { statusCode: 201, data: order, message: 'Order placed successfully' });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const qb = new QueryBuilder(Order.find({ user: req.user._id }), req.query)
    .filter()
    .sort()
    .paginate();
  const [data, total] = await Promise.all([qb.exec(), qb.count()]);
  sendResponse(res, { message: 'My orders', data, meta: buildMeta({ ...qb.pagination, total }) });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');
  sendResponse(res, { data: order, message: 'Order detail' });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.user, req.params.id);
  sendResponse(res, { data: order, message: 'Order cancelled' });
});

// ── Admin ────────────────────────────────────────────────
export const adminListOrders = asyncHandler(async (req, res) => {
  const qb = new QueryBuilder(Order.find(), req.query)
    .search(['orderNumber'])
    .filter()
    .sort()
    .paginate();
  qb.query = qb.query.populate({ path: 'user', select: 'name email' });
  const [data, total] = await Promise.all([qb.exec(), qb.count()]);
  sendResponse(res, { message: 'Orders', data, meta: buildMeta({ ...qb.pagination, total }) });
});

export const adminGetOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate({ path: 'user', select: 'name email phone' });
  if (!order) throw ApiError.notFound('Order not found');
  sendResponse(res, { data: order, message: 'Order detail' });
});

export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.user, req.params.id, req.body);
  sendResponse(res, { data: order, message: 'Order status updated' });
});
