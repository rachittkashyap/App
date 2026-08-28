import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar container">
      <Link to="/" className="logo">
        TrainingPlatform
      </Link>
      <nav className="nav-links">
        <Link to="/courses">Courses</Link>
        <Link to="/trainings">Trainings</Link>
        <Link to="/about">About</Link>
        <Link to="/verify-certificate">Verify Certificate</Link>
        <Link to="/login">Login</Link>
        <Link to="/register" className="btn">
          Register
        </Link>
      </nav>
    </header>
  );
}
