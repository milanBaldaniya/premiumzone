'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import Button from '@/components/ui/Button';
import { AuthShell, Field } from '../login/page';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [registerUser] = useRegisterMutation();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    setError('');
    try {
      const res = await registerUser(values).unwrap();
      dispatch(setCredentials(res.data));
      toast.success('Account created — check your email to verify');
      router.push('/');
    } catch (err) {
      setError(err?.data?.message || err?.data?.errors?.[0]?.message || 'Registration failed');
    }
  };

  return (
    <AuthShell title="Join Premium Products Zone" subtitle="Create your account in seconds">
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
        <Link href="/login" className="font-semibold text-accent-dark hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
