const Training = require('../models/Training');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');

// GET /api/trainings?search=&category=&level=&isPaid=&page=&limit=
async function listPublishedTrainings(req, res, next) {
  try {
    const { search = '', category, level, isPaid, page = 1, limit = 12 } = req.query;

    const query = { isPublished: true };
    if (search) query.title = new RegExp(search, 'i');
    if (category) query.category = category;
    if (level) query.level = level;
    if (isPaid === 'true') query.isPaid = true;
    if (isPaid === 'false') query.isPaid = false;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [trainings, total] = await Promise.all([
      Training.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Training.countDocuments(query),
    ]);

    success(res, {
      trainings: trainings.map((t) => t.toPublicJSON()),
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

// GET /api/trainings/:slug
async function getTrainingBySlug(req, res, next) {
  try {
    const training = await Training.findOne({ slug: req.params.slug, isPublished: true });
    if (!training) {
      throw new ApiError(404, 'Training not found', 'NOT_FOUND');
    }

    // Full day/task content shown here for now, same as courses - enrollment-gated
    // access comes in Phase 6.
    success(res, { training: { ...training.toPublicJSON(), days: training.days } });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublishedTrainings, getTrainingBySlug };
