import { useState } from 'react';
import { submitInternshipApplication } from '../services/internshipApplications';

const INTERNSHIP_OPTIONS = [
  'Full Stack Development',
  'Frontend Development',
  'Backend Development',
  'Java Development',
  'Node.js Development',
  'UI/UX',
];

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  courseOrDegree: '',
  college: '',
  tenthPercentage: '',
  twelfthPercentage: '',
  internshipType: '',
};

export default function InternshipApplication() {
  const [form, setForm] = useState(initialForm);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setError('Resume must be under 10MB.');
      e.target.value = '';
      setResume(null);
      return;
    }
    setError('');
    setResume(file || null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!resume) {
      setError('Please upload your resume.');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append('resume', resume);

    setSubmitting(true);
    try {
      await submitInternshipApplication(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container section" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <h1>✅ Application Submitted!</h1>
        <p style={{ color: '#6b7280' }}>
          Thank you for applying to the Novalynx Labs Virtual Internship Program. Our team will review your
          application and get back to you via email.
        </p>
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="card" style={{ marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>🚀 Novalynx Labs — Virtual Internship Program</h1>
        <p style={{ color: '#374151' }}>
          Get hands-on experience by working on real-world projects with a virtual, mentor-guided internship.
        </p>
        <p style={{ fontWeight: 700, color: '#16a34a' }}>100% FREE — No registration or internship fee.</p>
      </div>

      {error && (
        <p style={{ color: '#dc2626', fontSize: 14, background: '#fef2f2', padding: 10, borderRadius: 8 }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="card">
        <label className="field-label">Full Name *</label>
        <input
          type="text"
          name="fullName"
          className="field-input"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <label className="field-label">Email *</label>
        <input
          type="email"
          name="email"
          className="field-input"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label className="field-label">Phone Number *</label>
        <input
          type="tel"
          name="phone"
          className="field-input"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <label className="field-label">Course / Degree *</label>
        <input
          type="text"
          name="courseOrDegree"
          className="field-input"
          value={form.courseOrDegree}
          onChange={handleChange}
          required
        />

        <label className="field-label">College / University *</label>
        <input
          type="text"
          name="college"
          className="field-input"
          value={form.college}
          onChange={handleChange}
          required
        />

        <label className="field-label">10th Percentage *</label>
        <input
          type="text"
          name="tenthPercentage"
          className="field-input"
          value={form.tenthPercentage}
          onChange={handleChange}
          required
        />

        <label className="field-label">12th Percentage *</label>
        <input
          type="text"
          name="twelfthPercentage"
          className="field-input"
          value={form.twelfthPercentage}
          onChange={handleChange}
          required
        />

        <label className="field-label">Which Internship? *</label>
        <div style={{ marginBottom: 14 }}>
          {INTERNSHIP_OPTIONS.map((option) => (
            <label key={option} style={{ display: 'block', fontSize: 14, marginBottom: 6 }}>
              <input
                type="radio"
                name="internshipType"
                value={option}
                checked={form.internshipType === option}
                onChange={handleChange}
                required
                style={{ marginRight: 8 }}
              />
              {option}
            </label>
          ))}
        </div>

        <label className="field-label">Resume *</label>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: -8, marginBottom: 6 }}>
          Upload 1 supported file: PDF or Word document. Max 10 MB.
        </p>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="field-input"
          required
        />

        <button className="btn" type="submit" disabled={submitting} style={{ marginTop: 10, width: '100%' }}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
