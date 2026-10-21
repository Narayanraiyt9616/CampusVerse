const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, trim: true },
    category: {
      type: String,
      enum: ['General', 'Academic', 'Exam', 'Event', 'Urgent'],
      default: 'General',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Students', 'Faculty', 'Staff'],
      default: 'All',
    },
    pinned: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

module.exports = mongoose.model('Notice', noticeSchema);
