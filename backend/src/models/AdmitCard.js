const mongoose = require('mongoose');

const admitCardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID / Roll number is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    studentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    departmentName: {
      type: String,
      trim: true,
      default: 'Computer Science & Engineering',
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 12,
      index: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
    },
    examTitle: {
      type: String,
      required: [true, 'Examination title is required'],
      trim: true,
    },
    examSession: {
      type: String,
      required: [true, 'Examination session is required'],
      trim: true,
      default: 'Spring 2026',
      index: true,
    },
    examDate: {
      type: String,
      trim: true,
      default: 'May 15 - May 30, 2026',
    },
    status: {
      type: String,
      enum: ['Issued', 'Reissued', 'Pending', 'Revoked'],
      default: 'Issued',
      index: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    reissueCount: {
      type: Number,
      default: 0,
    },
    lastReissuedAt: {
      type: Date,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    issuedByName: {
      type: String,
      default: 'Dean & Academic Registrar',
    },
    file: {
      originalName: { type: String, required: true },
      filename: { type: String, required: true },
      mimeType: { type: String, default: 'application/pdf' },
      size: { type: Number, required: true },
      path: { type: String, required: true },
      dataBase64: { type: String }, // Inlined Base64 for fast preview & backup
    },
    examSchedule: [
      {
        subject: { type: String, trim: true },
        date: { type: String, trim: true },
        time: { type: String, trim: true },
        venue: { type: String, trim: true },
      },
    ],
    remarks: {
      type: String,
      trim: true,
      default: 'Candidate must bring this original admit card along with valid institutional ID.',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
  }
);

admitCardSchema.index({ student: 1, examSession: 1 });
admitCardSchema.index({ studentId: 1, semester: 1 });
admitCardSchema.index({ status: 1, createdAt: -1 });
admitCardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdmitCard', admitCardSchema);
