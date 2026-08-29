const Test = require('../models/Test');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { findItem } = require('../utils/itemLookup');

async function createTest(req, res, next) {
  try {
    const { itemType, itemId, title, description, passingScorePercent } = req.body;

    if (!['COURSE', 'TRAINING'].includes(itemType) || !itemId || !title) {
      throw new ApiError(400, 'itemType, itemId and title are required', 'VALIDATION_ERROR');
    }

    const item = await findItem(itemType, itemId);
    if (!item) throw new ApiError(404, 'Course/Training not found', 'NOT_FOUND');

    const test = await Test.create({
      itemType,
      itemId,
      title,
      description,
      passingScorePercent: passingScorePercent ?? 60,
      createdBy: req.user.id,
    });

    success(res, { test: test.toAdminJSON() }, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/tests?itemType=&itemId=
async function listTests(req, res, next) {
  try {
    const { itemType, itemId } = req.query;
    const query = {};
    if (itemType) query.itemType = itemType;
    if (itemId) query.itemId = itemId;

    const tests = await Test.find(query).sort({ createdAt: -1 });
    success(res, { tests: tests.map((t) => t.toAdminJSON()) });
  } catch (err) {
    next(err);
  }
}

async function getTest(req, res, next) {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');
    success(res, { test });
  } catch (err) {
    next(err);
  }
}

async function updateTest(req, res, next) {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');

    const { title, description, passingScorePercent } = req.body;
    if (title !== undefined) test.title = title;
    if (description !== undefined) test.description = description;
    if (passingScorePercent !== undefined) test.passingScorePercent = passingScorePercent;

    await test.save();
    success(res, { test: test.toAdminJSON() });
  } catch (err) {
    next(err);
  }
}

async function deleteTest(req, res, next) {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');
    success(res, { message: 'Test deleted' });
  } catch (err) {
    next(err);
  }
}

function setPublishState(isPublished) {
  return async function handler(req, res, next) {
    try {
      const test = await Test.findById(req.params.id);
      if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');

      if (isPublished && test.questions.length === 0) {
        throw new ApiError(400, 'Add at least one question before publishing', 'NO_CONTENT');
      }

      test.isPublished = isPublished;
      await test.save();
      success(res, { test: test.toAdminJSON() });
    } catch (err) {
      next(err);
    }
  };
}

// ---------- Question management ----------

async function addQuestion(req, res, next) {
  try {
    const { questionText, type, options, correctOptionIndexes } = req.body;

    if (!questionText || !Array.isArray(options) || options.length < 2) {
      throw new ApiError(400, 'questionText and at least 2 options are required', 'VALIDATION_ERROR');
    }
    if (!Array.isArray(correctOptionIndexes) || correctOptionIndexes.length === 0) {
      throw new ApiError(400, 'At least one correctOptionIndexes value is required', 'VALIDATION_ERROR');
    }

    const test = await Test.findById(req.params.id);
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');

    const optionDocs = options.map((text) => ({ text }));
    const question = { questionText, type: type || 'SINGLE', options: optionDocs, correctOptionIds: [] };

    test.questions.push(question);
    const savedQuestion = test.questions[test.questions.length - 1];

    // Now that options have _ids (post-push), map the given indexes to real option ids
    savedQuestion.correctOptionIds = correctOptionIndexes
      .map((idx) => savedQuestion.options[idx]?._id)
      .filter(Boolean);

    await test.save();
    success(res, { test: test.toAdminJSON(), questionId: savedQuestion._id }, 201);
  } catch (err) {
    next(err);
  }
}

async function deleteQuestion(req, res, next) {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');

    const question = test.questions.id(req.params.questionId);
    if (!question) throw new ApiError(404, 'Question not found', 'NOT_FOUND');

    question.deleteOne();
    await test.save();
    success(res, { test: test.toAdminJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTest,
  listTests,
  getTest,
  updateTest,
  deleteTest,
  publishTest: setPublishState(true),
  unpublishTest: setPublishState(false),
  addQuestion,
  deleteQuestion,
};
