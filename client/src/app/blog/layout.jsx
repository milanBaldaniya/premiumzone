export const metadata = {
  title: 'Blog',
  description: 'Stories, guides and insights on luxury watches and premium gadgets from Premium Product Zone.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Premium Product Zone',
    description: 'Stories, guides and insights on luxury watches and premium gadgets from Premium Product Zone.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }) {
  return children;
}
