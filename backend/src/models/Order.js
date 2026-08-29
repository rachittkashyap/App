const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['COURSE', 'TRAINING'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemTitle: { type: String, default: '' }, // snapshot at time of purchase

    amount: { type: Number, required: true }, // in smallest currency unit (paise)
    currency: { type: String, default: 'INR' },

    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },

    status: {
      type: String,
      enum: ['CREATED', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
    },
    refundId: { type: String, default: '' },
    refundedAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    itemType: this.itemType,
    itemId: this.itemId,
    itemTitle: this.itemTitle,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    razorpayOrderId: this.razorpayOrderId,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Order', orderSchema);
