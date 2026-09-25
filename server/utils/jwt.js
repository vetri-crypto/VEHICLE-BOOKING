const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { userId: id, role },
    process.env.JWT_SECRET || 'ooase_vehicle_booking_secret_key_2026_jwt_super_secure',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = { generateToken };
