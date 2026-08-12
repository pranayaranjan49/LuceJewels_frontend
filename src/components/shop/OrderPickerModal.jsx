import Modal from '../ui/Modal';
import { formatINR } from '../ui/Price';

// Reusable order-selection list, used both in Chat (attach an order to a
// message) and Tickets (raise a complaint about a specific order). `orders`
// is passed in by the parent, since who's orders to show differs: the
// user's own orders, or (for an admin) a specific customer's orders.
export default function OrderPickerModal({ open, onClose, orders, onSelect, title = 'Select an Order' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      {orders.length === 0 ? (
        <p className="text-sm text-ink-inverse">No orders to show.</p>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {orders.map((o) => (
            <button
              key={o._id}
              onClick={() => onSelect(o)}
              className="flex w-full items-center justify-between rounded-xs border border-surface-strong/40 bg-surface-strong/10 p-4 text-left transition-colors hover:border-surface-strong hover:bg-surface-strong/20"
            >
              <div>
                <p className="text-sm font-medium text-ink-primary">Order #{o._id.slice(-8).toUpperCase()}</p>
                <p className="mt-1 text-xs text-ink-inverse">
                  {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{o.items?.length || 0} item{o.items?.length === 1 ? '' : 's'}
                  {' · '}<span className="capitalize">{o.status?.replace(/_/g, ' ')}</span>
                </p>
              </div>
              <p className="font-display text-gold-600">{formatINR(o.totalAmount)}</p>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}
