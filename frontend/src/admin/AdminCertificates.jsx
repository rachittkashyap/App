import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import {
  adminListCertificatesRequest,
  adminRevokeCertificateRequest,
  adminReinstateCertificateRequest,
} from '../services/certificates';
import Loading from '../components/Loading.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AdminCertificates() {
  const confirm = useConfirm();
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCertificates = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      adminListCertificatesRequest({ search, status: status || undefined, page, limit: 10 })
        .then(({ data }) => {
          setCertificates(data.data.certificates);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load certificates.'))
        .finally(() => setLoading(false));
    },
    [search, status]
  );

  useEffect(() => {
    fetchCertificates(1);
  }, [fetchCertificates]);

  async function toggleStatus(cert) {
    try {
      if (cert.status === 'ISSUED') {
        const ok = await confirm(`Revoke certificate ${cert.certificateId}?`, {
          danger: true,
          confirmLabel: 'Revoke',
        });
        if (!ok) return;
        await adminRevokeCertificateRequest(cert.id);
        toast('Certificate revoked.');
      } else {
        await adminReinstateCertificateRequest(cert.id);
        toast('Certificate reinstated.');
      }
      fetchCertificates(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Certificates</h1>
        <Link to="/admin/certificates/template" className="btn secondary">
          Edit Template
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, course, or certificate ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="ISSUED">Issued</option>
          <option value="REVOKED">Revoked</option>
        </select>
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</p>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Item</th>
                <th>Type</th>
                <th>Status</th>
                <th>Issued</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No certificates issued yet.
                  </td>
                </tr>
              )}
              {certificates.map((c) => (
                <tr key={c.id}>
                  <td>{c.certificateId}</td>
                  <td>{c.itemTitle}</td>
                  <td>{c.itemType}</td>
                  <td>
                    <span className={`badge ${c.status === 'ISSUED' ? 'green' : 'red'}`}>{c.status}</span>
                  </td>
                  <td>{new Date(c.issuedAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn secondary" onClick={() => toggleStatus(c)}>
                      {c.status === 'ISSUED' ? 'Revoke' : 'Reinstate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => fetchCertificates(pagination.page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchCertificates(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
