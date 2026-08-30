import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  adminGetTrainingRequest,
  adminCreateTrainingRequest,
  adminUpdateTrainingRequest,
  adminAddDayRequest,
  adminDeleteDayRequest,
  adminAddTaskRequest,
  adminDeleteTaskRequest,
} from '../services/trainings';
import Loading from '../components/Loading.jsx';
import Modal from '../components/Modal.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  marginBottom: 12,
};

function AddDayModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onAdd({ title, description });
    setSubmitting(false);
  }

  return (
    <Modal title="Add Day" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="field-label">Day Title</label>
        <input
          type="text"
          className="field-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='e.g. "Introduction & Setup"'
          autoFocus
          required
        />
        <label className="field-label">Description (optional)</label>
        <textarea
          className="field-input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Day'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', type: 'TEXT', content: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    await onAdd(form);
    setSubmitting(false);
  }

  return (
    <Modal title="Add Task" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="field-label">Task Title</label>
        <input
          type="text"
          className="field-input"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
          required
        />
        <label className="field-label">Type</label>
        <select
          className="field-input"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="TEXT">Text</option>
          <option value="VIDEO">Video</option>
          <option value="PDF">PDF</option>
          <option value="LINK">Link</option>
          <option value="ASSIGNMENT">Assignment</option>
        </select>
        <label className="field-label">
          {form.type === 'TEXT' || form.type === 'ASSIGNMENT' ? 'Content / Instructions' : 'URL'}
        </label>
        <textarea
          className="field-input"
          rows={3}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder={form.type === 'VIDEO' || form.type === 'PDF' || form.type === 'LINK' ? 'https://...' : ''}
        />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function TrainingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const confirm = useConfirm();
  const toast = useToast();

  const [training, setTraining] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
    level: 'BEGINNER',
    durationDays: 7,
    isPaid: false,
    price: 0,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showAddDay, setShowAddDay] = useState(false);
  const [addTaskForDay, setAddTaskForDay] = useState(null);

  useEffect(() => {
    if (isNew) return;
    adminGetTrainingRequest(id)
      .then(({ data }) => {
        const t = data.data.training;
        setTraining(t);
        setForm({
          title: t.title,
          description: t.description,
          category: t.category,
          level: t.level,
          durationDays: t.durationDays,
          isPaid: t.isPaid,
          price: t.price,
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load training.'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSaveDetails(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        const { data } = await adminCreateTrainingRequest(form);
        navigate(`/admin/trainings/${data.data.training.id}`, { replace: true });
      } else {
        const { data } = await adminUpdateTrainingRequest(id, form);
        setTraining((prev) => ({ ...prev, ...data.data.training }));
        toast('Training details saved.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save training.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddDay({ title, description }) {
    try {
      const { data } = await adminAddDayRequest(id, { title, description });
      setTraining(data.data.training);
      setShowAddDay(false);
      toast('Day added.');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not add day.', 'error');
    }
  }

  async function handleDeleteDay(dayId) {
    const ok = await confirm('Delete this day and all its tasks? This cannot be undone.', {
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      const { data } = await adminDeleteDayRequest(id, dayId);
      setTraining(data.data.training);
      toast('Day deleted.');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not delete day.', 'error');
    }
  }

  async function handleAddTask(taskForm) {
    try {
      const { data } = await adminAddTaskRequest(id, addTaskForDay, taskForm);
      setTraining(data.data.training);
      setAddTaskForDay(null);
      toast('Task added.');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not add task.', 'error');
    }
  }

  async function handleDeleteTask(dayId, taskId) {
    const ok = await confirm('Delete this task?', { danger: true, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      const { data } = await adminDeleteTaskRequest(id, dayId, taskId);
      setTraining(data.data.training);
      toast('Task deleted.');
    } catch (err) {
      toast(err.response?.data?.message || 'Could not delete task.', 'error');
    }
  }

  if (loading) return <Loading />;

  return (
    <div>
      <Link to="/admin/trainings" style={{ fontSize: 14 }}>
        &larr; Back to Trainings
      </Link>
      <h1>{isNew ? 'New Training' : `Edit: ${training?.title}`}</h1>

      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}

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

        <label style={{ fontSize: 13, color: '#6b7280' }}>Duration</label>
        <select name="durationDays" value={form.durationDays} onChange={handleChange} style={inputStyle}>
          <option value={7}>7 Days</option>
          <option value={14}>14 Days</option>
          <option value={30}>30 Days</option>
        </select>

        <label style={{ fontSize: 14 }}>
          <input type="checkbox" name="isPaid" checked={form.isPaid} onChange={handleChange} /> Paid training
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
          {saving ? 'Saving...' : isNew ? 'Create Training' : 'Save Details'}
        </button>
      </form>

      {!isNew && training && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Day-wise Schedule</h2>
            <button className="btn secondary" onClick={() => setShowAddDay(true)}>
              + Add Day
            </button>
          </div>

          {training.days.length === 0 && (
            <p style={{ color: '#6b7280' }}>No days yet. Add one to start building the schedule.</p>
          )}

          {training.days
            .slice()
            .sort((a, b) => a.dayNumber - b.dayNumber)
            .map((day) => (
              <div className="card" key={day._id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>
                    Day {day.dayNumber}: {day.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn secondary" onClick={() => setAddTaskForDay(day._id)}>
                      + Task
                    </button>
                    <button className="btn secondary" onClick={() => handleDeleteDay(day._id)}>
                      Delete Day
                    </button>
                  </div>
                </div>

                <ul style={{ paddingLeft: 20, marginTop: 12 }}>
                  {day.tasks.length === 0 && <li style={{ color: '#6b7280' }}>No tasks yet.</li>}
                  {day.tasks.map((task, ti) => (
                    <li key={task._id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>
                        {ti + 1}. {task.title} <span className="badge gray">{task.type}</span>
                      </span>
                      <button
                        className="btn secondary"
                        style={{ padding: '2px 10px', fontSize: 12 }}
                        onClick={() => handleDeleteTask(day._id, task._id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          <p style={{ fontSize: 13, color: '#6b7280' }}>
            Publish this training from the Trainings list once it has at least one day.
          </p>
        </div>
      )}

      {showAddDay && <AddDayModal onClose={() => setShowAddDay(false)} onAdd={handleAddDay} />}
      {addTaskForDay && <AddTaskModal onClose={() => setAddTaskForDay(null)} onAdd={handleAddTask} />}
    </div>
  );
}
