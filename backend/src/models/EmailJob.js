const mongoose = require('mongoose');

const emailJobSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true }, // plain text body
    type: {
      type: String,
      enum: [
        'WELCOME',
        'VERIFY_EMAIL',
        'PASSWORD_RESET',
        'ENROLLMENT',
        'PAYMENT',
        'SUBMISSION_REVIEWED',
        'TEST_RESULT',
        'COMPLETION',
        'CERTIFICATE_READY',
        'CERTIFICATE_REVOKED',
        'OTHER',
      ],
      default: 'OTHER',
    },

    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED'],
      default: 'PENDING',
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: '' },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailJob', emailJobSchema);
