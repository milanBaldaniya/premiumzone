'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown } from 'react-icons/fa';
import PageHero from '@/components/layout/PageHero';

const FAQS = [
  {
    q: 'Where is my order?',
    a: 'You can track your order using the tracking link provided after your order has been shipped. You can also check your order status from the My Orders section.',
  },
  {
    q: 'How can I track my order?',
    a: 'Once your order is shipped, you will receive a tracking link through the available communication channels. Use the tracking link to view the latest shipment status.',
  },
  {
    q: 'How long will it take to receive my order?',
    a: 'Delivery time depends on your location, the seller\'s processing time, and the courier service. The estimated delivery date is usually shown during checkout or after your order is shipped.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes, Cash on Delivery may be available for selected products and locations. COD availability can be checked during checkout.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'You can request cancellation before the order is shipped. Once the order has been shipped, cancellation may not be possible. Please contact the store as soon as possible if you want to cancel your order.',
  },
  {
    q: 'Can I change my delivery address after placing an order?',
    a: 'If your order has not been shipped, you may be able to request an address change. Please contact the store as soon as possible. Address changes may not be possible after shipment.',
  },
  {
    q: 'How can I contact you about my order?',
    a: 'For questions about your order, please contact the store using the support/contact details provided on this website.',
  },
  {
    q: 'Why hasn\'t my tracking information been updated?',
    a: 'Tracking updates can sometimes take time to appear after a shipment is picked up or moved between courier facilities. Please allow some time for the next tracking update.',
  },
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="card-luxe overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-medium text-primary">{q}</span>
        <FaChevronDown
          className={`shrink-0 text-accent-dark transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          size={14}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about shopping with Premium Product Zone."
      />

      <section className="container-luxe max-w-3xl py-16">
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              {...faq}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h2 className="font-display text-xl font-bold text-primary">Still have questions?</h2>
          <p className="mt-2 text-sm text-slate-500">Our concierge team is happy to help.</p>
          <Link href="/contact" className="btn-gold mt-5">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
