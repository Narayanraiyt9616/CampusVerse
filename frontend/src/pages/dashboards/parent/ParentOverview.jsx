import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Phone,
  Mail,
  FileCheck2,
  Calendar,
  Building2,
  BookOpen,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import StatCard from '../../../components/common/StatCard';
import AlertBanner from '../../../components/common/AlertBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { parentService } from '../../../services/api';

export const ParentOverview = ({ selectedStudentId, onSelectStudent }) => {
  const [data, setData] = useState(null);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, wardsRes] = await Promise.all([
        parentService.getDashboard({ studentId: selectedStudentId || undefined }),
        parentService.getWards(),
      ]);

      if (dashRes && dashRes.success) {
        setData(dashRes);
      }
      if (wardsRes && wardsRes.success) {
        setWards(wardsRes.wards || []);
      }
    } catch (err) {
      console.error('Fetch parent dashboard error:', err);
      setError(err.message || 'Failed to load ward data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStudentId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3.5 text-sm text-[#111827] font-bold">Loading linked student telemetry from database...</p>
      </div>
    );
  }

  const student = data?.student;
  const att = data?.attendanceStats || { overallPercentage: 0, totalSessions: 0, presentCount: 0, absentCount: 0 };
  const acad = data?.academicStats || { cgpa: 8.5, averageScorePct: 85, standing: 'Good Academic Standing' };
  const fee = data?.feeStats || { totalBilled: 0, totalPaid: 0, pendingAmount: 0, overdueCount: 0 };
  const exams = data?.upcomingExams || [];
  const notices = data?.notices || [];

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="error"
          title="Telemetry Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Ward Switcher / Header Banner */}
      <div className="bg-white rounded-2xl border border-[#F1E7CF] p-6 sm:p-8 shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F1E7CF] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D99A00] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-[#111827]">{student?.name || 'Aarav Singhania'}</h2>
                <Badge variant={att.isLowAttendance ? 'warning' : 'teal'} size="sm" hasDot>
                  {acad.standing}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] font-mono mt-1 font-semibold">
                Roll No: <strong className="text-[#111827]">{student?.studentId}</strong> • {student?.department} (Semester {student?.semester})
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {wards.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#111827]">Select Ward:</span>
                <select
                  value={student?.studentId || ''}
                  onChange={(e) => onSelectStudent(e.target.value)}
                  className="h-10 px-3.5 text-xs sm:text-sm font-semibold rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                >
                  {wards.map((w) => (
                    <option key={w._id} value={w.studentId}>
                      {w.name} ({w.studentId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchData}
            >
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Quick Ward Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
            <span className="text-[#4B5563] text-xs block font-bold uppercase tracking-wider">Cumulative CGPA</span>
            <span className="text-2xl font-extrabold text-[#D99A00] font-mono mt-1 block">{acad.cgpa.toFixed(2)} / 10.0</span>
            <span className="text-[11px] text-[#4B5563] mt-1 block font-medium">Based on published grades</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#F1E7CF]">
            <span className="text-[#4B5563] text-xs block font-bold uppercase tracking-wider">
              Attendance Rate
            </span>
            <span className="text-2xl font-extrabold font-mono mt-1 block text-[#111827]">
              {att.overallPercentage}%
            </span>
            <span className={`text-xs mt-1 block font-bold ${att.isLowAttendance ? 'text-[#111827]' : 'text-[#D99A00]'}`}>
              {att.isLowAttendance ? 'Shortage Alert (< 75%)' : 'Exceeds 75% Requirement'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#F1E7CF]">
            <span className="text-[#4B5563] text-xs block font-bold uppercase tracking-wider">
              Fee Clearance
            </span>
            <span className="text-2xl font-extrabold font-mono mt-1 block text-[#111827]">
              {fee.pendingAmount > 0 ? `₹${fee.pendingAmount.toLocaleString()} Due` : 'All Cleared'}
            </span>
            <span className="text-[11px] text-[#4B5563] mt-1 block font-medium">
              {fee.overdueCount > 0 ? `${fee.overdueCount} Overdue Invoice(s)` : 'Semester Tuition & Hostel'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
            <span className="text-[#4B5563] text-xs block font-bold uppercase tracking-wider">Academic Standing</span>
            <span className="text-lg font-extrabold text-[#111827] mt-1 block">{student?.status || 'Active'}</span>
            <span className="text-[11px] text-[#4B5563] mt-1 block font-medium">Admitted {student?.enrollmentYear}</span>
          </div>
        </div>
      </div>

      {/* Critical Warnings if any */}
      {att.isLowAttendance && (
        <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#D99A00] flex items-start gap-3.5 text-xs text-[#111827]">
          <AlertTriangle className="w-5 h-5 text-[#D99A00] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-sm text-[#111827]">Mandatory Attendance Shortage Notice (&lt; 75%)</h4>
            <p className="text-[#111827] text-xs sm:text-sm leading-relaxed font-medium">
              Your ward's attendance is currently at <strong>{att.overallPercentage}%</strong> ({att.presentCount} lectures attended out of {att.totalSessions} total held). The university regulations require a minimum of 75% attendance to qualify for the end-semester examinations. Please advise your ward to attend all scheduled classes.
            </p>
            <div className="pt-1.5">
              <Link to="/parent/academics" className="font-bold text-[#D99A00] underline hover:opacity-80">
                View Subject-Wise Breakdown & Logs →
              </Link>
            </div>
          </div>
        </div>
      )}

      {fee.overdueCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFF8E6] border border-[#D99A00] flex items-start gap-3.5 text-xs text-[#111827]">
          <AlertTriangle className="w-5 h-5 text-[#D99A00] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-sm text-[#111827]">Overdue Fee Invoice Reminder</h4>
            <p className="text-[#111827] text-xs sm:text-sm leading-relaxed font-medium">
              There are outstanding institutional fee invoices pending payment. Please clear the pending dues to ensure uninterrupted examination registration and academic portal access.
            </p>
            <div className="pt-1.5">
              <Link to="/parent/fees" className="font-bold text-[#D99A00] underline hover:opacity-80">
                View Fee Invoices & Download Receipts →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Subject Breakdown Card */}
        <Card
          title="Attendance Telemetry Summary"
          subtitle="Real-time check against regulatory requirements"
          badge={<Badge variant={att.overallPercentage >= 75 ? 'teal' : 'warning'} size="sm">{att.overallPercentage}% Attendance</Badge>}
        >
          <div className="space-y-4 pt-1 text-xs">
            <div className="w-full bg-[#FFF8E6] rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-500 bg-[#D99A00]"
                style={{ width: `${Math.min(100, Math.max(5, att.overallPercentage))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center pt-1">
              <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                <span className="text-[10px] text-[#4B5563] font-bold uppercase block">Total Sessions</span>
                <span className="text-xs font-extrabold text-[#111827] mt-1 block">{att.totalSessions} Lectures</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF8E6] border border-[#D99A00]">
                <span className="text-[10px] text-[#111827] font-bold uppercase block">Attended</span>
                <span className="text-xs font-extrabold text-[#111827] mt-1 block">{att.presentCount} Classes</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#F1E7CF]">
                <span className="text-[10px] text-[#4B5563] font-bold uppercase block">Absences</span>
                <span className="text-xs font-extrabold text-[#111827] mt-1 block">{att.absentCount} Classes</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-between text-xs">
              <span className="text-[#4B5563] font-semibold">Regulation: <strong>75% Minimum Bar</strong></span>
              <Link to="/parent/academics" className="text-[#D99A00] hover:underline font-bold flex items-center gap-1">
                <span>Detailed Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Upcoming Examinations Card */}
        <Card
          title="Upcoming University Examinations"
          subtitle="Examination schedule, halls, and timing"
          badge={<Badge variant="navy" size="sm">{exams.length} Scheduled</Badge>}
        >
          <div className="space-y-3 pt-1 text-xs">
            {exams.length === 0 ? (
              <p className="text-[#4B5563] py-6 text-center font-semibold">No upcoming examinations scheduled at this time.</p>
            ) : (
              exams.slice(0, 3).map((ex) => (
                <div key={ex._id} className="p-3.5 rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6]/20 transition-colors space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111827]">{ex.title}</span>
                    <Badge variant="navy" size="sm">{ex.examType}</Badge>
                  </div>
                  <p className="text-xs text-[#4B5563] font-medium">{ex.subject}</p>
                  <div className="flex items-center justify-between text-xs text-[#111827] pt-1.5 border-t border-[#F1E7CF] font-mono font-semibold">
                    <span>📅 {ex.examDate} ({ex.startTime})</span>
                    <span>📍 {ex.venue || 'Exam Hall'}</span>
                  </div>
                </div>
              ))
            )}

            <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-between text-xs">
              <span className="text-[#4B5563] font-semibold">Full Timetable Available</span>
              <Link to="/parent/schedule" className="text-[#D99A00] hover:underline font-bold flex items-center gap-1">
                <span>View Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Institutional Fee Overview Card */}
        <Card
          title="Institutional Fee Account"
          subtitle="Verified payment ledger and pending dues"
          badge={<Badge variant={fee.pendingAmount === 0 ? 'teal' : 'warning'} size="sm">{fee.status}</Badge>}
        >
          <div className="space-y-3.5 pt-1 text-xs">
            <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#4B5563] font-bold uppercase block">Outstanding Balance</span>
                <span className="text-2xl font-extrabold font-mono text-[#111827] mt-0.5 block">
                  ₹{fee.pendingAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#4B5563] font-bold uppercase block">Total Paid</span>
                <span className="text-base font-extrabold font-mono text-[#D99A00] mt-0.5 block">
                  ₹{fee.totalPaid.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#111827]">
              <div className="flex justify-between py-1 border-b border-[#F1E7CF]">
                <span className="text-[#4B5563] font-medium">Total Annual Billed:</span>
                <span className="font-mono font-bold text-[#111827]">₹{fee.totalBilled.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1E7CF]">
                <span className="text-[#4B5563] font-medium">Overdue Invoices:</span>
                <span className="font-bold text-[#111827]">
                  {fee.overdueCount} Invoices
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[#4B5563] font-semibold">Official Receipts Ready</span>
              <Link to="/parent/fees" className="text-[#D99A00] hover:underline font-bold flex items-center gap-1">
                <span>View Fees & Receipts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Row: Recent Notices & Communication Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Important College Announcements */}
        <Card
          title="Important College Notices & Circulars"
          subtitle="Official announcements and examination broadcasts from Campus Administration"
          badge={<Badge variant="teal" size="sm">{notices.length} Circulars</Badge>}
        >
          <div className="space-y-3">
            {notices.length === 0 ? (
              <p className="text-xs text-[#4B5563] py-4 text-center font-semibold">No current announcements published.</p>
            ) : (
              notices.map((n) => (
                <div key={n._id} className="p-3.5 rounded-xl border border-[#F1E7CF] bg-white text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111827]">{n.title}</span>
                    <Badge variant={n.category === 'Exam' ? 'navy' : 'warning'} size="sm">
                      {n.category}
                    </Badge>
                  </div>
                  <p className="text-[#4B5563] leading-relaxed font-medium">{n.content}</p>
                  <p className="text-[11px] text-[#4B5563] font-mono font-semibold mt-1">
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : ''} • Issued by {n.authorName || 'Office of the Registrar'}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="pt-3.5 border-t border-[#F1E7CF] flex justify-end">
            <Link to="/parent/notices" className="text-xs font-bold text-[#D99A00] hover:underline flex items-center gap-1">
              <span>View All Circulars & Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Guardian Communication & Mentor Desk */}
        <Card
          title="Academic Mentor & Guardian Helpdesk"
          subtitle="Reach out to department leadership or request an academic consultation regarding your ward"
        >
          <div className="space-y-4 text-xs text-[#111827]">
            <p className="leading-relaxed font-medium text-[#4B5563]">
              Parents can schedule appointments with the Faculty Advisor or Head of Department to review their ward's academic progression, laboratory work, or attendance records.
            </p>

            <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] space-y-3">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-[#D99A00] shrink-0" />
                <div>
                  <span className="font-bold text-sm text-[#111827] block">Designated Faculty Mentor:</span>
                  <span className="text-xs text-[#4B5563] font-medium">Dr. Rajiv Menon (Professor, AI Lab Head)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D99A00] shrink-0" />
                <span className="text-xs font-semibold">Parent Inquiry Line: +91 (80) 4122-8900 (Mon - Fri, 9:00 AM - 5:00 PM)</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#D99A00] shrink-0" />
                <span className="text-xs font-semibold">Guardian Desk: parents@campusverse.edu</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link to="/parent/student" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                  View Full Student Profile
                </Button>
              </Link>
              <Link to="/parent/academics" className="flex-1">
                <Button variant="primary" size="sm" className="w-full justify-center text-xs">
                  Inspect Grades & Attendance
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParentOverview;
