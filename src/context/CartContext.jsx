import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.images?.[0]?.url || '',
          price: product.discountPrice > 0 ? product.discountPrice : product.price,
          stock: product.stock,
          quantity,
        },
      ];
    });
    toast.success(`${product.name} added to cart`);
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.product === productId ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
