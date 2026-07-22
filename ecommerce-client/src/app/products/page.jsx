'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductGrid, { ProductGridSkeleton } from '@/components/product/ProductGrid';
import { useGetProductsQuery, useGetBrandsQuery } from '@/store/api/catalogApi';

const SORTS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratingsAverage' },
];

// Home/nav links use ?featured=true etc. — map them to the real product fields.
const FLAG_MAP = {
  featured: 'isFeatured',
  trending: 'isTrending',
  newArrival: 'isNewArrival',
  bestSeller: 'isBestSeller',
};

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const qs = searchParams.toString();

  // ── URL is the single source of truth for every filter ──
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  // Max price is typed, so keep a local mirror and debounce it into the URL.
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  useEffect(() => setMaxPrice(urlMaxPrice), [urlMaxPrice]);

  const setParams = (updates, { resetPage = true } = {}) => {
    const params = new URLSearchParams(qs);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v == null) params.delete(k);
      else params.set(k, String(v));
    });
    if (resetPage) params.delete('page');
    const str = params.toString();
    router.push(str ? `${pathname}?${str}` : pathname);
  };

  useEffect(() => {
    if (maxPrice === urlMaxPrice) return;
    const t = setTimeout(() => setParams({ maxPrice }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPrice]);

  // Boolean flag filters from home/nav links
  const flagFilters = {};
  Object.entries(FLAG_MAP).forEach(([q, field]) => {
    if (searchParams.get(q) === 'true') flagFilters[field] = true;
  });

  const { data: brandsData } = useGetBrandsQuery({ limit: 50 });
  const { data, isFetching } = useGetProductsQuery({
    search: search || undefined,
    sort,
    brand: brand || undefined,
    'price[lte]': urlMaxPrice || undefined,
    page,
    limit: 12,
    ...flagFilters,
  });

  const products = data?.data || [];
  const meta = data?.meta;
  const hasFilters = search || brand || urlMaxPrice || Object.keys(flagFilters).length;

  return (
    <div className="container-luxe py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-primary">
          {search ? `Results for "${search}"` : 'All Products'}
        </h1>
        {meta && <p className="mt-1 text-sm text-slate-500">{meta.total} products</p>}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className="h-fit space-y-6 rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          {search && (
            <div className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2 text-sm">
              <span className="truncate font-medium text-accent-dark">“{search}”</span>
              <button
                onClick={() => setParams({ search: '' })}
                className="ml-2 shrink-0 text-xs text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold text-primary">Brand</h3>
            <select
              value={brand}
              onChange={(e) => setParams({ brand: e.target.value })}
              className="input-luxe py-2 text-sm"
            >
              <option value="">All Brands</option>
              {brandsData?.data?.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold text-primary">Max Price</h3>
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              className="input-luxe py-2 text-sm"
            />
          </div>

          {hasFilters ? (
            <button
              onClick={() => router.push(pathname)}
              className="text-xs font-medium text-accent-dark hover:underline"
            >
              Clear all filters
            </button>
          ) : null}
        </aside>

        {/* Results */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {isFetching ? 'Loading…' : `Page ${meta?.page || 1} of ${meta?.totalPages || 1}`}
            </span>
            <select
              value={sort}
              onChange={(e) => setParams({ sort: e.target.value })}
              className="input-luxe w-auto py-2 text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {isFetching ? <ProductGridSkeleton count={12} /> : <ProductGrid products={products} />}

          {meta && meta.totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <button
                disabled={!meta.hasPrev}
                onClick={() => setParams({ page: page - 1 }, { resetPage: false })}
                className="btn-outline px-4 py-2 text-sm"
              >
                Previous
              </button>
              <span className="grid place-items-center px-4 text-sm font-medium">
                {meta.page} / {meta.totalPages}
              </span>
              <button
                disabled={!meta.hasNext}
                onClick={() => setParams({ page: page + 1 }, { resetPage: false })}
                className="btn-outline px-4 py-2 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container-luxe py-10"><ProductGridSkeleton count={12} /></div>}>
      <CatalogContent />
    </Suspense>
  );
}
