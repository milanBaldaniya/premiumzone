'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export { Field } from './Field';

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-luxe relative grid min-h-[70vh] place-items-center overflow-hidden py-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-luxe"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary font-display text-2xl font-bold text-accent shadow-gold">
            P
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-primary">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
