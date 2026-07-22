import Product from '../models/product.model.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse, buildMeta } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';
import { uploadMany, deleteMany, deleteAsset } from '../services/cloudinary.service.js';

const POPULATE = [
  { path: 'brand', select: 'name slug logo' },
  { path: 'category', select: 'name slug' },
  { path: 'subcategory', select: 'name slug' },
];

/** Public listing — only active products, full filter/search/sort/paginate. */
export const listProducts = asyncHandler(async (req, res) => {
  const baseQuery = { status: PRODUCT_STATUS.ACTIVE };
  const qb = new QueryBuilder(Product.find(baseQuery), req.query)
    .search(['name', 'tags', 'sku'])
    .filter()
    .sort()
    .limitFields()
    .paginate();
  qb.query = qb.query.populate(POPULATE);

  const [data, total] = await Promise.all([qb.exec(), qb.count()]);
  sendResponse(res, { message: 'Products', data, meta: buildMeta({ ...qb.pagination, total }) });
});

/** Admin listing — all statuses. */
export const adminListProducts = asyncHandler(async (req, res) => {
  const qb = new QueryBuilder(Product.find(), req.query)
    .search(['name', 'sku', 'tags'])
    .filter()
    .sort()
    .limitFields()
    .paginate();
  qb.query = qb.query.populate(POPULATE);
  const [data, total] = await Promise.all([qb.exec(), qb.count()]);
  sendResponse(res, { message: 'Products', data, meta: buildMeta({ ...qb.pagination, total }) });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { viewsCount: 1 } },
    { new: true }
  ).populate(POPULATE);
  if (!product) throw ApiError.notFound('Product not found');
  sendResponse(res, { data: product, message: 'Product detail' });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(POPULATE);
  if (!product) throw ApiError.notFound('Product not found');
  sendResponse(res, { data: product, message: 'Product detail' });
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('category brand');
  if (!product) throw ApiError.notFound('Product not found');
  const related = await Product.find({
    _id: { $ne: product._id },
    status: PRODUCT_STATUS.ACTIVE,
    $or: [{ category: product.category }, { brand: product.brand }],
  })
    .limit(8)
    .populate(POPULATE);
  sendResponse(res, { data: related, message: 'Related products' });
});

/** Curated home-page sections in a single round-trip. */
export const getStorefrontSections = asyncHandler(async (_req, res) => {
  const base = { status: PRODUCT_STATUS.ACTIVE };
  const [featured, trending, newArrivals, bestSellers] = await Promise.all([
    Product.find({ ...base, isFeatured: true }).limit(8).populate(POPULATE),
    Product.find({ ...base, isTrending: true }).limit(8).populate(POPULATE),
    Product.find({ ...base, isNewArrival: true }).sort('-createdAt').limit(8).populate(POPULATE),
    Product.find({ ...base, isBestSeller: true }).sort('-soldCount').limit(8).populate(POPULATE),
  ]);
  sendResponse(res, {
    data: { featured, trending, newArrivals, bestSellers },
    message: 'Storefront sections',
  });
});

// ── Admin write operations ───────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  sendResponse(res, { statusCode: 201, data: product, message: 'Product created' });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate(POPULATE);
  if (!product) throw ApiError.notFound('Product not found');
  sendResponse(res, { data: product, message: 'Product updated' });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  const publicIds = [product.thumbnail?.publicId, ...(product.gallery || []).map((g) => g.publicId)];
  await deleteMany(publicIds).catch(() => {});
  sendResponse(res, { data: { id: product._id }, message: 'Product deleted' });
});

export const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids = [] } = req.body;
  const result = await Product.deleteMany({ _id: { $in: ids } });
  sendResponse(res, { data: { deleted: result.deletedCount }, message: 'Products deleted' });
});

/** Uploads gallery images to a product (thumbnail = first image if unset). */
export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  if (!req.files?.length) throw ApiError.badRequest('No images provided');

  const uploaded = await uploadMany(req.files, `products/${product._id}`);
  product.gallery.push(...uploaded);
  if (!product.thumbnail?.url) product.thumbnail = uploaded[0];
  await product.save();
  sendResponse(res, { data: product, message: 'Images uploaded' });
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  product.gallery = product.gallery.filter((img) => img.publicId !== publicId);
  if (product.thumbnail?.publicId === publicId) product.thumbnail = product.gallery[0] || undefined;
  await Promise.all([product.save(), deleteAsset(publicId)]);
  sendResponse(res, { data: product, message: 'Image removed' });
});
