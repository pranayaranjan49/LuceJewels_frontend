import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { subscribe } from '../../api/endpoints';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await subscribe({ email, source: 'footer' });
      toast.success("You're on the list! Watch your inbox for offers.");
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not subscribe, try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-surface-strong/30 bg-surface-muted/40">
      {/* Newsletter strip */}
      <div className="border-b border-surface-strong/20">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h3 className="font-display text-2xl text-ink-primary">Get first access to new offers</h3>
              <p className="mt-1 text-sm text-ink-secondary">Join our list for exclusive drops and festive discounts.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" disabled={submitting} className="btn-primary whitespace-nowrap">
                {submitting ? 'Joining…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-2xl text-ink-primary">LUXE JEWELS</h3>
            <p className="mt-3 text-sm text-ink-inverse leading-relaxed">
              Handcrafted gold, diamond and heirloom jewellery, made to be worn for generations.
            </p>
          </div>
          <div>
            <h4 className="eyebrow mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li><Link to="/shop" className="hover:text-gold-500">All Jewellery</Link></li>
              <li><Link to="/shop?category=rings" className="hover:text-gold-500">Rings</Link></li>
              <li><Link to="/shop?category=necklaces" className="hover:text-gold-500">Necklaces</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li><Link to="/login" className="hover:text-gold-500">Login / Register</Link></li>
              <li><Link to="/cart" className="hover:text-gold-500">My Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-4">Contact</h4>
            <p className="text-sm text-ink-secondary">hello@luxejewels.dpdns.org</p>
            <p className="text-sm text-ink-secondary mt-1">+91 98765 43210</p>
          </div>
        </div>
        <div className="mt-14 border-t border-surface-strong/20 pt-6 text-xs text-ink-inverse">
          © {new Date().getFullYear()} Luxe Jewels. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
