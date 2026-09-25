const User = require('../models/User');
const Booking = require('../models/Booking');
const authService = require('../services/authService');

const getAllUsers = async (req, res, next) => {
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

const getAvailableDrivers = async (req, res, next) => {
  try {
    // Drivers who are active, role='DRIVER', driverStatus='AVAILABLE'
    const drivers = await User.find({
      role: 'DRIVER',
      status: 'ACTIVE',
      driverStatus: 'AVAILABLE'
    }).select('-password');

    // Filter out any driver currently linked to an ACTIVE booking
    const activeDriverBookings = await Booking.find({
      status: 'ACTIVE',
      driverId: { $ne: null }
    }).select('driverId');

    const activeDriverIds = activeDriverBookings.map((b) => b.driverId ? b.driverId.toString() : '');

    const availableDrivers = drivers.filter(
      (driver) => !activeDriverIds.includes(driver._id.toString())
    );

    res.status(200).json({
      success: true,
      count: availableDrivers.length,
      data: availableDrivers
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user profile'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const updatedUser = await authService.updateUserProfile(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAvailableDrivers,
  getUserById,
  updateUser,
  deleteUser
};
