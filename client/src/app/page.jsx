'use client';

import Hero from '@/components/home/Hero';
import ProductSection from '@/components/home/ProductSection';
import Testimonials from '@/components/home/Testimonials';
import { useGetStorefrontSectionsQuery } from '@/store/api/catalogApi';
import { FaShippingFast, FaShieldAlt, FaGem, FaUndo } from 'react-icons/fa';

const PERKS = [
  { icon: FaShippingFast, title: 'Free Shipping', desc: 'On orders over ₹500' },
  { icon: FaShieldAlt, title: 'Authenticity Guaranteed', desc: '100% genuine products' },
  { icon: FaGem, title: 'Premium Quality', desc: 'Curated luxury selection' },
  { icon: FaUndo, title: 'Easy Returns', desc: '30-day return policy' },
];

export default function HomePage() {
  const { data, isLoading } = useGetStorefrontSectionsQuery();
  const sections = data?.data || {};

  return (
    <>
      <Hero />

      {/* Perks strip */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="container-luxe grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-dark">
                <perk.icon size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-primary">{perk.title}</p>
                <p className="text-xs text-slate-500">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ProductSection
        subtitle="Handpicked for you"
        title="Featured Collection"
        products={sections.featured}
        isLoading={isLoading}
        viewAllHref="/products?featured=true"
      />

      {/* Editorial banner */}
      <section className="container-luxe">
        <div className="relative overflow-hidden rounded-3xl bg-dark-gradient px-8 py-16 text-center lg:px-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Limited Edition</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl font-bold text-white">
            Timeless Craftsmanship Meets Modern Innovation
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-slate-300">
            Own a piece of horological excellence. Explore our most coveted timepieces.
          </p>
        </div>
      </section>

      <ProductSection
        subtitle="Most wanted"
        title="Trending Now"
        products={sections.trending}
        isLoading={isLoading}
        viewAllHref="/products?trending=true"
      />
      <ProductSection
        subtitle="Fresh arrivals"
        title="New Arrivals"
        products={sections.newArrivals}
        isLoading={isLoading}
        viewAllHref="/products?sort=-createdAt"
      />
      <ProductSection
        subtitle="Customer favorites"
        title="Best Sellers"
        products={sections.bestSellers}
        isLoading={isLoading}
        viewAllHref="/products?bestSeller=true"
      />

      <Testimonials />
    </>
  );
}
