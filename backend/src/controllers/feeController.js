const mongoose = require('mongoose');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { getDBStatus } = require('../config/db');

const checkDB = (res) => {
  if (getDBStatus().status !== 'connected') {
    res.status(503).json({ success: false, error: { code: 'DATABASE_UNAVAILABLE', message: 'Database unavailable.' } });
    return false;
  }
  return true;
};

// GET /api/fees - list fees (admin sees all, student sees own)
exports.listFees = async (req, res, next) => {
  try {
    if (!checkDB(res)) return;
    const { student, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'student') {
      // Students can only see their own fees
      const studentDoc = await Student.findOne({ email: req.user.email });
      if (!studentDoc) {
        return res.status(404).json({ success: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Student profile not found.' } });
      }
      filter.student = studentDoc._id;
    } else {
      if (student) filter.student = student;
    }

    if (status) filter.status = status;

    const total = await Fee.countDocuments(filter);
    const data = await Fee.find(filter)
      .populate('student', 'studentId name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ success: true, meta: { total, page: Number(page), limit: Number(limit) }, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/fees/:id
exports.getFee = async (req, res, next) => {
  try {
    if (!checkDB(res)) return;
    const fee = await Fee.findById(req.params.id).populate('student', 'studentId name email').populate('createdBy', 'name email');
    if (!fee) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });

    // Student can only view own fee
    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ email: req.user.email });
      if (!studentDoc || fee.student._id.toString() !== studentDoc._id.toString()) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
      }
    }
    res.json({ success: true, data: fee });
  } catch (err) {
    next(err);
  }
};

// POST /api/fees - create (admin only)
exports.createFee = async (req, res, next) => {
  try {
    if (!checkDB(res)) return;
    const { student, invoiceNumber, category, description, amount, dueDate, semester, academicYear, remarks } = req.body;

    if (!student || !invoiceNumber || !category || !amount || !dueDate) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'student, invoiceNumber, category, amount, dueDate are required.' } });
    }

    const studentDoc = await Student.findById(student);
    if (!studentDoc) return res.status(400).json({ success: false, error: { code: 'INVALID_STUDENT' } });

    const fee = await Fee.create({
      student, invoiceNumber, category, description, amount,
      dueDate: new Date(dueDate), semester, academicYear, remarks,
      createdBy: req.user._id,
    });

    await fee.populate('student', 'studentId name email');
    res.status(201).json({ success: true, data: fee, message: 'Fee invoice created.' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, error: { code: 'DUPLICATE', message: 'Invoice number already exists.' } });
    next(err);
  }
};

// PATCH & PUT /api/fees/:id - update (admin updates status, payment details, amount, category, dates, etc.)
exports.updateFee = async (req, res, next) => {
  try {
    if (!checkDB(res)) return;
    const { id } = req.params;
    const {
      status,
      paidAmount,
      paymentDate,
      paymentMode,
      receiptNumber,
      remarks,
      amount,
      dueDate,
      category,
      description,
      semester,
      academicYear,
    } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fee record not found.' } });

    // Validate amounts
    if (amount !== undefined) {
      const numAmt = Number(amount);
      if (isNaN(numAmt) || numAmt < 0) {
        return res.status(400).json({ success: false, error: { message: 'Invoiced amount must be a non-negative number.' } });
      }
      fee.amount = numAmt;
    }

    if (paidAmount !== undefined) {
      const numPaid = Number(paidAmount);
      if (isNaN(numPaid) || numPaid < 0) {
        return res.status(400).json({ success: false, error: { message: 'Paid amount must be a non-negative number.' } });
      }
      fee.paidAmount = numPaid;
    }

    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, error: { message: 'Invalid due date format.' } });
      }
      fee.dueDate = parsedDate;
    }

    if (category !== undefined) fee.category = category;
    if (description !== undefined) fee.description = description;
    if (paymentMode !== undefined) fee.paymentMode = paymentMode;
    if (receiptNumber !== undefined) fee.receiptNumber = receiptNumber;
    if (remarks !== undefined) fee.remarks = remarks;
    if (semester !== undefined) fee.semester = Number(semester);
    if (academicYear !== undefined) fee.academicYear = String(academicYear).trim();

    if (paymentDate !== undefined) {
      fee.paymentDate = paymentDate ? new Date(paymentDate) : null;
    }

    // Status logic: if explicitly provided, honor it; otherwise if paidAmount >= amount, mark as Paid
    if (status !== undefined) {
      fee.status = status;
    } else if (fee.paidAmount >= fee.amount && fee.amount > 0) {
      fee.status = 'Paid';
    } else if (fee.paidAmount < fee.amount && fee.status === 'Paid') {
      fee.status = 'Pending';
    }

    await fee.save();
    await fee.populate('student', 'studentId name email department semester');

    return res.json({
      success: true,
      data: fee,
      fee,
      message: 'Fee invoice updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/fees/:id - admin only
exports.deleteFee = async (req, res, next) => {
  try {
    if (!checkDB(res)) return;
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    res.json({ success: true, message: 'Fee invoice deleted.' });
  } catch (err) {
    next(err);
  }
};
