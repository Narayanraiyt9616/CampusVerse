const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
} = require('../controllers/studentController');
const {
  validateCreateStudent,
  validateUpdateStudent,
} = require('../validators/studentValidator');
const devOnlyMiddleware = require('../middleware/devOnlyMiddleware');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

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
