import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEyeOff, HiOutlineEye } from 'react-icons/hi';
import {
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../../api/endpoints';
import Modal from '../../components/ui/Modal';

const emptyForm = { title: '', subtitle: '', ctaLabel: 'Shop Now', ctaLink: '/shop', order: 0, isActive: true };

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    getAllBannersAdmin()
      .then((res) => setBanners(res.data.data))
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title, subtitle: b.subtitle || '', ctaLabel: b.ctaLabel || 'Shop Now',
      ctaLink: b.ctaLink || '/shop', order: b.order || 0, isActive: b.isActive,
    });
    setFile(null);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !file) return toast.error('Please choose an image for this banner');

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);

      if (editing) {
        await updateBanner(editing._id, fd);
        toast.success('Banner updated');
      } else {
        await createBanner(fd);
        toast.success('Banner created');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(!b.isActive));
      await updateBanner(b._id, fd);
      fetchAll();
    } catch {
      toast.error('Could not update banner');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner permanently?')) return;
    try {
      await deleteBanner(id);
      toast.success('Banner deleted');
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Storefront</p>
          <h1 className="mt-2 font-display text-3xl text-ink-primary">Homepage Banners</h1>
          <p className="mt-2 text-sm text-ink-inverse max-w-lg">
            These images auto-slide on your homepage hero section. Lower "order" shows first.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary"><HiOutlinePlus /> Add Banner</button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xs bg-surface-muted" />)
        ) : banners.length === 0 ? (
          <p className="col-span-full text-sm text-ink-inverse">No banners yet — the homepage is showing default placeholder slides until you add some.</p>
        ) : (
          banners.map((b) => (
            <div key={b._id} className={`card-surface overflow-hidden ${!b.isActive ? 'opacity-50' : ''}`}>
              <div className="h-36 overflow-hidden bg-surface-muted">
                <img src={b.image?.url} alt={b.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-ink-primary">{b.title}</h3>
                  <span className="text-xs text-ink-inverse">#{b.order}</span>
                </div>
                <p className="mt-1 text-xs text-ink-inverse line-clamp-2">{b.subtitle}</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => openEdit(b)} className="btn-ghost text-xs"><HiOutlinePencil size={14} /> Edit</button>
                  <button onClick={() => toggleActive(b)} className="btn-ghost text-xs">
                    {b.isActive ? <><HiOutlineEyeOff size={14} /> Hide</> : <><HiOutlineEye size={14} /> Show</>}
                  </button>
                  <button onClick={() => handleDelete(b._id)} className="btn-ghost text-xs text-surface-strong"><HiOutlineTrash size={14} /> Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Banner' : 'Add Banner'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="title" required placeholder="Headline (e.g. Jewellery worth passing down.)" value={form.title} onChange={handleChange} className="input-field" />
          <textarea name="subtitle" placeholder="Subtitle text" value={form.subtitle} onChange={handleChange} rows={2} className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <input name="ctaLabel" placeholder="Button label" value={form.ctaLabel} onChange={handleChange} className="input-field" />
            <input name="ctaLink" placeholder="Button link (e.g. /shop)" value={form.ctaLink} onChange={handleChange} className="input-field" />
          </div>
          <input name="order" type="number" placeholder="Display order (0 = first)" value={form.order} onChange={handleChange} className="input-field" />

          <div>
            <label className="eyebrow mb-2 block">Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-ink-secondary file:mr-4 file:rounded-sm file:border-0 file:bg-gold-400 file:px-4 file:py-2 file:text-ink-primary file:font-semibold"
            />
            {editing && <p className="mt-1 text-xs text-ink-inverse">Leave empty to keep the current image. Recommended: wide landscape photo, at least 1600px.</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-secondary">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-gold-400" />
            Show on homepage
          </label>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Banner'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
