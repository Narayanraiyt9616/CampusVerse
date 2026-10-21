/**
 * CampusVerse AI - Demonstration Datasets
 * NOTE: All data herein is strictly for demonstration and architectural preview
 * purposes during Part 1 development. Real data will be connected in Part 2 via the Express/MongoDB backend.
 */

export const DEMO_METADATA = {
  isDemonstrationData: true,
  notice: 'Demonstration Preview Mode — Data shown is simulated for Part 1 testing and design verification.',
  phase: 'Part 1: Foundation, Design System & Frontend Architecture',
  backendStatus: 'Scheduled for Part 2 (Node.js/Express + MongoDB)',
  aiServiceStatus: 'Scheduled for Part 3 (Python/FastAPI)',
};

export const DEMO_STUDENT = {
  id: 'STU-2023-8842',
  name: 'Aarav Singhania',
  role: 'Student',
  email: 'aarav.singhania@campusverse.edu',
  department: 'Computer Science & Engineering',
  degree: 'Bachelor of Technology (Honors)',
  semester: '7th Semester',
  batch: '2021 - 2025',
  rollNumber: 'CS21B1042',
  cgpa: 8.94,
  currentSgpa: 9.12,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  advisor: 'Dr. Meenakshi Sundaram (HOD CSE)',
  
  attendanceSummary: {
    overallPercentage: 88.6,
    totalClasses: 316,
    attendedClasses: 280,
    missedClasses: 36,
    minimumRequired: 75,
    status: 'Good Standing',
    courseBreakdown: [
      { code: 'CS701', name: 'Artificial Intelligence & Neural Nets', attended: 42, total: 46, percentage: 91.3, faculty: 'Dr. Rajiv Menon' },
      { code: 'CS702', name: 'Cloud Computing & Distributed Systems', attended: 38, total: 44, percentage: 86.4, faculty: 'Prof. Ananya Sen' },
      { code: 'CS703', name: 'Compiler Design & Theory', attended: 40, total: 44, percentage: 90.9, faculty: 'Dr. Vivek Saxena' },
      { code: 'CS704', name: 'Information & Network Security', attended: 35, total: 42, percentage: 83.3, faculty: 'Prof. Sarah Thomas' },
      { code: 'CS705', name: 'Full Stack Engineering Capstone', attended: 45, total: 48, percentage: 93.8, faculty: 'Prof. K. Venkatesh' },
      { code: 'CS706', name: 'Management Information Systems', attended: 40, total: 46, percentage: 86.9, faculty: 'Dr. Priya Desai' },
      { code: 'CS707', name: 'AI & Vision Research Lab', attended: 40, total: 46, percentage: 86.9, faculty: 'Dr. Rajiv Menon' },
    ]
  },

  timetable: [
    { day: 'Monday', slots: [
      { time: '09:00 - 10:00 AM', course: 'CS701: Artificial Intelligence', room: 'Hall 302', faculty: 'Dr. Rajiv Menon', type: 'Lecture' },
      { time: '10:15 - 11:15 AM', course: 'CS702: Cloud Computing', room: 'Hall 204', faculty: 'Prof. Ananya Sen', type: 'Lecture' },
      { time: '11:30 - 01:00 PM', course: 'CS707: AI & Vision Research Lab', room: 'Lab 4B', faculty: 'Dr. Rajiv Menon', type: 'Lab' },
      { time: '02:00 - 03:00 PM', course: 'CS704: Network Security', room: 'Hall 302', faculty: 'Prof. Sarah Thomas', type: 'Lecture' },
    ]},
    { day: 'Tuesday', slots: [
      { time: '09:00 - 10:00 AM', course: 'CS703: Compiler Design', room: 'Hall 105', faculty: 'Dr. Vivek Saxena', type: 'Lecture' },
      { time: '10:15 - 11:15 AM', course: 'CS706: Management Info Systems', room: 'Hall 201', faculty: 'Dr. Priya Desai', type: 'Lecture' },
      { time: '01:30 - 03:30 PM', course: 'CS705: Capstone Project Studio', room: 'Innovation Hub', faculty: 'Prof. K. Venkatesh', type: 'Project' },
    ]},
    { day: 'Wednesday', slots: [
      { time: '09:00 - 10:00 AM', course: 'CS701: Artificial Intelligence', room: 'Hall 302', faculty: 'Dr. Rajiv Menon', type: 'Lecture' },
      { time: '10:15 - 11:15 AM', course: 'CS704: Network Security', room: 'Hall 302', faculty: 'Prof. Sarah Thomas', type: 'Lecture' },
      { time: '11:30 - 12:30 PM', course: 'CS702: Cloud Computing', room: 'Hall 204', faculty: 'Prof. Ananya Sen', type: 'Lecture' },
      { time: '02:00 - 04:00 PM', course: 'CS703: Compiler Lab & Parsers', room: 'Lab 2A', faculty: 'Dr. Vivek Saxena', type: 'Lab' },
    ]},
    { day: 'Thursday', slots: [
      { time: '09:00 - 10:00 AM', course: 'CS702: Cloud Computing', room: 'Hall 204', faculty: 'Prof. Ananya Sen', type: 'Lecture' },
      { time: '10:15 - 11:15 AM', course: 'CS703: Compiler Design', room: 'Hall 105', faculty: 'Dr. Vivek Saxena', type: 'Lecture' },
      { time: '01:30 - 03:00 PM', course: 'CS706: Management Info Systems', room: 'Hall 201', faculty: 'Dr. Priya Desai', type: 'Seminar' },
    ]},
    { day: 'Friday', slots: [
      { time: '09:00 - 10:00 AM', course: 'CS701: Artificial Intelligence', room: 'Hall 302', faculty: 'Dr. Rajiv Menon', type: 'Lecture' },
      { time: '10:15 - 12:15 PM', course: 'Industry Mentorship & Placement Prep', room: 'Auditorium 2', faculty: 'Placement Cell', type: 'Workshop' },
      { time: '02:00 - 04:00 PM', course: 'Technical Seminar & Paper Review', room: 'Seminar Hall B', faculty: 'Dr. Meenakshi S.', type: 'Seminar' },
    ]}
  ],

  assignments: [
    { id: 'ASN-701', course: 'CS701: Artificial Intelligence', title: 'Implementing Backpropagation & Gradient Descent in Python', dueDate: '2026-10-25', status: 'Pending', weight: '15%', maxMarks: 100 },
    { id: 'ASN-702', course: 'CS702: Cloud Computing', title: 'Kubernetes Cluster Provisioning with Terraform on AWS', dueDate: '2026-10-28', status: 'Submitted', weight: '20%', maxMarks: 50 },
    { id: 'ASN-703', course: 'CS703: Compiler Design', title: 'Lexical Analyzer & Recursive Descent Parser for Mini-C', dueDate: '2026-10-18', status: 'Graded', score: 48, maxMarks: 50, feedback: 'Excellent AST visualization' },
    { id: 'ASN-704', course: 'CS704: Network Security', title: 'RSA Public Key Cryptanalysis & Man-in-the-Middle Simulation', dueDate: '2026-11-04', status: 'Pending', weight: '15%', maxMarks: 100 },
    { id: 'ASN-705', course: 'CS705: Capstone Project', title: 'Architectural Blueprint & API Specification Document', dueDate: '2026-10-30', status: 'Submitted', weight: '25%', maxMarks: 100 },
  ],

  marks: [
    { semester: 'Semester 1', sgpa: 8.75, credits: 24, status: 'Completed' },
    { semester: 'Semester 2', sgpa: 8.85, credits: 24, status: 'Completed' },
    { semester: 'Semester 3', sgpa: 9.05, credits: 26, status: 'Completed' },
    { semester: 'Semester 4', sgpa: 8.90, credits: 26, status: 'Completed' },
    { semester: 'Semester 5', sgpa: 9.15, credits: 25, status: 'Completed' },
    { semester: 'Semester 6', sgpa: 9.10, credits: 25, status: 'Completed' },
    { semester: 'Semester 7 (Mid-Term)', sgpa: 9.12, credits: 22, status: 'In Progress' },
  ],

  fees: [
    { invoiceId: 'INV-2026-081', category: 'Tuition Fee (Semester 7)', amount: 85000, dueDate: '2026-08-15', status: 'Paid', paymentDate: '2026-08-10', receiptNumber: 'RCP-782910' },
    { invoiceId: 'INV-2026-082', category: 'Hostel & Mess Charges (Term 1)', amount: 42000, dueDate: '2026-08-20', status: 'Paid', paymentDate: '2026-08-12', receiptNumber: 'RCP-783452' },
    { invoiceId: 'INV-2026-095', category: 'End-Term Examination Fee', amount: 3500, dueDate: '2026-11-15', status: 'Pending', paymentDate: null, receiptNumber: null },
    { invoiceId: 'INV-2026-099', category: 'IEEE Student Chapter & Library Annual', amount: 1800, dueDate: '2026-09-01', status: 'Paid', paymentDate: '2026-08-28', receiptNumber: 'RCP-789012' },
  ],

  notifications: [
    { id: 'NOTIF-1', title: 'Campus Placement Drive: Microsoft & Google', date: '2026-10-16', category: 'Placement', read: false, priority: 'High', message: 'Shortlisting registrations close this Friday at 5:00 PM.' },
    { id: 'NOTIF-2', title: 'Mid-Term Grade Sheets Published', date: '2026-10-14', category: 'Academics', read: true, priority: 'Normal', message: 'Grades for Continuous Assessment 1 have been posted on the portal.' },
    { id: 'NOTIF-3', title: 'Annual Hackathon "HackVerse 2026" Registrations Open', date: '2026-10-12', category: 'Events', read: false, priority: 'Normal', message: 'Cash pool of ₹2,50,000 for innovative AI/IoT solutions.' },
    { id: 'NOTIF-4', title: 'Hostel Maintenance Schedule Notice', date: '2026-10-10', category: 'Hostel', read: true, priority: 'Low', message: 'Scheduled power audit on Sunday between 10:00 AM and 01:00 PM.' },
  ],

  upcomingEvents: [
    { id: 'EVT-1', title: 'HackVerse 2026 National Hackathon', date: 'Nov 02 - Nov 04, 2026', venue: 'Campus Tech Park', organizer: 'CSE Dept & ACM Chapter', type: 'Hackathon' },
    { id: 'EVT-2', title: 'Distinguished Guest Lecture on Generative AI in Healthcare', date: 'Oct 24, 2026 • 03:00 PM', venue: 'Main Auditorium', organizer: 'Research Cell', type: 'Lecture' },
    { id: 'EVT-3', title: 'Inter-Collegiate Cultural Festival "Tarang 26"', date: 'Nov 18 - Nov 20, 2026', venue: 'Open Air Amphitheatre', organizer: 'Student Union', type: 'Cultural' },
  ]
};

