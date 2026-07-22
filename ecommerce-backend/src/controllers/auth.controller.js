import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/ApiResponse.js';
import {
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from '../utils/cookies.js';
import * as authService from '../services/auth.service.js';

const authPayload = (res, { user, tokens }, statusCode, message) => {
  setRefreshCookie(res, tokens.refreshToken);
  return sendResponse(res, {
    statusCode,
    message,
    data: { user, accessToken: tokens.accessToken },
  });
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  authPayload(res, result, 201, 'Account created — please verify your email');
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  authPayload(res, result, 200, 'Logged in successfully');
});

export const googleAuth = asyncHandler(async (req, res) => {
  const result = await authService.googleLogin(req.body.idToken);
  authPayload(res, result, 200, 'Logged in with Google');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  const result = await authService.rotateRefreshToken(token);
  authPayload(res, result, 200, 'Token refreshed');
});

export const logout = asyncHandler(async (_req, res) => {
  clearRefreshCookie(res);
  sendResponse(res, { message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  sendResponse(res, { data: { user: req.user }, message: 'Current user' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  sendResponse(res, { message: 'Email verified successfully' });
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.user);
  sendResponse(res, { message: 'Verification email sent' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendResponse(res, { message: 'If that email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  sendResponse(res, { message: 'Password reset successful — please log in' });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  clearRefreshCookie(res);
  sendResponse(res, { message: 'Password changed — please log in again' });
});
