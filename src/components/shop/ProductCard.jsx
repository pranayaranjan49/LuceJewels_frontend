import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Price from '../ui/Price';

export default function ProductCard({ product, index = 0 }) {
  const img = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop';
  const outOfStock = product.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="relative overflow-hidden rounded-xs bg-surface-muted aspect-square">
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-normal group-hover:scale-110"
          />
          {product.discountPrice > 0 && (
            <span className="absolute top-4 left-4 rounded-sm bg-surface-strong/90 px-4 py-1.5 text-xs font-semibold text-ink-primary backdrop-blur-sm">
              OFFER
            </span>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-base/70">
              <span className="rounded-sm border border-ink-primary/30 px-5 py-2 text-xs uppercase tracking-widest text-ink-primary">
                Out of stock
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-ink-inverse">{product.category?.name}</p>
          <h3 className="mt-1 font-display text-lg text-ink-primary group-hover:text-gold-300 transition-colors duration-fast">
            {product.name}
          </h3>
          <div className="mt-2">
            <Price price={product.price} discountPrice={product.discountPrice} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
