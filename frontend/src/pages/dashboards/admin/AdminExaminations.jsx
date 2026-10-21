import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  BookOpen,
  FileCheck2,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

export const AdminExaminations = () => {
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'results' | 'assignments'
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState({
    title: '',
    subject: '',
    className: '',
    semester: 7,
    examDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    startTime: '10:00',
    duration: 120,
    venue: 'Main Auditorium',
    maxMarks: 50,
    examType: 'Mid-Term',
    instructions: '',
  });
  const [examLoading, setExamLoading] = useState(false);

  // Result Modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [resultForm, setResultForm] = useState({
    student: '',
    course: '',
    assessmentName: '',
    marksObtained: 0,
    maxMarks: 50,
    semester: 7,
    session: '2025-2026 Autumn',
    published: true,
    feedback: '',
  });
  const [resultLoading, setResultLoading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'exam'|'result', id, name }

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [examRes, resRes, assignRes, courseRes, studRes] = await Promise.all([
        adminService.getExams(),
        adminService.getResults(),
        adminService.getAssignments(),
        adminService.getCourses(),
        adminService.getStudents({ limit: 50 }),
      ]);

      if (examRes && examRes.success) setExams(examRes.exams || []);
      if (resRes && resRes.success) setResults(resRes.results || []);
      if (assignRes && assignRes.success) setAssignments(assignRes.assignments || []);
      if (courseRes && courseRes.success) setCourses(courseRes.courses || []);
      if (studRes && studRes.success) setStudents(studRes.students || []);
    } catch (err) {
      setError(err.message || 'Failed to load examination records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Exam Handlers
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamForm({
      title: '',
      subject: courses[0]?.title || '',
      className: 'B.Tech CSE 7th Sem',
      semester: 7,
      examDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      startTime: '10:00',
      duration: 120,
      venue: 'Exam Hall 2',
      maxMarks: 50,
      examType: 'Mid-Term',
      instructions: 'Standard university examination rules apply.',
    });
    setIsExamModalOpen(true);
  };

  const handleOpenEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      subject: exam.subject,
      className: exam.className,
      semester: exam.semester || 7,
      examDate: exam.examDate,
      startTime: exam.startTime,
      duration: exam.duration || 120,
      venue: exam.venue || 'Exam Hall',
      maxMarks: exam.maxMarks || 50,
      examType: exam.examType || 'Mid-Term',
      instructions: exam.instructions || '',
    });
    setIsExamModalOpen(true);
  };

  const handleSaveExam = async (e) => {
    if (e) e.preventDefault();
    setExamLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editingExam) {
        const res = await adminService.updateExam(editingExam._id, examForm);
        if (res && res.success) {
          setSuccess(`Exam schedule ${examForm.title} updated.`);
          setIsExamModalOpen(false);
          loadData();
        }
      } else {
        const res = await adminService.createExam(examForm);
        if (res && res.success) {
          setSuccess(`Exam ${examForm.title} scheduled successfully!`);
          setIsExamModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule exam.');
    } finally {
      setExamLoading(false);
    }
  };

  // Result Handlers
  const handleOpenAddResult = () => {
    setEditingResult(null);
    setResultForm({
      student: students[0]?._id || '',
      course: courses[0]?._id || '',
      assessmentName: 'Mid-Term Exam',
      marksObtained: 35,
      maxMarks: 50,
      semester: 7,
      session: '2025-2026 Autumn',
      published: true,
      feedback: 'Good analytical reasoning demonstrated.',
    });
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e) => {
    if (e) e.preventDefault();
    setResultLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editingResult) {
        const res = await adminService.updateResult(editingResult._id, resultForm);
        if (res && res.success) {
          setSuccess(`Marks updated successfully.`);
          setIsResultModalOpen(false);
          loadData();
        }
      } else {
        const res = await adminService.createResult(resultForm);
        if (res && res.success) {
          setSuccess(`Result marks saved to database.`);
          setIsResultModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save result record.');
    } finally {
      setResultLoading(false);
    }
  };

  const handleTogglePublish = async (resItem) => {
    try {
      const res = await adminService.togglePublishResult(resItem._id);
      if (res && res.success) {
        setSuccess(res.message);
        loadData();
      }
    } catch (err) {
      alert(`Publish toggle failed: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'exam') {
        await adminService.deleteExam(deleteTarget.id);
        setSuccess('Exam schedule removed.');
      } else {
        await adminService.deleteResult(deleteTarget.id);
        setSuccess('Result record removed.');
      }
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const examColumns = [
    {
      key: 'title',
      header: 'Exam Title & Subject',
      render: (v, r) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{v}</p>
          <p className="text-[11px] text-slate-500">{r.subject} • {r.className}</p>
        </div>
      ),
    },
    {
      key: 'examDate',
      header: 'Schedule & Timing',
      render: (v, r) => (
        <div>
          <p className="font-mono text-xs font-bold text-navy-900">{v}</p>
          <p className="text-[11px] text-slate-500 font-mono">{r.startTime} ({r.duration} mins)</p>
        </div>
      ),
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (v) => <span className="text-xs text-slate-700 font-medium">{v}</span>,
    },
    {
      key: 'maxMarks',
      header: 'Max Marks',
      render: (v) => <span className="font-mono text-xs font-bold text-teal-700">{v} Marks</span>,
    },
    {
      key: 'examType',
      header: 'Type',
      render: (v) => <Badge variant="navy" size="sm">{v}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            leftIcon={<Edit2 className="w-3 h-3" />}
            onClick={() => handleOpenEditExam(r)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="text-xs"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => setDeleteTarget({ type: 'exam', id: r._id, name: r.title })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const resultColumns = [
    {
      key: 'student',
      header: 'Student Name & Roll',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{s?.name || 'Student'}</p>
          <p className="font-mono text-[11px] text-slate-500">{s?.studentId}</p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course Subject',
      render: (c) => (
        <div>
          <span className="font-mono font-bold text-xs text-navy-900">{c?.courseCode || 'Course'}</span>
          <p className="text-[11px] text-slate-500 line-clamp-1">{c?.title}</p>
        </div>
      ),
    },
    {
      key: 'assessmentName',
      header: 'Assessment',
      render: (v) => <span className="text-xs font-medium text-slate-700">{v}</span>,
    },
    {
      key: 'marksObtained',
      header: 'Marks Scored',
      render: (v, r) => {
        const pct = r.maxMarks > 0 ? Math.round((v / r.maxMarks) * 100) : 0;
        return (
          <div>
            <span className="font-mono font-bold text-xs text-slate-800">{v} / {r.maxMarks}</span>
            <span className={`ml-2 text-[11px] font-bold ${pct >= 75 ? 'text-emerald-600' : pct >= 40 ? 'text-teal-600' : 'text-rose-600'}`}>
              ({pct}%)
            </span>
          </div>
        );
      },
    },
    {
      key: 'published',
      header: 'Publication Status',
      render: (v) => (
        <Badge variant={v ? 'success' : 'neutral'} size="sm" hasDot>
          {v ? 'Published' : 'Draft / Hidden'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Publication Control',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant={r.published ? 'secondary' : 'teal'}
            size="sm"
            className="text-xs"
            leftIcon={r.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            onClick={() => handleTogglePublish(r)}
          >
            {r.published ? 'Unpublish' : 'Publish to Student Portal'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="text-xs"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => setDeleteTarget({ type: 'result', id: r._id, name: r.assessmentName })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const assignmentColumns = [
    {
      key: 'title',
      header: 'Assignment Title',
      render: (v, r) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{v}</p>
          <p className="text-[11px] text-slate-500 line-clamp-1">{r.description || 'No description'}</p>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course Code',
      render: (c) => <span className="font-mono font-bold text-xs text-navy-900">{c?.courseCode || 'N/A'}</span>,
    },
    {
      key: 'faculty',
      header: 'Faculty In-Charge',
      render: (f) => <span className="text-xs text-slate-700">{f?.name || 'Faculty Member'}</span>,
    },
    {
      key: 'dueDate',
      header: 'Deadline Date',
      render: (v) => <span className="font-mono text-xs text-slate-600">{v ? new Date(v).toLocaleDateString() : 'No date'}</span>,
    },
    {
      key: 'maxMarks',
      header: 'Weightage',
      render: (v) => <span className="font-mono text-xs text-slate-800">{v || 10} Marks</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {success && (
        <AlertBanner
          variant="success"
          title="Examination Ledger Updated"
          message={success}
          dismissible
          onDismiss={() => setSuccess('')}
        />
      )}

      {error && (
        <AlertBanner
          variant="danger"
          title="Examination Management Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 bg-slate-200/60 rounded-xl">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'exams'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Examinations Schedule ({exams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Academic Results & Publishing ({results.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'assignments'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty Assignments ({assignments.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>

          {activeTab === 'exams' && (
            <Button
              variant="teal"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddExam}
            >
              Schedule New Exam
            </Button>
          )}

          {activeTab === 'results' && (
            <Button
              variant="teal"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddResult}
            >
              Enter Student Result
            </Button>
          )}
        </div>
      </div>

      {/* Tab 1: Exams */}
      {activeTab === 'exams' && (
        <Card
          title="Scheduled Examinations & Invigilation Calendar"
          subtitle="Mid-Term, End-Term, and Practical examinations registered in MongoDB"
          badge={<Badge variant="teal" size="sm">{exams.length} Upcoming</Badge>}
        >
          <Table
            columns={examColumns}
            data={exams}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No exams scheduled."
          />
        </Card>
      )}

      {/* Tab 2: Results & Publishing */}
      {activeTab === 'results' && (
        <Card
          title="Academic Performance & Examination Results Publishing"
          subtitle="Review marks entered by faculty and control visibility to students via the publish switch"
          badge={<Badge variant="navy" size="sm">{results.length} Records</Badge>}
        >
          <Table
            columns={resultColumns}
            data={results}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No results entered yet."
          />
        </Card>
      )}

      {/* Tab 3: Assignments */}
      {activeTab === 'assignments' && (
        <Card
          title="Faculty Assignments & Student Coursework Monitoring"
          subtitle="Review active coursework assignments, due dates, and grading weights"
          badge={<Badge variant="info" size="sm">{assignments.length} Coursework Tasks</Badge>}
        >
          <Table
            columns={assignmentColumns}
            data={assignments}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No assignments recorded."
          />
        </Card>
      )}

      {/* Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title={editingExam ? `Edit Exam: ${editingExam.title}` : 'Schedule University Examination'}
        description="Publish institutional examination time, hall venue, and duration"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsExamModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              loading={examLoading}
              disabled={examLoading}
              onClick={handleSaveExam}
            >
              {editingExam ? 'Save Changes' : 'Publish Schedule'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Exam Title"
                type="text"
                placeholder="e.g. CS701 Mid-Term Examination"
                value={examForm.title}
                onChange={(e) => setExamForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Subject Name"
                type="text"
                placeholder="e.g. Artificial Intelligence & Neural Networks"
                value={examForm.subject}
                onChange={(e) => setExamForm((p) => ({ ...p, subject: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Class Name"
                type="text"
                placeholder="e.g. B.Tech CSE 7th Sem"
                value={examForm.className}
                onChange={(e) => setExamForm((p) => ({ ...p, className: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester</label>
              <select
                value={examForm.semester}
                onChange={(e) => setExamForm((p) => ({ ...p, semester: Number(e.target.value) }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Exam Type</label>
              <select
                value={examForm.examType}
                onChange={(e) => setExamForm((p) => ({ ...p, examType: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="Mid-Term">Mid-Term</option>
                <option value="End-Term">End-Term</option>
                <option value="Practical">Practical</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Viva">Viva</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Exam Date"
                type="date"
                value={examForm.examDate}
                onChange={(e) => setExamForm((p) => ({ ...p, examDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Start Time"
                type="time"
                value={examForm.startTime}
                onChange={(e) => setExamForm((p) => ({ ...p, startTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Duration (Minutes)"
                type="number"
                value={examForm.duration}
                onChange={(e) => setExamForm((p) => ({ ...p, duration: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Exam Venue / Hall"
                type="text"
                placeholder="e.g. Auditorium Hall 2"
                value={examForm.venue}
                onChange={(e) => setExamForm((p) => ({ ...p, venue: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Maximum Marks"
                type="number"
                value={examForm.maxMarks}
                onChange={(e) => setExamForm((p) => ({ ...p, maxMarks: Number(e.target.value) }))}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Enter Academic Result / Marks"
        description="Record verified student performance into official academic transcripts"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsResultModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              loading={resultLoading}
              disabled={resultLoading}
              onClick={handleSaveResult}
            >
              Commit Marks
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Student <span className="text-rose-500">*</span>
              </label>
              <select
                value={resultForm.student}
                onChange={(e) => setResultForm((p) => ({ ...p, student: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                required
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={resultForm.course}
                onChange={(e) => setResultForm((p) => ({ ...p, course: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                required
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseCode} - {c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Assessment Title"
                type="text"
                placeholder="e.g. Mid-Term Examination"
                value={resultForm.assessmentName}
                onChange={(e) => setResultForm((p) => ({ ...p, assessmentName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Marks Obtained"
                type="number"
                step="0.5"
                value={resultForm.marksObtained}
                onChange={(e) => setResultForm((p) => ({ ...p, marksObtained: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Input
                label="Max Marks"
                type="number"
                value={resultForm.maxMarks}
                onChange={(e) => setResultForm((p) => ({ ...p, maxMarks: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={resultForm.published}
                onChange={(e) => setResultForm((p) => ({ ...p, published: e.target.checked }))}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Immediately Publish to Student Portal</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${deleteTarget?.name}?`}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600">This action will be committed to the database and logged.</p>
      </Modal>
    </div>
  );
};

export default AdminExaminations;
