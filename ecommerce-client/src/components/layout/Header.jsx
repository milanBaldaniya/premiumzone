'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { FaSearch, FaShoppingBag, FaHeart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { selectIsAuth, selectUser, logout } from '@/store/slices/authSlice';
import { useGetCartQuery } from '@/store/api/commerceApi';
import { useLogoutMutation } from '@/store/api/authApi';

const NAV = [
  { label: 'Watches', href: '/products?category=watches' },
  { label: 'Gadgets', href: '/products?category=gadgets' },
  { label: 'Brands', href: '/brands' },
  { label: 'New Arrivals', href: '/products?sort=-createdAt' },
  { label: 'Blog', href: '/blog' },
];

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const user = useSelector(selectUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuth });
  const [logoutApi] = useLogoutMutation();
  const cartCount = cart?.data?.lineItems?.length || 0;

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    // Preserve active filters (brand, max price, sort) when already on /products,
    // so search mixes with them instead of replacing them.
    const onProducts = typeof window !== 'undefined' && window.location.pathname === '/products';
    const params = new URLSearchParams(onProducts ? window.location.search : '');
    if (q) params.set('search', q);
    else params.delete('search');
    params.delete('page');
    const str = params.toString();
    router.push(`/products${str ? `?${str}` : ''}`);
  };

  const clearSearch = () => {
    setQuery('');
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.has('search')) {
      url.searchParams.delete('search');
      url.searchParams.delete('page');
      router.push(`${url.pathname}${url.search}`);
    }
  };

  const handleLogout = async () => {
    await logoutApi().unwrap().catch(() => {});
    dispatch(logout());
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="container-luxe flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-lg font-bold text-accent">
            P
          </span>
          <span className="hidden font-display text-xl font-bold tracking-tight text-primary sm:block">
            Premium Products Zone
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search (desktop) */}
        <form onSubmit={onSearch} className="hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search timepieces..."
              className="input-luxe py-2 pl-9 pr-9 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          <Link href="/wishlist" aria-label="Wishlist" className="p-2 text-slate-600 hover:text-accent">
            <FaHeart size={18} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative p-2 text-slate-600 hover:text-accent">
            <FaShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-primary">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuth ? (
            <div className="group relative">
              <button className="flex items-center gap-2 p-2 text-slate-600 hover:text-accent">
                <FaUser size={18} />
                <span className="hidden text-sm font-medium lg:block">{user?.name?.split(' ')[0]}</span>
              </button>
              <div className="invisible absolute right-0 top-full w-48 rounded-xl border border-slate-100 bg-white p-2 opacity-0 shadow-luxe transition-all group-hover:visible group-hover:opacity-100">
                <Link href="/account" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                  My Account
                </Link>
                <Link href="/account/orders" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn-gold hidden px-5 py-2 text-xs sm:inline-flex">
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 text-slate-600 lg:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="container-luxe flex flex-col py-4">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-medium text-slate-700 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
            {!isAuth && (
              <Link href="/login" className="btn-gold mt-3 w-full">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
