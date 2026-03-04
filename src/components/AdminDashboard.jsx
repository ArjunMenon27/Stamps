import React, { useState, useEffect, useRef } from 'react';
import {
    UploadCloud, Plus, Pencil, Trash2, X, Check, Image,
    Layers, Calendar, Tag, FileText, Link, Search, ChevronLeft, ChevronRight
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';
const STAMP_TYPES = ['Commemorative', 'Definitive', 'Special', 'Miniature Sheet'];
const PAGE_SIZE = 10;

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                background: `${color}22`,
                borderRadius: '12px',
                padding: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={24} color={color} />
            </div>
            <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>{value}</div>
            </div>
        </div>
    );
}

// ─── Image Preview ─────────────────────────────────────────────────────────────
function ImagePreview({ src, size = 48 }) {
    const [err, setErr] = useState(false);
    const fullSrc = src && src.startsWith('/') ? `http://localhost:3001${src}` : src;
    if (!src || err) {
        return (
            <div style={{
                width: size, height: size, borderRadius: 8,
                background: 'var(--surface-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                <Image size={size * 0.45} color="var(--text-muted)" />
            </div>
        );
    }
    return (
        <img
            src={fullSrc}
            alt="stamp"
            onError={() => setErr(true)}
            style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8, flexShrink: 0, border: '1px solid var(--surface-border)' }}
        />
    );
}

