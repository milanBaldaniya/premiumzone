import { isProd } from '../config/env.js';

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: REFRESH_MAX_AGE,
  path: '/',
};

export const REFRESH_COOKIE_NAME = 'refresh_token';

export const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);

export const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions, maxAge: undefined });
