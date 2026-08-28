import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    college: user?.college || '',
    qualification: user?.qualification || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const { data } = await api.put('/users/profile', form);
      setMessage(data.data.message);
      if (refreshUser) refreshUser(data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Profile</h1>
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      {message && <p style={{ color: '#16a34a', fontSize: 14 }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 420, marginTop: 16 }}>
        <label style={{ fontSize: 13, color: '#6b7280' }}>Email (cannot be changed)</label>
        <input type="email" value={user?.email || ''} disabled style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#f3f4f6' }} />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Full Name</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Phone</label>
        <input type="text" name="phone" value={form.phone} onChange={handleChange} style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />

        <label style={{ fontSize: 13, color: '#6b7280' }}>College</label>
        <input type="text" name="college" value={form.college} onChange={handleChange} style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Qualification</label>
        <input type="text" name="qualification" value={form.qualification} onChange={handleChange} style={{ marginBottom: 14, width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />

        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
