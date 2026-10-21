const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Department name must be at least 2 characters'],
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [2, 'Department code must be at least 2 characters'],
      maxlength: [10, 'Department code cannot exceed 10 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive'],
        message: '{VALUE} is not a supported department status',
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

// Note: unique:true on 'name' and 'code' fields above already creates these indexes.
// No additional schema.index() calls needed — duplicates cause Mongoose warnings.

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
