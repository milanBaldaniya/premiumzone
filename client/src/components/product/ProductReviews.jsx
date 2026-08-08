'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaQuoteLeft } from 'react-icons/fa';
import { useGetProductReviewsQuery } from '@/store/api/catalogApi';
import Rating from '@/components/ui/Rating';
import { formatDate } from '@/lib/utils';

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export default function ProductReviews({ productId, ratingsAverage = 0, ratingsCount = 0 }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const { data, isFetching } = useGetProductReviewsQuery(
    { productId, limit: 50, sort: '-createdAt' },
    { skip: !productId }
  );

  const reviews = data?.data || [];
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    return { star, count, pct };
  });
  const visible = reviews.slice(0, visibleCount);

  return (
    <section className="mt-16">
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-dark">Testimonials</span>
        <h2 className="mt-1 font-display text-3xl font-bold text-primary">Customer Reviews</h2>
      </div>

      {isFetching ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-16 text-center">
          <FaQuoteLeft className="mx-auto mb-4 text-3xl text-accent/40" />
          <p className="font-display text-lg font-semibold text-primary">No reviews yet</p>
          <p className="mt-1 text-sm text-slate-500">Be the first to share your experience with this product.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Rating summary */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-fit overflow-hidden rounded-2xl bg-dark-gradient p-8 text-white shadow-luxe"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <p className="font-display text-5xl font-bold">{(ratingsAverage || 0).toFixed(1)}</p>
            <div className="mt-2">
              <Rating value={ratingsAverage} size="text-base" />
            </div>
            <p className="mt-1 text-sm text-white/60">
              Based on {ratingsCount} review{ratingsCount === 1 ? '' : 's'}
            </p>

            <div className="mt-6 space-y-2.5">
              {breakdown.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-white/70">{star}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.08 * (5 - star), ease: 'easeOut' }}
                      className="h-full rounded-full bg-gold-gradient"
                    />
                  </div>
                  <span className="w-6 text-right text-white/50">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Review cards */}
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid content-start gap-5 sm:grid-cols-2"
          >
            {visible.map((r) => (
              <motion.div
                key={r._id}
                variants={cardVariants}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition-shadow duration-300 hover:shadow-gold"
              >
                <FaQuoteLeft className="absolute right-5 top-5 text-2xl text-accent/10 transition-colors duration-300 group-hover:text-accent/25" />

                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-gradient font-display text-sm font-bold text-primary">
                    {initials(r.user?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                      <span className="truncate">{r.user?.name || 'Anonymous'}</span>
                      {r.isVerifiedPurchase && (
                        <FaCheckCircle className="shrink-0 text-accent-dark" size={12} title="Verified purchase" />
                      )}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <Rating value={r.rating} size="text-xs" />
                </div>

                {r.title && <p className="mt-3 font-semibold text-primary">{r.title}</p>}
                {r.comment && (
                  <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-slate-600">{r.comment}</p>
                )}

                {r.images?.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {r.images.slice(0, 4).map((img, i) => (
                      <div key={i} className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200">
                        <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {visibleCount < reviews.length && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + 6)}
            className="rounded-xl border border-accent-dark/30 px-6 py-2.5 text-sm font-semibold text-accent-dark transition-colors hover:bg-accent/10"
          >
            Load more reviews
          </button>
        </div>
      )}
    </section>
  );
}
