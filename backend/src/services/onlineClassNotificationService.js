const Student = require('../models/Student');
const Notification = require('../models/Notification');
const OnlineClass = require('../models/OnlineClass');

/**
 * Normalizes branch/department strings for fuzzy matching
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
 * Finds all active students eligible for a given online class cohort
 */
const getEligibleStudentsForClass = async (onlineClass) => {
  if (!onlineClass) return [];

  // Query students matching semester
  const query = {
    semester: onlineClass.semester,
    status: 'Active',
  };

  const students = await Student.find(query).populate('department', 'name code').lean();

  const targetDept = normalizeText(onlineClass.departmentName || onlineClass.courseName || '');

  // Filter students whose department name or code matches, or if class is open to all
  return students.filter((s) => {
    if (!targetDept || targetDept.includes('all')) return true;

    const sDeptName = normalizeText(s.department?.name || '');
    const sDeptCode = normalizeText(s.department?.code || '');
    const sCourse = normalizeText(s.course || '');

    if (sDeptName && (sDeptName.includes(targetDept) || targetDept.includes(sDeptName))) return true;
    if (sDeptCode && targetDept.includes(sDeptCode)) return true;
    if (sCourse && (sCourse.includes(targetDept) || targetDept.includes(sCourse))) return true;

    // Common branch aliases
    if (targetDept.includes('computer') || targetDept.includes('cse')) {
      if (sDeptName.includes('computer') || sDeptCode.includes('cse') || (s.studentId || '').startsWith('CS')) {
        return true;
      }
    }
    if (targetDept.includes('electronic') || targetDept.includes('ece')) {
      if (sDeptName.includes('electronic') || sDeptCode.includes('ece') || (s.studentId || '').startsWith('EC')) {
        return true;
      }
    }
    if (targetDept.includes('mechanical') || targetDept.includes('me')) {
      if (sDeptName.includes('mech') || sDeptCode.includes('me') || (s.studentId || '').startsWith('ME')) {
        return true;
      }
    }

    return false;
  });
};

/**
 * Dispatches notification when a new online class is scheduled and published
 */
