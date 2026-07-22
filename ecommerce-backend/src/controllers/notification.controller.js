import Notification from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, buildMeta } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const filter = { $or: [{ user: req.user._id }, { audience: 'all' }] };
  const qb = new QueryBuilder(Notification.find(filter), req.query).sort().paginate();
  const [data, total, unread] = await Promise.all([
    qb.exec(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, isRead: false }),
  ]);
  sendResponse(res, { message: 'Notifications', data, meta: { ...buildMeta({ ...qb.pagination, total }), unread } });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notif) throw ApiError.notFound('Notification not found');
  sendResponse(res, { data: notif, message: 'Marked as read' });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  sendResponse(res, { message: 'All notifications marked as read' });
});

// Admin: broadcast
export const broadcast = asyncHandler(async (req, res) => {
  const notif = await Notification.create({ ...req.body, audience: req.body.audience || 'all' });
  sendResponse(res, { statusCode: 201, data: notif, message: 'Notification broadcast' });
});
