const express = require('express');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
} = require('../controllers/courseController');
const {
  validateCreateCourse,
  validateUpdateCourse,
} = require('../validators/courseValidator');
const devOnlyMiddleware = require('../middleware/devOnlyMiddleware');

const router = express.Router();

// GET /api/courses
router.get('/', getCourses);

// GET /api/courses/:id
router.get('/:id', getCourseById);

// POST /api/courses (Development write restricted)
router.post('/', devOnlyMiddleware, validateCreateCourse, createCourse);

// PATCH /api/courses/:id (Development write restricted)
router.patch('/:id', devOnlyMiddleware, validateUpdateCourse, updateCourse);

module.exports = router;
