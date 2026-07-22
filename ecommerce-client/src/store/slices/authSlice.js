import { createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'luxe_token';
const USER_KEY = 'luxe_user';

/**
 * Reads persisted auth from localStorage. Called from a client effect (never
 * during render) so server and first client render stay identical — avoiding
 * Next.js hydration mismatches.
 */
export const readStoredAuth = () => {
  if (typeof window === 'undefined') return { user: null, accessToken: null };
  try {
    return {
      user: JSON.parse(localStorage.getItem(USER_KEY)) || null,
      accessToken: localStorage.getItem(TOKEN_KEY) || null,
    };
  } catch {
    return { user: null, accessToken: null };
  }
};

const authSlice = createSlice({
  // Always start signed-out; AuthBootstrap hydrates from storage on mount.
  name: 'auth',
  initialState: { user: null, accessToken: null, initialized: false },
  reducers: {
    hydrate: (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
    },
    setCredentials: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      if (payload.user) state.user = payload.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, payload.accessToken);
        if (payload.user) localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
      }
    },
    setUser: (state, { payload }) => {
      state.user = payload;
      if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, JSON.stringify(payload));
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    },
  },
});

export const { hydrate, setCredentials, setUser, setInitialized, logout } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export const selectIsAuth = (s) => Boolean(s.auth.accessToken);
export const selectInitialized = (s) => s.auth.initialized;
export default authSlice.reducer;
