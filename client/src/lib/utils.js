import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export const cn = (...inputs) => twMerge(clsx(inputs));

/** Formats a number as currency. */
export const formatPrice = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date));

/** Percentage discount from base/sale price. */
export const discountPercent = (price, discountPrice) => {
  if (!discountPrice || discountPrice <= 0 || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

/** Debounce helper for search inputs. */
export const debounce = (fn, delay = 350) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

export const truncate = (str = '', len = 80) =>
  str.length > len ? `${str.slice(0, len)}…` : str;

/**
 * Derives a Cloudinary auto-generated poster frame URL from a product video URL, so the
 * gallery can show a thumbnail without downloading/playing the video itself. Falls back to
 * `null` for non-Cloudinary URLs — callers should then fall back to a static placeholder.
 */
export const getVideoPosterUrl = (videoUrl) => {
  if (!videoUrl || !videoUrl.includes('/video/upload/')) return null;
  return videoUrl.replace('/video/upload/', '/video/upload/so_0/').replace(/\.\w+$/, '.jpg');
};
