import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Single-document store for global storefront settings (a "singleton").
 * Retrieved via Setting.getSettings() which lazily creates defaults.
 */
const settingSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true },
    store: {
      name: { type: String, default: 'Premium Product Zone' },
      tagline: { type: String, default: 'Precision. Prestige. Perfection.' },
      logo: { url: String, publicId: String },
      favicon: { url: String, publicId: String },
      email: String,
      phone: String,
      // Business WhatsApp number for "chat to order" — digits only, with country code (e.g. 919876543210)
      whatsapp: String,
      address: String,
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
    },
    shipping: {
      freeShippingThreshold: { type: Number, default: 500 },
      flatRate: { type: Number, default: 15 },
      taxPercent: { type: Number, default: 0 },
    },
    social: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      linkedin: String,
    },
    features: {
      codEnabled: { type: Boolean, default: true },
      reviewsEnabled: { type: Boolean, default: true },
      wishlistEnabled: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
  },
  { timestamps: true }
);

settingSchema.statics.getSettings = async function getSettings() {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) doc = await this.create({ key: 'global' });
  return doc;
};

export default model('Setting', settingSchema);
