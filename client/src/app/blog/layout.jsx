export const metadata = {
  title: 'Blog',
  description: 'Stories, guides and insights on luxury watches and premium gadgets from Premium Products Zone.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Premium Products Zone',
    description: 'Stories, guides and insights on luxury watches and premium gadgets from Premium Products Zone.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }) {
  return children;
}
