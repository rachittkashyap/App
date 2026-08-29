import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTrainingBySlugRequest } from '../services/trainings';
import {
  enrollRequest,
  enrollmentStatusRequest,
  markItemCompleteRequest,
  submitAssignmentRequest,
  listAvailableTestsRequest,
} from '../services/learning';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/Loading.jsx';

function AssignmentBox({ training, dayId, task, enrollment, onSubmitted, isDone }) {
  const [text, setText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(isDone);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitAssignmentRequest({
        itemType: 'TRAINING',
        itemId: training.id,
        groupId: dayId,
        subItemId: task._id,
        textContent: text,
        fileUrl,
      });
      await markItemCompleteRequest(enrollment.id, task._id);
      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit assignment.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <p style={{ fontSize: 13, color: '#16a34a', marginLeft: 20 }}>✓ Assignment submitted</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginLeft: 20, marginBottom: 10, maxWidth: 420 }}>
      {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
      <textarea
        placeholder="Write your answer here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 6 }}
      />
      <input
        type="text"
        placeholder="Or paste a file link (optional)"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 6 }}
      />
      <button className="btn secondary" type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Assignment'}
      </button>
    </form>
  );
}

export default function TrainingDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [training, setTraining] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const refreshStatus = useCallback(async (trainingId) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await enrollmentStatusRequest('TRAINING', trainingId);
      if (data.data.enrolled) {
        setEnrollment(data.data.enrollment);
        const testsRes = await listAvailableTestsRequest('TRAINING', trainingId);
        setTests(testsRes.data.data.tests);
      }
    } catch {
      // not enrolled or error
    }
  }, [isAuthenticated]);

  useEffect(() => {
    getTrainingBySlugRequest(slug)
      .then(({ data }) => {
        setTraining(data.data.training);
        refreshStatus(data.data.training.id);
      })
      .catch((err) => setError(err.response?.data?.message || 'Training not found.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleEnroll() {
    setEnrollError('');
    setEnrolling(true);
    try {
      await enrollRequest('TRAINING', training.id);
      await refreshStatus(training.id);
    } catch (err) {
      setEnrollError(err.response?.data?.message || 'Could not enroll.');
    } finally {
      setEnrolling(false);
    }
  }

  async function handleMarkComplete(taskId) {
    try {
      const { data } = await markItemCompleteRequest(enrollment.id, taskId);
      setEnrollment((prev) => ({ ...prev, ...data.enrollment, progressPercent: data.progressPercent }));
    } catch (err) {
      setEnrollError(err.response?.data?.message || 'Could not update progress.');
    }
  }

  if (error) {
    return (
      <div className="container section">
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (!training) return <Loading />;

  const isDone = (taskId) => enrollment?.completedItemIds?.some((id) => id === taskId);

  return (
    <div className="container section">
      <span className="badge gray">{training.level}</span>{' '}
      <span className="badge gray">{training.durationDays} Days</span>
      <h1>{training.title}</h1>
      <p style={{ color: '#6b7280' }}>{training.description}</p>
      <p style={{ fontSize: 20, fontWeight: 700 }}>{training.isPaid ? `₹${training.price}` : 'Free'}</p>

      {enrollError && <p style={{ color: '#dc2626', fontSize: 14 }}>{enrollError}</p>}

      {!isAuthenticated && (
        <Link to="/login" className="btn">
          Login to Enroll
        </Link>
      )}

      {isAuthenticated && !enrollment && (
        <button className="btn" onClick={handleEnroll} disabled={enrolling}>
          {enrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      )}

      {isAuthenticated && enrollment && (
        <div>
          <p style={{ fontWeight: 600 }}>
            {enrollment.isCompleted ? '✓ Training Completed!' : `Progress: ${enrollment.progressPercent || 0}%`}
          </p>
          {tests.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Available Tests:</p>
              {tests.map((t) => (
                <button
                  key={t.id}
                  className="btn secondary"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/dashboard/tests/${t.id}`)}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
                <li key={task._id} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ti + 1}. {task.title} <span className="badge gray">{task.type}</span>
                    {enrollment && task.type !== 'ASSIGNMENT' && (
                      <button
                        className="btn secondary"
                        style={{ padding: '2px 10px', fontSize: 12 }}
                        disabled={isDone(task._id)}
                        onClick={() => handleMarkComplete(task._id)}
                      >
                        {isDone(task._id) ? '✓ Done' : 'Mark Complete'}
                      </button>
                    )}
                  </div>
                  {enrollment && task.type === 'ASSIGNMENT' && (
                    <AssignmentBox
                      training={training}
                      dayId={day._id}
                      task={task}
                      enrollment={enrollment}
                      isDone={isDone(task._id)}
                      onSubmitted={() => refreshStatus(training.id)}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
