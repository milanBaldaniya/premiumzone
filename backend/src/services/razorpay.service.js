import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/** Creates a Razorpay order. Amount is in rupees; Razorpay expects paise. */
export const createRazorpayOrder = ({ amount, receipt, notes }) =>
  razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: 'INR',
    receipt,
    notes,
    // UPI (and everything else Razorpay supports) is offered automatically for INR orders —
    // no per-method flag needed here. Method restriction, if any, happens on the Checkout.js side.
  });

/** Verifies the checkout-flow signature Razorpay hands back to the browser after payment. */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
};

/** Verifies the `X-Razorpay-Signature` header on incoming webhook events. */
export const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
};
