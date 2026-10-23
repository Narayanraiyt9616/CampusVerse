/**
 * CampusVerse AI - Admit Card PDF Generator Utility
 * Produces a 100% valid, printable, self-contained PDF 1.4 binary buffer.
 */

function escapePdfText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Generates a valid PDF buffer for an official CampusVerse AI University Examination Admit Card.
 * @param {Object} data
 * @returns {Buffer} Valid PDF binary buffer
 */
function generateAdmitCardPdfBuffer(data) {
  const {
    studentId = 'CS21B1042',
    studentName = 'Student Name',
    departmentName = 'Computer Science & Engineering',
    semester = 6,
    examTitle = 'End-Semester Examination',
    examSession = 'Spring 2026',
    examDate = 'May 15 - May 30, 2026',
    examSchedule = [],
    remarks = 'Candidate must bring this original admit card along with valid institutional ID.',
  } = data;

  const issueDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const papers = examSchedule && examSchedule.length > 0 ? examSchedule : [
    { subject: 'Distributed Cloud Systems (CS601)', date: '18 May 2026', time: '10:00 AM - 01:00 PM', venue: 'Lecture Hall 302' },
    { subject: 'Advanced Compiler Design (CS602)', date: '21 May 2026', time: '10:00 AM - 01:00 PM', venue: 'Lecture Hall 302' },
    { subject: 'Machine Learning & Neural Nets (CS603)', date: '25 May 2026', time: '10:00 AM - 01:00 PM', venue: 'CS Lab Complex B' },
    { subject: 'Cyber Security & Cryptography (CS604)', date: '28 May 2026', time: '10:00 AM - 01:00 PM', venue: 'Lecture Hall 304' },
  ];

  // Build stream content using standard PDF operators (A4 page: 595 x 842 pt)
  let s = '';

  // Background and borders
  s += 'q\n';
  // Outer gold border (0.85 0.60 0.00 rgb)
  s += '0.85 0.60 0.00 RG 2.5 w\n';
  s += '25 25 545 792 re S\n';
  // Inner hairline border
  s += '0.2 0.2 0.2 RG 0.75 w\n';
  s += '30 30 535 782 re S\n';

  // Header Banner Background (Deep Navy/Charcoal 0.07 0.09 0.15)
  s += '0.07 0.09 0.15 rg\n';
  s += '32 725 531 85 re f\n';

  // University Header Text
  s += 'BT\n';
  s += '/F1 18 Tf\n';
  s += '1 1 1 rg\n';
  s += '140 780 Td\n';
  s += '(' + escapePdfText('CAMPUSVERSE AI UNIVERSITY') + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F1 10 Tf\n';
  s += '0.90 0.75 0.20 rg\n';
  s += '165 762 Td\n';
  s += '(' + escapePdfText('Autonomous Institution - Recognized by UGC & AICTE') + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 13 Tf\n';
  s += '1 1 1 rg\n';
  s += '175 738 Td\n';
  s += '(' + escapePdfText('OFFICIAL EXAMINATION ADMIT CARD') + ') Tj\n';
  s += 'ET\n';

  // Subheader banner: Session & Exam Title
  s += '0.95 0.92 0.85 rg\n';
  s += '32 695 531 24 re f\n';
  s += '0.85 0.60 0.00 RG 1 w\n';
  s += '32 695 531 24 re S\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '45 703 Td\n';
  s += '(' + escapePdfText('EXAMINATION: ' + examTitle.toUpperCase() + ' - SESSION: ' + examSession.toUpperCase()) + ') Tj\n';
  s += 'ET\n';

  // Candidate Details Section Box
  s += '0.98 0.98 0.98 rg\n';
  s += '40 570 515 115 re f\n';
  s += '0.80 0.80 0.80 RG 1 w\n';
  s += '40 570 515 115 re S\n';

  // Candidate Photo Frame Placeholder
  s += '0.90 0.90 0.90 rg\n';
  s += '450 580 95 95 re f\n';
  s += '0.6 0.6 0.6 RG 1 w\n';
  s += '450 580 95 95 re S\n';

  s += 'BT\n';
  s += '/F1 9 Tf\n';
  s += '0.4 0.4 0.4 rg\n';
  s += '465 635 Td\n';
  s += '(' + escapePdfText('OFFICIAL') + ') Tj\n';
  s += '0 -14 Td\n';
  s += '(' + escapePdfText('CANDIDATE') + ') Tj\n';
  s += '0 -14 Td\n';
  s += '(' + escapePdfText('PHOTO / SEAL') + ') Tj\n';
  s += 'ET\n';

  // Candidate details text
  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '55 660 Td\n';
  s += '(' + escapePdfText('Candidate Name:') + ') Tj\n';
  s += '110 0 Td\n';
  s += '/F1 11 Tf\n';
  s += '(' + escapePdfText(studentName) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '55 638 Td\n';
  s += '(' + escapePdfText('Student ID / Roll No:') + ') Tj\n';
  s += '110 0 Td\n';
  s += '/F2 11 Tf\n';
  s += '0.85 0.50 0.00 rg\n';
  s += '(' + escapePdfText(studentId) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '55 616 Td\n';
  s += '(' + escapePdfText('Department / Program:') + ') Tj\n';
  s += '110 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '(' + escapePdfText(departmentName) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '55 594 Td\n';
  s += '(' + escapePdfText('Semester & Batch:') + ') Tj\n';
  s += '110 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '(' + escapePdfText('Semester ' + semester + ' (Regular)') + ') Tj\n';
  s += '120 0 Td\n';
  s += '/F2 10 Tf\n';
  s += '(' + escapePdfText('Issue Date: ') + ') Tj\n';
  s += '60 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '(' + escapePdfText(issueDateStr) + ') Tj\n';
  s += 'ET\n';

  // Section: Examination Paper Schedule
  s += 'BT\n';
  s += '/F2 11 Tf\n';
  s += '0.07 0.09 0.15 rg\n';
  s += '40 545 Td\n';
  s += '(' + escapePdfText('EXAMINATION SCHEDULE & VENUE ALLOCATION') + ') Tj\n';
  s += 'ET\n';

  // Table Header Box
  s += '0.07 0.09 0.15 rg\n';
  s += '40 518 515 20 re f\n';

  s += 'BT\n';
  s += '/F2 9 Tf\n';
  s += '1 1 1 rg\n';
  s += '48 524 Td\n';
  s += '(' + escapePdfText('SN') + ') Tj\n';
  s += '25 0 Td\n';
  s += '(' + escapePdfText('Course Code & Title') + ') Tj\n';
  s += '190 0 Td\n';
  s += '(' + escapePdfText('Date') + ') Tj\n';
  s += '75 0 Td\n';
  s += '(' + escapePdfText('Timing') + ') Tj\n';
  s += '95 0 Td\n';
  s += '(' + escapePdfText('Hall / Seat') + ') Tj\n';
  s += 'ET\n';

  // Table Rows
  let tableY = 498;
  papers.forEach((p, idx) => {
    if (idx % 2 === 0) {
      s += '0.97 0.97 0.97 rg\n';
      s += '40 ' + (tableY - 3) + ' 515 18 re f\n';
    }
    s += '0.85 0.85 0.85 RG 0.5 w\n';
    s += '40 ' + (tableY - 3) + ' 515 18 re S\n';

    s += 'BT\n';
    s += '/F1 8.5 Tf\n';
    s += '0.15 0.15 0.15 rg\n';
    s += '48 ' + (tableY + 2) + ' Td\n';
    s += '(' + escapePdfText(String(idx + 1)) + ') Tj\n';
    s += '25 0 Td\n';
    s += '(' + escapePdfText(p.subject || 'Subject') + ') Tj\n';
    s += '190 0 Td\n';
    s += '(' + escapePdfText(p.date || 'TBA') + ') Tj\n';
    s += '75 0 Td\n';
    s += '(' + escapePdfText(p.time || '10:00 AM') + ') Tj\n';
    s += '95 0 Td\n';
    s += '(' + escapePdfText(p.venue || 'Main Block') + ') Tj\n';
    s += 'ET\n';

    tableY -= 19;
  });

  // Important Candidate Instructions Box
  const instY = Math.min(tableY - 15, 380);
  s += '0.99 0.98 0.95 rg\n';
  s += '40 ' + (instY - 110) + ' 515 115 re f\n';
  s += '0.85 0.60 0.00 RG 1 w\n';
  s += '40 ' + (instY - 110) + ' 515 115 re S\n';

  s += 'BT\n';
  s += '/F2 9.5 Tf\n';
  s += '0.85 0.50 0.00 rg\n';
  s += '50 ' + (instY - 12) + ' Td\n';
  s += '(' + escapePdfText('IMPORTANT INSTRUCTIONS TO CANDIDATE') + ') Tj\n';
  s += 'ET\n';

  const instructions = [
    '1. The Admit Card must be presented at the examination venue along with the official Student ID Card.',
    '2. Candidates must occupy their allotted seats at least 20 minutes before the commencement of the exam.',
    '3. Possession of mobile phones, smartwatches, programmable calculators, or study material is strictly prohibited.',
    '4. Verify all subject codes and titles. Any discrepancy must be reported immediately to the Examination Cell.',
    '5. Note from Dean: ' + remarks,
  ];

  let lineY = instY - 28;
  instructions.forEach((ins) => {
    s += 'BT\n';
    s += '/F1 8 Tf\n';
    s += '0.2 0.2 0.2 rg\n';
    s += '50 ' + lineY + ' Td\n';
    s += '(' + escapePdfText(ins) + ') Tj\n';
    s += 'ET\n';
    lineY -= 14;
  });

  // Signatures Section
  const sigY = instY - 155;
  // Line for candidate
  s += '0.4 0.4 0.4 RG 1 w\n';
  s += '60 ' + sigY + ' 150 0 re S\n';
  s += 'BT\n';
  s += '/F1 8.5 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '75 ' + (sigY - 14) + ' Td\n';
  s += '(' + escapePdfText('Signature of the Candidate') + ') Tj\n';
  s += 'ET\n';

  // Line for Invigilator
  s += '225 ' + sigY + ' 145 0 re S\n';
  s += 'BT\n';
  s += '/F1 8.5 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '240 ' + (sigY - 14) + ' Td\n';
  s += '(' + escapePdfText("Invigilator's Signature") + ') Tj\n';
  s += 'ET\n';

  // Line for Controller of Examinations
  s += '390 ' + sigY + ' 145 0 re S\n';
  s += 'BT\n';
  s += '/F2 8.5 Tf\n';
  s += '0.07 0.09 0.15 rg\n';
  s += '405 ' + (sigY - 14) + ' Td\n';
  s += '(' + escapePdfText('Controller of Examinations') + ') Tj\n';
  s += 'ET\n';

  // Barcode / Verification Stamp Strip at bottom
  s += '0.07 0.09 0.15 rg\n';
  s += '32 32 531 20 re f\n';
  s += 'BT\n';
  s += '/F1 8 Tf\n';
  s += '1 1 1 rg\n';
  s += '45 38 Td\n';
  s += '(' + escapePdfText('AUTHENTICATED BY CAMPUSVERSE AI RBAC ENGINE - HASH: CV-AC-' + studentId + '-' + Date.now().toString(36).toUpperCase()) + ') Tj\n';
  s += 'ET\n';

  s += 'Q\n';

  // Stream length calculation
  const streamLength = Buffer.byteLength(s, 'utf-8');

  // Build the complete PDF document
  const pdfParts = [];
  const offsets = [];

  const addPart = (str) => {
    offsets.push(pdfParts.reduce((acc, p) => acc + Buffer.byteLength(p, 'utf-8'), 0));
    pdfParts.push(str);
  };

  // Header
  pdfParts.push('%PDF-1.4\n');

  // Obj 1: Catalog
  addPart('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Obj 2: Pages
  addPart('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Obj 3: Page
  addPart(
    '3 0 obj\n' +
    '<< /Type /Page\n' +
    '   /Parent 2 0 R\n' +
    '   /MediaBox [0 0 595 842]\n' +
    '   /Contents 4 0 R\n' +
    '   /Resources <<\n' +
    '     /Font <<\n' +
    '       /F1 5 0 R\n' +
    '       /F2 6 0 R\n' +
    '     >>\n' +
    '   >>\n' +
    '>>\nendobj\n'
  );

  // Obj 4: Content Stream
  addPart('4 0 obj\n<< /Length ' + streamLength + ' >>\nstream\n' + s + '\nendstream\nendobj\n');

  // Obj 5: Helvetica Normal Font
  addPart('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // Obj 6: Helvetica-Bold Font
  addPart('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

  // XRef Table
  const startXref = pdfParts.reduce((acc, p) => acc + Buffer.byteLength(p, 'utf-8'), 0);
  let xref = 'xref\n0 7\n0000000000 65535 f \n';
  offsets.forEach((off) => {
    xref += String(off).padStart(10, '0') + ' 00000 n \n';
  });

  const trailer =
    'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + startXref + '\n%%EOF\n';

  pdfParts.push(xref);
  pdfParts.push(trailer);

  return Buffer.from(pdfParts.join(''), 'utf-8');
}

module.exports = {
  generateAdmitCardPdfBuffer,
};
