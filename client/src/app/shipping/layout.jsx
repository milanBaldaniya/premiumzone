export const metadata = {
  title: 'Track Your Order',
  description: 'Track your Premium Products Zone order using the tracking number (AWB) shared with you on WhatsApp.',
  alternates: { canonical: '/shipping' },
  openGraph: {
    title: 'Track Your Order | Premium Products Zone',
    description: 'Track your Premium Products Zone order using the tracking number (AWB) shared with you on WhatsApp.',
    url: '/shipping',
    type: 'website',
  },
};

export default function ShippingLayout({ children }) {
  return children;
}
