const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['COURSE', 'TRAINING'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // moduleId (course) or dayId (training) + lessonId/taskId identify exactly which
    // assignment this submission answers
    groupId: { type: mongoose.Schema.Types.ObjectId, required: true }, // moduleId or dayId
    subItemId: { type: mongoose.Schema.Types.ObjectId, required: true }, // lessonId or taskId

    textContent: { type: String, default: '' },
    fileUrl: { type: String, default: '' },

    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'PASSED', 'FAILED'],
      default: 'SUBMITTED',
    },
    score: { type: Number, default: null },
    feedback: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

submissionSchema.index({ student: 1, itemType: 1, itemId: 1, subItemId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
