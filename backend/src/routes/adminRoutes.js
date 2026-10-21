const express = require('express');
const admin = require('../controllers/adminController');
const { listFees, getFee, createFee, updateFee, deleteFee } = require('../controllers/feeController');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Enforce server-side role check: Only admin and superadmin can access admin management APIs
router.use(authorizeRoles('admin', 'superadmin'));

// 1. Admin Telemetry & Statistics
router.get('/stats', admin.getAdminStats);

// 2. User & Credential Management
router.get('/users', admin.getUsers);
router.post('/users', admin.createUser);
router.get('/users/:id', admin.getUserById);
router.patch('/users/:id', admin.updateUser);
router.patch('/users/:id/status', admin.updateUserStatus);
router.post('/credentials', admin.createCredentials);
router.post('/users/:id/reset-password', admin.resetUserPassword);
router.post('/users/:id/force-password-change', admin.forcePasswordChange);
router.get('/audit-logs', admin.getAuditLogs);

// 3. Student Management
router.get('/students', admin.adminGetStudents);
router.post('/students', admin.adminCreateStudent);
router.patch('/students/:id', admin.adminUpdateStudent);
router.delete('/students/:id', admin.adminDeleteStudent);

// 4. Faculty Management
router.get('/faculty', admin.adminGetFaculty);
router.post('/faculty', admin.adminCreateFaculty);
router.patch('/faculty/:id', admin.adminUpdateFaculty);
router.delete('/faculty/:id', admin.adminDeleteFaculty);

// 5. Academic Management (Departments & Courses)
router.get('/departments', admin.adminGetDepartments);
router.post('/departments', admin.adminCreateDepartment);
router.patch('/departments/:id', admin.adminUpdateDepartment);
router.delete('/departments/:id', admin.adminDeleteDepartment);

router.get('/courses', admin.adminGetCourses);
router.post('/courses', admin.adminCreateCourse);
router.patch('/courses/:id', admin.adminUpdateCourse);
router.delete('/courses/:id', admin.adminDeleteCourse);

// 6. Attendance Management & Shortage Detection
router.get('/attendance', admin.adminGetAttendance);
router.get('/attendance/shortages', admin.adminGetAttendanceShortages);
router.patch('/attendance/:id/records/:recordId', admin.adminCorrectAttendance);

// 7. Assignments, Examinations & Results
router.get('/assignments', admin.adminGetAssignments);

router.get('/exams', admin.adminGetExams);
router.post('/exams', admin.adminCreateExam);
router.patch('/exams/:id', admin.adminUpdateExam);
router.delete('/exams/:id', admin.adminDeleteExam);

router.get('/results', admin.adminGetResults);
router.post('/results', admin.adminCreateResult);
router.patch('/results/:id', admin.adminUpdateResult);
router.patch('/results/:id/publish', admin.adminTogglePublishResult);
router.delete('/results/:id', admin.adminDeleteResult);

// 8. Fee Management
router.get('/fees/summary', admin.adminGetFeeSummary);
router.get('/fees', listFees);
router.get('/fees/:id', getFee);
router.post('/fees', createFee);
router.patch('/fees/:id', updateFee);
router.delete('/fees/:id', deleteFee);

// 9. Timetable, Notices & Leave Approvals
router.get('/timetables', admin.adminGetTimetables);
router.post('/timetables', admin.adminCreateTimetable);
router.delete('/timetables/:id', admin.adminDeleteTimetable);

router.get('/notices', admin.adminGetNotices);
router.post('/notices', admin.adminCreateNotice);
router.patch('/notices/:id', admin.adminUpdateNotice);
router.delete('/notices/:id', admin.adminDeleteNotice);

router.get('/leaves', admin.adminGetLeaves);
router.patch('/leaves/:id/status', admin.adminUpdateLeaveStatus);

// 10. Reports & System Settings
router.get('/reports', admin.adminGetReportData);
router.get('/settings', admin.adminGetSystemSettings);

module.exports = router;
