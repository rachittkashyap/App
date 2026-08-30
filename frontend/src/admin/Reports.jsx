import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminGetReportsOverviewRequest } from '../services/reports';
import Loading from '../components/Loading.jsx';

function MiniBarChart({ data, valueKey, formatValue }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, marginTop: 12 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, textAlign: 'center' }}>
          <div
            style={{
              height: `${(d[valueKey] / max) * 100}px`,
              background: '#4f46e5',
              borderRadius: '4px 4px 0 0',
              minHeight: 2,
            }}
            title={formatValue ? formatValue(d[valueKey]) : d[valueKey]}
          />
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{d.label}</div>
          <div style={{ fontSize: 11, fontWeight: 600 }}>
            {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetReportsOverviewRequest()
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load reports.'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!data) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reports</h1>
        <Link to="/admin/audit-logs" className="btn secondary">
          View Audit Logs
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Revenue (last 6 months)</h3>
        <MiniBarChart data={data.revenueByMonth} valueKey="revenue" formatValue={(v) => `₹${v}`} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Enrollments (last 6 months)</h3>
        <MiniBarChart data={data.enrollmentsByMonth} valueKey="count" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Certificates Issued (last 6 months)</h3>
        <MiniBarChart data={data.certificatesByMonth} valueKey="count" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Most Popular</h3>
          {data.popularity.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No enrollments yet.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {data.popularity.map((p, i) => (
                  <tr key={i}>
                    <td>{p.title}</td>
                    <td>{p.itemType}</td>
                    <td>{p.enrollments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Completion Rate</h3>
          <p style={{ fontSize: 36, fontWeight: 700, color: '#4f46e5', margin: '10px 0' }}>
            {data.completionRatePercent}%
          </p>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            {data.completedEnrollments} of {data.totalEnrollments} enrollments completed (all-time)
          </p>

          <h3 style={{ marginTop: 24 }}>Email Delivery</h3>
          <p style={{ fontSize: 14 }}>
            <span className="badge green">{data.emailStats.sent} Sent</span>{' '}
            <span className="badge red">{data.emailStats.failed} Failed</span>{' '}
            <span className="badge gray">{data.emailStats.pending} Pending</span>
          </p>
        </div>
      </div>
    </div>
  );
}
