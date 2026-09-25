const vehicleService = require('../services/vehicleService');

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getAllVehicles(req.query);
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

const searchVehicles = async (req, res, next) => {
  try {
    const vehicles = await vehicleService.getAllVehicles(req.query);
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const vehicleData = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json({
      success: true,
      data: vehicleData
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const checkVehicleAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both startDate and endDate query parameters'
      });
    }

    const availability = await vehicleService.checkAvailability(req.params.id, startDate, endDate);
    res.status(200).json({
      success: true,
      data: availability
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: vehicle
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    if (error.statusCode) {
      res.status(error.statusCode);
    }
    next(error);
  }
};

module.exports = {
  getVehicles,
  searchVehicles,
  getVehicleById,
  checkVehicleAvailability,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
