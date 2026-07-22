import nodemailer from 'nodemailer';
import { env, isDev } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    logger.warn('⚠️  SMTP not configured — emails will be logged, not sent.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
};

const ACCENT = '#D4AF37';
const DARK = '#0F172A';

/** Minimal branded HTML wrapper for transactional emails. */
const wrap = (heading, body, cta) => `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#F8FAFC;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:${DARK};padding:28px 32px">
      <h1 style="color:${ACCENT};margin:0;font-size:20px;letter-spacing:1px">PREMIUM PRODUCTS ZONE</h1>
    </div>
    <div style="padding:32px">
      <h2 style="color:${DARK};margin:0 0 16px">${heading}</h2>
      <div style="color:#334155;font-size:15px;line-height:1.6">${body}</div>
      ${
        cta
          ? `<a href="${cta.url}" style="display:inline-block;margin-top:24px;background:${ACCENT};color:${DARK};text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600">${cta.label}</a>`
          : ''
      }
    </div>
    <div style="padding:20px 32px;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0">
      © ${new Date().getFullYear()} Premium Products Zone. All rights reserved.
    </div>
  </div>`;

export const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    if (isDev) logger.info(`📧 [DEV EMAIL] to=${to} subject="${subject}"`);
    return;
  }
  await t.sendMail({ from: env.MAIL_FROM, to, subject, html });
  logger.info(`📧 Email sent to ${to}: ${subject}`);
};

// ── Templated senders ────────────────────────────────────
export const sendVerificationEmail = (to, name, url) =>
  sendEmail({
    to,
    subject: 'Verify your email',
    html: wrap(
      `Welcome, ${name}!`,
      'Please confirm your email address to activate your account. This link expires in 24 hours.',
      { url, label: 'Verify Email' }
    ),
  });

export const sendPasswordResetEmail = (to, name, url) =>
  sendEmail({
    to,
    subject: 'Reset your password',
    html: wrap(
      `Hi ${name},`,
      'We received a request to reset your password. This link expires in 30 minutes. If you did not request this, you can safely ignore this email.',
      { url, label: 'Reset Password' }
    ),
  });

export const sendOrderConfirmationEmail = (to, name, order) =>
  sendEmail({
    to,
    subject: `Order ${order.orderNumber} confirmed`,
    html: wrap(
      `Thank you, ${name}!`,
      `Your order <strong>${order.orderNumber}</strong> has been placed successfully.<br/>
       Total: <strong>${order.currency} ${order.grandTotal}</strong><br/>
       We'll notify you when it ships.`,
      { url: `${env.CLIENT_URL}/orders/${order.orderNumber}`, label: 'Track Order' }
    ),
  });
