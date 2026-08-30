const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { slugify } = require('../utils/slugify');
const { logAudit } = require('../utils/auditLog');

async function generateUniqueSlug(title, excludeId) {
  const base = slugify(title);
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Course.findOne(query);
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

// ---------- Course CRUD ----------

async function createCourse(req, res, next) {
  try {
    const { title, description, category, level, isPaid, price, thumbnail } = req.body;

    if (!title) {
      throw new ApiError(400, 'Title is required', 'VALIDATION_ERROR');
    }

    const slug = await generateUniqueSlug(title);

    const course = await Course.create({
      title,
      slug,
      description,
      category,
      level,
      isPaid: !!isPaid,
      price: isPaid ? Number(price) || 0 : 0,
      thumbnail,
      createdBy: req.user.id,
    });

    success(res, { course: course.toPublicJSON() }, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/courses?search=&status=&page=&limit=
async function listCourses(req, res, next) {
  try {
    const { search = '', status = 'all', page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) query.title = new RegExp(search, 'i');
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
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

async function getCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');
    success(res, { course });
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const { title, description, category, level, isPaid, price, thumbnail } = req.body;

    if (title !== undefined && title !== course.title) {
      course.title = title;
      course.slug = await generateUniqueSlug(title, course._id);
    }
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (level !== undefined) course.level = level;
    if (isPaid !== undefined) course.isPaid = !!isPaid;
    if (price !== undefined) course.price = course.isPaid ? Number(price) || 0 : 0;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;

    await course.save();
    success(res, { course: course.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    logAudit({
      adminId: req.user.id,
      action: 'DELETE_COURSE',
      targetType: 'Course',
      targetId: course._id,
      details: `Deleted course "${course.title}"`,
    });

    success(res, { message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

function setPublishState(isPublished) {
  return async function handler(req, res, next) {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

      if (isPublished && course.modules.length === 0) {
        throw new ApiError(400, 'Add at least one module before publishing', 'NO_CONTENT');
      }

      course.isPublished = isPublished;
      await course.save();

      logAudit({
        adminId: req.user.id,
        action: isPublished ? 'PUBLISH_COURSE' : 'UNPUBLISH_COURSE',
        targetType: 'Course',
        targetId: course._id,
        details: `${isPublished ? 'Published' : 'Unpublished'} course "${course.title}"`,
      });

      success(res, { course: course.toPublicJSON() });
    } catch (err) {
      next(err);
    }
  };
}

// ---------- Module management ----------

async function addModule(req, res, next) {
  try {
    const { title, description } = req.body;
    if (!title) throw new ApiError(400, 'Module title is required', 'VALIDATION_ERROR');

    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    course.modules.push({ title, description, order: course.modules.length });
    await course.save();

    success(res, { course }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateModule(req, res, next) {
  try {
    const { title, description, order } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const module = course.modules.id(req.params.moduleId);
    if (!module) throw new ApiError(404, 'Module not found', 'NOT_FOUND');

    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;

    await course.save();
    success(res, { course });
  } catch (err) {
    next(err);
  }
}

async function deleteModule(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const module = course.modules.id(req.params.moduleId);
    if (!module) throw new ApiError(404, 'Module not found', 'NOT_FOUND');

    module.deleteOne();
    await course.save();
    success(res, { course });
  } catch (err) {
    next(err);
  }
}

async function reorderModules(req, res, next) {
  try {
    const { orderedModuleIds } = req.body;
    if (!Array.isArray(orderedModuleIds)) {
      throw new ApiError(400, 'orderedModuleIds must be an array', 'VALIDATION_ERROR');
    }

    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    orderedModuleIds.forEach((moduleId, index) => {
      const module = course.modules.id(moduleId);
      if (module) module.order = index;
    });
    course.modules.sort((a, b) => a.order - b.order);

    await course.save();
    success(res, { course });
  } catch (err) {
    next(err);
  }
}

// ---------- Lesson management ----------

async function addLesson(req, res, next) {
  try {
    const { title, type, content } = req.body;
    if (!title) throw new ApiError(400, 'Lesson title is required', 'VALIDATION_ERROR');

    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const module = course.modules.id(req.params.moduleId);
    if (!module) throw new ApiError(404, 'Module not found', 'NOT_FOUND');

    module.lessons.push({ title, type, content, order: module.lessons.length });
    await course.save();

    success(res, { course }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateLesson(req, res, next) {
  try {
    const { title, type, content, order } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const module = course.modules.id(req.params.moduleId);
    if (!module) throw new ApiError(404, 'Module not found', 'NOT_FOUND');

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) throw new ApiError(404, 'Lesson not found', 'NOT_FOUND');

    if (title !== undefined) lesson.title = title;
    if (type !== undefined) lesson.type = type;
    if (content !== undefined) lesson.content = content;
    if (order !== undefined) lesson.order = order;

    await course.save();
    success(res, { course });
  } catch (err) {
    next(err);
  }
}

async function deleteLesson(req, res, next) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const module = course.modules.id(req.params.moduleId);
    if (!module) throw new ApiError(404, 'Module not found', 'NOT_FOUND');

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) throw new ApiError(404, 'Lesson not found', 'NOT_FOUND');

    lesson.deleteOne();
    await course.save();
    success(res, { course });
  } catch (err) {
    next(err);
  }
}

async function reorderLessons(req, res, next) {
  try {
    const { orderedLessonIds } = req.body;
    if (!Array.isArray(orderedLessonIds)) {
      throw new ApiError(400, 'orderedLessonIds must be an array', 'VALIDATION_ERROR');
    }

    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found', 'NOT_FOUND');

    const module = course.modules.id(req.params.moduleId);
    if (!module) throw new ApiError(404, 'Module not found', 'NOT_FOUND');

    orderedLessonIds.forEach((lessonId, index) => {
      const lesson = module.lessons.id(lessonId);
      if (lesson) lesson.order = index;
    });
    module.lessons.sort((a, b) => a.order - b.order);

    await course.save();
    success(res, { course });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  publishCourse: setPublishState(true),
  unpublishCourse: setPublishState(false),
  addModule,
  updateModule,
  deleteModule,
  reorderModules,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
};
