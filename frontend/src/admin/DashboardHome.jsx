import { useEffect, useState } from 'react';
import api from '../services/api.js';
import Loading from '../components/Loading.jsx';

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then(({ data }) => setStats(data.data.stats))
      .catch((err) => setError(err.response?.data?.message || 'Could not load stats.'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!stats) return <Loading />;

  const cards = [
    { label: 'Total Students', value: stats.totalStudents },
    { label: 'Verified Students', value: stats.verifiedStudents },
    { label: 'Active Students', value: stats.activeStudents },
    { label: 'Suspended Students', value: stats.suspendedStudents },
    { label: 'Total Courses', value: stats.totalCourses },
    { label: 'Total Trainings', value: stats.totalTrainings },
    { label: 'Total Enrollments', value: stats.totalEnrollments },
    { label: 'Certificates Issued', value: stats.totalCertificates },
    { label: 'Total Payments', value: stats.totalPayments },
    { label: 'Revenue', value: `₹${stats.totalRevenue}` },
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p style={{ color: '#6b7280' }}>
        Course, training, enrollment and payment stats will populate as those systems ship.
      </p>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="value">{c.value}</div>
            <div className="label">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
