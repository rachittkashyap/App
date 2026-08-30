import { useEffect, useState, useCallback } from 'react';
import { adminListSubmissionsRequest, adminReviewSubmissionRequest } from '../services/learning';
import Loading from '../components/Loading.jsx';
import Modal from '../components/Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

const statusColor = {
  SUBMITTED: 'gray',
  UNDER_REVIEW: 'gray',
  PASSED: 'green',
  FAILED: 'red',
};

function ReviewModal({ submission, onClose, onSubmit }) {
  const [status, setStatus] = useState('PASSED');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ status, score: score ? Number(score) : undefined, feedback });
    setSubmitting(false);
  }

  return (
    <Modal title={`Review Submission - ${submission.student?.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {submission.textContent && (
          <div style={{ marginBottom: 14 }}>
            <label className="field-label">Submitted Text</label>
            <p style={{ fontSize: 14, background: '#f9fafb', padding: 10, borderRadius: 8 }}>
              {submission.textContent}
            </p>
          </div>
        )}
        {submission.fileUrl && (
          <p style={{ marginBottom: 14 }}>
            <a href={submission.fileUrl} target="_blank" rel="noreferrer">
              View submitted file
            </a>
          </p>
        )}

        <label className="field-label">Result</label>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <label style={{ fontSize: 14 }}>
            <input
              type="radio"
              name="status"
              value="PASSED"
              checked={status === 'PASSED'}
              onChange={(e) => setStatus(e.target.value)}
            />{' '}
            Pass
          </label>
          <label style={{ fontSize: 14 }}>
            <input
              type="radio"
              name="status"
              value="FAILED"
              checked={status === 'FAILED'}
              onChange={(e) => setStatus(e.target.value)}
            />{' '}
            Fail
          </label>
        </div>

        <label className="field-label">Score (0-100, optional)</label>
        <input
          type="number"
          className="field-input"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />

        <label className="field-label">Feedback (optional)</label>
        <textarea
          className="field-input"
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminAssignments() {
  const toast = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetchSubmissions = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      adminListSubmissionsRequest({ status: status || undefined, page, limit: 10 })
        .then(({ data }) => {
          setSubmissions(data.data.submissions);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load submissions.'))
        .finally(() => setLoading(false));
    },
    [status]
  );

  useEffect(() => {
    fetchSubmissions(1);
  }, [fetchSubmissions]);

  async function handleReviewSubmit(reviewData) {
    try {
      await adminReviewSubmissionRequest(reviewTarget._id, reviewData);
      setReviewTarget(null);
      fetchSubmissions(pagination.page);
      toast('Review saved.');
    } catch (err) {
      toast(err.response?.data?.message || 'Review failed.', 'error');
    }
  }

  return (
    <div>
      <h1>Assignment Submissions</h1>

      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="PASSED">Passed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {error && <p style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</p>}

      {loading ? (
        <Loading />
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Type</th>
                <th>Content</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No submissions found.
                  </td>
                </tr>
              )}
              {submissions.map((s) => (
                <tr key={s._id}>
                  <td>
                    {s.student?.name}
                    <br />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{s.student?.email}</span>
                  </td>
                  <td>{s.itemType}</td>
                  <td style={{ maxWidth: 220 }}>
                    {s.textContent && <div style={{ fontSize: 13 }}>{s.textContent.slice(0, 80)}</div>}
                    {s.fileUrl && (
                      <a href={s.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
                        View file
                      </a>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${statusColor[s.status] || 'gray'}`}>{s.status}</span>
                  </td>
                  <td>{s.score ?? '-'}</td>
                  <td>
                    <button className="btn secondary" onClick={() => setReviewTarget(s)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => fetchSubmissions(pagination.page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchSubmissions(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {reviewTarget && (
        <ReviewModal
          submission={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
