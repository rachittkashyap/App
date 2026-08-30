import { useEffect, useState, useCallback } from 'react';
import { adminListApplicationsRequest, adminUpdateApplicationStatusRequest, downloadResume } from '../services/internshipApplications';
import Loading from '../components/Loading.jsx';
import { useToast } from '../context/ToastContext.jsx';

const statusColor = {
  NEW: 'gray',
  REVIEWED: 'gray',
  SHORTLISTED: 'green',
  REJECTED: 'red',
};

export default function InternshipApplications() {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  const fetchApplications = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      adminListApplicationsRequest({ search, status: status || undefined, page, limit: 20 })
        .then(({ data }) => {
          setApplications(data.data.applications);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load applications.'))
        .finally(() => setLoading(false));
    },
    [search, status]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  async function handleStatusChange(id, newStatus) {
    try {
      await adminUpdateApplicationStatusRequest(id, newStatus);
      fetchApplications(pagination.page);
      toast('Status updated.');
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed.', 'error');
    }
  }

  async function handleDownload(app) {
    setDownloading(app.id);
    try {
      await downloadResume(app.id, app.resumeFileName);
    } catch {
      toast('Could not download resume.', 'error');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <h1>Internship Applications</h1>
      <p style={{ color: '#6b7280', fontSize: 14 }}>Novalynx Labs Virtual Internship Program submissions.</p>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name, email, or college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="SHORTLISTED">Shortlisted</option>
          <option value="REJECTED">Rejected</option>
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
                <th>Name</th>
                <th>Contact</th>
                <th>College</th>
                <th>Internship</th>
                <th>Status</th>
                <th>Resume</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No applications yet.
                  </td>
                </tr>
              )}
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>{app.fullName}</td>
                  <td style={{ fontSize: 13 }}>
                    {app.email}
                    <br />
                    {app.phone}
                  </td>
                  <td>{app.college}</td>
                  <td>{app.internshipType}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{ fontSize: 12, padding: '4px 6px', borderRadius: 6 }}
                    >
                      <option value="NEW">New</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>{' '}
                    <span className={`badge ${statusColor[app.status] || 'gray'}`}>{app.status}</span>
                  </td>
                  <td>
                    <button
                      className="btn secondary"
                      disabled={downloading === app.id}
                      onClick={() => handleDownload(app)}
                    >
                      {downloading === app.id ? 'Downloading...' : 'Download'}
                    </button>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => fetchApplications(pagination.page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchApplications(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
