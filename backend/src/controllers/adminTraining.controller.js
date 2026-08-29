const Training = require('../models/Training');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { slugify } = require('../utils/slugify');

async function generateUniqueSlug(title, excludeId) {
  const base = slugify(title);
  let slug = base;
  let counter = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Training.findOne(query);
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

// ---------- Training CRUD ----------

async function createTraining(req, res, next) {
  try {
    const { title, description, category, level, durationDays, isPaid, price, thumbnail } = req.body;

    if (!title) {
      throw new ApiError(400, 'Title is required', 'VALIDATION_ERROR');
    }

    const slug = await generateUniqueSlug(title);

    const training = await Training.create({
      title,
      slug,
      description,
      category,
      level,
      durationDays: Number(durationDays) || 7,
      isPaid: !!isPaid,
      price: isPaid ? Number(price) || 0 : 0,
      thumbnail,
      createdBy: req.user.id,
    });

    success(res, { training: training.toPublicJSON() }, 201);
  } catch (err) {
    next(err);
  }
}

async function listTrainings(req, res, next) {
  try {
    const { search = '', status = 'all', page = 1, limit = 10 } = req.query;

    const query = {};
    if (search) query.title = new RegExp(search, 'i');
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
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

async function getTraining(req, res, next) {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');
    success(res, { training });
  } catch (err) {
    next(err);
  }
}

async function updateTraining(req, res, next) {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

    const { title, description, category, level, durationDays, isPaid, price, thumbnail } = req.body;

    if (title !== undefined && title !== training.title) {
      training.title = title;
      training.slug = await generateUniqueSlug(title, training._id);
    }
    if (description !== undefined) training.description = description;
    if (category !== undefined) training.category = category;
    if (level !== undefined) training.level = level;
    if (durationDays !== undefined) training.durationDays = Number(durationDays) || training.durationDays;
    if (isPaid !== undefined) training.isPaid = !!isPaid;
    if (price !== undefined) training.price = training.isPaid ? Number(price) || 0 : 0;
    if (thumbnail !== undefined) training.thumbnail = thumbnail;

    await training.save();
    success(res, { training: training.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

async function deleteTraining(req, res, next) {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');
    success(res, { message: 'Training deleted' });
  } catch (err) {
    next(err);
  }
}

function setPublishState(isPublished) {
  return async function handler(req, res, next) {
    try {
      const training = await Training.findById(req.params.id);
      if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

      if (isPublished && training.days.length === 0) {
        throw new ApiError(400, 'Add at least one day before publishing', 'NO_CONTENT');
      }

      training.isPublished = isPublished;
      await training.save();
      success(res, { training: training.toPublicJSON() });
    } catch (err) {
      next(err);
    }
  };
}

// ---------- Day management ----------

async function addDay(req, res, next) {
  try {
    const { title, description, dayNumber } = req.body;
    if (!title) throw new ApiError(400, 'Day title is required', 'VALIDATION_ERROR');

    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

    const nextDayNumber = dayNumber || training.days.length + 1;
    training.days.push({ dayNumber: nextDayNumber, title, description });
    await training.save();

    success(res, { training }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateDay(req, res, next) {
  try {
    const { title, description, dayNumber } = req.body;
    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

    const day = training.days.id(req.params.dayId);
    if (!day) throw new ApiError(404, 'Day not found', 'NOT_FOUND');

    if (title !== undefined) day.title = title;
    if (description !== undefined) day.description = description;
    if (dayNumber !== undefined) day.dayNumber = dayNumber;

    await training.save();
    success(res, { training });
  } catch (err) {
    next(err);
  }
}

async function deleteDay(req, res, next) {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

    const day = training.days.id(req.params.dayId);
    if (!day) throw new ApiError(404, 'Day not found', 'NOT_FOUND');

    day.deleteOne();
    await training.save();
    success(res, { training });
  } catch (err) {
    next(err);
  }
}

// ---------- Task management ----------

async function addTask(req, res, next) {
  try {
    const { title, type, content } = req.body;
    if (!title) throw new ApiError(400, 'Task title is required', 'VALIDATION_ERROR');

    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

    const day = training.days.id(req.params.dayId);
    if (!day) throw new ApiError(404, 'Day not found', 'NOT_FOUND');

    day.tasks.push({ title, type, content, order: day.tasks.length });
    await training.save();

    success(res, { training }, 201);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const { title, type, content, order } = req.body;
    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

    const day = training.days.id(req.params.dayId);
    if (!day) throw new ApiError(404, 'Day not found', 'NOT_FOUND');

    const task = day.tasks.id(req.params.taskId);
    if (!task) throw new ApiError(404, 'Task not found', 'NOT_FOUND');

    if (title !== undefined) task.title = title;
    if (type !== undefined) task.type = type;
    if (content !== undefined) task.content = content;
    if (order !== undefined) task.order = order;

    await training.save();
    success(res, { training });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) throw new ApiError(404, 'Training not found', 'NOT_FOUND');

    const day = training.days.id(req.params.dayId);
    if (!day) throw new ApiError(404, 'Day not found', 'NOT_FOUND');

    const task = day.tasks.id(req.params.taskId);
    if (!task) throw new ApiError(404, 'Task not found', 'NOT_FOUND');

    task.deleteOne();
    await training.save();
    success(res, { training });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTraining,
  listTrainings,
  getTraining,
  updateTraining,
  deleteTraining,
  publishTraining: setPublishState(true),
  unpublishTraining: setPublishState(false),
  addDay,
  updateDay,
  deleteDay,
  addTask,
  updateTask,
  deleteTask,
};
