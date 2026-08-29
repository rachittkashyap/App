import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseBySlugRequest } from '../services/courses';
import {
  enrollRequest,
  enrollmentStatusRequest,
  markItemCompleteRequest,
  submitAssignmentRequest,
  listAvailableTestsRequest,
} from '../services/learning';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/Loading.jsx';
import BuyButton from '../components/BuyButton.jsx';

function AssignmentBox({ course, moduleId, lesson, enrollment, onSubmitted, isDone }) {
  const [text, setText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(isDone);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitAssignmentRequest({
        itemType: 'COURSE',
        itemId: course.id,
        groupId: moduleId,
        subItemId: lesson._id,
        textContent: text,
        fileUrl,
      });
      await markItemCompleteRequest(enrollment.id, lesson._id);
      setSubmitted(true);
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit assignment.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <p style={{ fontSize: 13, color: '#16a34a', marginLeft: 20 }}>✓ Assignment submitted</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginLeft: 20, marginBottom: 10, maxWidth: 420 }}>
      {error && <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>}
      <textarea
        placeholder="Write your answer here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 6 }}
      />
      <input
        type="text"
        placeholder="Or paste a file link (optional)"
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 6 }}
      />
      <button className="btn secondary" type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Assignment'}
      </button>
    </form>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const refreshStatus = useCallback(async (courseId) => {
    if (!isAuthenticated) return;
    try {
      const { data } = await enrollmentStatusRequest('COURSE', courseId);
      if (data.data.enrolled) {
        setEnrollment(data.data.enrollment);
        const testsRes = await listAvailableTestsRequest('COURSE', courseId);
        setTests(testsRes.data.data.tests);
      }
    } catch {
      // not enrolled or error - leave enrollment as null
    }
  }, [isAuthenticated]);

  useEffect(() => {
    getCourseBySlugRequest(slug)
      .then(({ data }) => {
        setCourse(data.data.course);
        refreshStatus(data.data.course.id);
      })
      .catch((err) => setError(err.response?.data?.message || 'Course not found.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function handleEnroll() {
    setEnrollError('');
    setEnrolling(true);
    try {
      await enrollRequest('COURSE', course.id);
      await refreshStatus(course.id);
    } catch (err) {
      setEnrollError(err.response?.data?.message || 'Could not enroll.');
    } finally {
      setEnrolling(false);
    }
  }

  async function handleMarkComplete(lessonId) {
    try {
      const { data } = await markItemCompleteRequest(enrollment.id, lessonId);
      setEnrollment((prev) => ({ ...prev, ...data.enrollment, progressPercent: data.progressPercent }));
    } catch (err) {
      setEnrollError(err.response?.data?.message || 'Could not update progress.');
    }
  }

  if (error) {
    return (
      <div className="container section">
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  if (!course) return <Loading />;

  const isDone = (lessonId) => enrollment?.completedItemIds?.some((id) => id === lessonId);

  return (
    <div className="container section">
      <span className="badge gray">{course.level}</span> <span className="badge gray">{course.category}</span>
      <h1>{course.title}</h1>
      <p style={{ color: '#6b7280' }}>{course.description}</p>
      <p style={{ fontSize: 20, fontWeight: 700 }}>{course.isPaid ? `₹${course.price}` : 'Free'}</p>

      {enrollError && <p style={{ color: '#dc2626', fontSize: 14 }}>{enrollError}</p>}

      {!isAuthenticated && (
        <Link to="/login" className="btn">
          Login to Enroll
        </Link>
      )}

      {isAuthenticated && !enrollment && !course.isPaid && (
        <button className="btn" onClick={handleEnroll} disabled={enrolling}>
          {enrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      )}

      {isAuthenticated && !enrollment && course.isPaid && (
        <BuyButton
          itemType="COURSE"
          itemId={course.id}
          price={course.price}
          onSuccess={() => refreshStatus(course.id)}
        />
      )}

      {isAuthenticated && enrollment && (
        <div>
          <p style={{ fontWeight: 600 }}>
            {enrollment.isCompleted ? '✓ Course Completed!' : `Progress: ${enrollment.progressPercent || 0}%`}
          </p>
          {tests.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Available Tests:</p>
              {tests.map((t) => (
                <button
                  key={t.id}
                  className="btn secondary"
                  style={{ marginRight: 8 }}
                  onClick={() => navigate(`/dashboard/tests/${t.id}`)}
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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
              <li key={lesson._id} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {li + 1}. {lesson.title} <span className="badge gray">{lesson.type}</span>
                  {enrollment && lesson.type !== 'ASSIGNMENT' && (
                    <button
                      className="btn secondary"
                      style={{ padding: '2px 10px', fontSize: 12 }}
                      disabled={isDone(lesson._id)}
                      onClick={() => handleMarkComplete(lesson._id)}
                    >
                      {isDone(lesson._id) ? '✓ Done' : 'Mark Complete'}
                    </button>
                  )}
                </div>
                {enrollment && lesson.type === 'ASSIGNMENT' && (
                  <AssignmentBox
                    course={course}
                    moduleId={module._id}
                    lesson={lesson}
                    enrollment={enrollment}
                    isDone={isDone(lesson._id)}
                    onSubmitted={() => refreshStatus(course.id)}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
