import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { Store, ShieldCheck, KeyRound, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'role-badge-admin';
      case 'STORE_OWNER':
        return 'role-badge-owner';
      default:
        return 'role-badge-user';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'STORE_OWNER':
        return 'Store Owner';
      default:
        return 'Normal User';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand & Subtitle Header */}
        <Link to="/" className="navbar-brand-wrapper" style={{ textDecoration: 'none' }}>
          <div className="brand-icon-box">
            <Store size={22} />
          </div>
          <div className="brand-text-group">
            <div className="brand-title-row">
              <span className="brand-title">StoreSphere</span>
              <span className="brand-portal-tag">Portal</span>
            </div>
            <span className="brand-subtitle">Store Ratings &amp; Management Platform</span>
          </div>
        </Link>

        {/* User Card Widget on Right */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-widget-card">
              <div className="user-avatar-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-details">
                <span className="user-name-text">{user.name}</span>
                <span className="user-email-text">{user.email}</span>
              </div>
              <span className={`role-pill-badge ${getRoleBadgeClass(user.role)}`}>
                <ShieldCheck size={12} /> {getRoleLabel(user.role)}
              </span>

              {/* Password Change Button */}
              <button
                type="button"
                className="icon-btn-subtle"
                title="Change Password"
                onClick={() => navigate('/change-password')}
              >
                <KeyRound size={14} />
              </button>

              {/* Logout Button */}
              <button
                type="button"
                className="btn-logout-subtle"
                onClick={handleLogout}
              >
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
