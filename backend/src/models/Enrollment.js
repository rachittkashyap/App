const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['COURSE', 'TRAINING'], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // IDs of lessons (courses) or tasks (trainings) the student has marked complete
    completedItemIds: [{ type: mongoose.Schema.Types.ObjectId }],

    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, itemType: 1, itemId: 1 }, { unique: true });

enrollmentSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    itemType: this.itemType,
    itemId: this.itemId,
    completedItemIds: this.completedItemIds,
    isCompleted: this.isCompleted,
    completedAt: this.completedAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
