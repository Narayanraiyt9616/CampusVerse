/**
 * CampusVerse AI - Student Bus Pass & Transport Fee PDF Generator
 * Generates a 100% valid, printable, self-contained PDF 1.4 binary buffer.
 */

function escapePdfText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Generates a valid PDF buffer for an official Student Bus Pass.
 * @param {Object} data
 * @returns {Buffer} Valid PDF binary buffer
 */
function generateBusPassPdfBuffer(data) {
  const {
    passNumber = 'TP-2026-0001',
    studentId = 'CS21B1001',
    studentName = 'Student Name',
    departmentName = 'Computer Science & Engineering',
    semester = 7,
    routeNumber = 'Route 1',
    routeName = 'Metro Corridor Shuttle',
    pickupStop = 'Indiranagar 100ft Junction',
    dropStop = 'Campus Main Gate Terminal',
    vehicleNumber = 'KA-05-EX-4412',
    validFrom = new Date(),
    validTill = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    status = 'Active',
    feeStatus = 'PAID - FULL SEMESTER',
  } = data;

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '30 Jun 2027';
    }
  };

  const validFromStr = formatDate(validFrom);
  const validTillStr = formatDate(validTill);
  const issuedDateStr = formatDate(new Date());

  // Build stream content using standard PDF operators (A4 page: 595 x 842 pt)
  let s = '';

  // Outer framing & margins
  s += 'q\n';

  // Outer gold decorative border (D99A00 -> 0.85 0.60 0.00 rgb)
  s += '0.85 0.60 0.00 RG 2.5 w\n';
  s += '25 25 545 792 re S\n';

  // Inner boundary hairline border
  s += '0.15 0.20 0.25 RG 0.75 w\n';
  s += '30 30 535 782 re S\n';

  // Header Banner Background (Deep Charcoal/Navy 0.07 0.09 0.15)
  s += '0.07 0.09 0.15 rg\n';
  s += '32 725 531 85 re f\n';

  // University Header Brand
  s += 'BT\n';
  s += '/F1 18 Tf\n';
  s += '1 1 1 rg\n';
  s += '145 782 Td\n';
  s += '(' + escapePdfText('CAMPUSVERSE UNIVERSITY') + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F1 10 Tf\n';
  s += '0.85 0.60 0.00 rg\n';
  s += '142 764 Td\n';
  s += '(' + escapePdfText('DIRECTORATE OF CAMPUS TRANSIT & COMMUTER LOGISTICS') + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 13 Tf\n';
  s += '1 1 1 rg\n';
  s += '148 740 Td\n';
  s += '(' + escapePdfText('OFFICIAL STUDENT BUS PASS & TRANSIT RECEIPT') + ') Tj\n';
  s += 'ET\n';

  // Subheader banner: Pass Number & Fee Status Strip
  s += '0.98 0.95 0.88 rg\n';
  s += '32 695 531 24 re f\n';
  s += '0.85 0.60 0.00 RG 1 w\n';
  s += '32 695 531 24 re S\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '45 703 Td\n';
  s += '(' + escapePdfText('PASS ID: ' + passNumber.toUpperCase() + '   |   STATUS: ' + status.toUpperCase() + '   |   TRANSPORT FEE: ' + feeStatus.toUpperCase()) + ') Tj\n';
  s += 'ET\n';

  // 1. Student Identification Card Block
  s += '0.98 0.98 0.98 rg\n';
  s += '40 575 515 110 re f\n';
  s += '0.80 0.80 0.80 RG 1 w\n';
  s += '40 575 515 110 re S\n';

  // Title of Student Details
  s += '0.85 0.60 0.00 rg\n';
  s += '40 665 515 20 re f\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '1 1 1 rg\n';
  s += '50 671 Td\n';
  s += '(' + escapePdfText('STUDENT COMMUTER CREDENTIALS') + ') Tj\n';
  s += 'ET\n';

  // Student Fields
  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '55 645 Td\n';
  s += '(' + escapePdfText('Student Name:') + ') Tj\n';
  s += '130 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(studentName) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '330 645 Td\n';
  s += '(' + escapePdfText('Roll / Student ID:') + ') Tj\n';
  s += '110 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(studentId) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '55 620 Td\n';
  s += '(' + escapePdfText('Academic Program:') + ') Tj\n';
  s += '130 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(departmentName) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '330 620 Td\n';
  s += '(' + escapePdfText('Current Semester:') + ') Tj\n';
  s += '110 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText('Semester ' + semester) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '55 595 Td\n';
  s += '(' + escapePdfText('Issued Date:') + ') Tj\n';
  s += '130 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(issuedDateStr) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '330 595 Td\n';
  s += '(' + escapePdfText('Pass Validity Period:') + ') Tj\n';
  s += '110 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(validFromStr + ' - ' + validTillStr) + ') Tj\n';
  s += 'ET\n';

  // 2. Transit Corridor & Assigned Fleet Block
  s += '0.98 0.98 0.98 rg\n';
  s += '40 415 515 145 re f\n';
  s += '0.80 0.80 0.80 RG 1 w\n';
  s += '40 415 515 145 re S\n';

  // Title of Transit Corridor
  s += '0.07 0.09 0.15 rg\n';
  s += '40 535 515 25 re f\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '1 1 1 rg\n';
  s += '50 543 Td\n';
  s += '(' + escapePdfText('ASSIGNED TRANSIT ROUTE & BOARDING ALLOCATION') + ') Tj\n';
  s += 'ET\n';

  // Route Details
  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '55 510 Td\n';
  s += '(' + escapePdfText('Assigned Route:') + ') Tj\n';
  s += '130 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(routeNumber + ': ' + routeName) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '55 485 Td\n';
  s += '(' + escapePdfText('Boarding Stoppage:') + ') Tj\n';
  s += '130 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(pickupStop) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '55 460 Td\n';
  s += '(' + escapePdfText('Destination:') + ') Tj\n';
  s += '130 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(dropStop) + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '55 435 Td\n';
  s += '(' + escapePdfText('Transit Bus / Vehicle:') + ') Tj\n';
  s += '130 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0 0 0 rg\n';
  s += '(' + escapePdfText(vehicleNumber + ' (Designated University Fleet)') + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '330 435 Td\n';
  s += '(' + escapePdfText('Fee Status:') + ') Tj\n';
  s += '90 0 Td\n';
  s += '/F1 10 Tf\n';
  s += '0.05 0.55 0.25 rg\n';
  s += '(' + escapePdfText('VERIFIED / PAID') + ') Tj\n';
  s += 'ET\n';

  // 3. Simulated Barcode & Security Strip
  s += '0.94 0.94 0.94 rg\n';
  s += '40 330 515 70 re f\n';
  s += '0.80 0.80 0.80 RG 1 w\n';
  s += '40 330 515 70 re S\n';

  // Draw simulated barcode vertical bars
  s += '0 0 0 rg\n';
  const barcodeStartX = 70;
  const barcodeY = 350;
  const barcodeH = 36;
  const pattern = [2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 1, 3, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3, 2];
  let curX = barcodeStartX;
  for (let i = 0; i < pattern.length; i++) {
    const barW = pattern[i];
    if (i % 2 === 0) {
      s += `${curX} ${barcodeY} ${barW} ${barcodeH} re f\n`;
    }
    curX += barW + 2;
  }

  // Barcode text
  s += 'BT\n';
  s += '/F2 9 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '70 336 Td\n';
  s += '(' + escapePdfText('VERIFIED DIGITAL COMMUTER TOKEN: ' + passNumber + ' * OFFICIAL ISSUE') + ') Tj\n';
  s += 'ET\n';

  // Security Hologram representation
  s += '0.85 0.60 0.00 RG 1.5 w\n';
  s += '420 340 115 50 re S\n';
  s += '0.99 0.97 0.90 rg\n';
  s += '422 342 111 46 re f\n';
  s += 'BT\n';
  s += '/F2 8 Tf\n';
  s += '0.85 0.60 0.00 rg\n';
  s += '432 372 Td\n';
  s += '(' + escapePdfText('CAMPUSVERSE TRANSIT') + ') Tj\n';
  s += 'ET\n';
  s += 'BT\n';
  s += '/F2 7 Tf\n';
  s += '0.2 0.2 0.2 rg\n';
  s += '434 358 Td\n';
  s += '(' + escapePdfText('SECURITY VALIDATED') + ') Tj\n';
  s += 'ET\n';
  s += 'BT\n';
  s += '/F2 7 Tf\n';
  s += '0.05 0.55 0.25 rg\n';
  s += '444 346 Td\n';
  s += '(' + escapePdfText('SEAL 2026-27') + ') Tj\n';
  s += 'ET\n';

  // 4. Commuter Guidelines & Terms
  s += '0.98 0.98 0.98 rg\n';
  s += '40 155 515 160 re f\n';
  s += '0.80 0.80 0.80 RG 1 w\n';
  s += '40 155 515 160 re S\n';

  s += '0.07 0.09 0.15 rg\n';
  s += '40 290 515 25 re f\n';

  s += 'BT\n';
  s += '/F2 10 Tf\n';
  s += '1 1 1 rg\n';
  s += '50 298 Td\n';
  s += '(' + escapePdfText('STUDENT COMMUTER RULES & INSTRUCTIONS') + ') Tj\n';
  s += 'ET\n';

  const rules = [
    '1. This digital bus pass is non-transferable and must be presented to the bus conductor / transit marshal upon boarding.',
    '2. The student is authorized to commute exclusively on the assigned route (' + routeNumber + ') and designated boarding stoppage.',
    '3. Students must arrive at the scheduled pickup point at least 5 minutes prior to the designated departure timetable.',
    '4. Strict discipline, courteous behavior, and adherence to safety guidelines are mandatory while on university transit vehicles.',
    '5. Misuse of the bus pass or tampering with digital credentials will result in immediate suspension of transportation privileges.',
    '6. In case of route changes or relocation, submit a change request through the Hostel & Transport Operations Desk.',
  ];

  let ruleY = 272;
  for (const r of rules) {
    s += 'BT\n';
    s += '/F1 8 Tf\n';
    s += '0.2 0.2 0.2 rg\n';
    s += `50 ${ruleY} Td\n`;
    s += '(' + escapePdfText(r) + ') Tj\n';
    s += 'ET\n';
    ruleY -= 20;
  }

  // 5. Signatures and Official Seals
  s += '0.2 0.2 0.2 RG 0.75 w\n';
  s += '60 75 160 0.75 re S\n'; // Signature line 1
  s += '375 75 160 0.75 re S\n'; // Signature line 2

  s += 'BT\n';
  s += '/F2 9 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '85 62 Td\n';
  s += '(' + escapePdfText('Transport Operations Officer') + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F2 9 Tf\n';
  s += '0.1 0.1 0.1 rg\n';
  s += '395 62 Td\n';
  s += '(' + escapePdfText('Chief Warden / Estate Officer') + ') Tj\n';
  s += 'ET\n';

  s += 'BT\n';
  s += '/F1 8 Tf\n';
  s += '0.4 0.4 0.4 rg\n';
  s += '180 40 Td\n';
  s += '(' + escapePdfText('CampusVerse University - Directorate of Campus Transit & Residential Estate') + ') Tj\n';
  s += 'ET\n';

  s += 'Q\n';

  // Construct PDF structure
  const contentStream = s;
  const contentLen = Buffer.byteLength(contentStream, 'latin1');

  let pdf = '%PDF-1.4\n';
  const offsets = [];

  // Obj 1: Catalog
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';

  // Obj 2: Pages
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';

  // Obj 3: Page
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources 5 0 R >>\nendobj\n';

  // Obj 4: Content Stream
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += `4 0 obj\n<< /Length ${contentLen} >>\nstream\n` + contentStream + '\nendstream\nendobj\n';

  // Obj 5: Resources (Fonts)
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += '5 0 obj\n<< /Font << /F1 6 0 R /F2 7 0 R >> >>\nendobj\n';

  // Obj 6: Font Helvetica
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  // Obj 7: Font Helvetica-Bold
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += '7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';

  // Xref table
  const startXref = Buffer.byteLength(pdf, 'latin1');
  pdf += 'xref\n0 8\n';
  pdf += '0000000000 65535 f \n';
  for (const off of offsets) {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 8 /Root 1 0 R >>\n';
  pdf += 'startxref\n' + startXref + '\n%%EOF\n';

  return Buffer.from(pdf, 'latin1');
}

module.exports = {
  generateBusPassPdfBuffer,
};
