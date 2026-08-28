import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCoursesRequest } from '../services/courses';

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    listCoursesRequest({ limit: 3 })
      .then(({ data }) => setCourses(data.data.courses))
      .catch(() => setCourses([]));
  }, []);

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
          {courses.length === 0 ? (
            <div className="card">No published courses yet. Check back soon!</div>
          ) : (
            courses.map((course) => (
              <Link to={`/courses/${course.slug}`} key={course.id} className="card">
                <h3 style={{ marginTop: 0 }}>{course.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14 }}>{course.description}</p>
                <p style={{ fontWeight: 700 }}>{course.isPaid ? `₹${course.price}` : 'Free'}</p>
              </Link>
            ))
          )}
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
