'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { FaHeart } from 'react-icons/fa';
import { selectIsAuth, selectInitialized } from '@/store/slices/authSlice';
import { useGetWishlistQuery } from '@/store/api/commerceApi';
import ProductGrid, { ProductGridSkeleton } from '@/components/product/ProductGrid';

export default function WishlistPage() {
  const router = useRouter();
  const isAuth = useSelector(selectIsAuth);
  const initialized = useSelector(selectInitialized);
  const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !isAuth });

  useEffect(() => {
    if (initialized && !isAuth) router.replace('/login');
  }, [initialized, isAuth, router]);

  if (!initialized || !isAuth) return null;

  const products = data?.data?.products || [];

  return (
    <div className="container-luxe py-10">
      <h1 className="mb-8 font-display text-3xl font-bold text-primary">My Wishlist</h1>
      {isLoading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-20 text-center">
          <FaHeart className="mb-4 text-5xl text-slate-300" />
          <p className="text-lg font-medium text-primary">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-slate-500">Save your favorite pieces for later.</p>
          <Link href="/products" className="btn-gold mt-6">
            Explore Collection
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
