import { io } from 'socket.io-client';

// One shared socket connection for the whole app, reused everywhere instead
// of opening a new connection per page. connectSocket() is called once from
// AuthContext right after login (and on app load if already logged in);
// disconnectSocket() is called on logout.
let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  socket = io(base, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
