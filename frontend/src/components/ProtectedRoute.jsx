import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { Loading } from './common/Loading.jsx';

/**
 * Route protection wrapper enforcing authentication and role authorization.
 * Redirects unauthenticated users to /login, and unauthorized roles to default dashboard.
 *
 * @param {Object} props
 * @param {Array<string>} [props.allowedRoles] - Optional allowed role list ('ADMIN', 'USER', 'STORE_OWNER')
 */
export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Verifying authentication state..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to default home page by role
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return <Outlet />;
}
