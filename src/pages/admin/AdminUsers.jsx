import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getUsers, getUser } from '../../api/endpoints';
import { RowSkeleton } from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import { formatINR } from '../../components/ui/Price';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = useCallback((q) => {
    setLoading(true);
    getUsers(q ? { search: q, limit: 50 } : { limit: 50 })
      .then((res) => setUsers(res.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchUsers(''); }, [fetchUsers]);

  const openDetail = async (id) => {
    setModalOpen(true);
    setDetail(null);
    try {
      const res = await getUser(id);
      setDetail(res.data.data);
    } catch {
      toast.error('Could not load user detail');
    }
  };

  return (
    <div>
      <p className="eyebrow">Customers</p>
      <h1 className="mt-2 font-display text-3xl text-ink-primary">Users</h1>

      <input
        type="search"
        placeholder="Search by name, email or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && fetchUsers(search)}
        className="input-field mt-6 max-w-sm"
      />

      <div className="mt-6 card-surface overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-strong/30 text-ink-inverse">
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Joined</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-strong/20">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} className="p-3"><RowSkeleton /></td></tr>)
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-inverse">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="text-ink-secondary">
                  <td className="px-5 py-4 text-ink-primary">{u.name}</td>
                  <td className="px-5 py-4">{u.email}</td>
                  <td className="px-5 py-4">{u.phone}</td>
                  <td className="px-5 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openDetail(u._id)} className="text-xs text-gold-300 hover:underline">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="User Details" wide>
        {!detail ? (
          <p className="text-ink-inverse text-sm">Loading…</p>
        ) : (
          <div>
            <p className="text-ink-primary font-display text-lg">{detail.user.name}</p>
            <p className="text-sm text-ink-secondary">{detail.user.email} · {detail.user.phone}</p>
            <div className="mt-4 flex gap-3 text-xs">
              <span className={`rounded-sm px-3 py-1 ${detail.user.isEmailVerified ? 'bg-green-500/20 text-green-400' : 'bg-ink-inverse/20 text-ink-inverse'}`}>
                Email {detail.user.isEmailVerified ? 'verified' : 'unverified'}
              </span>
              <span className={`rounded-sm px-3 py-1 ${detail.user.isPhoneVerified ? 'bg-green-500/20 text-green-400' : 'bg-ink-inverse/20 text-ink-inverse'}`}>
                Phone {detail.user.isPhoneVerified ? 'verified' : 'unverified'}
              </span>
            </div>

            <h3 className="mt-6 eyebrow">Order History ({detail.orders.length})</h3>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {detail.orders.length === 0 ? (
                <p className="text-sm text-ink-inverse">No orders placed yet.</p>
              ) : (
                detail.orders.map((o) => (
                  <div key={o._id} className="flex justify-between rounded-xs bg-surface-muted px-4 py-3 text-sm">
                    <span className="text-ink-secondary">#{o._id.slice(-8).toUpperCase()} · {o.status}</span>
                    <span className="text-gold-300">{formatINR(o.totalAmount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
