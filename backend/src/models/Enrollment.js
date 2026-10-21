// models/Enrollment.js
const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: [true, 'Student reference required'] },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: [true, 'Course reference required'] },
  semester: { type: Number, min: [1, 'Semester must be at least 1'], max: [12, 'Semester must be at most 12'], required: [true, 'Semester required'] },
  status: { type: String, enum: ['Enrolled','Completed','Withdrawn'], default: 'Enrolled' },
  enrolledAt: { type: Date, default: Date.now },
}, { timestamps: true });

EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
