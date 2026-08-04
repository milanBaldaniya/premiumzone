import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const message = { success: false, message: 'Too many requests, please try again later.' };

/** Global limiter applied to the whole API. */
export const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

/** Stricter limiter for auth endpoints (login, register, forgot-password). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many attempts, please try again in 15 minutes.' },
});
