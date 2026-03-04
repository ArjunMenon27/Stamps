import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FilterSidebar from './components/FilterSidebar';
import StampGallery from './components/StampGallery';
import GroupCart from './components/GroupCart';
import AdminDashboard from './components/AdminDashboard';
import { Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [stamps, setStamps] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ years: [], types: [] });
  const [filters, setFilters] = useState({ year: '', type: '', search: '' });

  const [groups, setGroups] = useState([]);
  const [isGroupCartOpen, setIsGroupCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin view toggle
  const [isAdmin, setIsAdmin] = useState(false);

  const API_URL = 'http://localhost:3001/api';

  useEffect(() => {
    fetchFilters();
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchStamps();
  }, [filters]);

  // Refresh filter options when returning from admin (new stamps may have been added)
  useEffect(() => {
    if (!isAdmin) {
      fetchFilters();
      fetchStamps();
    }
  }, [isAdmin]);

  const fetchFilters = async () => {
    try {
      const res = await fetch(`${API_URL}/filters`);
      const data = await res.json();
      setFilterOptions(data);
    } catch (err) {
      console.error("Failed to fetch filters", err);
    }
  };

  const fetchStamps = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await fetch(`${API_URL}/stamps?${queryParams}`);
      const data = await res.json();
      setStamps(data);
    } catch (err) {
      console.error("Failed to fetch stamps", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  };

  const handleCreateGroup = async (name) => {
    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        fetchGroups();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create group");
      }
    } catch (err) {
      console.error("Error creating group", err);
    }
  };

  const handleAddToGroup = async (groupId, stampId) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stampId })
      });
      if (res.ok) fetchGroups();
    } catch (err) {
      console.error("Failed to add to group", err);
    }
  };

  const handleRemoveFromGroup = async (groupId, stampId) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}/items/${stampId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchGroups();
    } catch (err) {
      console.error("Failed to remove from group", err);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchGroups();
    } catch (err) {
      console.error("Failed to delete group", err);
    }
  };

  const totalGroupedStamps = groups.reduce((acc, group) => acc + (group.items ? group.items.length : 0), 0);

  return (
    <div className="app-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      <Navbar
        toggleShortlist={() => setIsGroupCartOpen(true)}
        shortlistCount={totalGroupedStamps}
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(v => !v)}
      />

      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <main style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
          />

          <div style={{ flexGrow: 1, minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, color: 'var(--accent-primary)' }}>
                <Loader2 className="animate-spin" size={48} />
              </div>
            ) : (
              <StampGallery
                stamps={stamps}
                onShortlist={() => { }}
                shortlist={[]}
                groups={groups}
                onAddToGroup={handleAddToGroup}
                onCreateGroup={handleCreateGroup}
              />
            )}
          </div>
        </main>
      )}

      {!isAdmin && (
        <GroupCart
          isOpen={isGroupCartOpen}
          onClose={() => setIsGroupCartOpen(false)}
          groups={groups}
          onCreateGroup={handleCreateGroup}
          onRemoveFromGroup={handleRemoveFromGroup}
          onDeleteGroup={handleDeleteGroup}
        />
      )}
    </div>
  );
}

export default App;
