const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, role } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, password'
      });
    }

    const userData = await authService.registerUser({ name, email, phone, password, address, role });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userData
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const userData = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: userData
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    res.status(200).json({
      success: true,
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
  register,
  login,
  logout,
  getMe
};
