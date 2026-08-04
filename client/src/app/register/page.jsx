'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { useAddToCartMutation, useToggleWishlistMutation } from '@/store/api/commerceApi';
import { getSafeRedirect } from '@/lib/authRedirect';
import Button from '@/components/ui/Button';
import { AuthShell, Field } from '../login/page';

function RegisterForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [registerUser] = useRegisterMutation();
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
  const loginHref = qs ? `/login?${qs}` : '/login';

  // Best-effort, same as the login flow — never blocks the redirect on failure.
  const resumeIntent = async () => {
    if (intent === 'addToCart' && productId) {
      try {
        await addToCart({ productId, quantity }).unwrap();
        toast.success('Account created — added to your cart');
        return;
      } catch {
        /* fall through to plain welcome */
      }
    }
    if (intent === 'wishlist' && productId) {
      try {
        const res = await toggleWishlist({ productId }).unwrap();
        toast.success(res?.message || 'Account created — saved to your wishlist');
        return;
      } catch {
        /* fall through to plain welcome */
      }
    }
    toast.success('Account created — check your email to verify');
  };

  const onSubmit = async (values) => {
    setError('');
    try {
      const res = await registerUser(values).unwrap();
      dispatch(setCredentials(res.data));
      await resumeIntent();
      router.push(redirectTo);
    } catch (err) {
      setError(err?.data?.message || err?.data?.errors?.[0]?.message || 'Registration failed');
    }
  };

  return (
    <AuthShell title="Join Premium Zone" subtitle="Create your account in seconds">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        <Field label="Full Name" error={errors.name?.message}>
          <input className="input-luxe" placeholder="John Doe" {...register('name', { required: 'Name is required' })} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input type="email" className="input-luxe" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            className="input-luxe"
            placeholder="Min. 8 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
          />
        </Field>
        <p className="text-xs text-slate-400">
          Must include uppercase, lowercase and a number.
        </p>
        <Button variant="gold" type="submit" loading={isSubmitting} className="w-full">
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href={loginHref} className="font-semibold text-accent-dark hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthShell title="Join Premium Zone" subtitle="Create your account in seconds" />}>
      <RegisterForm />
    </Suspense>
  );
}
