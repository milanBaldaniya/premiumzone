'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectIsAuth } from '@/store/slices/authSlice';
import { useAddToCartMutation, useToggleWishlistMutation } from '@/store/api/commerceApi';
import Rating from '@/components/ui/Rating';
import { formatPrice, discountPercent } from '@/lib/utils';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

export default function ProductCard({ product }) {
  const isAuth = useSelector(selectIsAuth);
  const [addToCart, { isLoading }] = useAddToCartMutation();
  const [toggleWishlist] = useToggleWishlistMutation();

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const off = discountPercent(product.price, product.discountPrice);

  const guard = () => {
    if (!isAuth) {
      toast.error('Please sign in first');
      return false;
    }
    return true;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!guard()) return;
    try {
      await addToCart({ productId: product._id, quantity: 1 }).unwrap();
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not add to cart');
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!guard()) return;
    try {
      const res = await toggleWishlist({ productId: product._id }).unwrap();
      toast.success(res.message);
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group card-luxe overflow-hidden hover:shadow-luxe"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <Image
            src={product.thumbnail?.url || PLACEHOLDER}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {off > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-primary shadow-gold">
              -{off}%
            </span>
          )}
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow-soft transition hover:text-accent group-hover:opacity-100"
          >
            <FaHeart size={14} />
          </button>
        </div>

        <div className="space-y-2 p-4">
          {product.brand?.name && (
            <p className="text-xs font-medium uppercase tracking-wider text-accent-dark">
              {product.brand.name}
            </p>
          )}
          <h3 className="line-clamp-1 font-sans text-sm font-semibold text-ink">{product.name}</h3>
          <Rating value={product.ratingsAverage} count={product.ratingsCount} />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-primary">{formatPrice(price)}</span>
              {off > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              disabled={isLoading}
              aria-label="Add to cart"
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white transition hover:bg-accent hover:text-primary"
            >
              <FaShoppingBag size={13} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
