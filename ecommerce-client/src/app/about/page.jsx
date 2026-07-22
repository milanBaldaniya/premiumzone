import Link from 'next/link';
import { FaGem, FaShieldAlt, FaGlobe, FaHeart } from 'react-icons/fa';
import PageHero from '@/components/layout/PageHero';

export const metadata = {
  title: 'About Us',
  description: 'The story behind Premium Products Zone — curators of luxury watches and premium gadgets.',
};

const VALUES = [
  { icon: FaGem, title: 'Curated Excellence', desc: 'Every piece is hand-selected for craftsmanship, heritage and design.' },
  { icon: FaShieldAlt, title: 'Guaranteed Authentic', desc: '100% genuine products, sourced directly from authorized partners.' },
  { icon: FaGlobe, title: 'Global Delivery', desc: 'Secure, insured shipping to collectors around the world.' },
  { icon: FaHeart, title: 'Concierge Service', desc: 'A dedicated team devoted to an effortless, personal experience.' },
];

const STATS = [
  ['2015', 'Founded'],
  ['50+', 'Luxury Brands'],
  ['120K+', 'Happy Clients'],
  ['40+', 'Countries Served'],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="Crafted for Those Who Value Time"
        subtitle="Premium Products Zone was born from a passion for horological artistry and cutting-edge technology."
      />

      <section className="container-luxe py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-center text-slate-600">
          <p className="text-lg leading-relaxed">
            Since 2015, we have curated an exceptional collection of the world&apos;s finest timepieces
            and premium gadgets. From the timeless precision of Swiss watchmaking to the innovation of
            modern wearables, every item in our catalog represents the pinnacle of its craft.
          </p>
          <p className="leading-relaxed">
            We believe luxury is not just about owning something rare — it&apos;s about the experience,
            the story, and the confidence that comes with authenticity. That philosophy guides
            everything we do.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-200/70 bg-white">
        <div className="container-luxe grid grid-cols-2 gap-8 py-12 lg:grid-cols-4">
          {STATS.map(([stat, label]) => (
            <div key={label} className="text-center">
              <p className="font-display text-4xl font-bold text-primary">{stat}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="container-luxe py-16">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent-dark">What We Stand For</p>
          <h2 className="font-display text-3xl font-bold text-primary">Our Values</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="card-luxe p-6 text-center">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent-dark">
                <v.icon size={22} />
              </span>
              <h3 className="font-display text-lg font-bold text-primary">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-luxe pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-dark-gradient px-8 py-14 text-center">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-accent/20 blur-3xl" />
          <h2 className="font-display text-3xl font-bold text-white">Begin Your Collection</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-300">
            Explore our curated selection and find a piece that speaks to you.
          </p>
          <Link href="/products" className="btn-gold mt-6">
            Explore Collection
          </Link>
        </div>
      </section>
    </>
  );
}
