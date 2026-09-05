import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { AlertToast } from '../components/common/AlertToast';
import { StarRating } from '../components/common/StarRating';

export function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Owners list for dropdown selection
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // Add Store Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    description: '',
    ownerId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        sortBy,
        sortOrder,
      });

      if (search.trim()) params.append('search', search.trim());

      const response = await api.get(`/admin/stores?${params.toString()}`);
      setStores(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search]);

  const fetchOwners = async () => {
    setLoadingOwners(true);
    try {
      const response = await api.get('/admin/users?limit=100');
      const filtered = (response.data || []).filter(
        (u) => u.role === 'STORE_OWNER' || u.role === 'ADMIN'
      );
      setOwners(filtered);
      if (filtered.length > 0 && !newStore.ownerId) {
        setNewStore((prev) => ({ ...prev, ownerId: filtered[0].id }));
      }
    } catch (err) {
      console.error('Failed to load store owners:', err);
    } finally {
      setLoadingOwners(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenModal = () => {
    fetchOwners();
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStores();
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const validateForm = () => {
    const errs = {};
    if (!newStore.name || !newStore.name.trim()) {
      errs.name = 'Store name is required';
    }
    if (!newStore.address || !newStore.address.trim()) {
      errs.address = 'Store address is required';
    }
    if (!newStore.ownerId) {
      errs.ownerId = 'Assigned store owner is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/stores', newStore);
      setSuccess(`Store "${newStore.name}" registered successfully`);
      setIsModalOpen(false);
      setNewStore({ name: '', email: '', address: '', description: '', ownerId: '' });
      setFormErrors({});
      fetchStores();
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        setError(err.details.join(', '));
      } else {
        setError(err.message || 'Failed to create store');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', title: 'Store Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true, render: (val) => val || '—' },
    { key: 'address', title: 'Address', sortable: true },
    {
      key: 'owner',
      title: 'Store Owner',
      sortable: false,
      render: (owner) => (owner ? `${owner.name}` : 'Unassigned'),
    },
    {
      key: 'averageRating',
      title: 'Overall Rating',
      sortable: true,
      render: (val, store) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <StarRating value={Math.round(val || 0)} readOnly size={14} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {val > 0 ? val.toFixed(1) : 'No Ratings'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({store.ratingCount || 0})
          </span>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Store Management</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
            Register new stores and assign them to Store Owners.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenModal}>
          Add Store
        </Button>
      </div>

      {error && <AlertToast type="error" message={error} />}
      {success && <AlertToast type="success" message={success} />}

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '0.875rem 1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px' }}>
            <Input
              label="Search Stores"
              placeholder="Search by store name or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>

          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>
      </div>

      {/* Stores Table */}
      <Table
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={loading}
        emptyMessage="No stores found matching criteria."
      />

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          totalCount={meta.totalCount}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Add Store Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormErrors({});
        }}
        title="Register New Store"
      >
        <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <Input
            label="Store Name"
            placeholder="Enter store name"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="Store Email (Optional)"
            type="email"
            placeholder="Enter store email"
            value={newStore.email}
            onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
          />

          <Input
            label="Store Address"
            placeholder="Enter store address"
            value={newStore.address}
            onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            error={formErrors.address}
            required
          />

          <Select
            label="Assigned Store Owner"
            value={newStore.ownerId}
            onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
            disabled={loadingOwners}
            options={
              owners.length > 0
                ? owners.map((o) => ({
                    value: o.id,
                    label: `${o.name} (${o.email})`,
                  }))
                : [{ value: '', label: 'No Store Owners found' }]
            }
            error={formErrors.ownerId}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Store
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
