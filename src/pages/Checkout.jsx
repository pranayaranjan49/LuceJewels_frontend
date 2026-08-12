import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCash, HiOutlineQrcode, HiOutlinePlus } from 'react-icons/hi';
import { createOrder, getProfile, addAddress } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { formatINR } from '../components/ui/Price';
import FloatingBlobs from '../components/ui/FloatingBlobs';

const emptyAddressForm = { label: 'Home', line1: '', city: '', state: '', pincode: '', country: 'India' };

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Saved addresses pulled from the user's profile (same ones managed on the
  // /account page). selectedId is either a real address _id, or the literal
  // string 'new' when the user is entering a fresh address at checkout.
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  // Contact phone is kept separate from the address itself - it's "who to
  // call about this delivery", which can differ from the address record.
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // On mount, load the user's saved addresses so they can pick one instead
  // of retyping it. If they have none, the "new address" form opens
  // automatically - never leaves the page looking broken/empty.
  useEffect(() => {
    getProfile()
      .then((res) => {
        const profile = res.data.data;
        setSavedAddresses(profile.addresses || []);
        setContactPhone(profile.phone || '');

        if (profile.addresses?.length > 0) {
          const def = profile.addresses.find((a) => a.isDefault) || profile.addresses[0];
          setSelectedId(def._id);
        } else {
          setSelectedId('new');
        }
      })
      .catch(() => setSelectedId('new')) // fail-safe: still let them check out manually
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleAddressFormChange = (e) => setAddressForm((a) => ({ ...a, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!contactPhone) return toast.error('Please enter a contact phone number');

    setLoading(true);
    try {
      let shippingAddress;

      if (selectedId === 'new') {
        const { line1, city, state, pincode, country } = addressForm;
        if (!line1 || !city || !state || !pincode) {
          toast.error('Please fill in the full address');
          setLoading(false);
          return;
        }
        shippingAddress = { line1, city, state, pincode, country, phone: contactPhone };

        // Save it to the profile for next time - non-blocking: if this fails
        // for some reason, we still place the order with the entered details.
        if (saveNewAddress) {
          try {
            await addAddress(addressForm);
          } catch {
            toast.error('Order will proceed, but the address could not be saved to your profile');
          }
        }
      } else {
        const chosen = savedAddresses.find((a) => a._id === selectedId);
        if (!chosen) {
          toast.error('Please select or add an address');
          setLoading(false);
          return;
        }
        shippingAddress = {
          line1: chosen.line1, city: chosen.city, state: chosen.state,
          pincode: chosen.pincode, country: chosen.country, phone: contactPhone,
        };
      }

      const payload = {
        items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
        shippingAddress,
        paymentMethod,
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
      <div className="relative overflow-hidden py-28">
        <FloatingBlobs />
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <p className="font-display text-2xl text-ink-primary">Nothing to check out yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-14 lg:px-10">
        <h1 className="font-display text-3xl text-ink-primary">Checkout</h1>

        <form onSubmit={handlePlaceOrder} className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="eyebrow">Shipping Address</h2>

            {loadingProfile ? (
              <p className="text-sm text-ink-inverse">Loading your addresses…</p>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xs border p-4 transition-colors ${
                      selectedId === addr._id ? 'border-gold-400 bg-gold-400/10' : 'border-ink-primary/15'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedId === addr._id}
                      onChange={() => setSelectedId(addr._id)}
                      className="mt-1 accent-gold-400"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-primary">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded-sm bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold-600">Default</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-ink-secondary">
                        {addr.line1}, {addr.city}, {addr.state} {addr.pincode}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xs border p-4 transition-colors ${
                    selectedId === 'new' ? 'border-gold-400 bg-gold-400/10' : 'border-ink-primary/15'
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selectedId === 'new'}
                    onChange={() => setSelectedId('new')}
                    className="accent-gold-400"
                  />
                  <span className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                    <HiOutlinePlus size={16} /> Use a new address
                  </span>
                </label>

                {selectedId === 'new' && (
                  <div className="space-y-4 rounded-xs bg-surface-muted p-5">
                    <input name="label" placeholder="Label (e.g. Home, Office)" value={addressForm.label} onChange={handleAddressFormChange} className="input-field" />
                    <input name="line1" required placeholder="Address line" value={addressForm.line1} onChange={handleAddressFormChange} className="input-field" />
                    <div className="grid grid-cols-2 gap-4">
                      <input name="city" required placeholder="City" value={addressForm.city} onChange={handleAddressFormChange} className="input-field" />
                      <input name="state" required placeholder="State" value={addressForm.state} onChange={handleAddressFormChange} className="input-field" />
                    </div>
                    <input name="pincode" required placeholder="Pincode" value={addressForm.pincode} onChange={handleAddressFormChange} className="input-field" />
                    <label className="flex items-center gap-2 text-sm text-ink-secondary">
                      <input
                        type="checkbox"
                        checked={saveNewAddress}
                        onChange={(e) => setSaveNewAddress(e.target.checked)}
                        className="accent-gold-400"
                      />
                      Save this address to my profile for next time
                    </label>
                  </div>
                )}
              </div>
            )}

            <input
              required
              placeholder="Contact phone for this delivery"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="input-field"
            />

            <h2 className="eyebrow pt-4">Payment Method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center gap-3 rounded-xs border p-4 text-left transition-colors ${
                  paymentMethod === 'cod' ? 'border-gold-400 bg-gold-400/10' : 'border-ink-primary/15'
                }`}
              >
                <HiOutlineCash size={22} className="text-gold-500" />
                <div>
                  <p className="text-sm font-medium text-ink-primary">Cash on Delivery</p>
                  <p className="text-xs text-ink-inverse">Pay when your order arrives</p>
                </div>
              </button>

              <button
                type="button"
                disabled
                title="UPI is coming soon"
                className="flex items-center gap-3 rounded-xs border border-ink-primary/10 p-4 text-left opacity-50"
              >
                <HiOutlineQrcode size={22} className="text-ink-inverse" />
                <div>
                  <p className="text-sm font-medium text-ink-primary">UPI</p>
                  <p className="text-xs text-ink-inverse">Coming soon</p>
                </div>
              </button>
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
    </div>
  );
}
