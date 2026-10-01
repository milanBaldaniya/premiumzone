'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useVerifyEmailMutation } from '@/store/api/authApi';
import { AuthShell } from '@/components/auth/AuthShell';

function VerifyContent() {
  const token = useSearchParams().get('token');
  const [verifyEmail] = useVerifyEmailMutation();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setStatus('error');
      return;
    }
    verifyEmail({ token })
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token, verifyEmail]);

  const config = {
    loading: { icon: FaSpinner, color: 'text-accent', title: 'Verifying…', text: 'Please wait a moment.', spin: true },
    success: { icon: FaCheckCircle, color: 'text-green-500', title: 'Email Verified!', text: 'Your account is now fully activated.' },
    error: { icon: FaTimesCircle, color: 'text-red-500', title: 'Verification Failed', text: 'This link is invalid or has expired.' },
  }[status];

  const Icon = config.icon;

  return (
    <AuthShell title="Email Verification" subtitle="Confirming your account">
      <div className="flex flex-col items-center text-center">
        <Icon className={`mb-4 text-5xl ${config.color} ${config.spin ? 'animate-spin' : ''}`} />
        <h2 className="font-display text-xl font-bold text-primary">{config.title}</h2>
        <p className="mt-2 text-sm text-slate-500">{config.text}</p>
        {status !== 'loading' && (
          <Link href={status === 'success' ? '/' : '/login'} className="btn-gold mt-6">
            {status === 'success' ? 'Start Shopping' : 'Back to Sign In'}
          </Link>
        )}
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
