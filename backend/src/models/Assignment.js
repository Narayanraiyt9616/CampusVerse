const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    instructions: { type: String, trim: true, maxlength: 2000 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // role faculty
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true, min: 0 },
    submissionType: { type: String, enum: ['text', 'file', 'both'], default: 'both' },
    attachment: {
      // simple metadata if files are used later
      filename: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String },
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
