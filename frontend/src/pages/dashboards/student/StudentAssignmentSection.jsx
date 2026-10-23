import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { assignmentService, studentService } from '../../../services/api';
import { formatDate } from '../../../utils/formatters';

export const StudentAssignmentSection = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'exams'
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // all, pending, submitted, evaluated, overdue

  // Data states
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Submission modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

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

  const handleOpenSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText(assignment.submission?.submissionText || '');
    setSelectedFile(null);
    setModalError('');
  };

  const handleCloseModal = () => {
    setSelectedAssignment(null);
    setSubmissionText('');
    setSelectedFile(null);
    setModalError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setModalError('File size exceeds the 25 MB limit.');
        return;
      }
      setSelectedFile(file);
      setModalError('');
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    if (!submissionText.trim() && !selectedFile) {
      setModalError('Please upload a solution file or provide your submission notes / answer.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const formData = new FormData();
      if (submissionText.trim()) {
        formData.append('submissionText', submissionText.trim());
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await assignmentService.submitAssignment(selectedAssignment._id, formData);
      if (res?.success) {
        setSuccessMsg(res.message || 'Assignment submitted successfully!');
        handleCloseModal();
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setModalError(res?.error || 'Failed to submit assignment.');
      }
    } catch (err) {
      setModalError(err?.message || err?.error || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    if (assignmentFilter === 'all') return true;
    if (assignmentFilter === 'pending') return a.submissionStatus === 'Pending';
    if (assignmentFilter === 'submitted') return a.submissionStatus === 'Submitted' || a.submissionStatus === 'Late Submitted';
    if (assignmentFilter === 'evaluated') return a.submissionStatus === 'Evaluated';
    if (assignmentFilter === 'overdue') return a.submissionStatus === 'Overdue';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Evaluated':
        return <Badge variant="teal" size="sm" hasDot>Evaluated</Badge>;
      case 'Submitted':
        return <Badge variant="teal" size="sm" hasDot>Submitted</Badge>;
      case 'Late Submitted':
        return <Badge variant="warning" size="sm" hasDot>Late Submitted</Badge>;
      case 'Overdue':
        return <Badge variant="danger" size="sm" hasDot>Overdue</Badge>;
      default:
        return <Badge variant="warning" size="sm" hasDot>Pending Submission</Badge>;
    }
  };

  return (
    <section id="assignments-section" className="scroll-mt-20 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111827]">Assignments & Examination Central</h2>
            <Badge variant="teal" size="sm">Course Synced</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 font-medium">
            Complete active coursework submissions and view published exam timetables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
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
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-bold">
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
          Assignments & Tasks ({assignments.length})
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
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All Tasks (${assignments.length})` },
              { id: 'pending', label: `Pending (${assignments.filter((a) => a.submissionStatus === 'Pending').length})` },
              { id: 'submitted', label: `Submitted (${assignments.filter((a) => a.submissionStatus === 'Submitted' || a.submissionStatus === 'Late Submitted').length})` },
              { id: 'evaluated', label: `Evaluated (${assignments.filter((a) => a.submissionStatus === 'Evaluated').length})` },
              { id: 'overdue', label: `Overdue (${assignments.filter((a) => a.submissionStatus === 'Overdue').length})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAssignmentFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  assignmentFilter === f.id
                    ? 'bg-[#D99A00] text-white shadow-xs'
                    : 'bg-white border border-[#F1E7CF] text-[#4B5563] hover:bg-[#FFF8E6]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-[#D99A00] animate-spin" />
              <p className="text-xs text-[#4B5563] font-medium">Fetching course assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-[#F1E7CF] rounded-2xl bg-[#FFFDF5]">
              <ClipboardList className="w-10 h-10 text-[#D99A00] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#111827]">No assignments found for this filter</p>
              <p className="text-xs text-[#4B5563] mt-1">Coursework assigned by faculty will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAssignments.map((asgn) => {
                const isOverdue = asgn.submissionStatus === 'Overdue';
                const isEvaluated = asgn.submissionStatus === 'Evaluated';
                const isSubmitted = asgn.isSubmitted;

                return (
                  <div
                    key={asgn._id}
                    className="p-5 rounded-2xl bg-white border border-[#F1E7CF] hover:border-[#D99A00]/60 transition-all shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(asgn.submissionStatus)}
                          <span className="text-xs font-bold text-[#D99A00] bg-[#FFF8E6] px-2.5 py-0.5 rounded-md border border-[#F1E7CF]">
                            {asgn.course?.courseCode || 'Course'} &bull; {asgn.course?.title || ''}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#111827]">
                            Max Marks: {asgn.maxMarks || 100}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-[#111827]">{asgn.title}</h3>

                        {asgn.description && (
                          <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
                            {asgn.description}
                          </p>
                        )}

                        {asgn.instructions && (
                          <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs">
                            <span className="font-bold text-[#D99A00] uppercase tracking-wider text-[10px] block mb-0.5">
                              Faculty Instructions
                            </span>
                            <p className="text-[#374151] font-medium leading-relaxed whitespace-pre-line">
                              {asgn.instructions}
                            </p>
                          </div>
                        )}

                        {/* Submission / Evaluation Feedback banner */}
                        {isEvaluated && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                            <div className="flex items-center justify-between font-bold text-emerald-900">
                              <span>Marks Awarded: {asgn.marksObtained} / {asgn.maxMarks || 100}</span>
                              <Badge variant="teal" size="sm">Graded</Badge>
                            </div>
                            {asgn.feedback && (
                              <p className="mt-1 text-emerald-800 text-xs font-medium">
                                <strong>Feedback:</strong> {asgn.feedback}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Attached solution file link */}
                        {asgn.submission?.file?.url && (
                          <div className="flex items-center gap-2 text-xs pt-1">
                            <span className="text-[#4B5563] font-medium">Submitted File:</span>
                            <a
                              href={asgn.submission.file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#D99A00] hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              {asgn.submission.file.originalName || 'Download Uploaded Submission'}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right: Meta & Actions */}
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F1E7CF]">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider block">
                            Submission Deadline
                          </span>
                          <span
                            className={`text-xs font-mono font-bold flex items-center gap-1 mt-0.5 ${
                              isOverdue ? 'text-red-600' : 'text-[#111827]'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-[#D99A00]" />
                            {new Date(asgn.dueDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {asgn.faculty?.name && (
                            <span className="text-[11px] text-[#6B7280] block mt-0.5 font-medium">
                              By {asgn.faculty.name}
                            </span>
                          )}
                        </div>

                        <Button
                          variant={isSubmitted ? 'secondary' : 'primary'}
                          size="sm"
                          leftIcon={isSubmitted ? <Eye className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                          onClick={() => handleOpenSubmitModal(asgn)}
                        >
                          {isSubmitted ? 'View / Update' : isOverdue ? 'Submit Late' : 'Open & Submit'}
                        </Button>
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
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-[#D99A00] animate-spin" />
              <p className="text-xs text-[#4B5563] font-medium">Fetching examination schedules...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-[#F1E7CF] rounded-2xl bg-[#FFFDF5]">
              <Calendar className="w-10 h-10 text-[#D99A00] mx-auto mb-2 opacity-60" />
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
                  className="p-5 rounded-2xl bg-white border border-[#F1E7CF] hover:border-[#D99A00]/60 transition-all shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#D99A00] uppercase tracking-wider bg-[#FFF8E6] px-2 py-0.5 rounded border border-[#F1E7CF]">
                        {ex.examType || 'Exam'}
                      </span>
                      <h3 className="text-base font-extrabold text-[#111827] mt-1.5">{ex.title}</h3>
                      <p className="text-xs font-semibold text-[#4B5563]">{ex.subject}</p>
                    </div>
                    <Badge variant="teal" size="sm">Sem {ex.semester}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Exam Date & Time</span>
                      <span className="font-mono font-bold text-[#111827] mt-0.5 block">
                        {ex.examDate} &bull; {ex.startTime}
                      </span>
                      <span className="text-[10px] text-[#6B7280]">Duration: {ex.duration} mins</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Venue & Max Marks</span>
                      <span className="font-semibold text-[#111827] mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D99A00]" />
                        {ex.venue || 'Examination Hall'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-[#D99A00]">
                        Max Marks: {ex.maxMarks}
                      </span>
                    </div>
                  </div>

                  {ex.instructions && (
                    <div className="text-xs">
                      <span className="font-bold text-[#111827] text-[11px] block mb-0.5">Examination Instructions:</span>
                      <p className="text-[#4B5563] text-xs font-medium leading-relaxed whitespace-pre-line">
                        {ex.instructions}
                      </p>
                    </div>
                  )}

                  {ex.faculty?.name && (
                    <div className="text-[11px] text-[#9CA3AF] pt-1 border-t border-[#F1E7CF]">
                      Published by: <span className="font-semibold text-[#4B5563]">{ex.faculty.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={handleCloseModal}
          title={`Submit Assignment: ${selectedAssignment.title}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-[#111827]">
                <span>Course: {selectedAssignment.course?.title || selectedAssignment.course?.courseCode}</span>
                <span className="font-mono text-[#D99A00]">Max Marks: {selectedAssignment.maxMarks || 100}</span>
              </div>
              <div className="text-[#6B7280]">
                Deadline: {new Date(selectedAssignment.dueDate).toLocaleString('en-IN')}
              </div>
              {selectedAssignment.instructions && (
                <div className="mt-2 pt-2 border-t border-[#F1E7CF]">
                  <strong className="text-[#D99A00] block text-[10px] uppercase">Instructions:</strong>
                  <p className="text-[#374151] mt-0.5 leading-relaxed">{selectedAssignment.instructions}</p>
                </div>
              )}
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {modalError}
              </div>
            )}

            {/* Previous Submission Status */}
            {selectedAssignment.isSubmitted && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold block">Current Submission Status:</span>
                <div>
                  Submitted On: {new Date(selectedAssignment.submittedAt).toLocaleString('en-IN')}
                </div>
                {selectedAssignment.submission?.file && (
                  <div className="flex items-center gap-1 font-semibold text-[#D99A00]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Uploaded: {selectedAssignment.submission.file.originalName}</span>
                  </div>
                )}
                <p className="text-[11px] text-blue-700 pt-1">
                  You can submit a new file or updated notes below to replace your previous submission.
                </p>
              </div>
            )}

            {/* File Upload Input */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Upload Solution File (.pdf, .docx, .zip, .txt, .png)
              </label>
              <div className="border-2 border-dashed border-[#F1E7CF] hover:border-[#D99A00] rounded-xl p-4 text-center cursor-pointer bg-[#FFFDF5] transition-all">
                <input
                  type="file"
                  id="asgn-file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <label htmlFor="asgn-file-input" className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-[#D99A00] mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-[#111827] block">
                    {selectedFile ? selectedFile.name : 'Click to select solution file from device'}
                  </span>
                  <span className="text-[11px] text-[#6B7280] block mt-0.5">
                    Maximum allowed file size: 25 MB
                  </span>
                </label>
              </div>
            </div>

            {/* Text Notes / Repository Link Input */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Submission Notes / Project Link / Answers
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter submission notes, deployment link, repository URL, or text answers here..."
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1E7CF]">
              <Button variant="secondary" size="sm" type="button" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                disabled={submitting}
              >
                {submitting ? 'Uploading & Submitting...' : selectedAssignment.isSubmitted ? 'Update Submission' : 'Submit Assignment'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default StudentAssignmentSection;
