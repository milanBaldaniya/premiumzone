import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../constants/index.js';

const { Schema, model } = mongoose;

// Line item snapshots product details so historical orders stay accurate
// even if the product later changes or is deleted.
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    variantId: { type: Schema.Types.ObjectId, default: null },
    name: { type: String, required: true },
    sku: String,
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const addressSnapshotSchema = new Schema(
  {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS) },
    note: String,
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true },

    shippingAddress: { type: addressSnapshotSchema, required: true },
    billingAddress: addressSnapshotSchema,

    // Money breakdown
    itemsTotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    coupon: {
      code: String,
      discount: Number,
    },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.COD,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    paymentResult: {
      // Populated for online gateway payments (Razorpay, etc.)
      transactionId: String,
      provider: String,
      paidAt: Date,
      raw: Schema.Types.Mixed,
    },
    // Razorpay order id — doubles as the idempotency key so a verify-call and a
    // webhook racing each other can't create two orders for the same payment.
    razorpayOrderId: { type: String, unique: true, sparse: true, index: true },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    statusHistory: [statusHistorySchema],

    trackingNumber: String,
    courier: String,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
    notes: String,
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

// Human-friendly sequential-ish order number
orderSchema.pre('save', function setOrderNumber(next) {
  if (!this.orderNumber) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const ts = Date.now().toString().slice(-8);
    this.orderNumber = `PPZ-${ts}-${rand}`;
  }
  if (this.isNew) {
    this.statusHistory.push({ status: this.status, note: 'Order placed' });
  }
  next();
});

export default model('Order', orderSchema);
