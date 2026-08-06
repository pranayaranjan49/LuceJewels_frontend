import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';

export default function Modal({ open, onClose, title, children, wide = false }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-base/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className={`card-surface max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-y-auto bg-surface-raised p-7`}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl text-ink-primary">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="text-ink-secondary hover:text-gold-300">
                <HiOutlineX size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
