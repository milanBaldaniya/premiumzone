import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, buildMeta } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';
import { replaceAsset } from '../services/cloudinary.service.js';

// ── Profile (self) ───────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = (({ name, phone }) => ({ name, phone }))(req.body);
  const user = await User.findByIdAndUpdate(req.user._id, allowed, {
    new: true,
    runValidators: true,
  });
  sendResponse(res, { data: user, message: 'Profile updated' });
});

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image provided');
  const avatar = await replaceAsset(req.file.buffer, req.user.avatar?.publicId, 'avatars');
  const user = await User.findByIdAndUpdate(req.user._id, { avatar }, { new: true });
  sendResponse(res, { data: user, message: 'Avatar updated' });
});

// ── Admin: customer management ───────────────────────────
export const listCustomers = asyncHandler(async (req, res) => {
  const qb = new QueryBuilder(User.find(), req.query)
    .search(['name', 'email', 'phone'])
    .filter()
    .sort()
    .paginate();
  const [data, total] = await Promise.all([qb.exec(), qb.count()]);
  sendResponse(res, { message: 'Customers', data, meta: buildMeta({ ...qb.pagination, total }) });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('defaultAddress');
  if (!user) throw ApiError.notFound('Customer not found');
  const [orderCount, orders] = await Promise.all([
    Order.countDocuments({ user: user._id }),
    Order.find({ user: user._id }).sort('-createdAt').limit(10),
  ]);
  const totalSpent = await Order.aggregate([
    { $match: { user: user._id, paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$grandTotal' } } },
  ]);
  sendResponse(res, {
    data: { user, stats: { orderCount, totalSpent: totalSpent[0]?.total || 0 }, recentOrders: orders },
    message: 'Customer detail',
  });
});

export const updateCustomerStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );
  if (!user) throw ApiError.notFound('Customer not found');
  sendResponse(res, { data: user, message: 'Customer status updated' });
});

/** Super-admin only: change a user's role. */
export const updateCustomerRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound('Customer not found');
  sendResponse(res, { data: user, message: 'Role updated' });
});
