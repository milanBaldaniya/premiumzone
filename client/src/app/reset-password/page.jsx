'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '@/store/api/authApi';
import Button from '@/components/ui/Button';
import { AuthShell, Field } from '@/components/auth/AuthShell';

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [resetPassword] = useResetPasswordMutation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setError('');
    if (!token) return setError('Invalid or missing reset token');
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      toast.success('Password reset — please sign in');
      router.push('/login');
    } catch (err) {
      setError(err?.data?.message || 'Reset failed');
    }
  };

  return (
    <AuthShell title="Reset Password" subtitle="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        <Field label="New Password" error={errors.password?.message}>
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
        <Field label="Confirm Password" error={errors.confirm?.message}>
          <input
            type="password"
            className="input-luxe"
            placeholder="Repeat password"
            {...register('confirm', {
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })}
          />
        </Field>
        <Button variant="gold" type="submit" loading={isSubmitting} className="w-full">
          Reset Password
        </Button>
        <p className="text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-accent-dark hover:underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
