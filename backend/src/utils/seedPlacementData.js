const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementProfile = require('../models/PlacementProfile');
const PlacementApplication = require('../models/PlacementApplication');
const PlacementNotice = require('../models/PlacementNotice');
const Student = require('../models/Student');

async function seedPlacementData() {
  try {
    const students = await Student.find();
    if (students.length === 0) {
      console.log('[SeedPlacement] No students found, skipping.');
      return;
    }

    const aarav = students.find((s) => s.studentId === 'CS21B1042') || students[0];
    const aditi = students.find((s) => s.studentId === 'CS21B1001') || students[1] || students[0];
    const rohan = students.find((s) => s.studentId === 'EC22B2014') || students[2] || students[0];
    const pooja = students.find((s) => s.studentId === 'ME23B3008') || students[3] || students[0];

    // 1. Seed Companies
    const existingCompanies = await Company.countDocuments();
    let companies = [];
    if (existingCompanies === 0) {
      const companiesData = [
        {
          name: 'Google India',
          industry: 'Software, Search & Cloud Infrastructure',
          website: 'https://careers.google.com',
          contactEmail: 'campus-recruitment-india@google.com',
          contactPerson: 'Priyanka Sen',
          contactPhone: '+91 (80) 6721-8000',
          location: 'Bangalore & Hyderabad, India',
          tier: 'Tier 1 (Dream)',
          status: 'Active Partner',
          about: 'Multinational technology company focusing on search engine technology, cloud computing, computer software, and artificial intelligence.',
        },
        {
          name: 'Microsoft',
          industry: 'Enterprise Software, Azure Cloud & AI',
          website: 'https://careers.microsoft.com',
          contactEmail: 'university-hiring@microsoft.com',
          contactPerson: 'David V. Armstrong',
          contactPhone: '+91 (40) 6696-0000',
          location: 'Hyderabad & Bangalore, India',
          tier: 'Tier 1 (Dream)',
          status: 'Active Partner',
          about: 'Pioneering global technology corporation providing Azure cloud computing, productivity suites, and generative AI enterprise integrations.',
        },
        {
          name: 'Amazon Web Services',
          industry: 'Cloud Platform & High-Scale Systems',
          website: 'https://amazon.jobs',
          contactEmail: 'aws-campus-india@amazon.com',
          contactPerson: 'Anita Rao',
          contactPhone: '+91 (80) 4103-2000',
          location: 'Bangalore, India',
          tier: 'Tier 1 (Dream)',
          status: 'Active Partner',
          about: 'World’s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally.',
        },
        {
          name: 'Goldman Sachs',
          industry: 'Financial Technology & Quantitative Trading',
          website: 'https://www.goldmansachs.com/careers',
          contactEmail: 'gs-campus-india@gs.com',
          contactPerson: 'Siddharth Iyer',
          contactPhone: '+91 (80) 4127-1000',
          location: 'Bangalore, India',
          tier: 'Tier 1 (Dream)',
          status: 'Active Partner',
          about: 'Global financial services institution providing investment banking, securities, asset management, and high-frequency algorithmic systems.',
        },
        {
          name: 'Tata Consultancy Services',
          industry: 'Digital Systems & Enterprise Consulting',
          website: 'https://www.tcs.com/careers',
          contactEmail: 'campus.tcs@tcs.com',
          contactPerson: 'K. Venkatraman',
          contactPhone: '+91 (22) 6778-9999',
          location: 'Pan-India',
          tier: 'Standard Corporate',
          status: 'Active Partner',
          about: 'Global leader in IT services, consulting, and business solutions with active recruitment drives across top engineering institutes.',
        },
      ];

      companies = await Company.insertMany(companiesData);
      console.log(`[SeedPlacement] Seeded ${companies.length} companies.`);
    } else {
      companies = await Company.find();
    }

    // 2. Seed Placement Drives
    const existingDrives = await PlacementDrive.countDocuments();
    let drives = [];
    if (existingDrives === 0) {
      const google = companies.find((c) => c.name.includes('Google')) || companies[0];
      const msft = companies.find((c) => c.name.includes('Microsoft')) || companies[1];
      const aws = companies.find((c) => c.name.includes('Amazon')) || companies[2];
      const gs = companies.find((c) => c.name.includes('Goldman')) || companies[3];
      const tcs = companies.find((c) => c.name.includes('Tata')) || companies[4];

      const drivesData = [
        {
          company: google._id,
          companyName: google.name,
          jobTitle: 'Software Development Engineer - I (SDE-1)',
          jobType: 'Full-Time',
          description: 'Design and build world-class large-scale distributed systems and backend infrastructure powering billions of user queries daily.',
          salaryPackage: { minLPA: 32, maxLPA: 45, displayPackage: '₹ 38.5 LPA (CTC)' },
          requiredSkills: ['Data Structures & Algorithms', 'C++ / Java / Python', 'Distributed Systems', 'Computer Networks'],
          eligibilityCriteria: {
            minCgpa: 8.0,
            maxBacklogs: 0,
            eligibleDepartments: ['Computer Science & Engineering', 'Electronics & Communication'],
            eligibleBatch: 2026,
          },
          driveDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
          applicationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          venue: 'Auditorium 2 & Online HackerEarth Proctoring Hall',
          evaluationRounds: ['Online Algorithmic Assessment (90 Mins)', 'Technical Round 1 (Data Structures)', 'Technical Round 2 (System Architecture)', 'Googliness & Leadership Fit'],
          status: 'Registration Open',
          totalApplicationsCount: 148,
          totalShortlistedCount: 18,
          totalOffersCount: 2,
        },
        {
          company: msft._id,
          companyName: msft.name,
          jobTitle: 'Cloud Solution Engineer (Azure AI)',
          jobType: 'Full-Time',
          description: 'Architect next-generation enterprise solutions combining Azure cloud microservices, Kubernetes orchestration, and OpenAI LLM deployments.',
          salaryPackage: { minLPA: 28, maxLPA: 42, displayPackage: '₹ 32.0 LPA (CTC)' },
          requiredSkills: ['Cloud Architecture', 'Python / C#', 'REST APIs', 'Containerization (Docker/K8s)'],
          eligibilityCriteria: {
            minCgpa: 7.5,
            maxBacklogs: 0,
            eligibleDepartments: ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering'],
            eligibleBatch: 2026,
          },
          driveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          venue: 'Main Campus Placement Block & Microsoft Teams Virtual Room',
          evaluationRounds: ['Online Screening Test', 'Technical Problem Solving', 'Azure Scenario Defense', 'HR Discussion'],
          status: 'Registration Open',
          totalApplicationsCount: 192,
          totalShortlistedCount: 24,
          totalOffersCount: 1,
        },
        {
          company: aws._id,
          companyName: aws.name,
          jobTitle: 'Cloud Software Engineer Intern + PPO',
          jobType: 'Internship + PPO',
          description: '6-month software development internship with guaranteed Pre-Placement Offer (PPO) upon milestone reviews.',
          salaryPackage: { minLPA: 26, maxLPA: 34, displayPackage: '₹ 1,10,000 / mo + ₹ 30 LPA PPO' },
          requiredSkills: ['Data Structures', 'Linux OS', 'Java / Python', 'Database Internals'],
          eligibilityCriteria: {
            minCgpa: 7.5,
            maxBacklogs: 0,
            eligibleDepartments: ['Computer Science & Engineering', 'Electronics & Communication'],
            eligibleBatch: 2026,
          },
          driveDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          venue: 'Auditorium 1 Computer Labs',
          evaluationRounds: ['Amazon Online Assessment (OA)', 'Technical Interview 1', 'Bar Raiser Round'],
          status: 'Upcoming',
          totalApplicationsCount: 110,
          totalShortlistedCount: 14,
          totalOffersCount: 0,
        },
        {
          company: gs._id,
          companyName: gs.name,
          jobTitle: 'Quantitative Technology Analyst',
          jobType: 'Full-Time',
          description: 'Develop low-latency trade execution engines, financial risk models, and algorithmic hedging infrastructure.',
          salaryPackage: { minLPA: 22, maxLPA: 30, displayPackage: '₹ 26.5 LPA (CTC)' },
          requiredSkills: ['C++', 'Python', 'Probability & Statistics', 'Object Oriented Programming'],
          eligibilityCriteria: {
            minCgpa: 8.0,
            maxBacklogs: 0,
            eligibleDepartments: ['Computer Science & Engineering', 'Electronics & Communication'],
            eligibleBatch: 2026,
          },
          driveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          venue: 'Online HackerRank Assessment',
          evaluationRounds: ['Math & Coding Test', 'Technical Round 1', 'Engineering Colleague Round'],
          status: 'Upcoming',
          totalApplicationsCount: 85,
          totalShortlistedCount: 10,
          totalOffersCount: 0,
        },
        {
          company: tcs._id,
          companyName: tcs.name,
          jobTitle: 'Digital Technology Specialist',
          jobType: 'Full-Time',
          description: 'Design enterprise IoT platforms, core mechanical automation tools, and full-stack enterprise portals.',
          salaryPackage: { minLPA: 7, maxLPA: 11, displayPackage: '₹ 9.0 LPA (CTC)' },
          requiredSkills: ['Java / Python', 'Web Development', 'SQL', 'Aptitude'],
          eligibilityCriteria: {
            minCgpa: 6.5,
            maxBacklogs: 1,
            eligibleDepartments: ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering'],
            eligibleBatch: 2026,
          },
          driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          venue: 'Campus Placement Labs A & B',
          evaluationRounds: ['TCS NQT Assessment', 'Technical Interview', 'HR Interview'],
          status: 'Upcoming',
          totalApplicationsCount: 240,
          totalShortlistedCount: 45,
          totalOffersCount: 0,
        },
      ];

      drives = await PlacementDrive.insertMany(drivesData);
      console.log(`[SeedPlacement] Seeded ${drives.length} placement drives.`);
    } else {
      drives = await PlacementDrive.find();
    }

    // 3. Seed Placement Student Profiles
    const existingProfiles = await PlacementProfile.countDocuments();
    if (existingProfiles === 0) {
      const profilesData = [
        {
          student: aarav._id,
          cgpa: 9.42,
          activeBacklogs: 0,
          technicalSkills: ['C++', 'React', 'Node.js', 'Distributed Systems', 'Docker', 'System Design'],
          resumeUrl: 'https://campusverse.edu/resumes/aarav_singhania_cv.pdf',
          githubUrl: 'https://github.com/aarav-singhania',
          linkedinUrl: 'https://linkedin.com/in/aarav-singhania',
          portfolioUrl: 'https://aarav-singhania.dev',
          isRegistered: true,
          isEligible: true,
          placementStatus: 'Placed',
          placedCompany: 'Google India',
          offeredCtc: '₹ 38.5 LPA',
          offerLetterUrl: 'https://campusverse.edu/offers/google_aarav_offer.pdf',
        },
        {
          student: aditi._id,
          cgpa: 9.18,
          activeBacklogs: 0,
          technicalSkills: ['Python', 'PyTorch', 'SQL', 'NLP', 'Azure AI', 'Docker'],
          resumeUrl: 'https://campusverse.edu/resumes/aditi_nair_cv.pdf',
          githubUrl: 'https://github.com/aditi-nair',
          linkedinUrl: 'https://linkedin.com/in/aditi-nair',
          portfolioUrl: 'https://aditinair.ai',
          isRegistered: true,
          isEligible: true,
          placementStatus: 'Placed',
          placedCompany: 'Microsoft',
          offeredCtc: '₹ 32.0 LPA',
          offerLetterUrl: 'https://campusverse.edu/offers/msft_aditi_offer.pdf',
        },
        {
          student: rohan._id,
          cgpa: 8.45,
          activeBacklogs: 0,
          technicalSkills: ['Verilog', 'Embedded C', 'Python', 'IoT', 'React', 'Linux'],
          resumeUrl: 'https://campusverse.edu/resumes/rohan_deshmukh_cv.pdf',
          githubUrl: 'https://github.com/rohan-deshmukh',
          linkedinUrl: 'https://linkedin.com/in/rohan-deshmukh',
          isRegistered: true,
          isEligible: true,
          placementStatus: 'Interviewing',
        },
        {
          student: pooja._id,
          cgpa: 8.12,
          activeBacklogs: 0,
          technicalSkills: ['SolidWorks', 'MATLAB', 'Python', 'Finite Element Analysis', 'Robotics'],
          resumeUrl: 'https://campusverse.edu/resumes/pooja_iyer_cv.pdf',
          githubUrl: 'https://github.com/pooja-iyer',
          linkedinUrl: 'https://linkedin.com/in/pooja-iyer',
          isRegistered: true,
          isEligible: true,
          placementStatus: 'Shortlisted',
        },
      ];

      await PlacementProfile.insertMany(profilesData);
      console.log('[SeedPlacement] Seeded placement student profiles.');
    }

    // 4. Seed Applications & Recruitment Pipeline
    const existingApps = await PlacementApplication.countDocuments();
    if (existingApps === 0) {
      const googleDrive = drives.find((d) => d.companyName.includes('Google')) || drives[0];
      const msftDrive = drives.find((d) => d.companyName.includes('Microsoft')) || drives[1];
      const awsDrive = drives.find((d) => d.companyName.includes('Amazon')) || drives[2];
      const tcsDrive = drives.find((d) => d.companyName.includes('Tata')) || drives[4];

      const applicationsData = [
        {
          student: aarav._id,
          drive: googleDrive._id,
          status: 'Selected / Offered',
          currentRound: 'Offer Dispatched & Accepted',
          offerDetails: {
            designation: 'Software Development Engineer - I',
            offeredCtc: '₹ 38.5 LPA',
            joiningLocation: 'Google Signature Towers, Bangalore',
            offerDate: new Date('2026-10-15'),
          },
          remarks: 'Exceptional performance in Distributed Systems and Algorithmic Complexity rounds.',
        },
        {
          student: aditi._id,
          drive: msftDrive._id,
          status: 'Selected / Offered',
          currentRound: 'Offer Dispatched',
          offerDetails: {
            designation: 'Cloud Solution Engineer (Azure AI)',
            offeredCtc: '₹ 32.0 LPA',
            joiningLocation: 'Microsoft Campus, Hyderabad',
            offerDate: new Date('2026-10-18'),
          },
          remarks: 'Top scorer in LLM orchestration and cloud security scenario assessment.',
        },
        {
          student: rohan._id,
          drive: awsDrive._id,
          status: 'Interview Scheduled',
          currentRound: 'Technical Interview Round 2',
          interviewSchedule: {
            roundName: 'System Architecture & Bar Raiser Round',
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
            time: '11:00 AM IST',
            venueOrLink: 'https://amazon.chime.aws/v4/campus-interview-9921',
            interviewerNotes: 'Candidate cleared OA with 100% test cases passed. Focus on scalable distributed caching.',
          },
          remarks: 'Shortlisted after stellar performance in AWS OA.',
        },
        {
          student: pooja._id,
          drive: tcsDrive._id,
          status: 'Shortlisted',
          currentRound: 'Technical Interview 1',
          interviewSchedule: {
            roundName: 'Technical & Engineering Design Round',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            time: '02:30 PM IST',
            venueOrLink: 'Placement Block Room 102 & MS Teams',
            interviewerNotes: 'Evaluation for Digital R&D Specialist position.',
          },
          remarks: 'Ranked in top 5% of TCS NQT qualifier exam.',
        },
      ];

      await PlacementApplication.insertMany(applicationsData);
      console.log('[SeedPlacement] Seeded placement applications.');
    }

    // 5. Seed Placement Notices
    const existingNotices = await PlacementNotice.countDocuments();
    if (existingNotices === 0) {
      const noticesData = [
        {
          title: 'Google India Campus Recruitment 2026: Online Coding Assessment Guidelines',
          companyName: 'Google India',
          content: 'All shortlisted candidates for Google SDE-1 role must report to Auditorium 2 with their university smart identity cards at 08:30 AM sharp. HackerEarth credentials will be dispatched to registered institutional emails 15 minutes prior to the test. Ensure personal laptops meet browser proctoring requirements with webcam enabled.',
          category: 'Drive Alert',
          targetBatch: 2026,
          targetDepartments: ['Computer Science & Engineering', 'Electronics & Communication'],
          authorName: 'Prof. Vikramaditya (Head, T&P Cell)',
          pinned: true,
          publishedAt: new Date(),
        },
        {
          title: 'Microsoft Azure Cloud Drive: Technical Interview Shortlists Announced',
          companyName: 'Microsoft',
          content: 'The Training & Placement Cell is proud to announce that 24 students have advanced to the technical interview rounds for Microsoft Cloud Solution Engineer role. Virtual Teams meeting links and individual panel time-slots have been synchronized to student portal dashboards. Formal institutional business attire is strictly mandatory.',
          category: 'Shortlist Announced',
          targetBatch: 2026,
          targetDepartments: ['All Departments'],
          authorName: 'Prof. Vikramaditya (Head, T&P Cell)',
          pinned: true,
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          title: 'Pre-Placement Offer (PPO) & Acceptance Policy for Class of 2026',
          category: 'Policy & Guidelines',
          content: 'In accordance with University Placement Ordinance §9.4, once a candidate receives and accepts an offer from a Tier 1 Dream company (CTC >= ₹ 20 LPA), they are considered "Placed" and cannot register for subsequent standard drives. This ensures equitable opportunity distribution across all graduating batchmates.',
          targetBatch: 2026,
          targetDepartments: ['All Departments'],
          authorName: 'Office of Corporate Relations & Placements',
          pinned: false,
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ];

      await PlacementNotice.insertMany(noticesData);
      console.log('[SeedPlacement] Seeded placement notices.');
    }

    console.log('[SeedPlacement] Placement Cell data seeded successfully.');
  } catch (err) {
    console.error('[SeedPlacement] Seeding error:', err);
  }
}

module.exports = { seedPlacementData };
