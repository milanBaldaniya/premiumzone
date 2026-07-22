import { createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'luxe_admin_token';
const USER_KEY = 'luxe_admin_user';

const load = () => {
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
  name: 'auth',
  initialState: load(),
  reducers: {
    setCredentials: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      if (payload.user) state.user = payload.user;
      localStorage.setItem(TOKEN_KEY, payload.accessToken);
      if (payload.user) localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    },
    setUser: (state, { payload }) => {
      state.user = payload;
      localStorage.setItem(USER_KEY, JSON.stringify(payload));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export const selectIsAuth = (s) => Boolean(s.auth.accessToken);
export default authSlice.reducer;
