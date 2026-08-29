import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myEnrollmentsRequest } from '../../services/learning';
import Loading from '../../components/Loading.jsx';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    myEnrollmentsRequest()
      .then(({ data }) => setEnrollments(data.data.enrollments.filter((e) => e.itemType === 'COURSE')))
      .catch((err) => setError(err.response?.data?.message || 'Could not load courses.'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!enrollments) return <Loading />;

  return (
    <div>
      <h1>My Courses</h1>
      {enrollments.length === 0 ? (
        <p style={{ color: '#6b7280' }}>
          You haven't enrolled in any courses yet. <Link to="/courses">Browse courses</Link>.
        </p>
      ) : (
        <div className="card-grid">
          {enrollments.map((e) => (
            <Link to={`/courses/${e.item?.slug}`} key={e.id} className="card">
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
