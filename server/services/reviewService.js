const Review = require('../models/Review');
const Booking = require('../models/Booking');

const createReview = async (userId, { vehicleId, bookingId, rating, comment }) => {
  if (!vehicleId || !bookingId || !rating || !comment) {
    const error = new Error('Please provide vehicleId, bookingId, rating, and comment');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify booking exists and belongs to user
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (booking.userId.toString() !== userId.toString()) {
    const error = new Error('You can only review vehicles you have booked yourself');
    error.statusCode = 403;
    throw error;
  }

  if (booking.vehicleId.toString() !== vehicleId.toString()) {
    const error = new Error('Booking does not match the specified vehicle');
    error.statusCode = 400;
    throw error;
  }

  // Allow review if booking is COMPLETED or CONFIRMED/ACTIVE for demo convenience
  if (!['COMPLETED', 'CONFIRMED', 'ACTIVE'].includes(booking.status)) {
    const error = new Error('You can only submit reviews for valid active or completed bookings');
    error.statusCode = 400;
    throw error;
  }

  // 2. Check if already reviewed for this booking
  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    const error = new Error('You have already submitted a review for this booking');
    error.statusCode = 409;
    throw error;
  }

  const review = await Review.create({
    userId,
    vehicleId,
    bookingId,
    rating: Number(rating),
    comment
  });

  const populatedReview = await Review.findById(review._id).populate('userId', 'name');
  return populatedReview;
};

const getVehicleReviews = async (vehicleId) => {
  const reviews = await Review.find({ vehicleId })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

  return reviews;
};

module.exports = {
  createReview,
  getVehicleReviews
};
