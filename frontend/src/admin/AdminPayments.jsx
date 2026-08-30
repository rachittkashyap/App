import { useEffect, useState, useCallback } from 'react';
import { adminListPaymentsRequest, adminGetRevenueRequest, adminRefundPaymentRequest } from '../services/payments';
import Loading from '../components/Loading.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const statusColor = {
  CREATED: 'gray',
  PAID: 'green',
  FAILED: 'red',
  REFUNDED: 'gray',
};

export default function AdminPayments() {
  const confirm = useConfirm();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [status, setStatus] = useState('');
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refunding, setRefunding] = useState(null);

  const fetchOrders = useCallback(
    (page = 1) => {
      setLoading(true);
      setError('');
      adminListPaymentsRequest({ status: status || undefined, page, limit: 10 })
        .then(({ data }) => {
          setOrders(data.data.orders);
          setPagination(data.data.pagination);
        })
        .catch((err) => setError(err.response?.data?.message || 'Could not load payments.'))
        .finally(() => setLoading(false));
    },
    [status]
  );

  useEffect(() => {
    fetchOrders(1);
    adminGetRevenueRequest().then(({ data }) => setRevenue(data.data));
  }, [fetchOrders]);

  async function handleRefund(order) {
    const ok = await confirm(`Refund ₹${(order.amount / 100).toFixed(2)} for "${order.itemTitle}"?`, {
      danger: true,
      confirmLabel: 'Refund',
    });
    if (!ok) return;
    setRefunding(order._id);
    try {
      await adminRefundPaymentRequest(order._id);
      fetchOrders(pagination.page);
      toast('Refund initiated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Refund failed.');
    } finally {
      setRefunding(null);
    }
  }

  return (
    <div>
      <h1>Payments</h1>

      {revenue && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="value">₹{revenue.totalRevenue}</div>
            <div className="label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="value">{revenue.totalPayments}</div>
            <div className="label">Successful Payments</div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="CREATED">Created</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
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
                <th>Item</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No payments found.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    {o.student?.name}
                    <br />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{o.student?.email}</span>
                  </td>
                  <td>{o.itemTitle}</td>
                  <td>₹{(o.amount / 100).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${statusColor[o.status] || 'gray'}`}>{o.status}</span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    {o.status === 'PAID' && (
                      <button
                        className="btn secondary"
                        disabled={refunding === o._id}
                        onClick={() => handleRefund(o)}
                      >
                        {refunding === o._id ? 'Refunding...' : 'Refund'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={pagination.page <= 1} onClick={() => fetchOrders(pagination.page - 1)}>
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchOrders(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
