import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  adminGetCourseRequest,
  adminCreateCourseRequest,
  adminUpdateCourseRequest,
  adminAddModuleRequest,
  adminDeleteModuleRequest,
  adminAddLessonRequest,
  adminDeleteLessonRequest,
} from '../services/courses';
import Loading from '../components/Loading.jsx';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  marginBottom: 12,
};

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    level: 'BEGINNER',
    isPaid: false,
    price: 0,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isNew) return;
    adminGetCourseRequest(id)
      .then(({ data }) => {
        const c = data.data.course;
        setCourse(c);
        setForm({
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
          isPaid: c.isPaid,
          price: c.price,
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load course.'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSaveDetails(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await adminCreateCourseRequest(form);
        navigate(`/admin/courses/${data.data.course.id}`, { replace: true });
      } else {
        const { data } = await adminUpdateCourseRequest(id, form);
        setCourse((prev) => ({ ...prev, ...data.data.course }));
        setMessage('Course details saved.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save course.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddModule() {
    const title = window.prompt('Module title:');
    if (!title) return;
    try {
      const { data } = await adminAddModuleRequest(id, { title });
      setCourse(data.data.course);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add module.');
    }
  }

  async function handleDeleteModule(moduleId) {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      const { data } = await adminDeleteModuleRequest(id, moduleId);
      setCourse(data.data.course);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete module.');
    }
  }

  async function handleAddLesson(moduleId) {
    const title = window.prompt('Lesson title:');
    if (!title) return;
    const type = window.prompt('Lesson type (VIDEO / PDF / LINK / TEXT):', 'TEXT') || 'TEXT';
    const content = window.prompt('Content (URL for VIDEO/PDF/LINK, or text for TEXT):', '') || '';
    try {
      const { data } = await adminAddLessonRequest(id, moduleId, {
        title,
        type: type.toUpperCase(),
        content,
      });
      setCourse(data.data.course);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add lesson.');
    }
  }

  async function handleDeleteLesson(moduleId, lessonId) {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      const { data } = await adminDeleteLessonRequest(id, moduleId, lessonId);
      setCourse(data.data.course);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete lesson.');
    }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <Link to="/admin/courses" style={{ fontSize: 14 }}>
        &larr; Back to Courses
      </Link>
      <h1>{isNew ? 'New Course' : `Edit: ${course?.title}`}</h1>

      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      {message && <p style={{ color: '#16a34a', fontSize: 14 }}>{message}</p>}

      <form onSubmit={handleSaveDetails} style={{ maxWidth: 480 }}>
        <label style={{ fontSize: 13, color: '#6b7280' }}>Title</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} style={inputStyle} required />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          style={inputStyle}
        />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Category</label>
        <input type="text" name="category" value={form.category} onChange={handleChange} style={inputStyle} />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Level</label>
        <select name="level" value={form.level} onChange={handleChange} style={inputStyle}>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>

        <label style={{ fontSize: 14 }}>
          <input type="checkbox" name="isPaid" checked={form.isPaid} onChange={handleChange} /> Paid course
        </label>

        {form.isPaid && (
          <>
            <label style={{ fontSize: 13, color: '#6b7280', display: 'block', marginTop: 10 }}>
              Price (₹)
            </label>
            <input type="number" name="price" value={form.price} onChange={handleChange} style={inputStyle} min={0} />
          </>
        )}

        <button className="btn" type="submit" disabled={saving} style={{ marginTop: 10 }}>
          {saving ? 'Saving...' : isNew ? 'Create Course' : 'Save Details'}
        </button>
      </form>

      {!isNew && course && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Modules &amp; Lessons</h2>
            <button className="btn secondary" onClick={handleAddModule}>
              + Add Module
            </button>
          </div>

          {course.modules.length === 0 && (
            <p style={{ color: '#6b7280' }}>No modules yet. Add one to start building content.</p>
          )}

          {course.modules.map((module, mi) => (
            <div className="card" key={module._id} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>
                  Module {mi + 1}: {module.title}
                </h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn secondary" onClick={() => handleAddLesson(module._id)}>
                    + Lesson
                  </button>
                  <button className="btn secondary" onClick={() => handleDeleteModule(module._id)}>
                    Delete Module
                  </button>
                </div>
              </div>

              <ul style={{ paddingLeft: 20, marginTop: 12 }}>
                {module.lessons.length === 0 && <li style={{ color: '#6b7280' }}>No lessons yet.</li>}
                {module.lessons.map((lesson, li) => (
                  <li key={lesson._id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>
                      {li + 1}. {lesson.title} <span className="badge gray">{lesson.type}</span>
                    </span>
                    <button
                      className="btn secondary"
                      style={{ padding: '2px 10px', fontSize: 12 }}
                      onClick={() => handleDeleteLesson(module._id, lesson._id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p style={{ fontSize: 13, color: '#6b7280' }}>
            Publish this course from the Courses list once it has at least one module.
          </p>
        </div>
      )}
    </div>
  );
}
