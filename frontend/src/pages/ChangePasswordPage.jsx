import { useState } from 'react';
import { api } from '../services/api';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AlertToast } from '../components/common/AlertToast';

export function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.currentPassword) {
      errs.currentPassword = 'Current password is required';
    }

    const pass = formData.newPassword;
    if (!pass || pass.length < 8 || pass.length > 16) {
      errs.newPassword = 'Password must be 8–16 characters long';
    } else if (!/[A-Z]/.test(pass)) {
      errs.newPassword = 'Must contain at least 1 uppercase letter (A-Z)';
    } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) {
      errs.newPassword = 'Must contain at least 1 special character (e.g. !@#$)';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'New passwords do not match';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setLoading(true);
    try {
      await api.patch('/users/me/password', formData);
      setSuccess('Your password has been changed successfully.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFormErrors({});
    } catch (err) {
      if (err.details && Array.isArray(err.details)) {
        setError(err.details.join(', '));
      } else {
        setError(err.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="panel">
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Update Password</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
            Change your account login password.
          </p>
        </div>

        {error && <AlertToast type="error" message={error} />}
        {success && <AlertToast type="success" message={success} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            error={formErrors.currentPassword}
            required
          />

          <Input
            label="New Password (8–16 chars, 1 uppercase, 1 special char)"
            type="password"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            error={formErrors.newPassword}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={formErrors.confirmPassword}
            required
          />

          <Button type="submit" variant="primary" loading={loading} style={{ marginTop: '0.5rem' }}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
