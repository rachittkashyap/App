import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  adminListCoursesRequest,
  adminDeleteCourseRequest,
  adminPublishCourseRequest,
  adminUnpublishCourseRequest,
} from '../services/courses';
import Loading from '../components/Loading.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Courses() {
  const confirm = useConfirm();
  const toast = useToast();
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchCourses = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      adminListCoursesRequest({ search, status, page, limit: 10 })
        .then(({ data }) => {
          setCourses(data.data.courses);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load courses.'))
        .finally(() => setLoading(false));
    },
    [search, status]
  );

  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  async function togglePublish(course) {
    setActionError('');
    try {
      if (course.isPublished) {
        await adminUnpublishCourseRequest(course.id);
      } else {
        await adminPublishCourseRequest(course.id);
      }
      fetchCourses(pagination.page);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Action failed.');
    }
  }

  async function handleDelete(course) {
    const ok = await confirm(`Delete "${course.title}"? This cannot be undone.`, {
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    setActionError('');
    try {
      await adminDeleteCourseRequest(course.id);
      fetchCourses(pagination.page);
      toast('Course deleted.');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Delete failed.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Courses</h1>
        <Link to="/admin/courses/new" className="btn">
          + New Course
        </Link>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {actionError && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{actionError}</p>}
      {error && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</p>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Level</th>
                <th>Price</th>
                <th>Modules</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No courses yet. Create your first one!
                  </td>
                </tr>
              )}
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{c.level}</td>
                  <td>{c.isPaid ? `₹${c.price}` : 'Free'}</td>
                  <td>{c.moduleCount}</td>
                  <td>
                    <span className={`badge ${c.isPublished ? 'green' : 'gray'}`}>
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/admin/courses/${c.id}`} className="btn secondary">
                      Edit
                    </Link>
                    <button className="btn secondary" onClick={() => togglePublish(c)}>
                      {c.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="btn secondary" onClick={() => handleDelete(c)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
