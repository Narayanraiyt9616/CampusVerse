const mongoose = require('mongoose');

const transportVehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    model: {
      type: String,
      required: [true, 'Bus model is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 40,
      min: 10,
      max: 90,
    },
    assignedRoute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TransportRoute',
    },
    driver: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      licenseNumber: { type: String, trim: true },
      experienceYears: { type: Number, default: 5 },
    },
    status: {
      type: String,
      enum: ['On Schedule', 'Delayed', 'In Maintenance', 'Standby'],
      default: 'On Schedule',
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'EV Electric', 'CNG'],
      default: 'Diesel',
    },
    lastServiceDate: {
      type: Date,
      default: Date.now,
    },
    insuranceValidTill: {
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

module.exports = mongoose.model('TransportVehicle', transportVehicleSchema);
