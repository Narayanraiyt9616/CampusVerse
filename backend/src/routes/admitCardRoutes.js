const express = require('express');
const router = express.Router();
const admitCard = require('../controllers/admitCardController');
const authorizeRoles = require('../middleware/roleMiddleware');
const { uploadAdmitCard } = require('../middleware/uploadAdmitCardMiddleware');

// 1. Student Portal: Access personal admit cards
router.get('/my-admit-cards', authorizeRoles('student', 'admin', 'superadmin'), admitCard.getMyAdmitCards);

// 2. Admin Portal: List and query admit cards
router.get('/', authorizeRoles('admin', 'superadmin'), admitCard.getAdmitCards);

// 3. Admin Portal: Options metadata for student and exam dropdowns
router.get('/meta/options', authorizeRoles('admin', 'superadmin'), admitCard.getAdmitCardOptions);
router.get('/options', authorizeRoles('admin', 'superadmin'), admitCard.getAdmitCardOptions);

// 4. Detail, in-browser preview & file download (Role checked internally per student)
router.get('/:id', authorizeRoles('student', 'admin', 'superadmin'), admitCard.getAdmitCardById);
router.get('/:id/preview', authorizeRoles('student', 'admin', 'superadmin'), admitCard.previewAdmitCard);
router.get('/:id/download', authorizeRoles('student', 'admin', 'superadmin'), admitCard.downloadAdmitCard);

// 5. Admin Portal: Issue, Reissue, Delete operations
router.post('/issue', authorizeRoles('admin', 'superadmin'), uploadAdmitCard, admitCard.issueAdmitCard);
router.put('/:id/reissue', authorizeRoles('admin', 'superadmin'), uploadAdmitCard, admitCard.reissueAdmitCard);
router.delete('/:id', authorizeRoles('admin', 'superadmin'), admitCard.deleteAdmitCard);

module.exports = router;
