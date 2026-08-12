import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { getAllConversations, getConversationWithUser, getUser } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useChatNotifications } from '../../context/ChatNotificationsContext';
import { getSocket } from '../../socket';
import ChatWindow from '../../components/shop/ChatWindow';

export default function AdminChats() {
  const { user } = useAuth();
  const { refreshUnread } = useChatNotifications();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConvo, setActiveConvo] = useState(null); // full populated conversation, or null (mobile: list view)
  const [activeOrders, setActiveOrders] = useState([]);

  const fetchList = useCallback(() => {
    getAllConversations()
      .then((res) => setConversations(res.data.data))
      .catch(() => toast.error('Could not load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Live-refresh the conversation list preview (last message, unread dot)
  // whenever ANY new message arrives anywhere - keeps the sidebar current
  // even while looking at a different customer's thread.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => fetchList();
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [fetchList]);

  const openConversation = async (customerId) => {
    try {
      const [convoRes, userRes] = await Promise.all([
        getConversationWithUser(customerId),
        getUser(customerId),
      ]);
      setActiveConvo(convoRes.data.data);
      setActiveOrders(userRes.data.data.orders);
      refreshUnread();
      fetchList(); // clears that row's unread dot in the sidebar
    } catch {
      toast.error('Could not open conversation');
    }
  };

  return (
    <div>
      <p className="eyebrow">Support</p>
      <h1 className="mt-2 font-display text-3xl text-ink-primary">Live Chat</h1>

      <div className="mt-6 card-surface flex h-[75vh] overflow-hidden">
        {/* Conversation list - full width on mobile when nothing's open, a
            fixed sidebar on desktop always */}
        <div className={`w-full flex-col border-r border-surface-strong/30 overflow-y-auto md:flex md:w-80 ${activeConvo ? 'hidden' : 'flex'}`}>
          {loading ? (
            <p className="p-5 text-sm text-ink-inverse">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="p-5 text-sm text-ink-inverse">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c._id}
                onClick={() => openConversation(c.user._id)}
                className={`flex items-center justify-between border-b border-surface-strong/20 px-4 py-4 text-left transition-colors hover:bg-surface-strong/10 ${
                  activeConvo?._id === c._id ? 'bg-surface-strong/15' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-primary">{c.user?.name}</p>
                  <p className="truncate text-xs text-ink-inverse">
                    {c.messages[c.messages.length - 1]?.text || (c.messages.length ? 'Sent an attachment' : 'No messages yet')}
                  </p>
                </div>
                {c.unreadByAdmin > 0 && (
                  <span className="ml-2 flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-strong px-1 text-[10px] font-semibold text-ink-primary">
                    {c.unreadByAdmin}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Active chat panel - full width on mobile when open, always
            visible next to the list on desktop */}
        <div className={`flex-1 flex-col md:flex ${activeConvo ? 'flex' : 'hidden'}`}>
          {activeConvo ? (
            <>
              <div className="flex items-center gap-2 border-b border-surface-strong/30 px-4 py-3">
                <button onClick={() => setActiveConvo(null)} aria-label="Back to conversations" className="md:hidden">
                  <HiOutlineArrowLeft size={18} className="text-ink-secondary" />
                </button>
                <span className="font-display text-lg text-ink-primary">{activeConvo.user?.name}</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  targetUserId={activeConvo.user._id}
                  currentUserId={user.id}
                  initialMessages={activeConvo.messages}
                  orders={activeOrders}
                />
              </div>
            </>
          ) : (
            <div className="hidden h-full items-center justify-center text-sm text-ink-inverse md:flex">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
