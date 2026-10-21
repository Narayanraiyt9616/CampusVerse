import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, GraduationCap, CalendarCheck, ClipboardList, IndianRupee,
  LayoutDashboard, Edit3, Save, X, Camera, Phone, MapPin, Shield,
  BookOpen, TrendingUp, AlertTriangle, CheckCircle2, Clock, FileText,
  Download, Eye, ChevronDown, ChevronUp, Award, Percent, BarChart3,
  ArrowLeft, RefreshCw, Loader2, Heart, Users2, CreditCard,
  AlertCircle, Check, PlusCircle, Calendar, Star,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENT } from '../../utils/demoData';
import { studentService, resultService, feeService } from '../../services/api';
import { formatCurrency, formatPercent, getStatusBadgeVariant } from '../../utils/formatters';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getAttendanceBadge = (pct) => {
  if (pct >= 85) return 'success';
  if (pct >= 75) return 'warning';
  return 'danger';
};

const getGradeLetter = (pct) => {
  if (pct >= 90) return { grade: 'O', label: 'Outstanding', color: 'text-emerald-600' };
  if (pct >= 80) return { grade: 'A+', label: 'Excellent', color: 'text-teal-600' };
  if (pct >= 70) return { grade: 'A', label: 'Very Good', color: 'text-blue-600' };
  if (pct >= 60) return { grade: 'B+', label: 'Good', color: 'text-indigo-600' };
  if (pct >= 50) return { grade: 'B', label: 'Average', color: 'text-amber-600' };
  if (pct >= 40) return { grade: 'C', label: 'Pass', color: 'text-orange-600' };
  return { grade: 'F', label: 'Fail', color: 'text-rose-600' };
};

const formatDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return String(d); }
};

const isOverdue = (d) => d && new Date(d) < new Date();

// ─── 1. Student Profile Section ─────────────────────────────────────────────

