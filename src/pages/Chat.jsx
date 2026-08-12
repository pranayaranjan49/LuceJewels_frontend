import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyConversation, getMyOrders } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useChatNotifications } from '../context/ChatNotificationsContext';
import ChatWindow from '../components/shop/ChatWindow';

export default function Chat() {
  const { user } = useAuth();
  const { refreshUnread } = useChatNotifications();
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyConversation(), getMyOrders()])
      .then(([convoRes, ordersRes]) => {
        setMessages(convoRes.data.data.messages);
        setOrders(ordersRes.data.data);
      })
      .catch(() => toast.error('Could not load chat'))
      .finally(() => {
        setLoading(false);
        refreshUnread(); // opening the chat marked it read server-side - sync the badge
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink-inverse">Loading chat…</div>;
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-88px)] max-w-3xl flex-col px-0 py-0 sm:h-[80vh] sm:px-6 sm:py-10 lg:px-10">
      <div className="mb-0 sm:mb-4">
        <p className="eyebrow px-4 sm:px-0">Support</p>
        <h1 className="mt-1 px-4 font-display text-2xl text-ink-primary sm:px-0">Chat with Luxe Jewels</h1>
      </div>
      <div className="card-surface flex-1 overflow-hidden rounded-none border-x-0 sm:rounded-xs sm:border-x">
        <ChatWindow
          targetUserId={user.id}
          currentUserId={user.id}
          initialMessages={messages}
          orders={orders}
        />
      </div>
    </div>
  );
}
