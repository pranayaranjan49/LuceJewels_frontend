import { Link } from 'react-router-dom';
import { HiOutlineChatAlt2, HiOutlineTicket } from 'react-icons/hi';
import { useChatNotifications } from '../context/ChatNotificationsContext';
import FloatingBlobs from '../components/ui/FloatingBlobs';

export default function Help() {
  const { unreadChats } = useChatNotifications();

  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-14 lg:px-10">
        <p className="eyebrow">Support</p>
        <h1 className="mt-2 font-display text-3xl text-ink-primary">Help & Support</h1>
        <p className="mt-2 text-sm text-ink-inverse">Talk to us directly, or raise a formal complaint about an order.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link to="/chat" className="card-surface relative p-7 transition-colors hover:border-gold-400/50">
            {unreadChats > 0 && (
              <span className="absolute right-5 top-5 flex h-6 min-w-6 items-center justify-center rounded-full bg-surface-strong px-1.5 text-xs font-semibold text-ink-primary">
                {unreadChats}
              </span>
            )}
            <HiOutlineChatAlt2 className="text-gold-500" size={28} />
            <h2 className="mt-4 font-display text-xl text-ink-primary">Chat with Seller</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Talk to us live about an enquiry, an order, or anything else — real-time chat, replies right here.
            </p>
          </Link>

          <Link to="/tickets" className="card-surface p-7 transition-colors hover:border-gold-400/50">
            <HiOutlineTicket className="text-gold-500" size={28} />
            <h2 className="mt-4 font-display text-xl text-ink-primary">Raise a Complaint</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              File a formal ticket about a specific order, attach photos, and track its status until it's resolved.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
