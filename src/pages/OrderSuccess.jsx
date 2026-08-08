import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import FloatingBlobs from '../components/ui/FloatingBlobs';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="relative overflow-hidden py-28">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <HiOutlineCheckCircle className="mx-auto text-gold-400" size={64} />
        </motion.div>
        <h1 className="mt-6 font-display text-3xl text-ink-primary">Order Confirmed</h1>
        <p className="mt-2 text-ink-inverse">
          {order ? `Order #${order._id.slice(-8).toUpperCase()} placed successfully.` : 'Your order has been placed.'}
        </p>
        <Link to="/shop" className="btn-primary mt-8 inline-flex">Continue Shopping</Link>
      </div>
    </div>
  );
}
