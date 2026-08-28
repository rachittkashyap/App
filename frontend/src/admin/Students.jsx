import { useEffect, useState, useCallback } from 'react';
import api from '../services/api.js';
import Loading from '../components/Loading.jsx';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchStudents = useCallback((page = 1) => {
    setLoading(true);
    setError('');
    api
      .get('/admin/students', { params: { search, status, page, limit: 10 } })
      .then(({ data }) => {
        setStudents(data.data.students);
        setPagination(data.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load students.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  async function toggleStatus(student) {
    setActionError('');
    try {
      const action = student.isActive ? 'suspend' : 'activate';
      await api.patch(`/admin/students/${student.id}/${action}`);
      fetchStudents(pagination.page);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed.');
    }
  }

  return (
    <div>
      <h1>Students</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {actionError && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{actionError}</p>}
      {error && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</p>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No students found.
                  </td>
                </tr>
              )}
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>
                    <span className={`badge ${s.isVerified ? 'green' : 'gray'}`}>
                      {s.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.isActive ? 'green' : 'red'}`}>
                      {s.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn secondary" onClick={() => toggleStatus(s)}>
                      {s.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchStudents(pagination.page - 1)}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchStudents(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
