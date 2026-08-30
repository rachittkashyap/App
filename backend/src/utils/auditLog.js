const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

async function logAudit({ adminId, action, targetType, targetId, details }) {
  try {
    const admin = await User.findById(adminId).select('name');
    await AuditLog.create({
      admin: adminId,
      adminName: admin?.name || 'Unknown',
      action,
      targetType,
      targetId,
      details,
    });
  } catch (err) {
    // Never let audit logging break the actual admin action
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logAudit };
