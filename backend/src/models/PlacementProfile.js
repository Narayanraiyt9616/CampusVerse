const mongoose = require('mongoose');

const placementProfileSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      unique: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 8.0,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
    },
    technicalSkills: {
      type: [String],
      default: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL'],
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: 'https://campusverse.edu/resumes/sample-candidate-cv.pdf',
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    isRegistered: {
      type: Boolean,
      default: true,
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    placementStatus: {
      type: String,
      enum: ['Unplaced', 'Shortlisted', 'Interviewing', 'Placed', 'Opted Out'],
      default: 'Unplaced',
    },
    placedCompany: {
      type: String,
      trim: true,
    },
    offeredCtc: {
      type: String,
      trim: true,
    },
    offerLetterUrl: {
      type: String,
      trim: true,
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

module.exports = mongoose.model('PlacementProfile', placementProfileSchema);
