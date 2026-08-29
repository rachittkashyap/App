import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myEnrollmentsRequest } from '../../services/learning';
import Loading from '../../components/Loading.jsx';

export default function MyTrainings() {
  const [enrollments, setEnrollments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    myEnrollmentsRequest()
      .then(({ data }) => setEnrollments(data.data.enrollments.filter((e) => e.itemType === 'TRAINING')))
      .catch((err) => setError(err.response?.data?.message || 'Could not load trainings.'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!enrollments) return <Loading />;

  return (
    <div>
      <h1>My Trainings</h1>
      {enrollments.length === 0 ? (
        <p style={{ color: '#6b7280' }}>
          You haven't enrolled in any trainings yet. <Link to="/trainings">Browse trainings</Link>.
        </p>
      ) : (
        <div className="card-grid">
          {enrollments.map((e) => (
            <Link to={`/trainings/${e.item?.slug}`} key={e.id} className="card">
              <h3 style={{ marginTop: 0 }}>{e.item?.title}</h3>
              <p style={{ fontSize: 13 }}>
                {e.isCompleted ? (
                  <span className="badge green">Completed</span>
                ) : (
                  <span className="badge gray">{e.progressPercent}% complete</span>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
