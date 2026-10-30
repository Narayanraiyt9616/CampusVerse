const mongoose = require('mongoose');

const mcqAnswerRecordSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId },
    questionIndex: { type: Number, required: true },
    selectedOption: { type: Number, required: true }, // 0-based option index
    isCorrect: { type: Boolean, required: true },
    marksObtained: { type: Number, default: 0 },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    submissionType: {
      type: String,
      enum: ['mcq', 'pdf', 'text', 'file', 'both', 'MCQ', 'PDF'],
      default: 'mcq',
    },
    // MCQ submission results
    mcqAnswers: {
      type: [mcqAnswerRecordSchema],
      default: [],
    },
    totalQuestions: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    incorrectCount: { type: Number, default: 0 },
    unansweredCount: { type: Number, default: 0 },
    // PDF / solution file
    file: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String },
    },
    submissionText: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'graded', 'late', 'Pending', 'Submitted', 'Evaluated', 'Late Submitted', 'Overdue'],
      default: 'Submitted',
    },
    marksObtained: { type: Number, min: 0 },
    maxMarks: { type: Number, min: 0 },
    feedback: { type: String, trim: true, default: '' },
    evaluatedAt: { type: Date },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

// Ensure a student can submit only once per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

// Performance indexes for student submission history and faculty evaluation grading
submissionSchema.index({ student: 1, createdAt: -1 });
submissionSchema.index({ assignment: 1, status: 1 });

module.exports = mongoose.model('AssignmentSubmission', submissionSchema);