export const DEMO_FACULTY = {
  id: 'FAC-2018-042',
  name: 'Dr. Rajiv Menon',
  role: 'Faculty',
  email: 'rajiv.menon@campusverse.edu',
  department: 'Computer Science & Engineering',
  designation: 'Professor & Head of AI Research Lab',
  specialization: 'Deep Learning, Computer Vision, Autonomous Systems',
  officeRoom: 'Block B, Faculty Cabin 412',
  totalStudentsTaught: 248,
  activeCoursesCount: 3,

  assignedCourses: [
    { id: 'CS701', code: 'CS701', name: 'Artificial Intelligence & Neural Networks', semester: '7th Sem', studentsEnrolled: 64, totalClassesConducted: 46, avgAttendance: 91.3, nextLecture: 'Today, 02:00 PM' },
    { id: 'CS707', code: 'CS707', name: 'AI & Vision Research Lab', semester: '7th Sem', studentsEnrolled: 32, totalClassesConducted: 22, avgAttendance: 93.8, nextLecture: 'Tomorrow, 11:30 AM' },
    { id: 'CS502', code: 'CS502', name: 'Data Structures & Algorithms', semester: '5th Sem', studentsEnrolled: 72, totalClassesConducted: 48, avgAttendance: 87.2, nextLecture: 'Wed, 09:00 AM' },
  ],

  pendingGrading: [
    { id: 'SUB-101', course: 'CS701', title: 'Assignment 3: Neural Net Backprop', submissionsReceived: 62, totalStudents: 64, deadline: '2026-10-25', status: 'Needs Evaluation' },
    { id: 'SUB-102', course: 'CS707', title: 'Lab Project: Face Landmark Detection', submissionsReceived: 31, totalStudents: 32, deadline: '2026-10-22', status: 'In Review' },
    { id: 'SUB-103', course: 'CS502', title: 'Problem Set 4: Graph Algorithms', submissionsReceived: 70, totalStudents: 72, deadline: '2026-10-29', status: 'Pending Due Date' },
  ],

  rosterPreview: [
    { rollNo: 'CS21B1001', name: 'Aakash Verma', attendanceRate: '94%', currentMarks: '88/100', status: 'Present' },
    { rollNo: 'CS21B1002', name: 'Aditi Nair', attendanceRate: '96%', currentMarks: '94/100', status: 'Present' },
    { rollNo: 'CS21B1042', name: 'Aarav Singhania', attendanceRate: '91%', currentMarks: '92/100', status: 'Present' },
    { rollNo: 'CS21B1055', name: 'Bhavna Kulkarni', attendanceRate: '72%', currentMarks: '68/100', status: 'Warning (<75%)' },
    { rollNo: 'CS21B1078', name: 'Chetan Patel', attendanceRate: '85%', currentMarks: '81/100', status: 'Present' },
    { rollNo: 'CS21B1090', name: 'Devika Pillai', attendanceRate: '89%', currentMarks: '85/100', status: 'Present' },
  ]
};

