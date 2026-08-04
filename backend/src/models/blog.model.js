import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema, model } = mongoose;

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, maxlength: 320 },
    content: { type: String, required: true },
    coverImage: { url: String, publicId: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: String, default: 'General' },
    tags: [{ type: String, lowercase: true }],
    readTime: Number, // minutes
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: Date,
    viewsCount: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

blogSchema.pre('validate', function setSlug(next) {
  if (this.isModified('title')) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

blogSchema.pre('save', function setPublishedAt(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default model('Blog', blogSchema);
