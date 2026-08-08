import { motion } from 'framer-motion';

// Reusable decorative background - three large blurred, slowly-drifting
// circles in gold/rose tones. Drop this as the FIRST child inside any
// `relative overflow-hidden` wrapper to add the same soft animated
// background used on the Login page to any other page (Cart, Checkout, etc).
//
// Usage:
//   <div className="relative overflow-hidden ...">
//     <FloatingBlobs />
//     ...your real content here, with className="relative z-10" on it...
//   </div>
export default function FloatingBlobs() {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold-200/40 blur-3xl sm:h-96 sm:w-96"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-surface-strong/30 blur-3xl sm:h-80 sm:w-80"
        animate={{ x: [0, -25, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-64 w-64 rounded-full bg-gold-100/50 blur-3xl sm:h-80 sm:w-80"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </>
  );
}
