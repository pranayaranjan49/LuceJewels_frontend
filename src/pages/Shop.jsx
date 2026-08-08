import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineFilter, HiOutlineX } from 'react-icons/hi';
import { getProducts, getCategories } from '../api/endpoints';
import ProductCard from '../components/shop/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-ratingAvg', label: 'Top Rated' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [meta, setMeta] = useState({ total: 0, pages: 1, page: 1 });

  const categorySlug = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  // Category is carried in the URL as a human-readable slug; resolve it to the
  // Mongo _id the backend actually filters on once categories have loaded.
  const fetchProducts = useCallback(() => {
    if (categorySlug && categories.length === 0) return; // wait for categories so filter isn't dropped
    setLoading(true);
    const params = { sort, page, limit: 12 };
    if (categorySlug) {
      const match = categories.find((c) => c.slug === categorySlug);
      if (match) params.category = match._id;
    }
    if (search) params.search = search;

    getProducts(params)
      .then((res) => {
        setProducts(res.data.data);
        setMeta({ total: res.data.total, pages: res.data.pages, page: res.data.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categorySlug, categories, search, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <div className="mb-10">
        <p className="eyebrow">Collection</p>
        <h1 className="mt-2 font-display text-4xl text-ink-primary">All Jewellery</h1>
        <p className="mt-2 text-sm text-ink-inverse">{meta.total} pieces</p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search jewellery..."
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.currentTarget.value)}
          className="input-field max-w-xs"
        />

        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="btn-secondary text-sm lg:hidden"
        >
          <HiOutlineFilter /> Filters
        </button>

        <div className="hidden lg:flex flex-wrap gap-2">
          <button
            onClick={() => updateParam('category', '')}
            className={`rounded-sm px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
              !categorySlug ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary hover:border-gold-400'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParam('category', c.slug)}
              className={`rounded-sm px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
                categorySlug === c.slug ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary hover:border-gold-400'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="input-field ml-auto max-w-[200px]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {filtersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 flex flex-wrap gap-2 lg:hidden"
        >
          <button onClick={() => updateParam('category', '')} className={`rounded-sm px-4 py-2 text-xs ${!categorySlug ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary'}`}>
            All
          </button>
          {categories.map((c) => (
            <button key={c._id} onClick={() => updateParam('category', c.slug)} className={`rounded-sm px-4 py-2 text-xs ${categorySlug === c.slug ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary'}`}>
              {c.name}
            </button>
          ))}
        </motion.div>
      )}

      {!loading && products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-display text-2xl text-ink-primary">No pieces match yet.</p>
          <p className="mt-2 text-sm text-ink-inverse">Try a different category or clear your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? Array.from({ length: 12 }) : products).map((p, i) =>
            p ? <ProductCard key={p._id} product={p} index={i} /> : <ProductCardSkeleton key={i} />
          )}
        </div>
      )}

      {meta.pages > 1 && (
        <div className="mt-16 flex justify-center gap-2">
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParam('page', String(p))}
              className={`h-10 w-10 rounded-full text-sm transition-colors ${
                p === meta.page ? 'bg-gold-400 text-ink-primary' : 'text-ink-secondary hover:bg-surface-muted'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
