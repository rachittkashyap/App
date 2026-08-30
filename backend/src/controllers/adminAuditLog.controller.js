const AuditLog = require('../models/AuditLog');
const { success } = require('../utils/response');

// GET /api/admin/audit-logs?action=&page=&limit=
async function listAuditLogs(req, res, next) {
  try {
    const { action, page = 1, limit = 20 } = req.query;

    const query = {};
    if (action) query.action = action;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    success(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAuditLogs };
