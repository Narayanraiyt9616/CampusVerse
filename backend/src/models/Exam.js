const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examDate: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    duration: { type: Number, required: true, min: 15 }, // in minutes
    venue: { type: String, trim: true },
    maxMarks: { type: Number, required: true, min: 0 },
    examType: {
      type: String,
      enum: ['Mid-Term', 'End-Term', 'Unit Test', 'Practical', 'Viva', 'Other'],
      default: 'Mid-Term',
    },
    instructions: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

module.exports = mongoose.model('Exam', examSchema);
