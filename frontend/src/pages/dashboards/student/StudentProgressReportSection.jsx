import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Download,
  Award,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Layers,
  Percent,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import { studentService } from '../../../services/api';
import { formatPercent } from '../../../utils/formatters';

export const StudentProgressReportSection = ({ profile }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, assignments, midterms, internals, practicals

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentService.getAcademicProgress();
      if (res?.success && res?.report) {
        setProgressData(res.report);
      } else {
        setError('Failed to fetch academic progress records.');
      }
    } catch (err) {
      setError(err?.message || 'Error communicating with academic progress service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleDownloadReport = () => {
    if (!progressData) return;
    setDownloading(true);

    try {
      const student = progressData.student || {};
      const summary = progressData.summary || {};
      const assignmentMarks = progressData.assignmentMarks || [];
      const midtermMarks = progressData.midtermMarks || [];
      const internalMarks = progressData.internalAssessmentMarks || [];
      const practicalMarks = progressData.practicalMarks || [];
      const subjectPerformance = progressData.subjectPerformance || [];

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download or print your progress report.');
        setDownloading(false);
        return;
      }

      const renderRows = (items) => {
        if (!items || items.length === 0) {
          return '<tr><td colspan="5" style="padding: 12px; text-align: center; color: #6B7280;">No records available.</td></tr>';
        }
        return items.map((it, idx) => {
          const isPending = it.marksObtained === null || it.marksObtained === undefined;
          return `
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 9px; font-weight: 600; color: #111827;">${idx + 1}</td>
              <td style="padding: 9px; font-weight: bold; color: #111827;">
                ${it.title || it.assessmentName}
                <div style="font-size: 11px; color: #6B7280; font-weight: normal;">${it.subject} ${it.courseCode ? `(${it.courseCode})` : ''}</div>
              </td>
              <td style="padding: 9px; text-align: center; color: #374151;">${it.maxMarks ?? 100}</td>
              <td style="padding: 9px; text-align: center; font-weight: bold; color: ${isPending ? '#D97706' : '#111827'};">
                ${isPending ? 'Pending' : it.marksObtained}
              </td>
              <td style="padding: 9px; text-align: center;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; background: ${isPending ? '#FEF3C7' : '#ECFDF5'}; color: ${isPending ? '#92400E' : '#065F46'};">
                  ${isPending ? 'PENDING' : 'EVALUATED'}
                </span>
              </td>
            </tr>
          `;
        }).join('');
      };

      const subjectRows = subjectPerformance.map((s, idx) => `
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 9px; font-weight: 600; color: #111827;">${idx + 1}</td>
          <td style="padding: 9px; font-weight: bold; color: #111827;">${s.subject}</td>
          <td style="padding: 9px; text-align: center;">${s.totalObtainedMarks} / ${s.totalMaxMarks}</td>
          <td style="padding: 9px; text-align: center; font-weight: bold; color: #D99A00;">
            ${s.percentage !== null ? `${s.percentage}%` : 'Pending Evaluation'}
          </td>
          <td style="padding: 9px; text-align: center; color: #6B7280; font-size: 11px;">
            ${s.evaluatedCount} Evaluated &bull; ${s.pendingCount} Pending
          </td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Academic Progress Report - ${student.studentId || 'Student'}</title>
          <style>
            @media print {
              body { margin: 0; padding: 15px; font-family: 'Segoe UI', Arial, sans-serif; }
              .no-print { display: none !important; }
            }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; padding: 25px; max-width: 900px; margin: 0 auto; }
            .header { border-bottom: 3px solid #D99A00; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title-area h1 { margin: 0; color: #111827; font-size: 22px; font-weight: 800; }
            .title-area p { margin: 3px 0 0; color: #6B7280; font-size: 12px; }
            .meta-box { background: #FFFDF5; border: 1px solid #F1E7CF; border-radius: 8px; padding: 14px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px; }
            .meta-item strong { display: block; color: #6B7280; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
            .meta-item span { font-weight: 700; color: #111827; }
            .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .summary-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px; text-align: center; }
            .summary-card strong { display: block; font-size: 10px; color: #6B7280; text-transform: uppercase; }
            .summary-card p { margin: 4px 0 0; font-size: 18px; font-weight: 800; font-family: monospace; }
            h3 { font-size: 14px; font-weight: 700; margin: 20px 0 8px; color: #111827; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
            th { background: #FFF8E6; color: #78350F; text-align: left; padding: 8px 10px; font-size: 11px; font-weight: 700; border-bottom: 2px solid #FDE68A; }
            .footer { margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 10px; font-size: 10px; color: #9CA3AF; display: flex; justify-content: space-between; }
            .print-btn { background: #D99A00; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right;">
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
          </div>
          <div class="header">
            <div class="title-area">
              <h1>CampusVerse AI — Comprehensive Academic Progress Report</h1>
              <p>Official Student Academic Transcript & Evaluation Summary</p>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; background: #FFF8E6; color: #D99A00; border: 1px solid #F1E7CF;">
                GRADE: ${summary.grade || 'N/A'}
              </span>
            </div>
          </div>

          <div class="meta-box">
            <div class="meta-item"><strong>Student Name</strong><span>${student.name || 'Student'}</span></div>
            <div class="meta-item"><strong>Student ID / Roll No</strong><span>${student.studentId || '—'}</span></div>
            <div class="meta-item"><strong>Department & Sem</strong><span>${student.department || 'Department'} &bull; Sem ${student.semester || 1}</span></div>
            <div class="meta-item"><strong>Academic Session</strong><span>${student.academicSession || '2025-2026'}</span></div>
            <div class="meta-item"><strong>Evaluated Components</strong><span>${summary.totalEvaluatedCount || 0}</span></div>
            <div class="meta-item"><strong>Report Generated</strong><span>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>

          <div class="summary-cards">
            <div class="summary-card">
              <strong>Evaluated Components</strong>
              <p style="color: #047857;">${summary.totalEvaluatedCount || 0}</p>
            </div>
            <div class="summary-card">
              <strong>Pending Evaluations</strong>
              <p style="color: #D97706;">${summary.totalPendingCount || 0}</p>
            </div>
            <div class="summary-card">
              <strong>Total Marks Obtained</strong>
              <p style="color: #111827;">${summary.grandObtainedMarks || 0} / ${summary.grandMaxMarks || 0}</p>
            </div>
            <div class="summary-card" style="background: #FFFDF5; border-color: #F1E7CF;">
              <strong style="color: #D99A00;">Overall Progress</strong>
              <p style="color: #D99A00;">${summary.overallPercentage !== null ? `${summary.overallPercentage}%` : 'Pending'}</p>
            </div>
          </div>

          <h3>1. Assignment Evaluations</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Assignment Title & Subject</th>
                <th style="text-align: center;">Max Marks</th>
                <th style="text-align: center;">Marks Obtained</th>
                <th style="text-align: center;">Evaluation Status</th>
              </tr>
            </thead>
            <tbody>
              ${renderRows(assignmentMarks)}
            </tbody>
          </table>

          <h3>2. Midterm & Examination Marks</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Examination Name & Subject</th>
                <th style="text-align: center;">Max Marks</th>
                <th style="text-align: center;">Marks Obtained</th>
                <th style="text-align: center;">Evaluation Status</th>
              </tr>
            </thead>
            <tbody>
              ${renderRows(midtermMarks)}
            </tbody>
          </table>

          <h3>3. Internal Assessments & Quizzes</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Assessment & Subject</th>
                <th style="text-align: center;">Max Marks</th>
                <th style="text-align: center;">Marks Obtained</th>
                <th style="text-align: center;">Evaluation Status</th>
              </tr>
            </thead>
            <tbody>
              ${renderRows(internalMarks)}
            </tbody>
          </table>

          <h3>4. Practical, Laboratory & Project Marks</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Practical / Lab / Project Name</th>
                <th style="text-align: center;">Max Marks</th>
                <th style="text-align: center;">Marks Obtained</th>
                <th style="text-align: center;">Evaluation Status</th>
              </tr>
            </thead>
            <tbody>
              ${renderRows(practicalMarks)}
            </tbody>
          </table>

          <h3>5. Subject-wise Cumulative Performance</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Subject</th>
                <th style="text-align: center;">Cumulative Marks</th>
                <th style="text-align: center;">Percentage</th>
                <th style="text-align: center;">Components</th>
              </tr>
            </thead>
            <tbody>
              ${subjectRows || '<tr><td colspan="5" style="text-align: center; padding: 12px; color: #6B7280;">No subject summaries.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <span>Verified Institutional Record &bull; CampusVerse AI Automated Academic Engine</span>
            <span>Page 1 of 1 &bull; Generated: ${new Date().toLocaleDateString()}</span>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (e) {
      console.error('Error generating progress report:', e);
    } finally {
      setDownloading(false);
    }
  };

  const student = progressData?.student || {};
  const summary = progressData?.summary || {
    totalEvaluatedCount: 0,
    totalPendingCount: 0,
    grandMaxMarks: 0,
    grandObtainedMarks: 0,
    overallPercentage: null,
    grade: 'N/A',
  };

  const assignmentMarks = progressData?.assignmentMarks || [];
  const midtermMarks = progressData?.midtermMarks || [];
  const internalMarks = progressData?.internalAssessmentMarks || [];
  const practicalMarks = progressData?.practicalMarks || [];
  const subjectPerformance = progressData?.subjectPerformance || [];

  const genericColumns = [
    {
      key: 'name',
      header: 'Component & Subject',
      render: (_, r) => (
        <div>
          <p className="font-bold text-xs text-[#111827] leading-snug">{r.title || r.assessmentName}</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5 font-medium">
            {r.subject} {r.courseCode ? `(${r.courseCode})` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'maxMarks',
      header: 'Max Marks',
      render: (v) => <span className="text-xs font-mono font-bold text-[#111827]">{v ?? 100}</span>,
    },
    {
      key: 'marksObtained',
      header: 'Marks Obtained',
      render: (v) => {
        if (v === null || v === undefined) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Pending / Not Evaluated
            </span>
          );
        }
        return <span className="text-xs font-mono font-extrabold text-[#D99A00]">{v}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (v, r) => {
        const isEvaluated = r.marksObtained !== null && r.marksObtained !== undefined;
        return (
          <Badge variant={isEvaluated ? 'teal' : 'warning'} size="sm" hasDot>
            {isEvaluated ? 'Evaluated' : 'Pending Evaluation'}
          </Badge>
        );
      },
    },
    {
      key: 'feedback',
      header: 'Remarks / Feedback',
      render: (v) =>
        v ? (
          <span className="text-xs text-[#4B5563] italic font-medium">{v}</span>
        ) : (
          <span className="text-xs text-[#9CA3AF]">—</span>
        ),
    },
  ];

  return (
    <section id="progress-report" className="scroll-mt-20 space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111827]">Academic Progress Report</h2>
            <Badge variant="teal" size="sm">Comprehensive</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 font-medium">
            Assignments, midterms, internal assessments, lab performance, and overall calculations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchProgress}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            onClick={handleDownloadReport}
            disabled={loading || !progressData}
          >
            {downloading ? 'Preparing Report...' : 'Download Progress Report'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Student Meta Details */}
      {progressData && (
        <div className="p-4 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Student Name</span>
              <span className="font-bold text-[#111827] mt-0.5 block">{student.name || profile?.name || 'Student'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Roll No / Student ID</span>
              <span className="font-mono font-bold text-[#D99A00] mt-0.5 block">{student.studentId || profile?.studentId || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Department</span>
              <span className="font-semibold text-[#111827] mt-0.5 block">{student.department || 'CSE'} &bull; Sem {student.semester || 1}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Session</span>
              <span className="font-semibold text-[#111827] mt-0.5 block">{student.academicSession || '2025-2026'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Evaluated Assessments',
            value: summary.totalEvaluatedCount,
            sub: 'Scores confirmed by faculty',
            color: 'text-emerald-700',
          },
          {
            label: 'Pending Evaluations',
            value: summary.totalPendingCount,
            sub: 'Awaiting faculty evaluation',
            color: 'text-amber-700',
          },
          {
            label: 'Marks Cumulative',
            value: `${summary.grandObtainedMarks}/${summary.grandMaxMarks}`,
            sub: 'Evaluated total marks',
            color: 'text-[#111827]',
          },
          {
            label: 'Overall Average',
            value: summary.overallPercentage !== null ? formatPercent(summary.overallPercentage) : 'Pending',
            sub: `Academic Grade: ${summary.grade}`,
            color: 'text-[#D99A00]',
          },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-center shadow-xs">
            <p className="text-[11px] text-[#4B5563] font-bold uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-extrabold font-mono mt-1.5 ${c.color}`}>{c.value}</p>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#F1E7CF] pb-3">
        {[
          { id: 'all', label: 'All Evaluations' },
          { id: 'assignments', label: `Assignments (${assignmentMarks.length})` },
          { id: 'midterms', label: `Midterms & Exams (${midtermMarks.length})` },
          { id: 'internals', label: `Internal Assessments (${internalMarks.length})` },
          { id: 'practicals', label: `Practicals & Projects (${practicalMarks.length})` },
          { id: 'subjects', label: `Subject Breakdown (${subjectPerformance.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === t.id
                ? 'bg-[#D99A00] text-white shadow-xs'
                : 'bg-white border border-[#F1E7CF] text-[#4B5563] hover:bg-[#FFF8E6]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tables based on selected tab */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-[#D99A00] animate-spin" />
          <p className="text-xs text-[#4B5563] font-medium">Aggregating academic records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(activeTab === 'all' || activeTab === 'assignments') && (
            <Card
              title="Assignment Marks & Evaluations"
              subtitle="Assignments created by faculty with submission & grading details"
              badge={<Badge variant="neutral" size="sm">{assignmentMarks.length} Total</Badge>}
            >
              {assignmentMarks.length === 0 ? (
                <p className="text-xs text-center py-6 text-[#6B7280]">No assignment records available.</p>
              ) : (
                <Table columns={genericColumns} data={assignmentMarks} keyField="title" />
              )}
            </Card>
          )}

          {(activeTab === 'all' || activeTab === 'midterms') && (
            <Card
              title="Midterm Examination Marks"
              subtitle="Published examination evaluations"
              badge={<Badge variant="neutral" size="sm">{midtermMarks.length} Total</Badge>}
            >
              {midtermMarks.length === 0 ? (
                <p className="text-xs text-center py-6 text-[#6B7280]">No midterm marks published yet.</p>
              ) : (
                <Table columns={genericColumns} data={midtermMarks} keyField="assessmentName" />
              )}
            </Card>
          )}

          {(activeTab === 'all' || activeTab === 'internals') && (
            <Card
              title="Internal Assessment & Quiz Marks"
              subtitle="Continuous assessment scores recorded by course faculty"
              badge={<Badge variant="neutral" size="sm">{internalMarks.length} Total</Badge>}
            >
              {internalMarks.length === 0 ? (
                <p className="text-xs text-center py-6 text-[#6B7280]">No internal assessments recorded yet.</p>
              ) : (
                <Table columns={genericColumns} data={internalMarks} keyField="assessmentName" />
              )}
            </Card>
          )}

          {(activeTab === 'all' || activeTab === 'practicals') && (
            <Card
              title="Practical, Laboratory & Project Marks"
              subtitle="Laboratory coursework and project evaluations"
              badge={<Badge variant="neutral" size="sm">{practicalMarks.length} Total</Badge>}
            >
              {practicalMarks.length === 0 ? (
                <p className="text-xs text-center py-6 text-[#6B7280]">No practical or laboratory marks recorded yet.</p>
              ) : (
                <Table columns={genericColumns} data={practicalMarks} keyField="assessmentName" />
              )}
            </Card>
          )}

          {(activeTab === 'all' || activeTab === 'subjects') && (
            <Card
              title="Subject-wise Overall Performance Summary"
              subtitle="Calculated cumulative scores per subject across all assessments"
            >
              {subjectPerformance.length === 0 ? (
                <p className="text-xs text-center py-6 text-[#6B7280]">No subject summaries available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectPerformance.map((sub, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-[#F1E7CF] bg-[#FFFDF5]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111827]">{sub.subject}</span>
                        <span className="font-mono text-xs font-extrabold text-[#D99A00]">
                          {sub.percentage !== null ? `${sub.percentage}%` : 'Pending'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-[#4B5563]">
                        <span>Total Marks: {sub.totalObtainedMarks} / {sub.totalMaxMarks}</span>
                        <span>{sub.evaluatedCount} Evaluated &bull; {sub.pendingCount} Pending</span>
                      </div>
                      {sub.percentage !== null && (
                        <div className="w-full bg-[#FFF8E6] rounded-full h-1.5 mt-2.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#D99A00]"
                            style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </section>
  );
};

export default StudentProgressReportSection;
