import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ensureArray } from '@/lib/utils';

export default function ItemManager({ title, items, fields, onCreate, onUpdate, onDelete, createDefaults = {} }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const safeItems = ensureArray(items);

  const inputClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-[#005F54] focus:outline-none";
  const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground";

  const handleAdd = async () => {
    try {
      await onCreate(form);
      setForm({});
      setAdding(false);
      toast.success('Item added!');
    } catch (error) {
      toast.error(error.message || 'Unable to add item.');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await onUpdate(id, form);
      setEditingId(null);
      setForm({});
      toast.success('Updated!');
    } catch (error) {
      toast.error(error.message || 'Unable to update item.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await onDelete(id);
      toast.success('Deleted!');
    } catch (error) {
      toast.error(error.message || 'Unable to delete item.');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setAdding(false);
  };

  const renderFields = (isForm) => (
    <div className="grid md:grid-cols-2 gap-3">
      {fields.map(f => (
        <div key={f.key} className={f.fullWidth ? 'md:col-span-2' : ''}>
          <label className={labelClass}>{f.label}</label>
          {f.type === 'select' ? (
            <select value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputClass}>
              <option value="">Select...</option>
              {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea rows={3} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputClass + ' resize-none'} />
          ) : (
            <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputClass} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
        <button onClick={() => { setAdding(true); setEditingId(null); setForm({ ...createDefaults }); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#005F54] text-white rounded-xl text-sm font-medium hover:bg-[#004740] transition-colors">
          <Plus size={15} /> Add New
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="mb-5 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">New Entry</h3>
          {renderFields(true)}
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="flex items-center gap-1 px-4 py-2 bg-[#005F54] text-white rounded-lg text-sm font-medium hover:bg-[#004740]">
              <Check size={14} /> Save
            </button>
            <button onClick={() => setAdding(false)} className="flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-accent">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {safeItems.map(item => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            {editingId === item.id ? (
              <>
                {renderFields(false)}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleUpdate(item.id)} className="flex items-center gap-1 px-4 py-2 bg-[#005F54] text-white rounded-lg text-sm font-medium">
                    <Save size={14} /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground transition-colors hover:bg-accent">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {fields.slice(0, 2).map(f => (
                    <div key={f.key}>
                      {f.key === fields[0].key && <p className="font-semibold text-card-foreground">{item[f.key]}</p>}
                      {f.key === fields[1]?.key && item[f.key] && <p className="mt-0.5 text-sm text-muted-foreground">{item[f.key]}</p>}
                    </div>
                  ))}
                  {(item.description || item.text || item[fields[2]?.key]) && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description || item.text || item[fields[2]?.key]}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(item)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-[#005F54]">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {safeItems.length === 0 && !adding && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="mb-2">No items yet.</p>
            <button onClick={() => { setAdding(true); setForm({ ...createDefaults }); }} className="text-[#005F54] hover:underline text-sm">Add your first item →</button>
          </div>
        )}
      </div>
    </div>
  );
}
