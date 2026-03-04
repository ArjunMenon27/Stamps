import React from 'react';
import { Mail, Bookmark, LayoutDashboard } from 'lucide-react';
import '../index.css';

const Navbar = ({ toggleShortlist, shortlistCount, isAdmin, onToggleAdmin }) => {
    return (
        <nav className="glass-panel" style={{
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            position: 'sticky',
            top: '1rem',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={28} color="var(--accent-primary)" />
                <h1 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                    Arjuns <span style={{ color: 'var(--accent-primary)' }}>Stamps</span>
                </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {/* Admin toggle */}
                <button
                    className={isAdmin ? 'btn btn-primary' : 'btn btn-outline'}
                    onClick={onToggleAdmin}
                    title={isAdmin ? 'Back to Gallery' : 'Admin Dashboard'}
                >
                    <LayoutDashboard size={18} />
                    <span>{isAdmin ? 'Gallery' : 'Admin'}</span>
                </button>

                {/* Stamp Groups — only shown in gallery view */}
                {!isAdmin && (
                    <button
                        className="btn btn-outline"
                        onClick={toggleShortlist}
                        style={{ position: 'relative' }}
                    >
                        <Bookmark size={20} />
                        <span>Stamp Group</span>
                        {shortlistCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'var(--accent-primary)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>
                                {shortlistCount}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
