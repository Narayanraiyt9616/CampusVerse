const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // role == 'faculty'
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    section: {
      type: String,
      required: true,
      trim: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    },
    startTime: {
      type: String, // "HH:mm" 24‑hour
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time'],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time'],
    },
    classroom: {
      type: String,
      required: true,
      trim: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

// Indexes for conflict detection
 timetableSchema.index({ faculty: 1, dayOfWeek: 1, startTime: 1, endTime: 1 });
 timetableSchema.index({ classroom: 1, dayOfWeek: 1, startTime: 1, endTime: 1 });
 timetableSchema.index({ department: 1, semester: 1, section: 1, dayOfWeek: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
