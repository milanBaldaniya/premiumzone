'use client';

import { useEffect, useRef, useState } from 'react';
import { FaCheck, FaChevronDown } from 'react-icons/fa';
import { cn } from '@/lib/utils';

/**
 * Brand-styled dropdown to replace native <select>, whose open-list styling
 * can't be themed cross-browser.
 */
export default function Select({ value, onChange, options, placeholder = 'Select…', className }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'input-luxe flex w-full items-center justify-between gap-2 py-2 text-left text-sm',
          open && 'border-accent ring-2 ring-accent/20'
        )}
      >
        <span className={selected ? 'text-ink' : 'text-slate-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <FaChevronDown
          size={11}
          className={cn('shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180 text-accent')}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-2 max-h-64 w-full min-w-max overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-luxe"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition',
                    isSelected
                      ? 'bg-primary text-white'
                      : 'text-slate-600 hover:bg-accent/10 hover:text-accent-dark'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <FaCheck size={11} className="shrink-0 text-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
