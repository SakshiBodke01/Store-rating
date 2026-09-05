import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.jsx';
import { useAuth } from './context/useAuth.js';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';

import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { AdminUsersPage } from './pages/AdminUsersPage.jsx';
import { AdminStoresPage } from './pages/AdminStoresPage.jsx';
import { UserStoresPage } from './pages/UserStoresPage.jsx';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage.jsx';
import { ChangePasswordPage } from './pages/ChangePasswordPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

function HomeRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          {/* Authenticated Layout Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomeRedirect />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/stores" element={<AdminStoresPage />} />
              </Route>

              {/* Store Owner Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER', 'ADMIN']} />}>
                <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              </Route>

              {/* Normal User Stores & Ratings Route */}
              <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'STORE_OWNER']} />}>
                <Route path="/stores" element={<UserStoresPage />} />
              </Route>

              {/* Account Password Management */}
              <Route path="/change-password" element={<ChangePasswordPage />} />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
