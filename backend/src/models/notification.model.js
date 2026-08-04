import mongoose from 'mongoose';
import { NOTIFICATION_TYPE } from '../constants/index.js';

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    // null recipient = broadcast (visible to all / admins)
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPE), default: NOTIFICATION_TYPE.SYSTEM },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String, // deep link e.g. /orders/PPZ-123
    meta: Schema.Types.Mixed,
    isRead: { type: Boolean, default: false, index: true },
    audience: { type: String, enum: ['user', 'admin', 'all'], default: 'user' },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });

export default model('Notification', notificationSchema);
