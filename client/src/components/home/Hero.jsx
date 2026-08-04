'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowRight, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useGetActiveBannersQuery } from '@/store/api/catalogApi';

const AUTOPLAY_MS = 6000;

const FALLBACK_SLIDE = {
  _id: 'fallback',
  title: 'Precision. Prestige. Perfection.',
  subtitle: 'Discover an exquisite collection of luxury watches and premium gadgets, curated for the discerning individual.',
  ctaText: 'Explore Collection',
  ctaLink: '/products',
  image: null,
};

export default function Hero() {
  const { data, isLoading } = useGetActiveBannersQuery('hero');
  const slides = data?.data?.length ? data.data : isLoading ? [] : [FALLBACK_SLIDE];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((i, len) => {
    const n = len ?? slides.length;
    setActive(((i % n) + n) % n);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length, paused]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [slides.length, active]);

  if (!slides.length) {
    return <div className="h-[560px] w-full animate-pulse bg-dark-gradient sm:h-[620px] lg:h-[86vh] lg:max-h-[720px]" />;
  }

  const slide = slides[active] || slides[0];
  const hasImage = Boolean(slide.image?.url);

  return (
    <section
      className="relative h-[560px] w-full overflow-hidden bg-primary-950 sm:h-[620px] lg:h-[86vh] lg:max-h-[720px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={slide._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {hasImage ? (
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image.url}
                alt={slide.title}
                fill
                priority={active === 0}
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-dark-gradient">
              <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
            </div>
          )}
          {/* Scrim for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/95 via-primary-950/45 to-primary-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-950/80 via-primary-950/10 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container-luxe relative flex h-full items-end pb-16 sm:items-center sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <span className="mb-4 inline-block w-fit rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              New Collection 2026
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl text-balance">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">
                {slide.subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={slide.ctaLink || '/products'} className="btn-gold">
                {slide.ctaText || 'Shop Now'} <FaArrowRight size={14} />
              </Link>
              <Link
                href="/brands"
                className="btn border border-white/20 text-white hover:border-accent hover:text-accent"
              >
                View Brands
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => goTo(active - 1)}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:border-accent hover:text-accent sm:flex"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => goTo(active + 1)}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:border-accent hover:text-accent sm:flex"
          >
            <FaChevronRight size={14} />
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-8">
            {slides.map((s, i) => (
              <button
                key={s._id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-8 bg-accent' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
