import { useEffect, useState } from 'react';
import { myCertificatesRequest, downloadCertificate } from '../../services/certificates';
import Loading from '../../components/Loading.jsx';

export default function Certificates() {
  const [certificates, setCertificates] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    myCertificatesRequest()
      .then(({ data }) => setCertificates(data.data.certificates))
      .catch((err) => setError(err.response?.data?.message || 'Could not load certificates.'));
  }, []);

  async function handleDownload(certificateId) {
    setDownloading(certificateId);
    try {
      await downloadCertificate(certificateId);
    } catch {
      setError('Could not download certificate.');
    } finally {
      setDownloading(null);
    }
  }

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!certificates) return <Loading />;

  return (
    <div>
      <h1>Certificates</h1>
      {certificates.length === 0 ? (
        <p style={{ color: '#6b7280' }}>
          Complete a course or training to earn your first certificate.
        </p>
      ) : (
        <div className="card-grid">
          {certificates.map((c) => (
            <div className="card" key={c.id}>
              <h3 style={{ marginTop: 0 }}>{c.itemTitle}</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>{c.itemType}</p>
              <p style={{ fontSize: 13 }}>
                <span className={`badge ${c.status === 'ISSUED' ? 'green' : 'red'}`}>{c.status}</span>
              </p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>
                Issued: {new Date(c.issuedAt).toLocaleDateString()}
              </p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>ID: {c.certificateId}</p>
              {c.status === 'ISSUED' && (
                <button
                  className="btn secondary"
                  disabled={downloading === c.certificateId}
                  onClick={() => handleDownload(c.certificateId)}
                >
                  {downloading === c.certificateId ? 'Downloading...' : 'Download PDF'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
