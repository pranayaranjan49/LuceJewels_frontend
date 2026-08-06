import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineUsers, HiOutlineShoppingCart, HiOutlineExclamationCircle } from 'react-icons/hi';
import { getProducts, getUsers, getAllOrders, getLowStock } from '../../api/endpoints';

export default function AdminOverview() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, lowStock: 0 });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 1 }),
      getUsers({ limit: 1 }),
      getAllOrders({ limit: 1 }),
      getLowStock(),
    ])
      .then(([p, u, o, low]) => {
        setStats({
          products: p.data.total,
          users: u.data.total,
          orders: o.data.total,
          lowStock: low.data.count,
        });
        setLowStockItems(low.data.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.products, icon: HiOutlineCube, to: '/admin/products' },
    { label: 'Registered Users', value: stats.users, icon: HiOutlineUsers, to: '/admin/users' },
    { label: 'Total Orders', value: stats.orders, icon: HiOutlineShoppingCart, to: '/admin/orders' },
    { label: 'Low Stock Alerts', value: stats.lowStock, icon: HiOutlineExclamationCircle, to: '/admin/products' },
  ];

  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-2 font-display text-3xl text-ink-primary">Overview</h1>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="card-surface p-6 transition-colors hover:border-gold-400/50">
            <Icon className="text-gold-300" size={22} />
            <p className="mt-4 font-display text-3xl text-ink-primary">{loading ? '—' : value}</p>
            <p className="mt-1 text-sm text-ink-inverse">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 card-surface p-7">
        <h2 className="font-display text-xl text-ink-primary">Low Stock Products</h2>
        {lowStockItems.length === 0 ? (
          <p className="mt-4 text-sm text-ink-inverse">All products are well stocked.</p>
        ) : (
          <div className="mt-4 divide-y divide-surface-strong/20">
            {lowStockItems.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-ink-primary">{p.name}</p>
                  <p className="text-xs text-ink-inverse">{p.category?.name}</p>
                </div>
                <span className="rounded-sm bg-surface-strong/60 px-3 py-1 text-xs text-ink-primary">
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