export const DEMO_ADMIN = {
  id: 'ADM-2016-010',
  name: 'Dr. Suresh R. Nambiar',
  role: 'Administrator',
  email: 'suresh.nambiar@campusverse.edu',
  designation: 'Dean of Academic Administration & Registrar',
  campus: 'Main Metropolis Campus',

  stats: {
    totalStudents: 4820,
    totalFaculty: 318,
    activeDepartments: 8,
    undergraduatePrograms: 14,
    postgraduatePrograms: 10,
    currentAcademicYear: '2026 - 2027',
    activeComplaintsCount: 6,
    pendingApprovalsCount: 9,
    overallFeeCollectionRate: 94.2,
  },

  departments: [
    { code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Meenakshi Sundaram', facultyCount: 52, studentCount: 1240, budgetUtilized: '86%' },
    { code: 'ECE', name: 'Electronics & Communication', hod: 'Dr. Ramesh Babu', facultyCount: 44, studentCount: 890, budgetUtilized: '81%' },
    { code: 'ME', name: 'Mechanical Engineering', hod: 'Dr. Alok Verma', facultyCount: 38, studentCount: 680, budgetUtilized: '78%' },
    { code: 'CE', name: 'Civil Engineering', hod: 'Dr. Vandana Rao', facultyCount: 32, studentCount: 490, budgetUtilized: '75%' },
    { code: 'EE', name: 'Electrical Engineering', hod: 'Dr. G. Krishnan', facultyCount: 36, studentCount: 540, budgetUtilized: '83%' },
    { code: 'BIO', name: 'Biotechnology & Bioinformatics', hod: 'Dr. S. Mukherjee', facultyCount: 28, studentCount: 380, budgetUtilized: '79%' },
    { code: 'MGMT', name: 'School of Management Studies', hod: 'Dr. Anita Kapoor', facultyCount: 46, studentCount: 600, budgetUtilized: '89%' },
  ],

  pendingApprovals: [
    { id: 'APP-801', title: 'Curriculum Revision for AI & Data Science Minor', requester: 'Dr. Meenakshi Sundaram', department: 'CSE', date: '2026-10-15', priority: 'High', type: 'Curriculum' },
    { id: 'APP-802', title: 'Faculty Duty Leave (IEEE Conference - Singapore)', requester: 'Dr. Rajiv Menon', department: 'CSE', date: '2026-10-16', priority: 'Medium', type: 'Faculty Leave' },
    { id: 'APP-803', title: 'High-Performance GPU Cluster Lab Procurement', requester: 'Lab Infrastructure Cell', department: 'Central IT', date: '2026-10-14', priority: 'High', type: 'Procurement' },
    { id: 'APP-804', title: 'Student Sports Tournament Budget Sanction', requester: 'Director of Physical Education', department: 'Sports Cell', date: '2026-10-13', priority: 'Normal', type: 'Budget' },
  ],

  complaints: [
    { id: 'CMP-301', category: 'Hostel Maintenance', subject: 'Hot water geyser failure in Block C (3rd Floor)', date: '2026-10-16', status: 'In Progress', priority: 'High', assignedTo: 'Estate Officer' },
    { id: 'CMP-302', category: 'IT & Wi-Fi', subject: 'Library 2nd Floor High-Speed Mesh Dropouts', date: '2026-10-15', status: 'Under Review', priority: 'Medium', assignedTo: 'Network Operations' },
    { id: 'CMP-303', category: 'Transport', subject: 'Route 14 Bus delay due to ongoing metro bypass work', date: '2026-10-14', status: 'Resolved', priority: 'Normal', assignedTo: 'Fleet Manager' },
    { id: 'CMP-304', category: 'Mess / Food', subject: 'Menu variety feedback for North Indian counter', date: '2026-10-12', status: 'Under Review', priority: 'Low', assignedTo: 'Mess Committee' },
  ]
};

export const DEMO_PARENT = {
  id: 'PAR-2023-441',
  name: 'Rajendra Singhania',
  role: 'Parent / Guardian',
  email: 'r.singhania@fintechcorp.in',
  phone: '+91 98765 43210',
  ward: {
    name: 'Aarav Singhania',
    rollNumber: 'CS21B1042',
    degree: 'B.Tech Computer Science (7th Sem)',
    cgpa: 8.94,
    attendanceOverall: '88.6%',
    hostelResident: 'Yes (Block B, Room 314)',
    advisorName: 'Dr. Meenakshi Sundaram',
    advisorContact: '+91 98111 22334',
    academicStanding: 'Distinction / Dean List',
    feeStatus: 'All Clear (Semester 7 Paid)',
  },
  recentWardActivities: [
    { date: '2026-10-16', activity: 'Scored 48/50 in Compiler Design Assignment', category: 'Academic' },
    { date: '2026-10-15', activity: 'Biometric Attendance Checked In (Morning Session)', category: 'Attendance' },
    { date: '2026-10-12', activity: 'Registered for Google Campus Placement Drive', category: 'Placement' },
  ]
};

export const DEMO_PLACEMENT = {
  officerName: 'Prof. Vikramaditya Rathore',
  role: 'Placement Officer',
  department: 'University Training & Placement Cell (T&P)',
  season: '2026 - 2027 Graduating Batch',
  stats: {
    totalEligibleStudents: 840,
    placedStudents: 642,
    placementPercentage: 76.4,
    totalOffersRolled: 914,
    highestDomesticCtc: '₹54.5 LPA (Google)',
    highestInternationalCtc: '$125,000 (Microsoft Redmond)',
    averageCtc: '₹14.2 LPA',
    activeRecruitingPartners: 68,
  },
  upcomingDrives: [
    { company: 'Google India', role: 'Software Engineer - Distributed Systems', date: '2026-10-24', eligibility: 'CGPA >= 8.5', registeredCount: 142, rounds: 'Online Assessment + 3 Technical' },
    { company: 'Microsoft', role: 'Cloud Solution Architect', date: '2026-10-28', eligibility: 'CGPA >= 8.0', registeredCount: 198, rounds: 'Coding Round + System Design' },
    { company: 'Goldman Sachs', role: 'Quantitative Analyst & Tech Associate', date: '2026-11-03', eligibility: 'CGPA >= 8.2', registeredCount: 110, rounds: 'Aptitude + Math + Tech' },
    { company: 'TCS Digital', role: 'Digital Systems Engineer', date: '2026-11-08', eligibility: 'CGPA >= 7.0', registeredCount: 420, rounds: 'National Qualifier Test' },
  ]
};

export const DEMO_STAFF = {
  staffName: 'Murugan Karthikeyan',
  role: 'Hostel & Transport Staff',
  department: 'Campus Facilities, Hostel & Logistics Cell',
  stats: {
    hostelBlocks: 6,
    totalHostelBeds: 2400,
    occupiedBeds: 2210,
    occupancyRate: 92.1,
    campusFleetBuses: 24,
    activeBusRoutes: 18,
    openMaintenanceTickets: 8,
  },
  facilitiesRoster: [
    { block: 'Block A (Boys Hostel)', warden: 'Mr. Pradeep Joshi', capacity: 450, occupancy: 432, status: 'Normal' },
    { block: 'Block B (Boys Hostel)', warden: 'Mr. M. Karthikeyan', capacity: 500, occupancy: 485, status: 'Normal' },
    { block: 'Block C (Girls Hostel)', warden: 'Mrs. Jayanti Sharma', capacity: 480, occupancy: 460, status: 'Geyser Repair Pending' },
    { block: 'Block D (Girls Hostel)', warden: 'Dr. Sunita Paul', capacity: 450, occupancy: 410, status: 'Normal' },
    { block: 'Block E (Postgraduate Wings)', warden: 'Dr. T. Ravindran', capacity: 320, occupancy: 295, status: 'Normal' },
  ],
  transportFleet: [
    { routeNo: 'Route 1', destination: 'City Center Metro Junction', busNumber: 'KA-05-EX-4412', driver: 'Rajesh G.', onTimeStatus: 'On Schedule' },
    { routeNo: 'Route 4', destination: 'North Suburban Terminal', busNumber: 'KA-05-EX-8821', driver: 'Imran Khan', onTimeStatus: '5 Min Delay' },
    { routeNo: 'Route 7', destination: 'Tech Corridor Hub', busNumber: 'KA-05-EX-1904', driver: 'B. Srinivas', onTimeStatus: 'On Schedule' },
    { routeNo: 'Route 14', destination: 'South Bypass Ring Road', busNumber: 'KA-05-EX-6523', driver: 'Gurpreet Singh', onTimeStatus: '12 Min Delay (Traffic)' },
  ]
};

export const DEMO_SUPER_ADMIN = {
  name: 'DevOps & Enterprise Security Team',
  role: 'Super Administrator',
  systemVersion: 'CampusVerse AI v1.0.0-rc1',
  environment: 'Development & Architectural Staging',
  overallHealth: 'Operational (99.98% Uptime)',
  databaseEngine: 'MongoDB Replica Set (Staged for Part 2)',
  activeServices: [
    { name: 'Frontend React UI (Part 1)', status: 'Active & Verified', latency: '4ms', version: 'v1.0.0' },
    { name: 'Core API Gateway (Part 2)', status: 'Planned / Staged', latency: '—', version: 'v2.0.0 Target' },
    { name: 'Auth & JWT Engine (Part 2)', status: 'Architecture Ready', latency: '—', version: 'v2.0.0 Target' },
    { name: 'AI Reasoning Service (Part 3)', status: 'Specification Ready', latency: '—', version: 'v3.0.0 Target' },
    { name: 'Real-time WebSocket Bus (Part 4)', status: 'Planned', latency: '—', version: 'v4.0.0 Target' },
  ],
  plannedModulesMatrix: [
    { id: 1, name: 'Student Information System (SIS)', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 2, name: 'Faculty & Course Management', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 3, name: 'Academic Attendance Tracking', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 4, name: 'Examination & Grading Portal', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 5, name: 'Fee Collection & Invoicing', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 6, name: 'Timetable & Scheduling Matrix', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 7, name: 'Campus Placement & Recruitment', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 8, name: 'Hostel & Room Allotment', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 9, name: 'Transport & Fleet Logistics', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 10, name: 'Parent & Guardian Portal', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 11, name: 'Grievance & Ticket Redressal', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 12, name: 'Library & Digital Repository', phase: 'Part 2 Extension', status: 'Architecture Staged' },
    { id: 13, name: 'AI Learning Analytics & Copilot', phase: 'Part 3 (FastAPI/PyTorch)', status: 'Specification Ready' },
    { id: 14, name: 'Smart Event & Notice Broadcasting', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
    { id: 15, name: 'Executive Administration & Audits', phase: 'Part 1 (UI) / Part 2 (DB)', status: 'UI Prepared' },
  ]
};
