import { useEffect, useState } from 'react';
import { myOrdersRequest } from '../../services/payments';
import Loading from '../../components/Loading.jsx';

const statusColor = {
  CREATED: 'gray',
  PAID: 'green',
  FAILED: 'red',
  REFUNDED: 'gray',
};

export default function Payments() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    myOrdersRequest()
      .then(({ data }) => setOrders(data.data.orders))
      .catch((err) => setError(err.response?.data?.message || 'Could not load payments.'));
  }, []);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!orders) return <Loading />;

  return (
    <div>
      <h1>Payments</h1>
      {orders.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No payments yet. Purchases you make will show up here.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.itemTitle}</td>
                <td>₹{(o.amount / 100).toFixed(2)}</td>
                <td>
                  <span className={`badge ${statusColor[o.status] || 'gray'}`}>{o.status}</span>
                </td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
