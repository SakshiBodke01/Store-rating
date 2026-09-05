import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

export function NotFoundPage() {
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'STORE_OWNER':
        return '/owner/dashboard';
      default:
        return '/stores';
    }
  };

  return (
    <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-sub)', maxWidth: '400px', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        The page you are looking for does not exist or you don&apos;t have authorization to access it.
      </p>

      <Link to={getHomePath()} className="btn btn-primary btn-sm">
        Return to Home Dashboard
      </Link>
    </div>
  );
}
