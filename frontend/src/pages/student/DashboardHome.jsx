import { useAuth } from '../../context/AuthContext.jsx';

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome back, {user?.name}</h1>
      <p style={{ color: '#6b7280' }}>Here's a quick overview of your learning journey.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="value">0</div>
          <div className="label">Enrolled Courses</div>
        </div>
        <div className="stat-card">
          <div className="value">0</div>
          <div className="label">Enrolled Trainings</div>
        </div>
        <div className="stat-card">
          <div className="value">0</div>
          <div className="label">Pending Assignments</div>
        </div>
        <div className="stat-card">
          <div className="value">0</div>
          <div className="label">Certificates Earned</div>
        </div>
      </div>

      <p style={{ marginTop: 24, color: '#6b7280', fontSize: 14 }}>
        Enrollment, progress tracking, assignments and certificates will populate here as those
        features ship in upcoming phases.
      </p>
    </div>
  );
}
