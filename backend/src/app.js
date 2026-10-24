const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Auth routes and middleware
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');

// Academic route handlers
const healthRoutes = require('./routes/healthRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');

// Core middlewares
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const { errorMiddleware } = require('./middleware/errorMiddleware');

const createApp = () => {
  const app = express();

  // CORS configuration (credentialed requests)
  const configuredOrigin = process.env.FRONTEND_URL || 'https://campusverse-1-oi4y.onrender.com';
  const allowedOrigins = [
    configuredOrigin,
    'https://campusverse-1-oi4y.onrender.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Parse cookies and request bodies
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Public auth endpoints (no auth required)
  app.use('/api/auth', authRoutes);

  // API root information
  app.get('/api', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'CampusVerse AI - Intelligent University Management REST API Gateway (Part 2 Active)',
      version: '1.0.0-rc1',
      endpoints: {
        health: '/api/health',
        departments: '/api/departments',
        courses: '/api/courses',
        students: '/api/students',
        faculty: '/api/faculty',
        results: '/api/results',
        fees: '/api/fees',
        assignments: '/api/assignments',
        onlineClasses: '/api/online-classes',
        auth: '/api/auth',
      },
      documentation: 'See /docs/architecture-and-roadmap.md for schema and integration details.',
    });
  });

  // Health endpoint (public)
  app.use('/api/health', healthRoutes);

  // Newsletter endpoint (public)
  app.use('/api/newsletter', require('./routes/newsletterRoutes'));

  // Protected academic routes
  app.use('/api/departments', authMiddleware, departmentRoutes);
  app.use('/api/courses', authMiddleware, courseRoutes);
  app.use('/api/students', authMiddleware, studentRoutes);
  app.use('/api/faculty', authMiddleware, facultyRoutes);
  app.use('/api/timetables', authMiddleware, require('./routes/timetableRoutes'));
  app.use('/api/assignments', authMiddleware, require('./routes/assignmentRoutes'));
  app.use('/api/results', authMiddleware, require('./routes/resultRoutes'));
  app.use('/api/fees', authMiddleware, require('./routes/feeRoutes'));
  app.use('/api/admin', authMiddleware, require('./routes/adminRoutes'));
  app.use('/api/superadmin', authMiddleware, require('./routes/superAdminRoutes'));
  app.use('/api/parent', authMiddleware, require('./routes/parentRoutes'));
  app.use('/api/staff', authMiddleware, require('./routes/staffRoutes'));
  app.use('/api/placement', authMiddleware, require('./routes/placementRoutes'));
  app.use('/api/admit-cards', authMiddleware, require('./routes/admitCardRoutes'));
  app.use('/api/search', authMiddleware, require('./routes/searchRoutes'));
  app.use('/api/projects', authMiddleware, require('./routes/projectRoutes'));
  app.use('/api/notifications', authMiddleware, require('./routes/notificationRoutes'));
  app.use('/api/online-classes', authMiddleware, require('./routes/onlineClassRoutes'));

  // Static uploads for assignment files and resumes
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // 404 and error handling
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

module.exports = createApp;
