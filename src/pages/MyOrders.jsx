import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/endpoints';
import { formatINR } from '../components/ui/Price';
import { RowSkeleton } from '../components/ui/Skeleton';
import FloatingBlobs from '../components/ui/FloatingBlobs';

const STATUS_STYLES = {
  pending: 'bg-ink-inverse/20 text-ink-inverse',
  confirmed: 'bg-gold-400/20 text-gold-600',
  processing: 'bg-gold-400/20 text-gold-600',
  shipped: 'bg-ink-tertiary/20 text-ink-tertiary',
  out_for_delivery: 'bg-ink-tertiary/20 text-ink-tertiary',
  delivered: 'bg-green-500/20 text-green-600',
  cancelled: 'bg-surface-strong/30 text-ink-primary',
};

const STATUS_LABEL = {
  pending: 'Ordered', confirmed: 'Confirmed', processing: 'Processing',
  shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-14 lg:px-10">
        <p className="eyebrow">Your Account</p>
        <h1 className="mt-2 font-display text-3xl text-ink-primary">My Orders</h1>

        <div className="mt-8 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)
          ) : orders.length === 0 ? (
            <div className="card-surface p-10 text-center">
              <p className="text-ink-primary">You haven't placed any orders yet.</p>
              <Link to="/shop" className="btn-primary mt-6 inline-flex">Start Shopping</Link>
            </div>
          ) : (
            orders.map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="card-surface flex items-center justify-between gap-4 p-5 transition-colors hover:border-gold-400/50"
              >
                <div>
                  <p className="font-display text-lg text-ink-primary">Order #{o._id.slice(-8).toUpperCase()}</p>
                  <p className="mt-1 text-xs text-ink-inverse">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{o.items.length} item{o.items.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold-600 font-display text-lg">{formatINR(o.totalAmount)}</p>
                  <span className={`mt-1 inline-block rounded-sm px-3 py-1 text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
