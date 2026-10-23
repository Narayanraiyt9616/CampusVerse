import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Plus,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Users,
  Award,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  GraduationCap,
  X,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { admitCardService } from '../../../services/api';

export const AdminAdmitCards = ({ createTrigger = 0 }) => {
  const [admitCards, setAdmitCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sessionFilter, setSessionFilter] = useState('ALL');

  // Options from meta API
  const [options, setOptions] = useState({
    students: [],
    exams: [],
    departments: [],
    sessions: ['Spring 2026', 'Autumn 2025', 'Even Semester 2025-26', 'Summer Supplementary 2026'],
  });

  // KPI Summary
  const [summary, setSummary] = useState({
    totalIssued: 0,
    issuedCount: 0,
    reissuedCount: 0,
    uniqueStudentsCount: 0,
  });

  // Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    semester: 6,
    examTitle: 'End-Semester Theory & Practical Examination',
    examSession: 'Spring 2026',
    examDate: 'May 15 - May 30, 2026',
    remarks: 'Candidate must bring this original admit card along with valid institutional ID.',
  });
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);

  // Reissue Modal State
  const [isReissueModalOpen, setIsReissueModalOpen] = useState(false);
  const [reissueTarget, setReissueTarget] = useState(null);
  const [reissueLoading, setReissueLoading] = useState(false);
  const [reissueForm, setReissueForm] = useState({
    examTitle: '',
    examSession: '',
    examDate: '',
    remarks: '',
  });
  const [reissuePdfFile, setReissuePdfFile] = useState(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Preview Modal State
  const [previewTarget, setPreviewTarget] = useState(null);

  const fetchOptions = async () => {
    try {
      const res = await admitCardService.getOptions();
      if (res && res.success) {
        setOptions((prev) => ({
          ...prev,
          students: res.students || [],
          exams: res.exams || [],
          departments: res.departments || [],
          sessions: res.sessions || prev.sessions,
        }));
      }
    } catch (err) {
      console.warn('Failed to load admit card options:', err);
    }
  };

  const fetchAdmitCards = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await admitCardService.getAdmitCards({
        search: search || undefined,
        semester: semesterFilter !== 'ALL' ? semesterFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        examSession: sessionFilter !== 'ALL' ? sessionFilter : undefined,
      });

      if (res && res.success) {
        setAdmitCards(res.admitCards || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('fetchAdmitCards error:', err);
      setError(err.message || 'Failed to load admit cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchAdmitCards();
  }, [semesterFilter, statusFilter, sessionFilter]);

  // Open creation modal when triggered from top PageHeader
  useEffect(() => {
    if (createTrigger > 0) {
      setError('');
      setSuccess('');
      setSelectedPdfFile(null);
      setIsIssueModalOpen(true);
    }
  }, [createTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdmitCards();
  };

  // Student selection in issue modal auto-fills semester and department
  const handleStudentSelect = (sid) => {
    const s = options.students.find((item) => item.studentId === sid || item._id === sid);
    setIssueForm((prev) => ({
      ...prev,
      studentId: s ? s.studentId : sid,
      semester: s ? s.semester : prev.semester,
    }));
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.studentId) {
      setError('Please select a student.');
      return;
    }
    if (!issueForm.examTitle) {
      setError('Examination title is required.');
      return;
    }

    setIssueLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('studentId', issueForm.studentId);
      formData.append('semester', String(issueForm.semester));
      formData.append('examTitle', issueForm.examTitle);
      formData.append('examSession', issueForm.examSession);
      formData.append('examDate', issueForm.examDate);
      formData.append('remarks', issueForm.remarks);

      if (selectedPdfFile) {
        formData.append('pdfFile', selectedPdfFile);
      }

      const res = await admitCardService.issueAdmitCard(formData);
      if (res && res.success) {
        setSuccess(`Admit card for ${issueForm.studentId} issued successfully!`);
        setIsIssueModalOpen(false);
        setSelectedPdfFile(null);
        setIssueForm({
          studentId: '',
          semester: 6,
          examTitle: 'End-Semester Theory & Practical Examination',
          examSession: 'Spring 2026',
          examDate: 'May 15 - May 30, 2026',
          remarks: 'Candidate must bring this original admit card along with valid institutional ID.',
        });
        fetchAdmitCards();
      }
    } catch (err) {
      setError(err.message || 'Failed to issue admit card.');
    } finally {
      setIssueLoading(false);
    }
  };

  const openReissueModal = (item) => {
    setReissueTarget(item);
    setReissueForm({
      examTitle: item.examTitle || '',
      examSession: item.examSession || '',
      examDate: item.examDate || '',
      remarks: item.remarks || '',
    });
    setReissuePdfFile(null);
    setIsReissueModalOpen(true);
  };

  const handleReissueSubmit = async (e) => {
    e.preventDefault();
    if (!reissueTarget) return;

    setReissueLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('examTitle', reissueForm.examTitle);
      formData.append('examSession', reissueForm.examSession);
      formData.append('examDate', reissueForm.examDate);
      formData.append('remarks', reissueForm.remarks);

      if (reissuePdfFile) {
        formData.append('pdfFile', reissuePdfFile);
      }

      const res = await admitCardService.reissueAdmitCard(reissueTarget._id, formData);
      if (res && res.success) {
        setSuccess(`Admit card for ${reissueTarget.studentName} (${reissueTarget.studentId}) successfully reissued!`);
        setIsReissueModalOpen(false);
        setReissueTarget(null);
        setReissuePdfFile(null);
        fetchAdmitCards();
      }
    } catch (err) {
      setError(err.message || 'Failed to reissue admit card.');
    } finally {
      setReissueLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await admitCardService.deleteAdmitCard(deleteTarget._id);
      if (res && res.success) {
        setSuccess(`Admit card for ${deleteTarget.studentName} (${deleteTarget.studentId}) removed from database.`);
        setDeleteTarget(null);
        fetchAdmitCards();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete admit card.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Student & Identification',
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] text-[#D99A00] font-black flex items-center justify-center text-xs">
            {r.studentName ? r.studentName.charAt(0) : 'S'}
          </div>
          <div>
            <p className="font-bold text-xs text-[#111827]">{r.studentName}</p>
            <p className="font-mono text-[11px] text-[#4B5563] font-semibold">
              Roll: <strong className="text-[#D99A00]">{r.studentId}</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'exam',
      header: 'Examination & Session',
      render: (_, r) => (
        <div>
          <p className="font-bold text-xs text-[#111827]">{r.examTitle}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF]">
              {r.examSession}
            </span>
            <span className="text-[11px] text-[#4B5563] font-medium">{r.examDate}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'academic',
      header: 'Academic Dept / Sem',
      render: (_, r) => (
        <div>
          <p className="text-xs font-semibold text-[#111827]">{r.departmentName || 'Engineering'}</p>
          <p className="text-[11px] text-[#4B5563] font-mono">Semester {r.semester}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Issue Status',
      render: (v, r) => (
        <div className="space-y-1">
          <Badge
            variant={v === 'Issued' ? 'teal' : v === 'Reissued' ? 'warning' : 'neutral'}
            size="sm"
            hasDot
          >
            {v} {r.reissueCount > 0 ? `(Rev ${r.reissueCount})` : ''}
          </Badge>
          <p className="text-[10px] text-[#4B5563] font-mono">
            {new Date(r.issueDate || r.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Admit Card Actions',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-8 px-2.5"
            leftIcon={<Eye className="w-3.5 h-3.5 text-[#D99A00]" />}
            onClick={() => setPreviewTarget(r)}
            title="Preview Admit Card PDF"
          >
            Preview
          </Button>

          <a
            href={admitCardService.getDownloadUrl(r._id)}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-1 px-2.5 h-8 text-xs font-bold rounded-xl border border-[#F1E7CF] bg-white text-[#111827] hover:bg-[#FFF8E6] transition-colors"
            title="Download Admit Card PDF"
          >
            <Download className="w-3.5 h-3.5 text-[#4B5563]" />
            <span>PDF</span>
          </a>

          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-8 px-2"
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-[#D99A00]" />}
            onClick={() => openReissueModal(r)}
            title="Reissue / Update Admit Card"
          >
            Reissue
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-8 px-2 !text-rose-600 hover:!bg-rose-50 hover:!border-rose-200"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setDeleteTarget(r)}
            title="Delete Admit Card"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI StatCards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#F1E7CF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Total Admit Cards</span>
            <FileCheck2 className="w-5 h-5 text-[#D99A00]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#111827] font-mono">{summary.totalIssued}</span>
            <span className="text-[11px] font-semibold text-emerald-600">Active Registry</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F1E7CF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Original Issues</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#111827] font-mono">{summary.issuedCount}</span>
            <span className="text-[11px] font-semibold text-[#4B5563]">Primary Hall Tickets</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F1E7CF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Reissued Records</span>
            <RotateCcw className="w-5 h-5 text-[#D99A00]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#D99A00] font-mono">{summary.reissuedCount}</span>
            <span className="text-[11px] font-semibold text-[#4B5563]">Revised & Updated</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F1E7CF] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Students Covered</span>
            <Users className="w-5 h-5 text-[#111827]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#111827] font-mono">{summary.uniqueStudentsCount}</span>
            <span className="text-[11px] font-semibold text-[#4B5563]">Authorized Candidates</span>
          </div>
        </div>
      </div>

      {/* Main Roster Card */}
      <Card
        title="University Examination Admit Card Roster"
        subtitle="Issue, authenticate, reissue, and securely distribute official examination hall tickets in PDF format"
        badge={<Badge variant="teal" size="sm">RBAC Protected</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchAdmitCards}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setError('');
                setSuccess('');
                setSelectedPdfFile(null);
                setIsIssueModalOpen(true);
              }}
            >
              Create Admit Card
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {error && (
            <AlertBanner
              variant="error"
              title="Admit Card Error"
              message={error}
              dismissible
              onDismiss={() => setError('')}
            />
          )}

          {success && (
            <AlertBanner
              variant="success"
              title="Operation Successful"
              message={success}
              dismissible
              onDismiss={() => setSuccess('')}
            />
          )}

          {/* Search & Filters Strip */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#FFFDF5] rounded-xl border border-[#F1E7CF]">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4B5563] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student roll number, name, or exam..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#F1E7CF] bg-white text-[#111827] placeholder-[#4B5563]/60 focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm" className="h-9">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#4B5563]">Semester:</span>
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-[#F1E7CF] bg-white text-[#111827] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                >
                  <option value="ALL">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#4B5563]">Session:</span>
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-[#F1E7CF] bg-white text-[#111827] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                >
                  <option value="ALL">All Sessions</option>
                  {options.sessions.map((sess) => (
                    <option key={sess} value={sess}>
                      {sess}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#4B5563]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-2.5 rounded-lg border border-[#F1E7CF] bg-white text-[#111827] font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                >
                  <option value="ALL">All Status</option>
                  <option value="Issued">Issued</option>
                  <option value="Reissued">Reissued</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <LoadingSpinner />
              <p className="mt-3 text-xs text-[#4B5563] font-bold">Loading examination admit cards...</p>
            </div>
          ) : admitCards.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#F1E7CF] bg-[#FFFDF5]">
              <FileCheck2 className="w-10 h-10 text-[#D99A00] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#111827]">No Admit Cards Found</h3>
              <p className="text-xs text-[#4B5563] mt-1 max-w-sm mx-auto">
                No examination admit cards match the selected filter criteria. Click "Create Admit Card" to issue official hall tickets.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3.5"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  setError('');
                  setSuccess('');
                  setSelectedPdfFile(null);
                  setIsIssueModalOpen(true);
                }}
              >
                Create Admit Card
              </Button>
            </div>
          ) : (
            <Table columns={columns} data={admitCards} />
          )}
        </div>
      </Card>

      {/* ──────────────────────────────────────────────────────────────────────────
          1. Issue Admit Card Modal
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Create & Issue Examination Admit Card"
        description="Select a candidate, examination session, and generate or upload the authorized PDF admit card to publish it to the student portal."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsIssueModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={issueLoading}
              disabled={issueLoading}
              leftIcon={<FileCheck2 className="w-4 h-4" />}
              onClick={handleIssueSubmit}
            >
              {issueLoading ? 'Creating & Issuing Admit Card...' : 'Create & Issue Admit Card'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Selection */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Target Student Candidate <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueForm.studentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                required
              >
                <option value="">-- Choose Candidate from Registry --</option>
                {options.students.map((s) => (
                  <option key={s._id} value={s.studentId}>
                    {s.name} ({s.studentId}) • Sem {s.semester} • {s.department?.name || 'CSE'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-[#4B5563]">
                Strictly links this hall ticket to the student's unique enrollment ID.
              </p>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Academic Semester <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueForm.semester}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, semester: parseInt(e.target.value, 10) }))}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Examination Title */}
            <div>
              <Input
                label="Examination Name / Title *"
                id="exam-title"
                type="text"
                placeholder="e.g. End-Semester Theory & Practical Exam"
                value={issueForm.examTitle}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, examTitle: e.target.value }))}
                required
              />
            </div>

            {/* Examination Session */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Examination Session <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueForm.examSession}
                onChange={(e) => setIssueForm((prev) => ({ ...prev, examSession: e.target.value }))}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                required
              >
                {options.sessions.map((sess) => (
                  <option key={sess} value={sess}>
                    {sess}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Examination Date Range */}
          <div>
            <Input
              label="Examination Date Range / Schedule"
              id="exam-date"
              type="text"
              placeholder="e.g. May 15 - May 30, 2026"
              value={issueForm.examDate}
              onChange={(e) => setIssueForm((prev) => ({ ...prev, examDate: e.target.value }))}
            />
          </div>

          {/* PDF File Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Admit Card Document (PDF Format)
            </label>
            <div className="border-2 border-dashed border-[#F1E7CF] hover:border-[#D99A00] rounded-2xl p-5 text-center bg-[#FFFDF5] transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setSelectedPdfFile(e.target.files[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1.5 pointer-events-none">
                <Upload className="w-8 h-8 text-[#D99A00] mx-auto" />
                {selectedPdfFile ? (
                  <div>
                    <p className="text-xs font-bold text-[#111827]">
                      Selected: {selectedPdfFile.name} ({(selectedPdfFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                      ✓ Valid PDF document ready for secure issue
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-[#111827]">
                      Drop student admit card PDF here, or click to browse
                    </p>
                    <p className="text-[11px] text-[#4B5563]">
                      Accepts official PDF files up to 10MB. If no custom PDF is uploaded, an official CampusVerse AI Hall Ticket PDF will be generated automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Candidate Instructions & Dean's Remarks
            </label>
            <textarea
              rows={2}
              value={issueForm.remarks}
              onChange={(e) => setIssueForm((prev) => ({ ...prev, remarks: e.target.value }))}
              placeholder="Instructions printed on the admit card..."
              className="w-full p-2.5 text-xs font-medium rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
            />
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. Reissue Admit Card Modal
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isReissueModalOpen}
        onClose={() => setIsReissueModalOpen(false)}
        title={`Reissue Admit Card: ${reissueTarget?.studentName || ''}`}
        description="Update examination details or upload a revised PDF file. The reissue counter and timestamp will be updated."
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsReissueModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="teal"
              size="sm"
              loading={reissueLoading}
              disabled={reissueLoading}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleReissueSubmit}
            >
              {reissueLoading ? 'Reissuing...' : 'Confirm Reissue & Publish'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleReissueSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] text-xs space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Candidate: {reissueTarget?.studentName}</span>
              <span className="font-mono text-[#D99A00]">Roll: {reissueTarget?.studentId}</span>
            </div>
            <p className="text-[#4B5563]">Current Reissue Count: {reissueTarget?.reissueCount || 0}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Examination Title"
                id="reissue-title"
                type="text"
                value={reissueForm.examTitle}
                onChange={(e) => setReissueForm((prev) => ({ ...prev, examTitle: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Examination Session"
                id="reissue-session"
                type="text"
                value={reissueForm.examSession}
                onChange={(e) => setReissueForm((prev) => ({ ...prev, examSession: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Input
              label="Schedule / Exam Date"
              id="reissue-date"
              type="text"
              value={reissueForm.examDate}
              onChange={(e) => setReissueForm((prev) => ({ ...prev, examDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Replace Admit Card PDF Document (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setReissuePdfFile(e.target.files[0] || null)}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D99A00] file:text-white hover:file:bg-[#E5A900] cursor-pointer"
            />
            {reissuePdfFile && (
              <p className="mt-1 text-[11px] text-emerald-600 font-bold">
                ✓ New PDF will replace the current file: {reissuePdfFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Remarks</label>
            <textarea
              rows={2}
              value={reissueForm.remarks}
              onChange={(e) => setReissueForm((prev) => ({ ...prev, remarks: e.target.value }))}
              className="w-full p-2.5 text-xs font-medium rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
            />
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. Delete Confirmation Modal
      ────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Revoke & Delete Admit Card"
        description="Are you sure you want to permanently revoke and delete this admit card?"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={deleteLoading}
              disabled={deleteLoading}
              className="!bg-rose-600 !text-white hover:!bg-rose-700 !border-transparent"
              onClick={handleDeleteConfirm}
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete Admit Card'}
            </Button>
          </div>
        }
      >
        {deleteTarget && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <p className="font-bold">This action cannot be undone.</p>
              <p className="mt-0.5 text-[11px]">
                The admit card for candidate <strong>{deleteTarget.studentName}</strong> (
                <span className="font-mono">{deleteTarget.studentId}</span>) for{' '}
                <strong>{deleteTarget.examTitle}</strong> will be revoked and immediately removed from the student portal.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. In-App PDF Preview Modal
      ────────────────────────────────────────────────────────────────────────── */}
      {previewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#F1E7CF]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#111827] text-white border-b border-[#F1E7CF]">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-[#D99A00]" />
                <div>
                  <h3 className="font-bold text-sm">
                    Admit Card: {previewTarget.studentName} ({previewTarget.studentId})
                  </h3>
                  <p className="text-[11px] text-slate-300 font-mono">
                    {previewTarget.examTitle} • {previewTarget.examSession}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={admitCardService.getDownloadUrl(previewTarget._id)}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D99A00] text-white hover:bg-[#E5A900] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewTarget(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 min-h-[500px] bg-slate-100">
              <iframe
                title="Admit Card Preview"
                src={admitCardService.getPreviewUrl(previewTarget._id)}
                className="w-full h-full min-h-[550px] border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdmitCards;