const ProfileSection = ({ user, profile, onSave, saving }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: '', address: '', bloodGroup: '', course: '',
    guardianName: '', guardianPhone: '', guardianRelation: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setForm({
        phone: profile.phone || '',
        address: profile.address || '',
        bloodGroup: profile.bloodGroup || '',
        course: profile.course || '',
        guardianName: profile.guardianName || '',
        guardianPhone: profile.guardianPhone || '',
        guardianRelation: profile.guardianRelation || '',
      });
    }
  }, [profile]);

  const validate = () => {
    const e = {};
    if (form.phone && !/^\+?[\d\s\-(). ]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone number';
    if (form.guardianPhone && !/^\+?[\d\s\-(). ]{7,15}$/.test(form.guardianPhone)) e.guardianPhone = 'Invalid phone number';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const ok = await onSave(form);
    if (ok) setEditing(false);
  };

  const handleChange = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const displayName = profile?.name || profile?.userName || user?.name || DEMO_STUDENT.name;
  const rollNo = profile?.studentId || DEMO_STUDENT.rollNumber;
  const dept = profile?.department?.name || DEMO_STUDENT.department;
  const sem = profile?.semester ? `Semester ${profile.semester}` : DEMO_STUDENT.semester;
  const enrollYear = profile?.enrollmentYear || '2021';
  const status = profile?.status || 'Active';
  const email = profile?.email || user?.email || DEMO_STUDENT.email;
  const statusVariant = { Active: 'success', Graduated: 'info', Suspended: 'danger', 'On Leave': 'warning' }[status] || 'neutral';

  return (
    <section id="profile" className="scroll-mt-20 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">Personal details, contact &amp; guardian information</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => { setEditing(false); setErrors({}); }}>Cancel</Button>
            <Button variant="teal" size="sm" leftIcon={saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Identity card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-3 py-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-teal-100 ring-offset-2 bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <img src={DEMO_STUDENT.avatar} alt={displayName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg hover:bg-teal-700 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{displayName}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{rollNo}</p>
            </div>
            <Badge variant={statusVariant} size="sm" hasDot>{status}</Badge>
            <div className="w-full pt-3 border-t border-slate-100 space-y-2 text-xs text-left">
              <div className="flex items-center gap-2 text-slate-600">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">{dept}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{sem} &bull; Batch {enrollYear}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate text-[11px]">{email}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Editable details */}
        <Card className="lg:col-span-2">
          <h4 className="text-sm font-semibold text-slate-800 mb-4">Personal &amp; Contact Information</h4>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Mobile / Phone" id="stu-phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} placeholder="+91 98765 43210" leftIcon={<Phone className="w-4 h-4" />} />
              <Input label="Blood Group" id="stu-blood" value={form.bloodGroup} onChange={(e) => handleChange('bloodGroup', e.target.value)} placeholder="A+, B+, O+…" leftIcon={<Heart className="w-4 h-4" />} />
              <Input label="Course / Program" id="stu-course" value={form.course} onChange={(e) => handleChange('course', e.target.value)} placeholder="B.Tech Computer Science…" leftIcon={<BookOpen className="w-4 h-4" />} />
              <div className="sm:col-span-2">
                <Input label="Residential Address" id="stu-address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Full address…" leftIcon={<MapPin className="w-4 h-4" />} />
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Guardian / Parent Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Guardian Name" id="stu-gname" value={form.guardianName} onChange={(e) => handleChange('guardianName', e.target.value)} placeholder="Full name" />
                  <Input label="Guardian Phone" id="stu-gphone" value={form.guardianPhone} onChange={(e) => handleChange('guardianPhone', e.target.value)} error={errors.guardianPhone} placeholder="+91 …" leftIcon={<Phone className="w-4 h-4" />} />
                  <Input label="Relation" id="stu-grelation" value={form.guardianRelation} onChange={(e) => handleChange('guardianRelation', e.target.value)} placeholder="Father / Mother…" leftIcon={<Users2 className="w-4 h-4" />} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Enrollment Number', value: rollNo, mono: true },
                  { label: 'Department', value: dept },
                  { label: 'Semester', value: sem },
                  { label: 'Enrollment Year', value: enrollYear },
                  { label: 'Course / Program', value: form.course || DEMO_STUDENT.degree },
                  { label: 'Blood Group', value: form.bloodGroup || '—' },
                  { label: 'Mobile / Phone', value: form.phone || '—' },
                  { label: 'Academic Status', value: status },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{item.label}</span>
                    <span className={`text-slate-900 font-semibold text-xs ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">Address</span>
                <span className="text-slate-900 text-xs font-semibold">{form.address || '—'}</span>
              </div>
              <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100">
                <p className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider mb-2">Guardian / Parent Details</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-slate-400 block">Name</span><span className="font-semibold text-slate-900">{form.guardianName || '—'}</span></div>
                  <div><span className="text-slate-400 block">Phone</span><span className="font-semibold text-slate-900">{form.guardianPhone || '—'}</span></div>
                  <div><span className="text-slate-400 block">Relation</span><span className="font-semibold text-slate-900">{form.guardianRelation || '—'}</span></div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

// ─── 2. Academic History Section ─────────────────────────────────────────────

const AcademicsSection = ({ results }) => {
  const [expandedSem, setExpandedSem] = useState(null);

  // Build semester groupings from API results
  const semMap = {};
  (results || []).forEach((r) => {
    const key = `Semester ${r.semester}`;
    if (!semMap[key]) semMap[key] = { results: [], semester: r.semester };
    semMap[key].results.push(r);
  });

  const hasApiData = Object.keys(semMap).length > 0;

  const semData = hasApiData
    ? Object.entries(semMap).map(([sem, d]) => {
        const obtained = d.results.reduce((s, r) => s + (r.marksObtained || 0), 0);
        const max = d.results.reduce((s, r) => s + r.maxMarks, 0);
        const pct = max > 0 ? Math.round((obtained / max) * 100) : 0;
        const backlogs = d.results.filter((r) => r.maxMarks > 0 && (r.marksObtained || 0) / r.maxMarks < 0.4).length;
        return { sem, semester: d.semester, results: d.results, obtained, max, pct, backlogs };
      }).sort((a, b) => a.semester - b.semester)
    : DEMO_STUDENT.marks.map((m, i) => ({
        sem: m.semester, semester: i + 1, results: [], obtained: Math.round(m.sgpa * 10),
        max: 100, pct: Math.round(m.sgpa * 10), backlogs: 0, sgpa: m.sgpa, credits: m.credits, status: m.status,
      }));

  const cgpa = DEMO_STUDENT.cgpa;
  const currentSgpa = DEMO_STUDENT.currentSgpa;
  const totalCredits = DEMO_STUDENT.marks.reduce((s, m) => s + m.credits, 0);

  return (
    <section id="academics" className="scroll-mt-20 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Academic History</h2>
        <p className="text-xs text-slate-500 mt-0.5">Semester-wise marks, grades, percentages and academic progress</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white text-center shadow-lg shadow-teal-200/50">
          <p className="text-[11px] font-medium text-teal-100 uppercase tracking-wider">Cumulative CGPA</p>
          <p className="text-3xl font-bold font-mono mt-1">{cgpa.toFixed(2)}</p>
          <p className="text-[11px] text-teal-200 mt-0.5">/ 10.0</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Current SGPA</p>
          <p className="text-3xl font-bold font-mono mt-1 text-slate-900">{currentSgpa.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">This Semester</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Credits Earned</p>
          <p className="text-3xl font-bold font-mono mt-1 text-slate-900">{totalCredits}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total Credits</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Academic Standing</p>
          <p className="text-base font-bold mt-2 text-emerald-600">Dean's List</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Top 5% Cohort</p>
        </div>
      </div>

      <Card title="Semester-wise Performance" subtitle="Click a semester to view subject-level results">
        <div className="space-y-2">
          {semData.map((s, i) => {
            const gradeInfo = getGradeLetter(s.pct);
            const isOpen = expandedSem === s.sem;
            return (
              <div key={s.sem} className="rounded-xl border border-slate-200 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-3.5 bg-white hover:bg-slate-50 transition-colors text-left"
                  onClick={() => setExpandedSem(isOpen ? null : s.sem)}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-slate-600">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{s.sem}</span>
                      {s.status && <Badge variant={s.status === 'In Progress' ? 'warning' : 'success'} size="sm">{s.status}</Badge>}
                      {s.backlogs > 0 && <Badge variant="danger" size="sm">{s.backlogs} Backlog{s.backlogs > 1 ? 's' : ''}</Badge>}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${s.pct >= 80 ? 'bg-emerald-500' : s.pct >= 60 ? 'bg-teal-500' : s.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(s.pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-mono w-9 text-right">{s.pct}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 mr-2">
                    {s.sgpa !== undefined ? (
                      <>
                        <span className="text-xl font-bold text-slate-900 font-mono">{s.sgpa.toFixed(2)}</span>
                        <span className="text-[11px] text-slate-400 block">SGPA &bull; {s.credits} Cr</span>
                      </>
                    ) : (
                      <>
                        <span className={`text-xl font-bold font-mono ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                        <span className="text-[11px] text-slate-400 block">{s.obtained}/{s.max}</span>
                      </>
                    )}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-3.5">
                    {s.results.length > 0 ? (
                      <div className="space-y-2">
                        {s.results.map((r) => {
                          const subPct = r.maxMarks > 0 ? Math.round(((r.marksObtained || 0) / r.maxMarks) * 100) : 0;
                          const subG = getGradeLetter(subPct);
                          return (
                            <div key={r._id || r.assessmentName} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-slate-100 text-xs">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{r.assessmentName}</p>
                                <p className="text-slate-400 text-[11px]">{r.course?.courseCode || ''} &bull; {r.assessmentType}</p>
                              </div>
                              {r.feedback && <p className="text-slate-400 text-[11px] italic max-w-[130px] truncate">"{r.feedback}"</p>}
                              <div className="text-right flex-shrink-0">
                                <span className={`font-bold text-sm ${subG.color}`}>{subG.grade}</span>
                                <span className="text-slate-400 block text-[11px] font-mono">{r.marksObtained ?? '—'}/{r.maxMarks}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-3">Subject-level data will appear when results are published by faculty.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
};

// ─── 3. Attendance Section ───────────────────────────────────────────────────

const AttendanceSection = () => {
  const summary = DEMO_STUDENT.attendanceSummary;
  const overall = summary.overallPercentage;

  const attendanceColumns = [
    { key: 'code', header: 'Code', render: (v) => <span className="font-mono text-xs font-bold text-slate-700">{v}</span> },
    {
      key: 'name',
      header: 'Subject',
      render: (v, r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900">{v}</p>
          <p className="text-[11px] text-slate-400">{r.faculty}</p>
        </div>
      ),
    },
    {
      key: 'attended',
      header: 'Classes',
      render: (v, r) => <span className="text-xs font-mono text-slate-700">{r.attended}/{r.total}</span>,
    },
    {
      key: 'percentage',
      header: 'Attendance %',
      render: (v) => {
        const variant = getAttendanceBadge(v);
        const barColor = variant === 'success' ? 'bg-emerald-500' : variant === 'warning' ? 'bg-amber-500' : 'bg-rose-500';
        const textColor = variant === 'success' ? 'text-emerald-700' : variant === 'warning' ? 'text-amber-700' : 'text-rose-600';
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(v, 100)}%` }} />
            </div>
            <span className={`text-xs font-bold font-mono ${textColor}`}>{formatPercent(v)}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Eligibility',
      render: (_, r) => (
        <Badge variant={r.percentage >= 75 ? 'success' : 'danger'} size="sm" hasDot>
          {r.percentage >= 75 ? 'Eligible' : 'Shortage'}
        </Badge>
      ),
    },
  ];

  const shortage = summary.courseBreakdown.filter((c) => c.percentage < 75);
  const advisory = summary.courseBreakdown.filter((c) => c.percentage >= 75 && c.percentage < 85);

  return (
    <section id="attendance" className="scroll-mt-20 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Attendance</h2>
        <p className="text-xs text-slate-500 mt-0.5">Overall and subject-wise attendance with shortage warnings</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Overall Attendance', value: formatPercent(overall), sub: 'Min. 75% required', color: overall >= 75 ? 'text-emerald-600' : 'text-rose-600' },
          { label: 'Classes Attended', value: summary.attendedClasses, sub: `Out of ${summary.totalClasses}`, color: 'text-slate-900' },
          { label: 'Classes Missed', value: summary.missedClasses, sub: 'Total absences', color: summary.missedClasses > 20 ? 'text-rose-600' : 'text-amber-600' },
          { label: 'Enrolled Subjects', value: summary.courseBreakdown.length, sub: 'Active this semester', color: 'text-slate-900' },
        ].map((c) => (
          <div key={c.label} className="p-4 rounded-xl bg-white border border-slate-200 text-center">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${c.color}`}>{c.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {shortage.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-rose-800">Attendance Shortage Warning</p>
            <p className="text-rose-700 text-xs mt-0.5">
              You have below 75% attendance in <strong>{shortage.length}</strong> subject(s): <strong>{shortage.map((s) => s.code).join(', ')}</strong>.
              You may be barred from examinations. Contact the HOD immediately.
            </p>
          </div>
        </div>
      )}
      {advisory.length > 0 && shortage.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">Attendance Advisory</p>
            <p className="text-amber-700 text-xs mt-0.5">
              {advisory.length} subject(s) between 75–85%: <strong>{advisory.map((s) => s.code).join(', ')}</strong>. Maintain regularity.
            </p>
          </div>
        </div>
      )}

      <Card title="Subject-wise Attendance Breakdown" subtitle="75% minimum required for exam eligibility" badge={<Badge variant="teal" size="sm">Fall 2026</Badge>}>
        <Table columns={attendanceColumns} data={summary.courseBreakdown} keyField="code" />
      </Card>
    </section>
  );
};

// ─── 4. Assignments & Exams Section ─────────────────────────────────────────

const AssignmentsSection = ({ results, assignments }) => {
  const [activeTab, setActiveTab] = useState('all');

  const allAssignments = (assignments && assignments.length > 0) ? assignments : DEMO_STUDENT.assignments;
  const pending = allAssignments.filter((a) => (a.status || '').toLowerCase() === 'pending');
  const submitted = allAssignments.filter((a) => (a.status || '').toLowerCase() === 'submitted');
  const graded = allAssignments.filter((a) => (a.status || '').toLowerCase() === 'graded');
  const overdue = pending.filter((a) => isOverdue(a.dueDate));

  const examResults = (results || []).filter((r) => r.published);

  const assignmentColumns = [
    {
      key: 'title',
      header: 'Assignment',
      render: (v, r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 leading-snug">{v || r.assessmentName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{r.course?.title || r.course || ''}</p>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Deadline',
      render: (v) => {
        const od = isOverdue(v);
        return <span className={`font-mono text-xs ${od ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>{formatDate(v)}{od ? ' ⚠' : ''}</span>;
      },
    },
    {
      key: 'weight',
      header: 'Marks',
      render: (v, r) => <span className="text-xs text-slate-600">{v || `${r.maxMarks || '—'} Marks`}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v, r) => (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(v)} size="sm" hasDot>{v}</Badge>
          {(r.score !== undefined || r.marksObtained !== undefined) && (
            <span className="text-xs font-bold text-slate-700 font-mono">({r.score ?? r.marksObtained}/{r.maxMarks})</span>
          )}
        </div>
      ),
    },
    {
      key: 'feedback',
      header: 'Feedback',
      render: (v) => v ? <span className="text-[11px] text-slate-500 italic">{v}</span> : <span className="text-[11px] text-slate-300">—</span>,
    },
  ];

  const examColumns = [
    {
      key: 'assessmentName',
      header: 'Exam',
      render: (v, r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900">{v}</p>
          <p className="text-[11px] text-slate-400">{r.course?.courseCode || ''} &bull; {r.assessmentType}</p>
        </div>
      ),
    },
    { key: 'session', header: 'Session', render: (v) => <span className="text-xs font-mono text-slate-600">{v}</span> },
    {
      key: 'marksObtained',
      header: 'Result',
      render: (v, r) => {
        const pct = r.maxMarks > 0 ? Math.round(((v || 0) / r.maxMarks) * 100) : 0;
        const g = getGradeLetter(pct);
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">{v}/{r.maxMarks}</span>
            <span className={`font-bold ${g.color}`}>{g.grade}</span>
          </div>
        );
      },
    },
    { key: 'feedback', header: 'Remarks', render: (v) => v ? <span className="text-[11px] text-slate-500 italic">{v}</span> : <span className="text-slate-300 text-[11px]">—</span> },
  ];

  const TABS = [
    { key: 'all', label: 'All', count: allAssignments.length },
    { key: 'pending', label: 'Pending', count: pending.length },
    { key: 'submitted', label: 'Submitted', count: submitted.length },
    { key: 'graded', label: 'Graded', count: graded.length },
    { key: 'exams', label: 'Exam Results', count: examResults.length },
  ];

  const tabData = { all: allAssignments, pending, submitted, graded };

  return (
    <section id="assignments" className="scroll-mt-20 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Assignments &amp; Exams</h2>
        <p className="text-xs text-slate-500 mt-0.5">Pending, submitted, overdue assignments and published exam results</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pending.length, bg: 'bg-amber-50 border-amber-200', num: pending.length > 0 ? 'text-amber-700' : 'text-slate-900' },
          { label: 'Submitted', value: submitted.length, bg: 'bg-blue-50 border-blue-200', num: 'text-blue-700' },
          { label: 'Graded', value: graded.length, bg: 'bg-emerald-50 border-emerald-200', num: 'text-emerald-700' },
          { label: 'Overdue', value: overdue.length, bg: overdue.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200', num: overdue.length > 0 ? 'text-rose-700' : 'text-slate-600' },
        ].map((c) => (
          <div key={c.label} className={`p-4 rounded-xl border text-center ${c.bg}`}>
            <p className={`text-3xl font-bold font-mono ${c.num}`}>{c.value}</p>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mb-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-500'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'exams' ? (
          examResults.length > 0 ? (
            <Table columns={examColumns} data={examResults} keyField="_id" />
          ) : (
            <div className="text-center py-10">
              <Award className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No published exam results yet</p>
              <p className="text-xs text-slate-400 mt-1">Results will appear once published by faculty</p>
            </div>
          )
        ) : (
          <Table columns={assignmentColumns} data={tabData[activeTab] || allAssignments} keyField="id" />
        )}
      </Card>
    </section>
  );
};

// ─── 5. Fees Section ─────────────────────────────────────────────────────────

const FeesSection = ({ fees }) => {
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, item: null });

  const feeData = (fees && fees.length > 0) ? fees : DEMO_STUDENT.fees;
  const totalFees = feeData.reduce((s, f) => s + (f.amount || 0), 0);
  const paidFees = feeData.filter((f) => f.status === 'Paid').reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
  const balance = totalFees - paidFees;

  const feeColumns = [
    {
      key: 'invoiceId',
      header: 'Invoice #',
      render: (v, r) => <span className="font-mono font-bold text-xs text-slate-800">{v || r.invoiceNumber}</span>,
    },
    {
      key: 'category',
      header: 'Description',
      render: (v, r) => (
        <div>
          <p className="font-semibold text-xs text-slate-900">{v || r.description}</p>
          {r.academicYear && <p className="text-[11px] text-slate-400">{r.academicYear}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (v) => <span className="font-bold text-xs font-mono text-slate-900">{formatCurrency(v)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (v) => <span className={`text-xs font-mono ${isOverdue(v) ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>{formatDate(v)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <Badge variant={getStatusBadgeVariant(v)} size="sm" hasDot>{v}</Badge>,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (_, r) => (
        <Button variant="secondary" size="sm" className="text-xs" leftIcon={<Eye className="w-3 h-3" />} onClick={() => setReceiptModal({ isOpen: true, item: r })}>
          {r.status === 'Paid' ? 'Receipt' : 'Details'}
        </Button>
      ),
    },
  ];

  return (
    <section id="fees" className="scroll-mt-20 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Fees</h2>
        <p className="text-xs text-slate-500 mt-0.5">Total fees, paid amount, balance, due dates and payment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/20">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Fees</p>
          <p className="text-3xl font-bold font-mono mt-2">{formatCurrency(totalFees)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Academic Year 2026–27</p>
        </div>
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Paid</p>
          <p className="text-3xl font-bold font-mono mt-2 text-emerald-700">{formatCurrency(paidFees)}</p>
          <div className="mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[11px] text-emerald-600">{feeData.filter((f) => f.status === 'Paid').length} invoices cleared</p>
          </div>
        </div>
        <div className={`p-5 rounded-xl border ${balance > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <p className={`text-[11px] font-medium uppercase tracking-wider ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Balance Due</p>
          <p className={`text-3xl font-bold font-mono mt-2 ${balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{formatCurrency(balance)}</p>
          <p className={`text-[11px] mt-1 ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {balance > 0 ? `${feeData.filter((f) => f.status === 'Pending').length} pending invoice(s)` : 'All dues cleared ✓'}
          </p>
        </div>
      </div>

      <Card title="Fee Invoices &amp; Payment History" subtitle="Semester financial transactions and receipts" badge={<Badge variant="info" size="sm">Term 2026–27</Badge>}>
        <Table columns={feeColumns} data={feeData} keyField="invoiceId" />
      </Card>

      <Modal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, item: null })}
        title={receiptModal.item?.status === 'Paid' ? 'Official Fee Receipt' : 'Fee Invoice Details'}
        description={`Reference: ${receiptModal.item?.invoiceId || receiptModal.item?.invoiceNumber || 'N/A'}`}
        id="fee-receipt-modal"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setReceiptModal({ isOpen: false, item: null })}>Close</Button>
            {receiptModal.item?.status === 'Paid' ? (
              <Button variant="teal" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => alert('PDF receipt download will be integrated with the payment gateway.')}>
                Download Receipt
              </Button>
            ) : (
              <Button variant="teal" size="sm" onClick={() => alert('Online payment gateway (UPI/Netbanking) will be integrated soon.')}>
                Pay Online
              </Button>
            )}
          </div>
        }
      >
        {receiptModal.item && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              {[
                { label: 'Invoice #', value: receiptModal.item.invoiceId || receiptModal.item.invoiceNumber, mono: true },
                { label: 'Category', value: receiptModal.item.category },
                { label: 'Amount', value: formatCurrency(receiptModal.item.amount) },
                { label: 'Due Date', value: formatDate(receiptModal.item.dueDate) },
                { label: 'Status', value: receiptModal.item.status },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-slate-500">{row.label}:</span>
                  <span className={`font-semibold text-slate-900 ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
              {receiptModal.item.status === 'Paid' && (
                <div className="border-t border-slate-200 pt-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Date:</span>
                    <span className="font-semibold text-slate-900">{formatDate(receiptModal.item.paymentDate)}</span>
                  </div>
                  {receiptModal.item.receiptNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Receipt #:</span>
                      <span className="font-semibold font-mono text-teal-700">{receiptModal.item.receiptNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This is an electronic statement from CampusVerse AI. For discrepancies, contact the accounts office.
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
};

// ─── Overview Section ────────────────────────────────────────────────────────

const OverviewSection = ({ profile, results, fees }) => {
  const overall = DEMO_STUDENT.attendanceSummary.overallPercentage;
  const pendingAssignments = DEMO_STUDENT.assignments.filter((a) => a.status === 'Pending').length;
  const feeList = (fees && fees.length > 0) ? fees : DEMO_STUDENT.fees;
  const totalFees = feeList.reduce((s, f) => s + f.amount, 0);
  const paidFees = feeList.filter((f) => f.status === 'Paid').reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
  const feeDue = totalFees - paidFees;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={formatPercent(overall)} subtitle="Semester average" change="Safe standing" changeType="increase" colorVariant="teal" icon={<CalendarCheck className="w-5 h-5 text-teal-600" />} />
        <StatCard title="CGPA" value={DEMO_STUDENT.cgpa.toFixed(2)} subtitle={`Current SGPA: ${DEMO_STUDENT.currentSgpa}`} change="+0.04 vs Sem 6" changeType="increase" colorVariant="emerald" icon={<GraduationCap className="w-5 h-5 text-emerald-600" />} />
        <StatCard title="Pending Tasks" value={pendingAssignments} subtitle="Assignments due" change={pendingAssignments > 0 ? 'Action needed' : 'All clear'} changeType={pendingAssignments > 0 ? 'decrease' : 'increase'} colorVariant="amber" icon={<ClipboardList className="w-5 h-5 text-amber-600" />} />
        <StatCard title="Fee Balance" value={formatCurrency(feeDue)} subtitle="Outstanding dues" change={feeDue === 0 ? 'All cleared' : 'Due soon'} changeType={feeDue === 0 ? 'increase' : 'decrease'} colorVariant="navy" icon={<IndianRupee className="w-5 h-5 text-navy-700" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { to: '/student/profile', label: 'My Profile', icon: <User className="w-5 h-5" />, desc: 'Personal details & guardian info', color: 'from-violet-500 to-purple-600' },
          { to: '/student/academics', label: 'Academic History', icon: <GraduationCap className="w-5 h-5" />, desc: 'Marks, grades & CGPA progression', color: 'from-teal-500 to-emerald-600' },
          { to: '/student/attendance', label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" />, desc: 'Subject-wise attendance records', color: 'from-blue-500 to-indigo-600' },
          { to: '/student/assignments', label: 'Assignments & Exams', icon: <ClipboardList className="w-5 h-5" />, desc: 'Tasks, deadlines & results', color: 'from-amber-500 to-orange-600' },
          { to: '/student/fees', label: 'Fees', icon: <IndianRupee className="w-5 h-5" />, desc: 'Invoices & payment history', color: 'from-rose-500 to-pink-600' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group block">
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 h-full">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <Card title="Recent Notices" subtitle="Latest campus communications">
        <div className="space-y-2.5">
          {DEMO_STUDENT.notifications.slice(0, 3).map((n) => (
            <div key={n.id} className={`p-3 rounded-lg border text-xs ${n.priority === 'High' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900">{n.title}</span>
                <Badge variant={n.priority === 'High' ? 'warning' : 'neutral'} size="sm">{n.category}</Badge>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{n.message}</p>
              <p className="text-slate-400 text-[10px] mt-1">{n.date}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── Main StudentDashboard ───────────────────────────────────────────────────

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { section } = useParams();

  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [assignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentSection = section ? section.toLowerCase() : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, resultsRes, feesRes] = await Promise.allSettled([
        studentService.getMyProfile(),
        resultService.list({ limit: 100 }),
        feeService.list({ limit: 100 }),
      ]);
      if (profileRes.status === 'fulfilled' && profileRes.value?.success) setProfile(profileRes.value.data);
      if (resultsRes.status === 'fulfilled' && resultsRes.value?.success) setResults(resultsRes.value.data || []);
      if (feesRes.status === 'fulfilled' && feesRes.value?.success) setFees(feesRes.value.data || []);
    } catch {
      setError('Some data could not be loaded. Showing demo data where applicable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSaveProfile = async (formData) => {
    setSaving(true); setSaveError(''); setSaveSuccess(false);
    try {
      const res = await studentService.updateMyProfile(formData);
      if (res?.success) {
        setProfile((prev) => ({ ...prev, ...formData }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return true;
      }
      setSaveError(res?.error?.message || 'Failed to save profile.');
      return false;
    } catch (err) {
      setSaveError(err?.message || 'An error occurred while saving.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const loggedInName = user?.name || user?.username || DEMO_STUDENT.name;

  const SECTION_LABELS = {
    profile: 'My Profile',
    academics: 'Academic History',
    attendance: 'Attendance',
    assignments: 'Assignments & Exams',
    fees: 'Fees',
  };

  const sectionLabel = currentSection ? (SECTION_LABELS[currentSection] || currentSection) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={sectionLabel || `Welcome, ${loggedInName}`}
        subtitle={
          sectionLabel
            ? `${loggedInName} · ${profile?.studentId || DEMO_STUDENT.rollNumber} · ${profile?.department?.name || DEMO_STUDENT.department}`
            : `${profile?.email || user?.email || DEMO_STUDENT.email} · ${profile?.department?.name || DEMO_STUDENT.department} · Sem ${profile?.semester || '7'}`
        }
        breadcrumbs={
          sectionLabel
            ? [{ label: 'Student Portal', to: '/student' }, { label: sectionLabel }]
            : [{ label: 'Student Portal', to: '/student' }, { label: 'Overview' }]
        }
        badge={<Badge variant="teal" size="sm"><Star className="w-3 h-3 mr-1 inline" />Dean's List</Badge>}
        actions={
          <div className="flex items-center gap-2">
            {sectionLabel && (
              <Link to="/student"><Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>Overview</Button></Link>
            )}
            <Button variant="secondary" size="sm" leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} onClick={loadData} disabled={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />{error}
        </div>
      )}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />Profile updated successfully.
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />{saveError}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          {!currentSection && <OverviewSection profile={profile} results={results} fees={fees} />}
          {(!currentSection || currentSection === 'profile') && (
            <ProfileSection user={user} profile={profile} onSave={handleSaveProfile} saving={saving} />
          )}
          {(!currentSection || currentSection === 'academics') && <AcademicsSection results={results} />}
          {(!currentSection || currentSection === 'attendance') && <AttendanceSection />}
          {(!currentSection || currentSection === 'assignments') && <AssignmentsSection results={results} assignments={assignments} />}
          {(!currentSection || currentSection === 'fees') && <FeesSection fees={fees} />}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
