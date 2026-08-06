import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineSpeakerphone,
  HiOutlineLogout,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Overview', icon: HiOutlineViewGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: HiOutlineCube },
  { to: '/admin/categories', label: 'Categories', icon: HiOutlineTag },
  { to: '/admin/orders', label: 'Orders', icon: HiOutlineShoppingCart },
  { to: '/admin/users', label: 'Users', icon: HiOutlineUsers },
  { to: '/admin/campaigns', label: 'Campaigns', icon: HiOutlineSpeakerphone },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-base flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-surface-strong/30 bg-surface-muted/40 px-5 py-8">
        <div className="px-2 mb-10">
          <Link
    to="/"
    className="block hover:opacity-90 transition-opacity"
  >
          <span className="font-display text-2xl text-ink-primary">Luxe Jewels</span>
          <p className="text-xs text-ink-inverse mt-1">Admin Dashboard</p>
          </Link>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xs px-4 py-3 text-sm transition-colors duration-fast ${
                  isActive
                    ? 'bg-surface-strong/60 text-gold-300'
                    : 'text-ink-secondary hover:bg-surface-strong/30 hover:text-ink-primary'
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
            className="mt-3 flex items-center gap-2 text-xs text-ink-secondary hover:text-gold-300"
          >
            <HiOutlineLogout size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <main className="p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
