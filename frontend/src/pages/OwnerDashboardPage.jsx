import { useState, useEffect, useCallback } from 'react';
import { Store, Star, MessageSquare, CheckCircle2, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { AlertToast } from '../components/common/AlertToast';
import { Select } from '../components/common/Select';
import { Table } from '../components/common/Table';
import { StarRating } from '../components/common/StarRating';
import { Pagination } from '../components/common/Pagination';

export function OwnerDashboardPage() {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  // Fetch My Stores
  const fetchMyStores = useCallback(async () => {
    try {
      const res = await api.get('/owner/stores');
      const storeList = res.data || [];
      setStores(storeList);
      if (storeList.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storeList[0].id);
        setSelectedStore(storeList[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load owner stores');
    }
  }, [selectedStoreId]);

  // Fetch Ratings for Selected Store
  const fetchStoreRatings = useCallback(async () => {
    if (!selectedStoreId) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/owner/stores/${selectedStoreId}/ratings`, {
        page,
        limit: 10,
      });

      setRatings(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, totalCount: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load ratings');
    } finally {
      setLoading(false);
    }
  }, [selectedStoreId, page]);

  useEffect(() => {
    fetchMyStores();
  }, [fetchMyStores]);

  useEffect(() => {
    fetchStoreRatings();
  }, [fetchStoreRatings]);

  const handleStoreChange = (storeId) => {
    setSelectedStoreId(storeId);
    const storeObj = stores.find((s) => s.id === storeId);
    setSelectedStore(storeObj || null);
    setPage(1);
  };

  const columns = [
    {
      key: 'user',
      title: 'CUSTOMER NAME',
      sortable: false,
      render: (_, row) => (
        <div>
          <div className="store-name-title">{row.user?.name || 'Anonymous Customer'}</div>
          <div className="store-id-sub">{row.user?.email || '—'}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      title: 'CUSTOMER SCORE',
      sortable: false,
      render: (score) => <StarRating value={score} readOnly showScore size={15} />,
    },
    {
      key: 'comment',
      title: 'CUSTOMER REVIEW COMMENTS',
      sortable: false,
      render: (val) => val || <span style={{ color: 'var(--slate-gray)', fontStyle: 'italic' }}>No comment provided</span>,
    },
    {
      key: 'createdAt',
      title: 'DATE SUBMITTED',
      sortable: false,
      render: (val) => new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Store Switcher */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Store Owner Analytics</h1>
          <p className="page-subtitle">
            Customer ratings, reviews management, and store performance dashboard.
          </p>
        </div>

        {stores.length > 1 && (
          <div style={{ width: '260px' }}>
            <Select
              label="Select Owned Store"
              value={selectedStoreId}
              onChange={(e) => handleStoreChange(e.target.value)}
              options={stores.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </div>
        )}
      </div>

      {error && <AlertToast type="error" message={error} />}

      {selectedStore && (
        <>
          {/* Active Selected Store Details Banner */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--deep-charcoal)' }}>{selectedStore.name}</h2>
                <span className="verified-badge-pill">
                  <CheckCircle2 size={12} /> Verified Business
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-gray)', marginTop: '0.2rem' }}>
                {selectedStore.address}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--forest-green)', background: 'var(--soft-sage)', padding: '0.25rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(23, 107, 82, 0.2)' }}>
                {selectedStore.category || 'Retail & Services'}
              </span>
            </div>
          </div>

          {/* Metric Cards Row matching prompt rules:
             - Total Users / Score: Forest Green
             - Registered Stores / Reviews: Coral or Forest Green
             - Rating Score / Star: Rating Gold
          */}
          <div className="stat-cards-grid">
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-label">AVERAGE RATING SCORE</span>
                <span className="stat-value">
                  {selectedStore.averageRating ? selectedStore.averageRating.toFixed(2) : '0.0'} ★
                </span>
                <div className="stat-subtext" style={{ color: 'var(--rating-gold)', fontWeight: 700 }}>
                  Based on verified ratings
                </div>
              </div>
              <div className="stat-icon-box icon-reviews">
                <Star size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-label">TOTAL CUSTOMER REVIEWS</span>
                <span className="stat-value">{meta.totalCount}</span>
                <div className="stat-subtext" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrendingUp size={13} color="var(--success-green)" />
                  <span style={{ color: 'var(--success-green)', fontWeight: 700 }}>+8.5%</span> response rate
                </div>
              </div>
              <div className="stat-icon-box icon-stores">
                <MessageSquare size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-label">STORE STATUS</span>
                <span className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--success-green)' }}>🟢 Active</span>
                <div className="stat-subtext" style={{ color: 'var(--slate-gray)' }}>
                  Accepting ratings & feedback
                </div>
              </div>
              <div className="stat-icon-box icon-users">
                <Store size={22} />
              </div>
            </div>
          </div>

          {/* Customer Reviews Table */}
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--deep-charcoal)', marginBottom: '0.85rem' }}>
              Customer Feedback & Reviews
            </h3>
            <Table
              columns={columns}
              data={ratings}
              isLoading={loading}
              emptyMessage="No customer reviews submitted yet for this store."
            />

            {meta.totalPages > 1 && (
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalCount={meta.totalCount}
                onPageChange={(p) => setPage(p)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
