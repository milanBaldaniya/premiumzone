'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setError('');
    try {
      const res = await login(values).unwrap();
      dispatch(setCredentials(res.data));
      toast.success('Welcome back!');
      router.push('/');
    } catch (err) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to your Premium Products Zone account">
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
        <Link href="/register" className="font-semibold text-accent-dark hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
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
