import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardList,
  Calendar,
  Clock,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Award,
  Eye,
  Send,
  Loader2,
  RefreshCw,
  Download,
  ExternalLink,
  BookOpen,
  MapPin,
  HelpCircle,
  X,
  FileCheck2,
  CheckSquare,
  ListChecks,
  Check,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Info,
  Sparkles,
  User,
  Search,
  Filter,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { assignmentService, studentService, getBackendFileUrl } from '../../../services/api';
import { formatDate } from '../../../utils/formatters';

// Helper to construct absolute URL for file downloads and previews
const getFullFileUrl = (url) => getBackendFileUrl(url);

// Helper for readable date and time
const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateStr);
  }
};

export const StudentAssignmentSection = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'exams'
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // all, mcq, pdf, pending, submitted, evaluated, overdue
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // MCQ Runner Modal States
  // ─────────────────────────────────────────────────────────────────────────────
  const [mcqModalOpen, setMcqModalOpen] = useState(false);
  const [mcqAssignment, setMcqAssignment] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [mcqSubmitting, setMcqSubmitting] = useState(false);
  const [mcqModalError, setMcqModalError] = useState('');
  const [mcqResult, setMcqResult] = useState(null); // instant evaluation result
  const [viewingResultOnly, setViewingResultOnly] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // PDF Submission Modal States
  // ─────────────────────────────────────────────────────────────────────────────
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfAssignment, setPdfAssignment] = useState(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [pdfSubmissionText, setPdfSubmissionText] = useState('');
  const [pdfSubmitting, setPdfSubmitting] = useState(false);
  const [pdfModalError, setPdfModalError] = useState('');

  // Fetch student assignments and exam schedules
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [asgnRes, examRes] = await Promise.allSettled([
        assignmentService.getMyAssignments(),
        studentService.getExams(),
      ]);

      if (asgnRes.status === 'fulfilled' && asgnRes.value?.success) {
        setAssignments(asgnRes.value.assignments || asgnRes.value.data || []);
      }
      if (examRes.status === 'fulfilled' && examRes.value?.success) {
        setExams(examRes.value.exams || examRes.value.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Error loading assignments and examination schedules.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─────────────────────────────────────────────────────────────────────────────
  // MCQ Runner Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenMcqAssignment = async (asgn) => {
    setError('');
    setMcqModalError('');
    setActiveQuestionIdx(0);
    setConfirmSubmitOpen(false);
    setMcqSubmitting(false);

    // If already evaluated or submitted, fetch detail to view full score & review
    if (asgn.isSubmitted || asgn.submissionStatus === 'Evaluated') {
      try {
        const detailRes = await assignmentService.getDetail(asgn._id);
        const detailed = detailRes?.assignment || detailRes?.data || asgn;
        setMcqAssignment(detailed);
        const sub = detailed.submission || asgn.submission;
        setMcqResult(sub ? {
          score: sub.marksObtained,
          marksObtained: sub.marksObtained,
          maxMarks: detailed.maxMarks || asgn.maxMarks,
          totalQuestions: sub.totalQuestions || detailed.questions?.length || 0,
          correctCount: sub.correctCount || 0,
          incorrectCount: sub.incorrectCount || 0,
          unansweredCount: sub.unansweredCount || 0,
          submittedAt: sub.submittedAt || asgn.submittedAt,
          mcqAnswers: sub.mcqAnswers || [],
        } : null);
        setViewingResultOnly(true);
        setMcqModalOpen(true);
      } catch (err) {
        setMcqAssignment(asgn);
        setMcqResult(asgn.submission ? {
          score: asgn.marksObtained,
          marksObtained: asgn.marksObtained,
          maxMarks: asgn.maxMarks,
          totalQuestions: asgn.questions?.length || 0,
          correctCount: asgn.submission?.correctCount || 0,
          incorrectCount: asgn.submission?.incorrectCount || 0,
          unansweredCount: asgn.submission?.unansweredCount || 0,
          submittedAt: asgn.submittedAt,
          mcqAnswers: asgn.submission?.mcqAnswers || [],
        } : null);
        setViewingResultOnly(true);
        setMcqModalOpen(true);
      }
      return;
    }

    // New or unsubmitted assignment
    setMcqAssignment(asgn);
    setMcqAnswers({});
    setMcqResult(null);
    setViewingResultOnly(false);
    setMcqModalOpen(true);
  };

  const handleSelectMcqOption = (questionIdx, optionIdx) => {
    if (viewingResultOnly) return;
    setMcqAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleClearMcqOption = (questionIdx) => {
    if (viewingResultOnly) return;
    setMcqAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionIdx];
      return copy;
    });
  };

  const handleSubmitMcqAssignment = async () => {
    if (!mcqAssignment) return;
    setMcqSubmitting(true);
    setMcqModalError('');

    try {
      const questions = mcqAssignment.questions || [];
      const answersPayload = questions.map((q, idx) => ({
        questionIndex: idx,
        questionId: q._id,
        selectedOption: mcqAnswers[idx] !== undefined ? mcqAnswers[idx] : -1,
      }));

      const res = await assignmentService.submitAssignment(mcqAssignment._id, {
        answers: answersPayload,
      });

      if (res?.success) {
        const evalResult = res.result || {
          score: res.submission?.marksObtained || 0,
          marksObtained: res.submission?.marksObtained || 0,
          maxMarks: mcqAssignment.maxMarks,
          totalQuestions: questions.length,
          correctCount: res.submission?.correctCount || 0,
          incorrectCount: res.submission?.incorrectCount || 0,
          unansweredCount: res.submission?.unansweredCount || 0,
          submittedAt: new Date(),
          mcqAnswers: res.submission?.mcqAnswers || [],
        };

        setMcqResult(evalResult);
        setViewingResultOnly(true);
        setConfirmSubmitOpen(false);
        setSuccessMsg(`MCQ Evaluation Complete! You scored ${evalResult.marksObtained} / ${mcqAssignment.maxMarks}`);

        // Update local state immediately so dashboard card reflects evaluation without delay
        setAssignments((prev) =>
          prev.map((a) => {
            if (a._id === mcqAssignment._id) {
              return {
                ...a,
                submissionStatus: 'Evaluated',
                isSubmitted: true,
                isEvaluated: true,
                marksObtained: evalResult.marksObtained,
                submittedAt: new Date(),
                submission: res.submission || {
                  marksObtained: evalResult.marksObtained,
                  maxMarks: mcqAssignment.maxMarks,
                  status: 'Evaluated',
                  correctCount: evalResult.correctCount,
                  incorrectCount: evalResult.incorrectCount,
                  unansweredCount: evalResult.unansweredCount,
                },
              };
            }
            return a;
          })
        );

        // Fetch refreshed details to get correct answers for solution review
        assignmentService.getDetail(mcqAssignment._id).then((fresh) => {
          if (fresh?.assignment) {
            setMcqAssignment(fresh.assignment);
          }
        }).catch(() => {});

        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setMcqModalError(res?.error || 'Failed to submit MCQ answers.');
      }
    } catch (err) {
      setMcqModalError(err?.message || err?.error || 'Failed to submit MCQ answers.');
    } finally {
      setMcqSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PDF Submission Handlers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleOpenPdfAssignment = (asgn) => {
    setPdfAssignment(asgn);
    setSelectedPdfFile(null);
    setPdfSubmissionText(asgn.submission?.submissionText || '');
    setPdfModalError('');
    setPdfModalOpen(true);
  };

  const handlePdfFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const name = file.name.toLowerCase();

      // Enforce PDF only
      if (!name.endsWith('.pdf') && file.type !== 'application/pdf') {
        setPdfModalError('Invalid format: You must upload a PDF document (.pdf).');
        setSelectedPdfFile(null);
        return;
      }

      // Enforce 25 MB limit
      if (file.size > 25 * 1024 * 1024) {
        setPdfModalError('File size exceeds the 25 MB upload limit.');
        setSelectedPdfFile(null);
        return;
      }

      setSelectedPdfFile(file);
      setPdfModalError('');
    }
  };

  const handleSubmitPdfAssignment = async (e) => {
    e.preventDefault();
    if (!pdfAssignment) return;

    if (!selectedPdfFile && !pdfAssignment.isSubmitted) {
      setPdfModalError('Please upload your completed solution PDF document.');
      return;
    }

    setPdfSubmitting(true);
    setPdfModalError('');

    try {
      const formData = new FormData();
      if (selectedPdfFile) {
        formData.append('file', selectedPdfFile);
      }
      if (pdfSubmissionText.trim()) {
        formData.append('submissionText', pdfSubmissionText.trim());
      }

      const res = await assignmentService.submitAssignment(pdfAssignment._id, formData);
      if (res?.success) {
        setSuccessMsg(res.message || 'PDF assignment submitted successfully! Faculty notified for evaluation.');
        setPdfModalOpen(false);
        fetchData();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setPdfModalError(res?.error || 'Failed to submit PDF assignment.');
      }
    } catch (err) {
      setPdfModalError(err?.message || err?.error || 'Failed to submit PDF assignment.');
    } finally {
      setPdfSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Filtered Assignments
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (a.title || '').toLowerCase().includes(q);
        const matchSubject = (a.subject || a.course?.title || a.course?.courseCode || '').toLowerCase().includes(q);
        const matchFaculty = (a.faculty?.name || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchFaculty) return false;
      }

      const type = (a.assignmentType || 'mcq').toLowerCase();
      const status = a.submissionStatus;

      if (assignmentFilter === 'all') return true;
      if (assignmentFilter === 'mcq') return type === 'mcq';
      if (assignmentFilter === 'pdf') return type === 'pdf';
      if (assignmentFilter === 'pending') return status === 'Pending' || status === 'New';
      if (assignmentFilter === 'submitted') return status === 'Submitted' || status === 'Late Submitted';
      if (assignmentFilter === 'evaluated') return status === 'Evaluated';
      if (assignmentFilter === 'overdue') return status === 'Overdue';
      return true;
    });
  }, [assignments, assignmentFilter, searchQuery]);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Evaluated':
        return <Badge variant="teal" size="sm" hasDot>Evaluated</Badge>;
      case 'Submitted':
        return <Badge variant="info" size="sm" hasDot>Submitted</Badge>;
      case 'Late Submitted':
        return <Badge variant="warning" size="sm" hasDot>Late Submitted</Badge>;
      case 'Overdue':
        return <Badge variant="danger" size="sm" hasDot>Overdue</Badge>;
      case 'New':
        return <Badge variant="warning" size="sm" hasDot>New Assignment</Badge>;
      default:
        return <Badge variant="neutral" size="sm" hasDot>Pending</Badge>;
    }
  };

  // Count summaries
  const countStats = useMemo(() => {
    const total = assignments.length;
    const mcqs = assignments.filter((a) => (a.assignmentType || 'mcq').toLowerCase() === 'mcq').length;
    const pdfs = assignments.filter((a) => (a.assignmentType || 'mcq').toLowerCase() === 'pdf').length;
    const pending = assignments.filter((a) => a.submissionStatus === 'Pending' || a.submissionStatus === 'New').length;
    const submitted = assignments.filter((a) => a.submissionStatus === 'Submitted' || a.submissionStatus === 'Late Submitted').length;
    const evaluated = assignments.filter((a) => a.submissionStatus === 'Evaluated').length;
    const overdue = assignments.filter((a) => a.submissionStatus === 'Overdue').length;
    return { total, mcqs, pdfs, pending, submitted, evaluated, overdue };
  }, [assignments]);

  // Questions answered count for current MCQ taking session
  const currentMcqQuestions = mcqAssignment?.questions || [];
  const answeredCount = Object.keys(mcqAnswers).length;
  const unansweredCount = Math.max(0, currentMcqQuestions.length - answeredCount);

  return (
    <section id="assignments-section" className="scroll-mt-20 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111827]">Assignments &amp; Examination Central</h2>
            <Badge variant="teal" size="sm">Active Cohort</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 font-medium">
            Complete interactive MCQ assessments and submit coursework PDF solutions with verified grading
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D97706]" /> : <RefreshCw className="w-3.5 h-3.5 text-[#D97706]" />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-bold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Primary Section Switcher */}
      <div className="flex items-center gap-3 border-b border-[#F1E7CF] pb-2">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'assignments'
              ? 'border-[#D99A00] text-[#D99A00]'
              : 'border-transparent text-[#4B5563] hover:text-[#111827]'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Assignments &amp; Tasks ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'exams'
              ? 'border-[#D99A00] text-[#D99A00]'
              : 'border-transparent text-[#4B5563] hover:text-[#111827]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Examination Schedules ({exams.length})
        </button>
      </div>

      {/* TAB 1: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Assigned', count: countStats.total, icon: ClipboardList, color: 'text-[#111827]' },
              { label: 'MCQ Tests', count: countStats.mcqs, icon: ListChecks, color: 'text-purple-700' },
              { label: 'PDF Tasks', count: countStats.pdfs, icon: FileText, color: 'text-blue-700' },
              { label: 'Pending', count: countStats.pending, icon: Clock, color: 'text-amber-600' },
              { label: 'Submitted', count: countStats.submitted, icon: FileCheck2, color: 'text-cyan-700' },
              { label: 'Evaluated', count: countStats.evaluated, icon: Award, color: 'text-emerald-700' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{stat.label}</span>
                    <Icon className={`w-4 h-4 ${stat.color} opacity-80`} />
                  </div>
                  <p className={`text-2xl font-black font-mono mt-1 ${stat.color}`}>{stat.count}</p>
                </div>
              );
            })}
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#F1E7CF]">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, subject, or faculty name..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#111827]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: `All (${countStats.total})` },
                { id: 'mcq', label: `MCQ (${countStats.mcqs})` },
                { id: 'pdf', label: `PDF (${countStats.pdfs})` },
                { id: 'pending', label: `Pending (${countStats.pending})` },
                { id: 'submitted', label: `Submitted (${countStats.submitted})` },
                { id: 'evaluated', label: `Evaluated (${countStats.evaluated})` },
                { id: 'overdue', label: `Overdue (${countStats.overdue})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAssignmentFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    assignmentFilter === f.id
                      ? 'bg-[#0B132B] text-[#F59E0B] shadow-xs'
                      : 'bg-[#FFFDF5] border border-[#F1E7CF] text-[#4B5563] hover:bg-[#FFF8E6]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignments List */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#D97706] animate-spin" />
              <p className="text-xs text-[#4B5563] font-medium">Fetching verified course assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-[#F1E7CF] rounded-3xl bg-[#FFFDF5]">
              <ClipboardList className="w-12 h-12 text-[#D99A00] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-extrabold text-[#111827]">No assignments found for this filter</p>
              <p className="text-xs text-[#4B5563] mt-1 max-w-sm mx-auto">
                Any MCQ assessments or PDF assignments published by your course instructors will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAssignments.map((asgn) => {
                const type = (asgn.assignmentType || 'mcq').toLowerCase();
                const isMcq = type === 'mcq';
                const isOverdue = asgn.submissionStatus === 'Overdue';
                const isEvaluated = asgn.submissionStatus === 'Evaluated';
                const isSubmitted = asgn.isSubmitted;
                const totalQ = asgn.questions?.length || 0;

                return (
                  <div
                    key={asgn._id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-[#F1E7CF] hover:border-[#D99A00]/70 transition-all shadow-xs relative overflow-hidden group"
                  >
                    {/* Top Accent Strip for Assignment Type */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${
                        isMcq ? 'bg-gradient-to-r from-purple-500 to-amber-500' : 'bg-gradient-to-r from-blue-600 to-amber-500'
                      }`}
                    />

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mt-1">
                      {/* Left: Info */}
                      <div className="space-y-3 flex-1">
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Type Badge */}
                          {isMcq ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                              <ListChecks className="w-3.5 h-3.5 text-purple-600" />
                              MCQ Assignment &bull; {totalQ > 0 ? `${totalQ} Questions` : 'Auto-Graded'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              PDF Assignment &bull; Document Submission
                            </span>
                          )}

                          {/* Status Badge */}
                          {getStatusBadge(asgn.submissionStatus)}

                          {/* Subject / Course */}
                          <span className="text-xs font-bold text-[#111827] bg-[#FFF8E6] px-2.5 py-1 rounded-xl border border-[#F1E7CF]">
                            {asgn.subject || asgn.course?.title || asgn.course?.courseCode || 'Coursework'}
                          </span>

                          {/* Maximum Marks */}
                          <span className="text-xs font-mono font-bold text-[#0B132B] bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                            Max Marks: {asgn.maxMarks || (isMcq ? totalQ : 50)}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-[#111827] tracking-tight group-hover:text-[#D97706] transition-colors">
                            {asgn.title}
                          </h3>
                          {asgn.description && (
                            <p className="text-xs sm:text-sm text-[#4B5563] font-medium leading-relaxed mt-1">
                              {asgn.description}
                            </p>
                          )}
                        </div>

                        {/* Faculty Instructions */}
                        {asgn.instructions && (
                          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs">
                            <span className="font-bold text-[#D99A00] uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
                              <Info className="w-3 h-3" />
                              Faculty Instructions
                            </span>
                            <p className="text-[#374151] font-medium leading-relaxed whitespace-pre-line">
                              {asgn.instructions}
                            </p>
                          </div>
                        )}

                        {/* PDF Question Paper Attachment (if available) */}
                        {!isMcq && asgn.questionPaper?.url && (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#D97706] shrink-0" />
                              <div>
                                <span className="font-bold text-[#111827] block">
                                  Question Paper: {asgn.questionPaper.originalName || 'Faculty Question Paper.pdf'}
                                </span>
                                <span className="text-[10px] text-[#6B7280]">
                                  {asgn.questionPaper.size ? `${(asgn.questionPaper.size / 1024).toFixed(1)} KB &bull; PDF Document` : 'Official Question Paper'}
                                </span>
                              </div>
                            </div>

                            <a
                              href={getFullFileUrl(asgn.questionPaper.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white border border-[#D99A00]/50 text-xs font-bold text-[#D97706] hover:bg-[#FFF8E6] flex items-center gap-1 transition-all shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download Paper
                            </a>
                          </div>
                        )}

                        {/* Evaluated Result Card */}
                        {isEvaluated && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
                            <div className="flex items-center justify-between font-bold text-emerald-900">
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm">
                                  Score: <strong>{asgn.marksObtained ?? 0}</strong> / {asgn.maxMarks} Marks
                                  {asgn.maxMarks > 0 && ` (${Math.round(((asgn.marksObtained ?? 0) / asgn.maxMarks) * 100)}%)`}
                                </span>
                              </div>
                              <Badge variant="teal" size="sm">
                                {isMcq ? 'Auto-Graded on Server' : 'Graded by Faculty'}
                              </Badge>
                            </div>

                            {asgn.feedback && (
                              <p className="text-emerald-800 text-xs font-medium pt-1 border-t border-emerald-200">
                                <strong>Remarks:</strong> {asgn.feedback}
                              </p>
                            )}

                            {isMcq && asgn.submission?.correctCount !== undefined && (
                              <div className="flex items-center gap-3 text-[11px] text-emerald-700 font-semibold pt-1">
                                <span>Correct: {asgn.submission.correctCount}</span>
                                <span>&bull;</span>
                                <span>Incorrect: {asgn.submission.incorrectCount || 0}</span>
                                <span>&bull;</span>
                                <span>Total Questions: {asgn.submission.totalQuestions || totalQ}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PDF Submitted File Preview Link */}
                        {!isMcq && asgn.submission?.file?.url && (
                          <div className="flex items-center gap-2 text-xs pt-0.5">
                            <span className="text-[#6B7280] font-semibold">Your Submitted PDF:</span>
                            <a
                              href={getFullFileUrl(asgn.submission.file.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#D97706] hover:underline flex items-center gap-1"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              {asgn.submission.file.originalName || 'View Submitted PDF'}
                            </a>
                            <span className="text-[10px] text-[#9CA3AF]">
                              ({formatDateTime(asgn.submission.submittedAt || asgn.submittedAt)})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right: Meta & Action */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F1E7CF]">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider block">
                            Submission Deadline
                          </span>
                          <span
                            className={`text-xs font-mono font-bold flex items-center gap-1 mt-0.5 ${
                              isOverdue ? 'text-red-600' : 'text-[#111827]'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                            {formatDateTime(asgn.dueDate)}
                          </span>

                          {asgn.faculty?.name && (
                            <span className="text-[11px] text-[#6B7280] block mt-1 font-medium flex items-center lg:justify-end gap-1">
                              <User className="w-3 h-3 text-[#9CA3AF]" />
                              {asgn.faculty.name}
                            </span>
                          )}

                          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">
                            Assigned: {formatDate(asgn.createdAt)}
                          </span>
                        </div>

                        {/* Interactive Buttons per Assignment Type */}
                        {isMcq ? (
                          isSubmitted || isEvaluated ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Award className="w-3.5 h-3.5 text-emerald-600" />}
                              onClick={() => handleOpenMcqAssignment(asgn)}
                            >
                              View Result &amp; Solutions
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                              onClick={() => handleOpenMcqAssignment(asgn)}
                            >
                              {isOverdue ? 'Start MCQ (Overdue)' : 'Start MCQ Test'}
                            </Button>
                          )
                        ) : (
                          // PDF Assignment Button
                          <Button
                            variant={isSubmitted ? 'secondary' : 'primary'}
                            size="sm"
                            leftIcon={isSubmitted ? <Eye className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenPdfAssignment(asgn)}
                          >
                            {isEvaluated
                              ? 'View Marks & Feedback'
                              : isSubmitted
                              ? 'View Submission'
                              : isOverdue
                              ? 'Submit PDF Late'
                              : 'Open & Submit PDF'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXAMS */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#D97706] animate-spin" />
              <p className="text-xs text-[#4B5563] font-medium">Fetching examination schedules...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-[#F1E7CF] rounded-3xl bg-[#FFFDF5]">
              <Calendar className="w-12 h-12 text-[#D99A00] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-[#111827]">No examination schedules published</p>
              <p className="text-xs text-[#4B5563] mt-1">
                Upcoming mid-term, end-term, or practical test timetables published by faculty will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((ex) => (
                <div
                  key={ex._id}
                  className="p-5 rounded-3xl bg-white border border-[#F1E7CF] hover:border-[#D99A00]/60 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#D99A00] uppercase tracking-wider bg-[#FFF8E6] px-2.5 py-0.5 rounded-lg border border-[#F1E7CF]">
                        {ex.examType || 'Examination'}
                      </span>
                      <h3 className="text-base font-extrabold text-[#111827] mt-1.5">{ex.title}</h3>
                      <p className="text-xs font-semibold text-[#4B5563]">{ex.subject}</p>
                    </div>
                    <Badge variant="teal" size="sm">Sem {ex.semester}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Date &amp; Time</span>
                      <span className="font-mono font-bold text-[#111827] mt-0.5 block">
                        {ex.examDate} &bull; {ex.startTime}
                      </span>
                      <span className="text-[10px] text-[#6B7280]">Duration: {ex.duration} mins</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Venue &amp; Max Marks</span>
                      <span className="font-semibold text-[#111827] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D99A00]" />
                        {ex.venue || 'Examination Hall'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#D99A00]">
                        Max Marks: {ex.maxMarks}
                      </span>
                    </div>
                  </div>

                  {ex.instructions && (
                    <div className="text-xs">
                      <span className="font-bold text-[#111827] text-[11px] block mb-0.5">Instructions:</span>
                      <p className="text-[#4B5563] text-xs font-medium leading-relaxed whitespace-pre-line">
                        {ex.instructions}
                      </p>
                    </div>
                  )}

                  {ex.faculty?.name && (
                    <div className="text-[11px] text-[#9CA3AF] pt-2 border-t border-[#F1E7CF]">
                      Published by: <span className="font-semibold text-[#4B5563]">{ex.faculty.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MCQ ASSIGNMENT MODAL (Runner & Solution Review)
      ───────────────────────────────────────────────────────────────────────────── */}
      {mcqAssignment && (
        <Modal
          isOpen={mcqModalOpen}
          onClose={() => setMcqModalOpen(false)}
          title={viewingResultOnly ? `MCQ Results & Solutions: ${mcqAssignment.title}` : `MCQ Assessment: ${mcqAssignment.title}`}
          size="xl"
        >
          <div className="space-y-5">
            {/* Modal Header Details */}
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block">
                    {mcqAssignment.subject || mcqAssignment.course?.title || 'Coursework'}
                  </span>
                  <h3 className="text-base font-extrabold text-[#111827]">{mcqAssignment.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-white border border-[#F1E7CF] text-[#111827]">
                    Max Marks: {mcqAssignment.maxMarks}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-800">
                    {currentMcqQuestions.length} Questions
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-[#6B7280] pt-1 border-t border-[#F1E7CF]">
                <span>Deadline: {formatDateTime(mcqAssignment.dueDate)}</span>
                {mcqAssignment.faculty?.name && <span>Instructor: {mcqAssignment.faculty.name}</span>}
              </div>

              {mcqAssignment.instructions && (
                <div className="text-xs text-[#374151] pt-1">
                  <strong>Instructions:</strong> {mcqAssignment.instructions}
                </div>
              )}
            </div>

            {mcqModalError && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                {mcqModalError}
              </div>
            )}

            {/* ─── CASE A: RESULT / SOLUTION REVIEW VIEW ──────────────────────────── */}
            {viewingResultOnly && mcqResult ? (
              <div className="space-y-6">
                {/* Instant Score Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B132B] to-[#1E293B] text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                          Evaluation Verified &bull; Score Saved
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                          {mcqResult.marksObtained ?? mcqResult.score ?? 0}
                        </span>
                        <span className="text-lg text-slate-300 font-bold">
                          / {mcqAssignment.maxMarks} Marks
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Submitted: {formatDateTime(mcqResult.submittedAt || new Date())}
                      </p>
                    </div>

                    {/* Stats Pill Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block">Correct</span>
                        <span className="text-xl font-bold font-mono text-emerald-300">
                          {mcqResult.correctCount ?? 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-rose-400 block">Incorrect</span>
                        <span className="text-xl font-bold font-mono text-rose-300">
                          {mcqResult.incorrectCount ?? 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                        <span className="text-[10px] uppercase font-bold text-amber-400 block">Unanswered</span>
                        <span className="text-xl font-bold font-mono text-amber-300">
                          {mcqResult.unansweredCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Solution Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-[#111827]">
                      Detailed Answers &amp; Correct Explanations
                    </h4>
                    <span className="text-xs text-[#6B7280]">
                      {currentMcqQuestions.length} Total Questions
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {currentMcqQuestions.map((q, idx) => {
                      // Find student's submission record for this question
                      const studentRecord = (mcqResult.mcqAnswers || []).find(
                        (a) => Number(a.questionIndex) === idx || a.questionId?.toString() === q._id?.toString()
                      );

                      const studentChoice = studentRecord?.selectedOption ?? -1;
                      const hasStudentAnswered = studentChoice >= 0;
                      const isCorrect = studentRecord?.isCorrect || (hasStudentAnswered && studentChoice === Number(q.correctAnswer));
                      const correctChoice = q.correctAnswer !== undefined && q.correctAnswer !== null ? Number(q.correctAnswer) : -1;

                      return (
                        <div
                          key={q._id || idx}
                          className={`p-4 rounded-2xl border transition-all ${
                            !hasStudentAnswered
                              ? 'bg-amber-50/40 border-amber-200'
                              : isCorrect
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : 'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-[#0B132B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-[#111827]">Question {idx + 1}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#6B7280]">
                                {q.marks || 1} mark(s)
                              </span>
                              {!hasStudentAnswered ? (
                                <Badge variant="warning" size="sm">Unanswered</Badge>
                              ) : isCorrect ? (
                                <Badge variant="teal" size="sm">Correct (+{q.marks || 1})</Badge>
                              ) : (
                                <Badge variant="danger" size="sm">Incorrect (0)</Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-[#111827] leading-relaxed mb-3">
                            {q.questionText}
                          </p>

                          {/* Options list */}
                          <div className="grid grid-cols-1 gap-2">
                            {(q.options || []).map((opt, optIdx) => {
                              const isStudentPick = studentChoice === optIdx;
                              const isRightAnswer = correctChoice === optIdx;

                              let optStyle = 'bg-white border-[#F1E7CF] text-[#374151]';
                              if (isRightAnswer) {
                                optStyle = 'bg-emerald-100/70 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                              } else if (isStudentPick && !isCorrect) {
                                optStyle = 'bg-rose-100/70 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-500';
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded-full border border-current text-[11px] font-bold flex items-center justify-center shrink-0">
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>

                                  <div className="flex items-center gap-1 text-[11px] font-extrabold shrink-0">
                                    {isRightAnswer && (
                                      <span className="text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                                      </span>
                                    )}
                                    {isStudentPick && !isRightAnswer && (
                                      <span className="text-rose-700 flex items-center gap-1">
                                        <X className="w-3.5 h-3.5" /> Your Pick
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Explanation if available */}
                          {q.explanation && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-white/80 border border-[#F1E7CF] text-xs text-[#4B5563]">
                              <strong className="text-[#D97706] block text-[10px] uppercase font-bold">Explanation:</strong>
                              <p className="mt-0.5 leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-[#F1E7CF]">
                  <Button variant="secondary" size="sm" onClick={() => setMcqModalOpen(false)}>
                    Close Solution Review
                  </Button>
                </div>
              </div>
            ) : (
              /* ─── CASE B: ACTIVE TEST TAKING RUNNER ───────────────────────────────── */
              currentMcqQuestions.length > 0 && (
                <div className="space-y-5">
                  {/* Question Palette & Progress Bar */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF]">
                    <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
                      <span>
                        Question Palette ({answeredCount}/{currentMcqQuestions.length} Answered)
                      </span>
                      <span className="text-[#D97706] font-mono">
                        {Math.round((answeredCount / currentMcqQuestions.length) * 100)}% Complete
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#D97706] h-full transition-all duration-300"
                        style={{ width: `${(answeredCount / currentMcqQuestions.length) * 100}%` }}
                      />
                    </div>

                    {/* Question Number Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      {currentMcqQuestions.map((_, qIdx) => {
                        const isCurrent = activeQuestionIdx === qIdx;
                        const isAnswered = mcqAnswers[qIdx] !== undefined;

                        return (
                          <button
                            key={qIdx}
                            type="button"
                            onClick={() => setActiveQuestionIdx(qIdx)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                              isCurrent
                                ? 'bg-[#0B132B] text-white ring-2 ring-[#D99A00] shadow-sm'
                                : isAnswered
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-white border border-[#F1E7CF] text-[#6B7280] hover:bg-[#FFF8E6]'
                            }`}
                          >
                            {qIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Question Box */}
                  {(() => {
                    const q = currentMcqQuestions[activeQuestionIdx];
                    if (!q) return null;
                    const selected = mcqAnswers[activeQuestionIdx];

                    return (
                      <div className="p-5 rounded-3xl bg-white border border-[#F1E7CF] shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-[#D97706] bg-[#FFF8E6] px-3 py-1 rounded-xl border border-[#F1E7CF]">
                            Question {activeQuestionIdx + 1} of {currentMcqQuestions.length}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#6B7280]">
                            Marks: {q.marks || 1}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-[#111827] leading-relaxed">
                          {q.questionText}
                        </h4>

                        {/* 4 Answer Options */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {(q.options || []).map((opt, optIdx) => {
                            const isSelected = selected === optIdx;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectMcqOption(activeQuestionIdx, optIdx)}
                                className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-[#FFF8E6] border-[#D97706] text-[#0B132B] ring-1 ring-[#D97706] shadow-xs'
                                    : 'bg-white border-[#F1E7CF] text-[#374151] hover:bg-[#FFFDF5] hover:border-[#D99A00]/50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-[#0B132B] text-white'
                                        : 'bg-slate-100 text-[#6B7280] border border-slate-300'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>

                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    isSelected ? 'border-[#D97706] bg-[#D97706]' : 'border-slate-300'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Navigation and Clear Action */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#F1E7CF]">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                              onClick={() => setActiveQuestionIdx((prev) => Math.max(0, prev - 1))}
                              disabled={activeQuestionIdx === 0}
                            >
                              Previous
                            </Button>

                            <Button
                              variant="secondary"
                              size="sm"
                              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                              onClick={() =>
                                setActiveQuestionIdx((prev) => Math.min(currentMcqQuestions.length - 1, prev + 1))
                              }
                              disabled={activeQuestionIdx === currentMcqQuestions.length - 1}
                            >
                              Next
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            {selected !== undefined && (
                              <button
                                type="button"
                                onClick={() => handleClearMcqOption(activeQuestionIdx)}
                                className="text-xs text-[#9CA3AF] hover:text-red-600 font-bold px-2 py-1"
                              >
                                Clear Choice
                              </button>
                            )}

                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Send className="w-3.5 h-3.5" />}
                              onClick={() => setConfirmSubmitOpen(true)}
                            >
                              Submit MCQ Test
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Submission Confirmation Dialog */}
                  {confirmSubmitOpen && (
                    <div className="p-4 rounded-2xl bg-[#0B132B] text-white space-y-3 shadow-lg border border-[#D97706]">
                      <div className="flex items-center gap-2 text-[#F59E0B]">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <h4 className="text-sm font-extrabold text-white">Confirm Assignment Submission</h4>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        You have answered <strong>{answeredCount}</strong> out of{' '}
                        <strong>{currentMcqQuestions.length}</strong> questions.
                      </p>

                      {unansweredCount > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                          ⚠️ Notice: You have {unansweredCount} unanswered question(s). Unanswered questions will
                          receive zero marks upon evaluation.
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-700">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setConfirmSubmitOpen(false)}
                          disabled={mcqSubmitting}
                        >
                          Review Answers
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSubmitMcqAssignment}
                          leftIcon={
                            mcqSubmitting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )
                          }
                          disabled={mcqSubmitting}
                        >
                          {mcqSubmitting ? 'Evaluating on Server...' : 'Confirm & Final Submit'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </Modal>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          PDF ASSIGNMENT MODAL (Question Paper Viewer & Answer PDF Submission)
      ───────────────────────────────────────────────────────────────────────────── */}
      {pdfAssignment && (
        <Modal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          title={`PDF Assignment: ${pdfAssignment.title}`}
          size="lg"
        >
          <form onSubmit={handleSubmitPdfAssignment} className="space-y-4">
            {/* Assignment Specs Box */}
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] space-y-2 text-xs">
              <div className="flex justify-between items-start font-bold text-[#111827]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D97706] tracking-wider block">
                    {pdfAssignment.subject || pdfAssignment.course?.title || 'Coursework'}
                  </span>
                  <span className="text-sm font-extrabold">{pdfAssignment.title}</span>
                </div>
                <span className="font-mono text-[#D97706] bg-white px-2.5 py-1 rounded-xl border border-[#F1E7CF]">
                  Max Marks: {pdfAssignment.maxMarks || 50}
                </span>
              </div>

              <div className="flex items-center justify-between text-[#6B7280] pt-1 border-t border-[#F1E7CF]">
                <span>Deadline: {formatDateTime(pdfAssignment.dueDate)}</span>
                {pdfAssignment.faculty?.name && <span>Faculty: {pdfAssignment.faculty.name}</span>}
              </div>

              {pdfAssignment.instructions && (
                <div className="mt-1 pt-1 border-t border-[#F1E7CF]">
                  <strong className="text-[#D99A00] block text-[10px] uppercase">Instructions:</strong>
                  <p className="text-[#374151] mt-0.5 leading-relaxed whitespace-pre-line">
                    {pdfAssignment.instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Faculty Question Paper Download Box */}
            {pdfAssignment.questionPaper?.url && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#D97706] shrink-0" />
                  <div>
                    <span className="font-bold text-[#111827] block">
                      {pdfAssignment.questionPaper.originalName || 'Faculty Question Paper.pdf'}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      Official question paper provided by instructor &bull; PDF
                    </span>
                  </div>
                </div>

                <a
                  href={getFullFileUrl(pdfAssignment.questionPaper.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D97706] text-xs font-bold text-[#D97706] hover:bg-[#FFF8E6] flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Question Paper
                </a>
              </div>
            )}

            {pdfModalError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {pdfModalError}
              </div>
            )}

            {/* Existing Submission Status Card */}
            {pdfAssignment.isSubmitted && (
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5 text-blue-950">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Previous Submission on Record
                  </span>
                  <Badge variant={pdfAssignment.submissionStatus === 'Evaluated' ? 'teal' : 'info'} size="sm">
                    {pdfAssignment.submissionStatus}
                  </Badge>
                </div>

                <div className="text-blue-800">
                  Submitted On: {formatDateTime(pdfAssignment.submittedAt || pdfAssignment.submission?.submittedAt)}
                </div>

                {pdfAssignment.submission?.file && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/90 border border-blue-200">
                    <div className="flex items-center gap-2 font-bold text-[#0B132B]">
                      <FileCheck2 className="w-4 h-4 text-[#D97706]" />
                      <span>{pdfAssignment.submission.file.originalName || 'Submitted Solution PDF'}</span>
                    </div>

                    <a
                      href={getFullFileUrl(pdfAssignment.submission.file.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> View Uploaded PDF
                    </a>
                  </div>
                )}

                {/* Faculty Evaluation result */}
                {pdfAssignment.submissionStatus === 'Evaluated' ? (
                  <div className="mt-2 p-3 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 font-medium">
                    <div className="font-bold flex items-center justify-between">
                      <span>Faculty Marks Awarded: {pdfAssignment.marksObtained} / {pdfAssignment.maxMarks}</span>
                      <Award className="w-4 h-4 text-emerald-700" />
                    </div>
                    {pdfAssignment.feedback && (
                      <p className="mt-1 text-xs">
                        <strong>Feedback:</strong> {pdfAssignment.feedback}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-blue-700">
                    Your solution PDF is under faculty evaluation. You can upload an updated PDF file below to replace it before final grading.
                  </p>
                )}
              </div>
            )}

            {/* Answer PDF File Dropzone */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Upload Completed Solution PDF (.pdf only, max 25 MB)
              </label>

              <div className="border-2 border-dashed border-[#F1E7CF] hover:border-[#D99A00] rounded-2xl p-5 text-center cursor-pointer bg-[#FFFDF5] transition-all">
                <input
                  type="file"
                  id="pdf-asgn-input"
                  onChange={handlePdfFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <label htmlFor="pdf-asgn-input" className="cursor-pointer block space-y-1">
                  <Upload className="w-7 h-7 text-[#D99A00] mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-[#111827] block">
                    {selectedPdfFile ? selectedPdfFile.name : 'Click to browse solution PDF from your computer'}
                  </span>
                  <span className="text-[11px] text-[#6B7280] block">
                    {selectedPdfFile
                      ? `${(selectedPdfFile.size / 1024).toFixed(1)} KB &bull; Ready for submission`
                      : 'Strictly .pdf documents only &bull; Up to 25 MB'}
                  </span>
                </label>
              </div>
            </div>

            {/* Submission Remarks */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Submission Notes / Remarks for Faculty (Optional)
              </label>
              <textarea
                value={pdfSubmissionText}
                onChange={(e) => setPdfSubmissionText(e.target.value)}
                placeholder="Add any clarifying notes, references, or comments about your PDF submission..."
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1E7CF]">
              <Button variant="secondary" size="sm" type="button" onClick={() => setPdfModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={pdfSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                disabled={pdfSubmitting}
              >
                {pdfSubmitting
                  ? 'Uploading & Saving PDF...'
                  : pdfAssignment.isSubmitted
                  ? 'Update PDF Submission'
                  : 'Submit Solution PDF'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default StudentAssignmentSection;
