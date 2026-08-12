import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';

const STEPS = [
  { key: 'pending', label: 'Ordered' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function formatWhen(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Vertical step tracker (Flipkart/Amazon-style) - a glowing/pulsing dot marks
// the CURRENT step, filled gold dots with a checkmark mark completed steps,
// and dim grey dots mark steps still ahead. Stacks naturally on mobile since
// it's vertical, not a horizontal scroll-bar like some trackers.
export default function OrderTimeline({ order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="rounded-xs border border-surface-strong/40 bg-surface-strong/10 px-5 py-4 text-center">
        <p className="font-display text-lg text-ink-primary">This order was cancelled</p>
        {order.cancelReason && <p className="mt-1 text-sm text-ink-secondary">Reason: {order.cancelReason}</p>}
        {order.cancelledAt && <p className="mt-1 text-xs text-ink-inverse">{formatWhen(order.cancelledAt)}</p>}
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="pl-1">
      {STEPS.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming';
        const firstUpdate = order.trackingUpdates?.find((u) => u.status === step.key);
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[9px] top-6 h-full w-0.5 ${
                  state === 'done' ? 'bg-gold-400' : 'bg-surface-strong/30'
                }`}
              />
            )}

            <span className="relative z-10 mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
              {state === 'done' && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400">
                  <HiCheck size={13} className="text-ink-primary" />
                </span>
              )}
              {state === 'active' && (
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <motion.span
                    className="absolute h-5 w-5 rounded-full bg-gold-400/50"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-gold-400" />
                </span>
              )}
              {state === 'upcoming' && <span className="h-2.5 w-2.5 rounded-full bg-surface-strong/40" />}
            </span>

            <div className="pb-1">
              <p className={`text-sm font-medium ${state === 'upcoming' ? 'text-ink-inverse' : 'text-ink-primary'}`}>
                {step.label}
              </p>
              {firstUpdate && <p className="mt-0.5 text-xs text-ink-inverse">{formatWhen(firstUpdate.createdAt)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
