const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const registerUser = async ({ name, email, phone, password, address }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('An account with this email already exists.');
    error.statusCode = 409;
    throw error;
  }

  // Security Hardening: Public registration is strictly CUSTOMER only.
  // Any role passed in request body is ignored.
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    password,
    address: address || '',
    role: 'CUSTOMER',
    driverStatus: 'OFFLINE'
  });

  const token = generateToken(user._id, user.role);

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
    token
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== 'ACTIVE') {
    const error = new Error('Your account is inactive. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);

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
    token
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUserProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'phone', 'address', 'driverStatus'];
  const updatePayload = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      updatePayload[field] = updateData[field];
    }
  });

  if (updateData.password) {
    const user = await User.findById(userId);
    if (user) {
      user.password = updateData.password;
      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) user[field] = updateData[field];
      });
      await user.save();
      return await User.findById(userId).select('-password');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updatePayload, {
    new: true,
    runValidators: true
  }).select('-password');

  return updatedUser;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
