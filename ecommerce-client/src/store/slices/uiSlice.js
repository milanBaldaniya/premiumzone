import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartOpen: false, mobileMenuOpen: false, searchOpen: false },
  reducers: {
    toggleCart: (s, { payload }) => {
      s.cartOpen = payload ?? !s.cartOpen;
    },
    toggleMobileMenu: (s, { payload }) => {
      s.mobileMenuOpen = payload ?? !s.mobileMenuOpen;
    },
    toggleSearch: (s, { payload }) => {
      s.searchOpen = payload ?? !s.searchOpen;
    },
  },
});

export const { toggleCart, toggleMobileMenu, toggleSearch } = uiSlice.actions;
export default uiSlice.reducer;
