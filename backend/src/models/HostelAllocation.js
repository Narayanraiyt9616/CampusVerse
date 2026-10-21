const mongoose = require('mongoose');

const hostelAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostelRoom',
      required: [true, 'Hostel room reference is required'],
    },
    bedNumber: {
      type: String,
      trim: true,
      default: 'Bed 1',
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    checkInDate: {
      type: Date,
      default: Date.now,
    },
    vacateDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Vacated', 'Suspended'],
      default: 'Active',
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true },
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
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

module.exports = mongoose.model('HostelAllocation', hostelAllocationSchema);
