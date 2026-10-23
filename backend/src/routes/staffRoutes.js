const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authorizeRoles = require('../middleware/roleMiddleware');

// All staff endpoints require staff, hostel, admin, or superadmin credentials
const requireStaff = authorizeRoles('staff', 'hostel', 'admin', 'superadmin');

// 1. Dashboard
router.get('/dashboard', requireStaff, staffController.getStaffDashboard);

// 2. Hostel Management
router.get('/hostel/rooms', requireStaff, staffController.getHostelRooms);
router.post('/hostel/rooms', requireStaff, staffController.createHostelRoom);
router.put('/hostel/rooms/:id', requireStaff, staffController.updateHostelRoom);

router.get('/hostel/allocations', requireStaff, staffController.getHostelAllocations);
router.post('/hostel/allocate', requireStaff, staffController.allocateHostelBed);
router.put('/hostel/vacate/:id', requireStaff, staffController.vacateHostelBed);

// 3. Transport Management
router.get('/transport/vehicles', requireStaff, staffController.getTransportVehicles);
router.post('/transport/vehicles', requireStaff, staffController.createTransportVehicle);
router.put('/transport/vehicles/:id', requireStaff, staffController.updateTransportVehicle);

router.get('/transport/routes', requireStaff, staffController.getTransportRoutes);
router.post('/transport/routes', requireStaff, staffController.createTransportRoute);
router.put('/transport/routes/:id', requireStaff, staffController.updateTransportRoute);

router.get('/transport/allocations', requireStaff, staffController.getTransportAllocations);
router.post('/transport/allocate', requireStaff, staffController.allocateTransportPass);
router.get('/transport/passes/:id/pdf', requireStaff, staffController.downloadBusPassPdf);
router.get('/transport/passes/:id/preview', requireStaff, staffController.previewBusPassPdf);

// 4. Student Records
router.get('/students', requireStaff, staffController.getStaffStudentRecords);

// 5. Complaints & Notices
router.get('/complaints', requireStaff, staffController.getStaffComplaints);
router.post('/complaints', requireStaff, staffController.createStaffComplaint);
router.put('/complaints/:id', requireStaff, staffController.updateStaffComplaint);

router.get('/notices', requireStaff, staffController.getStaffNotices);
router.post('/notices', requireStaff, staffController.createStaffNotice);

module.exports = router;
