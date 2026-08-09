'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaTimes, FaSearchPlus } from 'react-icons/fa';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%25" height="100%25" fill="%23e2e8f0"/></svg>';

export default function ProductGallery({ gallery, alt, discountPercent = 0 }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const frameRef = useRef(null);

  const images = gallery?.length ? gallery : [{ url: PLACEHOLDER }];
  const clamp = useCallback((i) => ((i % images.length) + images.length) % images.length, [images.length]);
  const goTo = useCallback((i) => setActive(clamp(i)), [clamp]);

  const handleMouseMove = (e) => {
    const rect = frameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const handleSwipeEnd = (_e, info) => {
    if (info.offset.x < -60 || info.velocity.x < -500) goTo(active + 1);
    else if (info.offset.x > 60 || info.velocity.x > 500) goTo(active - 1);
  };

  return (
    <div>
      <div
        ref={frameRef}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightboxOpen(true)}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={handleSwipeEnd}
          className="absolute inset-0"
        >
          <Image
            src={images[active]?.url || PLACEHOLDER}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="pointer-events-none object-cover transition-transform duration-200 ease-out"
            style={{ transformOrigin: origin, transform: zoomed ? 'scale(2)' : 'scale(1)' }}
            priority
          />
        </motion.div>

        {discountPercent > 0 && (
          <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-primary">
            -{discountPercent}%
          </span>
        )}
        <span className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white sm:flex">
          <FaSearchPlus size={11} /> Click to zoom
        </span>

        {images.length > 1 && (
          <>
            <button
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); goTo(active - 1); }}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-primary shadow-soft transition hover:bg-white sm:flex"
            >
              <FaChevronLeft size={12} />
            </button>
            <button
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); goTo(active + 1); }}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-primary shadow-soft transition hover:bg-white sm:flex"
            >
              <FaChevronRight size={12} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                active === i ? 'border-accent' : 'border-transparent'
              }`}
            >
              <Image src={img.url || PLACEHOLDER} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox images={images} alt={alt} index={active} onIndexChange={goTo} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function Lightbox({ images, alt, index, onIndexChange, onClose }) {
  const [zoomed, setZoomed] = useState(false);
  const clamp = useCallback((i) => ((i % images.length) + images.length) % images.length, [images.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onIndexChange(clamp(index - 1));
      if (e.key === 'ArrowRight') onIndexChange(clamp(index + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [index, clamp, onIndexChange, onClose]);

  const handleSwipeEnd = (_e, info) => {
    if (zoomed) return;
    if (info.offset.x < -80 || info.velocity.x < -500) onIndexChange(clamp(index + 1));
    else if (info.offset.x > 80 || info.velocity.x > 500) onIndexChange(clamp(index - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-sm font-medium text-white/70">
          {index + 1} / {images.length}
        </span>
        <button
          aria-label="Close"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <FaTimes size={16} />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={index}
            src={images[index]?.url || PLACEHOLDER}
            alt={alt}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: zoomed ? 2 : 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            drag={zoomed ? true : 'x'}
            dragConstraints={zoomed ? { left: -200, right: 200, top: -200, bottom: 200 } : { left: 0, right: 0 }}
            dragElastic={zoomed ? 0.2 : 0.6}
            onDragEnd={handleSwipeEnd}
            onDoubleClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
            onClick={(e) => e.stopPropagation()}
            className={`max-h-full max-w-full select-none rounded-lg object-contain ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          />
        </AnimatePresence>

        {images.length > 1 && !zoomed && (
          <>
            <button
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); onIndexChange(clamp(index - 1)); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:left-6"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); onIndexChange(clamp(index + 1)); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 sm:right-6"
            >
              <FaChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 pb-6">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onIndexChange(i); }}
              aria-label={`Go to image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-accent' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}

      <p className="pointer-events-none pb-3 text-center text-xs text-white/40 sm:hidden">Swipe to browse · Double-tap to zoom</p>
    </motion.div>
  );
}
