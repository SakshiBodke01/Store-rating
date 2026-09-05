import { useState, useEffect, useCallback } from 'react';
import { Search, ArrowUpDown, CheckCircle2, Filter } from 'lucide-react';
import { api } from '../services/api';
import { AlertToast } from '../components/common/AlertToast';
import { Table } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { StarRating } from '../components/common/StarRating';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

export function UserStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  // Rate Modal State
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [comment, setComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Stores
  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/stores', params);
      setStores(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, totalCount: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load stores directory');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, search, categoryFilter]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (col, order) => {
    setSortBy(col);
    setSortOrder(order);
    setPage(1);
  };

  const handleOpenRateModal = (store) => {
    setSelectedStore(store);
    if (store.myRating) {
      setRatingScore(store.myRating.rating);
      setComment(store.myRating.comment || '');
    } else {
      setRatingScore(5);
      setComment('');
    }
    setIsModalOpen(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/stores/${selectedStore.id}/rate`, {
        rating: Number(ratingScore),
        comment: comment.trim(),
      });

      setSuccess(`Rating saved for "${selectedStore.name}"`);
      setIsModalOpen(false);
      fetchStores();
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  // Category filter list
  const categoriesList = [
    { id: '', label: 'All Categories' },
    { id: 'Electronics & Tech', label: 'Electronics & Tech' },
    { id: 'Cafe & Food', label: 'Cafe & Food' },
    { id: 'Sweets & Confectionery', label: 'Sweets' },
    { id: 'Fashion & Paithani', label: 'Fashion & Paithani' },
  ];

  const columns = [
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
    { key: 'address', title: 'LOCATION ADDRESS', sortable: true },
    {
      key: 'averageRating',
      title: 'OVERALL RATING',
      sortable: true,
      render: (val) => (
        <StarRating value={val || 0} readOnly showScore size={15} />
      ),
    },
    {
      key: 'myRating',
      title: 'YOUR RATING',
      sortable: false,
      render: (myRating) =>
        myRating ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <StarRating value={myRating.rating} readOnly size={14} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--forest-green)' }}>
              ({myRating.rating} / 5)
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--slate-gray)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
            Not Rated
          </span>
        ),
    },
    {
      key: 'actions',
      title: 'ACTION',
      sortable: false,
      render: (_, store) => (
        <Button
          variant={store.myRating ? 'secondary' : 'primary'}
          size="sm"
          onClick={() => handleOpenRateModal(store)}
        >
          {store.myRating ? 'Modify Rating' : 'Submit Rating'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="page-title">Explore Verified Stores</h1>
        <p className="page-subtitle">
          Discover top rated local stores, compare customer experiences, and share your feedback.
        </p>
      </div>

      {error && <AlertToast type="error" message={error} />}
      {success && <AlertToast type="success" message={success} />}

      {/* Category Quick Filter Chips (Active: Soft Sage #DDEDE5 + Forest Green #176B52) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
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

      {/* Search & Sort Controls Bar */}
      <div className="search-filter-card">
        <div className="pill-search-input-wrapper">
          <Search size={16} className="pill-search-icon" />
          <input
            type="text"
            placeholder="Search stores by name, location or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-controls-group">
          <ArrowUpDown size={15} color="var(--slate-gray)" />
          <div style={{ width: '140px' }}>
            <Select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value, sortOrder)}
              options={[
                { value: 'name', label: 'Store Name' },
                { value: 'address', label: 'Address' },
                { value: 'rating', label: 'Rating' },
              ]}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ width: '90px' }}>
            <Select
              value={sortOrder}
              onChange={(e) => handleSort(sortBy, e.target.value)}
              options={[
                { value: 'asc', label: 'ASC' },
                { value: 'desc', label: 'DESC' },
              ]}
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
      </div>

      {/* Stores Table */}
      <Table
        columns={columns}
        data={stores}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        isLoading={loading}
        emptyMessage="No verified stores found matching your search criteria."
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

      {/* Rate Store Modal */}
      {selectedStore && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Rate ${selectedStore.name}`}
        >
          <form onSubmit={handleRatingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="form-label">Rating (1 to 5 Stars)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                <StarRating value={ratingScore} onChange={(val) => setRatingScore(val)} size={24} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--rating-gold)' }}>
                  {ratingScore} out of 5
                </span>
              </div>
            </div>

            <Input
              label="Review Comment (Optional)"
              placeholder="Enter your review comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting}>
                Save Review
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
