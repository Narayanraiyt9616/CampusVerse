const express = require('express');
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
} = require('../controllers/departmentController');
const {
  validateCreateDepartment,
  validateUpdateDepartment,
} = require('../validators/departmentValidator');
const devOnlyMiddleware = require('../middleware/devOnlyMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// GET /api/departments
router.get('/', getDepartments);

// GET /api/departments/:id
router.get('/:id', getDepartmentById);

// POST /api/departments (Development write restricted)
router.post('/', devOnlyMiddleware, validateCreateDepartment, createDepartment);

// PATCH /api/departments/:id (Development write restricted)
router.patch('/:id', devOnlyMiddleware, validateUpdateDepartment, updateDepartment);

module.exports = router;
