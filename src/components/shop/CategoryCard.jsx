import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FALLBACK = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';

export default function CategoryCard({ category, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        to={`/shop?category=${category.slug}`}
        className="group relative block overflow-hidden rounded-lg aspect-[4/5] bg-surface-muted"
      >
        <img
          src={category.image?.url || FALLBACK}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-normal group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-7 text-center">
          <h3 className="font-display text-2xl text-ink-primary">{category.name}</h3>
          <span className="mt-1 inline-block text-xs uppercase tracking-[0.2em] text-gold-300 opacity-0 -translate-y-1 transition-all duration-fast group-hover:opacity-100 group-hover:translate-y-0">
            Explore
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
