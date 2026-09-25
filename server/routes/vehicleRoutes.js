const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/search', vehicleController.searchVehicles);
router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.get('/:id/availability', vehicleController.checkVehicleAvailability);

// Admin protected routes
router.post('/', protect, authorize('ADMIN'), vehicleController.createVehicle);
router.put('/:id', protect, authorize('ADMIN'), vehicleController.updateVehicle);
router.delete('/:id', protect, authorize('ADMIN'), vehicleController.deleteVehicle);

module.exports = router;
