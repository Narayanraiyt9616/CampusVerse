const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(auth);

// Create – admin or faculty
router.post('/', authorize('faculty','admin','super_admin'), resultController.create);
// List – role based
router.get('/', authorize('faculty','student','admin','super_admin'), resultController.list);
// Update – admin or owning faculty
router.patch('/:id', authorize('faculty','admin','super_admin'), resultController.update);
// Delete – admin only
router.delete('/:id', authorize('admin','super_admin'), resultController.remove);

module.exports = router;
