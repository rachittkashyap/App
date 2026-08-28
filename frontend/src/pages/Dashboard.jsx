import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="container section">
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p style={{ color: '#6b7280' }}>
        Full student dashboard (courses, trainings, progress, certificates) will be built in Phase 3.
      </p>
      <button className="btn secondary" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
