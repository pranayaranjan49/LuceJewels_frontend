import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createOrder } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { formatINR } from '../components/ui/Price';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '', country: 'India', phone: '' });

  const handleChange = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress: address,
      };
      const res = await createOrder(payload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/order-success', { state: { order: res.data.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <p className="font-display text-2xl text-ink-primary">Nothing to check out yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
      <h1 className="font-display text-3xl text-ink-primary">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="eyebrow">Shipping Address</h2>
          <input name="line1" required placeholder="Address line" value={address.line1} onChange={handleChange} className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" required placeholder="City" value={address.city} onChange={handleChange} className="input-field" />
            <input name="state" required placeholder="State" value={address.state} onChange={handleChange} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="pincode" required placeholder="Pincode" value={address.pincode} onChange={handleChange} className="input-field" />
            <input name="phone" required placeholder="Contact phone" value={address.phone} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div className="card-surface h-fit p-7">
          <h2 className="font-display text-xl text-ink-primary">{items.length} item{items.length > 1 ? 's' : ''}</h2>
          <div className="mt-4 space-y-2 text-sm text-ink-secondary">
            {items.map((i) => (
              <div key={i.product} className="flex justify-between">
                <span>{i.name} × {i.quantity}</span>
                <span>{formatINR(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-surface-strong/30 pt-4 font-display text-lg text-ink-primary">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading ? 'Placing order…' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
