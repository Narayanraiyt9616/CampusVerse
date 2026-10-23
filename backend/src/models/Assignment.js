const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: [val => Array.isArray(val) && val.length >= 2, 'At least 2 options required'],
    },
    correctAnswer: { type: Number, required: true, min: 0 }, // 0-based option index
    marks: { type: Number, default: 1, min: 0.1 },
    explanation: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    instructions: { type: String, trim: true, maxlength: 2000, default: '' },
    subject: { type: String, trim: true, default: 'General' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 0 },
    assignmentType: {
      type: String,
      enum: ['mcq', 'pdf', 'text', 'both', 'MCQ', 'PDF'],
      default: 'mcq',
      required: true,
    },
    // MCQ Assignment questions
    questions: {
      type: [questionSchema],
      default: [],
    },
    // PDF Assignment question paper file
    questionPaper: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String },
    },
    requiresPdfSubmission: { type: Boolean, default: true },
    // Target cohort
    targetClass: { type: String, trim: true, default: 'All' },
    targetSemester: { type: Number, default: 7 },
    targetSection: { type: String, trim: true, default: 'A' },
    published: { type: Boolean, default: true },
    // Legacy support
    submissionType: { type: String, default: 'both' },
    attachment: {
      filename: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String },
    },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

module.exports = mongoose.model('Assignment', assignmentSchema);

