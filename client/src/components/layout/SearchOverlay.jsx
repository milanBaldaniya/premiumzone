'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SUGGESTED_TERMS = [
  { label: "Men's Watches", href: '/products?gender=men' },
  { label: "Women's Watches", href: '/products?gender=women' },
  { label: 'Rolex', href: '/products?search=Rolex' },
  { label: 'Apple Watch', href: '/products?search=Apple+Watch' },
  { label: 'AirPods', href: '/products?search=AirPods' },
  { label: 'Best Sellers', href: '/products?bestSeller=true' },
];

export default function SearchOverlay({ onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const go = (href) => {
    router.push(href);
    onClose();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    go(`/products?search=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="fixed inset-x-0 bottom-0 top-16 z-40 bg-primary-950/40 backdrop-blur-sm"
      />
      <div className="fixed inset-x-0 top-16 z-50 animate-fade-up border-b border-slate-200/70 bg-white shadow-luxe">
        <div className="container-luxe py-6">
          <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <FaSearch className="shrink-0 text-slate-400" size={16} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for watches, gadgets & more..."
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="shrink-0 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <FaTimes size={16} />
            </button>
          </form>

          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Suggested Search Terms
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {SUGGESTED_TERMS.map((term) => (
              <button
                key={term.label}
                type="button"
                onClick={() => go(term.href)}
                className="text-sm font-medium text-slate-600 transition hover:text-accent-dark"
              >
                {term.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
