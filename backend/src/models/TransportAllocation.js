const mongoose = require('mongoose');

const transportAllocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportRoute',
      required: [true, 'Transport route reference is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportVehicle',
    },
    pickupStop: {
      type: String,
      required: [true, 'Pickup stop is required'],
      trim: true,
    },
    dropStop: {
      type: String,
      default: 'Campus Main Gate Terminal',
      trim: true,
    },
    passNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Expired', 'Cancelled'],
      default: 'Active',
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validTill: {
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

module.exports = mongoose.model('TransportAllocation', transportAllocationSchema);
