const mongoose = require('mongoose');
const lessonSchema = require('./Lesson');

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    lessons: [lessonSchema],
  },
  { _id: true }
);

module.exports = moduleSchema;
