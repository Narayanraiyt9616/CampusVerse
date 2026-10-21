const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    submissionText: { type: String, trim: true },
    file: {
      filename: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String },
    },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
    marksObtained: { type: Number, min: 0 },
    feedback: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

// Ensure a student can submit only once per assignment (unless resubmission allowed later)
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentSubmission', submissionSchema);
