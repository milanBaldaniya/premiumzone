'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useGetCategoriesQuery } from '@/store/api/catalogApi';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

export default function CategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery({ limit: 100, sort: 'sortOrder' });
  const categories = data?.data || [];

  return (
    <div className="container-luxe py-10">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">Browse</p>
        <h1 className="font-display text-4xl font-bold text-primary">Shop by Category</h1>
        <p className="mt-3 text-slate-500">Find exactly what you&apos;re looking for.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="py-16 text-center text-slate-400">No categories available yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/products?category=${cat._id}`}
                className="group relative block aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-soft transition-shadow hover:shadow-luxe"
              >
                <Image
                  src={cat.image?.url || PLACEHOLDER}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 font-display text-lg font-bold text-white">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
