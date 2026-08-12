import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineStar, HiOutlineShoppingBag } from 'react-icons/hi';
import {
  getProfile, updateProfile,
  addAddress, updateAddress, deleteAddress,
  addPhone, setPrimaryPhone, deletePhone,
} from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import FloatingBlobs from '../components/ui/FloatingBlobs';

const emptyAddress = { label: 'Home', line1: '', city: '', state: '', pincode: '', country: 'India' };

export default function Account() {
  const { login } = useAuth(); // reused to refresh the cached user after edits
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [savingAddr, setSavingAddr] = useState(false);

  const [newPhone, setNewPhone] = useState('');
  const [newPhoneLabel, setNewPhoneLabel] = useState('Mobile');
  const [savingPhone, setSavingPhone] = useState(false);

  const fetchProfile = useCallback(() => {
    setLoading(true);
    getProfile()
      .then((res) => {
        setProfile(res.data.data);
        setName(res.data.data.name);
        setPhone(res.data.data.phone);
      })
      .catch(() => toast.error('Could not load your profile'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Keeps the navbar's "Hi, {name}" and localStorage in sync after an edit,
  // without needing a full page reload.
  const syncCachedUser = (updated) => {
    const token = localStorage.getItem('token');
    if (token) login(token, { ...updated, id: updated.id });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name, phone });
      setProfile(res.data.data);
      syncCachedUser(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const res = await addAddress(addrForm);
      setProfile(res.data.data);
      setAddrModalOpen(false);
      setAddrForm(emptyAddress);
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await updateAddress(addressId, { isDefault: true });
      setProfile(res.data.data);
    } catch {
      toast.error('Could not set default address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Remove this address?')) return;
    try {
      const res = await deleteAddress(addressId);
      setProfile(res.data.data);
    } catch {
      toast.error('Could not remove address');
    }
  };

  const handleAddPhone = async (e) => {
    e.preventDefault();
    if (!newPhone) return;
    setSavingPhone(true);
    try {
      const res = await addPhone({ number: newPhone, label: newPhoneLabel });
      setProfile(res.data.data);
      setNewPhone('');
      toast.success('Phone number added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add phone number');
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSetPrimaryPhone = async (phoneId) => {
    try {
      const res = await setPrimaryPhone(phoneId);
      setProfile(res.data.data);
    } catch {
      toast.error('Could not update phone');
    }
  };

  const handleDeletePhone = async (phoneId) => {
    try {
      const res = await deletePhone(phoneId);
      setProfile(res.data.data);
    } catch {
      toast.error('Could not remove phone number');
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-24 text-center text-ink-inverse">Loading your account…</div>;
  }
  if (!profile) return null;

  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-14 lg:px-10">
        <p className="eyebrow">Your Account</p>
        <h1 className="mt-2 font-display text-3xl text-ink-primary">My Profile</h1>

        <Link to="/orders" className="card-surface mt-6 flex items-center justify-between p-5 transition-colors hover:border-gold-400/50">
          <div className="flex items-center gap-3">
            <HiOutlineShoppingBag className="text-gold-500" size={20} />
            <span className="text-ink-primary">View My Orders</span>
          </div>
          <span className="text-ink-inverse">→</span>
        </Link>

        {/* Name / primary phone */}
        <form onSubmit={handleProfileSave} className="card-surface mt-6 p-6">
          <h2 className="font-display text-lg text-ink-primary">Personal Details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-ink-inverse">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-inverse">Primary Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-inverse">Email (cannot be changed)</label>
              <input value={profile.email} disabled className="input-field opacity-60" />
            </div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary mt-5">
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* Addresses */}
        <div className="card-surface mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink-primary">Saved Addresses</h2>
            <button onClick={() => setAddrModalOpen(true)} className="btn-ghost text-sm"><HiOutlinePlus size={16} /> Add</button>
          </div>
          <div className="mt-4 space-y-3">
            {profile.addresses.length === 0 ? (
              <p className="text-sm text-ink-inverse">No saved addresses yet.</p>
            ) : (
              profile.addresses.map((a) => (
                <div key={a._id} className="rounded-xs bg-surface-muted p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink-primary">{a.label}</span>
                      {a.isDefault && (
                        <span className="rounded-sm bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold-600">Default</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!a.isDefault && (
                        <button onClick={() => handleSetDefaultAddress(a._id)} aria-label="Set as default" className="text-ink-secondary hover:text-gold-500">
                          <HiOutlineStar size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteAddress(a._id)} aria-label="Delete address" className="text-ink-secondary hover:text-surface-strong">
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary">{a.line1}, {a.city}, {a.state} {a.pincode}, {a.country}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Secondary phones */}
        <div className="card-surface mt-6 p-6">
          <h2 className="font-display text-lg text-ink-primary">Additional Phone Numbers</h2>
          <p className="mt-1 text-xs text-ink-inverse">Extra numbers we can reach you on for deliveries.</p>

          <div className="mt-4 space-y-3">
            {profile.phones.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-xs bg-surface-muted px-4 py-3">
                <div>
                  <span className="text-sm text-ink-primary">{p.number}</span>
                  <span className="ml-2 text-xs text-ink-inverse">{p.label}</span>
                  {p.isPrimary && (
                    <span className="ml-2 rounded-sm bg-gold-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold-600">Primary</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!p.isPrimary && (
                    <button onClick={() => handleSetPrimaryPhone(p._id)} aria-label="Set as primary" className="text-ink-secondary hover:text-gold-500">
                      <HiOutlineStar size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDeletePhone(p._id)} aria-label="Remove phone" className="text-ink-secondary hover:text-surface-strong">
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddPhone} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input placeholder="+91 98765 43210" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="input-field flex-1" />
            <select value={newPhoneLabel} onChange={(e) => setNewPhoneLabel(e.target.value)} className="input-field sm:w-32">
              <option>Mobile</option>
              <option>Home</option>
              <option>Work</option>
            </select>
            <button type="submit" disabled={savingPhone} className="btn-secondary whitespace-nowrap">
              {savingPhone ? 'Adding…' : 'Add Number'}
            </button>
          </form>
        </div>
      </div>

      <Modal open={addrModalOpen} onClose={() => setAddrModalOpen(false)} title="Add Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <input required placeholder="Label (e.g. Home, Office)" value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} className="input-field" />
          <input required placeholder="Address line" value={addrForm.line1} onChange={(e) => setAddrForm((f) => ({ ...f, line1: e.target.value }))} className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="City" value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} className="input-field" />
            <input required placeholder="State" value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} className="input-field" />
          </div>
          <input required placeholder="Pincode" value={addrForm.pincode} onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))} className="input-field" />
          <button type="submit" disabled={savingAddr} className="btn-primary w-full">{savingAddr ? 'Saving…' : 'Save Address'}</button>
        </form>
      </Modal>
    </div>
  );
}
