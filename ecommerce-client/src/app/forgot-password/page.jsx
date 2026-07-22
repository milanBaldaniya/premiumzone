'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import Button from '@/components/ui/Button';
import { AuthShell, Field } from '../login/page';

export default function ForgotPasswordPage() {
  const [forgotPassword] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    await forgotPassword(values).unwrap().catch(() => {});
    setSent(true);
  };

  return (
    <AuthShell title="Forgot Password" subtitle="We'll email you a reset link">
      {sent ? (
        <div className="text-center">
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            If an account exists for that email, a reset link is on its way. Check your inbox.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-accent-dark hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              className="input-luxe"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
          </Field>
          <Button variant="gold" type="submit" loading={isSubmitting} className="w-full">
            Send Reset Link
          </Button>
          <p className="text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link href="/login" className="font-semibold text-accent-dark hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
