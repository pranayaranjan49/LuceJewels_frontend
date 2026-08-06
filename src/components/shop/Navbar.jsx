import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const links = [
  { to: '/shop', label: 'All Jewellery' },
  { to: '/shop?category=rings', label: 'Rings' },
  { to: '/shop?category=necklaces', label: 'Necklaces' },
  { to: '/shop?category=earrings', label: 'Earrings' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-normal ${
        scrolled ? 'bg-surface-base/90 backdrop-blur-md border-b border-surface-strong/30' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="font-display text-2xl tracking-wide text-ink-primary">
          Luxe Jewels
        </Link>

        <div className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors duration-fast hover:text-gold-300 ${
                  isActive ? 'text-gold-300' : 'text-ink-secondary'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <Link to="/shop" aria-label="Search jewellery" className="hidden sm:block text-ink-secondary hover:text-gold-300 transition-colors">
            <HiOutlineSearch size={20} />
          </Link>

          <Link to="/cart" aria-label="View cart" className="relative text-ink-secondary hover:text-gold-300 transition-colors">
            <HiOutlineShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-surface-base">
                {count}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin" className="text-xs uppercase tracking-wide text-gold-300 hover:underline">
                  Admin
                </Link>
              )}
              <span className="text-xs text-ink-inverse">Hi, {user.name?.split(' ')[0]}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs text-ink-secondary hover:text-gold-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" aria-label="Login" className="hidden sm:block text-ink-secondary hover:text-gold-300 transition-colors">
              <HiOutlineUser size={20} />
            </Link>
          )}

          <button
            className="lg:hidden text-ink-primary"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <HiOutlineX size={22} /> : <HiOutlineMenu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden border-t border-surface-strong/30 bg-surface-base"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-ink-secondary hover:text-gold-300 border-b border-surface-strong/20"
                >
                  {l.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-3 text-gold-300">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate('/');
                    }}
                    className="py-3 text-left text-ink-secondary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 text-gold-300">
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
