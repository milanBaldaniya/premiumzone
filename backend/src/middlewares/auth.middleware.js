import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import { TOKEN_TYPE } from '../constants/index.js';
import User from '../models/user.model.js';

/** Extracts a bearer token from the Authorization header. */
const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

/** Requires a valid access token; attaches req.user. */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  const decoded = verifyToken(token, TOKEN_TYPE.ACCESS);
  const user = await User.findById(decoded.sub).select('+passwordChangedAt');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');
  if (user.changedPasswordAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password recently changed — please log in again');
  }

  req.user = user;
  next();
});

/** Optional auth — populates req.user if a valid token is present, else continues. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token, TOKEN_TYPE.ACCESS);
    const user = await User.findById(decoded.sub);
    if (user?.isActive) req.user = user;
  } catch {
    /* ignore invalid token in optional mode */
  }
  next();
});

/** Role gate. Usage: authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN) */
export const authorize = (...roles) =>
  asyncHandler(async (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }
    next();
  });
