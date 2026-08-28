import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <section className="hero container">
        <h1>Learn. Build. Get Certified.</h1>
        <p>Courses and virtual training programs to help you grow your skills.</p>
        <Link to="/courses" className="btn">
          Explore Courses
        </Link>
      </section>

      <section className="section container">
        <h2>Featured Courses</h2>
        <div className="card-grid">
          <div className="card">Course listings will appear here (Phase 4).</div>
        </div>
      </section>

      <section className="section container">
        <h2>Featured Trainings / Internships</h2>
        <div className="card-grid">
          <div className="card">Training listings will appear here (Phase 5).</div>
        </div>
      </section>

      <section className="section container">
        <h2>How It Works</h2>
        <div className="card-grid">
          <div className="card">1. Register &amp; verify your email</div>
          <div className="card">2. Enroll in a course or training</div>
          <div className="card">3. Learn, submit assignments &amp; tests</div>
          <div className="card">4. Get your completion certificate</div>
        </div>
      </section>

      <section className="section container">
        <h2>FAQ</h2>
        <div className="card">More details coming soon.</div>
      </section>
    </div>
  );
}
