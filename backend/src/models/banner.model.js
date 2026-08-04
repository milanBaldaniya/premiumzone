import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bannerSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    description: String,
    image: { url: { type: String, required: true }, publicId: String },
    mobileImage: { url: String, publicId: String },
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/products' },
    // Placement slot: hero slider, promo strip, category banner, etc.
    placement: {
      type: String,
      enum: ['hero', 'promo', 'category', 'brand', 'sidebar'],
      default: 'hero',
      index: true,
    },
    textColor: { type: String, default: '#F8FAFC' },
    sortOrder: { type: Number, default: 0 },
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model('Banner', bannerSchema);
