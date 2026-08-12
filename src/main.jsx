import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ChatNotificationsProvider } from './context/ChatNotificationsContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatNotificationsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ChatNotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
