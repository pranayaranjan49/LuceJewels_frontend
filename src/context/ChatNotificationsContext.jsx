import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getMyConversation, getAllConversations, getAllTickets } from '../api/endpoints';
import { useAuth } from './AuthContext';
import { getSocket, connectSocket } from '../socket';

const ChatNotificationsContext = createContext(null);

export function ChatNotificationsProvider({ children }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [unreadChats, setUnreadChats] = useState(0);
  const [unreadTickets, setUnreadTickets] = useState(0); // "registered" (not-yet-actioned) ticket count, admin only

  // Pulls the current true unread count from the server - call this after a
  // chat/ticket page has been opened (which marks things read server-side)
  // to bring the badge back in sync.
  const refreshUnread = useCallback(() => {
    if (!isAuthenticated) return;

    if (isAdmin) {
      getAllConversations()
        .then((res) => {
          const total = res.data.data.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0);
          setUnreadChats(total);
        })
        .catch(() => {});
      getAllTickets({ status: 'registered' })
        .then((res) => setUnreadTickets(res.data.counts?.registered || 0))
        .catch(() => {});
    } else {
      getMyConversation()
        .then((res) => setUnreadChats(res.data.data.unreadByUser || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  // Live updates: bump the badge and show a toast the instant a message
  // arrives, without needing to reload the page.
  useEffect(() => {
    if (!isAuthenticated) return;

    // Don't just trust AuthContext already connected the socket - provider
    // mount order between context providers isn't guaranteed, and
    // connectSocket() is a cheap no-op if a connection already exists.
    const token = localStorage.getItem('token');
    const socket = getSocket() || connectSocket(token);
    if (!socket) return;

    const handleNewMessage = ({ message }) => {
      if (String(message.sender) === String(user?.id)) return; // don't notify on your own message
      setUnreadChats((n) => n + 1);
      toast.success(isAdmin ? 'New message from a customer' : 'New message from Luxe Jewels', { icon: '💬' });
    };

    const handleNewTicket = () => {
      setUnreadTickets((n) => n + 1);
      toast.success('New support ticket raised', { icon: '🎫' });
    };

    socket.on('new_message', handleNewMessage);
    if (isAdmin) socket.on('new_ticket', handleNewTicket);

    return () => {
      socket.off('new_message', handleNewMessage);
      if (isAdmin) socket.off('new_ticket', handleNewTicket);
    };
  }, [isAuthenticated, isAdmin, user?.id]);

  return (
    <ChatNotificationsContext.Provider value={{ unreadChats, unreadTickets, refreshUnread }}>
      {children}
    </ChatNotificationsContext.Provider>
  );
}

export const useChatNotifications = () => useContext(ChatNotificationsContext);
