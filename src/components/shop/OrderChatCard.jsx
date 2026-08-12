import { formatINR } from '../ui/Price';

// The "dark pink" order-detail card that appears inline inside a chat bubble
// whenever a message has an order attached (selectable by both the customer
// and the admin from the chat composer).
export default function OrderChatCard({ order }) {
  if (!order) {
    return <p className="rounded-xs bg-surface-strong/20 px-3 py-2 text-xs text-ink-inverse italic">Order details unavailable</p>;
  }
  return (
    <div className="min-w-[220px] rounded-xs border border-surface-strong bg-surface-strong/25 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-surface-strong">Order Reference</p>
      <p className="mt-1 text-sm font-medium text-ink-primary">#{order._id?.slice(-8).toUpperCase()}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary">
        <span className="capitalize">{order.status?.replace(/_/g, ' ')}</span>
        <span className="font-display text-sm text-gold-700">{formatINR(order.totalAmount)}</span>
      </div>
    </div>
  );
}
