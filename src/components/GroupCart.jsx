import React, { useState } from 'react';
import { X, Trash2, Bookmark, Plus } from 'lucide-react';
import '../index.css';

const GroupCart = ({ isOpen, onClose, groups, onCreateGroup, onRemoveFromGroup, onDeleteGroup }) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            onCreateGroup(newGroupName);
            setNewGroupName('');
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 999
                }}
                onClick={onClose}
            />
            <div
                className="glass-panel"
                style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0,
                    width: '450px', maxWidth: '100%', zIndex: 1000,
                    display: 'flex', flexDirection: 'column',
                    borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="font-serif" style={{ fontSize: '1.5rem', margin: 0 }}>Your Stamp Groups</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', flexGrow: 1, overflowY: 'auto' }}>
                    {/* Create Group Section */}
                    <div style={{ marginBottom: '2rem' }}>
                        {isCreating ? (
                            <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="E.g., Wishlist, Asian Series"
                                    autoFocus
                                    style={{
                                        flexGrow: 1, padding: '0.75rem',
                                        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent-primary)',
                                        borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none'
                                    }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>Save</button>
                                <button type="button" onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: 'rgba(255, 123, 84, 0.1)', border: '1px dashed var(--accent-primary)',
                                    borderRadius: 'var(--radius-md)', color: 'var(--accent-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500
                                }}
                            >
                                <Plus size={18} /> Create New Group
                            </button>
                        )}
                    </div>

                    {/* Group List */}
                    {groups.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                            <Bookmark size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>You have no groups yet.</p>
                            <p>Create a group to start organizing your collection!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {groups.map(group => (
                                <div key={group.id} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-secondary)' }}>{group.name}</h3>
                                        {confirmingDelete === group.id ? (
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sure?</span>
                                                <button
                                                    onClick={() => { onDeleteGroup(group.id); setConfirmingDelete(null); }}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onClick={() => setConfirmingDelete(null)}
                                                    style={{ background: 'var(--surface-hover)', border: 'none', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmingDelete(group.id)}
                                                title="Delete entire group"
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                    padding: '0.3rem 0.6rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.8rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                                }}
                                            >
                                                <Trash2 size={14} /> Delete Group
                                            </button>
                                        )}
                                    </div>

                                    {group.items && group.items.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {group.items.map(item => (
                                                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                                                    />
                                                    <div style={{ flexGrow: 1 }}>
                                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{item.name}</h4>
                                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{item.type} • {item.year}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => onRemoveFromGroup(group.id, item.id)}
                                                        title="Remove from group"
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '0.5rem' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>This group is empty.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default GroupCart;
