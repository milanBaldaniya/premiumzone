import Brand from '../models/brand.model.js';
import { createFactory } from './factory.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { replaceAsset, deleteAsset } from '../services/cloudinary.service.js';

const factory = createFactory(Brand, { searchFields: ['name'] });

export const listBrands = factory.list;
export const createBrand = factory.create;
export const updateBrand = factory.update;

export const getBrandBySlug = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });
  if (!brand) throw ApiError.notFound('Brand not found');
  sendResponse(res, { data: brand, message: 'Brand detail' });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) throw ApiError.notFound('Brand not found');
  await Promise.all([deleteAsset(brand.logo?.publicId), deleteAsset(brand.banner?.publicId)]);
  sendResponse(res, { data: { id: brand._id }, message: 'Brand deleted' });
});

export const uploadBrandLogo = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) throw ApiError.notFound('Brand not found');
  if (!req.file) throw ApiError.badRequest('No image provided');
  brand.logo = await replaceAsset(req.file.buffer, brand.logo?.publicId, 'brands');
  await brand.save();
  sendResponse(res, { data: brand, message: 'Brand logo updated' });
});
