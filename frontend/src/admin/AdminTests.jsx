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

export default function AdminTests() {
  const [tests, setTests] = useState(null);
  const [courses, setCourses] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [error, setError] = useState('');

  const [newTest, setNewTest] = useState({ itemType: 'COURSE', itemId: '', title: '', passingScorePercent: 60 });
  const [creating, setCreating] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);

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

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!newTest.itemId || !newTest.title) {
      setError('Select an item and enter a title.');
      return;
    }
    setCreating(true);
    try {
      await adminCreateTestRequest(newTest);
      setNewTest({ itemType: 'COURSE', itemId: '', title: '', passingScorePercent: 60 });
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create test.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this test?')) return;
    try {
      await adminDeleteTestRequest(id);
      if (selectedTest?.id === id) setSelectedTest(null);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  }

  async function togglePublish(test) {
    try {
      if (test.isPublished) await adminUnpublishTestRequest(test.id);
      else await adminPublishTestRequest(test.id);
      fetchTests();
      if (selectedTest?.id === test.id) openTest(test.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    }
  }

  async function openTest(id) {
    const { data } = await adminGetTestRequest(id);
    setSelectedTest(data.data.test);
  }

  async function handleAddQuestion() {
    const questionText = window.prompt('Question text:');
    if (!questionText) return;
    const optionsRaw = window.prompt('Options, comma-separated (e.g. Paris,London,Berlin):');
    if (!optionsRaw) return;
    const options = optionsRaw.split(',').map((o) => o.trim()).filter(Boolean);
    const correctRaw = window.prompt(
      `Correct option number(s), comma-separated, 1-${options.length} (e.g. "1" or "1,3"):`
    );
    if (!correctRaw) return;
    const correctOptionIndexes = correctRaw.split(',').map((n) => parseInt(n.trim(), 10) - 1);

    try {
      await adminAddQuestionRequest(selectedTest.id, {
        questionText,
        type: correctOptionIndexes.length > 1 ? 'MULTI' : 'SINGLE',
        options,
        correctOptionIndexes,
      });
      openTest(selectedTest.id);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add question.');
    }
  }

  async function handleDeleteQuestion(questionId) {
    if (!window.confirm('Delete this question?')) return;
    try {
      await adminDeleteQuestionRequest(selectedTest.id, questionId);
      openTest(selectedTest.id);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete question.');
    }
  }

  if (!tests) return <Loading />;

  const itemOptions = newTest.itemType === 'COURSE' ? courses : trainings;

  return (
    <div>
      <h1>Tests</h1>
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Create New Test</h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={newTest.itemType}
            onChange={(e) => setNewTest({ ...newTest, itemType: e.target.value, itemId: '' })}
          >
            <option value="COURSE">Course</option>
            <option value="TRAINING">Training</option>
          </select>
          <select value={newTest.itemId} onChange={(e) => setNewTest({ ...newTest, itemId: e.target.value })}>
            <option value="">Select {newTest.itemType.toLowerCase()}...</option>
            {itemOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Test title"
            value={newTest.title}
            onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="Passing %"
            value={newTest.passingScorePercent}
            onChange={(e) => setNewTest({ ...newTest, passingScorePercent: e.target.value })}
            style={{ width: 90 }}
          />
          <button className="btn" type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Test'}
          </button>
        </form>
      </div>

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
            <button className="btn secondary" onClick={handleAddQuestion}>
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
    </div>
  );
}
