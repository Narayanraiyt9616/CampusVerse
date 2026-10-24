const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: false,
      index: true,
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    studentId: {
      type: String,
      required: false,
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
        'PLACEMENT_APPLICATION',
        'PLACEMENT_ACCEPTED',
        'PLACEMENT_REJECTED',
        'PLACEMENT_CANCELLED',
        'PLACEMENT_SELECTED',
        'PLACEMENT_SHORTLISTED',
        'PLACEMENT_INTERVIEW',
        'PROJECT_REVIEW',
        'ASSIGNMENT_PUBLISHED',
        'ASSIGNMENT_SUBMISSION',
        'ASSIGNMENT_EVALUATION',
        'ONLINE_CLASS_SCHEDULED',
        'ONLINE_CLASS_RESCHEDULED',
        'ONLINE_CLASS_CANCELLED',
        'ONLINE_CLASS_REMINDER',
        'ONLINE_CLASS_LINK_UPDATED',
        'ONLINE_CLASS_ANNOUNCEMENT',
        'SYSTEM_ALERT',
        'GENERAL',
        'INFO',
      ],
      default: 'PLACEMENT_DRIVE',
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 48 * 60 * 60 * 1000);
      },
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

notificationSchema.virtual('isExpired').get(function () {
  if (this.expiresAt) return new Date() > this.expiresAt;
  if (this.createdAt) return Date.now() - new Date(this.createdAt).getTime() > 48 * 60 * 60 * 1000;
  return false;
});

notificationSchema.virtual('expiresInHours').get(function () {
  const expireTime = this.expiresAt
    ? this.expiresAt.getTime()
    : this.createdAt
    ? this.createdAt.getTime() + 48 * 60 * 60 * 1000
    : Date.now() + 48 * 60 * 60 * 1000;
  return Math.max(0, Math.round((expireTime - Date.now()) / (1000 * 60 * 60)));
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

// Pre-save hook: ensure expiresAt is strictly set to 48 hours after creation time
notificationSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const baseTime = this.createdAt ? new Date(this.createdAt).getTime() : Date.now();
    this.expiresAt = new Date(baseTime + 48 * 60 * 60 * 1000);
  }
  next();
});

// Pre-validate hook for documents
notificationSchema.pre('validate', function (next) {
  if (!this.expiresAt) {
    const baseTime = this.createdAt ? new Date(this.createdAt).getTime() : Date.now();
    this.expiresAt = new Date(baseTime + 48 * 60 * 60 * 1000);
  }
  next();
});

// Compound index to ensure uniqueness per student & drive to prevent duplicate alerts
notificationSchema.index({ recipient: 1, drive: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipientUser: 1, createdAt: -1 });

// MongoDB TTL Indexes for reliable server-side 48-hour auto-deletion
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 48 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);

