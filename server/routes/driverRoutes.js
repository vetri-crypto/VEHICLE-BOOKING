const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('DRIVER')); // All driver routes require DRIVER role

router.get('/dashboard', driverController.getDriverDashboard);
router.get('/bookings', driverController.getDriverBookings);
router.put('/bookings/:id/accept', driverController.acceptBooking);
router.put('/bookings/:id/start', driverController.startBooking);
router.put('/bookings/:id/complete', driverController.completeBooking);
router.put('/status', driverController.updateDriverStatus);

module.exports = router;
