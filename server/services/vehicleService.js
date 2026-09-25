const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const getAllVehicles = async (queryParams) => {
  const {
    search,
    category,
    type,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    status,
    sortBy,
    sortOrder
  } = queryParams;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (category) {
    filter.category = { $regex: new RegExp(category, 'i') };
  }

  if (type) {
    filter.type = { $regex: new RegExp(type, 'i') };
  }

  if (fuelType) {
    filter.fuelType = fuelType;
  }

  if (transmission) {
    filter.transmission = transmission;
  }

  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { brand: searchRegex },
      { model: searchRegex },
      { category: searchRegex },
      { type: searchRegex },
      { vehicleNumber: searchRegex }
    ];
  }

  let sort = { createdAt: -1 };
  if (sortBy) {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'price') sort = { pricePerDay: order };
    else if (sortBy === 'brand') sort = { brand: order };
    else if (sortBy === 'model') sort = { model: order };
  }

  const vehicles = await Vehicle.find(filter).sort(sort);
  return vehicles;
};

const getVehicleById = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const reviews = await Review.find({ vehicleId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : 0;

  return {
    ...vehicle.toObject(),
    reviews,
    totalReviews,
    avgRating: Number(avgRating)
  };
};

const createVehicle = async (vehicleData) => {
  const existing = await Vehicle.findOne({
    vehicleNumber: vehicleData.vehicleNumber.toUpperCase()
  });

  if (existing) {
    const error = new Error('Vehicle with this registration number already exists');
    error.statusCode = 409;
    throw error;
  }

  const vehicle = await Vehicle.create({
    ...vehicleData,
    vehicleNumber: vehicleData.vehicleNumber.toUpperCase()
  });

  return vehicle;
};

const updateVehicle = async (vehicleId, vehicleData) => {
  if (vehicleData.vehicleNumber) {
    vehicleData.vehicleNumber = vehicleData.vehicleNumber.toUpperCase();
    const existing = await Vehicle.findOne({
      vehicleNumber: vehicleData.vehicleNumber,
      _id: { $ne: vehicleId }
    });
    if (existing) {
      const error = new Error('Vehicle with this registration number already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, vehicleData, {
    new: true,
    runValidators: true
  });

  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  return vehicle;
};

const deleteVehicle = async (vehicleId) => {
  const activeBookings = await Booking.find({
    vehicleId,
    status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }
  });

  if (activeBookings.length > 0) {
    const error = new Error('Cannot delete vehicle with active or upcoming bookings');
    error.statusCode = 400;
    throw error;
  }

  const vehicle = await Vehicle.findByIdAndDelete(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  return vehicle;
};

/**
 * CHECK AVAILABILITY BUSINESS LOGIC:
 * A vehicle is unavailable if there exists an active booking where:
 * booking.startDate < req.endDate AND booking.endDate > req.startDate
 */
const checkAvailability = async (vehicleId, start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    const error = new Error('Invalid start or end date format');
    error.statusCode = 400;
    throw error;
  }

  if (startDate >= endDate) {
    const error = new Error('End date must be after start date');
    error.statusCode = 400;
    throw error;
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
    return {
      available: false,
      reason: `Vehicle is currently under ${vehicle.status.toLowerCase()}`,
      vehicleStatus: vehicle.status
    };
  }

  // Query overlapping bookings
  const overlappingBookings = await Booking.find({
    vehicleId,
    status: { $nin: ['CANCELLED'] },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate }
  });

  const available = overlappingBookings.length === 0;

  return {
    available,
    vehicleId,
    startDate,
    endDate,
    vehicleStatus: vehicle.status,
    conflictingBookingsCount: overlappingBookings.length
  };
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  checkAvailability
};
