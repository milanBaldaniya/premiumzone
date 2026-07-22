import Blog from '../models/blog.model.js';
import { createFactory } from './factory.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, buildMeta } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

const factory = createFactory(Blog, { searchFields: ['title', 'tags'] });

export const adminListBlogs = factory.list;
export const updateBlog = factory.update;
export const deleteBlog = factory.remove;

export const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({ ...req.body, author: req.user._id });
  sendResponse(res, { statusCode: 201, data: blog, message: 'Blog created' });
});

/** Public — published posts only. */
export const listPublishedBlogs = asyncHandler(async (req, res) => {
  const qb = new QueryBuilder(Blog.find({ status: 'published' }), req.query)
    .search(['title', 'tags'])
    .sort()
    .paginate();
  qb.query = qb.query.populate({ path: 'author', select: 'name avatar' });
  const [data, total] = await Promise.all([qb.exec(), Blog.countDocuments({ status: 'published' })]);
  sendResponse(res, { message: 'Blogs', data, meta: buildMeta({ ...qb.pagination, total }) });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { viewsCount: 1 } },
    { new: true }
  ).populate({ path: 'author', select: 'name avatar' });
  if (!blog) throw ApiError.notFound('Blog not found');
  sendResponse(res, { data: blog, message: 'Blog detail' });
});
