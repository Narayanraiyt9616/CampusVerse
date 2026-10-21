const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(auth);

// List fees – student sees own, admin sees all
router.get('/', authorize('student', 'admin', 'superadmin'), feeController.listFees);

// Get single fee record
router.get('/:id', authorize('student', 'admin', 'superadmin'), feeController.getFee);

// Create fee invoice – admin only
router.post('/', authorize('admin', 'superadmin'), feeController.createFee);

// Update fee – admin only (mark as paid, update amount, etc.)
router.patch('/:id', authorize('admin', 'superadmin'), feeController.updateFee);

// Delete fee – admin only
router.delete('/:id', authorize('admin', 'superadmin'), feeController.deleteFee);

module.exports = router;
