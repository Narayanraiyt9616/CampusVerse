const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../../uploads/admit-cards');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const rawSid = req.body.studentId ? String(req.body.studentId).replace(/[^a-zA-Z0-9_-]/g, '') : 'STUDENT';
    const timestamp = Date.now();
    const cleanOrig = path.basename(file.originalname, path.extname(file.originalname)).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `admit-card-${rawSid}-${timestamp}-${cleanOrig}.pdf`);
  },
});

// File filter: Strictly PDF only
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimePdf = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';
  if (ext !== '.pdf' || !isMimePdf) {
    const error = new Error('Invalid file type: Only official PDF documents (.pdf) are accepted.');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// Multer upload instance: max 10MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
});

module.exports = {
  uploadAdmitCard: upload.single('pdfFile'),
  UPLOAD_DIR,
};
