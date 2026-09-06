import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { AlertToast } from '../components/common/AlertToast.jsx';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errs = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      errs.name = 'Full name is required';
    } else if (trimmedName.length < 20 || trimmedName.length > 60) {
      errs.name = 'Name must be between 20 and 60 characters long';
    }

    if (!formData.email || !formData.email.includes('@')) {
      errs.email = 'Please enter a valid email address';
    }

    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) {
      errs.address = 'Address is required';
    } else if (trimmedAddress.length > 400) {
      errs.address = 'Address must not exceed 400 characters';
    }

    const pass = formData.password;
    if (!pass || pass.length < 8 || pass.length > 16) {
      errs.password = 'Password must be 8–16 characters long';
    } else if (!/[A-Z]/.test(pass)) {
      errs.password = 'Must contain at least one uppercase letter (A-Z)';
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/]/.test(pass)) {
      errs.password = 'Must contain at least one special character (e.g. !@#$)';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });

      navigate('/stores', { replace: true });
    } catch (err) {
      const msg = err.details && Array.isArray(err.details) && err.details.length > 0
        ? err.details.join(' • ')
        : err.message;
      setError(msg || 'Registration failed. Please verify your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
      <div className="panel" style={{ maxWidth: '460px', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Create Account</h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Register a normal user account to discover and rate stores.
          </p>
        </div>

        <AlertToast message={error} type="error" onClose={() => setError('')} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Full Name (20–60 chars)"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            error={fieldErrors.name}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
          />

          <Input
            label="Address (Max 400 chars)"
            name="address"
            placeholder="Enter address"
            value={formData.address}
            onChange={handleChange}
            error={fieldErrors.address}
            required
          />

          <Input
            label="Password (8–16 chars, 1 uppercase, 1 special char)"
            name="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Create Account
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-sub)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
