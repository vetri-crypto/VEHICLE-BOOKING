const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalVehicles,
    availableVehicles,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    activeBookings,
    completedBookings,
    cancelledBookings,
    recentBookings,
    successfulPayments
  ] = await Promise.all([
    User.countDocuments({ role: 'CUSTOMER' }),
    Vehicle.countDocuments({}),
    Vehicle.countDocuments({ status: 'AVAILABLE' }),
    Booking.countDocuments({}),
    Booking.countDocuments({ status: 'PENDING' }),
    Booking.countDocuments({ status: 'CONFIRMED' }),
    Booking.countDocuments({ status: 'ACTIVE' }),
    Booking.countDocuments({ status: 'COMPLETED' }),
    Booking.countDocuments({ status: 'CANCELLED' }),
    Booking.find({})
      .populate('vehicleId', 'brand model imageUrl vehicleNumber')
      .populate('userId', 'name email phone')
      .populate('driverId', 'name phone rating driverStatus')
      .sort({ createdAt: -1 })
      .limit(10),
    Payment.aggregate([
      { $match: { paymentStatus: 'SUCCESS' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ])
  ]);

  const totalRevenue = successfulPayments.length > 0 ? successfulPayments[0].totalRevenue : 0;

  return {
    totalUsers,
    totalVehicles,
    availableVehicles,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    activeBookings,
    completedBookings,
    cancelledBookings,
    totalRevenue,
    recentBookings
  };
};

const getReports = async () => {
  // Vehicle breakdown by type
  const vehiclesByType = await Vehicle.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);

  // Bookings by status
  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Top booked vehicles
  const topVehicles = await Booking.aggregate([
    { $group: { _id: '$vehicleId', bookingCount: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } },
    { $sort: { bookingCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'vehicles',
        localField: '_id',
        foreignField: '_id',
        as: 'vehicleDetails'
      }
    },
    { $unwind: '$vehicleDetails' }
  ]);

  return {
    vehiclesByType,
    bookingsByStatus,
    topVehicles
  };
};

const createUser = async ({ name, email, phone, password, confirmPassword, address, role }) => {
  if (!name || !email || !phone || !password || !role) {
    const error = new Error('Please provide all required fields: name, email, phone, password, role');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters long');
    error.statusCode = 400;
    throw error;
  }

  if (confirmPassword && password !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  const normalizedRole = role.toUpperCase();
  if (!['CUSTOMER', 'DRIVER', 'ADMIN'].includes(normalizedRole)) {
    const error = new Error('Invalid role specified. Must be CUSTOMER, DRIVER, or ADMIN');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
    address: address || '',
    role: normalizedRole,
    driverStatus: normalizedRole === 'DRIVER' ? 'AVAILABLE' : 'OFFLINE',
    status: 'ACTIVE'
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    driverStatus: user.driverStatus,
    rating: user.rating,
    status: user.status,
    createdAt: user.createdAt
  };
};

const deleteUser = async (targetUserId, adminUserId) => {
  if (targetUserId.toString() === adminUserId.toString()) {
    const error = new Error('You cannot delete your own admin account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if user has active ongoing bookings
  const activeBookings = await Booking.find({
    $or: [{ userId: targetUserId }, { driverId: targetUserId }],
    status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] }
  });

  if (activeBookings.length > 0) {
    const error = new Error('Cannot delete user account with active or ongoing bookings.');
    error.statusCode = 400;
    throw error;
  }

  await User.findByIdAndDelete(targetUserId);
  return { id: targetUserId, message: 'User account deleted successfully' };
};

const updateUserStatus = async (targetUserId, status) => {
  const normalizedStatus = status ? status.toUpperCase() : '';
  if (!['ACTIVE', 'INACTIVE'].includes(normalizedStatus)) {
    const error = new Error('Status must be ACTIVE or INACTIVE');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { status: normalizedStatus },
    { new: true }
  ).select('-password');

  if (!user) {
    const error = new Error('User account not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  getDashboardStats,
  getReports,
  createUser,
  deleteUser,
  updateUserStatus
};

