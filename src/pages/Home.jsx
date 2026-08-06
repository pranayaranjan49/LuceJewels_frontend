import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCategories, getProducts } from '../api/endpoints';
import CategoryCard from '../components/shop/CategoryCard';
import ProductCard from '../components/shop/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

const HERO_IMG = 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1600&auto=format&fit=crop';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getCategories(), getProducts({ limit: 8, sort: '-createdAt' })])
      .then(([catRes, prodRes]) => {
        if (!mounted) return;
        setCategories(catRes.data.data);
        setFeatured(prodRes.data.data);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <motion.img
          src={HERO_IMG}
          alt="Model wearing fine gold jewellery"
          initial={{ scale: 1.15, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/40 to-surface-base/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="eyebrow"
          >
            The 2026 Heirloom Edit
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-ink-primary sm:text-[56px]"
          >
            Jewellery worth passing down.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-5 max-w-md text-ink-secondary"
          >
            Every piece is hand-finished in 22K gold and certified stones — designed to be worn today, and inherited tomorrow.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-9 flex gap-4"
          >
            <Link to="/shop" className="btn-primary">Shop the Edit</Link>
            <Link to="/shop?category=rings" className="btn-secondary">View Rings</Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="mt-2 font-display text-3xl text-ink-primary">Every occasion, one house.</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {(loading ? Array.from({ length: 6 }) : categories).map((cat, i) =>
            cat ? (
              <CategoryCard key={cat._id} category={cat} index={i} />
            ) : (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-surface-muted" />
            )
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="eyebrow">New arrivals</p>
            <h2 className="mt-2 font-display text-3xl text-ink-primary">Freshly crafted, this week.</h2>
          </div>
          <Link to="/shop" className="btn-ghost text-sm">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? Array.from({ length: 8 }) : featured).map((p, i) =>
            p ? <ProductCard key={p._id} product={p} index={i} /> : <ProductCardSkeleton key={i} />
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-surface-strong/30 bg-surface-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-14 sm:grid-cols-3 lg:px-10">
          {[
            ['BIS Hallmarked', 'Every gold piece certified for purity.'],
            ['Lifetime Exchange', 'Trade up your gold, anytime.'],
            ['Free Insured Shipping', 'Delivered safely, fully insured.'],
          ].map(([title, desc]) => (
            <div key={title}>
              <h3 className="font-display text-xl text-gold-300">{title}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
