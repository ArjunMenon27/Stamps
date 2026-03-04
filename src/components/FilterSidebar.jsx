import React from 'react';
import { Calendar, Tag, Search, Filter } from 'lucide-react';
import '../index.css';

const FilterSidebar = ({ filters, setFilters, filterOptions }) => {
    const { years, types } = filterOptions;

    const handleYearChange = (e) => {
        setFilters({ ...filters, year: e.target.value });
    };

    const handleTypeChange = (e) => {
        setFilters({ ...filters, type: e.target.value });
    };

    const handleSearchChange = (e) => {
        setFilters({ ...filters, search: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ year: '', type: '', search: '' });
    };

    return (
        <aside className="glass-panel" style={{ padding: '1.5rem', width: '280px', flexShrink: 0, alignSelf: 'start', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={20} color="var(--accent-secondary)" />
                    Filters
                </h2>
                <button
                    onClick={clearFilters}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                    Clear All
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={16} /> Search Collection
                </label>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-color)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)'
                    }}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} /> Year Issued
                </label>
                <select
                    value={filters.year}
                    onChange={handleYearChange}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-color)',
                        border: '1px solid var(--surface-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                        outline: 'none',
                        fontFamily: 'var(--font-sans)'
                    }}
                >
                    <option value="">All Years</option>
                    {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={16} /> Stamp Type
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="type"
                            value=""
                            checked={filters.type === ''}
                            onChange={handleTypeChange}
                        />
                        All Types
                    </label>
                    {types.map(t => (
                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="type"
                                value={t}
                                checked={filters.type === t}
                                onChange={handleTypeChange}
                            />
                            {t}
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
