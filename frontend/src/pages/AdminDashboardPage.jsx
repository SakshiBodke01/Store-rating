import { useState, useEffect, useCallback } from 'react';
import { Users, Store, Star, Search, Plus, ArrowUpDown, CheckCircle2, TrendingUp, Filter } from 'lucide-react';
import { api } from '../services/api';
import { AlertToast } from '../components/common/AlertToast';
import { Button } from '../components/common/Button';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { StarRating } from '../components/common/StarRating';

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' or 'users'
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [owners, setOwners] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });

  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    description: '',
    category: 'Electronics & Tech',
    phone: '',
    ownerId: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get('/admin/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Fetch Store Owners for dropdown
  const fetchOwners = useCallback(async () => {
    try {
      const res = await api.get('/admin/users?role=STORE_OWNER&limit=100');
      setOwners(res.data || []);
    } catch (err) {
      console.error('Failed to fetch owners:', err);
    }
  }, []);

  // Fetch Directory Table (Stores or Users)
  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'stores' ? '/admin/stores' : '/admin/users';
      const params = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();

      if (activeTab === 'stores' && categoryFilter) {
        params.category = categoryFilter;
      }

      if (activeTab === 'users' && roleFilter) {
        params.role = roleFilter;
      }

      const res = await api.get(endpoint, params);
      setTableData(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, totalCount: 0 });
    } catch (err) {
      setError(err.message || `Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, sortBy, sortOrder, search, categoryFilter, roleFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  // Handle Tab Switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch('');
    setCategoryFilter('');
    setRoleFilter('');
    setPage(1);
    setSortBy('name');
    setSortOrder('asc');
  };

  // Handle Sort Change
  const handleSortChange = (col, order) => {
    setSortBy(col);
    setSortOrder(order);
    setPage(1);
  };

  // Handle Add User Form Submission
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!newUser.name || newUser.name.trim().length < 20 || newUser.name.trim().length > 60) {
      errors.name = 'Full name must be between 20 and 60 characters.';
    }
    if (!newUser.email) errors.email = 'Email address is required.';
    if (!newUser.password) errors.password = 'Password is required.';
    if (!newUser.address || newUser.address.trim().length > 400) {
      errors.address = 'Address is required (max 400 chars).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/users', newUser);
      setSuccess(`User "${newUser.name}" created successfully.`);
      setIsAddUserOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchStats();
      fetchDirectory();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Store Form Submission
  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!newStore.name) errors.name = 'Store name is required.';
    if (!newStore.address) errors.address = 'Store address is required.';
    if (!newStore.ownerId) errors.ownerId = 'Store owner selection is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/stores', newStore);
      setSuccess(`Store "${newStore.name}" created successfully.`);
      setIsAddStoreOpen(false);
      setNewStore({ name: '', email: '', address: '', description: '', category: 'Electronics & Tech', phone: '', ownerId: '' });
      fetchStats();
      fetchDirectory();
    } catch (err) {
      setError(err.message || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  // Categories list
  const categoriesList = [
    { id: '', label: 'All Categories' },
    { id: 'Electronics & Tech', label: 'Electronics & Tech' },
    { id: 'Cafe & Food', label: 'Cafe & Food' },
    { id: 'Sweets & Confectionery', label: 'Sweets' },
    { id: 'Fashion & Paithani', label: 'Fashion & Paithani' },
  ];

  // Table Columns
  const storeColumns = [
    {
      key: 'name',
      title: 'STORE & VERIFICATION',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="store-name-title">{val}</span>
            <span className="verified-badge-pill">
              <CheckCircle2 size={11} /> Verified
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--forest-green)', background: 'var(--soft-sage)', padding: '0.1rem 0.45rem', borderRadius: '6px' }}>
              {row.category || 'Retail & Services'}
            </span>
            <span className="store-id-sub">ID: {row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'CONTACT INFO',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--deep-charcoal)' }}>{val || '—'}</div>
          {row.phone && <div style={{ fontSize: '0.75rem', color: 'var(--slate-gray)' }}>{row.phone}</div>}
        </div>
      ),
    },
    {
      key: 'address',
      title: 'LOCATION ADDRESS',
      sortable: true,
    },
    {
      key: 'averageRating',
      title: 'RATING SCORE',
      sortable: true,
      render: (val) => (
        <StarRating value={val || 0} readOnly showScore size={15} />
      ),
    },
  ];

  const userColumns = [
    {
      key: 'name',
      title: 'USER IDENTITY',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="store-name-title">{val}</div>
          <div className="store-id-sub">UID: {row.id}</div>
        </div>
      ),
    },
    { key: 'email', title: 'EMAIL ADDRESS', sortable: true },
    { key: 'address', title: 'LOCATION ADDRESS', sortable: true },
    {
      key: 'role',
      title: 'SYSTEM ROLE',
      sortable: true,
      render: (val) => (
        <span
          className={`role-pill-badge ${
            val === 'ADMIN'
              ? 'role-badge-admin'
              : val === 'STORE_OWNER'
              ? 'role-badge-owner'
              : 'role-badge-user'
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Overview */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">System Administration</h1>
          <p className="page-subtitle">
            StoreSphere metrics, verified local merchant directories, and user accounts.
          </p>
        </div>
      </div>

      {error && <AlertToast type="error" message={error} />}
      {success && <AlertToast type="success" message={success} />}

      {/* Metric Cards Row matching prompt rules:
         - Total Users: Forest Green icon
         - Registered Stores: Coral icon
         - Total Reviews: Gold Star icon
      */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-label">TOTAL USERS</span>
            <span className="stat-value">{stats.totalUsers}</span>
            <div className="stat-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <TrendingUp size={13} color="var(--forest-green)" />
              <span style={{ color: 'var(--forest-green)', fontWeight: 700 }}>+12.4%</span> active users
            </div>
          </div>
          <div className="stat-icon-box icon-users">
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-label">REGISTERED STORES</span>
            <span className="stat-value">{stats.totalStores}</span>
            <div className="stat-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle2 size={13} color="var(--coral-terracotta)" />
              <span style={{ color: 'var(--coral-terracotta)', fontWeight: 700 }}>100% Verified</span> stores
            </div>
          </div>
          <div className="stat-icon-box icon-stores">
            <Store size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <span className="stat-label">TOTAL REVIEWS</span>
            <span className="stat-value">{stats.totalRatings}</span>
            <div className="stat-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={13} color="var(--rating-gold)" />
              <span style={{ color: 'var(--rating-gold)', fontWeight: 700 }}>5.0 Avg</span> review rating
            </div>
          </div>
          <div className="stat-icon-box icon-reviews">
            <Star size={22} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Contextual Action Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', wrap: 'wrap', gap: '1rem' }}>
        <div className="directory-tabs-bar" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button
            type="button"
            className={`tab-button ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => handleTabChange('stores')}
          >
            Stores Directory ({stats.totalStores})
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            Users Directory ({stats.totalUsers})
          </button>
        </div>

        <div style={{ paddingBottom: '0.5rem' }}>
          {activeTab === 'stores' ? (
            <Button variant="primary" size="sm" onClick={() => { fetchOwners(); setIsAddStoreOpen(true); }}>
              <Plus size={15} /> Add New Store
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setIsAddUserOpen(true)}>
              <Plus size={15} /> Add New User
            </Button>
          )}
        </div>
      </div>

      {/* Category Quick Filter Chips Bar (Active: Soft Sage #DDEDE5 + Forest Green #176B52) */}
      {activeTab === 'stores' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '-0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-gray)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
            <Filter size={13} /> Filter Category:
          </span>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setCategoryFilter(cat.id); setPage(1); }}
              className={`category-filter-chip ${categoryFilter === cat.id ? 'active' : 'inactive'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Search & Filter Controls Header */}
      <div className="search-filter-card">
        <div className="pill-search-input-wrapper">
          <Search size={16} className="pill-search-icon" />
          <input
            type="text"
            placeholder={
              activeTab === 'stores'
                ? 'Search stores by name, category or location...'
                : 'Search users by name, email or location...'
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-controls-group">
          {activeTab === 'users' && (
            <div style={{ width: '130px' }}>
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Roles' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'STORE_OWNER', label: 'Store Owner' },
                  { value: 'USER', label: 'Normal User' },
                ]}
                style={{ marginBottom: 0 }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpDown size={15} color="var(--slate-gray)" />
            <div style={{ width: '130px' }}>
              <Select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                options={
                  activeTab === 'stores'
                    ? [
                        { value: 'name', label: 'Store Name' },
                        { value: 'email', label: 'Contact Info' },
                        { value: 'address', label: 'Location' },
                        { value: 'rating', label: 'Rating' },
                      ]
                    : [
                        { value: 'name', label: 'User Name' },
                        { value: 'email', label: 'Email' },
                        { value: 'role', label: 'Role' },
                      ]
                }
                style={{ marginBottom: 0 }}
              />
            </div>

            <div style={{ width: '90px' }}>
              <Select
                value={sortOrder}
                onChange={(e) => handleSortChange(sortBy, e.target.value)}
                options={[
                  { value: 'asc', label: 'ASC' },
                  { value: 'desc', label: 'DESC' },
                ]}
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <Table
        columns={activeTab === 'stores' ? storeColumns : userColumns}
        data={tableData}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSortChange}
        isLoading={loading}
        emptyMessage={`No registered ${activeTab} found matching filter criteria.`}
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

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New Platform User"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Input
            label="Full Name (20–60 characters)"
            placeholder="Enter full name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            error={formErrors.email}
            required
          />

          <Input
            label="Password (8–16 chars, 1 uppercase, 1 special char)"
            type="password"
            placeholder="Enter password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            error={formErrors.password}
            required
          />

          <Input
            label="Address (Max 400 characters)"
            placeholder="Enter address"
            value={newUser.address}
            onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
            error={formErrors.address}
            required
          />

          <Select
            label="User Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            options={[
              { value: 'USER', label: 'Normal User' },
              { value: 'ADMIN', label: 'Administrator' },
              { value: 'STORE_OWNER', label: 'Store Owner' },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Store Modal */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        title="Register New Store"
      >
        <form onSubmit={handleCreateStore} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Input
            label="Store Name"
            placeholder="Enter store name"
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Select
            label="Business Category"
            value={newStore.category}
            onChange={(e) => setNewStore({ ...newStore, category: e.target.value })}
            options={[
              { value: 'Electronics & Tech', label: 'Electronics & Tech' },
              { value: 'Cafe & Food', label: 'Cafe & Food' },
              { value: 'Sweets & Confectionery', label: 'Sweets & Confectionery' },
              { value: 'Fashion & Paithani', label: 'Fashion & Paithani' },
            ]}
          />

          <Input
            label="Contact Email (Optional)"
            type="email"
            placeholder="Enter store email"
            value={newStore.email}
            onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
          />

          <Input
            label="Contact Phone"
            placeholder="Enter phone number"
            value={newStore.phone}
            onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
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
            <Button variant="secondary" onClick={() => setIsAddUserOpen(false)}>
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
