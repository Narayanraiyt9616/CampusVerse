const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [3, 'Project title must be at least 3 characters'],
      maxlength: [150, 'Project title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
      maxlength: [3000, 'Project description cannot exceed 3000 characters'],
    },
    liveUrl: {
      type: String,
      required: [true, 'Live project URL is required'],
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?$/i,
        'Please enter a valid live website or deployment URL',
      ],
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    technologies: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
      enum: ['Full-Stack Web', 'Mobile App', 'AI & Machine Learning', 'Cloud & DevOps', 'IoT & Embedded', 'Cybersecurity', 'Open Source', 'Other'],
      default: 'Full-Stack Web',
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    reviewStatus: {
      type: String,
      enum: ['Pending Review', 'Reviewed', 'Changes Required'],
      default: 'Pending Review',
      index: true,
    },
    review: {
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      facultyName: {
        type: String,
        trim: true,
      },
      feedback: {
        type: String,
        trim: true,
        maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
      },
      suggestions: {
        type: String,
        trim: true,
        maxlength: [2000, 'Suggestions cannot exceed 2000 characters'],
      },
      marks: {
        type: Number,
        min: 0,
        max: 100,
      },
      reviewedAt: {
        type: Date,
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
  }
);

projectSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
