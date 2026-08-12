import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiStar, HiOutlineExclamationCircle } from 'react-icons/hi';
import {
  getOrder, updateOrderStatus, addTrackingUpdate, markComplaintSeen,
} from '../../api/endpoints';
import OrderTimeline from '../../components/shop/OrderTimeline';
import { formatINR } from '../../components/ui/Price';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState('');
  const [posting, setPosting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const fetchOrder = useCallback(() => {
    getOrder(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => toast.error('Could not load order'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Auto-marks a complaint as seen the moment the admin opens this page and
  // views it - this is what clears the red dot on the Users list.
  useEffect(() => {
    if (order?.feedback?.isComplaint && !order.feedback.adminSeen) {
      markComplaintSeen(id).catch(() => {});
    }
  }, [order, id]);

  const handleStatusChange = async (status) => {
    try {
      const res = await updateOrderStatus(id, status);
      setOrder(res.data.data);
      toast.success('Status updated');
    } catch {
      toast.error('Could not update status');
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!message) return;
    setPosting(true);
    try {
      const res = await addTrackingUpdate(id, { message, location });
      setOrder(res.data.data);
      setMessage('');
      setLocation('');
      toast.success('Update posted');
    } catch {
      toast.error('Could not post update');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <p className="text-ink-inverse">Loading order…</p>;
  if (!order) return <p className="text-ink-inverse">Order not found.</p>;

  return (
    <div>
      <Link to="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-secondary hover:text-gold-500">
        <HiArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Order</p>
          <h1 className="mt-1 font-display text-3xl text-ink-primary">#{order._id.slice(-8).toUpperCase()}</h1>
        </div>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-field w-auto"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface p-6">
            <h2 className="font-display text-lg text-ink-primary">Customer</h2>
            <p className="mt-2 text-sm text-ink-secondary">{order.user?.name} · {order.user?.email} · {order.user?.phone}</p>
            <div className="mt-4 border-t border-surface-strong/20 pt-4">
              <h3 className="text-sm font-medium text-ink-primary">Shipping Address</h3>
              <p className="mt-1 text-sm text-ink-secondary">
                {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.pincode}, {order.shippingAddress?.country}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">Contact: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          <div className="card-surface p-6">
            <h2 className="font-display text-lg text-ink-primary">Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-ink-secondary">{item.name} × {item.quantity}</span>
                  <span className="text-gold-600">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-surface-strong/30 pt-4 font-display text-ink-primary">
              <span>Total</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>
            <p className="mt-2 text-xs text-ink-inverse">Payment: {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</p>
          </div>

          {order.feedback && (
            <div className={`card-surface p-6 ${order.feedback.isComplaint ? 'border-surface-strong' : ''}`}>
              <div className="flex items-center gap-2">
                {order.feedback.isComplaint && <HiOutlineExclamationCircle className="text-surface-strong" size={20} />}
                <h2 className="font-display text-lg text-ink-primary">Customer Feedback</h2>
              </div>
              {order.feedback.rating && (
                <div className="mt-2 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <HiStar key={n} size={18} className={order.feedback.rating >= n ? 'text-gold-400' : 'text-surface-strong/30'} />
                  ))}
                </div>
              )}
              {order.feedback.notReceived && (
                <p className="mt-2 rounded-sm bg-surface-strong/15 px-3 py-1.5 text-sm text-ink-primary">
                  Customer reports they did not receive this order.
                </p>
              )}
              {order.feedback.comment && <p className="mt-2 text-sm text-ink-secondary">"{order.feedback.comment}"</p>}
              {order.feedback.photos?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.feedback.photos.map((p, i) => (
                    <button key={i} onClick={() => setLightboxUrl(p.url)}>
                      <img src={p.url} alt="" className="h-20 w-20 rounded-xs object-cover transition-opacity hover:opacity-80" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="card-surface p-6">
            <h2 className="mb-4 font-display text-lg text-ink-primary">Delivery Progress</h2>
            <OrderTimeline order={order} />
          </div>

          <div className="card-surface p-6">
            <h2 className="font-display text-lg text-ink-primary">Post an Update</h2>
            <form onSubmit={handlePostUpdate} className="mt-4 space-y-3">
              <textarea
                required
                placeholder='e.g. "Your order has reached the Bhubaneswar hub"'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="input-field"
              />
              <input
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field"
              />
              <button type="submit" disabled={posting} className="btn-primary w-full">
                {posting ? 'Posting…' : 'Post Update'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-surface-base/90 p-6 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} alt="Customer submitted" className="max-h-[85vh] max-w-full rounded-xs" />
        </div>
      )}
    </div>
  );
}
