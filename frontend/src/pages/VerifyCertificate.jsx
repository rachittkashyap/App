import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyCertificateRequest } from '../services/certificates';

export default function VerifyCertificate() {
  const { certificateId: paramId } = useParams();
  const navigate = useNavigate();

  const [inputId, setInputId] = useState(paramId || '');
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  async function runVerify(id) {
    setChecking(true);
    setError('');
    setResult(null);
    try {
      const { data } = await verifyCertificateRequest(id);
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not verify certificate.');
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (paramId) runVerify(paramId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramId]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!inputId.trim()) return;
    navigate(`/verify-certificate/${inputId.trim()}`);
  }

  return (
    <div className="container section">
      <h1>Certificate Verification</h1>
      <p style={{ color: '#6b7280' }}>Enter a certificate ID to check its validity.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, maxWidth: 420 }}>
        <input
          type="text"
          placeholder="e.g. CERT-9F3A1B2C7D4E"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        <button className="btn" type="submit" disabled={checking}>
          {checking ? 'Checking...' : 'Verify'}
        </button>
      </form>

      {error && <p style={{ color: '#dc2626', marginTop: 16 }}>{error}</p>}

      {result && (
        <div className="card" style={{ marginTop: 20, maxWidth: 420 }}>
          {result.valid ? (
            <>
              <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 18 }}>✓ Valid Certificate</p>
              <p><strong>Name:</strong> {result.certificate.studentName}</p>
              <p><strong>Completed:</strong> {result.certificate.itemTitle}</p>
              <p><strong>Type:</strong> {result.certificate.itemType}</p>
              <p><strong>Issued:</strong> {new Date(result.certificate.issuedAt).toLocaleDateString()}</p>
              <p><strong>Certificate ID:</strong> {result.certificate.certificateId}</p>
            </>
          ) : (
            <p style={{ color: '#dc2626', fontWeight: 600 }}>✗ {result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
