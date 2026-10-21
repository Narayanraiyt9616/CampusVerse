/**
 * Request validation for Department endpoints
 */

const validateCreateDepartment = (req, res, next) => {
  const { name, code, description, status } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Department name is required and must be at least 2 characters.' });
  } else if (name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Department name cannot exceed 100 characters.' });
  }

  if (!code || typeof code !== 'string' || code.trim().length < 2) {
    errors.push({ field: 'code', message: 'Department code is required and must be at least 2 characters.' });
  } else if (code.trim().length > 10) {
    errors.push({ field: 'code', message: 'Department code cannot exceed 10 characters.' });
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a text string.' });
  } else if (description && description.length > 500) {
    errors.push({ field: 'description', message: 'Description cannot exceed 500 characters.' });
  }

  if (status !== undefined && !['Active', 'Inactive'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be either "Active" or "Inactive".' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid department data provided.',
        details: errors,
      },
    });
  }

  next();
};

const validateUpdateDepartment = (req, res, next) => {
  const { name, code, description, status } = req.body;
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Department name must be at least 2 characters.' });
    } else if (name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Department name cannot exceed 100 characters.' });
    }
  }

  if (code !== undefined) {
    if (typeof code !== 'string' || code.trim().length < 2) {
      errors.push({ field: 'code', message: 'Department code must be at least 2 characters.' });
    } else if (code.trim().length > 10) {
      errors.push({ field: 'code', message: 'Department code cannot exceed 10 characters.' });
    }
  }

  if (description !== undefined && typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string.' });
  } else if (description && description.length > 500) {
    errors.push({ field: 'description', message: 'Description cannot exceed 500 characters.' });
  }

  if (status !== undefined && !['Active', 'Inactive'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be either "Active" or "Inactive".' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid department update data provided.',
        details: errors,
      },
    });
  }

  next();
};

module.exports = {
  validateCreateDepartment,
  validateUpdateDepartment,
};
