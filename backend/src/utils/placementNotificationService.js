const Notification = require('../models/Notification');
const PlacementNotice = require('../models/PlacementNotice');
const Student = require('../models/Student');

/**
 * Normalizes text to simplify matching between degrees, departments, and course codes.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if a normalized string contains a keyword as a discrete word/phrase,
 * avoiding partial substring false positives (e.g., 'ce' matching 'science' or 'ece').
 */
const matchesKeyword = (text, keyword) => {
  if (!text || !keyword) return false;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\s)${escaped}(?:$|\\s)`, 'i').test(text);
};

/**
 * Robust course eligibility matcher for students.
 * Matches student's department name, code, roll number prefix, and profile course
 * against an array of eligible course names.
 *
 * @param {Object} student - Populated student document (or plain object with department)
 * @param {Array<string>} eligibleCourses - List of eligible courses selected for the drive
 * @returns {boolean}
 */
const isStudentEligibleForCourse = (student, eligibleCourses) => {
  if (!student) return false;
  if (!eligibleCourses || eligibleCourses.length === 0) return true;

  // If "All Courses" or "All Departments" is selected, all students are eligible
  const hasAll = eligibleCourses.some((c) => {
    const norm = normalizeText(c);
    return norm.includes('all course') || norm.includes('all department') || norm === 'all';
  });
  if (hasAll) return true;

  const deptName = normalizeText(student.department?.name || student.departmentName || '');
  const deptCode = normalizeText(student.department?.code || student.departmentCode || '');
  const studentCourse = normalizeText(student.course || '');
  const rollNo = (student.studentId || '').toUpperCase();

  // Known branch / course mapping dictionary
  const courseKeywords = {
    cse: ['computer science', 'cse', 'computer engineering', 'software engineering'],
    it: ['information technology', 'it', 'info tech'],
    ece: ['electronics and communication', 'ece', 'electronics engineering', 'telecommunication'],
    me: ['mechanical', 'mechanical engineering', 'me'],
    eee: ['electrical', 'electrical and electronics', 'eee'],
    ce: ['civil', 'civil engineering', 'ce'],
    aids: ['artificial intelligence', 'data science', 'ai and ds', 'machine learning'],
    mgmt: ['management', 'mba', 'business administration', 'bba'],
  };

  // Determine which branch categories the student belongs to
  const studentBranches = new Set();

  // 1. Check department name, code, and student course
  for (const [branchKey, keywords] of Object.entries(courseKeywords)) {
    if (
      keywords.some(
        (kw) =>
          matchesKeyword(deptName, kw) ||
          matchesKeyword(deptCode, kw) ||
          matchesKeyword(studentCourse, kw)
      )
    ) {
      studentBranches.add(branchKey);
    }
  }

  // 2. Check roll number prefixes as backup (e.g. CS21..., EC22..., ME23...)
  if (rollNo.startsWith('CS')) studentBranches.add('cse');
  if (rollNo.startsWith('IT')) studentBranches.add('it');
  if (rollNo.startsWith('EC')) studentBranches.add('ece');
  if (rollNo.startsWith('ME')) studentBranches.add('me');
  if (rollNo.startsWith('EE')) studentBranches.add('eee');
  if (rollNo.startsWith('CE')) studentBranches.add('ce');
  if (rollNo.startsWith('AI') || rollNo.startsWith('DS')) studentBranches.add('aids');
  if (rollNo.startsWith('MB')) studentBranches.add('mgmt');

  // Check if any eligible course matches student's identity
  for (const eligibleCourse of eligibleCourses) {
    const normCourse = normalizeText(eligibleCourse);

    // Direct match if course names match or department matches course
    if (deptName && (deptName === normCourse || matchesKeyword(deptName, normCourse) || matchesKeyword(normCourse, deptName))) return true;
    if (studentCourse && (studentCourse === normCourse || matchesKeyword(studentCourse, normCourse) || matchesKeyword(normCourse, studentCourse))) return true;

    // Check branch key mappings
    for (const [branchKey, keywords] of Object.entries(courseKeywords)) {
      const courseMatchesBranch = keywords.some((kw) => matchesKeyword(normCourse, kw));
      if (courseMatchesBranch && studentBranches.has(branchKey)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Synchronizes targeted student notifications in MongoDB whenever a drive is created, updated, or cancelled.
 *
 * @param {Object} drive - PlacementDrive document
 */
const syncDriveNotifications = async (drive) => {
  if (!drive || !drive._id) return;

  try {
    const students = await Student.find({ status: 'Active' }).populate('department', 'name code');

    // Case 1: Drive is cancelled
    if (drive.status === 'Cancelled') {
      await Notification.updateMany(
        { drive: drive._id },
        {
          $set: {
            title: `[CANCELLED] Placement Drive - ${drive.companyName}`,
            message: `The scheduled recruitment drive for ${drive.companyName} (${drive.jobTitle}) has been cancelled.${drive.cancellationReason ? ` Reason: ${drive.cancellationReason}` : ''}`,
            priority: 'Normal',
            'metadata.status': 'Cancelled',
            'metadata.cancellationReason': drive.cancellationReason || '',
          },
        }
      );
      return;
    }

    // Case 2: Drive is scheduled or active
    const eligibleCourseList = Array.isArray(drive.eligibleCourses) && drive.eligibleCourses.length > 0
      ? drive.eligibleCourses
      : drive.eligibilityCriteria?.eligibleCourses || ['All Courses'];

    const driveDateFormatted = drive.driveDate
      ? new Date(drive.driveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'TBA';

    const deadlineFormatted = drive.applicationDeadline
      ? new Date(drive.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'TBA';

    for (const student of students) {
      const eligible = isStudentEligibleForCourse(student, eligibleCourseList);

      if (eligible) {
        // Upsert targeted notification: guarantees no duplicate alerts and updates on rescheduling
        await Notification.findOneAndUpdate(
          { recipient: student._id, drive: drive._id },
          {
            $set: {
              studentId: student.studentId,
              title: 'A new placement opportunity is available for your course!',
              message: `${drive.companyName} is hiring for ${drive.jobTitle} (${drive.jobField || 'Software Development'}). Eligible: ${eligibleCourseList.join(', ')}. Drive Date: ${driveDateFormatted}, Deadline: ${deadlineFormatted}.`,
              category: 'Placement',
              priority: 'High',
              type: 'PLACEMENT_DRIVE',
              metadata: {
                companyName: drive.companyName,
                jobTitle: drive.jobTitle,
                jobField: drive.jobField || 'Software Development',
                eligibleCourses: eligibleCourseList,
                driveDate: drive.driveDate,
                applicationDeadline: drive.applicationDeadline,
                displayPackage: drive.salaryPackage?.displayPackage || 'Competitive Package',
                venue: drive.venue || 'Campus Auditorium',
                status: drive.status || 'Registration Open',
              },
            },
            $setOnInsert: {
              read: false,
              createdAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      } else {
        // Remove existing notification if student is no longer in eligible courses
        await Notification.deleteOne({ recipient: student._id, drive: drive._id });
      }
    }

    // Also sync PlacementNotice for the notice board
    await PlacementNotice.findOneAndUpdate(
      { companyName: drive.companyName, title: { $regex: new RegExp(drive.jobTitle, 'i') } },
      {
        $set: {
          title: `Placement Drive Alert: ${drive.companyName} - ${drive.jobTitle}`,
          companyName: drive.companyName,
          content: `${drive.companyName} has officially scheduled an institutional recruitment drive for the role of ${drive.jobTitle} (${drive.jobField || 'Software Development'}).\n\n• Eligible Courses: ${eligibleCourseList.join(', ')}\n• CTC Package: ${drive.salaryPackage?.displayPackage || 'Competitive Package'}\n• Drive Date: ${driveDateFormatted}\n• Application Deadline: ${deadlineFormatted}\n• Assessment Venue: ${drive.venue || 'Auditorium & Online'}\n\nEligible candidates should verify their profile and apply before the deadline.`,
          category: 'Drive Alert',
          targetDepartments: eligibleCourseList,
          authorName: 'Prof. Vikramaditya (Head, T&P Cell)',
          pinned: true,
          publishedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('syncDriveNotifications error:', err);
  }
};

module.exports = {
  isStudentEligibleForCourse,
  syncDriveNotifications,
  normalizeText,
};
