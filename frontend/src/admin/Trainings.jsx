import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  adminListTrainingsRequest,
  adminDeleteTrainingRequest,
  adminPublishTrainingRequest,
  adminUnpublishTrainingRequest,
} from '../services/trainings';
import Loading from '../components/Loading.jsx';

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchTrainings = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      adminListTrainingsRequest({ search, status, page, limit: 10 })
        .then(({ data }) => {
          setTrainings(data.data.trainings);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load trainings.'))
        .finally(() => setLoading(false));
    },
    [search, status]
  );

  useEffect(() => {
    fetchTrainings(1);
  }, [fetchTrainings]);

  async function togglePublish(training) {
    setActionError('');
    try {
      if (training.isPublished) {
        await adminUnpublishTrainingRequest(training.id);
      } else {
        await adminPublishTrainingRequest(training.id);
      }
      fetchTrainings(pagination.page);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed.');
    }
  }

  async function handleDelete(training) {
    if (!window.confirm(`Delete "${training.title}"? This cannot be undone.`)) return;
    setActionError('');
    try {
      await adminDeleteTrainingRequest(training.id);
      fetchTrainings(pagination.page);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Delete failed.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Trainings</h1>
        <Link to="/admin/trainings/new" className="btn">
          + New Training
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search trainings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
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
                <th>Title</th>
                <th>Category</th>
                <th>Level</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No trainings yet. Create your first one!
                  </td>
                </tr>
              )}
              {trainings.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td>{t.level}</td>
                  <td>{t.durationDays} days</td>
                  <td>{t.isPaid ? `₹${t.price}` : 'Free'}</td>
                  <td>{t.dayCount}</td>
                  <td>
                    <span className={`badge ${t.isPublished ? 'green' : 'gray'}`}>
                      {t.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/admin/trainings/${t.id}`} className="btn secondary">
                      Edit
                    </Link>
                    <button className="btn secondary" onClick={() => togglePublish(t)}>
                      {t.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="btn secondary" onClick={() => handleDelete(t)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => fetchTrainings(pagination.page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTrainings(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
