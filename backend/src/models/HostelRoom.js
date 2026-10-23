const mongoose = require('mongoose');

const hostelRoomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    block: {
      type: String,
      required: [true, 'Hostel block is required'],
      enum: [
        'Block A (Boys)',
        'Block B (Boys)',
        'Block C (Girls)',
        'Block D (Girls)',
        'Block E (PG Wings)',
      ],
      trim: true,
    },
    floor: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple', 'Four-Bed'],
      default: 'Double',
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
      default: 2,
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Fully Occupied', 'Maintenance', 'Reserved'],
      default: 'Available',
    },
    amenities: {
      type: [String],
      default: ['Wi-Fi', 'Study Desk', 'Cupboard'],
    },
    monthlyRent: {
      type: Number,
      default: 4500,
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

// Compound unique index so room numbers are unique within each block
hostelRoomSchema.index({ block: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('HostelRoom', hostelRoomSchema);
