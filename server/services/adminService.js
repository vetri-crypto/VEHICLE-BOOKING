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

module.exports = {
  getDashboardStats,
  getReports
};
