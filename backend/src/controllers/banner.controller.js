import Banner from '../models/banner.model.js';
import { createFactory } from './factory.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadBuffer, deleteAsset } from '../services/cloudinary.service.js';

const factory = createFactory(Banner, { searchFields: ['title'] });

export const listBanners = factory.list;
export const createBanner = factory.create;

/** Update a banner; if the image/mobileImage is replaced, delete the old Cloudinary asset. */
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) throw ApiError.notFound('Banner not found');

  const prevImagePublicId = banner.image?.publicId;
  const prevMobilePublicId = banner.mobileImage?.publicId;

  banner.set(req.body);
  await banner.save();

  const stalePublicIds = [
    req.body.image && prevImagePublicId !== banner.image?.publicId ? prevImagePublicId : null,
    req.body.mobileImage && prevMobilePublicId !== banner.mobileImage?.publicId ? prevMobilePublicId : null,
  ].filter(Boolean);
  if (stalePublicIds.length) await Promise.all(stalePublicIds.map(deleteAsset));

  sendResponse(res, { data: banner, message: 'Banner updated' });
});

/** Public — active banners for a given placement (default: hero). */
export const getActiveBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const placement = req.query.placement || 'hero';
  const banners = await Banner.find({
    placement,
    isActive: true,
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  }).sort('sortOrder');
  sendResponse(res, { data: banners, message: 'Active banners' });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) throw ApiError.notFound('Banner not found');
  await Promise.all([deleteAsset(banner.image?.publicId), deleteAsset(banner.mobileImage?.publicId)]);
  sendResponse(res, { data: { id: banner._id }, message: 'Banner deleted' });
});

export const uploadBannerImage = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image provided');
  const image = await uploadBuffer(req.file.buffer, { folder: 'banners' });
  sendResponse(res, { statusCode: 201, data: image, message: 'Banner image uploaded' });
});
