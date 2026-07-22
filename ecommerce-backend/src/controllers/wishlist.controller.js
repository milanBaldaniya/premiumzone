import Wishlist from '../models/wishlist.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';

const POPULATE = {
  path: 'products',
  select: 'name slug price discountPrice thumbnail ratingsAverage brand',
  populate: { path: 'brand', select: 'name slug' },
};

const getOrCreate = async (userId) => {
  let wl = await Wishlist.findOne({ user: userId });
  if (!wl) wl = await Wishlist.create({ user: userId, products: [] });
  return wl;
};

export const getWishlist = asyncHandler(async (req, res) => {
  const wl = await getOrCreate(req.user._id);
  await wl.populate(POPULATE);
  sendResponse(res, { data: wl, message: 'Wishlist' });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wl = await getOrCreate(req.user._id);
  const idx = wl.products.findIndex((p) => p.toString() === productId);
  let added;
  if (idx >= 0) {
    wl.products.splice(idx, 1);
    added = false;
  } else {
    wl.products.unshift(productId);
    added = true;
  }
  await wl.save();
  sendResponse(res, { data: { added, count: wl.products.length }, message: added ? 'Added to wishlist' : 'Removed from wishlist' });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wl = await getOrCreate(req.user._id);
  wl.products = wl.products.filter((p) => p.toString() !== req.params.productId);
  await wl.save();
  sendResponse(res, { data: { count: wl.products.length }, message: 'Removed from wishlist' });
});
