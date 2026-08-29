import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrainingBySlugRequest } from '../services/trainings';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/Loading.jsx';

export default function TrainingDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const [training, setTraining] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getTrainingBySlugRequest(slug)
      .then(({ data }) => setTraining(data.data.training))
      .catch((err) => setError(err.response?.data?.message || 'Training not found.'));
  }, [slug]);

  if (error) {
    return (
      <div className="container section">
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (!training) return <Loading />;

  return (
    <div className="container section">
      <span className="badge gray">{training.level}</span>{' '}
      <span className="badge gray">{training.durationDays} Days</span>
      <h1>{training.title}</h1>
      <p style={{ color: '#6b7280' }}>{training.description}</p>
      <p style={{ fontSize: 20, fontWeight: 700 }}>{training.isPaid ? `₹${training.price}` : 'Free'}</p>

      {isAuthenticated ? (
        <button className="btn">Enroll Now</button>
      ) : (
        <Link to="/login" className="btn">
          Login to Enroll
        </Link>
      )}
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
        Enrollment logic will be wired up in Phase 6.
      </p>

      <h2 style={{ marginTop: 40 }}>Day-wise Schedule</h2>
      {training.days.length === 0 && <p style={{ color: '#6b7280' }}>Schedule coming soon.</p>}
      {training.days
        .slice()
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((day) => (
          <div className="card" key={day._id} style={{ marginBottom: 12 }}>
            <h3 style={{ marginTop: 0 }}>
              Day {day.dayNumber}: {day.title}
            </h3>
            {day.description && <p style={{ color: '#6b7280', fontSize: 14 }}>{day.description}</p>}
            <ul style={{ paddingLeft: 20 }}>
              {day.tasks.map((task, ti) => (
                <li key={task._id} style={{ marginBottom: 4 }}>
                  {ti + 1}. {task.title} <span className="badge gray">{task.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
