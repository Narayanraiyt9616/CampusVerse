const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      default: 'Information Technology',
    },
    website: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      default: 'Bangalore, India',
    },
    tier: {
      type: String,
      enum: ['Tier 1 (Dream)', 'Tier 2 (Super Dream)', 'Standard Corporate'],
      default: 'Tier 1 (Dream)',
    },
    status: {
      type: String,
      enum: ['Active Partner', 'Drive Scheduled', 'Under Review'],
      default: 'Active Partner',
    },
    about: {
      type: String,
      trim: true,
      maxlength: 2000,
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

module.exports = mongoose.model('Company', companySchema);
