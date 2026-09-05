import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { AlertToast } from '../components/common/AlertToast';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // View User Details Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = useCallback(async () => {
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
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data || []);
      if (response.meta) {
        setMeta(response.meta);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleSort = (key, order) => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const validateAddForm = () => {
    const errs = {};
    const trimmedName = newUser.name.trim();
    if (!trimmedName || trimmedName.length < 20 || trimmedName.length > 60) {
      errs.name = 'Name must be between 20 and 60 characters';
    }
    if (!newUser.email || !newUser.email.includes('@')) {
      errs.email = 'Valid email address is required';
    }
    const trimmedAddress = newUser.address.trim();
    if (!trimmedAddress || trimmedAddress.length > 400) {
      errs.address = 'Address is required (max 400 characters)';
    }

    const pass = newUser.password || '';
    if (pass.length < 8 || pass.length > 16) {
      errs.password = 'Password must be between 8 and 16 characters';
    } else if (!/[A-Z]/.test(pass)) {
      errs.password = 'Must contain at least 1 uppercase letter';
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) {
      errs.password = 'Must contain at least 1 special character';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/users', newUser);
      setSuccess(`User "${newUser.name}" created successfully`);
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      setFormErrors({});
      fetchUsers();
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        setError(err.details.join(', '));
      } else {
        setError(err.message || 'Failed to create user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (userRecord) => {
    setSelectedUser(userRecord);
    setIsDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/admin/users/${userRecord.id}`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error('Failed to load full user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="user-role-badge role-admin">ADMIN</span>;
      case 'STORE_OWNER':
        return <span className="user-role-badge role-owner">STORE OWNER</span>;
      default:
        return <span className="user-role-badge role-user">USER</span>;
    }
  };

  const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email', sortable: true },
    { key: 'address', title: 'Address', sortable: true },
    { key: 'role', title: 'Role', sortable: true, render: (val) => getRoleBadge(val) },
    {
      key: 'storeRating',
      title: 'Store Owner Rating',
      sortable: false,
      render: (_, row) => {
        if (row.role !== 'STORE_OWNER') {
          return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        }
        return (
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-sub)' }}>
            {row.storeRating !== undefined ? `${row.storeRating.toFixed(1)} ★` : 'Owner (Click Details)'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (_, row) => (
        <Button variant="secondary" size="sm" onClick={() => handleViewDetails(row)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>User Management</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>
            System users, roles, filters, and store owner ratings.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          Add User
        </Button>
      </div>

      {error && <AlertToast type="error" message={error} />}
      {success && <AlertToast type="success" message={success} />}

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '0.875rem 1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <Input
              label="Search Users"
              placeholder="Search by name, email, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ width: '160px' }}>
            <Select
              label="Role Filter"
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

          <Button type="submit" variant="secondary" size="md">
            Filter
          </Button>
        </form>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={users}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={loading}
        emptyMessage="No users found matching filter criteria."
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
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormErrors({});
        }}
        title="Add New System User"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`User Details: ${selectedUser.name}`}
        >
          {loadingDetails ? (
            <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>Loading user details...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <strong>Full Name:</strong> {selectedUser.name}
              </div>
              <div>
                <strong>Email Address:</strong> {selectedUser.email}
              </div>
              <div>
                <strong>Address:</strong> {selectedUser.address}
              </div>
              <div>
                <strong>System Role:</strong> {getRoleBadge(selectedUser.role)}
              </div>

              {/* If Store Owner, display their assigned store ratings */}
              {selectedUser.role === 'STORE_OWNER' && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.35rem' }}>Owned Store Ratings</h4>
                  {selectedUser.ownedStores && selectedUser.ownedStores.length > 0 ? (
                    selectedUser.ownedStores.map((st) => (
                      <div key={st.id} style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.35rem' }}>
                        <div style={{ fontWeight: 600 }}>{st.name}</div>
                        <div style={{ color: 'var(--text-sub)', fontSize: '0.8125rem' }}>{st.address}</div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-sub)', fontSize: '0.8125rem' }}>No stores currently assigned.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
