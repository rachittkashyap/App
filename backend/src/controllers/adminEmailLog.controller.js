const EmailJob = require('../models/EmailJob');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { getEmailQueue } = require('../queues/email.queue');

// GET /api/admin/email-logs?status=&page=&limit=
async function listEmailLogs(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      EmailJob.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      EmailJob.countDocuments(query),
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

// POST /api/admin/email-logs/:id/retry
async function retryEmailLog(req, res, next) {
  try {
    const emailJob = await EmailJob.findById(req.params.id);
    if (!emailJob) throw new ApiError(404, 'Email log not found', 'NOT_FOUND');

    if (emailJob.status !== 'FAILED') {
      throw new ApiError(400, 'Only failed emails can be retried', 'INVALID_STATE');
    }

    const queue = getEmailQueue();
    if (!queue) {
      throw new ApiError(503, 'Email queue is not configured (REDIS_URL missing)', 'QUEUE_NOT_CONFIGURED');
    }

    emailJob.status = 'PENDING';
    emailJob.lastError = '';
    await emailJob.save();

    await queue.add('send-email', { emailJobId: emailJob._id.toString() });

    success(res, { message: 'Email queued for retry', emailJob });
  } catch (err) {
    next(err);
  }
}

module.exports = { listEmailLogs, retryEmailLog };
