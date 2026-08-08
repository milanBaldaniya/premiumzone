import { baseApi } from './baseApi';

export const commerceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Cart
    getCart: build.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: build.mutation({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: build.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${itemId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeCartItem: build.mutation({
      query: (itemId) => ({ url: `/cart/items/${itemId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: build.mutation({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    applyCoupon: build.mutation({
      query: (body) => ({ url: '/cart/coupon', method: 'POST', body }),
      invalidatesTags: ['Cart'],
    }),
    removeCoupon: build.mutation({
      query: () => ({ url: '/cart/coupon', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),

    // Wishlist
    getWishlist: build.query({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),
    toggleWishlist: build.mutation({
      query: (body) => ({ url: '/wishlist/toggle', method: 'POST', body }),
      invalidatesTags: ['Wishlist'],
    }),

    // Addresses
    getAddresses: build.query({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),
    createAddress: build.mutation({
      query: (body) => ({ url: '/addresses', method: 'POST', body }),
      invalidatesTags: ['Address'],
    }),
    updateAddress: build.mutation({
      query: ({ id, ...body }) => ({ url: `/addresses/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Address'],
    }),
    deleteAddress: build.mutation({
      query: (id) => ({ url: `/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),

    // Orders
    checkoutPreview: build.mutation({
      query: (body) => ({ url: '/orders/checkout-preview', method: 'POST', body }),
    }),
    placeOrder: build.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    getMyOrders: build.query({
      query: (params = {}) => ({ url: '/orders', params }),
      providesTags: ['Order'],
    }),
    getMyOrder: build.query({
      query: (orderNumber) => `/orders/${orderNumber}`,
      providesTags: ['Order'],
    }),
    cancelOrder: build.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Order'],
    }),

    // Payments (Razorpay)
    createRazorpayOrder: build.mutation({
      query: (body) => ({ url: '/payments/razorpay/order', method: 'POST', body }),
    }),
    verifyRazorpayPayment: build.mutation({
      query: (body) => ({ url: '/payments/razorpay/verify', method: 'POST', body }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    // Notifications
    getNotifications: build.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationRead: build.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useGetWishlistQuery,
  useToggleWishlistMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useCheckoutPreviewMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useCancelOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} = commerceApi;
