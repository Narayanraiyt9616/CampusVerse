import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  Download,
  Eye,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  FileText,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  Printer,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import AlertBanner from '../../../components/common/AlertBanner';
import { admitCardService } from '../../../services/api';

export const StudentAdmitCardSection = ({ profile }) => {
  const [admitCards, setAdmitCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewCard, setPreviewCard] = useState(null);

  const fetchMyAdmitCards = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await admitCardService.getMyAdmitCards();
      if (res && res.success) {
        setAdmitCards(res.data || []);
      } else {
        setError(res?.error || 'Unable to retrieve your admit cards. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching student admit cards:', err);
      setError(err?.message || 'Failed to connect to the server. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyAdmitCards();
  }, [fetchMyAdmitCards]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="space-y-6">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. Header Banner & Instructions
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111827] text-white p-6 sm:p-7 border border-[#F1E7CF] shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D99A00]/20 border border-[#D99A00]/40 text-[#D99A00] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Office of the Controller of Examinations
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Examination Admit Cards & Hall Tickets
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify your registered examination schedules, download official digitally signed hall tickets,
              and check invigilation center instructions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
              leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchMyAdmitCards}
              disabled={loading}
            >
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Ambient Decorative Background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#D99A00]/10 blur-2xl pointer-events-none" />
      </div>

      {/* Error Banner */}
      {error && (
        <AlertBanner
          variant="danger"
          title="Error Loading Admit Cards"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          2. Loading State
      ────────────────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-44 rounded-2xl bg-[#FFF8E6]/40 animate-pulse border border-[#F1E7CF]" />
          <div className="h-44 rounded-2xl bg-[#FFF8E6]/40 animate-pulse border border-[#F1E7CF]" />
        </div>
      ) : admitCards.length === 0 ? (
        /* ──────────────────────────────────────────────────────────────────────────
            3. Clean Empty State (Exact Required Message)
        ────────────────────────────────────────────────────────────────────────── */
        <Card>
          <div className="py-14 px-4 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF8E6] border border-[#F1E7CF] text-[#D99A00] flex items-center justify-center mx-auto mb-4 shadow-xs">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-2">
              Your admit card has not been issued yet.
            </h3>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-6 font-medium">
              The Office of the Controller of Examinations issues admit cards once course registrations,
              minimum attendance criteria (75%), and institutional fee clearances have been verified.
              Newly published admit cards will automatically appear here.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={fetchMyAdmitCards}
              >
                Check for Updates
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────────
            4. Issued Admit Cards Grid / List
        ────────────────────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {admitCards.map((card) => {
            const hasSchedule = Array.isArray(card.examSchedule) && card.examSchedule.length > 0;
            const isReissued = card.status === 'Reissued';

            return (
              <div
                key={card._id}
                className="overflow-hidden rounded-2xl bg-white border border-[#F1E7CF] shadow-xs hover:border-[#D99A00]/60 transition-all duration-200"
              >
                {/* Top Card Banner */}
                <div className="px-5 sm:px-6 py-4 bg-[#FFF8E6]/60 border-b border-[#F1E7CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D99A00] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-[#111827]">
                          {card.examTitle || 'Semester Examination'}
                        </h3>
                        <Badge
                          variant={isReissued ? 'warning' : 'teal'}
                          size="sm"
                          hasDot
                        >
                          {card.status || 'Issued'}
                          {isReissued && card.reissueCount ? ` (Rev ${card.reissueCount})` : ''}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#4B5563] font-medium mt-0.5">
                        Session: <span className="font-bold text-[#111827]">{card.examSession}</span> • Semester:{' '}
                        <span className="font-bold text-[#111827]">{card.semester}</span>
                      </p>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Eye className="w-3.5 h-3.5 text-[#D99A00]" />}
                      onClick={() => setPreviewCard(card)}
                    >
                      Preview PDF
                    </Button>
                    <a
                      href={admitCardService.getDownloadUrl(card._id)}
                      download
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D99A00] text-white hover:bg-[#E5A900] shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Admit Card</span>
                    </a>
                  </div>
                </div>

                {/* Card Details Body */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Candidate & Exam Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FFF8E6]/25 border border-[#F1E7CF]">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">Student Name</span>
                      <p className="text-xs sm:text-sm font-extrabold text-[#111827] mt-0.5">
                        {card.studentName || profile?.name || 'Student Candidate'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">Roll / ID Number</span>
                      <p className="text-xs sm:text-sm font-mono font-bold text-[#D99A00] mt-0.5">
                        {card.studentId || profile?.studentId || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">Department</span>
                      <p className="text-xs sm:text-sm font-semibold text-[#111827] mt-0.5">
                        {card.departmentName || profile?.department?.name || 'Engineering'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">Examination Window</span>
                      <p className="text-xs sm:text-sm font-semibold text-[#111827] mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D99A00]" />
                        {card.examDate || 'Scheduled Window'}
                      </p>
                    </div>
                  </div>

                  {/* Subject Examination Schedule (if populated) */}
                  {hasSchedule && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#D99A00]" />
                          Registered Examination Papers & Venue
                        </span>
                        <span className="text-[11px] font-mono text-[#4B5563] font-semibold">
                          Total Papers: {card.examSchedule.length}
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-[#F1E7CF]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FFF8E6] text-[#111827] font-bold border-b border-[#F1E7CF]">
                            <tr>
                              <th className="px-3.5 py-2.5">Paper Code</th>
                              <th className="px-3.5 py-2.5">Course / Subject Name</th>
                              <th className="px-3.5 py-2.5">Exam Date</th>
                              <th className="px-3.5 py-2.5">Time Slot</th>
                              <th className="px-3.5 py-2.5">Examination Hall</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F1E7CF]">
                            {card.examSchedule.map((paper, idx) => (
                              <tr key={idx} className="hover:bg-[#FFF8E6]/20 transition-colors">
                                <td className="px-3.5 py-2.5 font-mono font-bold text-[#D99A00]">
                                  {paper.paperCode || '—'}
                                </td>
                                <td className="px-3.5 py-2.5 font-semibold text-[#111827]">
                                  {paper.paperName || '—'}
                                </td>
                                <td className="px-3.5 py-2.5 text-[#4B5563] font-medium">
                                  {formatDate(paper.examDate)}
                                </td>
                                <td className="px-3.5 py-2.5 text-[#4B5563] font-medium">
                                  {paper.timeSlot || '09:30 AM - 12:30 PM'}
                                </td>
                                <td className="px-3.5 py-2.5 text-[#111827] font-semibold">
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#D99A00]" />
                                    {paper.venue || 'Main Academic Block'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Hall Instructions & Issue Info */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#4B5563] space-y-1">
                    <p className="font-bold text-[#111827] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#D99A00]" />
                      Candidate Hall Instructions:
                    </p>
                    <p className="leading-relaxed">
                      {card.remarks ||
                        '1. Candidate must report to the examination hall 30 minutes prior to commencement with a physical printed copy of this admit card and valid Student ID card. 2. Electronic devices, smartwatches, and unauthorized papers are strictly prohibited.'}
                    </p>
                    <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#4B5563] border-t border-slate-200 mt-2">
                      <span>Issued on: {formatDate(card.issueDate || card.createdAt)}</span>
                      <span className="font-mono text-[#D99A00] font-bold">
                        Digital Verification Hash: {card._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#F1E7CF]">
                    <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Certified by Controller of Examinations, CampusVerse AI</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Eye className="w-3.5 h-3.5 text-[#D99A00]" />}
                        onClick={() => setPreviewCard(card)}
                      >
                        Preview PDF
                      </Button>
                      <a
                        href={admitCardService.getDownloadUrl(card._id)}
                        download
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#D99A00] text-white hover:bg-[#E5A900] shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Admit Card</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          5. In-App PDF Preview Modal
      ────────────────────────────────────────────────────────────────────────── */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#F1E7CF]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#111827] text-white border-b border-[#F1E7CF]">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-[#D99A00]" />
                <div>
                  <h3 className="font-bold text-sm">
                    {previewCard.examTitle || 'Examination Admit Card'}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-mono">
                    Candidate: {previewCard.studentName} ({previewCard.studentId}) • {previewCard.examSession}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={admitCardService.getDownloadUrl(previewCard._id)}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D99A00] text-white hover:bg-[#E5A900] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewCard(null)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="flex-1 min-h-[500px] bg-slate-100">
              <iframe
                title="Student Admit Card Preview"
                src={admitCardService.getPreviewUrl(previewCard._id)}
                className="w-full h-full min-h-[550px] border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAdmitCardSection;