// ─── Stamp Form Modal ──────────────────────────────────────────────────────────
function StampFormModal({ stamp, onClose, onSave }) {
    const isEdit = !!stamp;
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: stamp?.name || '',
        year: stamp?.year || new Date().getFullYear(),
        date: stamp?.date || '',
        type: stamp?.type || STAMP_TYPES[0],
        description: stamp?.description || '',
        buyLinks: stamp?.buyLinks?.join('\n') || '',
        imageUrl: stamp?.imageUrl || '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(stamp?.imageUrl || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setForm(f => ({ ...f, imageUrl: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.year || !form.type) {
            setError('Name, year, and type are required.');
            return;
        }
        setSaving(true);
        setError('');

        const data = new FormData();
        data.append('name', form.name.trim());
        data.append('year', form.year);
        data.append('date', form.date);
        data.append('type', form.type);
        data.append('description', form.description);

        const buyLinksArr = form.buyLinks.split('\n').map(s => s.trim()).filter(Boolean);
        buyLinksArr.forEach(l => data.append('buyLinks', l));

        if (imageFile) {
            data.append('image', imageFile);
        } else {
            data.append('imageUrl', form.imageUrl);
        }

        try {
            const url = isEdit ? `${API_URL}/admin/stamps/${stamp.id}` : `${API_URL}/admin/stamps`;
            const method = isEdit ? 'PUT' : 'POST';
            const res = await fetch(url, { method, body: data });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Save failed');
            }
            const saved = await res.json();
            onSave(saved);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-primary)',
        padding: '0.6rem 0.9rem',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.9rem',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.35rem',
        fontWeight: 500
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: 600,
                maxHeight: '90vh', overflowY: 'auto',
                padding: '2rem'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                        {isEdit ? 'Edit Stamp' : 'Add New Stamp'}
                    </h2>
                    <button onClick={onClose} className="btn btn-outline" style={{ padding: '0.4rem' }}>
                        <X size={18} />
                    </button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(220,53,69,0.15)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: 8, padding: '0.75rem 1rem', color: '#f87171', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Image Upload Area */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={labelStyle}>Stamp Image</label>
                        <div
                            style={{
                                border: '2px dashed var(--surface-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '1.5rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                                background: 'rgba(255,255,255,0.02)'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith('image/')) {
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                    setForm(f => ({ ...f, imageUrl: '' }));
                                }
                            }}
                        >
                            {imagePreview ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                    <ImagePreview src={imagePreview} size={100} />
                                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>Click or drag to replace image</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                    <UploadCloud size={36} color="var(--text-muted)" />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click or drag & drop to upload image</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>PNG, JPG, WEBP up to 5MB</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.75rem 0' }}>
                            <div style={{ flex: 1, height: 1, background: 'var(--surface-border)' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>OR</span>
                            <div style={{ flex: 1, height: 1, background: 'var(--surface-border)' }} />
                        </div>

                        <input
                            type="url"
                            placeholder="Paste image URL (e.g. https://...)"
                            value={form.imageUrl}
                            onChange={e => {
                                setForm(f => ({ ...f, imageUrl: e.target.value }));
                                setImageFile(null);
                                setImagePreview(e.target.value);
                            }}
                            style={inputStyle}
                        />
                    </div>

                    {/* Name */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Stamp Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Gandhi Centenary Issue"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {/* Year + Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Year *</label>
                            <input
                                type="number"
                                placeholder="e.g. 1969"
                                value={form.year}
                                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                                required
                                min="1800"
                                max="2100"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Issue Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Type */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Type *</label>
                        <select
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                            style={{ ...inputStyle, cursor: 'pointer' }}
                        >
                            {STAMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            placeholder="Short description of the stamp..."
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    {/* Buy Links */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={labelStyle}>Buy Links (one per line)</label>
                        <textarea
                            placeholder="https://example.com/buy/stamp&#10;https://another-site.com/stamp"
                            value={form.buyLinks}
                            onChange={e => setForm(f => ({ ...f, buyLinks: e.target.value }))}
                            rows={2}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (isEdit ? <><Check size={16} /> Save Changes</> : <><Plus size={16} /> Add Stamp</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ stamp, onClose, onConfirm, loading }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1001,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: 420, width: '100%', textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(220,53,69,0.15)', borderRadius: '50%', padding: '1rem' }}>
                        <Trash2 size={28} color="#f87171" />
                    </div>
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>Delete Stamp?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    "<strong style={{ color: 'var(--text-primary)' }}>{stamp.name}</strong>" will be permanently removed from the collection.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className="btn"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{ background: '#dc3545', color: 'white' }}
                    >
                        {loading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [stamps, setStamps] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);

    const [showForm, setShowForm] = useState(false);
    const [editingStamp, setEditingStamp] = useState(null);
    const [deletingStamp, setDeletingStamp] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [stampsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/admin/stamps`),
                fetch(`${API_URL}/admin/stats`)
            ]);
            setStamps(await stampsRes.json());
            setStats(await statsRes.json());
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Filtered + paginated
    const filtered = stamps.filter(s => {
        const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
            String(s.year).includes(search);
        const matchesType = !typeFilter || s.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSave = async (saved) => {
        setShowForm(false);
        setEditingStamp(null);
        showToast(editingStamp ? 'Stamp updated successfully' : 'Stamp added successfully');
        await fetchData();
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/stamps/${deletingStamp.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setDeletingStamp(null);
            showToast('Stamp deleted');
            await fetchData();
        } catch (err) {
            showToast('Failed to delete stamp', 'error');
        } finally {
            setDeleteLoading(false);
        }
    };

    const typeColors = {
        'Commemorative': 'var(--accent-primary)',
        'Definitive': 'var(--accent-secondary)',
        'Special': 'var(--accent-success)',
        'Miniature Sheet': '#a78bfa'
    };

    return (
        <div style={{ padding: '0 0 3rem' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 2000,
                    background: toast.type === 'error' ? 'rgba(220,53,69,0.9)' : 'rgba(42,157,143,0.9)',
                    color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-lg)', fontSize: '0.9rem', fontWeight: 500,
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.2s ease'
                }}>
                    {toast.message}
                </div>
            )}

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem' }}>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>Manage your stamp collection</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingStamp(null); setShowForm(true); }}
                >
                    <Plus size={18} /> Add Stamp
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <StatCard icon={Layers} label="Total Stamps" value={stats.totalStamps} color="var(--accent-primary)" />
                    <StatCard icon={Tag} label="Stamp Groups" value={stats.totalGroups} color="var(--accent-secondary)" />
                    <StatCard icon={Calendar} label="Oldest Year" value={stats.yearRange?.minYear || '—'} color="var(--accent-success)" />
                    <StatCard icon={Calendar} label="Newest Year" value={stats.yearRange?.maxYear || '—'} color="#a78bfa" />
                </div>
            )}

            {/* Type Breakdown */}
            {stats?.typeBreakdown?.length > 0 && (
                <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 500 }}>Type Breakdown</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {stats.typeBreakdown.map(t => (
                            <div key={t.type} style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-full)',
                                padding: '0.35rem 0.9rem', fontSize: '0.85rem'
                            }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[t.type] || '#fff', flexShrink: 0 }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{t.type}</span>
                                <span style={{ fontWeight: 700 }}>{t.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Search stamps..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: 'var(--radius-full)',
                            color: 'var(--text-primary)',
                            padding: '0.55rem 0.9rem 0.55rem 2.25rem',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-full)',
                        color: typeFilter ? 'var(--text-primary)' : 'var(--text-muted)',
                        padding: '0.55rem 1rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <option value="">All Types</option>
                    {STAMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                    {filtered.length} stamp{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading stamps...</div>
                ) : paginated.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {search || typeFilter ? 'No stamps match your search.' : 'No stamps yet. Click "Add Stamp" to get started.'}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                {['Image', 'Name', 'Year', 'Type', 'Description', 'Actions'].map(h => (
                                    <th key={h} style={{
                                        padding: '0.9rem 1rem',
                                        textAlign: h === 'Actions' ? 'right' : 'left',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        color: 'var(--text-secondary)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((stamp, idx) => (
                                <tr
                                    key={stamp.id}
                                    style={{
                                        borderBottom: idx < paginated.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                        transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <ImagePreview src={stamp.imageUrl} size={48} />
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', maxWidth: 200 }}>{stamp.name}</div>
                                        {stamp.date && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{stamp.date}</div>}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                                        {stamp.year}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.7rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: `${typeColors[stamp.type] || '#888'}22`,
                                            color: typeColors[stamp.type] || 'var(--text-secondary)',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {stamp.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.825rem', maxWidth: 260 }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {stamp.description || '—'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 0.7rem', marginRight: '0.5rem' }}
                                            onClick={() => { setEditingStamp(stamp); setShowForm(true); }}
                                            title="Edit"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ padding: '0.4rem 0.7rem', background: 'rgba(220,53,69,0.15)', color: '#f87171', border: '1px solid rgba(220,53,69,0.3)' }}
                                            onClick={() => setDeletingStamp(stamp)}
                                            title="Delete"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{
                        padding: '0.75rem 1.25rem',
                        borderTop: '1px solid var(--surface-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                            Page {page} of {totalPages}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-outline"
                                style={{ padding: '0.4rem 0.7rem' }}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="btn btn-outline"
                                style={{ padding: '0.4rem 0.7rem' }}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showForm && (
                <StampFormModal
                    stamp={editingStamp}
                    onClose={() => { setShowForm(false); setEditingStamp(null); }}
                    onSave={handleSave}
                />
            )}
            {deletingStamp && (
                <DeleteConfirmModal
                    stamp={deletingStamp}
                    onClose={() => setDeletingStamp(null)}
                    onConfirm={handleDelete}
                    loading={deleteLoading}
                />
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                select option { background: #1a1f2a; color: #e6edf3; }
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
            `}</style>
        </div>
    );
}
