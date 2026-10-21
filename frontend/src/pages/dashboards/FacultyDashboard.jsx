import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard, User, Users, CalendarCheck, ClipboardList, Award,
  Clock, Calendar, Bell, Plus, Edit2, Check, X, ChevronDown, ChevronUp,
  ArrowLeft, BookOpen, FileText, Download, AlertCircle, CheckCircle,
  Loader2, RefreshCw, Eye, Star, Briefcase, GraduationCap, Phone,
  Mail, MapPin, BadgeCheck, Building2, Pencil, Save, Trash2,
  FileCheck, AlertTriangle, Info, BookMarked, TrendingUp, Activity
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { facultyService, studentService } from '../../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const statusColor = { Present: 'success', Absent: 'danger', Late: 'warning' };
const leaveStatusColor = { Pending: 'warning', Approved: 'success', Rejected: 'danger' };

// ─── Toast Component ─────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-2xl border border-[#0D9488] bg-[#CCFBF1] text-[#102A43] shadow-xl max-w-sm text-sm animate-fade-in font-medium">
      {type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#0D9488]" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#102A43]" />}
      <p className="flex-1 leading-snug">{message}</p>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 p-0.5"><X className="w-4 h-4" /></button>
    </div>
  );
};

// ─── Loading Skeleton ────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// ─── Demo Data (fallback when backend is unreachable) ───────────────────────
const DEMO_STUDENTS = [
  { _id: 's1', studentId: 'CS21B001', name: 'Aarav Singhania', email: 'aarav@campus.edu', semester: 7, department: { name: 'Computer Science' }, status: 'Active' },
  { _id: 's2', studentId: 'CS21B002', name: 'Priya Nair', email: 'priya@campus.edu', semester: 7, department: { name: 'Computer Science' }, status: 'Active' },
  { _id: 's3', studentId: 'CS21B003', name: 'Rohan Mehta', email: 'rohan@campus.edu', semester: 7, department: { name: 'Computer Science' }, status: 'Active' },
  { _id: 's4', studentId: 'CS21B004', name: 'Sneha Kulkarni', email: 'sneha@campus.edu', semester: 5, department: { name: 'Computer Science' }, status: 'Active' },
  { _id: 's5', studentId: 'CS21B005', name: 'Vikram Patel', email: 'vikram@campus.edu', semester: 5, department: { name: 'Computer Science' }, status: 'Active' },
];
const DEMO_TIMETABLE = [
  { _id: 't1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '10:00', course: { name: 'Artificial Intelligence', code: 'CS701' }, section: 'A', semester: 7, classroom: 'LH-301' },
  { _id: 't2', dayOfWeek: 'Tuesday', startTime: '11:00', endTime: '12:00', course: { name: 'Machine Learning', code: 'CS702' }, section: 'B', semester: 7, classroom: 'LH-204' },
  { _id: 't3', dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '15:00', course: { name: 'Deep Learning Lab', code: 'CS703' }, section: 'A', semester: 7, classroom: 'Lab-101' },
  { _id: 't4', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '10:00', course: { name: 'Artificial Intelligence', code: 'CS701' }, section: 'B', semester: 7, classroom: 'LH-301' },
  { _id: 't5', dayOfWeek: 'Friday', startTime: '10:00', endTime: '11:00', course: { name: 'Machine Learning', code: 'CS702' }, section: 'A', semester: 7, classroom: 'LH-204' },
];
const DEMO_NOTICES = [
  { _id: 'n1', title: 'Mid-Term Examination Schedule', content: 'Mid-term exams scheduled for Nov 10–20. Faculty must submit question papers by Nov 5.', category: 'Exam', targetAudience: 'All', pinned: true, publishedAt: '2026-10-18', authorName: 'Academic Office' },
  { _id: 'n2', title: 'Faculty Development Program', content: 'Workshop on AI in Education on Oct 28. Participation is mandatory for all faculty.', category: 'Event', targetAudience: 'Faculty', pinned: false, publishedAt: '2026-10-15', authorName: 'Principal' },
  { _id: 'n3', title: 'Result Submission Deadline', content: 'All internal assessment marks must be submitted by Nov 1, 2026 via the portal.', category: 'Academic', targetAudience: 'Faculty', pinned: false, publishedAt: '2026-10-12', authorName: 'Examination Cell' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export const FacultyDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const currentSection = section ? section.toLowerCase() : 'overview';

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState({});

  // Profile state
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  // Students state
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  // Attendance state
  const [attendanceForm, setAttendanceForm] = useState({
    className: 'CS-7A', subject: 'Artificial Intelligence', semester: 7,
    date: new Date().toISOString().split('T')[0], records: []
  });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceView, setAttendanceView] = useState('mark'); // mark | reports | edit
  const [markingList, setMarkingList] = useState([]);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);

  // Assignments & Exams state
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignmentTab, setAssignmentTab] = useState('assignments');
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
  const [scheduleExamOpen, setScheduleExamOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', courseId: '', dueDate: '', maxMarks: 50, submissionType: 'text' });
  const [examForm, setExamForm] = useState({ title: '', subject: '', className: '', semester: 7, examDate: '', startTime: '10:00', duration: 120, venue: '', maxMarks: 100, examType: 'Mid-Term', instructions: '' });
  const [feedbackForm, setFeedbackForm] = useState({ submissionId: '', feedback: '', marksObtained: '' });
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Results state
  const [results, setResults] = useState([]);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultForm, setResultForm] = useState({ studentId: '', courseId: '', assessmentName: '', assessmentType: 'Exam', maxMarks: 100, marksObtained: '', semester: 7, session: '2026-27', feedback: '' });
  const [editingResultId, setEditingResultId] = useState(null);

  // Timetable state
  const [timetable, setTimetable] = useState([]);

  // Leave state
  const [leaves, setLeaves] = useState([]);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' });

  // Notices state
  const [notices, setNotices] = useState([]);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', category: 'Academic', targetAudience: 'All', pinned: false });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  // ─── Data Fetchers ─────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const res = await facultyService.getMyProfile();
      const p = res?.profile || res;
      setProfile(p);
      const meta = p?.metadata || {};
      setProfileForm({
        name: p?.name || '',
        phone: meta.phone || '',
        address: meta.address || '',
        qualification: meta.qualification || 'Ph.D. Computer Science',
        designation: meta.designation || 'Associate Professor',
        employeeId: meta.employeeId || 'EMP-2021-007',
      });
    } catch {
      setProfile({
        name: user?.name || 'Dr. Rajiv Menon',
        email: user?.email || 'rajiv.menon@campusverse.edu',
        role: 'faculty',
        department: { name: 'Computer Science & Engineering' },
        metadata: { phone: '+91 9876543210', qualification: 'Ph.D. Computer Science', designation: 'Associate Professor', employeeId: 'EMP-2021-007' },
      });
      setProfileForm({ name: user?.name || 'Dr. Rajiv Menon', phone: '+91 9876543210', address: 'Campus Staff Quarters, Block B', qualification: 'Ph.D. Computer Science', designation: 'Associate Professor', employeeId: 'EMP-2021-007' });
    }
  }, [user]);

  const loadStudents = useCallback(async () => {
    setLoad('students', true);
    try {
      const res = await facultyService.getAssignedStudents();
      setStudents(res?.students || res || DEMO_STUDENTS);
    } catch { setStudents(DEMO_STUDENTS); }
    finally { setLoad('students', false); }
  }, []);

  const loadAttendanceRecords = useCallback(async () => {
    setLoad('attendance', true);
    try {
      const res = await facultyService.getAttendanceRecords();
      setAttendanceRecords(res?.records || res || []);
    } catch { setAttendanceRecords([]); }
    finally { setLoad('attendance', false); }
  }, []);

  const loadAssignments = useCallback(async () => {
    setLoad('assignments', true);
    try {
      const res = await facultyService.getMyAssignments();
      setAssignments(res?.assignments || res || []);
    } catch { setAssignments([]); }
    finally { setLoad('assignments', false); }
  }, []);

  const loadExams = useCallback(async () => {
    try {
      const res = await facultyService.getMyExams();
      setExams(res?.exams || res || []);
    } catch { setExams([]); }
  }, []);

  const loadResults = useCallback(async () => {
    setLoad('results', true);
    try {
      const res = await facultyService.getMyResults();
      setResults(res?.results || res || []);
    } catch { setResults([]); }
    finally { setLoad('results', false); }
  }, []);

  const loadTimetable = useCallback(async () => {
    setLoad('timetable', true);
    try {
      const res = await facultyService.getMyTimetable();
      setTimetable(res?.timetable || res || DEMO_TIMETABLE);
    } catch { setTimetable(DEMO_TIMETABLE); }
    finally { setLoad('timetable', false); }
  }, []);

  const loadLeaves = useCallback(async () => {
    setLoad('leaves', true);
    try {
      const res = await facultyService.getMyLeaves();
      setLeaves(res?.leaves || res || []);
    } catch { setLeaves([]); }
    finally { setLoad('leaves', false); }
  }, []);

  const loadNotices = useCallback(async () => {
    setLoad('notices', true);
    try {
      const res = await facultyService.getNotices();
      setNotices(res?.notices || res || DEMO_NOTICES);
    } catch { setNotices(DEMO_NOTICES); }
    finally { setLoad('notices', false); }
  }, []);

  // Load on section change
  useEffect(() => {
    if (currentSection === 'overview') { loadProfile(); loadStudents(); loadTimetable(); loadNotices(); }
    else if (currentSection === 'profile') loadProfile();
    else if (currentSection === 'students') loadStudents();
    else if (currentSection === 'attendance') { loadAttendanceRecords(); loadStudents(); }
    else if (currentSection === 'assignments') { loadAssignments(); loadExams(); }
    else if (currentSection === 'results') { loadResults(); loadStudents(); }
    else if (currentSection === 'timetable') loadTimetable();
    else if (currentSection === 'leave') loadLeaves();
    else if (currentSection === 'notices') loadNotices();
  }, [currentSection]);

  // Populate marking list when students or form changes
  useEffect(() => {
    if (currentSection === 'attendance' && students.length > 0 && markingList.length === 0) {
      setMarkingList(students.map(s => ({ student: s._id, studentId: s.studentId, name: s.name, status: 'Present' })));
    }
  }, [students, currentSection]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setLoad('profile', true);
    try {
      await facultyService.updateMyProfile(profileForm);
      setEditingProfile(false);
      showToast('Profile updated successfully!');
      loadProfile();
    } catch (e) { showToast(e?.message || 'Failed to update profile.', 'error'); }
    finally { setLoad('profile', false); }
  };

  const handleMarkAttendance = async () => {
    if (!attendanceForm.className || !attendanceForm.subject || !attendanceForm.date) {
      return showToast('Please fill class, subject, and date.', 'error');
    }
    setLoad('markAtt', true);
    const records = markingList.map(m => ({ student: m.student, status: m.status }));
    try {
      await facultyService.markAttendance({ ...attendanceForm, records });
      showToast('Attendance saved to MongoDB successfully!');
      loadAttendanceRecords();
      setAttendanceView('reports');
    } catch (e) {
      if (e?.status === 409) showToast(e?.message || 'Attendance already marked for this session.', 'error');
      else showToast(e?.message || 'Failed to save attendance.', 'error');
    } finally { setLoad('markAtt', false); }
  };

  const handleEditAttendance = async (id) => {
    setLoad('editAtt', true);
    const records = markingList.map(m => ({ student: m.student, status: m.status }));
    try {
      await facultyService.editAttendance(id, { records });
      showToast('Attendance updated!');
      setEditingAttendanceId(null);
      loadAttendanceRecords();
      setAttendanceView('reports');
    } catch (e) { showToast(e?.message || 'Failed to update attendance.', 'error'); }
    finally { setLoad('editAtt', false); }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.dueDate || !assignmentForm.maxMarks) {
      return showToast('Title, due date and max marks are required.', 'error');
    }
    setLoad('createAssign', true);
    try {
      await facultyService.createAssignment({ ...assignmentForm, courseId: assignmentForm.courseId || '000000000000000000000001' });
      showToast('Assignment created successfully!');
      setCreateAssignmentOpen(false);
      setAssignmentForm({ title: '', description: '', courseId: '', dueDate: '', maxMarks: 50, submissionType: 'text' });
      loadAssignments();
    } catch (e) { showToast(e?.message || 'Failed to create assignment.', 'error'); }
    finally { setLoad('createAssign', false); }
  };

  const handleScheduleExam = async () => {
    if (!examForm.title || !examForm.examDate) return showToast('Title and date are required.', 'error');
    setLoad('scheduleExam', true);
    try {
      await facultyService.scheduleExam(examForm);
      showToast('Exam scheduled successfully!');
      setScheduleExamOpen(false);
      setExamForm({ title: '', subject: '', className: '', semester: 7, examDate: '', startTime: '10:00', duration: 120, venue: '', maxMarks: 100, examType: 'Mid-Term', instructions: '' });
      loadExams();
    } catch (e) { showToast(e?.message || 'Failed to schedule exam.', 'error'); }
    finally { setLoad('scheduleExam', false); }
  };

  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setLoad('subs', true);
    try {
      const res = await facultyService.getSubmissions(assignment._id);
      setSubmissions(res?.submissions || res || []);
    } catch { setSubmissions([]); }
    finally { setLoad('subs', false); }
    setSubmissionsModalOpen(true);
  };

  const handleGiveFeedback = async () => {
    setLoad('feedback', true);
    try {
      await facultyService.giveFeedback(feedbackForm.submissionId, { feedback: feedbackForm.feedback, marksObtained: feedbackForm.marksObtained });
      showToast('Feedback submitted!');
      setFeedbackModalOpen(false);
      if (selectedAssignment) handleViewSubmissions(selectedAssignment);
    } catch (e) { showToast(e?.message || 'Failed to submit feedback.', 'error'); }
    finally { setLoad('feedback', false); }
  };

  const handleEnterResult = async () => {
    if (!resultForm.studentId || !resultForm.assessmentName || !resultForm.marksObtained) {
      return showToast('Student, assessment name, and marks are required.', 'error');
    }
    setLoad('result', true);
    try {
      if (editingResultId) {
        await facultyService.updateResult(editingResultId, resultForm);
        showToast('Result updated!');
      } else {
        await facultyService.enterResult({ ...resultForm, courseId: resultForm.courseId || '000000000000000000000001' });
        showToast('Result saved!');
      }
      setResultModalOpen(false);
      setEditingResultId(null);
      setResultForm({ studentId: '', courseId: '', assessmentName: '', assessmentType: 'Exam', maxMarks: 100, marksObtained: '', semester: 7, session: '2026-27', feedback: '' });
      loadResults();
    } catch (e) {
      if (e?.status === 409) showToast('Result already exists. Edit it instead.', 'error');
      else showToast(e?.message || 'Failed to save result.', 'error');
    } finally { setLoad('result', false); }
  };

  const handleApplyLeave = async () => {
    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason) {
      return showToast('All fields are required.', 'error');
    }
    setLoad('leave', true);
    try {
      await facultyService.applyLeave(leaveForm);
      showToast('Leave application submitted!');
      setLeaveModalOpen(false);
      setLeaveForm({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '' });
      loadLeaves();
    } catch (e) { showToast(e?.message || 'Failed to apply for leave.', 'error'); }
    finally { setLoad('leave', false); }
  };

  const handleCancelLeave = async (id) => {
    setLoad(`delLeave_${id}`, true);
    try {
      await facultyService.cancelLeave(id);
      showToast('Leave cancelled.');
      loadLeaves();
    } catch (e) { showToast(e?.message || 'Failed to cancel leave.', 'error'); }
    finally { setLoad(`delLeave_${id}`, false); }
  };

  const handleCreateNotice = async () => {
    if (!noticeForm.title || !noticeForm.content) return showToast('Title and content are required.', 'error');
    setLoad('notice', true);
    try {
      await facultyService.createNotice(noticeForm);
      showToast('Notice published!');
      setNoticeModalOpen(false);
      setNoticeForm({ title: '', content: '', category: 'Academic', targetAudience: 'All', pinned: false });
      loadNotices();
    } catch (e) { showToast(e?.message || 'Failed to create notice.', 'error'); }
    finally { setLoad('notice', false); }
  };

  // ─── Section Renderers ──────────────────────────────────────────────────

  // OVERVIEW
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Students" value={students.length || 124} subtitle="Across all classes" colorVariant="navy" icon={<Users className="w-5 h-5 text-navy-800" />} change="Active" changeType="increase" />
        <StatCard title="Pending Assignments" value={assignments.filter(a => new Date(a.dueDate) > new Date()).length || 3} subtitle="Awaiting grading" colorVariant="amber" icon={<ClipboardList className="w-5 h-5 text-amber-600" />} change="Due soon" changeType="neutral" />
        <StatCard title="Exams Scheduled" value={exams.length || 2} subtitle="This semester" colorVariant="teal" icon={<Award className="w-5 h-5 text-teal-600" />} change="Upcoming" changeType="neutral" />
        <StatCard title="Notices Posted" value={notices.length} subtitle="Active announcements" colorVariant="emerald" icon={<Bell className="w-5 h-5 text-emerald-600" />} change="Published" changeType="increase" />
      </div>
      {/* Quick timetable today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Today's Classes" subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`} badge={<Badge variant="teal" size="sm">Live Schedule</Badge>}>
          {timetable.filter(t => t.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">No classes scheduled today</div>
          ) : (
            <div className="space-y-2">
              {timetable.filter(t => t.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'long' })).map(t => (
                <div key={t._id} className="flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs">
                  <div><p className="font-semibold text-slate-900">{t.course?.name || t.subject}</p><p className="text-slate-500">Sec {t.section} • {t.classroom}</p></div>
                  <span className="font-mono text-teal-700 font-bold">{t.startTime} – {t.endTime}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Recent Notices" badge={<Badge variant="info" size="sm">{notices.length} Active</Badge>}>
          <div className="space-y-2">
            {notices.slice(0, 3).map(n => (
              <div key={n._id} className="flex items-start gap-3 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                {n.pinned && <Star className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />}
                <div>
                  <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{n.authorName} • {fmt(n.publishedAt)}</p>
                </div>
              </div>
            ))}
            {notices.length === 0 && <div className="text-center text-slate-400 text-sm py-4">No notices yet</div>}
          </div>
        </Card>
      </div>
    </div>
  );

  // PROFILE
  const renderProfile = () => (
    <Card
      title="Faculty Profile"
      subtitle="View and update your personal and professional details"
      action={
        editingProfile
          ? <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingProfile(false)}>Cancel</Button>
              <Button variant="teal" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />} onClick={handleSaveProfile} disabled={loading.profile}>{loading.profile ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          : <Button variant="secondary" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => setEditingProfile(true)}>Edit Profile</Button>
      }
    >
      <div className="space-y-6">
        {/* Avatar + Name */}
        <div className="flex items-center gap-5 p-5 bg-[#102A43] border border-[#0D9488]/40 rounded-xl">
          <div className="w-20 h-20 rounded-2xl bg-teal-600/30 border-2 border-teal-400/40 flex items-center justify-center text-teal-200 text-3xl font-bold shrink-0">
            {(profile?.name || 'F')[0].toUpperCase()}
          </div>
          <div className="text-white">
            <p className="font-bold text-xl">{profile?.name || 'Loading…'}</p>
            <p className="text-teal-300 text-sm">{profile?.metadata?.designation || profileForm.designation || 'Faculty'}</p>
            <p className="text-slate-300 text-xs mt-1">{profile?.email}</p>
            <Badge variant="info" size="sm" className="mt-1.5">Employee ID: {profile?.metadata?.employeeId || profileForm.employeeId || '—'}</Badge>
          </div>
        </div>

        {/* Detail Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', field: 'name', icon: <User className="w-3.5 h-3.5" /> },
            { label: 'Employee ID', field: 'employeeId', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
            { label: 'Designation', field: 'designation', icon: <Briefcase className="w-3.5 h-3.5" /> },
            { label: 'Phone', field: 'phone', icon: <Phone className="w-3.5 h-3.5" /> },
            { label: 'Qualification', field: 'qualification', icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { label: 'Address', field: 'address', icon: <MapPin className="w-3.5 h-3.5" /> },
          ].map(({ label, field, icon }) => (
            <div key={field} className="space-y-1">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {icon} {label}
              </label>
              {editingProfile
                ? <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" value={profileForm[field] || ''} onChange={e => setProfileForm(p => ({ ...p, [field]: e.target.value }))} />
                : <p className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800">{profileForm[field] || '—'}</p>
              }
            </div>
          ))}
        </div>

        {/* Readonly info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-navy-50 border border-navy-100 rounded-lg text-xs">
            <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
            <p className="text-slate-900 font-medium flex items-center gap-1.5"><Mail className="w-3 h-3" />{profile?.email || '—'}</p>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-xs">
            <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1">Department</p>
            <p className="text-slate-900 font-medium flex items-center gap-1.5"><Building2 className="w-3 h-3" />{profile?.department?.name || 'Computer Science & Engineering'}</p>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs">
            <p className="font-semibold text-slate-500 uppercase tracking-wide mb-1">Role</p>
            <p className="text-slate-900 font-medium capitalize flex items-center gap-1.5"><Star className="w-3 h-3" />{profile?.role || 'Faculty'}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  // STUDENTS
  const renderStudents = () => (
    <Card
      title="Student Management"
      subtitle="View assigned students, profiles, attendance, and academic progress"
      badge={<Badge variant="teal" size="sm">{students.length} Students</Badge>}
    >
      {loading.students ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : (
        <Table
          keyField="_id"
          columns={[
            { key: 'studentId', header: 'Roll No.', render: v => <span className="font-mono font-bold text-xs text-navy-900">{v}</span> },
            { key: 'name', header: 'Student Name', render: v => <span className="font-medium text-xs text-slate-900">{v}</span> },
            { key: 'email', header: 'Email', render: v => <span className="text-xs text-slate-500">{v}</span> },
            { key: 'semester', header: 'Semester', render: v => <Badge variant="info" size="sm">Sem {v}</Badge> },
            { key: 'department', header: 'Department', render: v => <span className="text-xs text-slate-600">{v?.name || '—'}</span> },
            { key: 'status', header: 'Status', render: v => <Badge variant={v === 'Active' ? 'success' : 'warning'} size="sm" hasDot>{v}</Badge> },
            { key: 'actions', header: '', render: (_, r) => (
              <Button variant="secondary" size="sm" className="text-xs" leftIcon={<Eye className="w-3 h-3" />} onClick={() => { setSelectedStudent(r); setStudentModalOpen(true); }}>View</Button>
            )},
          ]}
          data={students}
        />
      )}

      {/* Student Detail Modal */}
      <Modal isOpen={studentModalOpen} onClose={() => setStudentModalOpen(false)} title="Student Profile" description={selectedStudent?.studentId}>
        {selectedStudent && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-5 bg-[#102A43] border border-[#0D9488]/40 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-teal-600/40 flex items-center justify-center text-white text-xl font-bold">{selectedStudent.name[0]}</div>
              <div className="text-white">
                <p className="font-bold text-base">{selectedStudent.name}</p>
                <p className="text-teal-300">{selectedStudent.studentId}</p>
                <p className="text-slate-300 text-xs">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Department', selectedStudent.department?.name], ['Semester', `Sem ${selectedStudent.semester}`], ['Status', selectedStudent.status], ['Enrolled', fmt(selectedStudent.createdAt)]].map(([l, v]) => (
                <div key={l} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{l}</p>
                  <p className="text-slate-900 font-medium">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );

  // ATTENDANCE
  const renderAttendance = () => (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-2">
        {[['mark', 'Mark Attendance'], ['reports', 'View Reports']].map(([v, l]) => (
          <button key={v} onClick={() => setAttendanceView(v)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${attendanceView === v ? 'bg-teal-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{l}</button>
        ))}
      </div>

      {attendanceView === 'mark' && (
        <Card title="Mark Attendance" subtitle="Select class details then mark each student's status">
          {/* Session form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Class / Section', field: 'className', placeholder: 'e.g. CS-7A' },
              { label: 'Subject', field: 'subject', placeholder: 'e.g. Artificial Intelligence' },
              { label: 'Semester', field: 'semester', placeholder: '1–12', type: 'number' },
              { label: 'Date', field: 'date', type: 'date' },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input type={type || 'text'} placeholder={placeholder} value={attendanceForm[field]} onChange={e => setAttendanceForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all" />
              </div>
            ))}
          </div>

          {/* Student marking list */}
          {loading.students ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 gap-2 px-4 py-2.5 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <span className="col-span-1">Roll No</span>
                <span className="col-span-2">Student Name</span>
                <span className="col-span-2 text-center">Attendance Status</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {markingList.map((m, idx) => (
                  <div key={m.student || idx} className="grid grid-cols-5 gap-2 px-4 py-2.5 items-center hover:bg-slate-50">
                    <span className="col-span-1 font-mono text-xs font-bold text-navy-900">{m.studentId}</span>
                    <span className="col-span-2 text-xs text-slate-800">{m.name}</span>
                    <div className="col-span-2 flex gap-2 justify-center">
                      {['Present', 'Absent', 'Late'].map(status => (
                        <button key={status} onClick={() => setMarkingList(prev => prev.map((p, i) => i === idx ? { ...p, status } : p))}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${m.status === status ? (status === 'Present' ? 'bg-emerald-500 text-white' : status === 'Absent' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white') : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {markingList.length === 0 && <div className="text-center py-6 text-slate-400 text-sm">No students loaded. Students must be in the system.</div>}
              </div>
            </div>
          )}

          {/* Summary + save */}
          {markingList.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Present: {markingList.filter(m => m.status === 'Present').length}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Absent: {markingList.filter(m => m.status === 'Absent').length}</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />Late: {markingList.filter(m => m.status === 'Late').length}</span>
              </div>
              <Button variant="teal" size="sm" onClick={handleMarkAttendance} disabled={loading.markAtt}>{loading.markAtt ? 'Saving…' : 'Save Attendance to MongoDB'}</Button>
            </div>
          )}
        </Card>
      )}

      {attendanceView === 'reports' && (
        <Card title="Attendance Records" subtitle="All saved attendance sessions" badge={<Badge variant="info" size="sm">{attendanceRecords.length} Records</Badge>} action={<Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadAttendanceRecords}>Refresh</Button>}>
          {loading.attendance ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div> : (
            attendanceRecords.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No attendance records yet. Mark attendance first.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceRecords.map(rec => (
                  <div key={rec._id} className="p-3 border border-slate-200 rounded-xl hover:border-teal-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-sm text-slate-900">{rec.className} — {rec.subject}</span>
                        <span className="ml-2 text-xs text-slate-500">Sem {rec.semester} • {fmt(rec.date)}</span>
                      </div>
                      <Button variant="secondary" size="sm" className="text-xs" leftIcon={<Edit2 className="w-3 h-3" />}
                        onClick={() => { setMarkingList(rec.records.map(r => ({ student: r.student?._id || r.student, studentId: r.student?.studentId || '—', name: r.student?.name || '—', status: r.status }))); setEditingAttendanceId(rec._id); setAttendanceView('mark'); }}>
                        Edit
                      </Button>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-emerald-700 font-semibold">✓ Present: {rec.totalPresent}</span>
                      <span className="text-red-600 font-semibold">✗ Absent: {rec.totalAbsent}</span>
                      <span className="text-amber-600 font-semibold">⏱ Late: {rec.totalLate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
          {editingAttendanceId && (
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setEditingAttendanceId(null); setAttendanceView('reports'); }}>Cancel Edit</Button>
              <Button variant="teal" size="sm" onClick={() => handleEditAttendance(editingAttendanceId)} disabled={loading.editAtt}>{loading.editAtt ? 'Saving…' : 'Save Edits'}</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );

  // ASSIGNMENTS & EXAMS
  const renderAssignments = () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[['assignments', 'Assignments'], ['exams', 'Examinations']].map(([v, l]) => (
          <button key={v} onClick={() => setAssignmentTab(v)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${assignmentTab === v ? 'bg-teal-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{l}</button>
        ))}
      </div>

      {assignmentTab === 'assignments' && (
        <Card title="Assignments" subtitle="Create assignments, review submissions, and provide feedback" action={<Button variant="teal" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setCreateAssignmentOpen(true)}>New Assignment</Button>}>
          {loading.assignments ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div> : (
            assignments.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No assignments yet. Create one above.</p></div>
            ) : (
              <Table keyField="_id"
                columns={[
                  { key: 'title', header: 'Assignment Title', render: v => <span className="font-semibold text-xs text-slate-900">{v}</span> },
                  { key: 'course', header: 'Course', render: v => <span className="font-mono text-xs text-navy-900">{v?.code || '—'}</span> },
                  { key: 'dueDate', header: 'Due Date', render: v => <span className="font-mono text-xs text-slate-500">{fmt(v)}</span> },
                  { key: 'maxMarks', header: 'Max Marks', render: v => <span className="text-xs font-semibold">{v}</span> },
                  { key: 'published', header: 'Status', render: v => <Badge variant={v ? 'success' : 'warning'} size="sm" hasDot>{v ? 'Published' : 'Draft'}</Badge> },
                  { key: 'actions', header: '', render: (_, r) => (
                    <Button variant="secondary" size="sm" className="text-xs" leftIcon={<Eye className="w-3 h-3" />} onClick={() => handleViewSubmissions(r)} disabled={loading.subs}>Submissions</Button>
                  )},
                ]}
                data={assignments}
              />
            )
          )}
        </Card>
      )}

      {assignmentTab === 'exams' && (
        <Card title="Examination Schedule" subtitle="Schedule exams and enter marks" action={<Button variant="teal" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setScheduleExamOpen(true)}>Schedule Exam</Button>}>
          {exams.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><Award className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No exams scheduled yet.</p></div>
          ) : (
            <Table keyField="_id"
              columns={[
                { key: 'title', header: 'Exam Title', render: v => <span className="font-semibold text-xs text-slate-900">{v}</span> },
                { key: 'subject', header: 'Subject', render: v => <span className="text-xs text-slate-700">{v}</span> },
                { key: 'examType', header: 'Type', render: v => <Badge variant="info" size="sm">{v}</Badge> },
                { key: 'examDate', header: 'Date', render: v => <span className="font-mono text-xs">{fmt(v)}</span> },
                { key: 'startTime', header: 'Time', render: v => <span className="font-mono text-xs text-teal-700">{v}</span> },
                { key: 'maxMarks', header: 'Max Marks', render: v => <span className="font-mono text-xs font-bold">{v}</span> },
                { key: 'venue', header: 'Venue', render: v => <span className="text-xs text-slate-500">{v || '—'}</span> },
              ]}
              data={exams}
            />
          )}
        </Card>
      )}

      {/* Create Assignment Modal */}
      <Modal isOpen={createAssignmentOpen} onClose={() => setCreateAssignmentOpen(false)} title="Create Assignment"
        footer={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setCreateAssignmentOpen(false)}>Cancel</Button><Button variant="teal" size="sm" onClick={handleCreateAssignment} disabled={loading.createAssign}>{loading.createAssign ? 'Creating…' : 'Create Assignment'}</Button></div>}>
        <div className="space-y-3">
          {[{ label: 'Assignment Title', field: 'title', placeholder: 'e.g. Backpropagation Implementation' }, { label: 'Description', field: 'description', placeholder: 'Assignment details...' }, { label: 'Due Date', field: 'dueDate', type: 'date' }, { label: 'Max Marks', field: 'maxMarks', type: 'number', placeholder: '50' }].map(({ label, field, placeholder, type }) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type={type || 'text'} placeholder={placeholder} value={assignmentForm[field]} onChange={e => setAssignmentForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Submission Type</label>
            <select value={assignmentForm.submissionType} onChange={e => setAssignmentForm(p => ({ ...p, submissionType: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30">
              <option value="text">Text</option><option value="file">File</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Schedule Exam Modal */}
      <Modal isOpen={scheduleExamOpen} onClose={() => setScheduleExamOpen(false)} title="Schedule Examination"
        footer={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setScheduleExamOpen(false)}>Cancel</Button><Button variant="teal" size="sm" onClick={handleScheduleExam} disabled={loading.scheduleExam}>{loading.scheduleExam ? 'Scheduling…' : 'Schedule Exam'}</Button></div>}>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'Exam Title', field: 'title', colSpan: 2 }, { label: 'Subject', field: 'subject' }, { label: 'Class', field: 'className' }, { label: 'Exam Date', field: 'examDate', type: 'date' }, { label: 'Start Time', field: 'startTime', type: 'time' }, { label: 'Duration (min)', field: 'duration', type: 'number' }, { label: 'Max Marks', field: 'maxMarks', type: 'number' }, { label: 'Venue', field: 'venue' }].map(({ label, field, type, colSpan }) => (
            <div key={field} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type={type || 'text'} value={examForm[field]} onChange={e => setExamForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Type</label>
            <select value={examForm.examType} onChange={e => setExamForm(p => ({ ...p, examType: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30">
              {['Mid-Term', 'End-Term', 'Unit Test', 'Practical', 'Viva', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* Submissions Modal */}
      <Modal isOpen={submissionsModalOpen} onClose={() => setSubmissionsModalOpen(false)} title="Assignment Submissions" description={selectedAssignment?.title}>
        {loading.subs ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div> : (
          submissions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No submissions yet.</div>
          ) : (
            <div className="space-y-2">
              {submissions.map(sub => (
                <div key={sub._id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{sub.student?.name || '—'}</p>
                    <p className="text-slate-500">{sub.student?.studentId} • {fmt(sub.submittedAt)}</p>
                    {sub.feedback && <p className="text-slate-600 mt-0.5 italic">"{sub.feedback}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.marksObtained !== undefined && <span className="font-bold text-teal-700">{sub.marksObtained}/{selectedAssignment?.maxMarks}</span>}
                    <Badge variant={sub.status === 'graded' ? 'success' : 'warning'} size="sm">{sub.status}</Badge>
                    <Button variant="secondary" size="sm" className="text-xs" onClick={() => { setFeedbackForm({ submissionId: sub._id, feedback: sub.feedback || '', marksObtained: sub.marksObtained || '' }); setFeedbackModalOpen(true); }}>
                      {sub.status === 'graded' ? 'Edit Feedback' : 'Give Feedback'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Modal>

      {/* Feedback Modal */}
      <Modal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} title="Provide Feedback"
        footer={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setFeedbackModalOpen(false)}>Cancel</Button><Button variant="teal" size="sm" onClick={handleGiveFeedback} disabled={loading.feedback}>{loading.feedback ? 'Submitting…' : 'Submit Feedback'}</Button></div>}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Marks Obtained</label>
            <input type="number" value={feedbackForm.marksObtained} onChange={e => setFeedbackForm(p => ({ ...p, marksObtained: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" placeholder="Enter marks" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Written Feedback</label>
            <textarea rows={4} value={feedbackForm.feedback} onChange={e => setFeedbackForm(p => ({ ...p, feedback: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none" placeholder="Write detailed feedback for the student..." />
          </div>
        </div>
      </Modal>
    </div>
  );

  // RESULTS
  const renderResults = () => (
    <Card title="Results Management" subtitle="Enter, update, and manage subject-wise marks and results"
      action={<Button variant="teal" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => { setEditingResultId(null); setResultForm({ studentId: '', courseId: '', assessmentName: '', assessmentType: 'Exam', maxMarks: 100, marksObtained: '', semester: 7, session: '2026-27', feedback: '' }); setResultModalOpen(true); }}>Add Result</Button>}>
      {loading.results ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div> : (
        results.length === 0 ? (
          <div className="text-center py-12 text-slate-400"><TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No results entered yet. Add one above.</p></div>
        ) : (
          <Table keyField="_id"
            columns={[
              { key: 'student', header: 'Student', render: v => <div><p className="font-semibold text-xs text-slate-900">{v?.name || '—'}</p><p className="text-[11px] text-slate-500">{v?.studentId}</p></div> },
              { key: 'course', header: 'Course', render: v => <span className="font-mono text-xs text-navy-900">{v?.code || '—'}</span> },
              { key: 'assessmentName', header: 'Assessment', render: v => <span className="text-xs text-slate-700">{v}</span> },
              { key: 'assessmentType', header: 'Type', render: v => <Badge variant="info" size="sm">{v}</Badge> },
              { key: 'marksObtained', header: 'Marks', render: (v, r) => <span className="font-mono font-bold text-xs text-teal-700">{v}/{r.maxMarks}</span> },
              { key: 'published', header: 'Status', render: v => <Badge variant={v ? 'success' : 'warning'} size="sm" hasDot>{v ? 'Published' : 'Draft'}</Badge> },
              { key: 'actions', header: '', render: (_, r) => (
                <Button variant="secondary" size="sm" className="text-xs" leftIcon={<Edit2 className="w-3 h-3" />} onClick={() => { setEditingResultId(r._id); setResultForm({ studentId: r.student?._id || r.student, courseId: r.course?._id || r.course, assessmentName: r.assessmentName, assessmentType: r.assessmentType, maxMarks: r.maxMarks, marksObtained: r.marksObtained, semester: r.semester, session: r.session, feedback: r.feedback || '' }); setResultModalOpen(true); }}>Edit</Button>
              )},
            ]}
            data={results}
          />
        )
      )}

      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} title={editingResultId ? 'Edit Result' : 'Enter Result'}
        footer={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setResultModalOpen(false)}>Cancel</Button><Button variant="teal" size="sm" onClick={handleEnterResult} disabled={loading.result}>{loading.result ? 'Saving…' : (editingResultId ? 'Update Result' : 'Save Result')}</Button></div>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Student</label>
            <select value={resultForm.studentId} onChange={e => setResultForm(p => ({ ...p, studentId: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30">
              <option value="">Select Student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
            </select>
          </div>
          {[{ label: 'Assessment Name', field: 'assessmentName', colSpan: 2 }, { label: 'Semester', field: 'semester', type: 'number' }, { label: 'Session', field: 'session', placeholder: '2026-27' }, { label: 'Max Marks', field: 'maxMarks', type: 'number' }, { label: 'Marks Obtained', field: 'marksObtained', type: 'number' }].map(({ label, field, type, placeholder, colSpan }) => (
            <div key={field} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type={type || 'text'} placeholder={placeholder} value={resultForm[field]} onChange={e => setResultForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Assessment Type</label>
            <select value={resultForm.assessmentType} onChange={e => setResultForm(p => ({ ...p, assessmentType: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30">
              {['Exam', 'Quiz', 'Assignment', 'Project', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Feedback (Optional)</label>
            <textarea rows={2} value={resultForm.feedback} onChange={e => setResultForm(p => ({ ...p, feedback: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none" placeholder="Optional feedback for the student..." />
          </div>
        </div>
      </Modal>
    </Card>
  );

  // TIMETABLE
  const renderTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return (
      <Card title="Weekly Timetable" subtitle="Your assigned classes, subjects, and examination schedules" badge={<Badge variant="teal" size="sm">Sem 2026–27</Badge>} action={<Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadTimetable}>Refresh</Button>}>
        {loading.timetable ? <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div> : (
          <div className="space-y-4">
            {days.map(day => {
              const classes = timetable.filter(t => t.dayOfWeek === day);
              if (classes.length === 0) return null;
              return (
                <div key={day}>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />{day}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {classes.map(c => (
                      <div key={c._id} className="p-3 border border-teal-100 bg-teal-50/50 rounded-xl flex items-center gap-3 hover:border-teal-300 transition-colors">
                        <div className="text-center bg-white border border-teal-200 rounded-lg px-2 py-1.5 shrink-0">
                          <p className="font-mono text-[11px] font-bold text-teal-700">{c.startTime}</p>
                          <p className="font-mono text-[10px] text-slate-400">{c.endTime}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{c.course?.name || c.subject}</p>
                          <p className="text-xs text-slate-500">{c.course?.code} • Sec {c.section} • {c.classroom}</p>
                          <Badge variant="info" size="sm">Sem {c.semester}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {timetable.length === 0 && <div className="text-center py-12 text-slate-400"><Clock className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No timetable records found.</p></div>}
          </div>
        )}
      </Card>
    );
  };

  // LEAVE
  const renderLeave = () => (
    <div className="space-y-4">
      <Card title="Leave Applications" subtitle="Apply for leave and track approval status"
        action={<Button variant="teal" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setLeaveModalOpen(true)}>Apply for Leave</Button>}>
        {loading.leaves ? <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16" />)}</div> : (
          leaves.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No leave applications. Apply above.</p></div>
          ) : (
            <div className="space-y-3">
              {leaves.map(l => (
                <div key={l._id} className={`p-4 border rounded-xl flex items-start justify-between ${l.status === 'Approved' ? 'bg-emerald-50 border-emerald-200' : l.status === 'Rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={leaveStatusColor[l.status]} size="sm" hasDot>{l.status}</Badge>
                      <span className="text-xs font-bold text-slate-900">{l.leaveType}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-mono">{fmt(l.fromDate)} → {fmt(l.toDate)}</p>
                    <p className="text-xs text-slate-600 mt-1 italic">"{l.reason}"</p>
                    {l.adminRemarks && <p className="text-xs text-slate-500 mt-0.5">Admin: {l.adminRemarks}</p>}
                    <p className="text-[11px] text-slate-400 mt-1">Applied: {fmt(l.createdAt)}</p>
                  </div>
                  {l.status === 'Pending' && (
                    <Button variant="danger" size="sm" className="text-xs shrink-0" leftIcon={<Trash2 className="w-3 h-3" />} onClick={() => handleCancelLeave(l._id)} disabled={loading[`delLeave_${l._id}`]}>
                      {loading[`delLeave_${l._id}`] ? '…' : 'Cancel'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <Modal isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Apply for Leave"
        footer={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setLeaveModalOpen(false)}>Cancel</Button><Button variant="teal" size="sm" onClick={handleApplyLeave} disabled={loading.leave}>{loading.leave ? 'Submitting…' : 'Submit Application'}</Button></div>}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Leave Type</label>
            <select value={leaveForm.leaveType} onChange={e => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30">
              {['Casual Leave', 'Medical Leave', 'Earned Leave', 'Emergency Leave', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label><input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm(p => ({ ...p, fromDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label><input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm(p => ({ ...p, toDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reason</label>
            <textarea rows={4} value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none focus:border-teal-500" placeholder="Provide a detailed reason for leave..." />
          </div>
        </div>
      </Modal>
    </div>
  );

  // NOTICES
  const categoryColor = { General: 'info', Academic: 'teal', Exam: 'warning', Event: 'success', Urgent: 'danger' };
  const renderNotices = () => (
    <div className="space-y-4">
      <Card title="Announcements & Notices" subtitle="View college notices and share academic updates"
        badge={<Badge variant="info" size="sm">{notices.length} Notices</Badge>}
        action={<Button variant="teal" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setNoticeModalOpen(true)}>Post Notice</Button>}>
        {loading.notices ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div> : (
          notices.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No notices yet.</p></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {notices.map(n => (
                <div key={n._id} className={`p-4 border rounded-xl hover:shadow-sm transition-all ${n.pinned ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {n.pinned && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span className="font-bold text-sm text-slate-900 leading-tight">{n.title}</span>
                    </div>
                    <Badge variant={categoryColor[n.category] || 'info'} size="sm">{n.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">{n.content}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500">By: {n.authorName || n.author?.name || 'Admin'}</span>
                    <span>{fmt(n.publishedAt || n.createdAt)}</span>
                  </div>
                  <div className="mt-1.5">
                    <Badge variant="info" size="sm">For: {n.targetAudience}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <Modal isOpen={noticeModalOpen} onClose={() => setNoticeModalOpen(false)} title="Post Academic Notice"
        footer={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setNoticeModalOpen(false)}>Cancel</Button><Button variant="teal" size="sm" onClick={handleCreateNotice} disabled={loading.notice}>{loading.notice ? 'Publishing…' : 'Publish Notice'}</Button></div>}>
        <div className="space-y-3">
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Notice Title</label><input value={noticeForm.title} onChange={e => setNoticeForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500" placeholder="e.g. Mid-Term Exam Postponed" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Content</label><textarea rows={4} value={noticeForm.content} onChange={e => setNoticeForm(p => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none focus:border-teal-500" placeholder="Enter the notice content..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Category</label><select value={noticeForm.category} onChange={e => setNoticeForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30">{['General', 'Academic', 'Exam', 'Event', 'Urgent'].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Target Audience</label><select value={noticeForm.targetAudience} onChange={e => setNoticeForm(p => ({ ...p, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30">{['All', 'Students', 'Faculty', 'Staff'].map(a => <option key={a}>{a}</option>)}</select></div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer"><input type="checkbox" checked={noticeForm.pinned} onChange={e => setNoticeForm(p => ({ ...p, pinned: e.target.checked }))} className="rounded text-teal-600 focus:ring-teal-500" /> Pin this notice to the top</label>
        </div>
      </Modal>
    </div>
  );

  // Section title map
  const sectionMeta = {
    overview: { title: `Welcome, ${user?.name || 'Dr. Rajiv Menon'}`, subtitle: 'Associate Professor • Computer Science & Engineering' },
    profile: { title: 'Faculty Profile', subtitle: 'Personal details, contact, and professional information' },
    students: { title: 'Student Management', subtitle: 'Assigned students, profiles, attendance, and academic progress' },
    attendance: { title: 'Attendance Management', subtitle: 'Mark, edit, and view attendance records saved in MongoDB' },
    assignments: { title: 'Assignments & Exams', subtitle: 'Create assignments, schedule exams, review submissions, and grade' },
    results: { title: 'Results Management', subtitle: 'Enter and update subject-wise marks and results' },
    timetable: { title: 'Timetable', subtitle: 'Assigned classes, subjects, and examination schedules' },
    leave: { title: 'Leave Management', subtitle: 'Apply for leave and track approval status' },
    notices: { title: 'Notices', subtitle: 'View announcements and share authorized academic updates' },
  };
  const meta = sectionMeta[currentSection] || sectionMeta.overview;

  const breadcrumbs = currentSection === 'overview'
    ? [{ label: 'Faculty Portal', to: '/faculty' }, { label: 'Overview' }]
    : [{ label: 'Faculty Portal', to: '/faculty' }, { label: meta.title }];

  return (
    <div className="space-y-6">
      {/* Back button on sub-sections */}
      {currentSection !== 'overview' && (
        <Link to="/faculty" className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Overview
        </Link>
      )}

      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumbs={breadcrumbs}
        badge={<Badge variant="info" size="sm">Academic Year 2026–27</Badge>}
      />

      {/* Section Content */}
      {currentSection === 'overview' && renderOverview()}
      {currentSection === 'profile' && renderProfile()}
      {currentSection === 'students' && renderStudents()}
      {currentSection === 'attendance' && renderAttendance()}
      {currentSection === 'assignments' && renderAssignments()}
      {currentSection === 'results' && renderResults()}
      {currentSection === 'timetable' && renderTimetable()}
      {currentSection === 'leave' && renderLeave()}
      {currentSection === 'notices' && renderNotices()}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FacultyDashboard;
