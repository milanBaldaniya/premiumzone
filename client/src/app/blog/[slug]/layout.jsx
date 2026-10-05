const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function fetchBlog(slug) {
  try {
    const res = await fetch(`${API_URL}/blogs/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

// Server-rendered so link-preview crawlers (WhatsApp, iMessage, Slack, …) and search
// engines see the real article title/image instead of the generic site default.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);
  if (!blog) return { title: 'Article Not Found', robots: { index: false, follow: false } };

  const title = blog.seo?.metaTitle || blog.title;
  const description = blog.seo?.metaDescription || blog.excerpt || blog.title;
  const image = blog.coverImage?.url;
  const url = `${SITE_URL}/blog/${slug}`;

  return {
    title,
    description,
    keywords: blog.seo?.metaKeywords?.length ? blog.seo.metaKeywords : blog.tags,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Premium Product Zone',
      type: 'article',
      publishedTime: blog.publishedAt,
      modifiedTime: blog.updatedAt,
      tags: blog.tags,
      images: image ? [{ url: image, width: 1200, height: 630, alt: blog.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailLayout({ children, params }) {
  const { slug } = await params;
  const blog = await fetchBlog(slug);

  if (!blog) return children;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage?.url ? [blog.coverImage.url] : undefined,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt,
    author: { '@type': 'Organization', name: 'Premium Product Zone' },
    publisher: {
      '@type': 'Organization',
      name: 'Premium Product Zone',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-full.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
