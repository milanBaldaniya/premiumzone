import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/env.js';

/** Normalizes any thrown value into an ApiError. */
const normalize = (err) => {
  if (err instanceof ApiError) return err;

  // Mongoose bad ObjectId
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }
  // Mongoose validation
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return new ApiError(422, 'Validation failed', { errors });
  }
  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`${field} '${err.keyValue?.[field]}' already exists`);
  }
  // JWT
  if (err.name === 'JsonWebTokenError') return ApiError.unauthorized('Invalid token');
  if (err.name === 'TokenExpiredError') return ApiError.unauthorized('Token expired');

  return new ApiError(err.statusCode || 500, err.message || 'Internal server error', {
    isOperational: false,
    stack: err.stack,
  });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const error = normalize(err);

  if (!error.isOperational || error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${error.message}\n${error.stack || ''}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    stack: isProd ? undefined : error.stack,
  });
};

export const notFound = (req, res, next) =>
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
