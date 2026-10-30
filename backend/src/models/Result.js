const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // faculty who entered marks
    assessmentName: { type: String, required: true, trim: true },
    assessmentType: { type: String, enum: ['Exam', 'Quiz', 'Assignment', 'Project', 'Other'], default: 'Exam' },
    maxMarks: { type: Number, required: true, min: 0 },
    marksObtained: { type: Number, min: 0 },
    semester: { type: Number, required: true, min: 1, max: 12 },
    session: { type: String, required: true, trim: true },
    published: { type: Boolean, default: false },
    feedback: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

// Unique per student + course + assessment name to avoid duplicate records
resultSchema.index({ student: 1, course: 1, assessmentName: 1 }, { unique: true });

// Performance indexes for student marksheets, faculty course results, and admin publishing
resultSchema.index({ student: 1, semester: 1, published: 1 });
resultSchema.index({ faculty: 1 });
resultSchema.index({ course: 1 });
resultSchema.index({ published: 1 });

module.exports = mongoose.model('Result', resultSchema);
