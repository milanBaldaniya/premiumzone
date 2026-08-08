import mongoose from 'mongoose';
import slugify from 'slugify';
import { PRODUCT_STATUS, GENDER } from '../constants/index.js';

const { Schema, model } = mongoose;

const imageSchema = new Schema(
  { url: { type: String, required: true }, publicId: String, alt: String },
  { _id: false }
);

const specSchema = new Schema(
  { key: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const variantSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "42mm / Titanium"
    sku: { type: String, required: true },
    attributes: { type: Map, of: String }, // { color: 'Black', size: '42mm' }
    price: Number, // overrides base price when set
    discountPrice: Number,
    stock: { type: Number, default: 0, min: 0 },
    image: imageSchema,
  },
  { _id: true }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, unique: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },

    shortDescription: { type: String, maxlength: 300 },
    description: { type: String, required: true },

    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'INR' },

    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category', index: true },

    gender: {
      type: String,
      enum: Object.values(GENDER),
      default: GENDER.UNISEX,
      index: true,
    },

    thumbnail: imageSchema,
    gallery: [imageSchema],

    specifications: [specSchema],
    variants: [variantSchema],

    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    weight: Number, // grams
    warranty: String, // e.g. "2 Years International"
    tags: [{ type: String, lowercase: true, trim: true }],

    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },

    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
      index: true,
    },

    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Text + compound indexes for search & filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text', sku: 'text' });
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ category: 1, brand: 1, status: 1 });
productSchema.index({ createdAt: -1 });

// ── Virtuals ─────────────────────────────────────────────
productSchema.virtual('finalPrice').get(function finalPrice() {
  return this.discountPrice && this.discountPrice > 0 ? this.discountPrice : this.price;
});

productSchema.virtual('discountPercent').get(function discountPercent() {
  if (!this.discountPrice || this.discountPrice <= 0) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0;
});

productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
});

// ── Hooks ────────────────────────────────────────────────
productSchema.pre('validate', function setSlug(next) {
  if (this.isModified('name')) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  next();
});

export default model('Product', productSchema);
