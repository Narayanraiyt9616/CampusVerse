const express = require('express');
const router = express.Router();
const fc = require('../controllers/facultyController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require auth; faculty-specific guard below
const requireFaculty = (req, res, next) => {
  if (req.user.role !== 'faculty' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, error: 'Faculty access required.' });
  }
  next();
};

// ── Profile
router.get('/me', fc.getMyProfile);
router.patch('/me', fc.updateMyProfile);

// ── Student Management
router.get('/students', requireFaculty, fc.getAssignedStudents);
router.get('/students/:id', requireFaculty, fc.getStudentProfile);

// ── Attendance
router.get('/attendance', requireFaculty, fc.getAttendanceRecords);
router.post('/attendance', requireFaculty, fc.markAttendance);
router.patch('/attendance/:id', requireFaculty, fc.editAttendance);

// ── Assignments
router.get('/assignments', requireFaculty, fc.getMyAssignments);
router.post('/assignments', requireFaculty, fc.createAssignment);
router.get('/assignments/:assignmentId/submissions', requireFaculty, fc.getSubmissions);
router.patch('/submissions/:id/feedback', requireFaculty, fc.giveFeedback);

// ── Exams
router.get('/exams', requireFaculty, fc.getMyExams);
router.post('/exams', requireFaculty, fc.scheduleExam);
router.patch('/exams/:id', requireFaculty, fc.updateExam);

// ── Results
router.get('/results', requireFaculty, fc.getMyResults);
router.post('/results', requireFaculty, fc.enterResult);
router.patch('/results/:id', requireFaculty, fc.updateResult);

// ── Timetable
router.get('/timetable', requireFaculty, fc.getMyTimetable);

// ── Leave
router.get('/leaves', requireFaculty, fc.getMyLeaves);
router.post('/leaves', requireFaculty, fc.applyLeave);
router.delete('/leaves/:id', requireFaculty, fc.cancelLeave);

// ── Notices
router.get('/notices', fc.getNotices);
router.post('/notices', requireFaculty, fc.createNotice);

module.exports = router;
