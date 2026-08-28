import { useState } from 'react';
import { forgotPasswordRequest } from '../services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const { data } = await forgotPasswordRequest({ email });
      setMessage(data.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <h2>Forgot Password</h2>
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      {message && <p style={{ color: '#16a34a', fontSize: 14 }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
