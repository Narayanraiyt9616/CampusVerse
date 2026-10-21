const express = require('express');
const {
  register,
  login,
  getCurrentUser,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const isTest = process.env.NODE_ENV === 'test';

// Rate limiter for login and sensitive operations
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts, please try again later.' },
});

// Password reset rate limiter
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many password reset requests. Please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', getCurrentUser);
router.post('/logout', authMiddleware, logout);

// Password recovery and update
router.post('/forgot-password', resetLimiter, forgotPassword);
router.post('/reset-password', resetLimiter, resetPassword);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
