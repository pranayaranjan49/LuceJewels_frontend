import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllOrders, updateOrderStatus } from '../../api/endpoints';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { formatINR } from '../../components/ui/Price';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-ink-inverse/20 text-ink-inverse',
  confirmed: 'bg-gold-400/20 text-gold-300',
  shipped: 'bg-ink-tertiary/20 text-ink-tertiary',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-surface-strong/40 text-ink-primary',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    getAllOrders(filter ? { status: filter, limit: 50 } : { limit: 50 })
      .then((res) => setOrders(res.data.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success('Order status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <p className="eyebrow">Fulfilment</p>
      <h1 className="mt-2 font-display text-3xl text-ink-primary">Orders</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`rounded-sm px-4 py-2 text-xs uppercase ${!filter ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary'}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-sm px-4 py-2 text-xs uppercase ${filter === s ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary'}`}>{s}</button>
        ))}
      </div>

      <div className="mt-8 card-surface overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-strong/30 text-ink-inverse">
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-strong/20">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} className="p-3"><RowSkeleton /></td></tr>)
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-inverse">No orders yet.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} className="text-ink-secondary">
                  <td className="px-5 py-4 text-ink-primary">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-4">
                    <div>{o.user?.name}</div>
                    <div className="text-xs text-ink-inverse">{o.user?.email}</div>
                  </td>
                  <td className="px-5 py-4">{formatINR(o.totalAmount)}</td>
                  <td className="px-5 py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className={`rounded-sm px-3 py-1.5 text-xs font-medium border-0 focus:outline-none ${STATUS_COLORS[o.status]}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s} className="bg-surface-raised text-ink-primary">{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
