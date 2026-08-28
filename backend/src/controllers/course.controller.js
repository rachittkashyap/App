const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');

// GET /api/courses?search=&category=&level=&isPaid=&page=&limit=
async function listPublishedCourses(req, res, next) {
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

    const [courses, total] = await Promise.all([
      Course.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Course.countDocuments(query),
    ]);

    success(res, {
      courses: courses.map((c) => c.toPublicJSON()),
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

// GET /api/courses/:slug
async function getCourseBySlug(req, res, next) {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) {
      throw new ApiError(404, 'Course not found', 'NOT_FOUND');
    }

    // Full content (modules/lessons) is shown here for now. Access-control
    // that restricts lesson content to enrolled students only is wired up
    // in Phase 6 (Enrollment).
    success(res, { course: { ...course.toPublicJSON(), modules: course.modules } });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublishedCourses, getCourseBySlug };
