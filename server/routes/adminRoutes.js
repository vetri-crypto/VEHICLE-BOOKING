const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN')); // All admin routes require ADMIN role

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/vehicles', adminController.getVehicles);
router.get('/bookings', adminController.getBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.get('/reports', adminController.getReports);

module.exports = router;
