import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { AlertToast } from '../components/common/AlertToast.jsx';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email address and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/stores', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="panel" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--deep-charcoal)' }}>Sign In</h1>
          <p style={{ color: 'var(--slate-gray)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Enter your credentials to access the Store Rating Platform.
          </p>
        </div>

        {/* Quick Demo Test Accounts Box */}
        <div style={{
          marginBottom: '1.25rem',
          padding: '0.85rem 1rem',
          background: 'var(--warm-cream)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--forest-green)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>🔑</span> Quick Demo Accounts (Click to auto-fill):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setFormData({ email: 'admin@storerating.com', password: 'Password@123' })}
              title="Click to fill Admin account"
              style={{
                padding: '0.25rem 0.6rem',
                background: '#FDF2F0',
                color: '#E76F51',
                border: '1px solid #FADCD5',
                borderRadius: '12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              Admin: admin@storerating.com
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'owner@storerating.com', password: 'Password@123' })}
              title="Click to fill Store Owner account"
              style={{
                padding: '0.25rem 0.6rem',
                background: '#FFFBEB',
                color: '#B45309',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              Owner: owner@storerating.com
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'user@storerating.com', password: 'Password@123' })}
              title="Click to fill Normal User account"
              style={{
                padding: '0.25rem 0.6rem',
                background: 'var(--soft-sage)',
                color: 'var(--forest-green)',
                border: '1px solid rgba(23, 107, 82, 0.25)',
                borderRadius: '12px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'inherit',
              }}
            >
              User: user@storerating.com
            </button>
          </div>
        </div>

        <AlertToast message={error} type="error" onClose={() => setError('')} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Log In
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-sub)', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Sign up as Normal User
          </Link>
        </div>
      </div>
    </div>
  );
}
