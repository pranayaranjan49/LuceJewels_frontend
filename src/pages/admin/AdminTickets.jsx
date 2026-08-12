import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAllTickets, updateTicketStatus } from '../../api/endpoints';
import { formatINR } from '../../components/ui/Price';

const STATUSES = ['registered', 'under_process', 'resolved'];
const STATUS_LABEL = { registered: 'Registered', under_process: 'Under Process', resolved: 'Resolved' };
const STATUS_COLORS = {
  registered: 'bg-ink-inverse/20 text-ink-inverse',
  under_process: 'bg-gold-400/20 text-gold-600',
  resolved: 'bg-green-500/20 text-green-600',
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ registered: 0, under_process: 0, resolved: 0, total: 0 });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    getAllTickets(filter ? { status: filter } : {})
      .then((res) => {
        setTickets(res.data.data);
        setCounts(res.data.counts);
      })
      .catch(() => toast.error('Could not load tickets'))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateTicketStatus(id, status);
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, status } : t)));
      toast.success('Ticket status updated');
      fetchTickets(); // resync the counts badges
    } catch {
      toast.error('Could not update status');
    }
  };

  return (
    <div>
      <p className="eyebrow">Support</p>
      <h1 className="mt-2 font-display text-3xl text-ink-primary">Tickets</h1>

      <div className="mt-6 grid grid-cols-3 gap-4 sm:max-w-md">
        {STATUSES.map((s) => (
          <div key={s} className="card-surface p-4 text-center">
            <p className="font-display text-2xl text-ink-primary">
              {counts[s]} <span className="text-sm text-ink-inverse">/ {counts.total}</span>
            </p>
            <p className="mt-1 text-xs text-ink-inverse">{STATUS_LABEL[s]}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`rounded-sm px-4 py-2 text-xs uppercase ${!filter ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary'}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-sm px-4 py-2 text-xs uppercase ${filter === s ? 'bg-gold-400 text-ink-primary' : 'border border-ink-primary/20 text-ink-secondary'}`}>{STATUS_LABEL[s]}</button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-ink-inverse">Loading…</p>
        ) : tickets.length === 0 ? (
          <p className="text-sm text-ink-inverse">No tickets found.</p>
        ) : (
          tickets.map((t) => (
            <div key={t._id} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-ink-primary">{t.subject}</p>
                  <p className="mt-0.5 text-xs text-ink-inverse">
                    {t.user?.name} · {t.user?.email} · {t.user?.phone}
                  </p>
                  {t.order && (
                    <p className="mt-1 text-xs text-ink-secondary">
                      Order #{t.order._id?.slice(-8).toUpperCase()} · {formatINR(t.order.totalAmount)}
                    </p>
                  )}
                </div>
                <select
                  value={t.status}
                  onChange={(e) => handleStatusChange(t._id, e.target.value)}
                  className={`rounded-sm px-3 py-1.5 text-xs font-medium border-0 focus:outline-none ${STATUS_COLORS[t.status]}`}
                >
                  {STATUSES.map((s) => <option key={s} value={s} className="bg-surface-raised text-ink-primary">{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <p className="mt-3 text-sm text-ink-secondary">{t.description}</p>
              {t.photos?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.photos.map((p, i) => (
                    <button key={i} onClick={() => setLightboxUrl(p.url)}>
                      <img src={p.url} alt="" className="h-20 w-20 rounded-xs object-cover transition-opacity hover:opacity-80" />
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-ink-inverse">
                {new Date(t.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-surface-base/90 p-6 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} alt="Ticket attachment" className="max-h-[85vh] max-w-full rounded-xs" />
        </div>
      )}
    </div>
  );
}
