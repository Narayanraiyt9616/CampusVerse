const mongoose = require('mongoose');

const savedMeetingLinkSchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: [true, 'Custom link name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    meetingUrl: {
      type: String,
      required: [true, 'Meeting URL is required'],
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
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
      default: 'CampusVerse Live',
    },
    passcode: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

savedMeetingLinkSchema.index({ faculty: 1, createdAt: -1 });

module.exports = mongoose.model('SavedMeetingLink', savedMeetingLinkSchema);
