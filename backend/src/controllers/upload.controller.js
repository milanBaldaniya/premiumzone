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

// Kept exactly as before (defaults to resource_type 'image') — existing callers never send
// a resourceType, so this stays backward compatible.
export const removeImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw ApiError.badRequest('publicId is required');
  await deleteAsset(publicId);
  sendResponse(res, { message: 'Image deleted' });
});

/** Generic single-video upload for the admin media library (product demo clips, etc). */
export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No video provided');
  const folder = req.query.folder || 'media/videos';
  const result = await uploadBuffer(req.file.buffer, { folder, resourceType: 'video' });
  sendResponse(res, { statusCode: 201, data: result, message: 'Video uploaded' });
});

/** Deletes any asset by publicId + resourceType — video assets need resourceType: 'video'. */
export const removeAsset = asyncHandler(async (req, res) => {
  const { publicId, resourceType = 'image' } = req.body;
  if (!publicId) throw ApiError.badRequest('publicId is required');
  await deleteAsset(publicId, resourceType);
  sendResponse(res, { message: 'Asset deleted' });
});
