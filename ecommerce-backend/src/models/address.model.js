import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const addressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Home' }, // Home, Work, etc.
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    type: { type: String, enum: ['shipping', 'billing', 'both'], default: 'both' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure only one default address per user
addressSchema.pre('save', async function ensureSingleDefault(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default model('Address', addressSchema);
