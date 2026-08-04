import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model.js';
import { env } from '../config/env.js';
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

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

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

/** Verifies a Google ID token and finds-or-creates the account. */
export const googleLogin = async (idToken) => {
  if (!googleClient) throw ApiError.internal('Google login is not configured');

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw ApiError.unauthorized('Invalid Google token');

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      provider: 'google',
      googleId: payload.sub,
      isEmailVerified: true,
      avatar: payload.picture ? { url: payload.picture } : undefined,
    });
  } else if (user.provider === 'local' && !user.googleId) {
    user.googleId = payload.sub;
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });
  }

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
