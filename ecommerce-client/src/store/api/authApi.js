import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    register: build.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: build.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    googleLogin: build.mutation({
      query: (body) => ({ url: '/auth/google', method: 'POST', body }),
    }),
    logout: build.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    me: build.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    forgotPassword: build.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: build.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    verifyEmail: build.mutation({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
    }),
    changePassword: build.mutation({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),
    updateProfile: build.mutation({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
} = authApi;
