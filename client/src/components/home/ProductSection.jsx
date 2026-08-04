import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import ProductGrid, { ProductGridSkeleton } from '@/components/product/ProductGrid';

export default function ProductSection({ title, subtitle, products, isLoading, viewAllHref }) {
  return (
    <section className="container-luxe py-14">
      <div className="mb-8 flex items-end justify-between">
        <div>
          {subtitle && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent-dark">
              {subtitle}
            </p>
          )}
          <h2 className="font-display text-3xl font-bold text-primary">{title}</h2>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-accent sm:flex"
          >
            View All <FaArrowRight size={12} />
          </Link>
        )}
      </div>
      {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={products} />}
    </section>
  );
}
