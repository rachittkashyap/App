const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    type: { type: String, enum: ['SINGLE', 'MULTI', 'TRUE_FALSE'], default: 'SINGLE' },
    options: [optionSchema],
    correctOptionIds: [{ type: mongoose.Schema.Types.ObjectId }], // one or more, matched against options._id
  },
  { _id: true }
);

const testSchema = new mongoose.Schema(
  {
    itemType: { type: String, enum: ['COURSE', 'TRAINING'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    questions: [questionSchema],
    passingScorePercent: { type: Number, default: 60, min: 0, max: 100 },

    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Version shown to students BEFORE they attempt - hides correct answers
testSchema.methods.toStudentJSON = function toStudentJSON() {
  return {
    id: this._id,
    itemType: this.itemType,
    itemId: this.itemId,
    title: this.title,
    description: this.description,
    passingScorePercent: this.passingScorePercent,
    questions: this.questions.map((q) => ({
      id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options.map((o) => ({ id: o._id, text: o.text })),
    })),
  };
};

testSchema.methods.toAdminJSON = function toAdminJSON() {
  return {
    id: this._id,
    itemType: this.itemType,
    itemId: this.itemId,
    title: this.title,
    description: this.description,
    passingScorePercent: this.passingScorePercent,
    isPublished: this.isPublished,
    questionCount: this.questions.length,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Test', testSchema);
