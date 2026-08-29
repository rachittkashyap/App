const Razorpay = require('razorpay');

let instance = null;

function getRazorpayClient() {
  if (instance) return instance;

  const keyId = process.env.PAYMENT_KEY_ID;
  const keySecret = process.env.PAYMENT_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null; // caller must handle this - keys not configured yet
  }

  instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return instance;
}

module.exports = { getRazorpayClient };
