import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlinePhotograph,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineSpeakerphone,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Overview', icon: HiOutlineViewGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { to: '/admin/categories', label: 'Categories', icon: HiOutlineTag },
  { to: '/admin/banners', label: 'Homepage Banners', icon: HiOutlinePhotograph },
  { to: '/admin/orders', label: 'Orders', icon: HiOutlineShoppingCart },
  { to: '/admin/users', label: 'Users', icon: HiOutlineUsers },
  { to: '/admin/campaigns', label: 'Campaigns', icon: HiOutlineSpeakerphone },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div className="px-2 mb-10">
        <Link to="/" className="font-display text-2xl text-ink-primary transition-colors hover:text-gold-500">
          LUXE JEWELS
        </Link>
        <p className="text-xs text-ink-inverse mt-1">Admin Dashboard</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xs px-4 py-3 text-sm transition-colors duration-fast ${
                isActive
                  ? 'bg-surface-strong/40 text-gold-600 font-semibold'
                  : 'text-ink-secondary hover:bg-surface-strong/20 hover:text-ink-primary'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-surface-strong/30 pt-4 px-2">
        <p className="text-sm text-ink-primary">{user?.name}</p>
        <p className="text-xs text-ink-inverse truncate">{user?.email}</p>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="mt-3 flex items-center gap-2 text-xs text-ink-secondary hover:text-gold-600"
        >
          <HiOutlineLogout size={16} /> Sign out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-base flex">
      {/* Desktop sidebar - always visible */}
      <aside className="hidden md:flex w-64 flex-col border-r border-surface-strong/30 bg-surface-muted/50 px-5 py-8">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between border-b border-surface-strong/30 bg-surface-base/95 backdrop-blur-md px-5 py-4">
        <Link to="/" className="font-display text-xl text-ink-primary">LUXE JEWELS</Link>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open admin menu"
          className="text-ink-primary"
        >
          <HiOutlineMenu size={24} />
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-surface-base/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface-muted px-5 py-8 shadow-soft"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close admin menu"
                className="absolute top-6 right-5 text-ink-secondary"
              >
                <HiOutlineX size={22} />
              </button>
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0">
        <main className="p-5 pt-24 md:p-10 md:pt-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
