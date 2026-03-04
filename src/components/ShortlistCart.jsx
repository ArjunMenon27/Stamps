import React from 'react';
import { X, Trash2, ShoppingCart } from 'lucide-react';
import '../index.css';

const ShortlistCart = ({ isOpen, onClose, shortlist, onRemove }) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 999
                }}
                onClick={onClose}
            />
            <div
                className="glass-panel"
                style={{
                    position: 'fixed',
                    top: 0, right: 0, bottom: 0,
                    width: '400px',
                    maxWidth: '100%',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    borderRight: 'none',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="font-serif" style={{ fontSize: '1.5rem', margin: 0 }}>Your Shortlist</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', flexGrow: 1, overflowY: 'auto' }}>
                    {shortlist.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                            <ShoppingCart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Your shortlist is empty.</p>
                            <p>Start exploring and add some stamps!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {shortlist.map(item => (
                                <div key={item.stampId} className="glass-card" style={{ display: 'flex', padding: '1rem', gap: '1rem', alignItems: 'center' }}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                                    />
                                    <div style={{ flexGrow: 1 }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{item.name}</h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.type} • {item.year}</p>
                                        {item.buyLinks && item.buyLinks.length > 0 && (
                                            <a href={item.buyLinks[0]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', display: 'inline-block', marginTop: '0.5rem', textDecoration: 'none' }}>
                                                Buy External ↗
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onRemove(item.stampId)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '0.5rem' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {shortlist.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
                        <button className="btn btn-primary" style={{ width: '100%' }}>
                            Proceed to View All ({shortlist.length})
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default ShortlistCart;
