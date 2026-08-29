import { useEffect, useState } from 'react';
import { myTestAttemptsRequest } from '../../services/learning';
import Loading from '../../components/Loading.jsx';

export default function Tests() {
  const [attempts, setAttempts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    myTestAttemptsRequest()
      .then(({ data }) => setAttempts(data.data.attempts))
      .catch((err) => setError(err.response?.data?.message || 'Could not load test attempts.'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!attempts) return <Loading />;

  return (
    <div>
      <h1>My Test Attempts</h1>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        Available tests show up on the course/training page you're enrolled in.
      </p>
      {attempts.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No test attempts yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Result</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a._id}>
                <td>{a.test?.title || 'Deleted test'}</td>
                <td>{a.scorePercent}%</td>
                <td>
                  <span className={`badge ${a.passed ? 'green' : 'red'}`}>{a.passed ? 'Passed' : 'Failed'}</span>
                </td>
                <td>{new Date(a.attemptedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
