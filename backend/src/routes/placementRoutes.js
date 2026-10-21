const express = require('express');
const router = express.Router();
const placement = require('../controllers/placementController');
const authorizeRoles = require('../middleware/roleMiddleware');

// Role-based protection: Placement Officer, Admin, and SuperAdmin can access
const requirePlacement = authorizeRoles('placement', 'admin', 'superadmin');

// 1. Dashboard
router.get('/dashboard', requirePlacement, placement.getPlacementDashboard);

// 2. Company & Job Management
router.get('/companies', requirePlacement, placement.getCompanies);
router.post('/companies', requirePlacement, placement.createCompany);
router.put('/companies/:id', requirePlacement, placement.updateCompany);

router.get('/drives', requirePlacement, placement.getPlacementDrives);
router.post('/drives', requirePlacement, placement.createPlacementDrive);
router.put('/drives/:id', requirePlacement, placement.updatePlacementDrive);

// 3. Student Management (Profiles, Academic Records, Skills, Résumés, Eligibility)
router.get('/students', requirePlacement, placement.getPlacementStudents);
router.put('/students/:id', requirePlacement, placement.updatePlacementStudentProfile);

// 4. Applications & Recruitment Pipeline
router.get('/applications', requirePlacement, placement.getPlacementApplications);
router.post('/applications', requirePlacement, placement.createPlacementApplication);
router.put('/applications/:id', requirePlacement, placement.updatePlacementApplication);

// 5. Placement Notices & Announcements
router.get('/notices', requirePlacement, placement.getPlacementNotices);
router.post('/notices', requirePlacement, placement.createPlacementNotice);

module.exports = router;
