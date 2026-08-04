'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { useAddToCartMutation, useToggleWishlistMutation } from '@/store/api/commerceApi';
import { getSafeRedirect } from '@/lib/authRedirect';
import Button from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [login] = useLoginMutation();
  const [addToCart] = useAddToCartMutation();
  const [toggleWishlist] = useToggleWishlistMutation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const redirectTo = getSafeRedirect(searchParams.get('redirect'), '/');
  const intent = searchParams.get('intent');
  const productId = searchParams.get('productId');
  const quantity = Number(searchParams.get('quantity')) || 1;
  const qs = searchParams.toString();
  const registerHref = qs ? `/register?${qs}` : '/register';

  // Best-effort: resuming the action the user was blocked on is a nicety on
  // top of a successful sign-in, so a failure here never blocks the redirect.
  const resumeIntent = async () => {
    if (intent === 'addToCart' && productId) {
      try {
        await addToCart({ productId, quantity }).unwrap();
        toast.success('Welcome back — added to your cart');
        return;
      } catch {
        /* fall through to plain welcome */
      }
    }
    if (intent === 'wishlist' && productId) {
      try {
        const res = await toggleWishlist({ productId }).unwrap();
        toast.success(res?.message || 'Welcome back — saved to your wishlist');
        return;
      } catch {
        /* fall through to plain welcome */
      }
    }
    toast.success('Welcome back!');
  };

  const onSubmit = async (values) => {
    setError('');
    try {
      const res = await login(values).unwrap();
      dispatch(setCredentials(res.data));
      await resumeIntent();
      router.push(redirectTo);
    } catch (err) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to your Premium Zone account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            className="input-luxe"
            placeholder="you@example.com"
            {...register('email', { required: 'Email is required' })}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            className="input-luxe"
            placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
          />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-accent-dark hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button variant="gold" type="submit" loading={isSubmitting} className="w-full">
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href={registerHref} className="font-semibold text-accent-dark hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="Welcome Back" subtitle="Sign in to your Premium Zone account" />}>
      <LoginForm />
    </Suspense>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-luxe grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-luxe">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary font-display text-2xl font-bold text-accent">
            P
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-primary">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
