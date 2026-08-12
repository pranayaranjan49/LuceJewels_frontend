import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePaperAirplane, HiOutlinePhotograph, HiOutlineShoppingBag, HiOutlineX } from 'react-icons/hi';
import { sendChatMessage } from '../../api/endpoints';
import { getSocket } from '../../socket';
import OrderPickerModal from './OrderPickerModal';
import OrderChatCard from './OrderChatCard';

const MAX_SIZE_MB = 5;

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Shared chat UI for both sides of the conversation.
 * - targetUserId: the CUSTOMER's id, always (both a user chatting about
 *   themselves, and an admin chatting with that customer, hit the same
 *   REST/socket "room" keyed on this id).
 * - currentUserId: whoever is actually looking at the screen right now.
 * - orders: the list of orders available to attach (caller decides whose).
 */
export default function ChatWindow({ targetUserId, currentUserId, initialMessages, orders, headerName }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  // const bottomRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { setMessages(initialMessages || []); }, [initialMessages, targetUserId]);

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Every new message (yours or theirs) arrives here in real time - the
  // sender's own socket receives its own broadcast too, so we rely on this
  // exclusively for appending, rather than also appending from the REST
  // response, to avoid showing the same message twice.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (data) => {
      if (String(data.conversationUserId) === String(targetUserId)) {
        setMessages((prev) => [...prev, data.message]);
      }
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [targetUserId]);

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    setImage(file);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !image && !selectedOrder) return;

    setSending(true);
    try {
      const fd = new FormData();
      if (text.trim()) fd.append('text', text.trim());
      if (selectedOrder) fd.append('orderRef', selectedOrder._id);
      if (image) fd.append('image', image);

      await sendChatMessage(targetUserId, fd);
      setText('');
      setImage(null);
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Message could not be sent');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {headerName && (
        <div className="border-b border-surface-strong/30 px-5 py-4">
          <p className="font-display text-lg text-ink-primary">{headerName}</p>
        </div>
      )}

      {/* <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5"> */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-inverse">No messages yet — say hello!</p>
        ) : (
          messages.map((m, i) => {
            const isAdminMsg = m.senderRole === 'admin';
            const isOwn = String(m.sender) === String(currentUserId);
            return (
              <div key={m._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xs px-4 py-2.5 sm:max-w-[65%] ${
                    isAdminMsg
                      ? 'bg-gold-200/70 text-ink-primary'
                      : 'bg-surface-strong/25 text-ink-primary'
                  }`}
                >
                  {m.text && <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>}
                  {m.image?.url && (
                    <img src={m.image.url} alt="Attachment" className="mt-2 max-h-48 rounded-xs object-cover" />
                  )}
                  {m.orderRef && <div className="mt-2"><OrderChatCard order={m.orderRef} /></div>}
                  <p className="mt-1 text-right text-[10px] text-ink-inverse">{formatTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        {/* <div ref={bottomRef} /> */}
      </div>

      {selectedOrder && (
        <div className="mx-4 mb-1 flex items-center justify-between rounded-xs border border-surface-strong bg-surface-strong/20 px-3 py-2 sm:mx-5">
          <span className="text-xs text-ink-primary">Attaching Order #{selectedOrder._id.slice(-8).toUpperCase()}</span>
          <button onClick={() => setSelectedOrder(null)} aria-label="Remove attached order"><HiOutlineX size={14} className="text-ink-secondary" /></button>
        </div>
      )}
      {image && (
        <div className="mx-4 mb-1 flex items-center justify-between rounded-xs border border-ink-primary/15 bg-surface-muted px-3 py-2 sm:mx-5">
          <span className="text-xs text-ink-primary">{image.name}</span>
          <button onClick={() => setImage(null)} aria-label="Remove photo"><HiOutlineX size={14} className="text-ink-secondary" /></button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-surface-strong/30 p-3 sm:p-4">
        <button type="button" onClick={() => setPickerOpen(true)} aria-label="Attach an order" className="text-ink-secondary hover:text-gold-500">
          <HiOutlineShoppingBag size={20} />
        </button>
        <label className="cursor-pointer text-ink-secondary hover:text-gold-500">
          <HiOutlinePhotograph size={20} />
          <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
        </label>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="input-field flex-1 py-2.5"
        />
        <button type="submit" disabled={sending} aria-label="Send message" className="btn-primary px-4 py-2.5">
          <HiOutlinePaperAirplane size={18} className="rotate-90" />
        </button>
      </form>

      <OrderPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        orders={orders}
        onSelect={(order) => {
          setSelectedOrder(order);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
