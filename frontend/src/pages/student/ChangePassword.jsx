import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ChangePassword() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.put('/users/change-password', form);
      // Password changed & all sessions invalidated server-side - log out here too
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Change Password</h1>
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ maxWidth: 380, marginTop: 16 }}>
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={handleChange}
          required
          style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          required
          style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        <input
          type="password"
          name="confirmNewPassword"
          placeholder="Confirm New Password"
          value={form.confirmNewPassword}
          onChange={handleChange}
          required
          style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
