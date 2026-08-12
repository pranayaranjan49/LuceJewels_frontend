import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineBan, HiCheckCircle } from 'react-icons/hi';
import { getOrder, cancelOrder } from '../api/endpoints';
import OrderTimeline from '../components/shop/OrderTimeline';
import FeedbackForm from '../components/shop/FeedbackForm';
import { formatINR } from '../components/ui/Price';
import FloatingBlobs from '../components/ui/FloatingBlobs';

const CANCELLABLE = ['pending', 'confirmed', 'processing'];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(() => {
    setLoading(true);
    getOrder(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    try {
      await cancelOrder(id);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-24 text-center text-ink-inverse">Loading order…</div>;
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink-primary">Order not found</p>
        <Link to="/orders" className="btn-secondary mt-6 inline-flex">Back to My Orders</Link>
      </div>
    );
  }

  const canCancel = CANCELLABLE.includes(order.status);
  const showFeedbackPrompt = order.status === 'delivered' && !order.feedback;
  const feedbackAlreadyGiven = order.status === 'delivered' && !!order.feedback;

  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-14 lg:px-10">
        <p className="eyebrow">Order #{order._id.slice(-8).toUpperCase()}</p>
        <h1 className="mt-2 font-display text-3xl text-ink-primary">Track Your Order</h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: items + timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-surface p-6">
              <h2 className="font-display text-lg text-ink-primary">Items</h2>
              <div className="mt-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={item.image || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=100&auto=format&fit=crop'} alt="" className="h-14 w-14 rounded-xs object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-ink-primary">{item.name}</p>
                      <p className="text-xs text-ink-inverse">Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm text-gold-600">{formatINR(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-surface-strong/30 pt-4 font-display text-ink-primary">
                <span>Total</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>
              <p className="mt-2 text-xs text-ink-inverse">
                Payment: {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
              </p>
            </div>

            <div className="card-surface p-6">
              <h2 className="font-display text-lg text-ink-primary mb-6">Delivery Status</h2>
              <OrderTimeline order={order} />
            </div>

            {order.trackingUpdates?.length > 0 && (
              <div className="card-surface p-6">
                <h2 className="font-display text-lg text-ink-primary">Updates</h2>
                <div className="mt-4 space-y-3">
                  {[...order.trackingUpdates].reverse().map((u, i) => (
                    <div key={i} className="rounded-xs bg-surface-muted px-4 py-3">
                      <p className="text-sm text-ink-primary">{u.message}</p>
                      {u.location && <p className="mt-0.5 text-xs text-ink-inverse">{u.location}</p>}
                      <p className="mt-0.5 text-xs text-ink-inverse">
                        {new Date(u.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showFeedbackPrompt && <FeedbackForm orderId={order._id} onSubmitted={fetchOrder} />}
            {feedbackAlreadyGiven && (
              <div className="card-surface flex items-start gap-3 p-6">
                <HiCheckCircle className="mt-0.5 flex-shrink-0 text-green-500" size={22} />
                <div>
                  <p className="font-display text-lg text-ink-primary">Thanks for your feedback</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {order.feedback.notReceived
                      ? "We've received your report that this order wasn't delivered - our team will follow up shortly."
                      : `You rated this delivery ${order.feedback.rating ?? '-'} / 5.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: need help */}
          <div className="lg:col-span-1">
            <div className="card-surface sticky top-24 p-6">
              <h2 className="font-display text-lg text-ink-primary">Need Help?</h2>
              <div className="mt-4 space-y-3">
                <a href="mailto:hello@luxejewels.dpdns.org" className="btn-secondary w-full text-sm">
                  <HiOutlineMail size={16} /> Contact Seller
                </a>
                {canCancel && (
                  <button onClick={handleCancel} disabled={cancelling} className="btn-ghost w-full border border-surface-strong/40 text-sm text-surface-strong">
                    <HiOutlineBan size={16} /> {cancelling ? 'Cancelling…' : 'Cancel Order'}
                  </button>
                )}
              </div>
              {!canCancel && order.status !== 'cancelled' && order.status !== 'delivered' && (
                <p className="mt-3 text-xs text-ink-inverse">This order has already shipped and can no longer be cancelled.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
