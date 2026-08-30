import { useEffect, useState, useCallback } from 'react';
import { adminListEmailLogsRequest, adminRetryEmailLogRequest } from '../services/emailLogs';
import Loading from '../components/Loading.jsx';
import { useToast } from '../context/ToastContext.jsx';

const statusColor = {
  PENDING: 'gray',
  PROCESSING: 'gray',
  SENT: 'green',
  FAILED: 'red',
};

export default function EmailLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(null);

  const fetchLogs = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      adminListEmailLogsRequest({ status: status || undefined, page, limit: 20 })
        .then(({ data }) => {
          setLogs(data.data.logs);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load email logs.'))
        .finally(() => setLoading(false));
    },
    [status]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  async function handleRetry(id) {
    setRetrying(id);
    try {
      await adminRetryEmailLogRequest(id);
      fetchLogs(pagination.page);
      toast('Email queued for retry.');
    } catch (err) {
      toast(err.response?.data?.message || 'Retry failed.', 'error');
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div>
      <h1>Email Logs</h1>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        Every email the platform sends is tracked here. When Redis isn't configured, emails are
        logged to the server console instead of a real inbox and marked "Sent" automatically.
      </p>

      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SENT">Sent</option>
          <option value="FAILED">Failed</option>
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
                <th>To</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No emails sent yet.
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.to}</td>
                  <td>{log.subject}</td>
                  <td>{log.type}</td>
                  <td>
                    <span className={`badge ${statusColor[log.status] || 'gray'}`}>{log.status}</span>
                    {log.status === 'FAILED' && log.lastError && (
                      <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{log.lastError}</div>
                    )}
                  </td>
                  <td>{log.attempts}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    {log.status === 'FAILED' && (
                      <button
                        className="btn secondary"
                        disabled={retrying === log._id}
                        onClick={() => handleRetry(log._id)}
                      >
                        {retrying === log._id ? 'Retrying...' : 'Retry'}
                      </button>
                    )}
                  </td>
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
