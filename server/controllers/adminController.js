const adminService = require('../services/adminService');
const bookingService = require('../services/bookingService');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({})
      .populate('vehicleId')
      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone rating driverStatus')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status in request body'
      });
    }

    const booking = await bookingService.updateBookingStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status} successfully`,
      data: booking
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getReports();
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await adminService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: `${user.role} account created successfully`,
      data: user
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getVehicles,
  getBookings,
  updateBookingStatus,
  getReports,
  createUser
};
