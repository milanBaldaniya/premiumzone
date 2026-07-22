/**
 * Operational error class carrying an HTTP status code.
 * Anything thrown as ApiError is treated as a known, safe-to-expose error.
 */
export class ApiError extends Error {
  constructor(statusCode, message, { errors = [], isOperational = true, stack = '' } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg = 'Bad request', errors = []) {
    return new ApiError(400, msg, { errors });
  }
  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }
  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg);
  }
  static tooMany(msg = 'Too many requests') {
    return new ApiError(429, msg);
  }
  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg, { isOperational: false });
  }
}
