import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';
import { ORDER_STATUS, PAYMENT_STATUS, ROLES } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';

const PAID_MATCH = { paymentStatus: PAYMENT_STATUS.PAID };
const REVENUE_STATUSES = { status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED] } };

/** Top-level KPI cards for the dashboard. */
export const getDashboardStats = asyncHandler(async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    revenueAgg,
    monthRevenueAgg,
    totalOrders,
    pendingOrders,
    totalCustomers,
    totalProducts,
    lowStock,
  ] = await Promise.all([
    Order.aggregate([{ $match: REVENUE_STATUSES }, { $group: { _id: null, total: { $sum: '$grandTotal' } } }]),
    Order.aggregate([
      { $match: { ...REVENUE_STATUSES, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ status: ORDER_STATUS.PENDING }),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    Product.countDocuments(),
    Product.countDocuments({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
  ]);

  sendResponse(res, {
    message: 'Dashboard stats',
    data: {
      totalRevenue: revenueAgg[0]?.total || 0,
      monthRevenue: monthRevenueAgg[0]?.total || 0,
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts: lowStock,
    },
  });
});

/** Revenue + order count grouped by day/month for charts. */
export const getSalesChart = asyncHandler(async (req, res) => {
  const range = req.query.range === 'yearly' ? 'yearly' : 'monthly';
  const now = new Date();
  const from = new Date();
  let dateFormat;
  if (range === 'yearly') {
    from.setFullYear(now.getFullYear() - 1);
    dateFormat = '%Y-%m';
  } else {
    from.setDate(now.getDate() - 30);
    dateFormat = '%Y-%m-%d';
  }

  const data = await Order.aggregate([
    { $match: { ...REVENUE_STATUSES, createdAt: { $gte: from } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        revenue: { $sum: '$grandTotal' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } },
  ]);
  sendResponse(res, { data, message: 'Sales chart' });
});

/** Best-selling products by units sold. */
export const getTopProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);
  const data = await Order.aggregate([
    { $match: REVENUE_STATUSES },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        unitsSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: limit },
  ]);
  sendResponse(res, { data, message: 'Top products' });
});

/** Order distribution by status (for a pie/donut). */
export const getOrderStatusBreakdown = asyncHandler(async (_req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
  ]);
  sendResponse(res, { data, message: 'Order status breakdown' });
});

/** Revenue split by category and by brand. */
export const getCategoryBrandRevenue = asyncHandler(async (_req, res) => {
  const pipeline = (localField, from) => [
    { $match: REVENUE_STATUSES },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    { $group: { _id: `$product.${localField}`, revenue: { $sum: '$items.subtotal' } } },
    { $lookup: { from, localField: '_id', foreignField: '_id', as: 'ref' } },
    { $unwind: '$ref' },
    { $project: { _id: 0, name: '$ref.name', revenue: 1 } },
    { $sort: { revenue: -1 } },
    { $limit: 8 },
  ];
  const [byCategory, byBrand] = await Promise.all([
    Order.aggregate(pipeline('category', 'categories')),
    Order.aggregate(pipeline('brand', 'brands')),
  ]);
  sendResponse(res, { data: { byCategory, byBrand }, message: 'Category & brand revenue' });
});

/** New-customer growth over the last 30 days + overall counts. */
export const getCustomerStats = asyncHandler(async (_req, res) => {
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const [growth, verified, total, pendingReviews] = await Promise.all([
    User.aggregate([
      { $match: { role: ROLES.CUSTOMER, createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ]),
    User.countDocuments({ role: ROLES.CUSTOMER, isEmailVerified: true }),
    User.countDocuments({ role: ROLES.CUSTOMER }),
    Review.countDocuments({ isApproved: false }),
  ]);
  sendResponse(res, { data: { growth, verified, total, pendingReviews }, message: 'Customer stats' });
});

export { PAID_MATCH };
