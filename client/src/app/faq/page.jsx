'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaChevronDown } from 'react-icons/fa';
import PageHero from '@/components/layout/PageHero';

const FAQS = [
  {
    q: 'Are all your products authentic?',
    a: 'Absolutely. Every item is 100% genuine and sourced directly from authorized partners and brands. Each purchase includes official documentation and warranty where applicable.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently offer Cash on Delivery. Stripe, Razorpay and PayPal are being integrated and will be available soon for secure online payments.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Orders are processed within 1–2 business days. Standard delivery takes 3–7 business days depending on your location. Free shipping applies to orders over $500.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day return policy on eligible items in their original, unworn condition with all packaging and documentation. Contact our concierge to initiate a return.',
  },
  {
    q: 'Do you offer international shipping?',
    a: 'Yes — we ship to over 40 countries with secure, insured delivery. Customs duties and taxes may apply based on your destination.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you can track it from your account under "Orders". You will also receive email updates at each stage of delivery.',
  },
  {
    q: 'Is my personal information secure?',
    a: 'Yes. We use industry-standard encryption, secure cookies and never store sensitive payment details. Read our Privacy Policy for full details.',
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
        subtitle="Everything you need to know about shopping with Premium Zone."
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
