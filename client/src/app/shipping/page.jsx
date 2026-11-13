'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaTruck, FaWhatsapp, FaCopy, FaCheck, FaBoxOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';
import PageHero from '@/components/layout/PageHero';
import { useGetPublicSettingsQuery } from '@/store/api/catalogApi';
import { buildWhatsappLink } from '@/lib/whatsapp';

const COURIERS = ['Delhivery', 'DTDC', 'Ecom Express', 'Xpressbees', 'Blue Dart', 'India Post', 'Shiprocket'];

export default function ShippingPage() {
  const { data: settingsData } = useGetPublicSettingsQuery();
  const whatsappNumber = settingsData?.data?.store?.whatsapp;
  const [awb, setAwb] = useState('');
  const [copied, setCopied] = useState(false);

  const trimmed = awb.trim();

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trimmed) return;
    // 17TRACK auto-detects the carrier from the AWB/tracking number format, so it works
    // regardless of which courier the seller actually shipped with.
    window.open(`https://www.17track.net/en/order-tracking?nums=${encodeURIComponent(trimmed)}`, '_blank', 'noopener,noreferrer');
  };

  const copyAwb = async () => {
    if (!trimmed) return;
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      toast.success('Tracking number copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — please copy it manually');
    }
  };

  const whatsappHref = buildWhatsappLink(whatsappNumber, "Hi! I'd like to get the tracking number for my order.");

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Track Your Order"
        subtitle="Enter the tracking number (AWB) shared with you on WhatsApp after your order ships."
      />

      <section className="container-luxe max-w-2xl py-16">
        <div className="card-luxe p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/10 text-accent-dark">
              <FaTruck size={18} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-primary">Enter Tracking Number</h2>
              <p className="text-sm text-slate-500">Also called AWB or consignment number</p>
            </div>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="e.g. 1234567890123"
              className="input-luxe flex-1"
              autoComplete="off"
            />
            <button type="submit" disabled={!trimmed} className="btn-gold shrink-0 disabled:cursor-not-allowed disabled:opacity-50">
              Track Shipment
            </button>
          </form>

          {trimmed && (
            <button
              type="button"
              onClick={copyAwb}
              className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-accent-dark"
            >
              {copied ? <FaCheck size={11} /> : <FaCopy size={11} />}
              {copied ? 'Copied' : 'Copy tracking number'}
            </button>
          )}

          <p className="mt-5 text-xs leading-relaxed text-slate-400">
            This opens a live tracking lookup in a new tab, which automatically detects the courier —{' '}
            {COURIERS.join(', ')} and more are all supported. If your tracking number isn&apos;t pre-filled there,
            just paste it in (use the copy button above).
          </p>
        </div>

        {/* No tracking number yet */}
        <div className="card-luxe mt-6 p-8 text-center">
          <FaWhatsapp className="mx-auto mb-3 text-3xl text-[#25D366]" />
          <h3 className="font-display text-lg font-bold text-primary">Don&apos;t have your tracking number yet?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Once your order ships, we send the AWB / tracking number directly on WhatsApp. If it&apos;s been a
            while and you haven&apos;t received it, message us and we&apos;ll share it right away.
          </p>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe5b]"
            >
              <FaWhatsapp size={16} /> Message Us on WhatsApp
            </a>
          ) : (
            <Link href="/contact" className="btn-gold mt-5 inline-flex">
              Contact Us
            </Link>
          )}
        </div>

        {/* Placed an online order */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <FaBoxOpen className="mt-0.5 shrink-0 text-accent-dark" size={16} />
          <p className="text-sm text-slate-600">
            Paid online at checkout instead? Sign in and track your order status directly from{' '}
            <Link href="/account/orders" className="font-medium text-accent-dark hover:underline">
              My Orders
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
