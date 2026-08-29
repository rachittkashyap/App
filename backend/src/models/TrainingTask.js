const mongoose = require('mongoose');

const trainingTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['VIDEO', 'PDF', 'LINK', 'TEXT', 'ASSIGNMENT'], default: 'TEXT' },
    content: { type: String, default: '' }, // URL for video/pdf/link, or raw text/instructions
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

module.exports = trainingTaskSchema;
