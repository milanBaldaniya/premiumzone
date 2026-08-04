'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectIsAuth } from '@/store/slices/authSlice';
import { buildAuthHref } from '@/lib/authRedirect';

/**
 * Gate an action behind authentication. If the user isn't signed in, sends
 * them to /login carrying where to return to and — for buy/wishlist actions —
 * which action to resume automatically once they're back, so they don't have
 * to click "Add to Cart" a second time after signing in.
 */
export function useRequireAuth() {
  const isAuth = useSelector(selectIsAuth);
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = (opts = {}) => {
    if (isAuth) return true;
    router.push(buildAuthHref('/login', { redirect: pathname, ...opts }));
    return false;
  };

  return { isAuth, requireAuth };
}
