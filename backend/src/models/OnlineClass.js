const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    postedAt: { type: Date, default: Date.now },
    authorName: { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const onlineClassSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Class title is required'],
      trim: true,
      minlength: [3, 'Class title must be at least 3 characters'],
      maxlength: [200, 'Class title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [120, 'Subject name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
      default: '',
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [3000, 'Instructions cannot exceed 3000 characters'],
      default: '',
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty reference is required'],
      index: true,
    },
    facultyName: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    departmentName: {
      type: String,
      trim: true,
      default: 'Computer Science & Engineering',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: false,
    },
    courseName: {
      type: String,
      trim: true,
      default: 'Computer Science & Engineering',
    },
    semester: {
      type: Number,
      required: [true, 'Target semester is required'],
      min: [1, 'Semester must be between 1 and 12'],
      max: [12, 'Semester must be between 1 and 12'],
      index: true,
    },
    section: {
      type: String,
      trim: true,
      default: 'All', // e.g. "A", "B", "All"
    },
    studentGroup: {
      type: String,
      trim: true,
      default: 'All', // e.g. "Group 1", "Honors", "All"
    },
    meetingUrl: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional if meetingCode is provided or draft
          try {
            const url = new URL(v);
            return url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:');
          } catch {
            return false;
          }
        },
        message: 'Please provide a valid secure meeting URL (must begin with https://)',
      },
    },
    meetingCode: {
      type: String,
      trim: true,
      default: '',
    },
    platform: {
      type: String,
      enum: ['Google Meet', 'Zoom', 'Microsoft Teams', 'Custom Platform', 'Custom Website', 'CampusVerse Live', 'Other'],
      default: 'Custom Website',
    },
    passcode: {
      type: String,
      trim: true,
      default: '',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time format. Use 24-hour format HH:mm (e.g. 10:00)'],
    },
    endTime: {
      type: String,
      default: '',
    },
    startDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    endDateTime: {
      type: Date,
      required: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Live', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
      index: true,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    rescheduledFrom: {
      date: { type: Date },
      startTime: { type: String },
      endTime: { type: String },
    },
    allowPastLinks: {
      type: Boolean,
      default: true,
    },
    announcements: {
      type: [announcementSchema],
      default: [],
    },
    externalMeetingId: {
      type: String,
      trim: true,
      default: '',
    },
    externalProvider: {
      type: String,
      trim: true,
      default: '',
    },
    remindersSent: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Platform auto-detector from URL domain
 */
onlineClassSchema.statics.detectPlatform = function (url) {
  if (!url) return 'Custom Platform';
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('meet.google.com')) return 'Google Meet';
    if (host.includes('zoom.us') || host.includes('zoomgov.com')) return 'Zoom';
    if (host.includes('teams.microsoft.com') || host.includes('teams.live.com')) return 'Microsoft Teams';
    if (host.includes('webex.com')) return 'Other';
    return 'Custom Website';
  } catch {
    return 'Custom Website';
  }
};

/**
 * Dynamic status evaluator comparing current server time against class start & end
 */
onlineClassSchema.methods.getComputedStatus = function () {
  if (this.status === 'Cancelled') return 'Cancelled';

  const now = new Date();
  if (now > this.endDateTime) {
    return 'Completed';
  }
  if (now >= this.startDateTime && now <= this.endDateTime) {
    return 'Live Now';
  }
  if (this.rescheduledFrom?.date) {
    return 'Rescheduled';
  }
  return 'Upcoming';
};

/**
 * Formatter returning sanitized class payload with computed status
 */
onlineClassSchema.methods.formatForClient = function (isAuthorized = true) {
  const obj = this.toObject();
  obj.computedStatus = this.getComputedStatus();
  obj.isLive = obj.computedStatus === 'Live Now';
  obj.isUpcoming = obj.computedStatus === 'Upcoming' || obj.computedStatus === 'Rescheduled';
  obj.isCompleted = obj.computedStatus === 'Completed';
  obj.isCancelled = obj.computedStatus === 'Cancelled';
  obj.publicationStatus = this.published ? 'Published' : 'Draft';

  // If completed and faculty disallowed past meeting links, mask link
  if (obj.isCompleted && !this.allowPastLinks) {
    obj.meetingUrl = '';
    obj.linkMasked = true;
  }

  // If unauthorized caller, don't expose private meeting links, codes, or passcodes
  if (!isAuthorized) {
    delete obj.meetingUrl;
    delete obj.meetingCode;
    delete obj.passcode;
  }

  return obj;
};

// Index to query active cohorts efficiently
onlineClassSchema.index({ semester: 1, departmentName: 1, published: 1, startDateTime: 1 });
onlineClassSchema.index({ faculty: 1, startDateTime: 1 });

module.exports = mongoose.model('OnlineClass', onlineClassSchema);
