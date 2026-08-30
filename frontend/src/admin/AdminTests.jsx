import { useEffect, useState, useCallback } from 'react';
import {
  adminListTestsRequest,
  adminCreateTestRequest,
  adminDeleteTestRequest,
  adminPublishTestRequest,
  adminUnpublishTestRequest,
  adminAddQuestionRequest,
  adminDeleteQuestionRequest,
  adminGetTestRequest,
} from '../services/learning';
import { adminListCoursesRequest } from '../services/courses';
import { adminListTrainingsRequest } from '../services/trainings';
import Loading from '../components/Loading.jsx';
import Modal from '../components/Modal.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function AddQuestionModal({ onClose, onAdd }) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctIndexes, setCorrectIndexes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateOption(index, value) {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  }

  function addOption() {
    setOptions([...options, '']);
  }

  function removeOption(index) {
    setOptions(options.filter((_, i) => i !== index));
    setCorrectIndexes(correctIndexes.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  }

  function toggleCorrect(index) {
    setCorrectIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!questionText.trim() || cleanOptions.length < 2) {
      setError('Enter a question and at least 2 options.');
      return;
    }
    if (correctIndexes.length === 0) {
      setError('Mark at least one option as correct.');
      return;
    }

    setSubmitting(true);
    try {
      await onAdd({
        questionText,
        type: correctIndexes.length > 1 ? 'MULTI' : 'SINGLE',
        options: cleanOptions,
        correctOptionIndexes: correctIndexes,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add Question" onClose={onClose} width={520}>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

        <label className="field-label">Question</label>
        <textarea
          className="field-input"
          rows={2}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          autoFocus
        />

        <label className="field-label">Options (check the correct answer(s))</label>
        {options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={correctIndexes.includes(i)}
              onChange={() => toggleCorrect(i)}
              title="Mark as correct"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              style={{ flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 }}
            />
            {options.length > 2 && (
              <button
                type="button"
                className="btn secondary"
                style={{ padding: '4px 10px', fontSize: 12 }}
                onClick={() => removeOption(i)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn secondary" onClick={addOption} style={{ marginBottom: 16 }}>
          + Add Option
        </button>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Question'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CreateTestModal({ onClose, onCreate, courses, trainings }) {
  const [form, setForm] = useState({ itemType: 'COURSE', itemId: '', title: '', passingScorePercent: 60 });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const itemOptions = form.itemType === 'COURSE' ? courses : trainings;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.itemId || !form.title.trim()) {
      setError('Select an item and enter a title.');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create New Test" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

        <label className="field-label">For</label>
        <select
          className="field-input"
          value={form.itemType}
          onChange={(e) => setForm({ ...form, itemType: e.target.value, itemId: '' })}
        >
          <option value="COURSE">Course</option>
          <option value="TRAINING">Training</option>
        </select>

        <label className="field-label">{form.itemType === 'COURSE' ? 'Course' : 'Training'}</label>
        <select
          className="field-input"
          value={form.itemId}
          onChange={(e) => setForm({ ...form, itemId: e.target.value })}
        >
          <option value="">Select...</option>
          {itemOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title}
            </option>
          ))}
        </select>

        <label className="field-label">Test Title</label>
        <input
          type="text"
          className="field-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <label className="field-label">Passing Score (%)</label>
        <input
          type="number"
          className="field-input"
          min={0}
          max={100}
          value={form.passingScorePercent}
          onChange={(e) => setForm({ ...form, passingScorePercent: e.target.value })}
        />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Test'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminTests() {
  const confirm = useConfirm();
  const toast = useToast();

  const [tests, setTests] = useState(null);
  const [courses, setCourses] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const fetchTests = useCallback(() => {
    adminListTestsRequest()
      .then(({ data }) => setTests(data.data.tests))
      .catch((err) => setError(err.response?.data?.message || 'Could not load tests.'));
  }, []);

  useEffect(() => {
    fetchTests();
    adminListCoursesRequest({ limit: 100 }).then(({ data }) => setCourses(data.data.courses));
    adminListTrainingsRequest({ limit: 100 }).then(({ data }) => setTrainings(data.data.trainings));
  }, [fetchTests]);

  async function handleCreate(form) {
    try {
      await adminCreateTestRequest(form);
      setShowCreateTest(false);
      fetchTests();
      toast('Test created.');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not create test.', 'error');
    }
  }

  async function handleDelete(id) {
    const ok = await confirm('Delete this test? All questions will be lost.', {
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await adminDeleteTestRequest(id);
      if (selectedTest?.id === id) setSelectedTest(null);
      fetchTests();
      toast('Test deleted.');
    } catch (err) {
      toast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  }

  async function togglePublish(test) {
    try {
      if (test.isPublished) await adminUnpublishTestRequest(test.id);
      else await adminPublishTestRequest(test.id);
      fetchTests();
      if (selectedTest?.id === test.id) openTest(test.id);
      toast(test.isPublished ? 'Test unpublished.' : 'Test published.');
    } catch (err) {
      toast(err.response?.data?.message || 'Action failed.', 'error');
    }
  }

  async function openTest(id) {
    const { data } = await adminGetTestRequest(id);
    setSelectedTest(data.data.test);
  }

  async function handleAddQuestion(questionData) {
    try {
      await adminAddQuestionRequest(selectedTest.id, questionData);
      openTest(selectedTest.id);
      fetchTests();
      setShowAddQuestion(false);
      toast('Question added.');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not add question.', 'error');
    }
  }

  async function handleDeleteQuestion(questionId) {
    const ok = await confirm('Delete this question?', { danger: true, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await adminDeleteQuestionRequest(selectedTest.id, questionId);
      openTest(selectedTest.id);
      fetchTests();
      toast('Question deleted.');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not delete question.', 'error');
    }
  }

  if (!tests) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Tests</h1>
        <button className="btn" onClick={() => setShowCreateTest(true)}>
          + New Test
        </button>
      </div>
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>For</th>
            <th>Questions</th>
            <th>Passing %</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>
                No tests yet.
              </td>
            </tr>
          )}
          {tests.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.itemType}</td>
              <td>{t.questionCount}</td>
              <td>{t.passingScorePercent}%</td>
              <td>
                <span className={`badge ${t.isPublished ? 'green' : 'gray'}`}>
                  {t.isPublished ? 'Published' : 'Draft'}
                </span>
              </td>
              <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn secondary" onClick={() => openTest(t.id)}>
                  Manage
                </button>
                <button className="btn secondary" onClick={() => togglePublish(t)}>
                  {t.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button className="btn secondary" onClick={() => handleDelete(t.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTest && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Questions: {selectedTest.title}</h3>
            <button className="btn secondary" onClick={() => setShowAddQuestion(true)}>
              + Add Question
            </button>
          </div>

          {selectedTest.questions.length === 0 && (
            <p style={{ color: '#6b7280' }}>No questions yet.</p>
          )}
          {selectedTest.questions.map((q, qi) => (
            <div key={q._id} style={{ marginTop: 12, paddingBottom: 10, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 600, margin: 0 }}>
                  {qi + 1}. {q.questionText}
                </p>
                <button
                  className="btn secondary"
                  style={{ padding: '2px 10px', fontSize: 12 }}
                  onClick={() => handleDeleteQuestion(q._id)}
                >
                  Delete
                </button>
              </div>
              <ul style={{ paddingLeft: 20, marginTop: 6 }}>
                {q.options.map((opt) => (
                  <li key={opt._id} style={{ fontSize: 14 }}>
                    {opt.text}{' '}
                    {q.correctOptionIds.some((id) => id.toString() === opt._id.toString()) && (
                      <span className="badge green">Correct</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {showCreateTest && (
        <CreateTestModal
          onClose={() => setShowCreateTest(false)}
          onCreate={handleCreate}
          courses={courses}
          trainings={trainings}
        />
      )}
      {showAddQuestion && (
        <AddQuestionModal onClose={() => setShowAddQuestion(false)} onAdd={handleAddQuestion} />
      )}
    </div>
  );
}
