import Link from 'next/link';
import { FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Luxury Watches', href: '/products?category=watches' },
      { label: 'Smart Gadgets', href: '/products?category=gadgets' },
      { label: 'Brands', href: '/brands' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping', href: '/shipping' },
      { label: 'Track Order', href: '/account/orders' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-dark-gradient text-slate-300">
      <div className="container-luxe grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent font-display text-xl font-bold text-primary">
              P
            </span>
            <span className="font-display text-2xl font-bold text-white">Premium Zone</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Precision. Prestige. Perfection. Curated luxury watches and premium gadgets for those
            who value the art of time.
          </p>
          <div className="mt-6 flex gap-3">
            {[FaInstagram, FaFacebook, FaTwitter, FaYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-slate-300 transition hover:border-accent hover:text-accent"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-accent">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Premium Zone. All rights reserved.</p>
          <p>Cash on Delivery available · Stripe · Razorpay · PayPal coming soon</p>
        </div>
      </div>
    </footer>
  );
}
