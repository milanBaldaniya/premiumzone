'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaShieldAlt, FaGem, FaTruck, FaPhoneAlt } from 'react-icons/fa';
import { useAddToCartMutation, useToggleWishlistMutation } from '@/store/api/commerceApi';
import { useUpdateProfileMutation } from '@/store/api/authApi';
import { getSafeRedirect } from '@/lib/authRedirect';
import Button from '@/components/ui/Button';

// Firebase (~70KB) is browser-only and only needed on this page — code-split
// it into its own chunk instead of letting it ride along in a shared bundle
// every route would otherwise pay for.
const GoogleSignInButton = dynamic(() => import('@/components/auth/GoogleSignInButton'), {
  ssr: false,
  loading: () => <div className="h-[54px] w-full animate-pulse rounded-xl bg-slate-100" />,
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [addToCart] = useAddToCartMutation();
  const [toggleWishlist] = useToggleWishlistMutation();
  const [updateProfile, { isLoading: savingPhone }] = useUpdateProfileMutation();

  // Google doesn't hand us a phone number — if the account doesn't have one
  // yet, ask for it once, right after sign-in, before continuing on.
  const [needsPhone, setNeedsPhone] = useState(false);
  const [phone, setPhone] = useState('');

  const redirectTo = getSafeRedirect(searchParams.get('redirect'), '/');
  const intent = searchParams.get('intent');
  const productId = searchParams.get('productId');
  const quantity = Number(searchParams.get('quantity')) || 1;

  // Best-effort: resuming the action the user was blocked on is a nicety on
  // top of a successful sign-in, so a failure here never blocks the redirect.
  const resumeIntent = async () => {
    if (intent === 'addToCart' && productId) {
      try {
        await addToCart({ productId, quantity }).unwrap();
        toast.success('Welcome — added to your cart');
        return;
      } catch {
        /* fall through to plain welcome */
      }
    }
    if (intent === 'wishlist' && productId) {
      try {
        const res = await toggleWishlist({ productId }).unwrap();
        toast.success(res?.message || 'Welcome — saved to your wishlist');
        return;
      } catch {
        /* fall through to plain welcome */
      }
    }
    toast.success('Welcome to Premium Product Zone!');
  };

  const finishUp = async () => {
    await resumeIntent();
    router.push(redirectTo);
  };

  const afterGoogleAuth = async (user) => {
    if (!user?.phone) {
      setNeedsPhone(true);
      return;
    }
    await finishUp();
  };

  const submitPhone = async (e) => {
    e.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) {
      toast.error('Please enter your mobile number to continue');
      return;
    }
    try {
      await updateProfile({ phone: trimmed }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'Could not save phone number — please try again');
      return;
    }
    await finishUp();
  };

  return (
    <LoginCard>
      {needsPhone ? (
        <PhoneStep
          phone={phone}
          onChangePhone={setPhone}
          onSubmit={submitPhone}
          saving={savingPhone}
        />
      ) : (
        <SignInStep
          googleButton={
            <GoogleSignInButton
              onAuthenticated={afterGoogleAuth}
              iconSize={22}
              className="!py-4 text-base transition-transform duration-300 hover:!shadow-gold hover:scale-[1.015] active:scale-[0.98]"
            />
          }
        />
      )}
    </LoginCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginCard><SignInStep googleButton={<div className="h-[54px] w-full animate-pulse rounded-xl bg-slate-100" />} /></LoginCard>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginCard({ children }) {
  return (
    <div className="relative min-h-[88vh] overflow-hidden bg-primary-950">
      {/* Editorial backdrop */}
      <Image src="/banners/slider1.png" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/85 to-primary-950/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950/70 via-transparent to-transparent" />
      {/* Spotlight vignette behind the card */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[110px]" />

      <div className="container-luxe relative grid min-h-[88vh] place-items-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* One unified card holding everything */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-luxe">
            <span className="absolute inset-x-0 top-0 h-1.5 bg-gold-gradient" />
            <div className="px-8 pb-10 pt-12 sm:px-10">{children}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SignInStep({ googleButton }) {
  return (
    <>
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-dark">
          Exclusive Member Access
        </span>

        <div className="relative mx-auto mt-6 h-20 w-20">
          <motion.span
            animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-accent/50 blur-xl"
          />
          <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-black p-2.5 shadow-gold ring-4 ring-accent/10">
            <img src="/logo-icon.png" alt="Premium Product Zone" className="h-full w-full object-contain" />
          </div>
        </div>

        <h1 className="mt-6 font-display text-2xl font-bold text-primary sm:text-3xl">Premium Product Zone</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
          Sign in with Google to unlock curated luxury watches and premium gadgets.
        </p>
      </div>

      <div className="mt-9">
        {googleButton}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
          <FaShieldAlt className="text-accent-dark" size={12} />
          Secure sign-in, powered by Google
        </div>
      </div>

      <div className="mt-9 flex items-center justify-center gap-8 border-t border-slate-100 pt-8">
        <TrustItem icon={FaShieldAlt} label="Authentic" />
        <span className="h-8 w-px bg-slate-100" />
        <TrustItem icon={FaGem} label="Curated" />
        <span className="h-8 w-px bg-slate-100" />
        <TrustItem icon={FaTruck} label="Free Shipping" />
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-slate-400">
        By continuing, you agree to Premium Product Zone&apos;s{' '}
        <Link href="/terms" className="font-medium text-accent-dark hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-medium text-accent-dark hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}

function PhoneStep({ phone, onChangePhone, onSubmit, saving }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-gradient text-primary shadow-gold">
          <FaPhoneAlt size={22} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-primary sm:text-3xl">One Last Step</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
          Add your mobile number so we can keep you posted on orders and deliveries.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Mobile Number</span>
          <input
            type="tel"
            required
            autoFocus
            value={phone}
            onChange={(e) => onChangePhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="input-luxe"
          />
        </label>

        <Button variant="gold" type="submit" loading={saving} className="w-full !py-4 text-base">
          Continue
        </Button>
      </form>
    </motion.div>
  );
}

function TrustItem({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Icon className="text-accent-dark" size={15} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
