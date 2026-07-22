'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-dark-gradient">
      {/* Ambient gold glow */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-luxe relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <span className="mb-4 w-fit rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            New Collection 2026
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Precision.
            <br />
            <span className="bg-gold-gradient bg-clip-text text-transparent">Prestige.</span>
            <br />
            Perfection.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-300">
            Discover an exquisite collection of luxury watches and premium gadgets, curated for the
            discerning individual.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/products" className="btn-gold">
              Explore Collection <FaArrowRight size={14} />
            </Link>
            <Link href="/brands" className="btn border border-white/20 text-white hover:border-accent hover:text-accent">
              View Brands
            </Link>
          </div>

          <div className="mt-12 flex gap-8">
            {[
              ['500+', 'Premium Products'],
              ['50+', 'Luxury Brands'],
              ['24/7', 'Concierge Support'],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-2xl font-bold text-accent">{stat}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative hidden items-center justify-center lg:flex"
        >
          <div className="relative grid h-80 w-80 place-items-center rounded-full border border-accent/20 xl:h-[26rem] xl:w-[26rem]">
            <div className="absolute inset-6 rounded-full border border-accent/10" />
            <div className="grid h-56 w-56 place-items-center rounded-full bg-gold-gradient shadow-gold xl:h-72 xl:w-72">
              <span className="font-display text-7xl font-bold text-primary xl:text-8xl">P</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
