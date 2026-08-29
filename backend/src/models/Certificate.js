const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['COURSE', 'TRAINING'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // Snapshots taken at issue time so the certificate stays accurate even if
    // the student's name or the course/training title changes later
    studentName: { type: String, required: true },
    itemTitle: { type: String, required: true },

    certificateId: { type: String, required: true, unique: true }, // e.g. CERT-9F3A1B2C7D4E

    status: { type: String, enum: ['ISSUED', 'REVOKED'], default: 'ISSUED' },
    issuedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1, itemType: 1, itemId: 1 }, { unique: true });

certificateSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    itemType: this.itemType,
    itemId: this.itemId,
    itemTitle: this.itemTitle,
    certificateId: this.certificateId,
    status: this.status,
    issuedAt: this.issuedAt,
    revokedAt: this.revokedAt,
  };
};

module.exports = mongoose.model('Certificate', certificateSchema);
