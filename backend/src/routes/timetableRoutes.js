const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(auth);

// Admin / super_admin create, list, update, delete
router.post('/', authorize('admin','super_admin'), timetableController.create);
router.get('/', authorize('admin','super_admin','faculty','student'), timetableController.list);
router.patch('/:id', authorize('admin','super_admin'), timetableController.update);
router.delete('/:id', authorize('admin','super_admin'), timetableController.remove);

// Specific views
router.get('/student/:studentId', authorize('student','admin','super_admin'), timetableController.getByStudent);
router.get('/faculty/:facultyId', authorize('faculty','admin','super_admin'), timetableController.getByFaculty);

module.exports = router;
