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
  if (pct >= 85) return 'teal';
  if (pct >= 75) return 'warning';
  return 'danger';
};

const getGradeLetter = (pct) => {
  if (pct >= 90) return { grade: 'O', label: 'Outstanding', color: 'text-[#0D9488]' };
  if (pct >= 80) return { grade: 'A+', label: 'Excellent', color: 'text-[#0D9488]' };
  if (pct >= 70) return { grade: 'A', label: 'Very Good', color: 'text-[#0D9488]' };
  if (pct >= 60) return { grade: 'B+', label: 'Good', color: 'text-[#102A43]' };
  if (pct >= 50) return { grade: 'B', label: 'Average', color: 'text-[#102A43]' };
  if (pct >= 40) return { grade: 'C', label: 'Pass', color: 'text-[#102A43]' };
  return { grade: 'F', label: 'Fail', color: 'text-[#102A43]' };
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

  const statusVariant = { Active: 'teal', Graduated: 'info', Suspended: 'danger', 'On Leave': 'warning' }[status] || 'neutral';

  return (
    <section id="profile" className="scroll-mt-20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#102A43]">Student Profile</h2>
          <p className="text-xs sm:text-sm text-[#102A43]/75 mt-0.5 font-medium">Personal details, contact &amp; guardian information</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => { setEditing(false); setErrors({}); }}>Cancel</Button>
            <Button variant="primary" size="sm" leftIcon={saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setEditing(true)}>Edit Profile</Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center space-y-3.5 py-2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#CCFBF1] bg-[#0D9488] flex items-center justify-center text-white">
                <img src={DEMO_STUDENT.avatar} alt={displayName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center shadow-lg hover:bg-[#0D9488]/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h3 className="font-bold text-[#102A43] text-lg">{displayName}</h3>
              <p className="text-xs text-[#102A43]/70 font-mono mt-0.5">{rollNo}</p>
            </div>
            <Badge variant={statusVariant} size="sm" hasDot>{status}</Badge>
            <div className="w-full pt-3.5 border-t border-[#CCFBF1] space-y-2.5 text-xs text-left">
              <div className="flex items-center gap-2.5 text-[#102A43]">
                <BookOpen className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                <span className="truncate font-semibold">{dept}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#102A43]">
                <GraduationCap className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                <span className="font-medium">{sem} &bull; Batch {enrollYear}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#102A43]">
                <Shield className="w-4 h-4 text-[#0D9488] flex-shrink-0" />
                <span className="truncate text-xs font-mono">{email}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Editable details */}
        <Card className="lg:col-span-2">
          <h4 className="text-base font-bold text-[#102A43] mb-4">Personal &amp; Contact Information</h4>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Mobile / Phone" id="stu-phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} placeholder="+91 98765 43210" leftIcon={<Phone className="w-4 h-4" />} />
              <Input label="Blood Group" id="stu-blood" value={form.bloodGroup} onChange={(e) => handleChange('bloodGroup', e.target.value)} placeholder="A+, B+, O+…" leftIcon={<Heart className="w-4 h-4" />} />
              <Input label="Course / Program" id="stu-course" value={form.course} onChange={(e) => handleChange('course', e.target.value)} placeholder="B.Tech Computer Science…" leftIcon={<BookOpen className="w-4 h-4" />} />
              <div className="sm:col-span-2">
                <Input label="Residential Address" id="stu-address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Full address…" leftIcon={<MapPin className="w-4 h-4" />} />
              </div>
              <div className="sm:col-span-2 pt-3 border-t border-[#CCFBF1]">
                <p className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-3">Guardian / Parent Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Guardian Name" id="stu-gname" value={form.guardianName} onChange={(e) => handleChange('guardianName', e.target.value)} placeholder="Full name" />
                  <Input label="Guardian Phone" id="stu-gphone" value={form.guardianPhone} onChange={(e) => handleChange('guardianPhone', e.target.value)} error={errors.guardianPhone} placeholder="+91 …" leftIcon={<Phone className="w-4 h-4" />} />
                  <Input label="Relation" id="stu-grelation" value={form.guardianRelation} onChange={(e) => handleChange('guardianRelation', e.target.value)} placeholder="Father / Mother…" leftIcon={<Users2 className="w-4 h-4" />} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 text-sm">
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
                  <div key={item.label} className="flex flex-col gap-1 p-3 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1]">
                    <span className="text-[11px] text-[#102A43]/70 font-bold uppercase tracking-wider">{item.label}</span>
                    <span className={`text-[#102A43] font-bold text-sm ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1]">
                <span className="text-[11px] text-[#102A43]/70 font-bold uppercase tracking-wider block mb-1">Address</span>
                <span className="text-[#102A43] text-sm font-semibold">{form.address || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#CCFBF1] border border-[#0D9488]/30">
                <p className="text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2">Guardian / Parent Details</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#102A43]/70 block font-medium">Name</span><span className="font-bold text-[#102A43] text-sm">{form.guardianName || '—'}</span></div>
                  <div><span className="text-[#102A43]/70 block font-medium">Phone</span><span className="font-bold text-[#102A43] text-sm">{form.guardianPhone || '—'}</span></div>
                  <div><span className="text-[#102A43]/70 block font-medium">Relation</span><span className="font-bold text-[#102A43] text-sm">{form.guardianRelation || '—'}</span></div>
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
    <section id="academics" className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#102A43]">Academic History</h2>
        <p className="text-xs sm:text-sm text-[#102A43]/75 mt-0.5 font-medium">Semester-wise marks, grades, percentages and academic progress</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D9488] text-white text-center shadow-sm">
          <p className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">Cumulative CGPA</p>
          <p className="text-3xl font-extrabold font-mono mt-1.5">{cgpa.toFixed(2)}</p>
          <p className="text-xs text-[#CCFBF1] mt-0.5 font-medium">/ 10.0</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
          <p className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider">Current SGPA</p>
          <p className="text-3xl font-extrabold font-mono mt-1.5 text-[#102A43]">{currentSgpa.toFixed(2)}</p>
          <p className="text-xs text-[#102A43]/70 mt-0.5 font-medium">This Semester</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
          <p className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider">Credits Earned</p>
          <p className="text-3xl font-extrabold font-mono mt-1.5 text-[#102A43]">{totalCredits}</p>
          <p className="text-xs text-[#102A43]/70 mt-0.5 font-medium">Total Credits</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
          <p className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider">Academic Standing</p>
          <p className="text-lg font-extrabold mt-2 text-[#0D9488]">Dean's List</p>
          <p className="text-xs text-[#102A43]/70 mt-0.5 font-medium">Top 5% Cohort</p>
        </div>
      </div>

      <Card title="Semester-wise Performance" subtitle="Click a semester to view subject-level results">
        <div className="space-y-3">
          {semData.map((s, i) => {
            const gradeInfo = getGradeLetter(s.pct);
            const isOpen = expandedSem === s.sem;
            return (
              <div key={s.sem} className="rounded-2xl border border-[#CCFBF1] overflow-hidden">
                <button
                  className="w-full flex items-center gap-3.5 p-4 bg-white hover:bg-[#CCFBF1]/30 transition-colors text-left"
                  onClick={() => setExpandedSem(isOpen ? null : s.sem)}
                >
                  <div className="w-8 h-8 rounded-xl bg-[#CCFBF1] flex items-center justify-center flex-shrink-0 text-[#0D9488]">
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-sm font-bold text-[#102A43]">{s.sem}</span>
                      {s.status && <Badge variant={s.status === 'In Progress' ? 'warning' : 'teal'} size="sm">{s.status}</Badge>}
                      {s.backlogs > 0 && <Badge variant="danger" size="sm">{s.backlogs} Backlog{s.backlogs > 1 ? 's' : ''}</Badge>}
                    </div>
                    <div className="mt-2 flex items-center gap-2.5">
                      <div className="flex-1 bg-[#CCFBF1] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-[#0D9488]"
                          style={{ width: `${Math.min(s.pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#102A43] font-mono w-10 text-right">{s.pct}%</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 mr-2">
                    {s.sgpa !== undefined ? (
                      <>
                        <span className="text-xl font-bold text-[#102A43] font-mono">{s.sgpa.toFixed(2)}</span>
                        <span className="text-xs text-[#102A43]/70 font-semibold block">SGPA &bull; {s.credits} Cr</span>
                      </>
                    ) : (
                      <>
                        <span className={`text-xl font-bold font-mono ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                        <span className="text-xs text-[#102A43]/70 font-semibold block">{s.obtained}/{s.max}</span>
                      </>
                    )}
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#102A43] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#102A43] flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-[#CCFBF1] bg-[#F0FDFA] p-4">
                    {s.results.length > 0 ? (
                      <div className="space-y-2.5">
                        {s.results.map((r) => {
                          const subPct = r.maxMarks > 0 ? Math.round(((r.marksObtained || 0) / r.maxMarks) * 100) : 0;
                          const subG = getGradeLetter(subPct);
                          return (
                            <div key={r._id || r.assessmentName} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#CCFBF1] text-xs">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#102A43] truncate">{r.assessmentName}</p>
                                <p className="text-[#102A43]/70 text-[11px] font-medium">{r.course?.courseCode || ''} &bull; {r.assessmentType}</p>
                              </div>
                              {r.feedback && <p className="text-[#102A43]/70 text-xs italic max-w-[140px] truncate">"{r.feedback}"</p>}
                              <div className="text-right flex-shrink-0">
                                <span className={`font-bold text-sm ${subG.color}`}>{subG.grade}</span>
                                <span className="text-[#102A43]/70 block text-xs font-mono font-semibold">{r.marksObtained ?? '—'}/{r.maxMarks}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[#102A43]/70 text-center py-3 font-semibold">Subject-level data will appear when results are published by faculty.</p>
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
    { key: 'code', header: 'Code', render: (v) => <span className="font-mono text-xs font-bold text-[#102A43]">{v}</span> },
    {
      key: 'name',
      header: 'Subject',
      render: (v, r) => (
        <div>
          <p className="font-bold text-xs text-[#102A43]">{v}</p>
          <p className="text-[11px] text-[#102A43]/70 font-medium">{r.faculty}</p>
        </div>
      ),
    },
    {
      key: 'attended',
      header: 'Classes',
      render: (v, r) => <span className="text-xs font-bold font-mono text-[#102A43]">{r.attended}/{r.total}</span>,
    },
    {
      key: 'percentage',
      header: 'Attendance %',
      render: (v) => {
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-24 bg-[#CCFBF1] rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full bg-[#0D9488]" style={{ width: `${Math.min(v, 100)}%` }} />
            </div>
            <span className="text-xs font-bold font-mono text-[#102A43]">{formatPercent(v)}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Eligibility',
      render: (_, r) => (
        <Badge variant={r.percentage >= 75 ? 'teal' : 'danger'} size="sm" hasDot>
          {r.percentage >= 75 ? 'Eligible' : 'Shortage'}
        </Badge>
      ),
    },
  ];

  const shortage = summary.courseBreakdown.filter((c) => c.percentage < 75);
  const advisory = summary.courseBreakdown.filter((c) => c.percentage >= 75 && c.percentage < 85);

  return (
    <section id="attendance" className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#102A43]">Attendance</h2>
        <p className="text-xs sm:text-sm text-[#102A43]/75 mt-0.5 font-medium">Overall and subject-wise attendance with shortage warnings</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Overall Attendance', value: formatPercent(overall), sub: 'Min. 75% required', color: 'text-[#0D9488]' },
          { label: 'Classes Attended', value: summary.attendedClasses, sub: `Out of ${summary.totalClasses}`, color: 'text-[#102A43]' },
          { label: 'Classes Missed', value: summary.missedClasses, sub: 'Total absences', color: 'text-[#102A43]' },
          { label: 'Enrolled Subjects', value: summary.courseBreakdown.length, sub: 'Active this semester', color: 'text-[#102A43]' },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
            <p className="text-xs text-[#102A43]/75 font-bold uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-extrabold font-mono mt-1.5 ${c.color}`}>{c.value}</p>
            <p className="text-xs text-[#102A43]/70 mt-0.5 font-medium">{c.sub}</p>
          </div>
        ))}
      </div>

      {shortage.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#CCFBF1] border border-[#0D9488] flex gap-3 text-[#102A43]">
          <AlertTriangle className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-[#102A43]">Attendance Shortage Warning</p>
            <p className="text-[#102A43] text-xs sm:text-sm mt-0.5 font-medium">
              You have below 75% attendance in <strong>{shortage.length}</strong> subject(s): <strong>{shortage.map((s) => s.code).join(', ')}</strong>.
              Contact the department faculty coordinator immediately.
            </p>
          </div>
        </div>
      )}
      {advisory.length > 0 && shortage.length === 0 && (
        <div className="p-4 rounded-2xl bg-[#CCFBF1] border border-[#0D9488]/50 flex gap-3 text-[#102A43]">
          <AlertCircle className="w-5 h-5 text-[#0D9488] flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-[#102A43]">Attendance Advisory</p>
            <p className="text-[#102A43] text-xs sm:text-sm mt-0.5 font-medium">
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
          <p className="font-bold text-xs text-[#102A43] leading-snug">{v || r.assessmentName}</p>
          <p className="text-[11px] text-[#102A43]/70 mt-0.5 font-medium">{r.course?.title || r.course || ''}</p>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Deadline',
      render: (v) => {
        const od = isOverdue(v);
        return <span className={`font-mono text-xs font-bold ${od ? 'text-[#0D9488]' : 'text-[#102A43]'}`}>{formatDate(v)}{od ? ' ⚠' : ''}</span>;
      },
    },
    {
      key: 'weight',
      header: 'Marks',
      render: (v, r) => <span className="text-xs font-bold text-[#102A43]">{v || `${r.maxMarks || '—'} Marks`}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v, r) => (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(v)} size="sm" hasDot>{v}</Badge>
          {(r.score !== undefined || r.marksObtained !== undefined) && (
            <span className="text-xs font-bold text-[#102A43] font-mono">({r.score ?? r.marksObtained}/{r.maxMarks})</span>
          )}
        </div>
      ),
    },
    {
      key: 'feedback',
      header: 'Feedback',
      render: (v) => v ? <span className="text-xs text-[#102A43]/80 italic">{v}</span> : <span className="text-xs text-[#102A43]/40">—</span>,
    },
  ];

  const examColumns = [
    {
      key: 'assessmentName',
      header: 'Exam',
      render: (v, r) => (
        <div>
          <p className="font-bold text-xs text-[#102A43]">{v}</p>
          <p className="text-[11px] text-[#102A43]/70 font-medium">{r.course?.courseCode || ''} &bull; {r.assessmentType}</p>
        </div>
      ),
    },
    { key: 'session', header: 'Session', render: (v) => <span className="text-xs font-bold font-mono text-[#102A43]">{v}</span> },
    {
      key: 'marksObtained',
      header: 'Result',
      render: (v, r) => {
        const pct = r.maxMarks > 0 ? Math.round(((v || 0) / r.maxMarks) * 100) : 0;
        const g = getGradeLetter(pct);
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#102A43]">{v}/{r.maxMarks}</span>
            <span className={`font-bold ${g.color}`}>{g.grade}</span>
          </div>
        );
      },
    },
    { key: 'feedback', header: 'Remarks', render: (v) => v ? <span className="text-xs text-[#102A43]/80 italic">{v}</span> : <span className="text-[#102A43]/40 text-xs">—</span> },
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
    <section id="assignments" className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#102A43]">Assignments &amp; Exams</h2>
        <p className="text-xs sm:text-sm text-[#102A43]/75 mt-0.5 font-medium">Pending, submitted, overdue assignments and published exam results</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pending.length, num: 'text-[#0D9488]' },
          { label: 'Submitted', value: submitted.length, num: 'text-[#102A43]' },
          { label: 'Graded', value: graded.length, num: 'text-[#0D9488]' },
          { label: 'Overdue', value: overdue.length, num: 'text-[#102A43]' },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
            <p className={`text-3xl font-extrabold font-mono ${c.num}`}>{c.value}</p>
            <p className="text-xs text-[#102A43]/75 font-bold uppercase tracking-wider mt-1.5">{c.label}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-1.5 bg-[#F0FDFA] p-1.5 rounded-xl border border-[#CCFBF1] mb-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.key ? 'bg-[#0D9488] text-white shadow-sm' : 'text-[#102A43] hover:bg-[#CCFBF1]'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white text-[#0D9488]' : 'bg-[#CCFBF1] text-[#102A43]'}`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'exams' ? (
          examResults.length > 0 ? (
            <Table columns={examColumns} data={examResults} keyField="_id" />
          ) : (
            <div className="text-center py-10">
              <Award className="w-10 h-10 text-[#0D9488] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#102A43]">No published exam results yet</p>
              <p className="text-xs text-[#102A43]/70 mt-1 font-medium">Results will appear once published by faculty</p>
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
      render: (v, r) => <span className="font-mono font-bold text-xs text-[#102A43]">{v || r.invoiceNumber}</span>,
    },
    {
      key: 'category',
      header: 'Description',
      render: (v, r) => (
        <div>
          <p className="font-bold text-xs text-[#102A43]">{v || r.description}</p>
          {r.academicYear && <p className="text-[11px] text-[#102A43]/70 font-medium">{r.academicYear}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (v) => <span className="font-extrabold text-xs font-mono text-[#102A43]">{formatCurrency(v)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (v) => <span className={`text-xs font-mono font-semibold ${isOverdue(v) ? 'text-[#0D9488]' : 'text-[#102A43]'}`}>{formatDate(v)}</span>,
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
        <Button variant="secondary" size="sm" className="text-xs" leftIcon={<Eye className="w-3.5 h-3.5" />} onClick={() => setReceiptModal({ isOpen: true, item: r })}>
          {r.status === 'Paid' ? 'Receipt' : 'Details'}
        </Button>
      ),
    },
  ];

  return (
    <section id="fees" className="scroll-mt-20 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#102A43]">Fees</h2>
        <p className="text-xs sm:text-sm text-[#102A43]/75 mt-0.5 font-medium">Total fees, paid amount, balance, due dates and payment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#102A43] text-white shadow-sm">
          <p className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider">Total Fees</p>
          <p className="text-3xl font-extrabold font-mono mt-2">{formatCurrency(totalFees)}</p>
          <p className="text-xs text-[#CCFBF1] mt-1 font-medium">Academic Year 2026–27</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-[#102A43] shadow-sm">
          <p className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Paid Amount</p>
          <p className="text-3xl font-extrabold font-mono mt-2 text-[#0D9488]">{formatCurrency(paidFees)}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
            <p className="text-xs text-[#102A43] font-semibold">{feeData.filter((f) => f.status === 'Paid').length} invoices cleared</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-[#CCFBF1] border border-[#0D9488] text-[#102A43] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#102A43]">Balance Due</p>
          <p className="text-3xl font-extrabold font-mono mt-2 text-[#102A43]">{formatCurrency(balance)}</p>
          <p className="text-xs mt-1 font-semibold text-[#102A43]">
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
              <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => alert('PDF receipt download ready.')}>
                Download Receipt
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => alert('Online payment gateway integration active.')}>
                Pay Online
              </Button>
            )}
          </div>
        }
      >
        {receiptModal.item && (
          <div className="space-y-4 text-xs text-[#102A43]">
            <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-2.5">
              {[
                { label: 'Invoice #', value: receiptModal.item.invoiceId || receiptModal.item.invoiceNumber, mono: true },
                { label: 'Category', value: receiptModal.item.category },
                { label: 'Amount', value: formatCurrency(receiptModal.item.amount) },
                { label: 'Due Date', value: formatDate(receiptModal.item.dueDate) },
                { label: 'Status', value: receiptModal.item.status },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[#102A43]/70 font-medium">{row.label}:</span>
                  <span className={`font-bold text-[#102A43] ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
              {receiptModal.item.status === 'Paid' && (
                <div className="border-t border-[#CCFBF1] pt-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#102A43]/70 font-medium">Payment Date:</span>
                    <span className="font-bold text-[#102A43]">{formatDate(receiptModal.item.paymentDate)}</span>
                  </div>
                  {receiptModal.item.receiptNumber && (
                    <div className="flex justify-between">
                      <span className="text-[#102A43]/70 font-medium">Receipt #:</span>
                      <span className="font-bold font-mono text-[#0D9488]">{receiptModal.item.receiptNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-[#102A43]/70 leading-relaxed font-medium">
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
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={formatPercent(overall)} subtitle="Semester average" change="Safe standing" changeType="increase" icon={<CalendarCheck className="w-5 h-5 text-[#0D9488]" />} />
        <StatCard title="CGPA" value={DEMO_STUDENT.cgpa.toFixed(2)} subtitle={`Current SGPA: ${DEMO_STUDENT.currentSgpa}`} change="+0.04 vs Sem 6" changeType="increase" icon={<GraduationCap className="w-5 h-5 text-[#0D9488]" />} />
        <StatCard title="Pending Tasks" value={pendingAssignments} subtitle="Assignments due" change={pendingAssignments > 0 ? 'Action needed' : 'All clear'} changeType={pendingAssignments > 0 ? 'decrease' : 'increase'} icon={<ClipboardList className="w-5 h-5 text-[#0D9488]" />} />
        <StatCard title="Fee Balance" value={formatCurrency(feeDue)} subtitle="Outstanding dues" change={feeDue === 0 ? 'All cleared' : 'Due soon'} changeType={feeDue === 0 ? 'increase' : 'decrease'} icon={<IndianRupee className="w-5 h-5 text-[#0D9488]" />} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[
          { to: '/student/profile', label: 'My Profile', icon: <User className="w-5 h-5" />, desc: 'Personal details & guardian info' },
          { to: '/student/academics', label: 'Academic History', icon: <GraduationCap className="w-5 h-5" />, desc: 'Marks, grades & CGPA progression' },
          { to: '/student/attendance', label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" />, desc: 'Subject-wise attendance records' },
          { to: '/student/assignments', label: 'Assignments & Exams', icon: <ClipboardList className="w-5 h-5" />, desc: 'Tasks, deadlines & results' },
          { to: '/student/fees', label: 'Fees', icon: <IndianRupee className="w-5 h-5" />, desc: 'Invoices & payment history' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group block">
            <div className="p-5 rounded-2xl border border-[#CCFBF1] bg-white hover:border-[#0D9488] shadow-sm hover:shadow-card-hover transition-all duration-200 group-hover:-translate-y-0.5 h-full">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <p className="font-bold text-[#102A43] text-sm">{item.label}</p>
              <p className="text-xs text-[#102A43]/70 font-medium mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <Card title="Recent Notices" subtitle="Latest campus communications">
        <div className="space-y-3">
          {DEMO_STUDENT.notifications.slice(0, 3).map((n) => (
            <div key={n.id} className="p-4 rounded-xl border border-[#CCFBF1] bg-white hover:bg-[#CCFBF1]/20 transition-colors text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-[#102A43]">{n.title}</span>
                <Badge variant={n.priority === 'High' ? 'warning' : 'neutral'} size="sm">{n.category}</Badge>
              </div>
              <p className="text-[#102A43]/80 text-xs mt-1.5 leading-relaxed font-medium">{n.message}</p>
              <p className="text-[#102A43]/60 text-[11px] font-semibold mt-1.5">{n.date}</p>
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
        badge={<Badge variant="teal" size="sm"><Star className="w-3.5 h-3.5 mr-1 inline" />Dean's List</Badge>}
        actions={
          <div className="flex items-center gap-2.5">
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
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#CCFBF1] border border-[#0D9488] text-xs sm:text-sm text-[#102A43] font-medium">
          <AlertCircle className="w-5 h-5 text-[#0D9488] flex-shrink-0" />{error}
        </div>
      )}
      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#CCFBF1] border border-[#0D9488] text-xs sm:text-sm text-[#102A43] font-bold">
          <Check className="w-5 h-5 text-[#0D9488] flex-shrink-0" />Profile updated successfully.
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#CCFBF1] border border-[#102A43] text-xs sm:text-sm text-[#102A43] font-bold">
          <AlertCircle className="w-5 h-5 text-[#102A43] flex-shrink-0" />{saveError}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[#CCFBF1]/30 animate-pulse border border-[#CCFBF1]" />)}
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
