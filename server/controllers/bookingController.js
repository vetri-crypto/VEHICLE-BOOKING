const bookingService = require('../services/bookingService');

const createBooking = async (req, res, next) => {
  try {
    const result = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: result.booking,
      payment: result.payment,
      numberOfDays: result.numberOfDays
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const getBookings = async (req, res, next) => {
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

const getBookingById = async (req, res, next) => {
  try {
    const data = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: data.booking,
      payment: data.payment
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
