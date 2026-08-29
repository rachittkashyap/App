import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestForAttemptRequest, attemptTestRequest } from '../../services/learning';
import Loading from '../../components/Loading.jsx';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> [optionId]
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTestForAttemptRequest(id)
      .then(({ data }) => setTest(data.data.test))
      .catch((err) => setError(err.response?.data?.message || 'Could not load test.'));
  }, [id]);

  function selectOption(questionId, optionId, type) {
    setAnswers((prev) => {
      if (type === 'MULTI') {
        const current = prev[questionId] || [];
        const next = current.includes(optionId)
          ? current.filter((o) => o !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  }

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      const payload = test.questions.map((q) => ({
        questionId: q.id,
        selectedOptionIds: answers[q.id] || [],
      }));
      const { data } = await attemptTestRequest(id, payload);
      setResult(data.data.attempt);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit test.');
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !test) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!test) return <Loading />;

  if (result) {
    return (
      <div>
        <h1>{result.passed ? '🎉 You Passed!' : 'Test Result'}</h1>
        <p style={{ fontSize: 18 }}>
          Score: <strong>{result.scorePercent}%</strong> ({result.correctCount}/{result.totalQuestions} correct)
        </p>
        <p>Passing score required: {result.passingScorePercent}%</p>
        <p style={{ color: result.passed ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
          {result.passed ? 'You passed this test.' : 'You did not pass. You can review and try again later.'}
        </p>
        <button className="btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>{test.title}</h1>
      {test.description && <p style={{ color: '#6b7280' }}>{test.description}</p>}
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      {test.questions.map((q, qi) => (
        <div className="card" key={q.id} style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600 }}>
            {qi + 1}. {q.questionText}
          </p>
          {q.options.map((opt) => (
            <label key={opt.id} style={{ display: 'block', marginBottom: 6, fontSize: 14 }}>
              <input
                type={q.type === 'MULTI' ? 'checkbox' : 'radio'}
                name={q.id}
                checked={(answers[q.id] || []).includes(opt.id)}
                onChange={() => selectOption(q.id, opt.id, q.type)}
                style={{ marginRight: 8 }}
              />
              {opt.text}
            </label>
          ))}
        </div>
      ))}

      <button className="btn" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Test'}
      </button>
    </div>
  );
}
