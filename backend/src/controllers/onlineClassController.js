const OnlineClass = require('../models/OnlineClass');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const {
  getEligibleStudentsForClass,
  notifyStudentsNewClass,
  notifyStudentsRescheduled,
  notifyStudentsCancelled,
  notifyStudentsLinkUpdated,
  notifyStudentsAnnouncement,
  checkAndSendClassReminders,
} = require('../services/onlineClassNotificationService');

/**
 * Parses date string (YYYY-MM-DD or ISO) and HH:mm time string into a valid Date object.
 */
const combineDateAndTime = (dateInput, timeStr) => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return null;

  const combined = new Date(d);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
};

/**
 * Validates that an input URL is well-formed with HTTPS (or HTTP in local dev).
 */
const isValidMeetingUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const url = new URL(urlStr.trim());
    if (url.protocol === 'javascript:' || url.protocol === 'data:') return false;
    return url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:');
  } catch {
    return false;
  }
};

/**
 * POST /api/online-classes
 * Faculty/Admin creates a new scheduled online class
 */
exports.createOnlineClass = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      scheduledDate,
      startTime,
      endTime,
      meetingUrl,
      platform,
      passcode,
      semester,
      departmentName,
      courseName,
      section,
      studentGroup,
      published,
      allowPastLinks,
      externalMeetingId,
    } = req.body;

    // 1. Validation: Required fields
    if (!title || !subject || !scheduledDate || !startTime || !endTime || !meetingUrl) {
      return res.status(400).json({
        success: false,
        error: 'Title, subject, scheduled date, start time, end time, and meeting URL are required.',
      });
    }

    if (semester === undefined || semester === null || isNaN(Number(semester))) {
      return res.status(400).json({
        success: false,
        error: 'Target academic semester is required (1-12).',
      });
    }

    // 2. Validation: Time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid time format. Please provide times in 24-hour HH:mm format (e.g. 09:30 or 14:00).',
      });
    }

    // 3. Validation: Start and End time sequence
    const startDateTime = combineDateAndTime(scheduledDate, startTime);
    const endDateTime = combineDateAndTime(scheduledDate, endTime);

    if (!startDateTime || !endDateTime) {
      return res.status(400).json({
        success: false,
        error: 'Could not parse scheduled date or time values.',
      });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        error: 'End time must be strictly after the start time.',
      });
    }

    // 4. Validation: Meeting URL
    if (!isValidMeetingUrl(meetingUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid meeting URL. Please provide a secure URL starting with https://',
      });
    }

    // 5. Detect platform
    const detectedPlatform = platform || OnlineClass.detectPlatform(meetingUrl);

    // 6. Faculty identity
    const facultyUser = req.user;
    const facultyName = facultyUser.name || facultyUser.username || 'Faculty Instructor';

    const onlineClass = await OnlineClass.create({
      title: title.trim(),
      subject: subject.trim(),
      description: description ? description.trim() : '',
      faculty: facultyUser._id,
      facultyName,
      departmentName: departmentName ? departmentName.trim() : 'Computer Science & Engineering',
      courseName: courseName ? courseName.trim() : 'Computer Science & Engineering',
      semester: Number(semester),
      section: section ? section.trim() : 'All',
      studentGroup: studentGroup ? studentGroup.trim() : 'All',
      meetingUrl: meetingUrl.trim(),
      platform: detectedPlatform,
      passcode: passcode ? passcode.trim() : '',
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      startDateTime,
      endDateTime,
      published: published !== undefined ? Boolean(published) : true,
      allowPastLinks: allowPastLinks !== undefined ? Boolean(allowPastLinks) : true,
      externalMeetingId: externalMeetingId ? String(externalMeetingId).trim() : '',
    });

    // 7. Dispatch notification if published
    if (onlineClass.published) {
      await notifyStudentsNewClass(onlineClass).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      message: 'Online class scheduled successfully.',
      class: onlineClass.formatForClient(true),
    });
  } catch (err) {
    console.error('[OnlineClassController] createOnlineClass error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/online-classes
 * Scoped retrieval:
 * - Faculty sees their own created classes (or all if admin)
 * - Students see active/published classes matching their course, branch, and semester
 */
exports.getOnlineClasses = async (req, res) => {
  try {
    const user = req.user;
    const { semester, subject, status, date } = req.query;

    let filter = {};

    if (user.role === 'faculty') {
      // Faculty sees their created classes by default
      filter.faculty = user._id;
    } else if (user.role === 'student') {
      // Student only sees published classes
      filter.published = true;

      // Resolve student's academic enrollment
      let student = await Student.findOne({
        $or: [
          { user: user._id },
          { email: user.email },
          { studentId: (user.username || '').toUpperCase() },
          ...(user.metadata?.studentId ? [{ studentId: user.metadata.studentId }] : []),
        ],
      }).populate('department');

      if (!student) {
        // Fallback for demo student account
        student = await Student.findOne({ studentId: 'CS21B1042' }).populate('department');
      }

      if (student) {
        filter.semester = student.semester;
        // Department / branch filter
        const deptName = student.department?.name || student.course || 'Computer Science & Engineering';
        filter.$or = [
          { departmentName: { $regex: new RegExp(deptName.split(' ')[0], 'i') } },
          { departmentName: 'All' },
          { courseName: 'All' },
        ];
      }
    }

    // Optional query filters
    if (semester && !isNaN(Number(semester))) {
      filter.semester = Number(semester);
    }
    if (subject) {
      filter.subject = { $regex: subject, $options: 'i' };
    }
    if (date) {
      const targetDay = new Date(date);
      if (!isNaN(targetDay.getTime())) {
        const startOfDay = new Date(targetDay.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDay.setHours(23, 59, 59, 999));
        filter.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const classes = await OnlineClass.find(filter)
      .populate('faculty', 'name email username metadata')
      .sort({ startDateTime: 1 })
      .lean();

    // Map through classes and evaluate real-time dynamic status
    const formatted = classes.map((cls) => {
      const doc = new OnlineClass(cls);
      return doc.formatForClient(true);
    });

    // If client requested a specific computed status filter (e.g. 'upcoming', 'live', 'completed')
    let resultClasses = formatted;
    if (status) {
      const s = status.toLowerCase();
      if (s === 'upcoming') {
        resultClasses = formatted.filter((c) => c.isUpcoming);
      } else if (s === 'live' || s === 'live now') {
        resultClasses = formatted.filter((c) => c.isLive);
      } else if (s === 'completed') {
        resultClasses = formatted.filter((c) => c.isCompleted);
      } else if (s === 'cancelled') {
        resultClasses = formatted.filter((c) => c.isCancelled);
      }
    }

    return res.json({
      success: true,
      count: resultClasses.length,
      serverTime: new Date().toISOString(),
      classes: resultClasses,
    });
  } catch (err) {
    console.error('[OnlineClassController] getOnlineClasses error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * GET /api/online-classes/:id
 * Retrieve a specific online class
 */
exports.getOnlineClassById = async (req, res) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id).populate('faculty', 'name email');
    if (!onlineClass) {
      return res.status(404).json({ success: false, error: 'Online class not found.' });
    }

    const user = req.user;
    let isAuthorized = true;

    // If student, verify student belongs to target cohort
    if (user.role === 'student') {
      const eligibleStudents = await getEligibleStudentsForClass(onlineClass);
      const isEligible = eligibleStudents.some(
        (s) => (s.user && s.user.toString() === user._id.toString()) || s.email === user.email
      );

      // If demo student CS21B1042 and class is semester 7 CSE
      const isDemoMatch = user.username === 'studentdemo' && onlineClass.semester === 7;

      if (!isEligible && !isDemoMatch) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to access this online class (not enrolled in target cohort).',
        });
      }
    }

    return res.json({
      success: true,
      serverTime: new Date().toISOString(),
      class: onlineClass.formatForClient(isAuthorized),
    });
  } catch (err) {
    console.error('[OnlineClassController] getOnlineClassById error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PUT /api/online-classes/:id
 * Faculty/Admin updates class details, rescheduling, or link change
 */
exports.updateOnlineClass = async (req, res) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ success: false, error: 'Online class not found.' });
    }

    // Role check: Only the owning faculty or admin/superadmin can modify
    const isOwner = onlineClass.faculty.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'superadmin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to modify this online class.',
      });
    }

    const {
      title,
      subject,
      description,
      scheduledDate,
      startTime,
      endTime,
      meetingUrl,
      platform,
      passcode,
      semester,
      departmentName,
      section,
      studentGroup,
      published,
      allowPastLinks,
    } = req.body;

    const oldDate = onlineClass.scheduledDate;
    const oldStartTime = onlineClass.startTime;
    const oldEndTime = onlineClass.endTime;
    const oldMeetingUrl = onlineClass.meetingUrl;

    if (title) onlineClass.title = title.trim();
    if (subject) onlineClass.subject = subject.trim();
    if (description !== undefined) onlineClass.description = description.trim();
    if (passcode !== undefined) onlineClass.passcode = passcode.trim();
    if (semester) onlineClass.semester = Number(semester);
    if (departmentName) onlineClass.departmentName = departmentName.trim();
    if (section) onlineClass.section = section.trim();
    if (studentGroup) onlineClass.studentGroup = studentGroup.trim();
    if (published !== undefined) onlineClass.published = Boolean(published);
    if (allowPastLinks !== undefined) onlineClass.allowPastLinks = Boolean(allowPastLinks);

    // Validate meeting URL if changed
    let urlChanged = false;
    if (meetingUrl && meetingUrl !== oldMeetingUrl) {
      if (!isValidMeetingUrl(meetingUrl)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid meeting URL. Please provide a secure URL starting with https://',
        });
      }
      onlineClass.meetingUrl = meetingUrl.trim();
      onlineClass.platform = platform || OnlineClass.detectPlatform(meetingUrl);
      urlChanged = true;
    }

    // Handle rescheduling (date or time changed)
    let timingChanged = false;
    const newDate = scheduledDate || onlineClass.scheduledDate;
    const newStart = startTime || onlineClass.startTime;
    const newEnd = endTime || onlineClass.endTime;

    if (
      (scheduledDate && new Date(scheduledDate).getTime() !== new Date(oldDate).getTime()) ||
      (startTime && startTime !== oldStartTime) ||
      (endTime && endTime !== oldEndTime)
    ) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(newStart) || !timeRegex.test(newEnd)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid time format. Please provide times in 24-hour HH:mm format.',
        });
      }

      const startDateTime = combineDateAndTime(newDate, newStart);
      const endDateTime = combineDateAndTime(newDate, newEnd);

      if (endDateTime <= startDateTime) {
        return res.status(400).json({
          success: false,
          error: 'End time must be strictly after the start time.',
        });
      }

      onlineClass.scheduledDate = new Date(newDate);
      onlineClass.startTime = newStart;
      onlineClass.endTime = newEnd;
      onlineClass.startDateTime = startDateTime;
      onlineClass.endDateTime = endDateTime;
      onlineClass.rescheduledFrom = {
        date: oldDate,
        startTime: oldStartTime,
        endTime: oldEndTime,
      };
      timingChanged = true;
    }

    await onlineClass.save();

    // Trigger targeted notifications
    if (timingChanged) {
      await notifyStudentsRescheduled(onlineClass, { startTime: oldStartTime, endTime: oldEndTime }).catch(() => {});
    } else if (urlChanged) {
      await notifyStudentsLinkUpdated(onlineClass).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'Online class updated successfully.',
      class: onlineClass.formatForClient(true),
    });
  } catch (err) {
    console.error('[OnlineClassController] updateOnlineClass error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PATCH /api/online-classes/:id/cancel
 * Faculty/Admin cancels a scheduled class
 */
exports.cancelOnlineClass = async (req, res) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ success: false, error: 'Online class not found.' });
    }

    const isOwner = onlineClass.faculty.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'superadmin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to cancel this class.',
      });
    }

    const { cancellationReason } = req.body;
    onlineClass.status = 'Cancelled';
    onlineClass.cancellationReason = cancellationReason ? cancellationReason.trim() : 'Cancelled by instructor.';

    await onlineClass.save();

    // Notify enrolled students
    await notifyStudentsCancelled(onlineClass, onlineClass.cancellationReason).catch(() => {});

    return res.json({
      success: true,
      message: 'Online class cancelled successfully.',
      class: onlineClass.formatForClient(true),
    });
  } catch (err) {
    console.error('[OnlineClassController] cancelOnlineClass error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/online-classes/:id/announcements
 * Faculty posts a message / note to enrolled students
 */
exports.addAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Announcement message is required.' });
    }

    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ success: false, error: 'Online class not found.' });
    }

    const isOwner = onlineClass.faculty.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'superadmin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to post announcements for this class.',
      });
    }

    const newAnnouncement = {
      message: message.trim(),
      postedAt: new Date(),
      authorName: req.user.name || 'Instructor',
    };

    onlineClass.announcements.unshift(newAnnouncement);
    await onlineClass.save();

    await notifyStudentsAnnouncement(onlineClass, message.trim()).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Announcement posted successfully.',
      announcements: onlineClass.announcements,
    });
  } catch (err) {
    console.error('[OnlineClassController] addAnnouncement error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * DELETE /api/online-classes/:id
 * Delete an online class
 */
exports.deleteOnlineClass = async (req, res) => {
  try {
    const onlineClass = await OnlineClass.findById(req.params.id);
    if (!onlineClass) {
      return res.status(404).json({ success: false, error: 'Online class not found.' });
    }

    const isOwner = onlineClass.faculty.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'superadmin', 'super_admin'].includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this class.',
      });
    }

    await OnlineClass.findByIdAndDelete(req.params.id);

    // Clean up notifications for this class
    await Notification.deleteMany({ 'metadata.classId': req.params.id }).catch(() => {});

    return res.json({
      success: true,
      message: 'Online class deleted successfully.',
    });
  } catch (err) {
    console.error('[OnlineClassController] deleteOnlineClass error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/online-classes/reminders/sweep
 * Triggers 15-minute upcoming class reminder check
 */
exports.triggerRemindersSweep = async (req, res) => {
  try {
    await checkAndSendClassReminders();
    return res.json({ success: true, message: 'Class reminder sweep completed.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
