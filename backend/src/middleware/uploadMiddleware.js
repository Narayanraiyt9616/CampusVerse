const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base upload directories exist
const ASSIGNMENTS_DIR = path.join(__dirname, '../../uploads/assignments');
const RESUMES_DIR = path.join(__dirname, '../../uploads/resumes');

[ASSIGNMENTS_DIR, RESUMES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage engine for assignment submissions
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ASSIGNMENTS_DIR);
  },
  filename: (req, file, cb) => {
    const rawSid = req.user?.username || req.body?.studentId || 'SUBMISSION';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `asgn-${rawSid}-${timestamp}-${cleanName}${ext}`);
  },
});

// Storage engine for resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, RESUMES_DIR);
  },
  filename: (req, file, cb) => {
    const rawSid = req.user?.username || req.body?.studentId || 'STUDENT';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `resume-${rawSid}-${timestamp}-${cleanName}${ext}`);
  },
});

// File filter for assignment files (PDF, DOC, DOCX, ZIP, TXT, images)
const assignmentFileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx', '.zip', '.txt', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    const error = new Error('Invalid file type: Supported formats are PDF, DOC, DOCX, ZIP, TXT, PNG, JPG.');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

// File filter for resumes (PDF, DOC, DOCX)
const resumeFileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    const error = new Error('Invalid file type: Please upload your resume in PDF or Word format (.pdf, .doc, .docx).');
    error.statusCode = 400;
    return cb(error, false);
  }
  cb(null, true);
};

const uploadAssignment = multer({
  storage: assignmentStorage,
  fileFilter: assignmentFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

module.exports = {
  uploadAssignmentFile: uploadAssignment.single('file'),
  uploadResumeFile: uploadResume.single('resume'),
  ASSIGNMENTS_DIR,
  RESUMES_DIR,
};
