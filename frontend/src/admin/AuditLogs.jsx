import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminListAuditLogsRequest } from '../services/reports';
import Loading from '../components/Loading.jsx';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = useCallback((page = 1) => {
    setLoading(true);
    setError('');
    adminListAuditLogsRequest({ page, limit: 20 })
      .then(({ data }) => {
        setLogs(data.data.logs);
        setPagination(data.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load audit logs.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return (
    <div>
      <Link to="/admin/reports" style={{ fontSize: 14 }}>
        &larr; Back to Reports
      </Link>
      <h1>Audit Logs</h1>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        A record of key admin actions - suspensions, publishing, refunds, certificate revocations, and more.
      </p>

      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Details</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No admin actions recorded yet.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.adminName}</td>
                  <td>
                    <span className="badge gray">{log.action.replace(/_/g, ' ')}</span>
                  </td>
                  <td>{log.details}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => fetchLogs(pagination.page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
