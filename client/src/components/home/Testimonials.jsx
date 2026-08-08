'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';
import { useGetTopReviewsQuery } from '@/store/api/catalogApi';
import Rating from '@/components/ui/Rating';

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

export default function Testimonials() {
  const { data, isLoading } = useGetTopReviewsQuery(6);
  const reviews = data?.data || [];

  if (!isLoading && reviews.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-dark-gradient py-20">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-luxe relative">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Testimonials</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">What Our Customers Say</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
            Real experiences from collectors and enthusiasts who trust Premium Zone.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-56 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {reviews.map((r) => (
              <motion.div
                key={r._id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-accent/30 hover:bg-white/[0.06]"
              >
                <FaQuoteLeft className="text-2xl text-accent/25 transition-colors duration-300 group-hover:text-accent/40" />

                <div className="mt-3">
                  <Rating value={r.rating} size="text-xs" />
                </div>

                {r.title && <p className="mt-3 font-semibold text-white">{r.title}</p>}
                <p className="mt-1.5 line-clamp-4 flex-1 text-sm leading-relaxed text-slate-300">{r.comment}</p>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-gradient font-display text-xs font-bold text-primary">
                      {initials(r.user?.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-medium text-white">
                        {r.user?.name || 'Anonymous'}
                        {r.isVerifiedPurchase && <FaCheckCircle className="shrink-0 text-accent" size={11} />}
                      </p>
                    </div>
                  </div>

                  {r.product?.slug && (
                    <Link
                      href={`/products/${r.product.slug}`}
                      className="flex shrink-0 items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-3 text-xs text-slate-300 transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      {r.product.thumbnail?.url && (
                        <span className="relative h-6 w-6 overflow-hidden rounded-full">
                          <Image src={r.product.thumbnail.url} alt="" fill sizes="24px" className="object-cover" />
                        </span>
                      )}
                      <span className="max-w-[7rem] truncate">{r.product.name}</span>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
