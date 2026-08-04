import Address from '../models/address.model.js';
import User from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort('-isDefault -createdAt');
  sendResponse(res, { data: addresses, message: 'Addresses' });
});

export const createAddress = asyncHandler(async (req, res) => {
  const count = await Address.countDocuments({ user: req.user._id });
  const address = await Address.create({
    ...req.body,
    user: req.user._id,
    isDefault: req.body.isDefault ?? count === 0, // first address is default
  });
  if (address.isDefault) {
    await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
  }
  sendResponse(res, { statusCode: 201, data: address, message: 'Address added' });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');
  Object.assign(address, req.body);
  await address.save();
  if (address.isDefault) {
    await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
  }
  sendResponse(res, { data: address, message: 'Address updated' });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');
  sendResponse(res, { data: { id: address._id }, message: 'Address deleted' });
});
