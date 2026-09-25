const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    bookingType: {
      type: String,
      enum: ['WITHOUT_DRIVER', 'WITH_DRIVER'],
      default: 'WITHOUT_DRIVER'
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    driverFee: {
      type: Number,
      default: 0
    },
    startDate: {
      type: Date,
      required: [true, 'Please select a start date']
    },
    endDate: {
      type: Date,
      required: [true, 'Please select an end date']
    },
    pickupLocation: {
      type: String,
      required: [true, 'Please provide a pickup location'],
      trim: true
    },
    dropLocation: {
      type: String,
      required: [true, 'Please provide a drop location'],
      trim: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for high-performance query execution
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ driverId: 1, status: 1 });
bookingSchema.index({ bookingType: 1, driverId: 1, status: 1 });
bookingSchema.index({ vehicleId: 1, startDate: 1, endDate: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
