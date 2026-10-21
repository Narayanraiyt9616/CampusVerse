import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Filter,
  RefreshCw,
  Search,
  ChevronDown,
  Info,
  TrendingUp,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { parentService } from '../../../services/api';

export const ParentAcademics = ({ selectedStudentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'results'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await parentService.getAttendanceAndResults({ studentId: selectedStudentId || undefined });
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance & academic results.');
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
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading telemetry & examination records...</p>
      </div>
    );
  }

  const attendance = data?.attendance || {
    overallPercentage: 0,
    totalLectures: 0,
    totalPresent: 0,
    totalAbsent: 0,
    isLowAttendance: false,
    subjectBreakdown: [],
    logs: [],
  };
  const results = data?.results || [];
  const student = data?.student;

  // Filtered Subject Breakdown
  const filteredSubjects = attendance.subjectBreakdown.filter((sub) => {
    const matchesSearch = sub.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'SHORTAGE'
        ? sub.isShortage
        : !sub.isShortage;
    return matchesSearch && matchesStatus;
  });

  // Calculate results statistics
  const passedResults = results.filter((r) => r.isPass);
  const passRate = results.length > 0 ? Math.round((passedResults.length / results.length) * 100) : 100;
  const avgMarksPct =
    results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length)
      : 0;

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Telemetry Data Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Critical Shortage Warning Banner if attendance < 75% */}
      {attendance.isLowAttendance && (
        <div className="bg-[#CCFBF1] border border-[#0D9488]/40 p-4 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#102A43]">
                Mandatory Attendance Shortage Notice: {attendance.overallPercentage}%
              </h4>
              <p className="text-xs text-[#102A43]/80 leading-relaxed font-medium">
                {student?.name || 'Your ward'}&apos;s cumulative attendance is below the university-prescribed 75% threshold.
                Students with attendance below 75% are ineligible to sit for End-Semester Examinations (ESE) under Ordinance §14.2.
                Please ensure attendance in upcoming makeup classes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Cumulative Attendance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${attendance.isLowAttendance ? 'text-[#102A43]' : 'text-[#0D9488]'}`}>
                {attendance.overallPercentage}%
              </span>
              <span className="text-xs text-[#102A43]/60">/ 100%</span>
            </div>
            <span className="text-xs text-[#102A43]/70 mt-1 block font-semibold">
              {attendance.isLowAttendance ? 'Shortage Alert' : 'Above 75% Mandate'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Sessions Attended
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#102A43] font-mono">
                {attendance.totalPresent}
              </span>
              <span className="text-xs text-[#102A43]/60">/ {attendance.totalLectures}</span>
            </div>
            <span className="text-xs text-[#0D9488] mt-1 block font-bold">
              Verified Biometric & Roll-call
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Recorded Absences
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#102A43]">
                {attendance.totalAbsent}
              </span>
              <span className="text-xs text-[#102A43]/60">sessions</span>
            </div>
            <span className="text-xs text-[#102A43]/60 mt-1 block font-medium">
              Across all enrolled courses
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Exam Pass Ratio
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#0D9488] font-mono">
                {passRate}%
              </span>
              <span className="text-xs text-[#102A43]/60">({avgMarksPct}% avg)</span>
            </div>
            <span className="text-xs text-[#102A43]/60 mt-1 block font-medium">
              {results.length} Published Papers
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#CCFBF1] pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'attendance'
              ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
              : 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1]'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Subject-wise Attendance & Logs
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'attendance' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
          }`}>
            {attendance.subjectBreakdown.length} Subjects
          </span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'results'
              ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
              : 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1]'
          }`}
        >
          <Award className="w-4 h-4" />
          Published Examination Results
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'results' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
          }`}>
            {results.length} Tests
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Sync
          </Button>
        </div>
      </div>

      {/* TAB 1: ATTENDANCE & LOGS */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Subject Breakdown Card */}
          <Card
            title="Subject-wise Attendance Breakdown"
            subtitle="Real-time lecture and laboratory session attendance telemetry per enrolled subject"
            headerAction={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 w-44"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                >
                  <option value="ALL">All Subjects</option>
                  <option value="SHORTAGE">Shortage (&lt;75%)</option>
                  <option value="COMPLIANT">Compliant (&ge;75%)</option>
                </select>
              </div>
            }
          >
            {filteredSubjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No subjects found matching your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0FDFA] text-[#102A43] font-bold border-b border-[#CCFBF1]">
                    <tr>
                      <th className="p-3.5">Subject</th>
                      <th className="p-3.5 text-center">Conducted</th>
                      <th className="p-3.5 text-center">Attended</th>
                      <th className="p-3.5 text-center">Absences</th>
                      <th className="p-3.5">Attendance Compliance</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-400" />
                            <span>{sub.subject}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-mono font-medium text-slate-700">
                          {sub.totalSessions}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-teal-700">
                          {sub.present}
                        </td>
                        <td className="p-3.5 text-center font-mono text-rose-600 font-medium">
                          {sub.absent}
                        </td>
                        <td className="p-3.5 min-w-[200px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono font-bold text-slate-800">{sub.percentage}%</span>
                              <span className="text-[10px] text-slate-400">Min 75% req.</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  sub.percentage < 75
                                    ? 'bg-rose-500'
                                    : sub.percentage < 85
                                    ? 'bg-amber-500'
                                    : 'bg-teal-600'
                                }`}
                                style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <Badge
                            variant={sub.isShortage ? 'danger' : 'success'}
                            size="sm"
                            hasDot
                          >
                            {sub.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Daily Attendance Turnstile Logs */}
          <Card
            title="Biometric & Lecture Hall Check-In Log"
            subtitle="Chronological feed of classroom attendances logged by course instructors"
          >
            {attendance.logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No individual lecture logs recorded yet for this semester.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0FDFA] text-[#102A43] font-bold border-b border-[#CCFBF1] sticky top-0">
                    <tr>
                      <th className="p-3">Session Date</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Class/Hall</th>
                      <th className="p-3">Instructor</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {attendance.logs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-3 font-mono text-slate-600">
                          {new Date(log.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-3 font-medium text-slate-900">{log.subject}</td>
                        <td className="p-3 text-slate-600">{log.className}</td>
                        <td className="p-3 text-slate-600">{log.instructor}</td>
                        <td className="p-3 text-right">
                          <Badge
                            variant={
                              log.status === 'Present'
                                ? 'success'
                                : log.status === 'Late'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: PUBLISHED RESULTS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <Card
            title="Published Examination Marks & Grade Sheets"
            subtitle="Official institutional grades, mid-term evaluations, and faculty remarks"
            badge={
              <Badge variant="teal" size="sm">
                Official Registrar Records
              </Badge>
            }
          >
            {results.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <Info className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700">No published results available yet.</p>
                <p>Examination marks will appear here once finalized by the Examination Controller.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F0FDFA] text-[#102A43] font-bold border-b border-[#CCFBF1]">
                      <tr>
                        <th className="p-3.5">Course & Code</th>
                        <th className="p-3.5">Assessment Type</th>
                        <th className="p-3.5 text-center">Marks Obtained</th>
                        <th className="p-3.5 text-center">Percentage</th>
                        <th className="p-3.5 text-center">Grade</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5">Faculty Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-900 block">
                              {res.courseTitle || res.courseCode}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 block">
                              {res.courseCode} • {res.credits} Credits
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {res.assessmentName || 'Mid-Term Assessment'}
                            {res.session && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Session: {res.session}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                            {res.marksObtained} <span className="text-slate-400 font-normal">/ {res.maxMarks}</span>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-teal-700">
                            {res.percentage}%
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md font-bold font-mono text-xs ${
                                res.grade === 'O' || res.grade === 'A+'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : res.grade === 'A' || res.grade === 'B'
                                  ? 'bg-teal-100 text-teal-800'
                                  : res.grade === 'C'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {res.grade}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <Badge variant={res.isPass ? 'success' : 'danger'} size="sm">
                              {res.isPass ? 'Passed' : 'Needs Retake'}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-slate-600 max-w-xs text-[11px] italic">
                            {res.feedback ? `“${res.feedback}”` : 'Satisfactory academic performance.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grading Reference System */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
                  <span className="font-semibold text-slate-700">University Grading Scale:</span>
                  <div className="flex flex-wrap gap-3 font-mono">
                    <span><strong>O:</strong> 90-100% (Outstanding)</span>
                    <span><strong>A+:</strong> 80-89% (Excellent)</span>
                    <span><strong>A:</strong> 70-79% (Very Good)</span>
                    <span><strong>B:</strong> 60-69% (Good)</span>
                    <span><strong>C:</strong> 40-59% (Satisfactory)</span>
                    <span><strong>F:</strong> &lt;40% (Fail)</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParentAcademics;
