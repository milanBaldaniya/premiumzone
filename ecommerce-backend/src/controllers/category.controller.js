import Category from '../models/category.model.js';
import { createFactory } from './factory.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { replaceAsset, deleteAsset } from '../services/cloudinary.service.js';

const factory = createFactory(Category, { searchFields: ['name'], populate: 'parent' });

export const listCategories = factory.list;
export const createCategory = factory.create;
export const updateCategory = factory.update;

/** Public tree — top-level categories with their subcategories. */
export const getCategoryTree = asyncHandler(async (_req, res) => {
  const tree = await Category.find({ parent: null, isActive: true })
    .sort('sortOrder')
    .populate({ path: 'subcategories', match: { isActive: true } });
  sendResponse(res, { data: tree, message: 'Category tree' });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate('subcategories');
  if (!category) throw ApiError.notFound('Category not found');
  sendResponse(res, { data: category, message: 'Category detail' });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  const hasChildren = await Category.exists({ parent: category._id });
  if (hasChildren) throw ApiError.conflict('Delete or reassign subcategories first');
  await Promise.all([category.deleteOne(), deleteAsset(category.image?.publicId)]);
  sendResponse(res, { data: { id: category._id }, message: 'Category deleted' });
});

export const uploadCategoryImage = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  if (!req.file) throw ApiError.badRequest('No image provided');
  category.image = await replaceAsset(req.file.buffer, category.image?.publicId, 'categories');
  await category.save();
  sendResponse(res, { data: category, message: 'Category image updated' });
});
