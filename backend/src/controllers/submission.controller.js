const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { findItem, getFlatSubItems } = require('../utils/itemLookup');
const { sendSubmissionReviewedEmail } = require('../services/email.service');

// POST /api/submissions  { itemType, itemId, groupId, subItemId, textContent, fileUrl }
async function submitAssignment(req, res, next) {
  try {
    const { itemType, itemId, groupId, subItemId, textContent, fileUrl } = req.body;

    if (!['COURSE', 'TRAINING'].includes(itemType) || !itemId || !groupId || !subItemId) {
      throw new ApiError(400, 'itemType, itemId, groupId and subItemId are required', 'VALIDATION_ERROR');
    }
    if (!textContent && !fileUrl) {
      throw new ApiError(400, 'Provide either textContent or fileUrl', 'VALIDATION_ERROR');
    }

    const enrollment = await Enrollment.findOne({ student: req.user.id, itemType, itemId });
    if (!enrollment) {
      throw new ApiError(403, 'You must be enrolled to submit an assignment', 'NOT_ENROLLED');
    }

    const item = await findItem(itemType, itemId);
    if (!item) throw new ApiError(404, 'Course/Training not found', 'NOT_FOUND');

    const flat = getFlatSubItems(itemType, item);
    const validSubItem = flat.find((f) => f.subItemId.toString() === subItemId);
    if (!validSubItem || validSubItem.type !== 'ASSIGNMENT') {
      throw new ApiError(400, 'This is not a valid assignment item', 'VALIDATION_ERROR');
    }

    const submission = await Submission.findOneAndUpdate(
      { student: req.user.id, itemType, itemId, subItemId },
      {
        $set: {
          groupId,
          textContent: textContent || '',
          fileUrl: fileUrl || '',
          status: 'SUBMITTED',
          score: null,
          feedback: '',
          reviewedAt: null,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    success(res, { submission }, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/submissions/my
async function mySubmissions(req, res, next) {
  try {
    const submissions = await Submission.find({ student: req.user.id }).sort({ createdAt: -1 });
    success(res, { submissions });
  } catch (err) {
    next(err);
  }
}

// ---------- Admin ----------

// GET /api/admin/submissions?status=&page=&limit=
async function listSubmissions(req, res, next) {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate('student', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Submission.countDocuments(query),
    ]);

    success(res, {
      submissions,
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

// PATCH /api/admin/submissions/:id/review  { status, score, feedback }
async function reviewSubmission(req, res, next) {
  try {
    const { status, score, feedback } = req.body;
    if (!['PASSED', 'FAILED', 'UNDER_REVIEW'].includes(status)) {
      throw new ApiError(400, 'status must be PASSED, FAILED or UNDER_REVIEW', 'VALIDATION_ERROR');
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) throw new ApiError(404, 'Submission not found', 'NOT_FOUND');

    submission.status = status;
    if (score !== undefined) submission.score = score;
    if (feedback !== undefined) submission.feedback = feedback;
    submission.reviewedAt = new Date();

    await submission.save();

    const student = await User.findById(submission.student);
    if (student && (status === 'PASSED' || status === 'FAILED')) {
      sendSubmissionReviewedEmail(student, submission).catch((err) =>
        console.error('Failed to queue submission-reviewed email:', err.message)
      );
    }

    success(res, { submission });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitAssignment, mySubmissions, listSubmissions, reviewSubmission };
