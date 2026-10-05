export const metadata = {
  title: 'Shop All Products',
  description:
    'Browse our full collection of luxury watches and premium gadgets — authentic, curated, and ready to ship across India.',
  alternates: { canonical: '/products' },
  openGraph: {
    title: 'Shop All Products | Premium Product Zone',
    description:
      'Browse our full collection of luxury watches and premium gadgets — authentic, curated, and ready to ship across India.',
    url: '/products',
    type: 'website',
  },
};

export default function ProductsLayout({ children }) {
  return children;
}
