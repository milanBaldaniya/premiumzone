import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../constants/index.js';
import { hashToken } from '../utils/token.js';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // never returned by default
    },
    phone: { type: String, trim: true },
    avatar: {
      url: String,
      publicId: String,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      index: true,
    },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, index: true, sparse: true },

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Hashed one-time tokens
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    passwordChangedAt: { type: Date, select: false },
    lastLoginAt: Date,

    // Denormalized references for quick profile access
    defaultAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ createdAt: -1 });

// ── Hooks ────────────────────────────────────────────────
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// ── Methods ──────────────────────────────────────────────
userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtIat) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIat;
};

userSchema.methods.setEmailVerifyToken = function setEmailVerifyToken(rawToken) {
  this.emailVerifyToken = hashToken(rawToken);
  this.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
};

userSchema.methods.setResetPasswordToken = function setResetPasswordToken(rawToken) {
  this.resetPasswordToken = hashToken(rawToken);
  this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
};

// Strip sensitive fields from all JSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.emailVerifyToken;
    delete ret.emailVerifyExpires;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  },
});

export default model('User', userSchema);
