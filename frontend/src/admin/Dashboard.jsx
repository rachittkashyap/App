import { useAuth } from '../context/AuthContext.jsx';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="container section">
      <h1>Admin Dashboard</h1>
      <p>Logged in as: {user?.name} ({user?.email})</p>
      <p style={{ color: '#6b7280' }}>
        Full admin dashboard (stats, students, courses, trainings, payments, etc.) will be built in Phase 3.
      </p>
      <button className="btn secondary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
