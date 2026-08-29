const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { findItem, getFlatSubItems, computeProgressPercent } = require('../utils/itemLookup');

// POST /api/enrollments  { itemType, itemId }
async function enroll(req, res, next) {
  try {
    const { itemType, itemId } = req.body;
    if (!['COURSE', 'TRAINING'].includes(itemType) || !itemId) {
      throw new ApiError(400, 'itemType (COURSE/TRAINING) and itemId are required', 'VALIDATION_ERROR');
    }

    const item = await findItem(itemType, itemId);
    if (!item || !item.isPublished) {
      throw new ApiError(404, 'This item is not available for enrollment', 'NOT_FOUND');
    }

    if (item.isPaid) {
      throw new ApiError(
        402,
        'This is a paid item. Payment integration is coming in Phase 7 - free items can be enrolled in now.',
        'PAYMENT_REQUIRED'
      );
    }

    const existing = await Enrollment.findOne({ student: req.user.id, itemType, itemId });
    if (existing) {
      throw new ApiError(409, 'You are already enrolled in this item', 'ALREADY_ENROLLED');
    }

    const enrollment = await Enrollment.create({ student: req.user.id, itemType, itemId });
    success(res, { enrollment: enrollment.toSafeJSON() }, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/enrollments/my
async function myEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id }).sort({ createdAt: -1 });

    const enriched = await Promise.all(
      enrollments.map(async (enrollment) => {
        const item = await findItem(enrollment.itemType, enrollment.itemId);
        const flat = item ? getFlatSubItems(enrollment.itemType, item) : [];
        const progressPercent = computeProgressPercent(flat.length, enrollment.completedItemIds.length);

        return {
          ...enrollment.toSafeJSON(),
          progressPercent,
          item: item
            ? {
                title: item.title,
                slug: item.slug,
                thumbnail: item.thumbnail,
              }
            : null,
        };
      })
    );

    success(res, { enrollments: enriched });
  } catch (err) {
    next(err);
  }
}

// GET /api/enrollments/status?itemType=&itemId=
async function getStatus(req, res, next) {
  try {
    const { itemType, itemId } = req.query;
    if (!['COURSE', 'TRAINING'].includes(itemType) || !itemId) {
      throw new ApiError(400, 'itemType and itemId query params are required', 'VALIDATION_ERROR');
    }

    const enrollment = await Enrollment.findOne({ student: req.user.id, itemType, itemId });
    if (!enrollment) {
      return success(res, { enrolled: false });
    }

    const item = await findItem(itemType, itemId);
    const flat = item ? getFlatSubItems(itemType, item) : [];
    const progressPercent = computeProgressPercent(flat.length, enrollment.completedItemIds.length);

    success(res, {
      enrolled: true,
      enrollment: { ...enrollment.toSafeJSON(), progressPercent },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/enrollments/:id/complete-item  { subItemId }
async function markItemComplete(req, res, next) {
  try {
    const { subItemId } = req.body;
    if (!subItemId) {
      throw new ApiError(400, 'subItemId is required', 'VALIDATION_ERROR');
    }

    const enrollment = await Enrollment.findOne({ _id: req.params.id, student: req.user.id });
    if (!enrollment) {
      throw new ApiError(404, 'Enrollment not found', 'NOT_FOUND');
    }

    const item = await findItem(enrollment.itemType, enrollment.itemId);
    if (!item) throw new ApiError(404, 'Course/Training not found', 'NOT_FOUND');

    const flat = getFlatSubItems(enrollment.itemType, item);
    const validSubItem = flat.find((f) => f.subItemId.toString() === subItemId);
    if (!validSubItem) {
      throw new ApiError(400, 'This lesson/task does not belong to the enrolled item', 'VALIDATION_ERROR');
    }

    const alreadyDone = enrollment.completedItemIds.some((id) => id.toString() === subItemId);
    if (!alreadyDone) {
      enrollment.completedItemIds.push(subItemId);
    }

    const progressPercent = computeProgressPercent(flat.length, enrollment.completedItemIds.length);
    const requiredPercent =
      enrollment.itemType === 'COURSE'
        ? item.completionRules?.minLessonCompletionPercent ?? 100
        : item.completionRules?.minDayCompletionPercent ?? 100;

    if (progressPercent >= requiredPercent && !enrollment.isCompleted) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    success(res, { enrollment: enrollment.toSafeJSON(), progressPercent });
  } catch (err) {
    next(err);
  }
}

module.exports = { enroll, myEnrollments, getStatus, markItemComplete };
