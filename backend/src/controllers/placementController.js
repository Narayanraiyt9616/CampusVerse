const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementProfile = require('../models/PlacementProfile');
const PlacementApplication = require('../models/PlacementApplication');
const PlacementNotice = require('../models/PlacementNotice');
const Student = require('../models/Student');

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
      recentApplications: applications.slice(0, 6),
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

// POST /api/placement/drives
exports.createPlacementDrive = async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      jobTitle,
      jobType,
      description,
      displayPackage,
      minLPA,
      maxLPA,
      requiredSkills,
      minCgpa,
      maxBacklogs,
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

    const drive = await PlacementDrive.create({
      company: finalCompanyId,
      companyName: finalCompanyName,
      jobTitle,
      jobType: jobType || 'Full-Time',
      description,
      salaryPackage: {
        minLPA: Number(minLPA) || 0,
        maxLPA: Number(maxLPA) || 0,
        displayPackage: displayPackage || '₹ 18 - 24 LPA',
      },
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
      eligibilityCriteria: {
        minCgpa: Number(minCgpa) || 7.0,
        maxBacklogs: Number(maxBacklogs) || 0,
        eligibleDepartments: eligibleDepartments || ['Computer Science & Engineering', 'Electronics & Communication'],
        eligibleBatch: 2026,
      },
      driveDate,
      applicationDeadline,
      venue: venue || 'Placement Block Auditorium',
      evaluationRounds: Array.isArray(evaluationRounds) ? evaluationRounds : (evaluationRounds || '').split(',').map((r) => r.trim()).filter(Boolean),
      status: status || 'Registration Open',
    });

    const populated = await PlacementDrive.findById(drive._id).populate('company');
    return res.status(201).json({ success: true, drive: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/placement/drives/:id
exports.updatePlacementDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('company');
    if (!drive) return res.status(404).json({ success: false, error: 'Placement drive not found.' });
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

    return res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/placement/applications (submit student application)
exports.createPlacementApplication = async (req, res) => {
  try {
    const { studentId, driveId, resumeLink } = req.body;
    if (!studentId || !driveId) {
      return res.status(400).json({ success: false, error: 'Student and Drive references are required.' });
    }

    const application = await PlacementApplication.create({
      student: studentId,
      drive: driveId,
      resumeLink,
      status: 'Applied',
      currentRound: 'Application Screening',
    });

    await PlacementDrive.findByIdAndUpdate(driveId, { $inc: { totalApplicationsCount: 1 } });

    const populated = await PlacementApplication.findById(application._id)
      .populate('student', 'name studentId email')
      .populate('drive', 'jobTitle companyName salaryPackage');

    return res.status(201).json({ success: true, application: populated });
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
