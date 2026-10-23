import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Download,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  FileText,
  Printer,
  Loader2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import { studentService } from '../../../services/api';
import { formatPercent } from '../../../utils/formatters';

export const StudentAttendanceSection = ({ profile }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await studentService.getAttendanceReport();
      if (res?.success && res?.report) {
        setReportData(res.report);
      } else {
        setError('Failed to fetch attendance records.');
      }
    } catch (err) {
      setError(err?.message || 'Error communicating with attendance service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleDownloadReport = () => {
    if (!reportData) return;
    setDownloading(true);

    try {
      const student = reportData.student || {};
      const summary = reportData.summary || {};
      const subjects = reportData.subjects || [];

      // Create an elegant printable report window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download or print your attendance report.');
        setDownloading(false);
        return;
      }

      const rowsHtml = subjects.map((sub, idx) => `
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 10px; font-weight: 600; color: #111827;">${idx + 1}</td>
          <td style="padding: 10px; font-weight: bold; color: #111827;">${sub.subject}</td>
          <td style="padding: 10px; text-align: center; color: #374151;">${sub.conducted}</td>
          <td style="padding: 10px; text-align: center; color: #047857; font-weight: bold;">${sub.attended}</td>
          <td style="padding: 10px; text-align: center; color: #B91C1C;">${sub.missed}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold; color: ${sub.percentage >= 75 ? '#047857' : '#B91C1C'};">${sub.percentage}%</td>
          <td style="padding: 10px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: ${sub.percentage >= 75 ? '#ECFDF5' : '#FEF2F2'}; color: ${sub.percentage >= 75 ? '#065F46' : '#991B1B'};">
              ${sub.percentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE'}
            </span>
          </td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Attendance Report - ${student.studentId || 'Student'}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; }
              .no-print { display: none !important; }
            }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; padding: 30px; max-width: 900px; margin: 0 auto; }
            .header { border-bottom: 3px solid #D99A00; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .title-area h1 { margin: 0; color: #111827; font-size: 24px; font-weight: 800; }
            .title-area p { margin: 4px 0 0; color: #6B7280; font-size: 13px; }
            .meta-box { background: #FFFDF5; border: 1px solid #F1E7CF; border-radius: 8px; padding: 16px; margin-bottom: 25px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 13px; }
            .meta-item strong { display: block; color: #6B7280; font-size: 11px; text-transform: uppercase; margin-bottom: 2px; }
            .meta-item span { font-weight: 700; color: #111827; }
            .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
            .summary-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px; text-align: center; }
            .summary-card strong { display: block; font-size: 11px; color: #6B7280; text-transform: uppercase; }
            .summary-card p { margin: 5px 0 0; font-size: 20px; font-weight: 800; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background: #FFF8E6; color: #78350F; text-align: left; padding: 10px; font-size: 12px; font-weight: 700; border-bottom: 2px solid #FDE68A; }
            .footer { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 15px; font-size: 11px; color: #9CA3AF; display: flex; justify-content: space-between; }
            .print-btn { background: #D99A00; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align: right;">
            <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
          </div>
          <div class="header">
            <div class="title-area">
              <h1>CampusVerse AI — Official Attendance Report</h1>
              <p>Academic Affairs & Student Regularity Tracking</p>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: ${summary.isEligibleForExams ? '#ECFDF5' : '#FEF2F2'}; color: ${summary.isEligibleForExams ? '#065F46' : '#991B1B'}; border: 1px solid ${summary.isEligibleForExams ? '#A7F3D0' : '#FECACA'};">
                ${summary.isEligibleForExams ? 'EXAMINATION ELIGIBLE' : 'SHORT ATTENDANCE DETRACTOR'}
              </span>
            </div>
          </div>

          <div class="meta-box">
            <div class="meta-item"><strong>Student Name</strong><span>${student.name || 'Student'}</span></div>
            <div class="meta-item"><strong>Student ID / Roll No</strong><span>${student.studentId || '—'}</span></div>
            <div class="meta-item"><strong>Department</strong><span>${student.department || 'Department'}</span></div>
            <div class="meta-item"><strong>Current Semester</strong><span>Semester ${student.semester || 1}</span></div>
            <div class="meta-item"><strong>Academic Session</strong><span>${student.academicYear || '2025-2026'}</span></div>
            <div class="meta-item"><strong>Report Generated</strong><span>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>

          <div class="summary-cards">
            <div class="summary-card">
              <strong>Classes Conducted</strong>
              <p style="color: #111827;">${summary.totalConducted || 0}</p>
            </div>
            <div class="summary-card">
              <strong>Classes Attended</strong>
              <p style="color: #047857;">${summary.totalAttended || 0}</p>
            </div>
            <div class="summary-card">
              <strong>Classes Missed</strong>
              <p style="color: #B91C1C;">${summary.totalMissed || 0}</p>
            </div>
            <div class="summary-card" style="background: #FFFDF5; border-color: #F1E7CF;">
              <strong style="color: #D99A00;">Overall Attendance</strong>
              <p style="color: #D99A00;">${summary.overallPercentage ?? 0}%</p>
            </div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; margin: 20px 0 10px; color: #111827;">Subject-wise Attendance Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Subject Name</th>
                <th style="text-align: center;">Conducted</th>
                <th style="text-align: center;">Attended</th>
                <th style="text-align: center;">Missed</th>
                <th style="text-align: right;">Percentage</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="7" style="text-align: center; padding: 20px; color: #6B7280;">No attendance records found.</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <span>Verified System Record &bull; CampusVerse AI University Portal</span>
            <span>Page 1 of 1 &bull; ${new Date().toLocaleDateString()}</span>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (e) {
      console.error('Error generating attendance report:', e);
    } finally {
      setDownloading(false);
    }
  };

  const student = reportData?.student || {};
  const summary = reportData?.summary || {
    totalConducted: 0,
    totalAttended: 0,
    totalMissed: 0,
    overallPercentage: 0,
    isEligibleForExams: false,
  };
  const subjects = reportData?.subjects || [];

  const shortageSubjects = subjects.filter((s) => s.percentage < 75);
  const advisorySubjects = subjects.filter((s) => s.percentage >= 75 && s.percentage < 85);

  const columns = [
    {
      key: 'subject',
      header: 'Subject Name',
      render: (v) => <span className="font-bold text-xs text-[#111827]">{v}</span>,
    },
    {
      key: 'conducted',
      header: 'Classes Conducted',
      render: (v) => <span className="text-xs font-mono font-bold text-[#111827]">{v}</span>,
    },
    {
      key: 'attended',
      header: 'Classes Attended',
      render: (v) => <span className="text-xs font-mono font-bold text-emerald-700">{v}</span>,
    },
    {
      key: 'missed',
      header: 'Classes Missed',
      render: (v) => <span className="text-xs font-mono font-bold text-red-600">{v}</span>,
    },
    {
      key: 'percentage',
      header: 'Attendance %',
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <div className="w-24 bg-[#FFF8E6] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                v >= 75 ? 'bg-[#D99A00]' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(v, 100)}%` }}
            />
          </div>
          <span className={`text-xs font-bold font-mono ${v >= 75 ? 'text-[#111827]' : 'text-red-700'}`}>
            {formatPercent(v)}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Examination Eligibility',
      render: (_, r) => (
        <Badge variant={r.percentage >= 75 ? 'teal' : 'danger'} size="sm" hasDot>
          {r.percentage >= 75 ? 'Eligible' : 'Short Attendance'}
        </Badge>
      ),
    },
  ];

  return (
    <section id="attendance" className="scroll-mt-20 space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111827]">Downloadable Attendance Report</h2>
            <Badge variant="teal" size="sm">Live Records</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 font-medium">
            Calculated directly from authorized faculty class attendance logs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchAttendance}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            onClick={handleDownloadReport}
            disabled={loading || !reportData}
          >
            {downloading ? 'Preparing Report...' : 'Download Attendance Report'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Student Details Card */}
      {reportData && (
        <div className="p-4 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Student Name</span>
              <span className="font-bold text-[#111827] mt-0.5 block">{student.name || profile?.name || 'Student'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Student ID / Roll No</span>
              <span className="font-mono font-bold text-[#D99A00] mt-0.5 block">{student.studentId || profile?.studentId || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Department & Sem</span>
              <span className="font-semibold text-[#111827] mt-0.5 block">{student.department || 'CSE'} &bull; Sem {student.semester || 1}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">Academic Session</span>
              <span className="font-semibold text-[#111827] mt-0.5 block">{student.academicYear || '2025-2026'}</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Overall Attendance',
            value: formatPercent(summary.overallPercentage),
            sub: summary.overallPercentage >= 75 ? 'Eligible for Exams' : 'Criteria not met',
            color: summary.overallPercentage >= 75 ? 'text-[#D99A00]' : 'text-red-600',
          },
          {
            label: 'Total Classes Conducted',
            value: summary.totalConducted,
            sub: 'Across all subjects',
            color: 'text-[#111827]',
          },
          {
            label: 'Classes Attended',
            value: summary.totalAttended,
            sub: 'Present + Late included',
            color: 'text-emerald-700',
          },
          {
            label: 'Classes Missed',
            value: summary.totalMissed,
            sub: 'Unexcused absences',
            color: 'text-red-600',
          },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-center shadow-xs">
            <p className="text-[11px] text-[#4B5563] font-bold uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-extrabold font-mono mt-1.5 ${c.color}`}>{c.value}</p>
            <p className="text-xs text-[#4B5563] mt-0.5 font-medium">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Warning/Advisories */}
      {shortageSubjects.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-red-900">Attendance Shortage Alert</p>
            <p className="text-red-800 text-xs mt-0.5 font-medium leading-relaxed">
              You are below the mandatory 75% attendance threshold in <strong>{shortageSubjects.length}</strong> subject(s):{' '}
              <strong>{shortageSubjects.map((s) => s.subject).join(', ')}</strong>. Meet with your faculty coordinator immediately.
            </p>
          </div>
        </div>
      )}

      {advisorySubjects.length > 0 && shortageSubjects.length === 0 && (
        <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#D99A00] flex gap-3 text-[#111827]">
          <AlertCircle className="w-5 h-5 text-[#D99A00] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold text-[#111827]">Attendance Advisory</p>
            <p className="text-[#4B5563] text-xs mt-0.5 font-medium leading-relaxed">
              Your attendance is in the borderline zone (75%–85%) in {advisorySubjects.length} subject(s):{' '}
              <strong>{advisorySubjects.map((s) => s.subject).join(', ')}</strong>. Attend upcoming sessions to secure eligibility.
            </p>
          </div>
        </div>
      )}

      {/* Subject-wise Breakdown Table */}
      <Card
        title="Subject-wise Official Attendance Breakdown"
        subtitle="Mandatory 75% threshold required to write semester exams"
        badge={
          <Badge variant={summary.overallPercentage >= 75 ? 'teal' : 'danger'} size="sm" hasDot>
            {summary.overallPercentage >= 75 ? 'Examination Eligible' : 'Attendance Shortage'}
          </Badge>
        }
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-[#D99A00] animate-spin" />
            <p className="text-xs text-[#4B5563] font-medium">Fetching real-time attendance records...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-[#F1E7CF] rounded-xl bg-[#FFFDF5]">
            <CalendarCheck className="w-10 h-10 text-[#D99A00] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-[#111827]">No attendance records found yet</p>
            <p className="text-xs text-[#4B5563] mt-1 max-w-sm mx-auto font-medium">
              Attendance records entered by faculty members will automatically calculate and appear here.
            </p>
          </div>
        ) : (
          <Table columns={columns} data={subjects} keyField="subject" />
        )}
      </Card>
    </section>
  );
};

export default StudentAttendanceSection;
