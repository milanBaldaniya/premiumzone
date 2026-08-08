import { baseApi } from './baseApi';

const qs = (params = {}) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Products
    getProducts: build.query({
      query: (params) => `/products?${qs(params)}`,
      providesTags: ['Product'],
    }),
    getStorefrontSections: build.query({
      query: () => '/products/sections',
      providesTags: ['Product'],
    }),
    getProductBySlug: build.query({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: ['Product'],
    }),
    getRelatedProducts: build.query({
      query: (id) => `/products/${id}/related`,
    }),

    // Categories & brands
    getCategoryTree: build.query({
      query: () => '/categories/tree',
      providesTags: ['Category'],
    }),
    getBrands: build.query({
      query: (params) => `/brands?${qs(params)}`,
      providesTags: ['Brand'],
    }),

    // Reviews
    getTopReviews: build.query({
      query: (limit = 8) => `/reviews/top?limit=${limit}`,
      providesTags: ['Review'],
    }),
    getProductReviews: build.query({
      query: ({ productId, ...params }) => `/reviews/product/${productId}?${qs(params)}`,
      providesTags: ['Review'],
    }),
    createReview: build.mutation({
      query: ({ productId, ...body }) => ({
        url: `/reviews/product/${productId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    // Banners / settings / blogs
    getActiveBanners: build.query({
      query: (placement = 'hero') => `/banners/active?placement=${placement}`,
    }),
    getPublicSettings: build.query({
      query: () => '/settings/public',
    }),
    getBlogs: build.query({
      query: (params) => `/blogs?${qs(params)}`,
    }),
    getBlogBySlug: build.query({
      query: (slug) => `/blogs/slug/${slug}`,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetStorefrontSectionsQuery,
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetCategoryTreeQuery,
  useGetBrandsQuery,
  useGetTopReviewsQuery,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useGetActiveBannersQuery,
  useGetPublicSettingsQuery,
  useGetBlogsQuery,
  useGetBlogBySlugQuery,
} = catalogApi;
