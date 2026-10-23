const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

router.use(auth);

// Student routes
router.get('/my-projects', authorize('student', 'faculty', 'admin', 'superadmin', 'super_admin'), projectController.getMyProjects);
router.post('/', authorize('student'), projectController.createProject);
router.put('/:id', authorize('student', 'admin', 'superadmin', 'super_admin'), projectController.updateProject);
router.delete('/:id', authorize('student', 'admin', 'superadmin', 'super_admin'), projectController.deleteProject);

// Faculty & Admin review routes
router.get('/', authorize('faculty', 'admin', 'superadmin', 'super_admin'), projectController.getFacultyProjects);
router.put('/:id/review', authorize('faculty', 'admin', 'superadmin', 'super_admin'), projectController.reviewProject);

module.exports = router;
