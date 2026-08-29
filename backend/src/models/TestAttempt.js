const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptionIds: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    answers: [answerSchema],
    scorePercent: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

testAttemptSchema.index({ student: 1, test: 1 });

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
