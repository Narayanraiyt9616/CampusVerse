const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Fee = require('../models/Fee');
const AdmitCard = require('../models/AdmitCard');
const Exam = require('../models/Exam');

/**
 * Universal Global Search Controller for CampusVerse AI
 * Searches across portal records and metadata based on user role and permissions.
 */
exports.globalSearch = async (req, res) => {
  try {
    const rawQuery = (req.query.q || req.query.query || '').trim();
    if (!rawQuery) {
      return res.json({ success: true, query: '', count: 0, results: [] });
    }

    const escaped = rawQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const userRole = req.user?.role || 'student';

    const results = [];

    if (userRole === 'admin' || userRole === 'superadmin') {
      // 1. Search Students
      const studentsPromise = Student.find({
        $or: [{ name: regex }, { studentId: regex }, { email: regex }],
      })
        .limit(6)
        .populate('department', 'name code')
        .lean();

      // 2. Search Faculty
      const facultyPromise = Faculty.find({
        $or: [{ name: regex }, { facultyId: regex }, { email: regex }],
      })
        .limit(6)
        .populate('department', 'name code')
        .lean();

      // 3. Search Courses
      const coursesPromise = Course.find({
        $or: [{ title: regex }, { courseCode: regex }],
      })
        .limit(6)
        .lean();

      // 4. Search Invoices / Fees
      const feesPromise = Fee.find({
        $or: [{ invoiceNumber: regex }, { receiptNumber: regex }, { category: regex }],
      })
        .limit(6)
        .populate('student', 'name studentId')
        .lean();

      // 5. Search Admit Cards
      const admitCardsPromise = AdmitCard.find({
        $or: [{ studentId: regex }, { studentName: regex }, { examTitle: regex }, { examSession: regex }],
      })
        .limit(6)
        .lean();

      const [students, faculties, courses, fees, admitCards] = await Promise.all([
        studentsPromise,
        facultyPromise,
        coursesPromise,
        feesPromise,
        admitCardsPromise,
      ]);

      // Map Students
      students.forEach((s) => {
        results.push({
          id: s._id,
          type: 'student',
          category: 'Student Registry',
          title: s.name,
          subtitle: `Roll: ${s.studentId} • ${s.department?.name || 'Department'} • Sem ${s.semester}`,
          url: `/admin/students?search=${encodeURIComponent(s.studentId)}`,
          badge: s.studentId,
          badgeVariant: 'teal',
        });
      });

      // Map Faculty
      faculties.forEach((f) => {
        results.push({
          id: f._id,
          type: 'faculty',
          category: 'Faculty Roster',
          title: f.name,
          subtitle: `${f.designation || 'Faculty'} • ${f.department?.name || 'Engineering'} • ${f.email}`,
          url: `/admin/faculty?search=${encodeURIComponent(f.name)}`,
          badge: f.facultyId || 'Faculty',
          badgeVariant: 'info',
        });
      });

      // Map Invoices
      fees.forEach((fee) => {
        results.push({
          id: fee._id,
          type: 'fee',
          category: 'Fee Invoice',
          title: `${fee.category} — ${fee.invoiceNumber}`,
          subtitle: `Student: ${fee.student?.name || 'Student'} (${fee.student?.studentId || '—'}) • ₹${fee.amount?.toLocaleString()} • Status: ${fee.status}`,
          url: `/admin/fees?search=${encodeURIComponent(fee.invoiceNumber)}`,
          badge: fee.status,
          badgeVariant: fee.status === 'Paid' ? 'success' : 'warning',
        });
      });

      // Map Admit Cards
      admitCards.forEach((ac) => {
        results.push({
          id: ac._id,
          type: 'admit-card',
          category: 'Admit Card',
          title: `${ac.examTitle} — ${ac.studentName}`,
          subtitle: `Candidate: ${ac.studentId} • Session: ${ac.examSession} • Status: ${ac.status}`,
          url: `/admin/admit-cards?search=${encodeURIComponent(ac.studentId)}`,
          badge: ac.status,
          badgeVariant: 'gold',
        });
      });

      // Map Courses
      courses.forEach((c) => {
        results.push({
          id: c._id,
          type: 'course',
          category: 'Course Catalog',
          title: `${c.courseCode} — ${c.title}`,
          subtitle: `Semester ${c.semester || '—'} • ${c.credits || 3} Credits`,
          url: `/admin/academics?search=${encodeURIComponent(c.courseCode)}`,
          badge: c.courseCode,
          badgeVariant: 'neutral',
        });
      });
    } else {
      // Non-admin search (courses, examinations, academic records)
      const courses = await Course.find({
        $or: [{ title: regex }, { courseCode: regex }],
      })
        .limit(8)
        .lean();

      courses.forEach((c) => {
        results.push({
          id: c._id,
          type: 'course',
          category: 'Course',
          title: `${c.courseCode}: ${c.title}`,
          subtitle: `Semester ${c.semester || '—'} • ${c.credits || 3} Credits`,
          url: `/${userRole}/academics`,
          badge: c.courseCode,
          badgeVariant: 'neutral',
        });
      });
    }

    return res.json({
      success: true,
      query: rawQuery,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error('Universal Search error:', err);
    return res.status(500).json({ success: false, error: 'Failed to execute system search.' });
  }
};
