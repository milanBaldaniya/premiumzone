import mongoose from 'mongoose';
import { COUPON_TYPE } from '../constants/index.js';

const { Schema, model } = mongoose;

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: String,
    type: { type: String, enum: Object.values(COUPON_TYPE), required: true },
    value: { type: Number, required: true, min: 0 }, // percent or fixed amount
    maxDiscount: { type: Number, default: null }, // cap for percentage coupons
    minOrderAmount: { type: Number, default: 0 },

    usageLimit: { type: Number, default: null }, // total redemptions allowed
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, count: Number }],

    appliesTo: {
      categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      brands: [{ type: Schema.Types.ObjectId, ref: 'Brand' }],
      products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    },

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

couponSchema.virtual('isValid').get(function isValid() {
  const now = Date.now();
  return (
    this.isActive &&
    this.startsAt <= now &&
    this.expiresAt >= now &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

export default model('Coupon', couponSchema);
