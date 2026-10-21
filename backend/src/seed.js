require('dotenv').config();
const { connectDB, disconnectDB, getDBStatus } = require('./config/db');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Student = require('./models/Student');
const { initializeAccounts } = require('./config/initAdmin');

/**
 * Synthetic Development Seeding Script
 * Run manually via `npm run seed`. NEVER executed automatically on server startup.
 * Uses idempotent upserts to prevent duplicate records upon repeated executions.
 */

const SEED_DEPARTMENTS = [
  {
    name: 'Computer Science & Engineering',
    code: 'CSE',
    description: 'Undergraduate and postgraduate studies in algorithms, artificial intelligence, and software engineering.',
    status: 'Active',
  },
  {
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    description: 'Embedded systems, signal processing, VLSI design, and telecommunications.',
    status: 'Active',
  },
  {
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Thermodynamics, fluid mechanics, robotics, and advanced manufacturing.',
    status: 'Active',
  },
  {
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Structural engineering, environmental hydraulics, and urban planning.',
    status: 'Active',
  },
  {
    name: 'School of Management Studies',
    code: 'MGMT',
    description: 'Operations management, quantitative finance, and technology entrepreneurship.',
    status: 'Active',
  },
];

const seedDatabase = async () => {
  console.log('=======================================================');
  console.log(' CampusVerse AI - Synthetic Development Seeder         ');
  console.log('=======================================================');

  const connectionResult = await connectDB();

  if (!connectionResult.success) {
    console.error('[Seeder] Seeding aborted: MongoDB is not connected.');
    console.error('[Seeder] Please configure a valid MONGODB_URI in backend/.env before running the seeder.');
    process.exit(1);
  }

  try {
    console.log('[Seeder] Upserting synthetic departments...');
    const deptMap = {};

    for (const d of SEED_DEPARTMENTS) {
      const dept = await Department.findOneAndUpdate(
        { code: d.code },
        { $set: d },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      deptMap[d.code] = dept._id;
    }
    console.log(`[Seeder] Seeded ${Object.keys(deptMap).length} departments successfully.`);

    console.log('[Seeder] Upserting synthetic courses...');
    const SEED_COURSES = [
      {
        courseCode: 'CS701',
        title: 'Artificial Intelligence & Neural Networks',
        description: 'Deep feedforward networks, convolutional architectures, backpropagation, and transformer attention mechanisms.',
        credits: 4,
        department: deptMap['CSE'],
        semester: 7,
        status: 'Active',
      },
      {
        courseCode: 'CS702',
        title: 'Cloud Computing & Distributed Systems',
        description: 'Consensus protocols, microservices, containerization with Kubernetes, and distributed storage systems.',
        credits: 4,
        department: deptMap['CSE'],
        semester: 7,
        status: 'Active',
      },
      {
        courseCode: 'CS703',
        title: 'Compiler Design & Theory',
        description: 'Lexical analysis, LR parsing, abstract syntax trees, intermediate representations, and target code generation.',
        credits: 4,
        department: deptMap['CSE'],
        semester: 7,
        status: 'Active',
      },
      {
        courseCode: 'EC501',
        title: 'Digital Signal Processing',
        description: 'Discrete Fourier transforms, digital filter design, and spectral estimation.',
        credits: 3,
        department: deptMap['ECE'],
        semester: 5,
        status: 'Active',
      },
      {
        courseCode: 'ME401',
        title: 'Thermodynamics & Heat Transfer',
        description: 'First and second laws of thermodynamics, conduction, convection, and radiation analysis.',
        credits: 4,
        department: deptMap['ME'],
        semester: 4,
        status: 'Active',
      },
    ];

    for (const c of SEED_COURSES) {
      await Course.findOneAndUpdate(
        { courseCode: c.courseCode },
        { $set: c },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Seeder] Seeded ${SEED_COURSES.length} courses successfully.`);

    console.log('[Seeder] Upserting synthetic students (demonstration records)...');
    const SEED_STUDENTS = [
      {
        studentId: 'CS21B1042',
        name: 'Aarav Singhania',
        email: 'aarav.singhania@campusverse.edu',
        department: deptMap['CSE'],
        semester: 7,
        enrollmentYear: 2021,
        status: 'Active',
      },
      {
        studentId: 'CS21B1001',
        name: 'Aditi Nair',
        email: 'aditi.nair@campusverse.edu',
        department: deptMap['CSE'],
        semester: 7,
        enrollmentYear: 2021,
        status: 'Active',
      },
      {
        studentId: 'EC22B2014',
        name: 'Rohan Deshmukh',
        email: 'rohan.deshmukh@campusverse.edu',
        department: deptMap['ECE'],
        semester: 5,
        enrollmentYear: 2022,
        status: 'Active',
      },
      {
        studentId: 'ME23B3008',
        name: 'Pooja Iyer',
        email: 'pooja.iyer@campusverse.edu',
        department: deptMap['ME'],
        semester: 3,
        enrollmentYear: 2023,
        status: 'Active',
      },
    ];

    for (const s of SEED_STUDENTS) {
      await Student.findOneAndUpdate(
        { studentId: s.studentId },
        { $set: s },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[Seeder] Seeded ${SEED_STUDENTS.length} students successfully.`);

    console.log('[Seeder] Initializing default administrative and portal accounts...');
    await initializeAccounts();

    console.log('[Seeder] Synthetic development data seeding complete!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error during seeding:', error.message);
    await disconnectDB();
    process.exit(1);
  }
};

seedDatabase();
