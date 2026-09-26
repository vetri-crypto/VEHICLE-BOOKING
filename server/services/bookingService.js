const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Payment = require('../models/Payment');
const vehicleService = require('./vehicleService');

/**
 * Calculate booking price on backend
 */
const calculatePrice = (startDateStr, endDateStr, pricePerDay, bookingType = 'WITHOUT_DRIVER') => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end date');
  }

  if (start >= end) {
    throw new Error('End date must be after start date');
  }

  const diffTime = end.getTime() - start.getTime();
  const days = Math.ceil(diffTime / (1000 * 3600 * 24));
  const numberOfDays = Math.max(days, 1);

  // Driver fee: ₹500 per day if WITH_DRIVER
  const driverFeePerDay = bookingType === 'WITH_DRIVER' ? 500 : 0;
  const totalDriverFee = numberOfDays * driverFeePerDay;
  const vehicleAmount = numberOfDays * pricePerDay;
  const totalAmount = vehicleAmount + totalDriverFee;

  return {
    numberOfDays,
    driverFeePerDay,
    totalDriverFee,
    vehicleAmount,
    totalAmount
  };
};

/**
 * Generate unique Booking Reference
 */
const generateBookingReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BK-${timestamp}-${random}`;
};

/**
 * Create a new booking
 */
const createBooking = async (userId, bookingData) => {
  const {
    vehicleId,
    startDate,
    endDate,
    pickupLocation,
    dropLocation,
    paymentMethod,
    bookingType = 'WITHOUT_DRIVER',
    driverId = null
  } = bookingData;

  if (!vehicleId || !startDate || !endDate || !pickupLocation || !dropLocation) {
    const error = new Error('Please fill all required booking fields');
    error.statusCode = 400;
    throw error;
  }

  // 1. Check vehicle existence and status
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'INACTIVE') {
    const error = new Error(`Vehicle is currently ${vehicle.status.toLowerCase()} and cannot be booked`);
    error.statusCode = 400;
    throw error;
  }

  // 2. Check date overlap (Double booking prevention)
  const availability = await vehicleService.checkAvailability(vehicleId, startDate, endDate);
  if (!availability.available) {
    const error = new Error('Vehicle is not available for the selected dates. Another booking exists in this period.');
    error.statusCode = 409;
    throw error;
  }

  // 3. Driver validation if WITH_DRIVER
  let assignedDriverId = null;
  let driverFee = 0;

  if (bookingType === 'WITH_DRIVER') {
    if (driverId) {
      const driver = await User.findById(driverId);
      if (!driver || driver.role !== 'DRIVER' || driver.status !== 'ACTIVE') {
        const error = new Error('Selected driver is currently unavailable. Please pick another driver.');
        error.statusCode = 400;
        throw error;
      }

      if (driver.driverStatus === 'BUSY') {
        const error = new Error('Selected driver is currently busy handling another trip.');
        error.statusCode = 400;
        throw error;
      }

      const activeTrip = await Booking.findOne({ driverId: driver._id, status: 'ACTIVE' });
      if (activeTrip) {
        const error = new Error('Selected driver is currently handling another active trip.');
        error.statusCode = 400;
        throw error;
      }

      assignedDriverId = driver._id;
    } else {
      // Broadcast mode: driverId remains null so all active drivers receive the request to accept
      assignedDriverId = null;
    }
  }

  // 4. Calculate final authoritative price
  const { numberOfDays, totalDriverFee, totalAmount } = calculatePrice(
    startDate,
    endDate,
    vehicle.pricePerDay,
    bookingType
  );
  driverFee = totalDriverFee;

  // 5. Create Booking
  const bookingReference = generateBookingReference();

  const booking = await Booking.create({
    bookingReference,
    userId,
    vehicleId,
    bookingType,
    driverId: assignedDriverId,
    driverFee,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    pickupLocation,
    dropLocation,
    totalAmount,
    status: 'CONFIRMED'
  });

  // 6. Create Simulated Payment
  const transactionReference = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const payment = await Payment.create({
    bookingId: booking._id,
    amount: totalAmount,
    paymentMethod: paymentMethod || 'CREDIT_CARD',
    paymentStatus: 'SUCCESS',
    transactionReference,
    paidAt: new Date()
  });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('vehicleId')
    .populate('userId', 'name email phone')
    .populate('driverId', 'name phone rating driverStatus');

  return {
    booking: populatedBooking,
    payment,
    numberOfDays
  };
};

/**
 * Get bookings with role authorization
 */
const getBookings = async (user, filters = {}) => {
  const query = {};

  if (user.role === 'CUSTOMER') {
    query.userId = user._id;
  } else if (user.role === 'DRIVER') {
    query.driverId = user._id;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.vehicleId) {
    query.vehicleId = filters.vehicleId;
  }

  const bookings = await Booking.find(query)
    .populate('vehicleId')
    .populate('userId', 'name email phone address')
    .populate('driverId', 'name phone rating driverStatus')
    .sort({ createdAt: -1 });

  return bookings;
};

/**
 * Get single booking by ID
 */
const getBookingById = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId)
    .populate('vehicleId')
    .populate('userId', 'name email phone address')
    .populate('driverId', 'name phone rating driverStatus');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = booking.userId._id.toString() === user._id.toString();
  const isAssignedDriver = booking.driverId && booking.driverId._id.toString() === user._id.toString();

  if (user.role !== 'ADMIN' && !isOwner && !isAssignedDriver) {
    const error = new Error('Not authorized to view this booking');
    error.statusCode = 403;
    throw error;
  }

  const payment = await Payment.findOne({ bookingId: booking._id });

  return {
    booking,
    payment
  };
};

/**
 * Driver starts a booking: CONFIRMED -> ACTIVE & driverStatus: AVAILABLE -> BUSY
 */
const startDriverBooking = async (bookingId, driverUserId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (!booking.driverId || booking.driverId.toString() !== driverUserId.toString()) {
    const error = new Error('You are not assigned to this booking');
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== 'CONFIRMED' && booking.status !== 'PENDING') {
    const error = new Error(`Cannot start booking in ${booking.status} status`);
    error.statusCode = 400;
    throw error;
  }

  booking.status = 'ACTIVE';
  await booking.save();

  // Set Driver status to BUSY
  await User.findByIdAndUpdate(driverUserId, { driverStatus: 'BUSY' });

  const updatedBooking = await Booking.findById(bookingId)
    .populate('vehicleId')
    .populate('userId', 'name email phone')
    .populate('driverId', 'name phone rating driverStatus');

  return updatedBooking;
};

/**
 * Driver completes a booking: ACTIVE -> COMPLETED & driverStatus: BUSY -> AVAILABLE
 */
const completeDriverBooking = async (bookingId, driverUserId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (!booking.driverId || booking.driverId.toString() !== driverUserId.toString()) {
    const error = new Error('You are not assigned to this booking');
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== 'ACTIVE') {
    const error = new Error('Only active bookings can be completed');
    error.statusCode = 400;
    throw error;
  }

  booking.status = 'COMPLETED';
  await booking.save();

  // Set Driver status to AVAILABLE
  await User.findByIdAndUpdate(driverUserId, { driverStatus: 'AVAILABLE' });

  const updatedBooking = await Booking.findById(bookingId)
    .populate('vehicleId')
    .populate('userId', 'name email phone')
    .populate('driverId', 'name phone rating driverStatus');

  return updatedBooking;
};

/**
 * Cancel booking
 */
const cancelBooking = async (bookingId, user) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'ADMIN' && booking.userId.toString() !== user._id.toString()) {
    const error = new Error('Not authorized to cancel this booking');
    error.statusCode = 403;
    throw error;
  }

  if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
    const error = new Error(`Booking cannot be cancelled because it is already ${booking.status.toLowerCase()}`);
    error.statusCode = 400;
    throw error;
  }

  booking.status = 'CANCELLED';
  await booking.save();

  // If driver was assigned, set driver back to AVAILABLE
  if (booking.driverId) {
    await User.findByIdAndUpdate(booking.driverId, { driverStatus: 'AVAILABLE' });
  }

  await Payment.findOneAndUpdate(
    { bookingId: booking._id },
    { paymentStatus: 'REFUNDED' }
  );

  const updatedBooking = await Booking.findById(bookingId)
    .populate('vehicleId')
    .populate('userId', 'name email phone')
    .populate('driverId', 'name phone rating driverStatus');

  return updatedBooking;
};

/**
 * Admin update booking status flow
 */
const updateBookingStatus = async (bookingId, newStatus) => {
  const validStatuses = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(newStatus)) {
    const error = new Error('Invalid status provided');
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  booking.status = newStatus;
  await booking.save();

  if (booking.driverId) {
    if (newStatus === 'ACTIVE') {
      await User.findByIdAndUpdate(booking.driverId, { driverStatus: 'BUSY' });
    } else if (['COMPLETED', 'CANCELLED'].includes(newStatus)) {
      await User.findByIdAndUpdate(booking.driverId, { driverStatus: 'AVAILABLE' });
    }
  }

  if (newStatus === 'CANCELLED') {
    await Payment.findOneAndUpdate({ bookingId: booking._id }, { paymentStatus: 'REFUNDED' });
  }

  const updatedBooking = await Booking.findById(bookingId)
    .populate('vehicleId')
    .populate('userId', 'name email phone')
    .populate('driverId', 'name phone rating driverStatus');

  return updatedBooking;
};

/**
 * Get all broadcast ride requests awaiting driver acceptance
 */
const getAvailableRideRequests = async () => {
  const requests = await Booking.find({
    bookingType: 'WITH_DRIVER',
    driverId: null,
    status: { $in: ['CONFIRMED', 'PENDING'] }
  })
    .populate('vehicleId')
    .populate('userId', 'name email phone address')
    .sort({ createdAt: -1 })
    .lean();

  return requests;
};

/**
 * Driver accepts an unassigned booking request
 */
const acceptDriverBooking = async (bookingId, driverUserId) => {
  const driver = await User.findById(driverUserId);
  if (!driver || driver.role !== 'DRIVER' || driver.status !== 'ACTIVE') {
    const error = new Error('Driver account is not active or authorized');
    error.statusCode = 403;
    throw error;
  }

  if (driver.driverStatus === 'BUSY') {
    const error = new Error('You are currently handling an active trip and cannot accept another booking.');
    error.statusCode = 400;
    throw error;
  }

  const activeTrip = await Booking.findOne({ driverId: driverUserId, status: 'ACTIVE' });
  if (activeTrip) {
    const error = new Error('You are currently handling an active trip.');
    error.statusCode = 400;
    throw error;
  }

  // Atomic update to prevent race conditions / double acceptance
  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      bookingType: 'WITH_DRIVER',
      driverId: null,
      status: { $in: ['CONFIRMED', 'PENDING'] }
    },
    {
      driverId: driverUserId
    },
    { new: true }
  );

  if (!booking) {
    const error = new Error('This ride request is no longer available or was accepted by another driver.');
    error.statusCode = 409;
    throw error;
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate('vehicleId')
    .populate('userId', 'name email phone address')
    .populate('driverId', 'name phone rating driverStatus');

  return populatedBooking;
};

module.exports = {
  calculatePrice,
  createBooking,
  getBookings,
  getBookingById,
  startDriverBooking,
  completeDriverBooking,
  cancelBooking,
  updateBookingStatus,
  getAvailableRideRequests,
  acceptDriverBooking
};
