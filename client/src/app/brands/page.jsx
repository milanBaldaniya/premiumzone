'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useGetBrandsQuery } from '@/store/api/catalogApi';

export default function BrandsPage() {
  const { data, isLoading } = useGetBrandsQuery({ limit: 100, sort: 'sortOrder' });
  const brands = data?.data || [];

  return (
    <div className="container-luxe py-10">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">Our Partners</p>
        <h1 className="font-display text-4xl font-bold text-primary">Shop by Brand</h1>
        <p className="mt-3 text-slate-500">Explore the world&apos;s most prestigious names in horology and technology.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/products?brand=${brand._id}`}
                className="card-luxe flex h-40 flex-col items-center justify-center gap-3 p-6 hover:shadow-luxe"
              >
                {brand.logo?.url ? (
                  <div className="relative h-16 w-full">
                    <Image src={brand.logo.url} alt={brand.name} fill className="object-contain" />
                  </div>
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-xl font-bold text-accent">
                    {brand.name[0]}
                  </span>
                )}
                <span className="font-display text-lg font-semibold text-primary">{brand.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
