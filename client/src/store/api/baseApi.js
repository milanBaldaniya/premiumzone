import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include', // send httpOnly refresh cookie
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

// Auth endpoints must never trigger the refresh-and-retry flow: a failed
// login/register is a legitimate 401, not an expired session.
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh', '/auth/forgot', '/auth/reset'];
const isAuthRoute = (args) => {
  const url = typeof args === 'string' ? args : args?.url || '';
  return AUTH_ROUTES.some((r) => url.startsWith(r));
};

/**
 * Wraps the base query: on a 401 for a logged-in session, attempts a single
 * refresh and replays the original request. If refresh fails, logs out.
 * Auth routes (login/register/…) are excluded so bad credentials surface cleanly.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const hadToken = Boolean(api.getState().auth.accessToken);
  if (result.error?.status === 401 && hadToken && !isAuthRoute(args)) {
    const refresh = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions);
    if (refresh.data?.data?.accessToken) {
      api.dispatch(setCredentials(refresh.data.data));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'Cart', 'Wishlist', 'Order', 'Category', 'Brand', 'Review', 'User', 'Address', 'Notification'],
  endpoints: () => ({}),
});
