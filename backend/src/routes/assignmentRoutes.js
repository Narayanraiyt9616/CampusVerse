const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { uploadAssignmentFile } = require('../middleware/uploadMiddleware');

router.use(auth);

// Student view their assignments
router.get('/my-assignments', authorize('faculty', 'student', 'admin', 'superadmin', 'super_admin'), assignmentController.getMyAssignments);

// Submissions
router.get('/submissions/:id', authorize('faculty', 'student', 'admin', 'superadmin', 'super_admin'), assignmentController.getSubmissionDetail);
router.put('/submissions/:id/grade', authorize('faculty', 'admin', 'superadmin', 'super_admin'), assignmentController.gradeSubmission);

// Faculty or admin can create
router.post('/', authorize('faculty', 'admin', 'superadmin', 'super_admin'), assignmentController.create);
// List – any authenticated user can view (filters will hide unpublished for students)
router.get('/', authorize('faculty', 'student', 'admin', 'superadmin', 'super_admin'), assignmentController.list);

// Student submit assignment with file or notes
router.post('/:id/submit', authorize('student', 'admin', 'superadmin', 'super_admin'), uploadAssignmentFile, assignmentController.submitAssignment);

// Detail
router.get('/:id', authorize('faculty', 'student', 'admin', 'superadmin', 'super_admin'), assignmentController.detail);
// Update – faculty who created or admin/super_admin
router.patch('/:id', authorize('faculty', 'admin', 'superadmin', 'super_admin'), assignmentController.update);
// Delete – admin only
router.delete('/:id', authorize('admin', 'superadmin', 'super_admin'), assignmentController.remove);

module.exports = router;
