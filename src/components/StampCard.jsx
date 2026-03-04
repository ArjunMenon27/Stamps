import React, { useState } from 'react';
import { PlusCircle, Bookmark, X } from 'lucide-react';
import '../index.css';

const StampCard = ({ stamp, groups, onAddToGroup, onCreateGroup }) => {
    const [showGroups, setShowGroups] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const handleCreateGroup = (e) => {
        e.preventDefault();
        if (newGroupName.trim()) {
            onCreateGroup(newGroupName);
            setNewGroupName('');
            setIsCreating(false);
        }
    };

    // Find which groups this stamp is already in
    const stampGroups = groups.filter(g => g.items.some(i => i.id === stamp.id));
    const isInAnyGroup = stampGroups.length > 0;

    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--surface-border)' }}>
                <img
                    src={stamp.imageUrl}
                    alt={stamp.name}
                    style={{ maxWidth: '100%', height: '220px', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))' }}
                />
            </div>

            <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 className="font-serif" style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>{stamp.name}</h3>
                    <span style={{ background: 'var(--accent-secondary)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0, marginLeft: '0.5rem' }}>
                        {stamp.year}
                    </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {stamp.type} • {new Date(stamp.date).toLocaleDateString()}
                </p>

                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.5rem', flexGrow: 1 }}>
                    {stamp.description}
                </p>

                {/* Badges for groups it is already in */}
                {isInAnyGroup && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                        {stampGroups.map(g => (
                            <span key={g.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', border: '1px solid var(--accent-primary)' }}>
                                <Bookmark size={12} color="var(--accent-primary)" />
                                {g.name}
                            </span>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                        className="btn btn-primary"
                        style={{ flexGrow: 1, padding: '0.75rem' }}
                        onClick={() => setShowGroups(!showGroups)}
                    >
                        <PlusCircle size={18} /> Add to Group
                    </button>
                </div>
            </div>

            {/* Group Selection Overlay */}
            {showGroups && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'var(--surface-main)',
                    backdropFilter: 'blur(8px)',
                    padding: '1.5rem',
                    display: 'flex', flexDirection: 'column',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0 }}>Select a Group</h4>
                        <button onClick={() => setShowGroups(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flexGrow: 1, marginBottom: '1rem' }}>
                        {groups.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No groups created yet.</p>
                        ) : (
                            groups.map(group => {
                                const inGroup = group.items.some(i => i.id === stamp.id);
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => {
                                            if (!inGroup) {
                                                onAddToGroup(group.id, stamp.id);
                                                setShowGroups(false);
                                            }
                                        }}
                                        disabled={inGroup}
                                        style={{
                                            padding: '0.75rem',
                                            background: inGroup ? 'var(--surface-hover)' : 'rgba(0,0,0,0.3)',
                                            border: `1px solid ${inGroup ? 'var(--accent-primary)' : 'var(--surface-border)'}`,
                                            borderRadius: 'var(--radius-sm)',
                                            color: 'white',
                                            cursor: inGroup ? 'default' : 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <span>{group.name}</span>
                                        {inGroup && <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>Added</span>}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        {isCreating ? (
                            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="Group Name..."
                                    autoFocus
                                    style={{
                                        padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--accent-primary)',
                                        borderRadius: 'var(--radius-sm)', color: 'white', outline: 'none', fontSize: '0.85rem'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', flexGrow: 1, fontSize: '0.85rem' }}>Save</button>
                                    <button type="button" onClick={() => setIsCreating(false)} style={{ background: 'var(--surface-hover)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                style={{
                                    width: '100%', padding: '0.75rem',
                                    background: 'rgba(255, 123, 84, 0.1)', border: '1px solid var(--accent-primary)',
                                    borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)',
                                    cursor: 'pointer', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                    transition: 'all 0.2s ease', fontWeight: 500
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 123, 84, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 123, 84, 0.1)';
                                }}
                            >
                                <PlusCircle size={16} /> Create New Group
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StampCard;
