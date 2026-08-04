import { baseApi } from './baseApi';

const withParams = (url, params = {}) => ({ url, params });

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Auth ─────────────────────────────────────────────
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    me: build.query({ query: () => '/auth/me', providesTags: ['User'] }),

    // ── Analytics ────────────────────────────────────────
    getDashboardStats: build.query({ query: () => '/analytics/dashboard', providesTags: ['Analytics'] }),
    getSalesChart: build.query({ query: (range = 'monthly') => `/analytics/sales?range=${range}` }),
    getTopProducts: build.query({ query: () => '/analytics/top-products' }),
    getOrderStatusBreakdown: build.query({ query: () => '/analytics/order-status' }),
    getRevenueSplit: build.query({ query: () => '/analytics/revenue-split' }),
    getCustomerStats: build.query({ query: () => '/analytics/customers' }),

    // ── Products ─────────────────────────────────────────
    getProducts: build.query({
      query: (params) => withParams('/products/admin/all', params),
      providesTags: ['Product'],
    }),
    getProduct: build.query({
      query: (id) => `/products/admin/${id}`,
      providesTags: ['Product'],
    }),
    createProduct: build.mutation({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product'],
    }),
    uploadProductImages: build.mutation({
      query: ({ id, formData }) => ({ url: `/products/${id}/images`, method: 'POST', body: formData }),
      invalidatesTags: ['Product'],
    }),

    // ── Categories ───────────────────────────────────────
    getCategories: build.query({ query: (params) => withParams('/categories', params), providesTags: ['Category'] }),
    createCategory: build.mutation({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: build.mutation({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: build.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Category'],
    }),

    // ── Brands ───────────────────────────────────────────
    getBrands: build.query({ query: (params) => withParams('/brands', params), providesTags: ['Brand'] }),
    createBrand: build.mutation({
      query: (body) => ({ url: '/brands', method: 'POST', body }),
      invalidatesTags: ['Brand'],
    }),
    updateBrand: build.mutation({
      query: ({ id, ...body }) => ({ url: `/brands/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Brand'],
    }),
    deleteBrand: build.mutation({
      query: (id) => ({ url: `/brands/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Brand'],
    }),

    // ── Orders ───────────────────────────────────────────
    getOrders: build.query({ query: (params) => withParams('/orders/admin/all', params), providesTags: ['Order'] }),
    getOrder: build.query({ query: (id) => `/orders/admin/${id}`, providesTags: ['Order'] }),
    updateOrderStatus: build.mutation({
      query: ({ id, ...body }) => ({ url: `/orders/admin/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Order', 'Analytics'],
    }),

    // ── Coupons ──────────────────────────────────────────
    getCoupons: build.query({ query: (params) => withParams('/coupons', params), providesTags: ['Coupon'] }),
    createCoupon: build.mutation({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: ['Coupon'],
    }),
    updateCoupon: build.mutation({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Coupon'],
    }),
    deleteCoupon: build.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Coupon'],
    }),

    // ── Customers ────────────────────────────────────────
    getCustomers: build.query({ query: (params) => withParams('/users', params), providesTags: ['Customer'] }),
    getCustomer: build.query({ query: (id) => `/users/${id}`, providesTags: ['Customer'] }),
    updateCustomerStatus: build.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Customer'],
    }),

    // ── Reviews ──────────────────────────────────────────
    getReviews: build.query({ query: (params) => withParams('/reviews/admin/all', params), providesTags: ['Review'] }),
    moderateReview: build.mutation({
      query: ({ id, ...body }) => ({ url: `/reviews/admin/${id}/moderate`, method: 'PATCH', body }),
      invalidatesTags: ['Review'],
    }),

    // ── Banners ──────────────────────────────────────────
    getBanners: build.query({ query: (params) => withParams('/banners', params), providesTags: ['Banner'] }),
    createBanner: build.mutation({
      query: (body) => ({ url: '/banners', method: 'POST', body }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: build.mutation({
      query: (id) => ({ url: `/banners/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Banner'],
    }),

    // ── Settings ─────────────────────────────────────────
    getSettings: build.query({ query: () => '/settings', providesTags: ['Settings'] }),
    updateSettings: build.mutation({
      query: (body) => ({ url: '/settings', method: 'PATCH', body }),
      invalidatesTags: ['Settings'],
    }),

    // ── Upload ───────────────────────────────────────────
    uploadImage: build.mutation({
      query: ({ formData, folder = 'media' }) => ({
        url: `/upload/image?folder=${folder}`,
        method: 'POST',
        body: formData,
      }),
    }),
    removeImage: build.mutation({
      query: (publicId) => ({
        url: '/upload/image',
        method: 'DELETE',
        body: { publicId },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useMeQuery,
  useGetDashboardStatsQuery,
  useGetSalesChartQuery,
  useGetTopProductsQuery,
  useGetOrderStatusBreakdownQuery,
  useGetRevenueSplitQuery,
  useGetCustomerStatsQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetCustomersQuery,
  useGetCustomerQuery,
  useUpdateCustomerStatusMutation,
  useGetReviewsQuery,
  useModerateReviewMutation,
  useGetBannersQuery,
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUploadImageMutation,
  useRemoveImageMutation,
} = adminApi;
