'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import ProductGrid, { ProductGridSkeleton } from '@/components/product/ProductGrid';
import Select from '@/components/ui/Select';
import { catalogApi, useGetBrandsQuery } from '@/store/api/catalogApi';

const SORTS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratingsAverage' },
];

const GENDERS = [
  { label: 'All', value: '' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Unisex', value: 'unisex' },
];

// Home/nav links use ?featured=true etc. — map them to the real product fields.
const FLAG_MAP = {
  featured: 'isFeatured',
  trending: 'isTrending',
  newArrival: 'isNewArrival',
  bestSeller: 'isBestSeller',
};

const PAGE_SIZE = 12;

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const qs = searchParams.toString();

  // ── URL is the single source of truth for every filter ──
  const search = searchParams.get('search') || '';
  const brand = searchParams.get('brand') || '';
  const gender = searchParams.get('gender') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const urlMaxPrice = searchParams.get('maxPrice') || '';

  // Max price is typed, so keep a local mirror and debounce it into the URL.
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  useEffect(() => setMaxPrice(urlMaxPrice), [urlMaxPrice]);

  const setParams = (updates) => {
    const params = new URLSearchParams(qs);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === '' || v == null) params.delete(k);
      else params.set(k, String(v));
    });
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

  // ── Infinite loading ──
  // `page` is local (not in the URL) — each filter change starts a fresh page 1.
  // Fetches are dispatched imperatively (rather than reacting to a `useQuery`
  // hook's args changing) so appending page N to the list happens exactly
  // once, right when page N actually arrives — no dependence on effect/render
  // timing lining up with a hook's internal state transitions.
  const dispatch = useDispatch();
  const { data: brandsData } = useGetBrandsQuery({ limit: 50 });

  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isFetchingPage, setIsFetchingPage] = useState(false);
  const filterKey = JSON.stringify({ search, brand, gender, sort, urlMaxPrice, flagFilters });

  const loadPage = async (pageNum) => {
    setIsFetchingPage(true);
    try {
      const res = await dispatch(
        catalogApi.endpoints.getProducts.initiate({
          search: search || undefined,
          sort,
          brand: brand || undefined,
          gender: gender || undefined,
          'price[lte]': urlMaxPrice || undefined,
          page: pageNum,
          limit: PAGE_SIZE,
          ...flagFilters,
        })
      ).unwrap();
      setItems((prev) => (pageNum === 1 ? res.data : [...prev, ...res.data]));
      setMeta(res.meta);
      setPage(pageNum);
    } finally {
      setIsFetchingPage(false);
    }
  };

  // Filters changed — start over from page 1.
  useEffect(() => {
    setItems([]);
    setMeta(null);
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  // Load the next page once the sentinel scrolls near the viewport.
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingPage && meta?.hasNext) loadPage(page + 1);
      },
      { rootMargin: '600px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingPage, meta?.hasNext, page]);

  const hasFilters = search || brand || gender || urlMaxPrice || Object.keys(flagFilters).length;
  const isInitialLoading = isFetchingPage && page === 0;
  const isLoadingMore = isFetchingPage && page > 0;

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
            <h3 className="mb-3 font-sans text-sm font-semibold text-primary">Gender</h3>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setParams({ gender: g.value })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    gender === g.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 text-slate-600 hover:border-accent hover:text-accent-dark'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-sans text-sm font-semibold text-primary">Brand</h3>
            <Select
              value={brand}
              onChange={(v) => setParams({ brand: v })}
              placeholder="All Brands"
              options={[
                { label: 'All Brands', value: '' },
                ...(brandsData?.data?.map((b) => ({ label: b.name, value: b._id })) || []),
              ]}
            />
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
              {meta ? `Showing ${items.length} of ${meta.total}` : ' '}
            </span>
            <Select
              value={sort}
              onChange={(v) => setParams({ sort: v })}
              options={SORTS}
              className="w-48"
            />
          </div>

          {isInitialLoading ? <ProductGridSkeleton count={12} /> : <ProductGrid products={items} />}

          {!isInitialLoading && items.length > 0 && (
            <div ref={sentinelRef} className="mt-10">
              {isLoadingMore && (
                <div className="flex justify-center py-6">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                </div>
              )}
              {!meta?.hasNext && !isLoadingMore && (
                <p className="py-6 text-center text-sm text-slate-400">You&apos;ve reached the end</p>
              )}
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
