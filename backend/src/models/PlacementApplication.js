const mongoose = require('mongoose');

const placementApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      required: [true, 'Drive reference is required'],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    resumeLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected / Offered', 'Rejected'],
      default: 'Applied',
    },
    currentRound: {
      type: String,
      default: 'Application Review',
    },
    interviewSchedule: {
      roundName: { type: String, trim: true },
      date: { type: Date },
      time: { type: String, trim: true },
      venueOrLink: { type: String, trim: true },
      interviewerNotes: { type: String, trim: true },
    },
    offerDetails: {
      designation: { type: String, trim: true },
      offeredCtc: { type: String, trim: true },
      joiningLocation: { type: String, trim: true },
      offerDate: { type: Date },
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
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

// Compound index so a student cannot apply twice to the same drive
placementApplicationSchema.index({ student: 1, drive: 1 }, { unique: true });

module.exports = mongoose.model('PlacementApplication', placementApplicationSchema);
