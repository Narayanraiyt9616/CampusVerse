import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard, User, Users, CalendarCheck, ClipboardList, Award,
  Clock, Calendar, Bell, Plus, Edit2, Check, X, ChevronDown, ChevronUp,
  ArrowLeft, BookOpen, FileText, Download, AlertCircle, CheckCircle,
  Loader2, RefreshCw, Eye, Star, Briefcase, GraduationCap, Phone,
  Mail, MapPin, BadgeCheck, Building2, Pencil, Save, Trash2,
  FileCheck, AlertTriangle, Info, BookMarked, TrendingUp, Activity,
  HelpCircle, UploadCloud, CheckSquare, ArrowUp, ArrowDown, FileUp, Sparkles, Video
} from 'lucide-react';
import FacultyOnlineClassesSection from './faculty/FacultyOnlineClassesSection';

import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import PortalHeroBanner from '../../components/common/PortalHeroBanner';
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
    <div className="fixed bottom-6 right-6 z-[100] flex items-start gap-3 px-4 py-3 rounded-2xl border border-[#D99A00] bg-[#FFF8E6] text-[#111827] shadow-xl max-w-sm text-sm animate-fade-in font-medium">
      {type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#D99A00]" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#111827]" />}
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
  const [createAssignmentType, setCreateAssignmentType] = useState('mcq'); // 'mcq' | 'pdf'
  const [mcqPreviewMode, setMcqPreviewMode] = useState(false);
  const [scheduleExamOpen, setScheduleExamOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionAnswers, setSelectedSubmissionAnswers] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subject: 'Computer Science & Engineering',
    description: '',
    instructions: '',
    targetClass: 'CS-7A',
    targetSemester: 7,
    targetSection: 'A',
    dueDate: '',
    maxMarks: 50,
    requiresPdfSubmission: true,
  });

  const [examForm, setExamForm] = useState({
    title: '',
    subject: 'Computer Science & Engineering',
    className: 'CS-7A',
    semester: 7,
    examDate: '',
    startTime: '10:00',
    duration: 120,
    venue: 'LH-301',
    maxMarks: 100,
    examType: 'Mid-Term',
    instructions: '',
  });

  const [mcqQuestions, setMcqQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1,
      explanation: '',
    },
  ]);

  const [feedbackForm, setFeedbackForm] = useState({ submissionId: '', studentName: '', studentId: '', feedback: '', marksObtained: '' });
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
      const list = res?.assignments || res?.data || (Array.isArray(res) ? res : []);
      setAssignments(Array.isArray(list) ? list : []);
    } catch { setAssignments([]); }
    finally { setLoad('assignments', false); }
  }, []);

  const loadExams = useCallback(async () => {
    try {
      const res = await facultyService.getMyExams();
      const list = res?.exams || res?.data || (Array.isArray(res) ? res : []);
      setExams(Array.isArray(list) ? list : []);
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

  // MCQ Helpers
  const handleMcqAddQuestion = () => {
    setMcqQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 1,
        explanation: '',
      },
    ]);
  };

  const handleMcqRemoveQuestion = (index) => {
    if (mcqQuestions.length <= 1) {
      return showToast('At least one question is required.', 'error');
    }
    setMcqQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMcqMoveQuestion = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= mcqQuestions.length) return;
    setMcqQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleMcqQuestionChange = (index, field, value) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const handleMcqOptionChange = (qIndex, optIndex, value) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOpts = [...q.options];
        newOpts[optIndex] = value;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleMcqCorrectAnswerChange = (qIndex, optIndex) => {
    setMcqQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctAnswer: optIndex } : q))
    );
  };

  const mcqCalculatedMarks = mcqQuestions.reduce(
    (sum, q) => sum + (Number(q.marks) || 1),
    0
  );

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.dueDate) {
      return showToast('Assignment title and due date are required.', 'error');
    }

    if (createAssignmentType === 'mcq') {
      if (mcqQuestions.length === 0) {
        return showToast('Please add at least one question.', 'error');
      }
      for (let i = 0; i < mcqQuestions.length; i++) {
        if (!mcqQuestions[i].questionText?.trim()) {
          return showToast(`Question ${i + 1} text cannot be empty.`, 'error');
        }
        for (let j = 0; j < 4; j++) {
          if (!mcqQuestions[i].options[j]?.trim()) {
            return showToast(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`, 'error');
          }
        }
      }

      setLoad('createAssign', true);
      try {
        const payload = {
          title: assignmentForm.title,
          subject: assignmentForm.subject,
          description: assignmentForm.description,
          instructions: assignmentForm.instructions,
          targetClass: assignmentForm.targetClass,
          targetSemester: assignmentForm.targetSemester,
          targetSection: assignmentForm.targetSection,
          dueDate: assignmentForm.dueDate,
          maxMarks: mcqCalculatedMarks,
          assignmentType: 'mcq',
          questions: mcqQuestions,
        };
        await facultyService.createAssignment(payload);
        showToast('MCQ Assignment published to students!');
        setCreateAssignmentOpen(false);
        setMcqPreviewMode(false);
        setMcqQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1, explanation: '' }]);
        setAssignmentForm({ title: '', subject: 'Computer Science & Engineering', description: '', instructions: '', targetClass: 'CS-7A', targetSemester: 7, targetSection: 'A', dueDate: '', maxMarks: 50, requiresPdfSubmission: true });
        loadAssignments();
      } catch (e) {
        showToast(e?.message || 'Failed to create MCQ assignment.', 'error');
      } finally {
        setLoad('createAssign', false);
      }
    } else {
      // PDF Assignment
      if (!pdfFile) {
        return showToast('Please upload a question paper PDF document.', 'error');
      }
      if (!assignmentForm.maxMarks || Number(assignmentForm.maxMarks) <= 0) {
        return showToast('Please enter a valid maximum marks value.', 'error');
      }

      setLoad('createAssign', true);
      try {
        const formData = new FormData();
        formData.append('title', assignmentForm.title);
        formData.append('subject', assignmentForm.subject);
        formData.append('description', assignmentForm.description);
        formData.append('instructions', assignmentForm.instructions);
        formData.append('targetClass', assignmentForm.targetClass);
        formData.append('targetSemester', assignmentForm.targetSemester);
        formData.append('targetSection', assignmentForm.targetSection);
        formData.append('dueDate', assignmentForm.dueDate);
        formData.append('maxMarks', assignmentForm.maxMarks);
        formData.append('assignmentType', 'pdf');
        formData.append('requiresPdfSubmission', assignmentForm.requiresPdfSubmission);
        formData.append('questionPaper', pdfFile);

        await facultyService.createAssignment(formData);
        showToast('PDF Assignment published to students!');
        setCreateAssignmentOpen(false);
        setPdfFile(null);
        setAssignmentForm({ title: '', subject: 'Computer Science & Engineering', description: '', instructions: '', targetClass: 'CS-7A', targetSemester: 7, targetSection: 'A', dueDate: '', maxMarks: 50, requiresPdfSubmission: true });
        loadAssignments();
      } catch (e) {
        showToast(e?.message || 'Failed to publish PDF assignment.', 'error');
      } finally {
        setLoad('createAssign', false);
      }
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    setLoad(`delAsgn_${id}`, true);
    try {
      await facultyService.deleteAssignment(id);
      showToast('Assignment deleted successfully.');
      loadAssignments();
    } catch (e) {
      showToast(e?.message || 'Failed to delete assignment.', 'error');
    } finally {
      setLoad(`delAsgn_${id}`, false);
    }
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
      setSubmissions(res?.submissions || res?.data || res || []);
    } catch { setSubmissions([]); }
    finally { setLoad('subs', false); }
    setSubmissionsModalOpen(true);
  };

  const handleGiveFeedback = async () => {
    if (!feedbackForm.marksObtained && feedbackForm.marksObtained !== 0 && feedbackForm.marksObtained !== '0') {
      return showToast('Marks obtained is required.', 'error');
    }
    const marks = Number(feedbackForm.marksObtained);
    const max = selectedAssignment?.maxMarks || 100;
    if (isNaN(marks) || marks < 0 || marks > max) {
      return showToast(`Marks must be between 0 and maximum marks (${max}).`, 'error');
    }

    setLoad('feedback', true);
    try {
      await facultyService.giveFeedback(feedbackForm.submissionId, {
        feedback: feedbackForm.feedback,
        marksObtained: marks,
      });
      showToast('Evaluation published and student notified!');
      setFeedbackModalOpen(false);
      if (selectedAssignment) handleViewSubmissions(selectedAssignment);
      loadAssignments();
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
      {/* Reference Image Inspired Hero Welcome Banner */}
      <PortalHeroBanner
        portalName="Faculty Portal"
        roleTitle="Faculty"
        portalHighlight="Faculty Portal"
        headingPrefix="Welcome to"
        subtitle="Manage assigned classes, attendance telemetry, assignments, exam schedules, and student progress — all in one place."
        icon={<GraduationCap className="w-4 h-4" />}
        userName={user?.name || 'Dr. Rajiv Menon'}
        userIdentifier={user?.email || 'faculty@campusverse.edu'}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/faculty/attendance">
              <Button variant="primary" size="sm" leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>
                Mark Attendance
              </Button>
            </Link>
            <Link to="/faculty/assignments">
              <Button variant="secondary" size="sm" leftIcon={<ClipboardList className="w-3.5 h-3.5" />}>
                Assignments
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats with reference image pastel containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={students.length || 124}
          subtitle="Across all lecture sections"
          colorVariant="blue"
          icon={<Users className="w-5 h-5 text-[#2563EB]" />}
          change="Active"
          changeType="increase"
        />
        <StatCard
          title="Pending Assignments"
          value={assignments.filter(a => new Date(a.dueDate) > new Date()).length || 3}
          subtitle="Awaiting grading"
          colorVariant="amber"
          icon={<ClipboardList className="w-5 h-5 text-[#D97706]" />}
          change="Due soon"
          changeType="neutral"
        />
        <StatCard
          title="Exams Scheduled"
          value={exams.length || 2}
          subtitle="This semester"
          colorVariant="gold"
          icon={<Award className="w-5 h-5 text-[#D97706]" />}
          change="Upcoming"
          changeType="neutral"
        />
        <StatCard
          title="Notices Posted"
          value={notices.length}
          subtitle="Active announcements"
          colorVariant="emerald"
          icon={<Bell className="w-5 h-5 text-[#059669]" />}
          change="Published"
          changeType="increase"
        />
      </div>

      {/* 8 Module Navigation Cards inspired by Reference Image Bottom Feature Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/faculty/students', label: 'Student Management', icon: <Users className="w-5 h-5" />, desc: 'Class rosters & student progress', iconBg: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
          { to: '/faculty/online-classes', label: 'Online Classes', icon: <Video className="w-5 h-5" />, desc: 'Virtual classrooms & scheduled meetings', iconBg: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]' },
          { to: '/faculty/attendance', label: 'Attendance Management', icon: <CalendarCheck className="w-5 h-5" />, desc: 'Session mark sheets & shortage logs', iconBg: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]' },
          { to: '/faculty/assignments', label: 'Assignments & Exams', icon: <ClipboardList className="w-5 h-5" />, desc: 'Create tasks & schedule mid-terms', iconBg: 'bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]' },
          { to: '/faculty/results', label: 'Results Management', icon: <Award className="w-5 h-5" />, desc: 'Assessment scores & grade registry', iconBg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' },
          { to: '/faculty/timetable', label: 'Faculty Timetable', icon: <Clock className="w-5 h-5" />, desc: 'Weekly lectures & lab classroom slots', iconBg: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
          { to: '/faculty/leave', label: 'Leave Applications', icon: <Calendar className="w-5 h-5" />, desc: 'Casual, medical leaves & approvals', iconBg: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]' },
          { to: '/faculty/notices', label: 'Academic Notices', icon: <Bell className="w-5 h-5" />, desc: 'Broadcast circulars to students', iconBg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' },
          { to: '/faculty/profile', label: 'Faculty Profile', icon: <User className="w-5 h-5" />, desc: 'Designation & department credentials', iconBg: 'bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group block">
            <div className="p-5 rounded-2xl sm:rounded-3xl border border-[#F1E7CF] bg-white hover:border-[#FDE68A] shadow-[0_4px_20px_rgba(217,119,6,0.03)] hover:shadow-[0_12px_32px_rgba(217,119,6,0.09)] transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-110 transition-transform ${item.iconBg}`}>
                  {item.icon}
                </div>
                <p className="font-black text-[#0F172A] text-sm group-hover:text-[#D97706] transition-colors">{item.label}</p>
                <p className="text-xs text-[#64748B] font-medium mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick timetable today & Recent notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Today's Classes" subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`} badge={<Badge variant="teal" size="sm">Live Schedule</Badge>}>
          {timetable.filter(t => t.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'long' })).length === 0 ? (
            <div className="text-center py-8 text-[#64748B] text-sm font-medium">No classes scheduled for today. Enjoy your day!</div>
          ) : (
            <div className="space-y-2.5">
              {timetable.filter(t => t.dayOfWeek === new Date().toLocaleDateString('en-US', { weekday: 'long' })).map(t => (
                <div key={t._id} className="flex items-center justify-between p-3.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-2xl text-xs hover:border-[#FDE68A] transition-colors">
                  <div>
                    <p className="font-black text-[#0F172A]">{t.course?.name || t.subject}</p>
                    <p className="text-[#64748B] mt-0.5 font-medium">Sec {t.section} • Room {t.classroom}</p>
                  </div>
                  <span className="font-mono text-[#D97706] font-bold px-2.5 py-1 rounded-full bg-[#FFF8E6] border border-[#FDE68A]">
                    {t.startTime} – {t.endTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card title="Recent Notices" subtitle="Academic communications & alerts" badge={<Badge variant="info" size="sm">{notices.length} Active</Badge>}>
          <div className="space-y-2.5">
            {notices.slice(0, 3).map(n => (
              <div key={n._id} className="flex items-start gap-3 p-3.5 border border-[#F1E7CF] rounded-2xl bg-white hover:bg-[#FFFDF5] hover:border-[#FDE68A] transition-colors">
                {n.pinned && <Star className="w-3.5 h-3.5 text-[#D97706] mt-0.5 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-[#0F172A] truncate">{n.title}</p>
                    <Badge variant="teal" size="sm">{n.category}</Badge>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1 line-clamp-1">{n.content}</p>
                  <p className="text-[10px] text-[#64748B] mt-1 font-semibold">{n.authorName} • {fmt(n.publishedAt)}</p>
                </div>
              </div>
            ))}
            {notices.length === 0 && <div className="text-center text-[#64748B] text-sm py-6">No notices published yet</div>}
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
        <div className="flex items-center gap-5 p-5 bg-[#111827] border border-[#D99A00]/40 rounded-xl">
          <div className="w-20 h-20 rounded-2xl bg-[#D99A00]/30 border-2 border-[#FFC107]/40 flex items-center justify-center text-[#FFC107] text-3xl font-bold shrink-0">
            {(profile?.name || 'F')[0].toUpperCase()}
          </div>
          <div className="text-white">
            <p className="font-bold text-xl">{profile?.name || 'Loading…'}</p>
            <p className="text-[#FFC107] text-sm">{profile?.metadata?.designation || profileForm.designation || 'Faculty'}</p>
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
                ? <input className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00] transition-all" value={profileForm[field] || ''} onChange={e => setProfileForm(p => ({ ...p, [field]: e.target.value }))} />
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
          <div className="p-3 bg-[#FFF8E6] border border-[#F1E7CF] rounded-lg text-xs">
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
            <div className="flex items-center gap-4 p-5 bg-[#111827] border border-[#D99A00]/40 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-[#D99A00]/40 flex items-center justify-center text-white text-xl font-bold">{selectedStudent.name[0]}</div>
              <div className="text-white">
                <p className="font-bold text-base">{selectedStudent.name}</p>
                <p className="text-[#FFC107]">{selectedStudent.studentId}</p>
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
          <button key={v} onClick={() => setAttendanceView(v)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${attendanceView === v ? 'bg-[#D99A00] text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>{l}</button>
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
                <input type={type || 'text'} placeholder={placeholder} value={attendanceForm[field]} onChange={e => setAttendanceForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00] transition-all" />
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
                  <div key={rec._id} className="p-3 border border-slate-200 rounded-xl hover:border-[#F1E7CF] transition-colors">
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
  const renderAssignments = () => {
    const assignmentsList = Array.isArray(assignments) ? assignments : [];
    const examsList = Array.isArray(exams) ? exams : [];

    return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[['assignments', 'Assignments & Tasks'], ['exams', 'Examinations']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setAssignmentTab(v)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              assignmentTab === v
                ? 'bg-[#D99A00] text-white shadow-md'
                : 'bg-white text-slate-700 border border-[#F1E7CF] hover:bg-[#FFF8E6]'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {assignmentTab === 'assignments' && (
        <Card
          title="Smart Assignment Central"
          subtitle="Publish multiple-choice assessments or PDF question papers and manage evaluations"
          badge={<Badge variant="teal" size="sm">{assignmentsList.length} Total Assignments</Badge>}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setCreateAssignmentType('mcq');
                  setMcqPreviewMode(false);
                  setCreateAssignmentOpen(true);
                }}
              >
                Create Assignment
              </Button>
            </div>
          }
        >
          {loading.assignments ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : assignmentsList.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-[#D99A00] opacity-40" />
              <p className="text-sm font-bold text-slate-700">No assignments published yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click "Create Assignment" above to draft an MCQ or PDF assessment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FFFDF5] border-b border-[#F1E7CF] text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Assignment & Subject</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Cohort</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Max Marks</th>
                    <th className="py-3 px-4">Submissions</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E7CF]">
                  {assignmentsList.map((asgn) => {
                    const isMcq = (asgn.assignmentType || 'mcq').toLowerCase() === 'mcq';
                    const hasSubmissions = (asgn.totalSubmissions || 0) > 0;
                    return (
                      <tr key={asgn._id} className="hover:bg-[#FFFDF5] transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-extrabold text-slate-900 text-xs">{asgn.title}</p>
                          <p className="text-[11px] text-[#D97706] font-semibold mt-0.5">
                            {asgn.subject || asgn.course?.title || asgn.course?.courseCode || 'Coursework'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          {isMcq ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                              <CheckSquare className="w-3 h-3" />
                              MCQ ({asgn.questions?.length || 0} Qs)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                              <FileText className="w-3 h-3" />
                              PDF Paper
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {asgn.targetClass && asgn.targetClass !== 'All' ? asgn.targetClass : `Sem ${asgn.targetSemester || 7}`}
                          {asgn.targetSection ? ` • Sec ${asgn.targetSection}` : ''}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#D97706]" />
                            {fmt(asgn.dueDate)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                          {asgn.maxMarks}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                            hasSubmissions
                              ? 'bg-[#FFF8E6] text-[#D97706] border border-[#FDE68A]'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {asgn.totalSubmissions || 0} Submissions
                            {asgn.evaluatedCount ? ` (${asgn.evaluatedCount} Graded)` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs"
                              leftIcon={<Eye className="w-3 h-3" />}
                              onClick={() => handleViewSubmissions(asgn)}
                              disabled={loading.subs}
                            >
                              Submissions
                            </Button>
                            {asgn.questionPaper?.url && (
                              <a
                                href={asgn.questionPaper.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-500 hover:text-[#2563EB] rounded-lg hover:bg-blue-50 transition-colors"
                                title="Download Question Paper"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteAssignment(asgn._id)}
                              disabled={loading[`delAsgn_${asgn._id}`]}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Assignment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {assignmentTab === 'exams' && (
        <Card title="Examination Schedule" subtitle="Schedule exams and enter marks" action={<Button variant="teal" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setScheduleExamOpen(true)}>Schedule Exam</Button>}>
          {examsList.length === 0 ? (
            <div className="text-center py-12 text-slate-400"><Award className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No exams scheduled yet.</p></div>
          ) : (
            <Table keyField="_id"
              columns={[
                { key: 'title', header: 'Exam Title', render: v => <span className="font-semibold text-xs text-slate-900">{v}</span> },
                { key: 'subject', header: 'Subject', render: v => <span className="text-xs text-slate-700">{v}</span> },
                { key: 'examType', header: 'Type', render: v => <Badge variant="info" size="sm">{v}</Badge> },
                { key: 'examDate', header: 'Date', render: v => <span className="font-mono text-xs">{fmt(v)}</span> },
                { key: 'startTime', header: 'Time', render: v => <span className="font-mono text-xs text-[#D99A00]">{v}</span> },
                { key: 'maxMarks', header: 'Max Marks', render: v => <span className="font-mono text-xs font-bold">{v}</span> },
                { key: 'venue', header: 'Venue', render: v => <span className="text-xs text-slate-500">{v || '—'}</span> },
              ]}
              data={examsList}
            />
          )}
        </Card>
      )}

      {/* ─── CREATE ASSIGNMENT MODAL (MCQ & PDF SUPPORT) ─── */}
      <Modal
        isOpen={createAssignmentOpen}
        onClose={() => { setCreateAssignmentOpen(false); setMcqPreviewMode(false); }}
        title="Create & Publish Assignment"
        description="Select assignment type and configure evaluation parameters"
        maxWidth="max-w-4xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs font-bold text-slate-600">
              {createAssignmentType === 'mcq' && (
                <span>Calculated Total: <span className="text-[#059669] font-mono text-sm">{mcqCalculatedMarks} Marks</span> ({mcqQuestions.length} Questions)</span>
              )}
              {createAssignmentType === 'pdf' && (
                <span>Total Marks: <span className="text-[#D97706] font-mono text-sm">{assignmentForm.maxMarks || 0} Marks</span></span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setCreateAssignmentOpen(false); setMcqPreviewMode(false); }}>
                Cancel
              </Button>
              <Button
                variant="teal"
                size="sm"
                onClick={handleCreateAssignment}
                disabled={loading.createAssign}
              >
                {loading.createAssign ? 'Publishing…' : `Publish ${createAssignmentType.toUpperCase()} Assignment`}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {/* 1. Type Switcher Buttons */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-2xl">
            <button
              type="button"
              onClick={() => { setCreateAssignmentType('mcq'); setMcqPreviewMode(false); }}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-extrabold text-xs transition-all ${
                createAssignmentType === 'mcq'
                  ? 'bg-white text-[#D97706] shadow-md border border-[#FDE68A]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-[#059669]" />
              <div className="text-left">
                <span className="block font-bold">MCQ Assignment</span>
                <span className="block text-[10px] text-slate-400 font-normal">Automated server-side evaluation</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setCreateAssignmentType('pdf'); setMcqPreviewMode(false); }}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-extrabold text-xs transition-all ${
                createAssignmentType === 'pdf'
                  ? 'bg-white text-[#D97706] shadow-md border border-[#FDE68A]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-[#2563EB]" />
              <div className="text-left">
                <span className="block font-bold">PDF Assignment</span>
                <span className="block text-[10px] text-slate-400 font-normal">Question paper upload & student PDF submission</span>
              </div>
            </button>
          </div>

          {/* 2. Common Metadata Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF]">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
              <input
                type="text"
                placeholder={createAssignmentType === 'mcq' ? "e.g. Distributed Consensus & Raft Protocol Quiz" : "e.g. LL(1) Parser Implementation Problem Set"}
                value={assignmentForm.title}
                onChange={e => setAssignmentForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Course *</label>
              <input
                type="text"
                placeholder="e.g. Artificial Intelligence (CS701)"
                value={assignmentForm.subject}
                onChange={e => setAssignmentForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Class / Group</label>
              <input
                type="text"
                placeholder="e.g. CS-7A or All"
                value={assignmentForm.targetClass}
                onChange={e => setAssignmentForm(p => ({ ...p, targetClass: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Semester & Section</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={assignmentForm.targetSemester}
                  onChange={e => setAssignmentForm(p => ({ ...p, targetSemester: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Section A"
                  value={assignmentForm.targetSection}
                  onChange={e => setAssignmentForm(p => ({ ...p, targetSection: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Submission Deadline *</label>
              <input
                type="datetime-local"
                value={assignmentForm.dueDate}
                onChange={e => setAssignmentForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Instructions for Students</label>
              <textarea
                rows={2}
                placeholder="Special guidelines, negative marking rules, or submission format instructions..."
                value={assignmentForm.instructions}
                onChange={e => setAssignmentForm(p => ({ ...p, instructions: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 resize-none font-medium"
              />
            </div>
          </div>

          {/* 3A. MCQ ASSIGNMENT QUESTIONS BUILDER */}
          {createAssignmentType === 'mcq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#F1E7CF]">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-[#0F172A]">Multiple Choice Questions ({mcqQuestions.length})</h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                    Auto-Graded ({mcqCalculatedMarks} Total Marks)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMcqPreviewMode(!mcqPreviewMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#F1E7CF] bg-white text-slate-700 hover:bg-[#FFF8E6] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#D97706]" />
                    {mcqPreviewMode ? 'Back to Editor' : 'Preview Student View'}
                  </button>

                  {!mcqPreviewMode && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={handleMcqAddQuestion}
                    >
                      Add Question
                    </Button>
                  )}
                </div>
              </div>

              {/* MCQ PREVIEW MODE */}
              {mcqPreviewMode ? (
                <div className="p-5 rounded-2xl bg-[#FFFDF5] border border-[#FDE68A] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F1E7CF]">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">Student Assignment Preview</span>
                      <h3 className="text-base font-extrabold text-[#0F172A] mt-0.5">{assignmentForm.title || 'Untitled MCQ Assignment'}</h3>
                      <p className="text-xs text-slate-600 font-medium">{assignmentForm.subject} • {mcqQuestions.length} Questions • {mcqCalculatedMarks} Marks</p>
                    </div>
                    <Badge variant="teal" size="sm">Preview Mode</Badge>
                  </div>

                  <div className="space-y-4">
                    {mcqQuestions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white border border-[#F1E7CF] space-y-2.5">
                        <div className="flex items-start justify-between">
                          <span className="font-extrabold text-xs text-[#0F172A]">
                            Q{idx + 1}. {q.questionText || <span className="italic text-slate-400">Question text not entered</span>}
                          </span>
                          <span className="font-mono text-xs font-bold text-[#D97706]">[{q.marks || 1} Mark]</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                                q.correctAnswer === oIdx
                                  ? 'bg-[#ECFDF5] border-[#059669] text-[#065F46] font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full flex items-center justify-center bg-white border text-[11px] font-bold">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="flex-1">{opt || `Option ${String.fromCharCode(65 + oIdx)}`}</span>
                              {q.correctAnswer === oIdx && (
                                <span className="text-[10px] font-bold text-[#059669] uppercase">Correct</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* MCQ QUESTIONS BUILDER */
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {mcqQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-[#FFF8E6] text-[#D97706] font-extrabold text-xs flex items-center justify-center border border-[#FDE68A]">
                            Q{qIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">Question {qIdx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-1 mr-2 text-xs font-semibold text-slate-600">
                            <span>Marks:</span>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={q.marks}
                              onChange={e => handleMcqQuestionChange(qIdx, 'marks', e.target.value)}
                              className="w-14 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#D97706]"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={qIdx === 0}
                            onClick={() => handleMcqMoveQuestion(qIdx, -1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={qIdx === mcqQuestions.length - 1}
                            onClick={() => handleMcqMoveQuestion(qIdx, 1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMcqRemoveQuestion(qIdx)}
                            className="p-1 rounded text-slate-400 hover:text-red-600"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div>
                        <input
                          type="text"
                          placeholder="Enter question statement..."
                          value={q.questionText}
                          onChange={e => handleMcqQuestionChange(qIdx, 'questionText', e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]"
                        />
                      </div>

                      {/* 4 Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = q.correctAnswer === oIdx;
                          return (
                            <div
                              key={oIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                isCorrect
                                  ? 'bg-[#ECFDF5] border-[#059669]/60 ring-1 ring-[#059669]/40'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                <input
                                  type="radio"
                                  name={`correct_q_${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => handleMcqCorrectAnswerChange(qIdx, oIdx)}
                                  className="w-3.5 h-3.5 text-[#059669] focus:ring-[#059669] cursor-pointer"
                                />
                                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                  isCorrect ? 'bg-[#059669] text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                              </label>

                              <input
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                                value={opt}
                                onChange={e => handleMcqOptionChange(qIdx, oIdx, e.target.value)}
                                className="flex-1 bg-transparent text-xs font-medium focus:outline-none placeholder:text-slate-400"
                              />

                              {isCorrect && (
                                <span className="text-[10px] font-extrabold text-[#059669] px-1.5 py-0.5 rounded bg-white border border-[#A7F3D0] shrink-0">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div>
                        <input
                          type="text"
                          placeholder="Optional explanation / rationale for this answer..."
                          value={q.explanation || ''}
                          onChange={e => handleMcqQuestionChange(qIdx, 'explanation', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleMcqAddQuestion}
                    className="w-full py-3 border-2 border-dashed border-[#F1E7CF] hover:border-[#D97706] rounded-2xl text-xs font-bold text-[#D97706] hover:bg-[#FFFDF5] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Multiple Choice Question
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3B. PDF ASSIGNMENT QUESTION PAPER UPLOAD */}
          {createAssignmentType === 'pdf' && (
            <div className="space-y-4 p-4 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-[#0F172A]">Question Paper Document (PDF)</h4>
                  <p className="text-xs text-slate-500 font-medium">Upload the faculty assignment sheet or examination problem set</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold text-slate-700">Max Marks *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={assignmentForm.maxMarks}
                    onChange={e => setAssignmentForm(p => ({ ...p, maxMarks: Number(e.target.value) }))}
                    className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>
              </div>

              {/* PDF File Picker */}
              <div className="border-2 border-dashed border-[#F1E7CF] rounded-2xl p-6 bg-white text-center hover:border-[#D97706] transition-colors">
                <input
                  type="file"
                  id="pdfQuestionPaperInput"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.name.toLowerCase().endsWith('.pdf')) {
                        return showToast('Only PDF documents (.pdf) are permitted.', 'error');
                      }
                      if (file.size > 25 * 1024 * 1024) {
                        return showToast('File size must be under 25 MB.', 'error');
                      }
                      setPdfFile(file);
                    }
                  }}
                />

                {pdfFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-xs text-slate-900">{pdfFile.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB • Ready to publish</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Remove File"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="pdfQuestionPaperInput" className="cursor-pointer block">
                    <UploadCloud className="w-10 h-10 text-[#D97706] mx-auto mb-2 opacity-70" />
                    <p className="text-xs font-extrabold text-slate-900">Click to upload Question Paper (PDF)</p>
                    <p className="text-[11px] text-slate-500 mt-1">Accepts standard PDF documents up to 25 MB</p>
                  </label>
                )}
              </div>

              {/* PDF Submission Enforcement Toggle */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#F1E7CF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignmentForm.requiresPdfSubmission}
                  onChange={e => setAssignmentForm(p => ({ ...p, requiresPdfSubmission: e.target.checked }))}
                  className="w-4 h-4 text-[#D97706] rounded focus:ring-[#D97706]"
                />
                <span className="text-xs font-bold text-slate-800">
                  Require students to submit their completed solutions as a PDF file
                </span>
              </label>
            </div>
          )}
        </div>
      </Modal>

      {/* ─── SCHEDULE EXAM MODAL ─── */}
      <Modal isOpen={scheduleExamOpen} onClose={() => setScheduleExamOpen(false)} title="Schedule Examination"
        footer={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setScheduleExamOpen(false)}>Cancel</Button><Button variant="teal" size="sm" onClick={handleScheduleExam} disabled={loading.scheduleExam}>{loading.scheduleExam ? 'Scheduling…' : 'Schedule Exam'}</Button></div>}>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: 'Exam Title', field: 'title', colSpan: 2 }, { label: 'Subject', field: 'subject' }, { label: 'Class', field: 'className' }, { label: 'Exam Date', field: 'examDate', type: 'date' }, { label: 'Start Time', field: 'startTime', type: 'time' }, { label: 'Duration (min)', field: 'duration', type: 'number' }, { label: 'Max Marks', field: 'maxMarks', type: 'number' }, { label: 'Venue', field: 'venue' }].map(({ label, field, type, colSpan }) => (
            <div key={field} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type={type || 'text'} value={examForm[field] || ''} onChange={e => setExamForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Type</label>
            <select value={examForm.examType || 'Mid-Term'} onChange={e => setExamForm(p => ({ ...p, examType: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30">
              {['Mid-Term', 'End-Term', 'Unit Test', 'Practical', 'Viva', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* ─── SUBMISSIONS MANAGEMENT & EVALUATION MODAL ─── */}
      <Modal
        isOpen={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        title={`Submissions: ${selectedAssignment?.title || 'Assignment'}`}
        description={`${selectedAssignment?.subject || ''} • Max Marks: ${selectedAssignment?.maxMarks || 100} • ${selectedAssignment?.assignmentType?.toUpperCase() || 'MCQ'}`}
        maxWidth="max-w-4xl"
      >
        {loading.subs ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#D97706]" />
            <p className="font-bold text-slate-700 text-sm">No student submissions received yet.</p>
            <p className="text-xs text-slate-500 mt-0.5">Students enrolled in this cohort will appear here once they complete or upload answers.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs">
              <span className="font-bold text-slate-700">Total Submissions: {submissions.length}</span>
              <span className="font-bold text-[#059669]">
                Evaluated: {submissions.filter(s => s.status === 'Evaluated' || s.marksObtained !== undefined && s.marksObtained !== null).length}
              </span>
              <span className="font-bold text-[#D97706]">
                Pending Evaluation: {submissions.filter(s => s.status !== 'Evaluated' && (s.marksObtained === undefined || s.marksObtained === null)).length}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {submissions.map((sub) => {
                const isEvaluated = sub.status === 'Evaluated' || (sub.marksObtained !== undefined && sub.marksObtained !== null);
                const isLate = sub.status === 'Late Submitted' || sub.status === 'late';
                const isMcq = (sub.submissionType || selectedAssignment?.assignmentType || 'mcq').toLowerCase() === 'mcq';

                return (
                  <div key={sub._id} className="p-3.5 hover:bg-[#FFFDF5] rounded-xl transition-colors space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{sub.student?.name || 'Student'}</span>
                          <span className="font-mono text-[11px] font-bold text-slate-500">{sub.student?.studentId}</span>
                          <Badge variant={isEvaluated ? 'success' : isLate ? 'danger' : 'warning'} size="sm">
                            {isEvaluated ? 'Evaluated' : isLate ? 'Late Submitted' : 'Submitted'}
                          </Badge>
                          {isMcq && (
                            <span className="text-[10px] font-bold text-[#059669] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                              Auto-Graded
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Submitted on {fmt(sub.submittedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {isEvaluated && (
                          <span className="font-mono font-extrabold text-sm text-[#D97706] bg-[#FFF8E6] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
                            Score: {sub.marksObtained} / {selectedAssignment?.maxMarks || 100}
                          </span>
                        )}

                        {/* If PDF submission, download button */}
                        {sub.file?.url && (
                          <a
                            href={sub.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] font-bold text-xs hover:bg-[#DBEAFE] transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            View PDF
                          </a>
                        )}

                        {/* Action buttons */}
                        {isMcq ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs"
                            onClick={() => setSelectedSubmissionAnswers(sub)}
                          >
                            View Answers
                          </Button>
                        ) : (
                          <Button
                            variant="teal"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setFeedbackForm({
                                submissionId: sub._id,
                                studentName: sub.student?.name,
                                studentId: sub.student?.studentId,
                                feedback: sub.feedback || '',
                                marksObtained: sub.marksObtained !== undefined && sub.marksObtained !== null ? sub.marksObtained : '',
                              });
                              setFeedbackModalOpen(true);
                            }}
                          >
                            {isEvaluated ? 'Update Evaluation' : 'Evaluate PDF'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {sub.feedback && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 font-medium italic">
                        "{sub.feedback}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ─── PDF EVALUATION & FEEDBACK MODAL ─── */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Evaluate Student PDF Submission"
        description={`Student: ${feedbackForm.studentName || ''} (${feedbackForm.studentId || ''}) • Max Marks: ${selectedAssignment?.maxMarks || 100}`}
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={handleGiveFeedback}
              disabled={loading.feedback}
            >
              {loading.feedback ? 'Publishing…' : 'Publish Evaluation & Notify Student'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Marks Awarded (Max: {selectedAssignment?.maxMarks || 100}) *
            </label>
            <input
              type="number"
              min="0"
              max={selectedAssignment?.maxMarks || 100}
              value={feedbackForm.marksObtained}
              onChange={e => setFeedbackForm(p => ({ ...p, marksObtained: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]"
              placeholder={`Enter marks (0 - ${selectedAssignment?.maxMarks || 100})`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Remarks & Feedback</label>
            <textarea
              rows={4}
              value={feedbackForm.feedback}
              onChange={e => setFeedbackForm(p => ({ ...p, feedback: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 resize-none font-medium"
              placeholder="Provide constructive feedback and grading notes for the student..."
            />
          </div>
        </div>
      </Modal>

      {/* ─── MCQ ANSWERS BREAKDOWN MODAL ─── */}
      <Modal
        isOpen={!!selectedSubmissionAnswers}
        onClose={() => setSelectedSubmissionAnswers(null)}
        title="Student MCQ Submission Breakdown"
        description={`Student: ${selectedSubmissionAnswers?.student?.name} (${selectedSubmissionAnswers?.student?.studentId}) • Score: ${selectedSubmissionAnswers?.marksObtained} / ${selectedAssignment?.maxMarks || 100}`}
      >
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-center text-xs">
            <div>
              <span className="block text-[10px] text-slate-500 font-bold uppercase">Score</span>
              <span className="font-extrabold text-[#D97706] text-sm">{selectedSubmissionAnswers?.marksObtained} / {selectedAssignment?.maxMarks}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold uppercase">Correct</span>
              <span className="font-extrabold text-[#059669] text-sm">{selectedSubmissionAnswers?.correctCount || 0}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 font-bold uppercase">Incorrect</span>
              <span className="font-extrabold text-red-600 text-sm">{selectedSubmissionAnswers?.incorrectCount || 0}</span>
            </div>
          </div>

          {(selectedSubmissionAnswers?.mcqAnswers || []).map((ans, idx) => {
            const question = selectedAssignment?.questions?.[ans.questionIndex || idx];
            return (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Q{idx + 1}. {question?.questionText || `Question ${idx + 1}`}</span>
                  <Badge variant={ans.isCorrect ? 'success' : 'danger'} size="sm">
                    {ans.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded-lg border ${ans.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <span className="text-[10px] font-bold block uppercase text-slate-500">Student Selected:</span>
                    <span className="font-semibold">{ans.selectedOption >= 0 ? `Option ${String.fromCharCode(65 + ans.selectedOption)}: ${question?.options?.[ans.selectedOption] || ''}` : 'Unanswered'}</span>
                  </div>

                  <div className="p-2 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800">
                    <span className="text-[10px] font-bold block uppercase text-slate-500">Correct Answer:</span>
                    <span className="font-semibold">Option {String.fromCharCode(65 + (question?.correctAnswer ?? ans.selectedOption))}: {question?.options?.[question?.correctAnswer] || ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};


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
              { key: 'marksObtained', header: 'Marks', render: (v, r) => <span className="font-mono font-bold text-xs text-[#D99A00]">{v}/{r.maxMarks}</span> },
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
            <select value={resultForm.studentId} onChange={e => setResultForm(p => ({ ...p, studentId: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30">
              <option value="">Select Student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
            </select>
          </div>
          {[{ label: 'Assessment Name', field: 'assessmentName', colSpan: 2 }, { label: 'Semester', field: 'semester', type: 'number' }, { label: 'Session', field: 'session', placeholder: '2026-27' }, { label: 'Max Marks', field: 'maxMarks', type: 'number' }, { label: 'Marks Obtained', field: 'marksObtained', type: 'number' }].map(({ label, field, type, placeholder, colSpan }) => (
            <div key={field} className={colSpan === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type={type || 'text'} placeholder={placeholder} value={resultForm[field]} onChange={e => setResultForm(p => ({ ...p, [field]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Assessment Type</label>
            <select value={resultForm.assessmentType} onChange={e => setResultForm(p => ({ ...p, assessmentType: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30">
              {['Exam', 'Quiz', 'Assignment', 'Project', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Feedback (Optional)</label>
            <textarea rows={2} value={resultForm.feedback} onChange={e => setResultForm(p => ({ ...p, feedback: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 resize-none" placeholder="Optional feedback for the student..." />
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFF8E6]0 inline-block" />{day}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {classes.map(c => (
                      <div key={c._id} className="p-3 border border-[#F1E7CF] bg-[#FFFDF5] rounded-xl flex items-center gap-3 hover:border-[#F1E7CF] transition-colors">
                        <div className="text-center bg-white border border-[#F1E7CF] rounded-lg px-2 py-1.5 shrink-0">
                          <p className="font-mono text-[11px] font-bold text-[#D99A00]">{c.startTime}</p>
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
            <select value={leaveForm.leaveType} onChange={e => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30">
              {['Casual Leave', 'Medical Leave', 'Earned Leave', 'Emergency Leave', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label><input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm(p => ({ ...p, fromDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label><input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm(p => ({ ...p, toDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reason</label>
            <textarea rows={4} value={leaveForm.reason} onChange={e => setLeaveForm(p => ({ ...p, reason: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 resize-none focus:border-[#D99A00]" placeholder="Provide a detailed reason for leave..." />
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
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Notice Title</label><input value={noticeForm.title} onChange={e => setNoticeForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 focus:border-[#D99A00]" placeholder="e.g. Mid-Term Exam Postponed" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1">Content</label><textarea rows={4} value={noticeForm.content} onChange={e => setNoticeForm(p => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30 resize-none focus:border-[#D99A00]" placeholder="Enter the notice content..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Category</label><select value={noticeForm.category} onChange={e => setNoticeForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30">{['General', 'Academic', 'Exam', 'Event', 'Urgent'].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1">Target Audience</label><select value={noticeForm.targetAudience} onChange={e => setNoticeForm(p => ({ ...p, targetAudience: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]/30">{['All', 'Students', 'Faculty', 'Staff'].map(a => <option key={a}>{a}</option>)}</select></div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer"><input type="checkbox" checked={noticeForm.pinned} onChange={e => setNoticeForm(p => ({ ...p, pinned: e.target.checked }))} className="rounded text-[#D99A00] focus:ring-[#D99A00]" /> Pin this notice to the top</label>
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
    'online-classes': { title: 'Online Classes & Live Lectures', subtitle: 'Schedule, broadcast, and manage virtual class meetings' },
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
        <Link to="/faculty" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D99A00] hover:text-[#111827] hover:underline transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Faculty Overview
        </Link>
      )}

      {currentSection !== 'overview' && (
        <PageHeader
          title={meta.title}
          subtitle={meta.subtitle}
          breadcrumbs={breadcrumbs}
          badge={<Badge variant="teal" size="sm">Academic Year 2026–27</Badge>}
        />
      )}

      {/* Section Content */}
      {currentSection === 'overview' && renderOverview()}
      {currentSection === 'profile' && renderProfile()}
      {currentSection === 'students' && renderStudents()}
      {currentSection === 'attendance' && renderAttendance()}
      {currentSection === 'online-classes' && <FacultyOnlineClassesSection showToast={showToast} />}
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
