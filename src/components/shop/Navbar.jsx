import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineSearch, HiOutlineChatAlt2 } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useChatNotifications } from '../../context/ChatNotificationsContext';

const links = [
  { to: '/shop', label: 'All Jewellery' },
  { to: '/shop?category=rings', label: 'Rings' },
  { to: '/shop?category=necklaces', label: 'Necklaces' },
  { to: '/shop?category=earrings', label: 'Earrings' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { count } = useCart();
  const { unreadChats } = useChatNotifications();
  const navigate = useNavigate();
  const lastScrollY = useRef(0);

  // Auto-hide the header on scroll-down, reveal it on scroll-up - keeps the
  // small screen real estate on mobile free while browsing product grids.
  // Skipped entirely while the mobile menu is open, so it can't slide away
  // mid-interaction.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      if (menuOpen) {
        lastScrollY.current = y;
        return;
      }

      const goingDown = y > lastScrollY.current;
      const pastThreshold = y > 120;
      setHidden(goingDown && pastThreshold);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`sticky top-0 z-50 transition-colors duration-normal ${
        scrolled ? 'bg-surface-base/90 backdrop-blur-md border-b border-surface-strong/30 shadow-soft' : 'bg-surface-base/60 backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <Link to="/" className="font-display text-xl tracking-wide text-ink-primary sm:text-2xl">
          LUXE JEWELS
        </Link>

        <div className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `text-sm tracking-wide transition-colors duration-fast hover:text-gold-500 ${
                  isActive ? 'text-gold-500' : 'text-ink-secondary'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          <Link to="/shop" aria-label="Search jewellery" className="hidden sm:block text-ink-secondary hover:text-gold-500 transition-colors">
            <HiOutlineSearch size={20} />
          </Link>

          <Link to="/cart" aria-label="View cart" className="relative text-ink-secondary hover:text-gold-500 transition-colors">
            <HiOutlineShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[10px] font-bold text-ink-primary">
                {count}
              </span>
            )}
          </Link>

          {isAuthenticated && (
            <Link to="/help" aria-label="Help and chat" className="relative hidden text-ink-secondary hover:text-gold-500 transition-colors sm:block">
              <HiOutlineChatAlt2 size={20} />
              {unreadChats > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-surface-strong text-[10px] font-bold text-ink-primary">
                  {unreadChats}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin" className="text-xs uppercase tracking-wide text-gold-500 hover:underline">
                  Admin
                </Link>
              )}
              <Link to="/orders" className="text-xs text-ink-secondary hover:text-gold-500">
                My Orders
              </Link>
              <Link to="/account" className="text-xs text-ink-secondary hover:text-gold-500">
                Hi, {user.name?.split(' ')[0]}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs text-ink-secondary hover:text-gold-500"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" aria-label="Login" className="hidden sm:block text-ink-secondary hover:text-gold-500 transition-colors">
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
                  className="py-3 text-ink-secondary hover:text-gold-500 border-b border-surface-strong/20"
                >
                  {l.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="py-3 text-gold-500">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="py-3 text-ink-secondary border-b border-surface-strong/20">
                    My Orders
                  </Link>
                  <Link to="/help" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 text-ink-secondary border-b border-surface-strong/20">
                    Help & Support
                    {unreadChats > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-strong px-1 text-[10px] font-semibold text-ink-primary">
                        {unreadChats}
                      </span>
                    )}
                  </Link>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="py-3 text-ink-secondary border-b border-surface-strong/20">
                    My Account
                  </Link>
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
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 text-gold-500">
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
