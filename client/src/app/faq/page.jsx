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
    a: 'You can order directly via WhatsApp — we\'ll confirm your order and payment details in chat — or choose Cash on Delivery at checkout.',
  },
  {
    q: 'How do I apply a discount coupon?',
    a: 'Enter your coupon code in the "Coupon code" field in your cart and click Apply — the discount is calculated automatically and carries through to checkout.',
  },
  {
    q: 'Where is my order?',
    a: 'You can track your order using the tracking link we send once it ships. You can also check your order status anytime from My Account → Orders.',
  },
  {
    q: 'How can I track my order?',
    a: 'Once your order is shipped, you\'ll receive a tracking link through email or WhatsApp. Use that link to view the latest shipment status.',
  },
  {
    q: 'How long will it take to receive my order?',
    a: 'Delivery time depends on your location and the courier service — orders are typically processed within 1–2 business days, with delivery in 3–7 business days. An estimated delivery date is shown at checkout and in your shipping confirmation. Free shipping applies to orders over ₹500.',
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes — Cash on Delivery is available for most products and locations. COD availability is confirmed automatically at checkout based on your delivery address.',
  },
  {
    q: 'Do you offer international shipping?',
    a: 'Yes — we ship to over 40 countries with secure, insured delivery. Customs duties and taxes may apply based on your destination.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'You can request a cancellation any time before your order is shipped, either from My Account → Orders or by contacting our concierge team. Once an order has shipped, cancellation may no longer be possible.',
  },
  {
    q: 'Can I change my delivery address after placing an order?',
    a: 'If your order hasn\'t shipped yet, contact our concierge team as soon as possible and we\'ll update the address for you. Address changes aren\'t possible once an order has shipped.',
  },
  {
    q: 'Why hasn\'t my tracking information been updated?',
    a: 'Tracking updates can sometimes take a little time to appear after a shipment is picked up or moved between courier facilities. Please allow some time for the next update before reaching out.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 30-day return policy on eligible items in their original, unworn condition with all packaging and documentation. Contact our concierge to initiate a return.',
  },
  {
    q: 'How can I contact you about my order?',
    a: 'Reach our concierge team at premiumproductszone353@gmail.com or +91 82388 00920, or use the form on our Contact page, and we\'ll get back to you as soon as possible.',
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
