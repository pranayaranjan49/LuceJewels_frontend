import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingBag, HiOutlineShieldCheck, HiOutlineTruck } from 'react-icons/hi';
import { getProduct } from '../api/endpoints';
import Price from '../components/ui/Price';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then((res) => setProduct(res.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    setActiveImg(0);
    setQty(1);
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-6 py-24 text-center text-ink-inverse">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink-primary">Piece not found</p>
        <Link to="/shop" className="btn-secondary mt-6 inline-flex">Back to shop</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop' }];

  const handleBuyNow = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
    addItem(product, qty);
    navigate('/cart');
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-xs bg-surface-muted">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={images[activeImg].url}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xs border transition-colors ${
                    activeImg === i ? 'border-gold-400' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="eyebrow">{product.category?.name}</p>
          <h1 className="mt-2 font-display text-4xl text-ink-primary">{product.name}</h1>
          <div className="mt-4">
            <Price price={product.price} discountPrice={product.discountPrice} size="lg" />
          </div>

          <p className="mt-6 leading-relaxed text-ink-secondary">{product.description}</p>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-surface-strong/30 pt-6">
            {product.material && <Spec label="Material" value={product.material} />}
            {product.purity && <Spec label="Purity" value={product.purity} />}
            {product.weight > 0 && <Spec label="Weight" value={`${product.weight}g`} />}
            {product.gemstone && <Spec label="Gemstone" value={product.gemstone} />}
            <Spec label="Availability" value={product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'} />
            {product.sku && <Spec label="SKU" value={product.sku} />}
          </div>

          {product.stock > 0 ? (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-sm border border-ink-primary/20">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-ink-secondary hover:text-gold-300">−</button>
                <span className="w-10 text-center text-ink-primary">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-4 py-2.5 text-ink-secondary hover:text-gold-300">+</button>
              </div>
              <button onClick={() => addItem(product, qty)} className="btn-secondary flex-1">
                <HiOutlineShoppingBag /> Add to Cart
              </button>
            </div>
          ) : (
            <p className="mt-8 text-sm text-ink-inverse">This piece is currently out of stock.</p>
          )}

          <div className="mt-4 flex gap-4">
            <button onClick={handleBuyNow} disabled={product.stock <= 0} className="btn-primary flex-1">
              Buy Now
            </button>
            <button aria-label="Add to wishlist" className="btn-ghost border border-ink-primary/20 rounded-sm px-4">
              <HiOutlineHeart size={20} />
            </button>
          </div>

          <div className="mt-10 space-y-4 border-t border-surface-strong/30 pt-6">
            <div className="flex items-center gap-3 text-sm text-ink-secondary">
              <HiOutlineShieldCheck className="text-gold-300" size={20} /> BIS Hallmarked & certified authenticity
            </div>
            <div className="flex items-center gap-3 text-sm text-ink-secondary">
              <HiOutlineTruck className="text-gold-300" size={20} /> Free insured shipping, delivered in 5-7 days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-inverse">{label}</p>
      <p className="mt-1 text-sm text-ink-primary">{value}</p>
    </div>
  );
}
