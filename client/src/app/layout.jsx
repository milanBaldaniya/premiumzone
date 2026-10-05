import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Providers from '@/store/Providers';
import AuthBootstrap from '@/components/auth/AuthBootstrap';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Premium Product Zone — Precision. Prestige. Perfection.',
    template: '%s | Premium Product Zone',
  },
  description:
    'Discover luxury watches and premium gadgets from Rolex, Apple, Samsung, Nothing and more. Elegant, curated, and crafted for those who value time.',
  keywords: ['luxury watches', 'premium gadgets', 'rolex', 'apple watch', 'smartwatch'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'Premium Product Zone',
    description: 'Luxury watches & premium gadgets.',
    url: SITE_URL,
    siteName: 'Premium Product Zone',
    images: [{ url: '/logo-full.png', width: 800, height: 1021, alt: 'Premium Product Zone' }],
  },
  twitter: { card: 'summary_large_image' },
};

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Premium Product Zone',
  url: SITE_URL,
  logo: `${SITE_URL}/logo-full.png`,
  email: 'premiumproductszone353@gmail.com',
  telephone: '+91 82388 00920',
  address: { '@type': 'PostalAddress', addressLocality: 'Surat', addressRegion: 'Gujarat', addressCountry: 'IN' },
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Premium Product Zone',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/products?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }} />
        <Providers>
          <AuthBootstrap />
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
