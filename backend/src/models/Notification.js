const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Recipient student reference is required'],
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      default: 'A new placement opportunity is available for your course!',
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Placement', 'Academic', 'Fee', 'Exam', 'Project', 'General', 'Urgent'],
      default: 'Placement',
    },
    priority: {
      type: String,
      enum: ['Urgent', 'High', 'Normal', 'Low'],
      default: 'High',
    },
    type: {
      type: String,
      enum: [
        'PLACEMENT_DRIVE',
        'PLACEMENT_UPDATE',
        'PLACEMENT_SELECTED',
        'PLACEMENT_SHORTLISTED',
        'PLACEMENT_INTERVIEW',
        'PROJECT_REVIEW',
        'ASSIGNMENT_EVALUATION',
        'SYSTEM_ALERT',
        'GENERAL',
      ],
      default: 'PLACEMENT_DRIVE',
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      index: true,
    },
    metadata: {
      companyName: { type: String, trim: true },
      jobTitle: { type: String, trim: true },
      jobField: { type: String, trim: true },
      eligibleCourses: { type: [String], default: [] },
      driveDate: { type: Date },
      applicationDeadline: { type: Date },
      displayPackage: { type: String },
      venue: { type: String },
      status: { type: String, default: 'Registration Open' },
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
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
    toObject: {
      virtuals: true,
    },
  }
);

notificationSchema.virtual('isRead').get(function () {
  return this.read;
});

notificationSchema.virtual('companyName').get(function () {
  return this.metadata?.companyName;
});

notificationSchema.virtual('jobRole').get(function () {
  return this.metadata?.jobTitle;
});

notificationSchema.virtual('eligibleCourses').get(function () {
  return this.metadata?.eligibleCourses || [];
});

notificationSchema.virtual('driveDate').get(function () {
  return this.metadata?.driveDate;
});

notificationSchema.virtual('applicationDeadline').get(function () {
  return this.metadata?.applicationDeadline;
});

// Compound index to ensure uniqueness per student & drive to prevent duplicate alerts
notificationSchema.index({ recipient: 1, drive: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
