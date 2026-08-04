'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaBoxOpen, FaHeart, FaMapMarkerAlt, FaSignOutAlt } from 'react-icons/fa';
import { selectIsAuth, selectInitialized, logout } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/api/authApi';

const NAV = [
  { href: '/account', label: 'Profile', icon: FaUser },
  { href: '/account/orders', label: 'Orders', icon: FaBoxOpen },
  { href: '/wishlist', label: 'Wishlist', icon: FaHeart },
  { href: '/account/addresses', label: 'Addresses', icon: FaMapMarkerAlt },
];

export default function AccountShell({ title, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const initialized = useSelector(selectInitialized);
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    if (initialized && !isAuth) router.replace('/login');
  }, [initialized, isAuth, router]);

  // Wait for auth hydration before deciding — avoids bouncing logged-in users.
  if (!initialized) return null;
  if (!isAuth) return null;

  const handleLogout = async () => {
    await logoutApi().unwrap().catch(() => {});
    dispatch(logout());
    router.push('/');
  };

  return (
    <div className="container-luxe py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-primary">{title}</h1>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 lg:sticky lg:top-24">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <FaSignOutAlt size={15} />
            Logout
          </button>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
