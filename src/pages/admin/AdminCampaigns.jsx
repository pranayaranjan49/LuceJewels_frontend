import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineChatAlt2 } from 'react-icons/hi';
import { sendCampaign, getCampaigns } from '../../api/endpoints';

const CHANNELS = [
  { value: 'email', label: 'Email only', icon: HiOutlineMail },
  { value: 'sms', label: 'SMS only', icon: HiOutlineChatAlt2 },
  { value: 'both', label: 'Email + SMS', icon: HiOutlineMail },
];

export default function AdminCampaigns() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('email');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(() => {
    getCampaigns().then((res) => setHistory(res.data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!confirm('Send this to ALL opted-in registered users now?')) return;
    setSending(true);
    try {
      await sendCampaign({ title, message, channel });
      toast.success('Campaign sent');
      setTitle(''); setMessage('');
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Marketing</p>
      <h1 className="mt-2 font-display text-3xl text-ink-primary">Campaigns</h1>
      <p className="mt-2 text-sm text-ink-inverse max-w-xl">
        Broadcast an offer or announcement to every registered user by email and/or SMS.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSend} className="card-surface p-7 lg:col-span-1 space-y-4 h-fit">
          <input required placeholder="Title (e.g. Diwali Sale — 20% Off)" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
          <textarea required placeholder="Message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="input-field" />
          <div className="flex flex-col gap-2">
            {CHANNELS.map(({ value, label, icon: Icon }) => (
              <label key={value} className={`flex items-center gap-3 rounded-xs border px-4 py-3 cursor-pointer transition-colors ${channel === value ? 'border-gold-400 bg-gold-400/10' : 'border-ink-primary/15'}`}>
                <input type="radio" name="channel" value={value} checked={channel === value} onChange={() => setChannel(value)} className="accent-gold-400" />
                <Icon size={16} className="text-gold-300" />
                <span className="text-sm text-ink-primary">{label}</span>
              </label>
            ))}
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? 'Sending…' : 'Send Broadcast'}
          </button>
        </form>

        <div className="lg:col-span-2 card-surface p-7">
          <h2 className="font-display text-xl text-ink-primary">Campaign History</h2>
          {loading ? (
            <p className="mt-4 text-sm text-ink-inverse">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-4 text-sm text-ink-inverse">No campaigns sent yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {history.map((c) => (
                <div key={c._id} className="rounded-xs bg-surface-muted p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-ink-primary">{c.title}</h3>
                    <span className="text-xs text-ink-inverse">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-secondary">{c.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-inverse">
                    <span className="rounded-sm bg-surface-strong/40 px-3 py-1">{c.recipientCount} recipients</span>
                    {(c.channel === 'email' || c.channel === 'both') && (
                      <span className="rounded-sm bg-surface-strong/40 px-3 py-1">✉ {c.stats.emailSent} sent / {c.stats.emailFailed} failed</span>
                    )}
                    {(c.channel === 'sms' || c.channel === 'both') && (
                      <span className="rounded-sm bg-surface-strong/40 px-3 py-1">💬 {c.stats.smsSent} sent / {c.stats.smsFailed} failed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
