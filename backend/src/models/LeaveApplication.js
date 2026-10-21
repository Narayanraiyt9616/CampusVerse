const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: {
      type: String,
      enum: ['Casual Leave', 'Medical Leave', 'Earned Leave', 'Emergency Leave', 'Other'],
      required: true,
    },
    fromDate: { type: String, required: true }, // YYYY-MM-DD
    toDate: { type: String, required: true },   // YYYY-MM-DD
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminRemarks: { type: String, trim: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true, versionKey: false } }
);

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
