import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../components/ui/Price';

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: '/checkout' } } });
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <h1 className="font-display text-3xl text-ink-primary">Your cart is empty</h1>
        <p className="mt-2 text-ink-inverse">Browse the collection and find something worth keeping.</p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Shop Jewellery</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 lg:px-10">
      <h1 className="font-display text-3xl text-ink-primary">Your Cart</h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-5 card-surface p-4"
              >
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200&auto=format&fit=crop'}
                  alt={item.name}
                  className="h-24 w-24 rounded-xs object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-display text-lg text-ink-primary">{item.name}</h3>
                  <p className="mt-1 text-gold-300">{formatINR(item.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center rounded-sm border border-ink-primary/20">
                      <button onClick={() => updateQuantity(item.product, item.quantity - 1)} className="px-3 py-1.5 text-ink-secondary">−</button>
                      <span className="w-8 text-center text-sm text-ink-primary">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product, item.quantity + 1)} className="px-3 py-1.5 text-ink-secondary">+</button>
                    </div>
                    <button onClick={() => removeItem(item.product)} className="text-ink-inverse hover:text-surface-strong" aria-label={`Remove ${item.name}`}>
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="card-surface h-fit p-7">
          <h2 className="font-display text-xl text-ink-primary">Order Summary</h2>
          <div className="mt-5 flex justify-between text-sm text-ink-secondary">
            <span>Subtotal</span>
            <span>{formatINR(total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-ink-secondary">
            <span>Shipping</span>
            <span className="text-gold-300">Free</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-surface-strong/30 pt-4 font-display text-lg text-ink-primary">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          <button onClick={handleCheckout} className="btn-primary mt-6 w-full">Checkout</button>
        </div>
      </div>
    </div>
  );
}
