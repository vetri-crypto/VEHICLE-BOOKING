const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Get list of available drivers for booking
router.get('/drivers/available', protect, userController.getAvailableDrivers);

router.get('/', protect, authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, userController.updateUser);
router.delete('/:id', protect, authorize('ADMIN'), userController.deleteUser);

module.exports = router;
