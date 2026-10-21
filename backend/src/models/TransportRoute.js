const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema(
  {
    stopName: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true }, // e.g. "07:30 AM"
    order: { type: Number, required: true },
  },
  { _id: false }
);

const transportRouteSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: [true, 'Route number is required'],
      unique: true,
      trim: true,
    },
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
    },
    startPoint: {
      type: String,
      required: [true, 'Start point is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination terminal is required'],
      trim: true,
    },
    stops: [stopSchema],
    totalDistanceKm: {
      type: Number,
      default: 25,
      min: 0,
    },
    estimatedDurationMins: {
      type: Number,
      default: 45,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Delayed', 'Suspended', 'Maintenance'],
      default: 'Active',
    },
    delayMinutes: {
      type: Number,
      default: 0,
      min: 0,
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

module.exports = mongoose.model('TransportRoute', transportRouteSchema);
