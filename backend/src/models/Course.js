const mongoose = require('mongoose');
const moduleSchema = require('./Module');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },

    category: { type: String, default: 'General' },
    level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0, min: 0 },

    modules: [moduleSchema],

    // Completion rule engine (kept simple for now, extended in Phase 6)
    completionRules: {
      minLessonCompletionPercent: { type: Number, default: 100 },
    },

    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

courseSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id,
    title: this.title,
    slug: this.slug,
    description: this.description,
    thumbnail: this.thumbnail,
    category: this.category,
    level: this.level,
    isPaid: this.isPaid,
    price: this.price,
    isPublished: this.isPublished,
    moduleCount: this.modules.length,
    lessonCount: this.modules.reduce((sum, m) => sum + m.lessons.length, 0),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Course', courseSchema);
