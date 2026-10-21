const mongoose = require('mongoose');

const placementNoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: 300,
    },
    companyName: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ['Drive Alert', 'Shortlist Announced', 'Interview Schedule', 'Policy & Guidelines', 'Urgent'],
      default: 'Drive Alert',
    },
    targetBatch: {
      type: Number,
      default: 2026,
    },
    targetDepartments: {
      type: [String],
      default: ['All Departments'],
    },
    authorName: {
      type: String,
      default: 'Prof. Vikramaditya (Head, T&P Cell)',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model('PlacementNotice', placementNoticeSchema);
