import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetTemplateRequest, adminUpdateTemplateRequest } from '../services/certificates';
import Loading from '../components/Loading.jsx';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  marginBottom: 12,
};

export default function CertificateTemplate() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminGetTemplateRequest()
      .then(({ data }) => setForm(data.data.template))
      .catch((err) => setError(err.response?.data?.message || 'Could not load template.'));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const { data } = await adminUpdateTemplateRequest(form);
      setForm(data.data.template);
      setMessage('Template saved. New certificates will use these settings.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save template.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <Loading />;

  return (
    <div>
      <Link to="/admin/certificates" style={{ fontSize: 14 }}>
        &larr; Back to Certificates
      </Link>
      <h1>Certificate Template</h1>
      <p style={{ color: '#6b7280', fontSize: 14 }}>
        Use <code>{'{{studentName}}'}</code> and <code>{'{{itemTitle}}'}</code> placeholders in the body text -
        they'll be filled in automatically for each certificate.
      </p>

      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      {message && <p style={{ color: '#16a34a', fontSize: 14 }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <label style={{ fontSize: 13, color: '#6b7280' }}>Organization Name</label>
        <input
          type="text"
          name="organizationName"
          value={form.organizationName}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Certificate Title</label>
        <input type="text" name="titleText" value={form.titleText} onChange={handleChange} style={inputStyle} />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Body Text</label>
        <textarea name="bodyText" value={form.bodyText} onChange={handleChange} rows={3} style={inputStyle} />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Signature Name</label>
        <input
          type="text"
          name="signatureName"
          value={form.signatureName}
          onChange={handleChange}
          style={inputStyle}
          placeholder="e.g. Jane Doe"
        />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Signature Title</label>
        <input
          type="text"
          name="signatureTitle"
          value={form.signatureTitle}
          onChange={handleChange}
          style={inputStyle}
          placeholder="e.g. Program Director"
        />

        <label style={{ fontSize: 13, color: '#6b7280' }}>Accent Color</label>
        <input
          type="color"
          name="accentColor"
          value={form.accentColor}
          onChange={handleChange}
          style={{ ...inputStyle, height: 44, padding: 4 }}
        />

        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </form>
    </div>
  );
}
