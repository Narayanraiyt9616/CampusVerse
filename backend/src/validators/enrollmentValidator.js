// validators/enrollmentValidator.js
const { body, validationResult } = require('express-validator');

const validateCreateEnrollment = [
  body('student')
    .exists().withMessage('Student reference is required')
    .isMongoId().withMessage('Student must be a valid ObjectId'),
  body('course')
    .exists().withMessage('Course reference is required')
    .isMongoId().withMessage('Course must be a valid ObjectId'),
  body('semester')
    .exists().withMessage('Semester is required')
    .isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
  // status optional, defaults in model
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() },
      });
    }
    next();
  },
];

const validateUpdateEnrollment = [
  body('student')
    .optional()
    .isMongoId().withMessage('Student must be a valid ObjectId'),
  body('course')
    .optional()
    .isMongoId().withMessage('Course must be a valid ObjectId'),
  body('semester')
    .optional()
    .isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
  body('status')
    .optional()
    .isIn(['Enrolled', 'Completed', 'Withdrawn']).withMessage('Invalid status'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: errors.array() },
      });
    }
    next();
  },
];

module.exports = { validateCreateEnrollment, validateUpdateEnrollment };
