import { useEffect, useState } from 'react';
import { mySubmissionsRequest } from '../../services/learning';
import Loading from '../../components/Loading.jsx';

const statusColor = {
  SUBMITTED: 'gray',
  UNDER_REVIEW: 'gray',
  PASSED: 'green',
  FAILED: 'red',
};

export default function Assignments() {
  const [submissions, setSubmissions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    mySubmissionsRequest()
      .then(({ data }) => setSubmissions(data.data.submissions))
      .catch((err) => setError(err.response?.data?.message || 'Could not load submissions.'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!submissions) return <Loading />;

  return (
    <div>
      <h1>Assignments</h1>
      {submissions.length === 0 ? (
        <p style={{ color: '#6b7280' }}>
          No assignment submissions yet. Submit assignments from within a course or training page.
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Score</th>
              <th>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id}>
                <td>{s.itemType}</td>
                <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${statusColor[s.status] || 'gray'}`}>{s.status}</span>
                </td>
                <td>{s.score ?? '-'}</td>
                <td>{s.feedback || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
