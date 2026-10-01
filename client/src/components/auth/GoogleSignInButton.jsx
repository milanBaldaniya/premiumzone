'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useGoogleLoginMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { signInWithGoogle } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const GoogleLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.61z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.85.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58z"
    />
  </svg>
);

/**
 * Firebase-driven "Continue with Google" — opens Firebase's Google popup,
 * then hands the resulting Firebase ID token to /auth/google, which verifies
 * it via the Firebase Admin SDK (see backend/src/services/auth.service.js).
 */
export default function GoogleSignInButton({ onAuthenticated, label = 'Continue with Google', className, iconSize = 18 }) {
  const dispatch = useDispatch();
  const [googleLogin] = useGoogleLoginMutation();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const res = await googleLogin({ idToken }).unwrap();
      dispatch(setCredentials(res.data));
      await onAuthenticated?.(res.data.user);
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User dismissed the popup — nothing to report.
      } else {
        toast.error(err?.data?.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-primary shadow-sm transition-all duration-300 hover:border-accent/40 hover:bg-slate-50 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {loading ? (
        <span
          className="animate-spin rounded-full border-2 border-slate-300 border-t-primary"
          style={{ width: iconSize, height: iconSize }}
        />
      ) : (
        <GoogleLogo size={iconSize} />
      )}
      {label}
    </button>
  );
}
