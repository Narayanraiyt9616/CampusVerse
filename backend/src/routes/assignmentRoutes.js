const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(auth);

// Faculty or admin can create
router.post('/', authorize('faculty','admin','super_admin'), assignmentController.create);
// List – any authenticated user can view (filters will hide unpublished for students)
router.get('/', authorize('faculty','student','admin','super_admin'), assignmentController.list);
// Detail
router.get('/:id', authorize('faculty','student','admin','super_admin'), assignmentController.detail);
// Update – faculty who created or admin/super_admin
router.patch('/:id', authorize('faculty','admin','super_admin'), assignmentController.update);
// Delete – admin only
router.delete('/:id', authorize('admin','super_admin'), assignmentController.remove);

module.exports = router;
