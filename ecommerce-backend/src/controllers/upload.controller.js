import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadBuffer, uploadMany, deleteAsset } from '../services/cloudinary.service.js';

/** Generic single-image upload for the admin media library. */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image provided');
  const folder = req.query.folder || 'media';
  const result = await uploadBuffer(req.file.buffer, { folder });
  sendResponse(res, { statusCode: 201, data: result, message: 'Image uploaded' });
});

export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw ApiError.badRequest('No images provided');
  const folder = req.query.folder || 'media';
  const results = await uploadMany(req.files, folder);
  sendResponse(res, { statusCode: 201, data: results, message: 'Images uploaded' });
});

export const removeImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw ApiError.badRequest('publicId is required');
  await deleteAsset(publicId);
  sendResponse(res, { message: 'Image deleted' });
});
