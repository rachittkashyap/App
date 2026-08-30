import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="navbar container">
      <Link to="/" className="logo">
        TrainingPlatform
      </Link>
      <nav className="nav-links">
        <Link to="/courses">Courses</Link>
        <Link to="/trainings">Trainings</Link>
        <Link to="/apply-internship">Apply for Internship</Link>
        <Link to="/about">About</Link>
        <Link to="/verify-certificate">Verify Certificate</Link>

        {!loading && isAuthenticated ? (
          <>
            <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}>Dashboard</Link>
            <button className="btn secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          !loading && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn">
                Register
              </Link>
            </>
          )
        )}
      </nav>
    </header>
  );
}
