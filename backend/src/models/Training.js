const mongoose = require('mongoose');
const trainingDaySchema = require('./TrainingDay');

const trainingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },

    category: { type: String, default: 'General' },
    level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },

    // Configurable duration in days - 7 / 14 / 30 are the common presets from the spec,
    // but stored as a plain number so any custom duration also works.
    durationDays: { type: Number, required: true, default: 7, min: 1 },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },

    days: [trainingDaySchema],

    completionRules: {
      minDayCompletionPercent: { type: Number, default: 100 },
    },

    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

trainingSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    description: this.description,
    thumbnail: this.thumbnail,
    category: this.category,
    level: this.level,
    durationDays: this.durationDays,
    isPaid: this.isPaid,
    price: this.price,
    isPublished: this.isPublished,
    dayCount: this.days.length,
    taskCount: this.days.reduce((sum, d) => sum + d.tasks.length, 0),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Training', trainingSchema);
