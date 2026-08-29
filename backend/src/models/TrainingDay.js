const mongoose = require('mongoose');
const trainingTaskSchema = require('./TrainingTask');

const trainingDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    tasks: [trainingTaskSchema],
  },
  { _id: true }
);

module.exports = trainingDaySchema;
