'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FaHeart, FaShieldAlt, FaTruck, FaCheck } from 'react-icons/fa';
import {
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
} from '@/store/api/catalogApi';
import { useAddToCartMutation, useToggleWishlistMutation } from '@/store/api/commerceApi';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import Button from '@/components/ui/Button';
import Rating from '@/components/ui/Rating';
import ProductGrid from '@/components/product/ProductGrid';
import ProductReviews from '@/components/product/ProductReviews';
import { formatPrice, discountPercent } from '@/lib/utils';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const { requireAuth } = useRequireAuth();
  const { data, isLoading } = useGetProductBySlugQuery(slug);
  const product = data?.data;

  const { data: related } = useGetRelatedProductsQuery(product?._id, { skip: !product?._id });
  const [addToCart, { isLoading: adding }] = useAddToCartMutation();
  const [toggleWishlist] = useToggleWishlistMutation();

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading) {
    return (
      <div className="container-luxe grid gap-10 py-12 lg:grid-cols-2">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-6 w-1/3 rounded" />
          <div className="skeleton h-24 w-full rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="container-luxe py-24 text-center text-slate-500">Product not found.</div>;
  }

  const gallery = product.gallery?.length ? product.gallery : [product.thumbnail].filter(Boolean);
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const off = discountPercent(product.price, product.discountPrice);

  const handleAdd = async () => {
    if (!requireAuth({ intent: 'addToCart', productId: product._id, quantity: qty })) return;
    try {
      await addToCart({ productId: product._id, quantity: qty }).unwrap();
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not add to cart');
    }
  };

  return (
    <div className="container-luxe py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <Image
              src={gallery[activeImg]?.url || PLACEHOLDER}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {off > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-primary">
                -{off}%
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 ${
                    activeImg === i ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <Image src={img.url || PLACEHOLDER} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand?.name && (
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-dark">
              {product.brand.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl font-bold text-primary">{product.name}</h1>
          <div className="mt-3 flex items-center gap-4">
            <Rating value={product.ratingsAverage} count={product.ratingsCount} />
            {product.inStock ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <FaCheck size={10} /> In Stock
              </span>
            ) : (
              <span className="text-xs font-medium text-red-500">Out of Stock</span>
            )}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-primary">{formatPrice(price)}</span>
            {off > 0 && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 leading-relaxed text-slate-600">{product.shortDescription}</p>
          )}

          {/* Quantity + actions */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-xl border border-slate-200">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 text-lg">
                −
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 text-lg">
                +
              </button>
            </div>
            <Button variant="gold" onClick={handleAdd} loading={adding} disabled={!product.inStock} className="flex-1">
              Add to Cart
            </Button>
            <button
              onClick={async () => {
                if (!requireAuth({ intent: 'wishlist', productId: product._id })) return;
                const res = await toggleWishlist({ productId: product._id }).unwrap();
                toast.success(res.message);
              }}
              className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:border-accent hover:text-accent"
            >
              <FaHeart />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <FaShieldAlt className="text-accent-dark" />
              <span className="text-xs text-slate-500">{product.warranty || 'Warranty'}</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <FaTruck className="text-accent-dark" />
              <span className="text-xs text-slate-500">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <FaCheck className="text-accent-dark" />
              <span className="text-xs text-slate-500">Authentic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description + specs */}
      <div className="mt-14 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl font-bold text-primary">Description</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">{product.description}</p>
        </div>
        {product.specifications?.length > 0 && (
          <div>
            <h2 className="font-display text-2xl font-bold text-primary">Specifications</h2>
            <dl className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
              {product.specifications.map((spec, i) => (
                <div key={i} className="flex justify-between px-4 py-3 text-sm">
                  <dt className="text-slate-500">{spec.key}</dt>
                  <dd className="font-medium text-primary">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <ProductReviews
        productId={product._id}
        ratingsAverage={product.ratingsAverage}
        ratingsCount={product.ratingsCount}
      />

      {related?.data?.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-bold text-primary">You may also like</h2>
          <ProductGrid products={related.data.slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
