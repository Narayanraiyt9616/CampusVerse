require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./src/config/db');
const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Faculty = require('./src/models/Faculty');
const Department = require('./src/models/Department');
const Course = require('./src/models/Course');
const Attendance = require('./src/models/Attendance');
const Fee = require('./src/models/Fee');
const Exam = require('./src/models/Exam');
const Result = require('./src/models/Result');
const Notice = require('./src/models/Notice');
const LeaveApplication = require('./src/models/LeaveApplication');
const Timetable = require('./src/models/Timetable');
const Assignment = require('./src/models/Assignment');

async function seedAdminCollections() {
  await connectDB();
  console.log('[SeedAdmin] Connected to MongoDB.');

  try {
    const adminUser = await User.findOne({ role: 'admin' });
    const facultyUser = await User.findOne({ role: 'faculty' });
    const students = await Student.find();
    const departments = await Department.find();
    const courses = await Course.find();

    const cseDept = departments.find(d => d.code === 'CSE') || departments[0];
    const eceDept = departments.find(d => d.code === 'ECE') || departments[1];
    const cseCourse = courses.find(c => c.courseCode === 'CS701') || courses[0];
    const cloudCourse = courses.find(c => c.courseCode === 'CS702') || courses[1];

    // 1. Seed Faculty Profile
    if (facultyUser) {
      await Faculty.findOneAndUpdate(
        { user: facultyUser._id },
        {
          $set: {
            user: facultyUser._id,
            department: 'Computer Science & Engineering',
            position: 'Associate Professor & AI Lab Head',
            semesters: [5, 7],
            sections: ['A', 'B'],
            permissions: {
              attendance: true,
              assignments: true,
              materials: true,
              examinations: true,
              marks: true,
              questionPapers: true,
            },
          },
        },
        { upsert: true, new: true }
      );
      console.log('[SeedAdmin] Faculty record upserted.');
    }

    // 2. Seed Real Attendance Records (including a shortage <75% case for Aarav / Pooja)
    if (students.length >= 2 && facultyUser) {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const dayBefore = new Date(Date.now() - 172800000).toISOString().slice(0, 10);

      // Session 1: Yesterday
      await Attendance.findOneAndUpdate(
        { faculty: facultyUser._id, className: 'B.Tech CSE 7th Sem', subject: 'Artificial Intelligence (CS701)', date: yesterday },
        {
          $set: {
            faculty: facultyUser._id,
            className: 'B.Tech CSE 7th Sem',
            subject: 'Artificial Intelligence (CS701)',
            semester: 7,
            date: yesterday,
            records: [
              { student: students[0]._id, status: 'Present' },
              { student: students[1]._id, status: 'Present' },
            ],
            totalPresent: 2,
            totalAbsent: 0,
            totalLate: 0,
          },
        },
        { upsert: true }
      );

      // Session 2: Day Before (Aarav absent)
      await Attendance.findOneAndUpdate(
        { faculty: facultyUser._id, className: 'B.Tech CSE 7th Sem', subject: 'Cloud Computing (CS702)', date: dayBefore },
        {
          $set: {
            faculty: facultyUser._id,
            className: 'B.Tech CSE 7th Sem',
            subject: 'Cloud Computing (CS702)',
            semester: 7,
            date: dayBefore,
            records: [
              { student: students[0]._id, status: 'Absent' },
              { student: students[1]._id, status: 'Present' },
            ],
            totalPresent: 1,
            totalAbsent: 1,
            totalLate: 0,
          },
        },
        { upsert: true }
      );

      // Session 3: Today
      await Attendance.findOneAndUpdate(
        { faculty: facultyUser._id, className: 'B.Tech CSE 7th Sem', subject: 'Artificial Intelligence (CS701)', date: today },
        {
          $set: {
            faculty: facultyUser._id,
            className: 'B.Tech CSE 7th Sem',
            subject: 'Artificial Intelligence (CS701)',
            semester: 7,
            date: today,
            records: [
              { student: students[0]._id, status: 'Absent' },
              { student: students[1]._id, status: 'Present' },
            ],
            totalPresent: 1,
            totalAbsent: 1,
            totalLate: 0,
          },
        },
        { upsert: true }
      );
      console.log('[SeedAdmin] Attendance records upserted.');
    }

    // 3. Seed Real Fee Invoices
    if (students.length >= 2 && adminUser) {
      await Fee.findOneAndUpdate(
        { invoiceNumber: 'INV-2026-001' },
        {
          $set: {
            student: students[0]._id,
            invoiceNumber: 'INV-2026-001',
            category: 'Tuition Fee',
            description: 'B.Tech 7th Semester Academic Tuition Fee',
            amount: 65000,
            paidAmount: 65000,
            dueDate: new Date(Date.now() + 15 * 86400000),
            status: 'Paid',
            paymentDate: new Date(),
            paymentMode: 'Online',
            receiptNumber: 'REC-2026-9041',
            semester: 7,
            academicYear: '2025-2026',
            createdBy: adminUser._id,
          },
        },
        { upsert: true }
      );

      await Fee.findOneAndUpdate(
        { invoiceNumber: 'INV-2026-002' },
        {
          $set: {
            student: students[0]._id,
            invoiceNumber: 'INV-2026-002',
            category: 'Hostel & Mess',
            description: 'Semester 7 Hostel Room & Mess Charges (Block C)',
            amount: 32000,
            paidAmount: 0,
            dueDate: new Date(Date.now() + 5 * 86400000),
            status: 'Pending',
            semester: 7,
            academicYear: '2025-2026',
            createdBy: adminUser._id,
          },
        },
        { upsert: true }
      );

      await Fee.findOneAndUpdate(
        { invoiceNumber: 'INV-2026-003' },
        {
          $set: {
            student: students[1]._id,
            invoiceNumber: 'INV-2026-003',
            category: 'Tuition Fee',
            description: 'B.Tech 7th Semester Academic Tuition Fee',
            amount: 65000,
            paidAmount: 0,
            dueDate: new Date(Date.now() - 5 * 86400000), // Overdue
            status: 'Overdue',
            semester: 7,
            academicYear: '2025-2026',
            createdBy: adminUser._id,
          },
        },
        { upsert: true }
      );
      console.log('[SeedAdmin] Fee records upserted.');
    }

    // 4. Seed Exams
    if (facultyUser) {
      await Exam.findOneAndUpdate(
        { title: 'CS701 Mid-Term Examination' },
        {
          $set: {
            title: 'CS701 Mid-Term Examination',
            subject: 'Artificial Intelligence & Neural Networks',
            className: 'B.Tech CSE 7th Sem',
            semester: 7,
            faculty: facultyUser._id,
            examDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            startTime: '10:00',
            duration: 120,
            venue: 'Auditorium Hall 2',
            maxMarks: 50,
            examType: 'Mid-Term',
            instructions: 'Scientific calculators allowed. Mobile phones strictly prohibited.',
          },
        },
        { upsert: true }
      );

      await Exam.findOneAndUpdate(
        { title: 'CS702 Practical Lab Assessment' },
        {
          $set: {
            title: 'CS702 Practical Lab Assessment',
            subject: 'Cloud Computing & Distributed Systems',
            className: 'B.Tech CSE 7th Sem',
            semester: 7,
            faculty: facultyUser._id,
            examDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
            startTime: '14:00',
            duration: 90,
            venue: 'Computing Lab 4',
            maxMarks: 25,
            examType: 'Practical',
            instructions: 'Kubernetes and Docker deployment scripts evaluation.',
          },
        },
        { upsert: true }
      );
      console.log('[SeedAdmin] Exam records upserted.');
    }

    // 5. Seed Results
    if (students.length >= 2 && cseCourse && facultyUser) {
      await Result.findOneAndUpdate(
        { student: students[0]._id, course: cseCourse._id, assessmentName: 'Internal Assessment 1' },
        {
          $set: {
            student: students[0]._id,
            course: cseCourse._id,
            faculty: facultyUser._id,
            assessmentName: 'Internal Assessment 1',
            assessmentType: 'Exam',
            maxMarks: 30,
            marksObtained: 27,
            semester: 7,
            session: '2025-2026 Autumn',
            published: true,
            feedback: 'Excellent grasp of Backpropagation and Gradient Descent mechanics.',
          },
        },
        { upsert: true }
      );

      await Result.findOneAndUpdate(
        { student: students[1]._id, course: cseCourse._id, assessmentName: 'Internal Assessment 1' },
        {
          $set: {
            student: students[1]._id,
            course: cseCourse._id,
            faculty: facultyUser._id,
            assessmentName: 'Internal Assessment 1',
            assessmentType: 'Exam',
            maxMarks: 30,
            marksObtained: 28.5,
            semester: 7,
            session: '2025-2026 Autumn',
            published: false, // Pending publication
            feedback: 'Top performer in heuristics and state-space search algorithms.',
          },
        },
        { upsert: true }
      );
      console.log('[SeedAdmin] Result records upserted.');
    }

    // 6. Seed Notices
    if (adminUser) {
      await Notice.findOneAndUpdate(
        { title: 'Mid-Semester Examination Schedule Autumn 2026' },
        {
          $set: {
            title: 'Mid-Semester Examination Schedule Autumn 2026',
            content: 'The official Mid-Semester examinations for B.Tech Semesters 3, 5, and 7 will commence from next Monday. Detailed room allocation is posted on the notice board.',
            author: adminUser._id,
            authorName: 'Office of the Registrar',
            category: 'Exam',
            targetAudience: 'All',
            pinned: true,
            publishedAt: new Date(),
          },
        },
        { upsert: true }
      );

      await Notice.findOneAndUpdate(
        { title: 'Annual AI & Robotics Hackathon 2026 Registration Open' },
        {
          $set: {
            title: 'Annual AI & Robotics Hackathon 2026 Registration Open',
            content: 'CampusVerse Innovation Cell invites project submissions for the upcoming 48-hour hackathon. Top 3 teams receive research grants.',
            author: adminUser._id,
            authorName: 'Dean of Student Affairs',
            category: 'Event',
            targetAudience: 'Students',
            pinned: false,
            publishedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log('[SeedAdmin] Notice records upserted.');
    }

    // 7. Seed Leave Applications
    if (facultyUser) {
      await LeaveApplication.findOneAndUpdate(
        { faculty: facultyUser._id, fromDate: '2026-11-01' },
        {
          $set: {
            faculty: facultyUser._id,
            leaveType: 'Casual Leave',
            fromDate: '2026-11-01',
            toDate: '2026-11-03',
            reason: 'Attending IEEE International Conference on Cognitive Computing in New Delhi as session chair.',
            status: 'Pending',
          },
        },
        { upsert: true }
      );
      console.log('[SeedAdmin] Leave Application records upserted.');
    }

    // 8. Seed Timetables
    if (cseDept && cseCourse && facultyUser) {
      await Timetable.findOneAndUpdate(
        { faculty: facultyUser._id, dayOfWeek: 'Monday', startTime: '10:00' },
        {
          $set: {
            department: cseDept._id,
            course: cseCourse._id,
            faculty: facultyUser._id,
            semester: 7,
            section: 'A',
            dayOfWeek: 'Monday',
            startTime: '10:00',
            endTime: '11:00',
            classroom: 'LH-302',
            session: '2025-2026',
          },
        },
        { upsert: true }
      );

      if (cloudCourse) {
        await Timetable.findOneAndUpdate(
          { faculty: facultyUser._id, dayOfWeek: 'Wednesday', startTime: '11:00' },
          {
            $set: {
              department: cseDept._id,
              course: cloudCourse._id,
              faculty: facultyUser._id,
              semester: 7,
              section: 'A',
              dayOfWeek: 'Wednesday',
              startTime: '11:00',
              endTime: '12:00',
              classroom: 'LH-305',
              session: '2025-2026',
            },
          },
          { upsert: true }
        );
      }
      console.log('[SeedAdmin] Timetable records upserted.');
    }

    console.log('[SeedAdmin] All admin data collections successfully populated!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[SeedAdmin] Error:', err);
    await disconnectDB();
    process.exit(1);
  }
}

seedAdminCollections();
