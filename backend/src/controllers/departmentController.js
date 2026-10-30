const mongoose = require('mongoose');
const Department = require('../models/Department');
const { getDBStatus } = require('../config/db');

/**
 * Department Controller
 * Handles CRUD operations for academic departments with pagination and search.
 */

// Helper to check DB readiness
const checkDBReady = (res) => {
  if (getDBStatus().status !== 'connected') {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Database is currently disconnected. Department records cannot be accessed at this time.',
      },
    });
    return false;
  }
  return true;
};

// GET /api/departments
const getDepartments = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {};

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search by name or code
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { code: searchRegex }];
    }

    const [departments, total] = await Promise.all([
      Department.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Department.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: departments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/departments/:id
const getDepartmentById = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { id } = req.params;
    let department;

    if (mongoose.Types.ObjectId.isValid(id)) {
      department = await Department.findById(id);
    } else {
      // Allow searching by unique department code (e.g. 'CSE')
      department = await Department.findOne({ code: id.toUpperCase().trim() });
    }

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Department with identifier "${id}" was not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/departments
const createDepartment = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { name, code, description, status } = req.body;

    const department = new Department({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      status: status || 'Active',
    });

    await department.save();

    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/departments/:id
const updateDepartment = async (req, res, next) => {
  try {
    if (!checkDBReady(res)) return;

    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { code: id.toUpperCase().trim() };

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.code !== undefined) updates.code = req.body.code.trim().toUpperCase();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.status !== undefined) updates.status = req.body.status;

    const department = await Department.findOneAndUpdate(query, updates, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Department with identifier "${id}" was not found.`,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: department,
      message: 'Department updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
};
