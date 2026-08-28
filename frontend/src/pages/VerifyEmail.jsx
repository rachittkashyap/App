import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmailRequest } from '../services/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!email || !token) {
      setStatus('error');
      setMessage('This verification link is invalid or incomplete.');
      return;
    }

    verifyEmailRequest({ email, token })
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [email, token]);

  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <h1>Email Verification</h1>
      {status === 'verifying' && <p>Verifying your email...</p>}
      {status === 'success' && (
        <>
          <p style={{ color: '#16a34a' }}>{message}</p>
          <Link to="/login" className="btn">
            Go to Login
          </Link>
        </>
      )}
      {status === 'error' && <p style={{ color: '#dc2626' }}>{message}</p>}
    </div>
  );
}
