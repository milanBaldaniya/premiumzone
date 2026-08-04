import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, default: null },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    // Price snapshot at time of add — recomputed against live product on read
    priceSnapshot: { type: Number, required: true },
  },
  { _id: true }
);

const cartSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [cartItemSchema],
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cartSchema.virtual('itemCount').get(function itemCount() {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

export default model('Cart', cartSchema);
