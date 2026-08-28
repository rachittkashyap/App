import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseBySlugRequest } from '../services/courses';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/Loading.jsx';

export default function CourseDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getCourseBySlugRequest(slug)
      .then(({ data }) => setCourse(data.data.course))
      .catch((err) => setError(err.response?.data?.message || 'Course not found.'));
  }, [slug]);

  if (error) {
    return (
      <div className="container section">
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (!course) return <Loading />;

  return (
    <div className="container section">
      <span className="badge gray">{course.level}</span> <span className="badge gray">{course.category}</span>
      <h1>{course.title}</h1>
      <p style={{ color: '#6b7280' }}>{course.description}</p>
      <p style={{ fontSize: 20, fontWeight: 700 }}>{course.isPaid ? `₹${course.price}` : 'Free'}</p>

      {isAuthenticated ? (
        <button className="btn">Enroll Now</button>
      ) : (
        <Link to="/login" className="btn">
          Login to Enroll
        </Link>
      )}
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
        Enrollment logic will be wired up in Phase 6.
      </p>

      <h2 style={{ marginTop: 40 }}>Course Content</h2>
      {course.modules.length === 0 && <p style={{ color: '#6b7280' }}>Content coming soon.</p>}
      {course.modules.map((module, mi) => (
        <div className="card" key={module._id} style={{ marginBottom: 12 }}>
          <h3 style={{ marginTop: 0 }}>
            Module {mi + 1}: {module.title}
          </h3>
          {module.description && <p style={{ color: '#6b7280', fontSize: 14 }}>{module.description}</p>}
          <ul style={{ paddingLeft: 20 }}>
            {module.lessons.map((lesson, li) => (
              <li key={lesson._id} style={{ marginBottom: 4 }}>
                {li + 1}. {lesson.title} <span className="badge gray">{lesson.type}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
