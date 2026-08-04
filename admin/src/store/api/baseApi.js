import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '../slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: 'include',
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

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Only attempt a refresh when a logged-in session's token expired —
  // i.e. a 401 on a non-auth route while an access token is present.
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
  // Keep admin data fresh: refetch when the tab regains focus or reconnects,
  // so orders placed by customers show up without a manual reload.
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: [
    'Product', 'Category', 'Brand', 'Order', 'Coupon', 'Customer',
    'Review', 'Banner', 'Blog', 'Settings', 'Analytics', 'User',
  ],
  endpoints: () => ({}),
});
