import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listTrainingsRequest } from '../services/trainings';
import Loading from '../components/Loading.jsx';

export default function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [isPaid, setIsPaid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrainings = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      listTrainingsRequest({
        search,
        level: level || undefined,
        duration: duration || undefined,
        isPaid: isPaid || undefined,
        page,
        limit: 9,
      })
        .then(({ data }) => {
          setTrainings(data.data.trainings);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load trainings.'))
        .finally(() => setLoading(false));
    },
    [search, level, duration, isPaid]
  );

  useEffect(() => {
    fetchTrainings(1);
  }, [fetchTrainings]);

  return (
    <div className="container section">
      <h1>Trainings / Virtual Internships</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search trainings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
        <select value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option value="">Any Duration</option>
          <option value="7">7 Days</option>
          <option value="14">14 Days</option>
          <option value="30">30 Days</option>
        </select>
        <select value={isPaid} onChange={(e) => setIsPaid(e.target.value)}>
          <option value="">Free & Paid</option>
          <option value="false">Free Only</option>
          <option value="true">Paid Only</option>
        </select>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {loading ? (
        <Loading />
      ) : trainings.length === 0 ? (
        <p style={{ color: '#6b7280', marginTop: 24 }}>No trainings published yet. Check back soon!</p>
      ) : (
        <>
          <div className="card-grid">
            {trainings.map((training) => (
              <Link to={`/trainings/${training.slug}`} key={training.id} className="card">
                <h3 style={{ marginTop: 0 }}>{training.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14 }}>{training.description}</p>
                <p style={{ fontSize: 13 }}>
                  <span className="badge gray">{training.level}</span>{' '}
                  <span className="badge gray">{training.durationDays} Days</span>
                </p>
                <p style={{ fontWeight: 700 }}>{training.isPaid ? `₹${training.price}` : 'Free'}</p>
              </Link>
            ))}
          </div>

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
