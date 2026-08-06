import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    getCategories().then((res) => setCategories(res.data.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setEditing(null); setName(''); setDescription(''); setFile(null); setModalOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c); setName(c.name); setDescription(c.description || ''); setFile(null); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      if (file) fd.append('image', file);

      if (editing) {
        await updateCategory(editing._id, fd);
        toast.success('Category updated');
      } else {
        await createCategory(fd);
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this category?')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deactivated');
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-2 font-display text-3xl text-ink-primary">Categories</h1>
        </div>
        <button onClick={openCreate} className="btn-primary"><HiOutlinePlus /> Add Category</button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xs bg-surface-muted" />)
        ) : (
          categories.map((c) => (
            <div key={c._id} className="card-surface overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-surface-muted overflow-hidden">
                {c.image?.url ? (
                  <img src={c.image.url} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-ink-inverse text-sm">No image</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-ink-primary">{c.name}</h3>
                <p className="mt-1 text-xs text-ink-inverse line-clamp-2">{c.description}</p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => openEdit(c)} className="btn-ghost text-xs"><HiOutlinePencil size={14} /> Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="btn-ghost text-xs text-surface-strong"><HiOutlineTrash size={14} /> Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Category name (e.g. Rings)" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          <textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field" />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-ink-secondary file:mr-4 file:rounded-sm file:border-0 file:bg-gold-400 file:px-4 file:py-2 file:text-surface-base file:font-semibold" />
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save'}</button>
        </form>
      </Modal>
    </div>
  );
}
