import Review from '../models/review.model.js';
import Order from '../models/order.model.js';
import { ORDER_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, buildMeta } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

/** Public — best reviews across all products, for homepage testimonials. */
export const getTopReviews = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 20);
  const reviews = await Review.find({ isApproved: true, rating: { $gte: 4 }, comment: { $exists: true, $ne: '' } })
    .sort({ rating: -1, helpfulCount: -1, createdAt: -1 })
    .limit(limit)
    .populate({ path: 'user', select: 'name avatar' })
    .populate({ path: 'product', select: 'name slug thumbnail' });
  sendResponse(res, { data: reviews, message: 'Top reviews' });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const filter = { product: req.params.productId, isApproved: true };
  const qb = new QueryBuilder(Review.find(filter), req.query).sort().paginate();
  qb.query = qb.query.populate({ path: 'user', select: 'name avatar' });
  const [data, total] = await Promise.all([qb.exec(), Review.countDocuments(filter)]);
  sendResponse(res, { message: 'Reviews', data, meta: buildMeta({ ...qb.pagination, total }) });
});

export const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  // Verified purchase check
  const purchased = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: ORDER_STATUS.DELIVERED,
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: purchased?._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: Boolean(purchased),
  });
  sendResponse(res, { statusCode: 201, data: review, message: 'Review submitted' });
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');
  Object.assign(review, req.body);
  await review.save();
  sendResponse(res, { data: review, message: 'Review updated' });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');
  sendResponse(res, { data: { id: review._id }, message: 'Review deleted' });
});

// ── Admin moderation ─────────────────────────────────────
export const adminListReviews = asyncHandler(async (req, res) => {
  const qb = new QueryBuilder(Review.find(), req.query).filter().sort().paginate();
  qb.query = qb.query.populate([
    { path: 'user', select: 'name email' },
    { path: 'product', select: 'name slug' },
  ]);
  const [data, total] = await Promise.all([qb.exec(), qb.count()]);
  sendResponse(res, { message: 'Reviews', data, meta: buildMeta({ ...qb.pagination, total }) });
});

export const adminModerateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: req.body.isApproved },
    { new: true }
  );
  if (!review) throw ApiError.notFound('Review not found');
  await Review.recalcRatings(review.product);
  sendResponse(res, { data: review, message: 'Review moderated' });
});
