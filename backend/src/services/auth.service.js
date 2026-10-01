import User from '../models/user.model.js';
import { env } from '../config/env.js';
import { getFirebaseAuth } from '../config/firebase.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { TOKEN_TYPE } from '../constants/index.js';
import {
  generateAuthTokens,
  generateRandomToken,
  hashToken,
  verifyToken,
} from '../utils/token.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from './email.service.js';

/** Registers a local user and dispatches a verification email. */
export const registerUser = async ({ name, email, password, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, phone });

  const { raw } = generateRandomToken();
  user.setEmailVerifyToken(raw);
  await user.save({ validateBeforeSave: false });

  const url = `${env.CLIENT_URL}/verify-email?token=${raw}`;
  await sendVerificationEmail(user.email, user.name, url).catch(() => {});

  const tokens = generateAuthTokens(user);
  return { user, tokens };
};

/** Authenticates a local user. */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = generateAuthTokens(user);
  return { user, tokens };
};

/**
 * Verifies a Firebase ID token (issued after the client signs the user in to
 * Firebase with their Google credential) via the Firebase Admin SDK, then
 * finds-or-creates the account. Matches by firebaseUid first, falling back to
 * email so a customer who previously signed in another way gets linked, not
 * duplicated.
 */
export const googleLogin = async (idToken) => {
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON && !env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    throw ApiError.internal('Google login is not configured');
  }

  let decoded;
  try {
    decoded = await getFirebaseAuth().verifyIdToken(idToken);
  } catch (err) {
    logger.error(`Firebase token verification failed: ${err.message}`);
    throw ApiError.unauthorized('Invalid Google sign-in token');
  }
  if (!decoded.email || !decoded.email_verified) {
    throw ApiError.unauthorized('Google account email is not verified');
  }

  let user = await User.findOne({ $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }] });
  if (!user) {
    user = await User.create({
      name: decoded.name || decoded.email.split('@')[0],
      email: decoded.email,
      provider: 'google',
      firebaseUid: decoded.uid,
      isEmailVerified: true,
      avatar: decoded.picture ? { url: decoded.picture } : undefined,
    });
  } else {
    // Backfill Google fields on an account first seen via another channel.
    let changed = false;
    if (!user.firebaseUid) {
      user.firebaseUid = decoded.uid;
      user.isEmailVerified = true;
      changed = true;
    }
    if (!user.avatar?.url && decoded.picture) {
      user.avatar = { url: decoded.picture };
      changed = true;
    }
    if (changed) await user.save({ validateBeforeSave: false });
  }

  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  const tokens = generateAuthTokens(user);
  return { user, tokens };
};

/** Exchanges a valid refresh token for a fresh access/refresh pair. */
export const rotateRefreshToken = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token missing');
  const decoded = verifyToken(refreshToken, TOKEN_TYPE.REFRESH);
  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Invalid session');
  return { user, tokens: generateAuthTokens(user) };
};

export const verifyEmail = async (rawToken) => {
  const user = await User.findOne({
    emailVerifyToken: hashToken(rawToken),
    emailVerifyExpires: { $gt: Date.now() },
  }).select('+emailVerifyToken +emailVerifyExpires');
  if (!user) throw ApiError.badRequest('Invalid or expired verification token');

  user.isEmailVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpires = undefined;
  await user.save({ validateBeforeSave: false });
  return user;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  // Do not reveal whether the email exists
  if (!user) return;

  const { raw } = generateRandomToken();
  user.setResetPasswordToken(raw);
  await user.save({ validateBeforeSave: false });

  const url = `${env.CLIENT_URL}/reset-password?token=${raw}`;
  await sendPasswordResetEmail(user.email, user.name, url).catch(() => {});
};

export const resetPassword = async (rawToken, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: hashToken(rawToken),
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');
  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user.password) throw ApiError.badRequest('Password change unavailable for social accounts');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
};

export const resendVerification = async (user) => {
  if (user.isEmailVerified) throw ApiError.badRequest('Email is already verified');
  const { raw } = generateRandomToken();
  user.setEmailVerifyToken(raw);
  await user.save({ validateBeforeSave: false });
  const url = `${env.CLIENT_URL}/verify-email?token=${raw}`;
  await sendVerificationEmail(user.email, user.name, url).catch(() => {});
};
