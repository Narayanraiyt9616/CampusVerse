const jwt = require('jsonwebtoken');
const User = require('../models/User');

const COOKIE_NAME = 'token';

// Authentication middleware – verifies JWT from cookie or Authorization header
async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ success: false, error: 'Server misconfiguration.' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid session.' });
    if (user.status !== 'active') return res.status(403).json({ success: false, error: 'Account disabled.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
  }
  next();
}

authenticate.requireAuth = requireAuth;
module.exports = authenticate;
