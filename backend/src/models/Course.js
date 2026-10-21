const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [2, 'Course code must be at least 2 characters'],
      maxlength: [15, 'Course code cannot exceed 15 characters'],
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Course title must be at least 3 characters'],
      maxlength: [150, 'Course title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Course description cannot exceed 1000 characters'],
      default: '',
    },
    credits: {
      type: Number,
      required: [true, 'Course credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [10, 'Credits cannot exceed 10'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester number is required'],
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Archived', 'Draft'],
        message: '{VALUE} is not a valid course status',
      },
      default: 'Active',
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

// Note: unique:true on 'courseCode' above already creates the index — no duplicate needed.
// Compound index for fast filtering by department and semester:
courseSchema.index({ department: 1, semester: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
