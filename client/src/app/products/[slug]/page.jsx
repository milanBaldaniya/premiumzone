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
  if (!product) return { title: 'Product Not Found', robots: { index: false, follow: false } };

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const image = product.thumbnail?.url || product.gallery?.[0]?.url;
  const url = `${SITE_URL}/products/${slug}`;
  const title = product.seo?.metaTitle || `${product.name} — ₹${Number(price).toLocaleString('en-IN')}`;
  const description =
    product.seo?.metaDescription ||
    product.shortDescription ||
    product.description?.slice(0, 160) ||
    `${product.name} — available now at Premium Product Zone.`;
  const inStock = (product.stock ?? 0) > 0;

  return {
    title,
    description,
    keywords: product.seo?.metaKeywords?.length ? product.seo.metaKeywords : product.tags,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Premium Product Zone',
      type: 'website',
      locale: 'en_IN',
      images: image ? [{ url: image, width: 1000, height: 1000, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      'product:price:amount': String(price),
      'product:price:currency': product.currency || 'INR',
      'product:availability': inStock ? 'in stock' : 'out of stock',
      'product:brand': product.brand?.name || 'Premium Product Zone',
    },
  };
}

function ProductJsonLd({ product, slug }) {
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const image = product.thumbnail?.url || product.gallery?.[0]?.url;
  const url = `${SITE_URL}/products/${slug}`;
  const inStock = (product.stock ?? 0) > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description?.slice(0, 300),
    image: [product.thumbnail?.url, ...(product.gallery?.map((g) => g.url) || [])].filter(Boolean),
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand?.name || 'Premium Product Zone' },
    ...(product.ratingsCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingsAverage,
            reviewCount: product.ratingsCount,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: product.currency || 'INR',
      price: String(price),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      image,
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  return (
    <>
      {product && <ProductJsonLd product={product} slug={slug} />}
      <ProductDetailClient slug={slug} />
    </>
  );
}
