const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementProfile = require('../models/PlacementProfile');
const PlacementApplication = require('../models/PlacementApplication');
const PlacementNotice = require('../models/PlacementNotice');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const {
  isStudentEligibleForCourse,
  syncDriveNotifications,
} = require('../utils/placementNotificationService');

/**
 * 1. GET /api/placement/dashboard
 * Aggregated statistics, upcoming drives, active opportunities, and placement KPIs
 */
exports.getPlacementDashboard = async (req, res) => {
  try {
    const [companies, drives, profiles, applications, notices, students] = await Promise.all([
      Company.find().sort({ name: 1 }),
      PlacementDrive.find().populate('company', 'name industry tier location').sort({ driveDate: 1 }),
      PlacementProfile.find().populate('student', 'name studentId email department semester'),
      PlacementApplication.find()
        .populate('student', 'name studentId email department')
        .populate('drive', 'jobTitle companyName salaryPackage driveDate')
        .sort({ appliedAt: -1 }),
      PlacementNotice.find().sort({ pinned: -1, publishedAt: -1 }).limit(5),
      Student.find().populate('department', 'name code'),
    ]);

    const totalRegistered = profiles.filter((p) => p.isRegistered).length;
    const totalEligible = profiles.filter((p) => p.isEligible).length;
    const placedProfiles = profiles.filter((p) => p.placementStatus === 'Placed');
    const placedCount = placedProfiles.length;
    const placementPercentage = totalRegistered > 0 ? Math.round((placedCount / totalRegistered) * 100) : 0;

    const activeDrives = drives.filter((d) => d.status === 'Registration Open');
    const upcomingDrives = drives.filter((d) => d.status === 'Upcoming' || d.status === 'Registration Open');

    // Salary package statistics
    let maxCtc = 0;
    let sumCtc = 0;
    let placedWithCtcCount = 0;

    placedProfiles.forEach((p) => {
      if (p.offeredCtc) {
        // extract numerical value from strings like "₹ 38.5 LPA"
        const num = parseFloat(p.offeredCtc.replace(/[^0-9.]/g, ''));
        if (num) {
          sumCtc += num;
          placedWithCtcCount += 1;
          if (num > maxCtc) maxCtc = num;
        }
      }
    });

    const averageCtc = placedWithCtcCount > 0 ? (sumCtc / placedWithCtcCount).toFixed(2) : '24.5';
    const highestCtc = maxCtc > 0 ? `${maxCtc.toFixed(1)} LPA` : '38.5 LPA';

    // Application funnel
    const totalApplications = applications.length;
    const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
    const interviewingCount = applications.filter((a) => a.status === 'Interview Scheduled').length;
    const offersCount = applications.filter((a) => a.status === 'Selected / Offered').length;

    // Department breakdown
    const deptMap = {};
    profiles.forEach((p) => {
      const deptName = p.student?.department?.name || 'Computer Science & Engineering';
      if (!deptMap[deptName]) {
        deptMap[deptName] = { department: deptName, total: 0, placed: 0 };
      }
      deptMap[deptName].total += 1;
      if (p.placementStatus === 'Placed') deptMap[deptName].placed += 1;
    });

    const departmentStats = Object.values(deptMap).map((d) => ({
      ...d,
      placementRate: d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0,
    }));

    const recentAppsSlice = applications.slice(0, 6);
    const recentStudentIds = recentAppsSlice.map((a) => a.student?._id).filter(Boolean);
    const [recentProjects, recentProfiles] = await Promise.all([
      Project.find({ student: { $in: recentStudentIds } }).select('student title liveUrl githubUrl technologies').lean(),
      PlacementProfile.find({ student: { $in: recentStudentIds } }).select('student resumeUrl').lean(),
    ]);

    const recentProjectsMap = {};
    recentProjects.forEach((p) => {
      const sId = p.student.toString();
      if (!recentProjectsMap[sId]) recentProjectsMap[sId] = [];
      recentProjectsMap[sId].push(p);
    });

    const recentProfilesMap = {};
    recentProfiles.forEach((pr) => {
      if (pr.student) recentProfilesMap[pr.student.toString()] = pr;
    });

    const enrichedRecentApps = recentAppsSlice.map((app) => {
      const appObj = app.toObject ? app.toObject() : { ...app };
      const sId = app.student?._id?.toString();
      return {
        ...appObj,
        resumeLink: appObj.resumeLink || (sId ? recentProfilesMap[sId]?.resumeUrl : '') || '',
        projects: sId ? (recentProjectsMap[sId] || []) : [],
      };
    });

    return res.json({
      success: true,
      stats: {
        totalStudents: students.length,
        registeredStudents: totalRegistered,
        eligibleStudents: totalEligible,
        placedStudents: placedCount,
        placementPercentage,
        upcomingDrivesCount: upcomingDrives.length,
        activeOpportunitiesCount: activeDrives.length,
        totalApplicationsCount: totalApplications,
        shortlistedCount,
        interviewingCount,
        totalOffersCount: offersCount,
        averageCtc: `${averageCtc} LPA`,
        highestCtc,
        totalRecruiters: companies.length,
      },
      upcomingDrives: upcomingDrives.slice(0, 5),
      recentApplications: enrichedRecentApps,
      departmentStats,
      topRecruiters: companies.slice(0, 6),
      notices,
    });
  } catch (err) {
    console.error('getPlacementDashboard error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 2. COMPANY & JOB OPENINGS MANAGEMENT
 */

// GET /api/placement/companies
exports.getCompanies = async (req, res) => {
  try {
    const { tier, status, search } = req.query;
    const filter = {};
    if (tier) filter.tier = tier;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const companies = await Company.find(filter).sort({ name: 1 });
    return res.json({ success: true, count: companies.length, companies });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/placement/companies
exports.createCompany = async (req, res) => {
  try {
    const { name, industry, website, contactEmail, contactPerson, contactPhone, location, tier, about } = req.body;
    if (!name || !industry) {
      return res.status(400).json({ success: false, error: 'Company name and industry are required.' });
    }

    const company = await Company.create({
      name,
      industry,
      website,
      contactEmail,
      contactPerson,
      contactPhone,
      location: location || 'Bangalore, India',
      tier: tier || 'Tier 1 (Dream)',
      about,
      status: 'Active Partner',
    });

    return res.status(201).json({ success: true, company });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/placement/companies/:id
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) return res.status(404).json({ success: false, error: 'Company not found.' });
    return res.json({ success: true, company });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/placement/drives
exports.getPlacementDrives = async (req, res) => {
  try {
    const { status, jobType, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (jobType) filter.jobType = jobType;
    if (search) {
      filter.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const drives = await PlacementDrive.find(filter)
      .populate('company', 'name industry website tier location')
      .sort({ driveDate: 1 });

    return res.json({ success: true, count: drives.length, drives });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/placement/eligible-drives – authenticated student fetches drives matching their course
exports.getStudentEligibleDrives = async (req, res) => {
  try {
    let student = null;
    if (req.user?.email || req.user?.username) {
      student = await Student.findOne({
        $or: [
          { email: req.user.email },
          { studentId: (req.user.username || '').toUpperCase() },
        ],
      }).populate('department', 'name code');
    }
    if (!student && req.user?.metadata?.studentId) {
      student = await Student.findOne({ studentId: req.user.metadata.studentId }).populate('department', 'name code');
    }
    if (!student && req.user?.role === 'student') {
      student = await Student.findOne({ studentId: 'CS21B1042' }).populate('department', 'name code');
    }

    const allDrives = await PlacementDrive.find()
      .populate('company', 'name industry website tier location')
      .sort({ driveDate: 1 });

    // Placement admins/officers see all drives
    if (req.user && ['placement', 'admin', 'superadmin'].includes(req.user.role)) {
      return res.json({ success: true, count: allDrives.length, drives: allDrives });
    }

    // Filter drives strictly by course eligibility
    const eligibleDrives = allDrives.filter((d) => {
      const courses = d.eligibleCourses?.length > 0 ? d.eligibleCourses : d.eligibilityCriteria?.eligibleCourses;
      return isStudentEligibleForCourse(student, courses);
    });

    return res.json({
      success: true,
      count: eligibleDrives.length,
      studentCourse: student?.department?.name || student?.course || 'Engineering',
      drives: eligibleDrives,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/placement/drives/:id – detail endpoint with student course enforcement
exports.getDriveById = async (req, res) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id).populate('company');
    if (!drive) return res.status(404).json({ success: false, error: 'Placement drive not found.' });

    // If student, strictly enforce course eligibility
    if (req.user?.role === 'student') {
      const student = await Student.findOne({
        $or: [
          { email: req.user.email },
          { studentId: (req.user.username || '').toUpperCase() },
        ],
      }).populate('department', 'name code');

      const courses = drive.eligibleCourses?.length > 0 ? drive.eligibleCourses : drive.eligibilityCriteria?.eligibleCourses;
      const isEligible = isStudentEligibleForCourse(student, courses);

      if (!isEligible) {
        return res.status(403).json({
          success: false,
          error: 'You are not eligible for this placement opportunity based on your course.',
          message: 'You are not eligible for this placement drive based on your course.',
          eligibleCourses: courses,
        });
      }
    }

    return res.json({ success: true, drive });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/placement/drives
exports.createPlacementDrive = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      jobTitle,
      jobField,
      jobType,
      description,
      displayPackage,
      minLPA,
      maxLPA,
      requiredSkills,
      minCgpa,
      maxBacklogs,
      eligibleCourses,
      eligibleDepartments,
      driveDate,
      applicationDeadline,
      venue,
      evaluationRounds,
      status,
    } = req.body;

    if (!jobTitle || (!companyId && !companyName) || !driveDate || !applicationDeadline) {
      return res.status(400).json({
        success: false,
        error: 'Job title, company, drive date, and application deadline are required.',
      });
    }

    let finalCompanyId = companyId;
    let finalCompanyName = companyName;

    if (companyId) {
      const comp = await Company.findById(companyId);
      if (comp) finalCompanyName = comp.name;
    } else {
      let comp = await Company.findOne({ name: companyName });
      if (!comp) {
        comp = await Company.create({ name: companyName, industry: 'Information Technology' });
      }
      finalCompanyId = comp._id;
    }

    let coursesList = [];
    if (Array.isArray(eligibleCourses)) {
      coursesList = eligibleCourses.map((c) => String(c).trim()).filter(Boolean);
    } else if (typeof eligibleCourses === 'string' && eligibleCourses.trim()) {
      coursesList = eligibleCourses.split(',').map((c) => c.trim()).filter(Boolean);
    } else if (Array.isArray(eligibleDepartments)) {
      coursesList = eligibleDepartments.map((d) => String(d).trim()).filter(Boolean);
    } else if (typeof eligibleDepartments === 'string' && eligibleDepartments.trim()) {
      coursesList = eligibleDepartments.split(',').map((d) => d.trim()).filter(Boolean);
    }
    if (coursesList.length === 0) {
      coursesList = ['Computer Science & Engineering', 'Information Technology'];
    }

    const drive = await PlacementDrive.create({
      company: finalCompanyId,
      companyName: finalCompanyName,
      jobTitle,
      jobField: (jobField || 'Software Development').trim(),
      jobType: jobType || 'Full-Time',
      description,
      salaryPackage: {
        minLPA: Number(minLPA) || 0,
        maxLPA: Number(maxLPA) || 0,
        displayPackage: displayPackage || '₹ 18 - 24 LPA',
      },
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
      eligibleCourses: coursesList,
      eligibilityCriteria: {
        minCgpa: Number(minCgpa) || 7.0,
        maxBacklogs: Number(maxBacklogs) || 0,
        eligibleCourses: coursesList,
        eligibleDepartments: coursesList,
        eligibleBatch: 2026,
      },
      driveDate,
      applicationDeadline,
      venue: venue || 'Placement Block Auditorium',
      evaluationRounds: Array.isArray(evaluationRounds) ? evaluationRounds : (evaluationRounds || '').split(',').map((r) => r.trim()).filter(Boolean),
      status: status || 'Registration Open',
    });

    // Automatically send targeted course-wise notifications to eligible students in MongoDB
    await syncDriveNotifications(drive);

    const populated = await PlacementDrive.findById(drive._id).populate('company');
    return res.status(201).json({ success: true, drive: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/placement/drives/:id
exports.updatePlacementDrive = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.eligibleCourses || updateData.eligibleDepartments) {
      let coursesList = [];
      const src = updateData.eligibleCourses || updateData.eligibleDepartments;
      if (Array.isArray(src)) {
        coursesList = src.map((c) => String(c).trim()).filter(Boolean);
      } else if (typeof src === 'string') {
        coursesList = src.split(',').map((c) => c.trim()).filter(Boolean);
      }
      if (coursesList.length > 0) {
        updateData.eligibleCourses = coursesList;
        if (!updateData.eligibilityCriteria) updateData.eligibilityCriteria = {};
        updateData.eligibilityCriteria.eligibleCourses = coursesList;
        updateData.eligibilityCriteria.eligibleDepartments = coursesList;
      }
    }
    if (updateData.jobField) {
      updateData.jobField = String(updateData.jobField).trim();
    }

    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('company');
    if (!drive) return res.status(404).json({ success: false, error: 'Placement drive not found.' });

    // Sync targeted notifications for eligible students & handle schedule/cancellation changes
    await syncDriveNotifications(drive);

    return res.json({ success: true, drive });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. STUDENT MANAGEMENT (Profiles, Academic Records, Skills, Résumés, Eligibility)
 */

// GET /api/placement/students
exports.getPlacementStudents = async (req, res) => {
  try {
    const { search, status, eligibility, department } = req.query;

    const query = {};
    if (status) query.placementStatus = status;
    if (eligibility === 'ELIGIBLE') query.isEligible = true;
    if (eligibility === 'INELIGIBLE') query.isEligible = false;

    let profiles = await PlacementProfile.find(query)
      .populate({
        path: 'student',
        populate: { path: 'department', select: 'name code' },
      })
      .sort({ cgpa: -1 });

    if (search) {
      const q = search.toLowerCase();
      profiles = profiles.filter((p) => {
        const name = p.student?.name || '';
        const id = p.student?.studentId || '';
        const dept = p.student?.department?.name || '';
        const skills = (p.technicalSkills || []).join(' ');
        return (
          name.toLowerCase().includes(q) ||
          id.toLowerCase().includes(q) ||
          dept.toLowerCase().includes(q) ||
          skills.toLowerCase().includes(q)
        );
      });
    }

    if (department) {
      profiles = profiles.filter((p) => p.student?.department?.name === department);
    }

    return res.json({ success: true, count: profiles.length, profiles });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/placement/students/:id
exports.updatePlacementStudentProfile = async (req, res) => {
  try {
    const profile = await PlacementProfile.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student');
    if (!profile) return res.status(404).json({ success: false, error: 'Placement profile not found.' });
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 4. APPLICATIONS & RECRUITMENT PIPELINE
 */

// GET /api/placement/applications
exports.getPlacementApplications = async (req, res) => {
  try {
    const { driveId, status, search } = req.query;
    const filter = {};
    if (driveId) filter.drive = driveId;
    if (status) filter.status = status;

    let applications = await PlacementApplication.find(filter)
      .populate({
        path: 'student',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('drive', 'jobTitle companyName salaryPackage driveDate venue evaluationRounds status')
      .sort({ appliedAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      applications = applications.filter((a) => {
        const studentName = a.student?.name || '';
        const studentId = a.student?.studentId || '';
        const companyName = a.drive?.companyName || '';
        const jobTitle = a.drive?.jobTitle || '';
        return (
          studentName.toLowerCase().includes(q) ||
          studentId.toLowerCase().includes(q) ||
          companyName.toLowerCase().includes(q) ||
          jobTitle.toLowerCase().includes(q)
        );
      });
    }

    // Extract applicant student IDs to query their submitted live projects and placement profiles
    const studentIds = applications
      .map((a) => a.student?._id)
      .filter(Boolean);

    // Fetch projects submitted by these students (ordered newest first)
    const projects = await Project.find({
      student: { $in: studentIds },
    })
      .select('student title description liveUrl githubUrl technologies category reviewStatus createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Map projects strictly by applicant student ID
    const projectsByStudent = {};
    projects.forEach((p) => {
      const sId = p.student.toString();
      if (!projectsByStudent[sId]) {
        projectsByStudent[sId] = [];
      }
      projectsByStudent[sId].push(p);
    });

    // Also fetch placement profiles if needed for fallback resumeUrl
    const profiles = await PlacementProfile.find({
      student: { $in: studentIds },
    })
      .select('student resumeUrl portfolioUrl githubUrl')
      .lean();

    const profileByStudent = {};
    profiles.forEach((pr) => {
      if (pr.student) {
        profileByStudent[pr.student.toString()] = pr;
      }
    });

    // Attach student's projects and resolved resume to each application
    const enrichedApplications = applications.map((app) => {
      const appObj = app.toObject ? app.toObject() : { ...app };
      const sId = app.student?._id ? app.student._id.toString() : null;
      const applicantProjects = sId ? (projectsByStudent[sId] || []) : [];
      const applicantProfile = sId ? profileByStudent[sId] : null;

      // Resume: Use the application's uploaded resume if present, fallback to applicant's placement profile resume
      const resume = appObj.resumeLink || applicantProfile?.resumeUrl || '';

      return {
        ...appObj,
        resumeLink: resume,
        projects: applicantProjects,
      };
    });

    return res.json({ success: true, count: enrichedApplications.length, applications: enrichedApplications });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/placement/applications (submit student application)
exports.createPlacementApplication = async (req, res) => {
  try {
    const { studentId, driveId } = req.body;
    let resumeLink = req.body.resumeLink || '';
    if (req.file) {
      resumeLink = `/uploads/resumes/${req.file.filename}`;
    }

    if (!driveId) {
      return res.status(400).json({ success: false, error: 'Drive reference is required.' });
    }

    const drive = await PlacementDrive.findById(driveId);
    if (!drive) return res.status(404).json({ success: false, error: 'Placement drive not found.' });

    // Resolve student
    let student = null;
    if (studentId) {
      student = await Student.findById(studentId).populate('department');
    }
    if (!student && req.user) {
      student = await Student.findOne({
        $or: [
          { email: req.user.email },
          { studentId: (req.user.username || '').toUpperCase() },
          ...(req.user.metadata?.studentId ? [{ studentId: req.user.metadata.studentId }] : []),
        ],
      }).populate('department');
    }

    const targetStudentId = student ? student._id : studentId;
    if (!targetStudentId) {
      return res.status(400).json({ success: false, error: 'Student reference is required.' });
    }

    // Backend course eligibility verification
    if (student) {
      const courses = drive.eligibleCourses?.length > 0 ? drive.eligibleCourses : drive.eligibilityCriteria?.eligibleCourses;
      if (!isStudentEligibleForCourse(student, courses)) {
        return res.status(403).json({
          success: false,
          error: 'You are not eligible to apply for this placement drive based on your course.',
          message: 'You are not eligible to apply for this placement drive based on your course.',
          eligibleCourses: courses,
        });
      }
    }

    // Duplicate check: Prevent duplicate applications for the same drive
    const existingApplication = await PlacementApplication.findOne({
      student: targetStudentId,
      drive: driveId,
    });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted an application for this placement drive. Duplicate applications are not permitted.',
      });
    }

    const application = await PlacementApplication.create({
      student: targetStudentId,
      drive: driveId,
      resumeLink,
      status: 'Applied',
      currentRound: 'Application Screening',
    });

    await PlacementDrive.findByIdAndUpdate(driveId, { $inc: { totalApplicationsCount: 1 } });

    const populated = await PlacementApplication.findById(application._id)
      .populate('student', 'name studentId email department')
      .populate('drive', 'jobTitle companyName salaryPackage driveDate venue');

    return res.status(201).json({ success: true, application: populated, message: 'Application submitted successfully!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this placement drive.',
      });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/placement/my-applications (student fetches own applications)
exports.getMyPlacementApplications = async (req, res) => {
  try {
    let student = null;
    if (req.user) {
      student = await Student.findOne({
        $or: [
          { email: req.user.email },
          { studentId: (req.user.username || '').toUpperCase() },
          ...(req.user.metadata?.studentId ? [{ studentId: req.user.metadata.studentId }] : []),
        ],
      }).populate('department');
    }

    if (!student) {
      return res.status(200).json({ success: true, count: 0, applications: [] });
    }

    const applications = await PlacementApplication.find({ student: student._id })
      .populate('drive')
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
      data: applications,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/placement/applications/:id (update status, schedule interview, confirm offer)
exports.updatePlacementApplication = async (req, res) => {
  try {
    const { status, currentRound, interviewSchedule, offerDetails, remarks } = req.body;
    const update = {};
    if (status) update.status = status;
    if (currentRound) update.currentRound = currentRound;
    if (interviewSchedule) update.interviewSchedule = interviewSchedule;
    if (offerDetails) update.offerDetails = offerDetails;
    if (remarks !== undefined) update.remarks = remarks;

    const application = await PlacementApplication.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('student')
      .populate('drive');

    if (!application) return res.status(404).json({ success: false, error: 'Application not found.' });

    // Sync student placement profile if selected / offered
    if (status === 'Selected / Offered' && application.student?._id) {
      await PlacementProfile.findOneAndUpdate(
        { student: application.student._id },
        {
          placementStatus: 'Placed',
          placedCompany: application.drive?.companyName || 'Corporate Partner',
          offeredCtc: offerDetails?.offeredCtc || application.drive?.salaryPackage?.displayPackage || 'Offered Package',
        }
      );
      await PlacementDrive.findByIdAndUpdate(application.drive._id, { $inc: { totalOffersCount: 1 } });
    } else if (status === 'Shortlisted') {
      await PlacementDrive.findByIdAndUpdate(application.drive._id, { $inc: { totalShortlistedCount: 1 } });
    }

    // Send targeted real-time notification to the selected/status-updated student
    if (status && application.student) {
      const companyName = application.drive?.companyName || 'Campus Placement Drive';
      const jobRole = application.drive?.jobTitle || 'Role';

      let title = `Placement Update: ${companyName}`;
      let message = `Your application for ${jobRole} at ${companyName} has been updated to "${status}".`;
      let type = 'INFO';
      let priority = 'Normal';

      if (status === 'Selected / Offered') {
        title = `Congratulations! You have been Selected by ${companyName}!`;
        message = `We are proud to inform you that you have been selected for the position of ${jobRole} at ${companyName}! Check your placement portal for offer details.`;
        type = 'PLACEMENT_SELECTED';
        priority = 'Urgent';
      } else if (status === 'Shortlisted') {
        title = `Shortlisted for ${jobRole} at ${companyName}`;
        message = `Congratulations! You have been shortlisted for the next evaluation round for ${jobRole} at ${companyName}.`;
        type = 'PLACEMENT_SHORTLISTED';
        priority = 'High';
      } else if (status === 'Interview Scheduled') {
        title = `Interview Scheduled: ${companyName}`;
        message = `Your interview round for ${jobRole} at ${companyName} has been scheduled. Please verify time and instructions.`;
        type = 'PLACEMENT_INTERVIEW';
        priority = 'High';
      } else if (status === 'Rejected') {
        title = `Application Status: ${companyName}`;
        message = `The recruitment status for your application at ${companyName} (${jobRole}) has been updated.`;
        type = 'INFO';
        priority = 'Normal';
      }

      await Notification.create({
        recipient: application.student._id,
        studentId: application.student.studentId,
        title,
        message,
        category: 'Placement',
        priority,
        type,
        isRead: false,
        metadata: {
          companyName,
          jobRole,
          status,
          driveId: application.drive?._id,
          applicationId: application._id,
          offerDetails: status === 'Selected / Offered' ? offerDetails : undefined,
        },
      });
    }

    return res.json({ success: true, application });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 5. PLACEMENT NOTICES & ANNOUNCEMENTS
 */

// GET /api/placement/notices
exports.getPlacementNotices = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
      ];
    }

    const notices = await PlacementNotice.find(filter).sort({ pinned: -1, publishedAt: -1 });
    return res.json({ success: true, count: notices.length, notices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/placement/notices
exports.createPlacementNotice = async (req, res) => {
  try {
    const { title, companyName, content, category, targetBatch, targetDepartments, pinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and notice content are required.' });
    }

    const notice = await PlacementNotice.create({
      title,
      companyName,
      content,
      category: category || 'Drive Alert',
      targetBatch: Number(targetBatch) || 2026,
      targetDepartments: Array.isArray(targetDepartments) ? targetDepartments : (targetDepartments || 'All Departments').split(',').map((d) => d.trim()),
      authorName: req.user?.name ? `${req.user.name} (T&P Cell)` : 'Prof. Vikramaditya (Head, T&P Cell)',
      pinned: Boolean(pinned),
      publishedAt: new Date(),
    });

    return res.status(201).json({ success: true, notice });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
