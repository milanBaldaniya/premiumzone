import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Centralized, validated environment configuration.
 * Fails fast at boot if a required variable is missing/invalid.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  API_PREFIX: z.string().default('/api/v1'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  ADMIN_URL: z.string().url().default('http://localhost:5173'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().or(z.literal('')),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  JWT_EMAIL_SECRET: z.string().min(1),
  JWT_RESET_SECRET: z.string().min(1),
  COOKIE_SECRET: z.string().min(1),

  // Google Sign-In (via Firebase Auth) — the Firebase Admin SDK service account
  // used to verify Firebase ID tokens the client sends. FIREBASE_SERVICE_ACCOUNT_JSON
  // (the whole key file's contents, e.g. for Render/other hosts with no file
  // upload) takes priority when set; FIREBASE_SERVICE_ACCOUNT_PATH (a local
  // file path, for local dev) is the fallback.
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),

  // Seed credentials (used by `npm run seed`)
  SUPER_ADMIN_NAME: z.string().default('Super Admin'),
  SUPER_ADMIN_EMAIL: z.string().email().default('superadmin@luxe.com'),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default('Super@1234'),
  ADMIN_NAME: z.string().default('Store Admin'),
  ADMIN_EMAIL: z.string().email().default('admin@luxe.com'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin@1234'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('ecommerce'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Premium Zone <no-reply@premiumzone.com>'),

  REDIS_URL: z.string().optional().or(z.literal('')),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
