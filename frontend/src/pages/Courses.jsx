import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listCoursesRequest } from '../services/courses';
import Loading from '../components/Loading.jsx';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [isPaid, setIsPaid] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      listCoursesRequest({ search, level: level || undefined, isPaid: isPaid || undefined, page, limit: 9 })
        .then(({ data }) => {
          setCourses(data.data.courses);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load courses.'))
        .finally(() => setLoading(false));
    },
    [search, level, isPaid]
  );

  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  return (
    <div className="container section">
      <h1>Courses</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
        <select value={isPaid} onChange={(e) => setIsPaid(e.target.value)}>
          <option value="">Free & Paid</option>
          <option value="false">Free Only</option>
          <option value="true">Paid Only</option>
        </select>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {loading ? (
        <Loading />
      ) : courses.length === 0 ? (
        <p style={{ color: '#6b7280', marginTop: 24 }}>No courses published yet. Check back soon!</p>
      ) : (
        <>
          <div className="card-grid">
            {courses.map((course) => (
              <Link to={`/courses/${course.slug}`} key={course.id} className="card">
                <h3 style={{ marginTop: 0 }}>{course.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14 }}>{course.description}</p>
                <p style={{ fontSize: 13 }}>
                  <span className="badge gray">{course.level}</span>{' '}
                  <span className="badge gray">{course.category}</span>
                </p>
                <p style={{ fontWeight: 700 }}>{course.isPaid ? `₹${course.price}` : 'Free'}</p>
              </Link>
            ))}
          </div>

          <div className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => fetchCourses(pagination.page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchCourses(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
