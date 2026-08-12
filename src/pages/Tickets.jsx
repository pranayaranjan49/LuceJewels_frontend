import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineShoppingBag, HiOutlineX } from 'react-icons/hi';
import { createTicket, getMyTickets, getMyOrders } from '../api/endpoints';
import OrderPickerModal from '../components/shop/OrderPickerModal';
import { formatINR } from '../components/ui/Price';
import FloatingBlobs from '../components/ui/FloatingBlobs';

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 5;

const STATUS_STYLES = {
  registered: 'bg-ink-inverse/20 text-ink-inverse',
  under_process: 'bg-gold-400/20 text-gold-600',
  resolved: 'bg-green-500/20 text-green-600',
};
const STATUS_LABEL = { registered: 'Registered', under_process: 'Under Process', resolved: 'Resolved' };

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([getMyTickets(), getMyOrders()])
      .then(([tRes, oRes]) => {
        setTickets(tRes.data.data);
        setOrders(oRes.data.data);
      })
      .catch(() => toast.error('Could not load tickets'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    const tooBig = files.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooBig) return toast.error(`"${tooBig.name}" is over ${MAX_SIZE_MB}MB`);
    if (photos.length + files.length > MAX_PHOTOS) return toast.error(`You can attach up to ${MAX_PHOTOS} photos`);
    setPhotos((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description) return toast.error('Please fill in subject and description');

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('subject', subject);
      fd.append('description', description);
      if (selectedOrder) fd.append('order', selectedOrder._id);
      photos.forEach((p) => fd.append('photos', p));

      await createTicket(fd);
      toast.success('Ticket raised — our team will review it shortly');
      setSubject(''); setDescription(''); setSelectedOrder(null); setPhotos([]);
      setFormOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not raise ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <FloatingBlobs />
      <div className="relative z-10 mx-auto max-w-3xl px-6 py-14 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Support</p>
            <h1 className="mt-2 font-display text-3xl text-ink-primary">My Tickets</h1>
          </div>
          <button onClick={() => setFormOpen((o) => !o)} className="btn-primary">
            <HiOutlinePlus /> Raise a Ticket
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSubmit} className="card-surface mt-6 space-y-4 p-6">
            <input required placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" />
            <textarea required placeholder="Describe the issue…" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" />

            <div>
              <button type="button" onClick={() => setPickerOpen(true)} className="btn-secondary text-sm">
                <HiOutlineShoppingBag size={16} /> {selectedOrder ? 'Change Order' : 'Link an Order (optional)'}
              </button>
              {selectedOrder && (
                <div className="mt-3 flex items-center justify-between rounded-xs border border-surface-strong bg-surface-strong/20 px-4 py-3">
                  <div>
                    <p className="text-sm text-ink-primary">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-ink-inverse">{formatINR(selectedOrder.totalAmount)}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedOrder(null)} aria-label="Remove order"><HiOutlineX size={16} className="text-ink-secondary" /></button>
                </div>
              )}
            </div>

            <div>
              <label className="eyebrow mb-2 block">Photos (optional, up to {MAX_PHOTOS}, max {MAX_SIZE_MB}MB each)</label>
              <input type="file" accept="image/*" multiple onChange={handlePhotos} className="text-sm text-ink-secondary" />
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {photos.map((p, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(p)} alt="" className="h-16 w-16 rounded-xs object-cover" />
                      <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-strong text-ink-primary">
                        <HiOutlineX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </form>
        )}

        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-ink-inverse">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-ink-inverse">No tickets raised yet.</p>
          ) : (
            tickets.map((t) => (
              <div key={t._id} className="card-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg text-ink-primary">{t.subject}</p>
                    {t.order && <p className="mt-0.5 text-xs text-ink-inverse">Order #{t.order._id?.slice(-8).toUpperCase()}</p>}
                  </div>
                  <span className={`whitespace-nowrap rounded-sm px-3 py-1 text-xs font-medium ${STATUS_STYLES[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-secondary">{t.description}</p>
                {t.photos?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {t.photos.map((p, i) => (
                      <img key={i} src={p.url} alt="" className="h-16 w-16 rounded-xs object-cover" />
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-ink-inverse">{new Date(t.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <OrderPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        orders={orders}
        onSelect={(order) => { setSelectedOrder(order); setPickerOpen(false); }}
      />
    </div>
  );
}
