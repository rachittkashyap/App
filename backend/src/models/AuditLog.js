const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminName: { type: String, required: true }, // snapshot in case the admin account changes later
    action: { type: String, required: true }, // e.g. 'SUSPEND_STUDENT', 'PUBLISH_COURSE'
    targetType: { type: String, default: '' }, // e.g. 'User', 'Course', 'Certificate'
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String, default: '' }, // short human-readable summary
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
