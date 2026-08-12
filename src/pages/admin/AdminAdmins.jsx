import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineShieldCheck } from 'react-icons/hi';
import { getUsers, createOrPromoteAdmin } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { RowSkeleton } from '../../components/ui/Skeleton';

export default function AdminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAdmins = useCallback(() => {
    setLoading(true);
    getUsers({ role: 'admin', limit: 100 })
      .then((res) => setAdmins(res.data.data))
      .catch(() => toast.error('Could not load admins'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createOrPromoteAdmin({ name, email, phone });
      toast.success(res.data.message);
      setName(''); setEmail(''); setPhone('');
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Team</p>
          <h1 className="mt-2 font-display text-3xl text-ink-primary">Admins</h1>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><HiOutlinePlus /> Create Admin</button>
      </div>

      <div className="mt-8 card-surface overflow-x-auto">
        <table className="w-full min-w-[550px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-strong/30 text-ink-inverse">
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Since</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-strong/20">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={4} className="p-3"><RowSkeleton /></td></tr>)
            ) : admins.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-ink-inverse">No admins found.</td></tr>
            ) : (
              admins.map((a) => (
                <tr key={a._id} className="text-ink-secondary">
                  <td className="px-5 py-4 text-ink-primary">
                    <div className="flex items-center gap-2">
                      <HiOutlineShieldCheck className="text-gold-500" size={16} />
                      {a.name}
                    </div>
                  </td>
                  <td className="px-5 py-4">{a.email}</td>
                  <td className="px-5 py-4">{a.phone}</td>
                  <td className="px-5 py-4">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Admin">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-ink-inverse">
            If this email or phone already belongs to a registered user, they'll be promoted to admin instead of creating a duplicate account.
          </p>
          <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          <input required placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Creating…' : 'Create / Promote to Admin'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
