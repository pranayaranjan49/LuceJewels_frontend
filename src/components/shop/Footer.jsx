import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-surface-strong/30 bg-surface-muted/40 mt-32">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-2xl text-ink-primary">Luxe Jewels</h3>
            <p className="mt-3 text-sm text-ink-inverse leading-relaxed">
              Handcrafted gold, diamond and heirloom jewellery, made to be worn for generations.
            </p>
          </div>
          <div>
            <h4 className="eyebrow mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li><Link to="/shop" className="hover:text-gold-300">All Jewellery</Link></li>
              <li><Link to="/shop?category=rings" className="hover:text-gold-300">Rings</Link></li>
              <li><Link to="/shop?category=necklaces" className="hover:text-gold-300">Necklaces</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li><Link to="/login" className="hover:text-gold-300">Login / Register</Link></li>
              <li><Link to="/cart" className="hover:text-gold-300">My Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="eyebrow mb-4">Contact</h4>
            <p className="text-sm text-ink-secondary">jewellery@luxejewels.com</p>
            <p className="text-sm text-ink-secondary mt-1">+91 8260675755</p>
          </div>
        </div>
        <div className="mt-14 border-t border-surface-strong/20 pt-6 text-xs text-ink-inverse">
          © {new Date().getFullYear()} Luxe_Jewels. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
