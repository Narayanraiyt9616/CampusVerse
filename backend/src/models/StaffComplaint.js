const mongoose = require('mongoose');

const staffComplaintSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['Hostel', 'Transport'],
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Electrical',
        'Plumbing',
        'HVAC / Geyser',
        'Cleanliness',
        'Furniture',
        'Bus Delay',
        'Bus Route / Stop',
        'Driver Conduct',
        'Other',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
    studentName: {
      type: String,
      trim: true,
    },
    hostelBlock: {
      type: String,
      trim: true,
    },
    roomNumber: {
      type: String,
      trim: true,
    },
    routeNumber: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Emergency'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    assignedTo: {
      type: String,
      trim: true,
      default: 'Duty Officer',
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    resolvedAt: {
      type: Date,
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

module.exports = mongoose.model('StaffComplaint', staffComplaintSchema);
