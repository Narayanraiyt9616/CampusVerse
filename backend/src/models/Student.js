const mongoose = require('mongoose');

// Standard RFC 5322 compliant email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID / Roll Number is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [3, 'Student ID must be at least 3 characters'],
      maxlength: [20, 'Student ID cannot exceed 20 characters'],
    },
    name: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      minlength: [2, 'Student name must be at least 2 characters'],
      maxlength: [100, 'Student name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Institutional email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Current semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    enrollmentYear: {
      type: Number,
      required: [true, 'Enrollment year is required'],
      min: [2000, 'Enrollment year must be 2000 or later'],
      max: [2100, 'Enrollment year must be reasonable'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Graduated', 'Suspended', 'On Leave'],
        message: '{VALUE} is not a valid student status',
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

// Note: unique:true on 'studentId' and 'email' fields above already creates those indexes.
// Compound index for fast queries by department and semester:
studentSchema.index({ department: 1, semester: 1 });

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
