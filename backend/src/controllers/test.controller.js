const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');

// GET /api/tests?itemType=&itemId=
async function listAvailableTests(req, res, next) {
  try {
    const { itemType, itemId } = req.query;
    if (!['COURSE', 'TRAINING'].includes(itemType) || !itemId) {
      throw new ApiError(400, 'itemType and itemId are required', 'VALIDATION_ERROR');
    }

    const enrollment = await Enrollment.findOne({ student: req.user.id, itemType, itemId });
    if (!enrollment) {
      throw new ApiError(403, 'You must be enrolled to view tests for this item', 'NOT_ENROLLED');
    }

    const tests = await Test.find({ itemType, itemId, isPublished: true });
    success(res, { tests: tests.map((t) => t.toStudentJSON()) });
  } catch (err) {
    next(err);
  }
}

// GET /api/tests/:id
async function getTestForAttempt(req, res, next) {
  try {
    const test = await Test.findOne({ _id: req.params.id, isPublished: true });
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      itemType: test.itemType,
      itemId: test.itemId,
    });
    if (!enrollment) {
      throw new ApiError(403, 'You must be enrolled to take this test', 'NOT_ENROLLED');
    }

    success(res, { test: test.toStudentJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/tests/:id/attempt  { answers: [{ questionId, selectedOptionIds }] }
async function attemptTest(req, res, next) {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      throw new ApiError(400, 'answers must be an array', 'VALIDATION_ERROR');
    }

    const test = await Test.findOne({ _id: req.params.id, isPublished: true });
    if (!test) throw new ApiError(404, 'Test not found', 'NOT_FOUND');

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      itemType: test.itemType,
      itemId: test.itemId,
    });
    if (!enrollment) {
      throw new ApiError(403, 'You must be enrolled to take this test', 'NOT_ENROLLED');
    }

    // Server-side scoring - never trust client-submitted correctness
    let correctCount = 0;
    test.questions.forEach((question) => {
      const answer = answers.find((a) => a.questionId === question._id.toString());
      const selected = (answer?.selectedOptionIds || []).slice().sort();
      const correct = question.correctOptionIds.map((id) => id.toString()).sort();

      const isCorrect =
        selected.length === correct.length && selected.every((id, idx) => id === correct[idx]);
      if (isCorrect) correctCount += 1;
    });

    const scorePercent =
      test.questions.length === 0 ? 0 : Math.round((correctCount / test.questions.length) * 100);
    const passed = scorePercent >= test.passingScorePercent;

    const attempt = await TestAttempt.create({
      student: req.user.id,
      test: test._id,
      answers,
      scorePercent,
      passed,
    });

    success(
      res,
      {
        attempt: {
          id: attempt._id,
          scorePercent,
          passed,
          correctCount,
          totalQuestions: test.questions.length,
          passingScorePercent: test.passingScorePercent,
        },
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

// GET /api/tests/my-attempts
async function myAttempts(req, res, next) {
  try {
    const attempts = await TestAttempt.find({ student: req.user.id })
      .populate('test', 'title itemType itemId passingScorePercent')
      .sort({ createdAt: -1 });

    success(res, { attempts });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAvailableTests, getTestForAttempt, attemptTest, myAttempts };
