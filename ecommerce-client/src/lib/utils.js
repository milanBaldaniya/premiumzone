import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export const cn = (...inputs) => twMerge(clsx(inputs));

/** Formats a number as currency. */
export const formatPrice = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
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
