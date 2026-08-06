import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { RowSkeleton } from '../../components/ui/Skeleton';
import { formatINR } from '../../components/ui/Price';

const emptyForm = {
  name: '', category: '', description: '', price: '', discountPrice: '', stock: '',
  material: 'Gold', purity: '', weight: '', gemstone: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([getProducts({ limit: 100 }), getCategories()])
      .then(([p, c]) => {
        setProducts(p.data.data);
        setCategories(c.data.data);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFiles([]);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category?._id || '', description: p.description,
      price: p.price, discountPrice: p.discountPrice || '', stock: p.stock,
      material: p.material, purity: p.purity || '', weight: p.weight || '', gemstone: p.gemstone || '',
    });
    setFiles([]);
    setModalOpen(true);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append('images', f));

      if (editing) {
        await updateProduct(editing._id, fd);
        toast.success('Product updated');
      } else {
        await createProduct(fd);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStock = async (id, stock) => {
    try {
      await updateStock(id, { stock: Number(stock) });
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock: Number(stock) } : p)));
    } catch {
      toast.error('Stock update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Inventory</p>
          <h1 className="mt-2 font-display text-3xl text-ink-primary">Products</h1>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <HiOutlinePlus /> Add Product
        </button>
      </div>

      <div className="mt-8 card-surface overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-strong/30 text-ink-inverse">
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-strong/20">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="p-3"><RowSkeleton /></td></tr>
              ))
            ) : products.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-inverse">No products yet. Add your first piece.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="text-ink-secondary">
                  <td className="px-5 py-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=100&auto=format&fit=crop'}
                      alt=""
                      className="h-10 w-10 rounded-xs object-cover"
                    />
                    <span className="text-ink-primary">{p.name}</span>
                  </td>
                  <td className="px-5 py-4">{p.category?.name}</td>
                  <td className="px-5 py-4">{formatINR(p.discountPrice > 0 ? p.discountPrice : p.price)}</td>
                  <td className="px-5 py-4">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.stock}
                      onBlur={(e) => e.target.value !== String(p.stock) && handleQuickStock(p._id, e.target.value)}
                      className="w-16 rounded-xs border border-ink-primary/15 bg-surface-muted px-2 py-1 text-ink-primary focus:border-gold-400 focus:outline-none"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} className="text-ink-secondary hover:text-gold-300">
                        <HiOutlinePencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(p._id)} aria-label={`Delete ${p.name}`} className="text-ink-secondary hover:text-surface-strong">
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" required placeholder="Product name" value={form.name} onChange={handleChange} className="input-field col-span-2" />
            <select name="category" required value={form.category} onChange={handleChange} className="input-field col-span-2">
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <textarea name="description" required placeholder="Description" value={form.description} onChange={handleChange} rows={3} className="input-field col-span-2" />
            <input name="price" type="number" required placeholder="Price (₹)" value={form.price} onChange={handleChange} className="input-field" />
            <input name="discountPrice" type="number" placeholder="Discount price (optional)" value={form.discountPrice} onChange={handleChange} className="input-field" />
            <input name="stock" type="number" required placeholder="Stock quantity" value={form.stock} onChange={handleChange} className="input-field" />
            <select name="material" value={form.material} onChange={handleChange} className="input-field">
              {['Gold', 'Silver', 'Platinum', 'Diamond', 'Rose Gold', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input name="purity" placeholder="Purity e.g. 22K" value={form.purity} onChange={handleChange} className="input-field" />
            <input name="weight" type="number" step="0.1" placeholder="Weight (grams)" value={form.weight} onChange={handleChange} className="input-field" />
            <input name="gemstone" placeholder="Gemstone (optional)" value={form.gemstone} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label className="eyebrow mb-2 block">Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-ink-secondary file:mr-4 file:rounded-sm file:border-0 file:bg-gold-400 file:px-4 file:py-2 file:text-surface-base file:font-semibold"
            />
            {editing && <p className="mt-1 text-xs text-ink-inverse">Uploading new images adds to existing ones.</p>}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
