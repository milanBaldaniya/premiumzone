import Coupon from '../models/coupon.model.js';
import { createFactory } from './factory.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { applyCoupon } from '../services/pricing.service.js';

const factory = createFactory(Coupon, { searchFields: ['code', 'description'] });

export const listCoupons = factory.list;
export const createCoupon = factory.create;
export const updateCoupon = factory.update;
export const deleteCoupon = factory.remove;
export const getCoupon = factory.getOne;

/** Public validation used by cart/checkout before applying. */
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const { coupon, discount } = await applyCoupon(code, Number(subtotal) || 0, req.user._id);
  sendResponse(res, {
    data: { code: coupon.code, type: coupon.type, value: coupon.value, discount },
    message: 'Coupon is valid',
  });
});
