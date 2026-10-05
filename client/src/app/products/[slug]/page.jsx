import ProductDetailClient from './ProductDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function fetchProduct(slug) {
  try {
    const res = await fetch(`${API_URL}/products/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch {
    return null;
  }
}

// Server-rendered so link-preview crawlers (WhatsApp, iMessage, Slack, …) — which
// don't execute JS — see the real product image/title instead of the generic default.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Product Not Found' };

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const image = product.thumbnail?.url || product.gallery?.[0]?.url;
  const title = `${product.name} — ₹${Number(price).toLocaleString('en-IN')}`;
  const description =
    product.shortDescription || product.description?.slice(0, 160) || `${product.name} — available now at Premium Product Zone.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${slug}`,
      siteName: 'Premium Product Zone',
      type: 'website',
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