const notifyStudentsNewClass = async (onlineClass) => {
  try {
    const students = await getEligibleStudentsForClass(onlineClass);
    if (!students.length) return;

    const dateStr = new Date(onlineClass.scheduledDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const notificationsToCreate = [];

    for (const student of students) {
      // Prevent duplicates
      const existing = await Notification.findOne({
        recipient: student._id,
        'metadata.classId': onlineClass._id,
        type: 'ONLINE_CLASS_SCHEDULED',
      });
      if (existing) continue;

      const recipientUserId = student.user || student._id;

      notificationsToCreate.push({
        recipient: student._id,
        recipientUser: recipientUserId,
        user: recipientUserId,
        studentId: student.studentId,
        title: `Online Class Scheduled: ${onlineClass.subject}`,
        message: `${onlineClass.facultyName || 'Faculty'} has scheduled an online class for ${onlineClass.subject} ("${onlineClass.title}") on ${dateStr} from ${onlineClass.startTime} to ${onlineClass.endTime}.`,
        category: 'Academic',
        priority: 'High',
        type: 'ONLINE_CLASS_SCHEDULED',
        isRead: false,
        metadata: {
          classId: onlineClass._id.toString(),
          title: onlineClass.title,
          subject: onlineClass.subject,
          facultyName: onlineClass.facultyName,
          meetingUrl: onlineClass.meetingUrl,
          meetingCode: onlineClass.meetingCode || '',
          scheduledDate: onlineClass.scheduledDate,
          startTime: onlineClass.startTime,
          endTime: onlineClass.endTime,
          platform: onlineClass.platform,
        },
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (err) {
    console.error('[OnlineClassNotification] Error dispatching new class notification:', err.message);
  }
};

/**
 * Dispatches notification when a class is rescheduled
 */
const notifyStudentsRescheduled = async (onlineClass, oldDetails = {}) => {
  try {
    const students = await getEligibleStudentsForClass(onlineClass);
    if (!students.length) return;

    const newDateStr = new Date(onlineClass.scheduledDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const notificationsToCreate = [];

    for (const student of students) {
      const recipientUserId = student.user || student._id;
      notificationsToCreate.push({
        recipient: student._id,
        recipientUser: recipientUserId,
        user: recipientUserId,
        studentId: student.studentId,
        title: `Class Rescheduled: ${onlineClass.subject}`,
        message: `Online class for ${onlineClass.subject} ("${onlineClass.title}") has been rescheduled to ${newDateStr} (${onlineClass.startTime} - ${onlineClass.endTime}).`,
        category: 'Academic',
        priority: 'High',
        type: 'ONLINE_CLASS_RESCHEDULED',
        isRead: false,
        metadata: {
          classId: onlineClass._id.toString(),
          title: onlineClass.title,
          subject: onlineClass.subject,
          facultyName: onlineClass.facultyName,
          meetingUrl: onlineClass.meetingUrl,
          scheduledDate: onlineClass.scheduledDate,
          startTime: onlineClass.startTime,
          endTime: onlineClass.endTime,
          oldStartTime: oldDetails.startTime,
          oldEndTime: oldDetails.endTime,
        },
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (err) {
    console.error('[OnlineClassNotification] Error dispatching rescheduled notification:', err.message);
  }
};

/**
 * Dispatches notification when a class is cancelled
 */
const notifyStudentsCancelled = async (onlineClass, reason = '') => {
  try {
    const students = await getEligibleStudentsForClass(onlineClass);
    if (!students.length) return;

    const dateStr = new Date(onlineClass.scheduledDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const reasonText = reason ? ` Reason: ${reason}` : '';
    const notificationsToCreate = [];

    for (const student of students) {
      const recipientUserId = student.user || student._id;
      notificationsToCreate.push({
        recipient: student._id,
        recipientUser: recipientUserId,
        user: recipientUserId,
        studentId: student.studentId,
        title: `Class Cancelled: ${onlineClass.subject}`,
        message: `Online class for ${onlineClass.subject} ("${onlineClass.title}") scheduled on ${dateStr} has been cancelled.${reasonText}`,
        category: 'Academic',
        priority: 'High',
        type: 'ONLINE_CLASS_CANCELLED',
        isRead: false,
        metadata: {
          classId: onlineClass._id.toString(),
          title: onlineClass.title,
          subject: onlineClass.subject,
          cancellationReason: reason,
        },
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (err) {
    console.error('[OnlineClassNotification] Error dispatching cancelled notification:', err.message);
  }
};

/**
 * Dispatches notification when the meeting link is updated
 */
const notifyStudentsLinkUpdated = async (onlineClass) => {
  try {
    const students = await getEligibleStudentsForClass(onlineClass);
    if (!students.length) return;

    const notificationsToCreate = [];

    for (const student of students) {
      const recipientUserId = student.user || student._id;
      notificationsToCreate.push({
        recipient: student._id,
        recipientUser: recipientUserId,
        user: recipientUserId,
        studentId: student.studentId,
        title: `Meeting Link Updated: ${onlineClass.subject}`,
        message: `The meeting link for ${onlineClass.subject} ("${onlineClass.title}") has been updated. Please access the latest link from your portal.`,
        category: 'Academic',
        priority: 'Normal',
        type: 'ONLINE_CLASS_LINK_UPDATED',
        isRead: false,
        metadata: {
          classId: onlineClass._id.toString(),
          title: onlineClass.title,
          subject: onlineClass.subject,
          meetingUrl: onlineClass.meetingUrl,
        },
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (err) {
    console.error('[OnlineClassNotification] Error dispatching link update notification:', err.message);
  }
};

/**
 * Dispatches class announcement to students
 */
const notifyStudentsAnnouncement = async (onlineClass, announcementText) => {
  try {
    const students = await getEligibleStudentsForClass(onlineClass);
    if (!students.length) return;

    const notificationsToCreate = [];

    for (const student of students) {
      const recipientUserId = student.user || student._id;
      notificationsToCreate.push({
        recipient: student._id,
        recipientUser: recipientUserId,
        user: recipientUserId,
        studentId: student.studentId,
        title: `Announcement: ${onlineClass.subject}`,
        message: `Note from ${onlineClass.facultyName || 'Instructor'}: "${announcementText}"`,
        category: 'Academic',
        priority: 'Normal',
        type: 'ONLINE_CLASS_ANNOUNCEMENT',
        isRead: false,
        metadata: {
          classId: onlineClass._id.toString(),
          subject: onlineClass.subject,
          title: onlineClass.title,
        },
      });
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (err) {
    console.error('[OnlineClassNotification] Error dispatching announcement notification:', err.message);
  }
};

/**
 * 15-minute Class Reminder Sweep
 * Checks for upcoming classes starting within 15 minutes that haven't sent a 15-min reminder
 */
const checkAndSendClassReminders = async () => {
  try {
    const now = new Date();
    const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);

    const upcomingClasses = await OnlineClass.find({
      status: { $nin: ['Cancelled', 'Completed'] },
      published: true,
      startDateTime: { $gte: now, $lte: fifteenMinutesLater },
      remindersSent: { $ne: 15 },
    });

    for (const cls of upcomingClasses) {
      const students = await getEligibleStudentsForClass(cls);
      const notificationsToCreate = [];

      for (const student of students) {
        // Prevent duplicate
        const existing = await Notification.findOne({
          recipient: student._id,
          'metadata.classId': cls._id,
          type: 'ONLINE_CLASS_REMINDER',
        });
        if (existing) continue;

        const recipientUserId = student.user || student._id;
        notificationsToCreate.push({
          recipient: student._id,
          recipientUser: recipientUserId,
          user: recipientUserId,
          studentId: student.studentId,
          title: `Class Starting in 15 Minutes: ${cls.subject}`,
          message: `Your online class "${cls.title}" with ${cls.facultyName || 'Instructor'} begins at ${cls.startTime}. Get ready to join!`,
          category: 'Academic',
          priority: 'High',
          type: 'ONLINE_CLASS_REMINDER',
          isRead: false,
          metadata: {
            classId: cls._id.toString(),
            title: cls.title,
            subject: cls.subject,
            facultyName: cls.facultyName,
            meetingUrl: cls.meetingUrl,
            startTime: cls.startTime,
          },
        });
      }

      if (notificationsToCreate.length > 0) {
        await Notification.insertMany(notificationsToCreate);
      }

      // Mark 15-minute reminder sent
      await OnlineClass.findByIdAndUpdate(cls._id, { $addToSet: { remindersSent: 15 } });
    }
  } catch (err) {
    console.error('[OnlineClassNotification] Error in reminder sweep:', err.message);
  }
};

let reminderTimer = null;
const startClassReminderJob = () => {
  if (reminderTimer) return;
  // Run every 2 minutes
  reminderTimer = setInterval(checkAndSendClassReminders, 2 * 60 * 1000);
  console.log('[OnlineClassNotification] Background 15-minute class reminder job started.');
};

const stopClassReminderJob = () => {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
  }
};

module.exports = {
  getEligibleStudentsForClass,
  notifyStudentsNewClass,
  notifyStudentsRescheduled,
  notifyStudentsCancelled,
  notifyStudentsLinkUpdated,
  notifyStudentsAnnouncement,
  checkAndSendClassReminders,
  startClassReminderJob,
  stopClassReminderJob,
};

