const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Please provide vehicle registration number'],
      unique: true,
      trim: true,
      uppercase: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide vehicle brand'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Please provide vehicle model'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Please specify vehicle type (e.g. Car, SUV, Bike, Van)'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please specify vehicle category (e.g. Economy, Sedan, SUV, Luxury, Electric, Bike)'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please specify daily rental rate'],
      min: [0, 'Price per day cannot be negative']
    },
    fuelType: {
      type: String,
      required: [true, 'Please specify fuel type'],
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
    },
    transmission: {
      type: String,
      required: [true, 'Please specify transmission type'],
      enum: ['Automatic', 'Manual']
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Please specify seating capacity'],
      min: 1
    },
    imageUrl: {
      type: String,
      required: [true, 'Please provide vehicle image URL']
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'INACTIVE'],
      default: 'AVAILABLE'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
