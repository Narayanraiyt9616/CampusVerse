const Project = require('../models/Project');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// Helper to resolve Student document for the authenticated user
const resolveStudent = async (user) => {
  if (!user) return null;
  return Student.findOne({
    $or: [
      { email: user.email },
      { studentId: (user.username || '').toUpperCase() },
      ...(user.metadata?.studentId ? [{ studentId: user.metadata.studentId }] : []),
    ],
  }).populate('department');
};

const normalizeUrl = (urlStr) => {
  if (!urlStr) return '';
  const trimmed = urlStr.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// POST /api/projects - Student submits live project
exports.createProject = async (req, res) => {
  try {
    const student = await resolveStudent(req.user);
    if (!student) {
      return res.status(403).json({ success: false, error: 'Only enrolled students can submit live projects.' });
    }

    const { title, description, liveUrl, githubUrl, technologies, category } = req.body;

    if (!title || !description || !liveUrl) {
      return res.status(400).json({
        success: false,
        error: 'Project title, description, and a valid live deployment link are required.',
      });
    }

    const formattedLiveUrl = normalizeUrl(liveUrl);
    const formattedGithubUrl = githubUrl ? normalizeUrl(githubUrl) : '';

    // Parse technologies into clean array
    let techArray = [];
    if (Array.isArray(technologies)) {
      techArray = technologies.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof technologies === 'string') {
      techArray = technologies.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const project = await Project.create({
      student: student._id,
      title: title.trim(),
      description: description.trim(),
      liveUrl: formattedLiveUrl,
      githubUrl: formattedGithubUrl,
      technologies: techArray,
      category: category || 'Full-Stack Web',
      semester: student.semester || 1,
      reviewStatus: 'Pending Review',
    });

    const populated = await Project.findById(project._id).populate('student', 'name studentId email department');
    return res.status(201).json({
      success: true,
      message: 'Project submitted successfully for faculty review.',
      project: populated,
      data: populated,
    });
  } catch (err) {
    console.error('Error creating project:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/projects/my-projects - Student views their submitted projects
exports.getMyProjects = async (req, res) => {
  try {
    const student = await resolveStudent(req.user);
    if (!student) {
      return res.status(200).json({ success: true, count: 0, projects: [], data: [] });
    }

    const projects = await Project.find({ student: student._id })
      .populate('student', 'name studentId email department')
      .populate('review.faculty', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
      data: projects,
    });
  } catch (err) {
    console.error('Error fetching my projects:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/projects/:id - Student edits their project
exports.updateProject = async (req, res) => {
  try {
    const student = await resolveStudent(req.user);
    if (!student) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    // Check ownership
    if (project.student.toString() !== student._id.toString()) {
      return res.status(403).json({ success: false, error: 'You cannot edit another student\'s project.' });
    }

    const { title, description, liveUrl, githubUrl, technologies, category } = req.body;
    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (liveUrl) project.liveUrl = normalizeUrl(liveUrl);
    if (githubUrl !== undefined) project.githubUrl = githubUrl ? normalizeUrl(githubUrl) : '';
    if (category) project.category = category;

    if (technologies) {
      if (Array.isArray(technologies)) {
        project.technologies = technologies.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof technologies === 'string') {
        project.technologies = technologies.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    // If changes were requested, reset status to Pending Review after edit
    if (project.reviewStatus === 'Changes Required') {
      project.reviewStatus = 'Pending Review';
    }

    await project.save();
    const updated = await Project.findById(project._id).populate('student', 'name studentId email department');
    return res.json({ success: true, message: 'Project details updated successfully.', project: updated, data: updated });
  } catch (err) {
    console.error('Error updating project:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/projects/:id - Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    if (req.user.role === 'student') {
      const student = await resolveStudent(req.user);
      if (!student || project.student.toString() !== student._id.toString()) {
        return res.status(403).json({ success: false, error: 'Unauthorized.' });
      }
    }

    await project.deleteOne();
    return res.json({ success: true, message: 'Project removed successfully.' });
  } catch (err) {
    console.error('Error deleting project:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/projects - Faculty/Admin views all projects to review
exports.getFacultyProjects = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};
    if (status) filter.reviewStatus = status;
    if (category) filter.category = category;

    let projects = await Project.find(filter)
      .populate({
        path: 'student',
        populate: { path: 'department', select: 'name code' },
      })
      .populate('review.faculty', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter((p) => {
        const title = p.title?.toLowerCase() || '';
        const sName = p.student?.name?.toLowerCase() || '';
        const sId = p.student?.studentId?.toLowerCase() || '';
        return title.includes(q) || sName.includes(q) || sId.includes(q);
      });
    }

    return res.json({ success: true, count: projects.length, projects, data: projects });
  } catch (err) {
    console.error('Error fetching faculty projects:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/projects/:id/review - Faculty reviews project and notifies student
exports.reviewProject = async (req, res) => {
  try {
    const { reviewStatus, feedback, suggestions, marks } = req.body;

    if (!['Reviewed', 'Changes Required', 'Pending Review'].includes(reviewStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid review status. Must be "Reviewed", "Changes Required", or "Pending Review".',
      });
    }

    const project = await Project.findById(req.params.id).populate('student');
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    project.reviewStatus = reviewStatus;
    project.review = {
      faculty: req.user._id,
      facultyName: req.user.name || 'Faculty Mentor',
      feedback: feedback ? feedback.trim() : '',
      suggestions: suggestions ? suggestions.trim() : '',
      marks: marks !== undefined && marks !== null && marks !== '' ? Number(marks) : undefined,
      reviewedAt: new Date(),
    };

    await project.save();

    // Send real-time notification to the student
    if (project.student) {
      const marksText = marks !== undefined && marks !== null && marks !== '' ? ` Marks: ${marks}/100.` : '';
      const feedbackText = feedback ? ` Feedback: "${feedback}".` : '';
      const suggestionText = suggestions ? ` Suggestions: "${suggestions}".` : '';

      await Notification.create({
        recipient: project.student._id,
        studentId: project.student.studentId,
        title: `Project Review: ${project.title} (${reviewStatus})`,
        message: `Your live project "${project.title}" has been reviewed by ${req.user.name || 'Faculty'}. Status: ${reviewStatus}.${marksText}${feedbackText}${suggestionText}`,
        category: 'Project',
        priority: reviewStatus === 'Changes Required' ? 'High' : 'Normal',
        type: 'PROJECT_REVIEW',
        isRead: false,
        metadata: {
          projectId: project._id,
          projectTitle: project.title,
          reviewStatus,
          marks: marks !== undefined && marks !== null ? Number(marks) : null,
          facultyName: req.user.name,
        },
      });
    }

    const updated = await Project.findById(project._id)
      .populate('student', 'name studentId email department')
      .populate('review.faculty', 'name email');

    return res.json({
      success: true,
      message: 'Project review recorded and student notified successfully.',
      project: updated,
      data: updated,
    });
  } catch (err) {
    console.error('Error reviewing project:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
