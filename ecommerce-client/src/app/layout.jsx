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
    default: 'Premium Products Zone — Precision. Prestige. Perfection.',
    template: '%s | Premium Products Zone',
  },
  description:
    'Discover luxury watches and premium gadgets from Rolex, Apple, Samsung, Nothing and more. Elegant, curated, and crafted for those who value time.',
  keywords: ['luxury watches', 'premium gadgets', 'rolex', 'apple watch', 'smartwatch'],
  openGraph: {
    type: 'website',
    title: 'Premium Products Zone',
    description: 'Luxury watches & premium gadgets.',
    url: SITE_URL,
    siteName: 'Premium Products Zone',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <AuthBootstrap />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
