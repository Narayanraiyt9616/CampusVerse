const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['Full-Time', 'Internship + PPO', 'Internship (6 Months)', 'Contractual'],
      default: 'Full-Time',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    salaryPackage: {
      minLPA: { type: Number, default: 0 },
      maxLPA: { type: Number, default: 0 },
      displayPackage: { type: String, required: true }, // e.g. "₹ 24 - 32 LPA" or "₹ 85,000 / mo"
    },
    requiredSkills: {
      type: [String],
      default: ['Data Structures & Algorithms', 'Problem Solving'],
    },
    eligibilityCriteria: {
      minCgpa: { type: Number, default: 7.0, min: 0, max: 10 },
      maxBacklogs: { type: Number, default: 0 },
      eligibleDepartments: {
        type: [String],
        default: ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering'],
      },
      eligibleBatch: { type: Number, default: 2026 },
    },
    driveDate: {
      type: Date,
      required: [true, 'Drive date is required'],
    },
    applicationDeadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    venue: {
      type: String,
      trim: true,
      default: 'Auditorium 2 & Online HackerEarth Test Platform',
    },
    evaluationRounds: {
      type: [String],
      default: ['Online Coding Assessment', 'Technical Interview 1', 'System Architecture', 'HR & Cultural Fit'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Registration Open', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Registration Open',
    },
    totalApplicationsCount: {
      type: Number,
      default: 0,
    },
    totalShortlistedCount: {
      type: Number,
      default: 0,
    },
    totalOffersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
