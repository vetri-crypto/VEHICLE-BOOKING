const bookingService = require('../services/bookingService');
const Booking = require('../models/Booking');
const User = require('../models/User');

const getDriverDashboard = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const [driver, totalTrips, activeTrips, completedTrips, assignedBookings, availableRequests] = await Promise.all([
      User.findById(driverId).select('-password'),
      Booking.countDocuments({ driverId }),
      Booking.countDocuments({ driverId, status: 'ACTIVE' }),
      Booking.countDocuments({ driverId, status: 'COMPLETED' }),
      Booking.find({ driverId })
        .populate('vehicleId')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 }),
      bookingService.getAvailableRideRequests()
    ]);

    res.status(200).json({
      success: true,
      data: {
        driver,
        totalTrips,
        activeTrips,
        completedTrips,
        assignedBookings,
        availableRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDriverBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getBookings(req.user, req.query);
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const acceptBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.acceptDriverBooking(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Booking accepted successfully! Ride assigned to you.',
      data: booking
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const startBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.startDriverBooking(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Trip started successfully! Booking is now ACTIVE.',
      data: booking
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const completeBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.completeDriverBooking(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Trip completed successfully! Booking is now COMPLETED.',
      data: booking
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const updateDriverStatus = async (req, res, next) => {
  try {
    const { driverStatus } = req.body;
    if (!['AVAILABLE', 'OFFLINE'].includes(driverStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid driverStatus. Must be AVAILABLE or OFFLINE'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { driverStatus },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: `Status updated to ${driverStatus}`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDriverDashboard,
  getDriverBookings,
  acceptBooking,
  startBooking,
  completeBooking,
  updateDriverStatus
};
