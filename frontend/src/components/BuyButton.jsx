import { useState } from 'react';
import { createOrderRequest, verifyPaymentRequest } from '../services/payments';
import { loadRazorpayScript } from '../utils/razorpay';
import { useAuth } from '../context/AuthContext.jsx';

export default function BuyButton({ itemType, itemId, price, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleBuy() {
    setError('');
    setLoading(true);
    try {
      const { data } = await createOrderRequest(itemType, itemId);
      const { order, razorpayKeyId } = data.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError('Could not load payment gateway. Check your connection and try again.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Training Platform',
        description: order.itemTitle,
        order_id: order.razorpayOrderId,
        prefill: { name: user?.name, email: user?.email },
        handler: async function (response) {
          try {
            await verifyPaymentRequest({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onSuccess();
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: { color: '#4f46e5' },
      });

      rzp.on('payment.failed', function () {
        setError('Payment failed. Please try again.');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start payment.');
      setLoading(false);
    }
  }

  return (
    <div>
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      <button className="btn" onClick={handleBuy} disabled={loading}>
        {loading ? 'Processing...' : `Buy Now - ₹${price}`}
      </button>
    </div>
  );
}
