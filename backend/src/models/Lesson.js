const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['VIDEO', 'PDF', 'LINK', 'TEXT'], default: 'TEXT' },
    content: { type: String, default: '' }, // URL for video/pdf/link, or raw text for TEXT type
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

module.exports = lessonSchema;
