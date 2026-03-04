import React from 'react';
import StampCard from './StampCard';

const StampGallery = ({ stamps, groups, onAddToGroup, onCreateGroup }) => {
    if (stamps.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    No stamps found matching your criteria.
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search query.</p>
            </div>
        );
    }

    return (
        <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {stamps.map(stamp => (
                    <StampCard
                        key={stamp.id}
                        stamp={stamp}
                        groups={groups}
                        onAddToGroup={onAddToGroup}
                        onCreateGroup={onCreateGroup}
                    />
                ))}
            </div>
        </div>
    );
};

export default StampGallery;
