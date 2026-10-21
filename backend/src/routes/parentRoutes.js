const express = require('express');
const parent = require('../controllers/parentController');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Role-based protection: Parent, Admin, and SuperAdmin can access
router.use(authorizeRoles('parent', 'admin', 'superadmin'));

router.get('/dashboard', parent.getParentDashboard);
router.get('/student', parent.getParentStudentInfo);
router.get('/attendance-and-results', parent.getParentAttendanceAndResults);
router.get('/assignments-and-timetable', parent.getParentAssignmentsAndTimetable);
router.get('/fees', parent.getParentFees);
router.get('/notices', parent.getParentNotices);
router.get('/wards', parent.getParentWards);

module.exports = router;
