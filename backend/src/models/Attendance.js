const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
});

const attendanceSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    date: { type: String, required: true }, // ISO date string YYYY-MM-DD
    records: [attendanceRecordSchema],
    totalPresent: { type: Number, default: 0 },
    totalAbsent: { type: Number, default: 0 },
    totalLate: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

// Prevent duplicate attendance for the same class, subject, and date
attendanceSchema.index({ faculty: 1, className: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
