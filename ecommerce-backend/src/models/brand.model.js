import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema, model } = mongoose;

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, trim: true },
    logo: { url: String, publicId: String },
    banner: { url: String, publicId: String },
    website: String,
    country: String,
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
  },
  { timestamps: true }
);

brandSchema.pre('validate', function setSlug(next) {
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default model('Brand', brandSchema);
