import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import { env, isProd } from './config/env.js';
import { morganStream } from './config/logger.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import routes from './routes/index.js';

const app = express();

// Trust proxy (needed for secure cookies & rate-limit behind Nginx/Render/Heroku)
app.set('trust proxy', 1);

// ── Security ─────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Normalize (strip trailing slash) so "http://localhost:5173/" matches "http://localhost:5173"
const normalizeOrigin = (u) => (u || '').replace(/\/+$/, '');
const allowedOrigins = [
  normalizeOrigin(env.CLIENT_URL),
  normalizeOrigin(env.ADMIN_URL),
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (curl, mobile apps, server-to-server) with no Origin header
    if (!origin) return callback(null, true);
    const o = normalizeOrigin(origin);
    if (allowedOrigins.includes(o)) return callback(null, true);
    // In development, accept any localhost/127.0.0.1 port (e.g. Vite falling back to 5174)
    if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly answer preflight for every route (login POST triggers a preflight)
app.options('*', cors(corsOptions));

// ── Body parsing ─────────────────────────────────────────
// Stash the raw bytes alongside the parsed body — the Razorpay webhook needs the exact
// raw payload (not a re-serialized copy) to verify its HMAC signature.
app.use(express.json({ limit: '10mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// ── Sanitization & hardening ─────────────────────────────
app.use(mongoSanitize());
app.use(hpp({ whitelist: ['price', 'rating', 'sort', 'fields', 'tags', 'brand', 'category'] }));
app.use(compression());

// ── Logging ──────────────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev', { stream: morganStream }));

// ── Rate limiting ────────────────────────────────────────
app.use(env.API_PREFIX, globalLimiter);

// ── Health check ─────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'API is healthy', uptime: process.uptime() })
);

// ── API routes ───────────────────────────────────────────
app.use(env.API_PREFIX, routes);

// ── 404 + error handling ─────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
