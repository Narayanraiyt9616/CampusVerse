const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getStudentExams,
  getAttendanceReport,
  getAcademicProgressReport,
} = require('../controllers/studentController');
const {
  validateCreateStudent,
  validateUpdateStudent,
} = require('../validators/studentValidator');
const devOnlyMiddleware = require('../middleware/devOnlyMiddleware');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Student Notifications
router.get('/notifications', auth, authorize('student'), getMyNotifications);
router.patch('/notifications/read-all', auth, authorize('student'), markAllNotificationsRead);
router.patch('/notifications/:id/read', auth, authorize('student'), markNotificationRead);

// GET /api/students/exams – authenticated student fetches published examination schedules
router.get('/exams', auth, authorize('student', 'faculty', 'admin', 'superadmin', 'super_admin'), getStudentExams);

// GET /api/students/attendance-report – authenticated student/parent fetches real attendance report
router.get('/attendance-report', auth, authorize('student', 'parent', 'faculty', 'admin', 'superadmin', 'super_admin'), getAttendanceReport);

// GET /api/students/academic-progress – authenticated student/parent fetches complete academic progress report
router.get('/academic-progress', auth, authorize('student', 'parent', 'faculty', 'admin', 'superadmin', 'super_admin'), getAcademicProgressReport);

// GET /api/students/me – authenticated student fetches their own profile
router.get('/me', auth, authorize('student'), getMyProfile);

// PATCH /api/students/me – authenticated student updates their own editable fields
router.patch('/me', auth, authorize('student'), updateMyProfile);

// GET /api/students
router.get('/', getStudents);

// GET /api/students/:id
router.get('/:id', getStudentById);

// POST /api/students (Development write restricted)
router.post('/', devOnlyMiddleware, validateCreateStudent, createStudent);

// PATCH /api/students/:id (Development write restricted)
router.patch('/:id', devOnlyMiddleware, validateUpdateStudent, updateStudent);

// DELETE /api/students/:id (Development write restricted)
router.delete('/:id', devOnlyMiddleware, deleteStudent);

module.exports = router;
