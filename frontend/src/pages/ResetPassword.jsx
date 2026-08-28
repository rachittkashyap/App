import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPasswordRequest } from '../services/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ newPassword: '', confirmNewPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !token) {
      setError('This reset link is invalid or incomplete.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await resetPasswordRequest({ email, token, ...form });
      setSuccess(data.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!email || !token) {
    return (
      <div className="form-page">
        <h2>Reset Password</h2>
        <p style={{ color: '#dc2626', fontSize: 14 }}>
          This reset link is invalid or incomplete. Please request a new one.
        </p>
        <Link to="/forgot-password">Request new link</Link>
      </div>
    );
  }

  return (
    <div className="form-page">
      <h2>Reset Password</h2>
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      {success && <p style={{ color: '#16a34a', fontSize: 14 }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={form.newPassword}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmNewPassword"
          placeholder="Confirm New Password"
          value={form.confirmNewPassword}
          onChange={handleChange}
          required
        />
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
