import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, GraduationCap, CalendarCheck, ClipboardList, IndianRupee,
  Edit3, Save, X, Camera, Phone, MapPin, Shield,
  BookOpen, TrendingUp, CheckCircle2,
  Download, Eye, Award,
  ArrowLeft, RefreshCw, Loader2, Heart, Users2,
  AlertCircle, Check, Star, FileCheck2, Briefcase, Code, Video,
} from 'lucide-react';

// Code-split heavy sub-sections for faster initial student dashboard load
const StudentOnlineClassesSection = React.lazy(() => import('./student/StudentOnlineClassesSection'));
const StudentAdmitCardSection = React.lazy(() => import('./student/StudentAdmitCardSection'));
const StudentPlacementSection = React.lazy(() => import('./student/StudentPlacementSection'));
const StudentAttendanceSection = React.lazy(() => import('./student/StudentAttendanceSection'));
const StudentProgressReportSection = React.lazy(() => import('./student/StudentProgressReportSection'));
const StudentAssignmentSection = React.lazy(() => import('./student/StudentAssignmentSection'));
const StudentLiveProjectSection = React.lazy(() => import('./student/StudentLiveProjectSection'));
const StudentCertificateSection = React.lazy(() => import('./student/StudentCertificateSection'));
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import PortalHeroBanner from '../../components/common/PortalHeroBanner';
import { useAuth } from '../../context/AuthContext';
import { studentService, resultService, feeService, assignmentService } from '../../services/api';
import { formatCurrency, formatPercent, getStatusBadgeVariant } from '../../utils/formatters';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

  const displayName = profile?.name || profile?.userName || user?.name || user?.username || 'Student';
  const rollNo = profile?.studentId || '—';
  const dept = profile?.department?.name || 'Computer Science & Engineering';
  const sem = profile?.semester ? `Semester ${profile.semester}` : 'Semester 1';
  const enrollYear = profile?.enrollmentYear || '—';
  const status = profile?.status || 'Active';
  const email = profile?.email || user?.email || '—';

  const statusVariant = { Active: 'teal', Graduated: 'info', Suspended: 'danger', 'On Leave': 'warning' }[status] || 'neutral';

  return (
    <section id="profile" className="scroll-mt-20 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Student Profile</h2>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 font-medium">Personal details, contact &amp; guardian information</p>
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
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-[#F1E7CF] bg-[#D99A00] flex items-center justify-center text-white text-3xl font-extrabold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#D99A00] text-white flex items-center justify-center shadow-lg hover:bg-[#D99A00]/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div>
              <h3 className="font-bold text-[#111827] text-lg">{displayName}</h3>
              <p className="text-xs text-[#4B5563] font-mono mt-0.5">{rollNo}</p>
            </div>
            <Badge variant={statusVariant} size="sm" hasDot>{status}</Badge>
            <div className="w-full pt-3.5 border-t border-[#F1E7CF] space-y-2.5 text-xs text-left">
              <div className="flex items-center gap-2.5 text-[#111827]">
                <BookOpen className="w-4 h-4 text-[#D99A00] flex-shrink-0" />
                <span className="truncate font-semibold">{dept}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#111827]">
                <GraduationCap className="w-4 h-4 text-[#D99A00] flex-shrink-0" />
                <span className="font-medium">{sem} &bull; Batch {enrollYear}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#111827]">
                <Shield className="w-4 h-4 text-[#D99A00] flex-shrink-0" />
                <span className="truncate text-xs font-mono">{email}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Editable details */}
        <Card className="lg:col-span-2">
          <h4 className="text-base font-bold text-[#111827] mb-4">Personal &amp; Contact Information</h4>
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Mobile / Phone" id="stu-phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} error={errors.phone} placeholder="+91 98765 43210" leftIcon={<Phone className="w-4 h-4" />} />
              <Input label="Blood Group" id="stu-blood" value={form.bloodGroup} onChange={(e) => handleChange('bloodGroup', e.target.value)} placeholder="A+, B+, O+…" leftIcon={<Heart className="w-4 h-4" />} />
              <Input label="Course / Program" id="stu-course" value={form.course} onChange={(e) => handleChange('course', e.target.value)} placeholder="B.Tech Computer Science…" leftIcon={<BookOpen className="w-4 h-4" />} />
              <div className="sm:col-span-2">
                <Input label="Residential Address" id="stu-address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Full address…" leftIcon={<MapPin className="w-4 h-4" />} />
              </div>
              <div className="sm:col-span-2 pt-3 border-t border-[#F1E7CF]">
                <p className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-3">Guardian / Parent Information</p>
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
                  { label: 'Course / Program', value: form.course || profile?.course || profile?.degree || '—' },
                  { label: 'Blood Group', value: form.bloodGroup || '—' },
                  { label: 'Mobile / Phone', value: form.phone || '—' },
                  { label: 'Academic Status', value: status },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1 p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                    <span className="text-[11px] text-[#4B5563] font-bold uppercase tracking-wider">{item.label}</span>
                    <span className={`text-[#111827] font-bold text-sm ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                <span className="text-[11px] text-[#4B5563] font-bold uppercase tracking-wider block mb-1">Address</span>
                <span className="text-[#111827] text-sm font-semibold">{form.address || '—'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFF8E6] border border-[#D99A00]/30">
                <p className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">Guardian / Parent Details</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#4B5563] block font-medium">Name</span><span className="font-bold text-[#111827] text-sm">{form.guardianName || '—'}</span></div>
                  <div><span className="text-[#4B5563] block font-medium">Phone</span><span className="font-bold text-[#111827] text-sm">{form.guardianPhone || '—'}</span></div>
                  <div><span className="text-[#4B5563] block font-medium">Relation</span><span className="font-bold text-[#111827] text-sm">{form.guardianRelation || '—'}</span></div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

// ─── 5. Fees Section ─────────────────────────────────────────────────────────

const FeesSection = ({ fees }) => {
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, item: null });

  const feeData = (fees && fees.length > 0) ? fees : [];
  const totalFees = feeData.reduce((s, f) => s + (f.amount || 0), 0);
  const paidFees = feeData.filter((f) => f.status === 'Paid').reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
  const balance = totalFees - paidFees;

  const feeColumns = [
    {
      key: 'invoiceId',
      header: 'Invoice #',
      render: (v, r) => <span className="font-mono font-bold text-xs text-[#111827]">{v || r.invoiceNumber}</span>,
    },
    {
      key: 'category',
      header: 'Description',
      render: (v, r) => (
        <div>
          <p className="font-bold text-xs text-[#111827]">{v || r.description}</p>
          {r.academicYear && <p className="text-[11px] text-[#4B5563] font-medium">{r.academicYear}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (v) => <span className="font-extrabold text-xs font-mono text-[#111827]">{formatCurrency(v)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (v) => <span className={`text-xs font-mono font-semibold ${isOverdue(v) ? 'text-[#D99A00]' : 'text-[#111827]'}`}>{formatDate(v)}</span>,
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
        <h2 className="text-xl font-bold text-[#111827]">Fees</h2>
        <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 font-medium">Total fees, paid amount, balance, due dates and payment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] text-white shadow-sm">
          <p className="text-xs font-bold text-[#F1E7CF] uppercase tracking-wider">Total Fees</p>
          <p className="text-3xl font-extrabold font-mono mt-2">{formatCurrency(totalFees)}</p>
          <p className="text-xs text-[#F1E7CF] mt-1 font-medium">Academic Year 2026–27</p>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-[#111827] shadow-sm">
          <p className="text-xs font-bold text-[#D99A00] uppercase tracking-wider">Paid Amount</p>
          <p className="text-3xl font-extrabold font-mono mt-2 text-[#D99A00]">{formatCurrency(paidFees)}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#D99A00]" />
            <p className="text-xs text-[#111827] font-semibold">{feeData.filter((f) => f.status === 'Paid').length} invoices cleared</p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-[#FFF8E6] border border-[#D99A00] text-[#111827] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-[#111827]">Balance Due</p>
          <p className="text-3xl font-extrabold font-mono mt-2 text-[#111827]">{formatCurrency(balance)}</p>
          <p className="text-xs mt-1 font-semibold text-[#111827]">
            {balance > 0 ? `${feeData.filter((f) => f.status === 'Pending').length} pending invoice(s)` : 'All dues cleared ✓'}
          </p>
        </div>
      </div>

      <Card title="Fee Invoices &amp; Payment History" subtitle="Semester financial transactions and receipts" badge={<Badge variant="info" size="sm">Term 2026–27</Badge>}>
        <Table columns={feeColumns} data={feeData} keyField="invoiceId" emptyMessage="No fee invoices or dues recorded yet." />
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
          <div className="space-y-4 text-xs text-[#111827]">
            <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] space-y-2.5">
              {[
                { label: 'Invoice #', value: receiptModal.item.invoiceId || receiptModal.item.invoiceNumber, mono: true },
                { label: 'Category', value: receiptModal.item.category },
                { label: 'Amount', value: formatCurrency(receiptModal.item.amount) },
                { label: 'Due Date', value: formatDate(receiptModal.item.dueDate) },
                { label: 'Status', value: receiptModal.item.status },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[#4B5563] font-medium">{row.label}:</span>
                  <span className={`font-bold text-[#111827] ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                </div>
              ))}
              {receiptModal.item.status === 'Paid' && (
                <div className="border-t border-[#F1E7CF] pt-2 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#4B5563] font-medium">Payment Date:</span>
                    <span className="font-bold text-[#111827]">{formatDate(receiptModal.item.paymentDate)}</span>
                  </div>
                  {receiptModal.item.receiptNumber && (
                    <div className="flex justify-between">
                      <span className="text-[#4B5563] font-medium">Receipt #:</span>
                      <span className="font-bold font-mono text-[#D99A00]">{receiptModal.item.receiptNumber}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
              This is an electronic statement from CampusVerse AI. For discrepancies, contact the accounts office.
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
};

// ─── Overview Section ────────────────────────────────────────────────────────

const OverviewSection = ({ profile, results, fees, notifications = [], attendanceReport, assignments = [] }) => {
  const overall = attendanceReport?.overallPercentage ?? 0;
  const pendingAssignments = (assignments || []).filter((a) => a.status === 'Pending' || a.submissionStatus === 'Pending').length;
  const feeList = (fees && fees.length > 0) ? fees : [];
  const totalFees = feeList.reduce((s, f) => s + (f.amount || 0), 0);
  const paidFees = feeList.filter((f) => f.status === 'Paid').reduce((s, f) => s + (f.paidAmount || f.amount || 0), 0);
  const feeDue = totalFees - paidFees;

  const totalObtained = (results || []).reduce((acc, r) => acc + (r.marksObtained || 0), 0);
  const totalMax = (results || []).reduce((acc, r) => acc + (r.maxMarks || 100), 0);
  const hasResults = results && results.length > 0;
  const cgpaValue = hasResults && totalMax > 0 ? ((totalObtained / totalMax) * 10).toFixed(2) : '0.00';

  const placementNotifs = notifications.filter(
    (n) => n.type === 'PLACEMENT_DRIVE' || n.category === 'Placement'
  );

  return (
    <div className="space-y-6">
      {/* Reference Image Inspired Hero Welcome Banner */}
      <PortalHeroBanner
        portalName="Student Portal"
        roleTitle="Student"
        portalHighlight="Student Portal"
        headingPrefix="Welcome to"
        subtitle="Access your academic profile, course rosters, attendance, telemetry, and grades — all in one place."
        icon={<GraduationCap className="w-4 h-4" />}
        userName={profile?.name || 'Student'}
        userIdentifier={profile?.studentId || '—'}
        actions={
          <Link to="/student/profile">
            <Button variant="secondary" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
              My Profile
            </Button>
          </Link>
        }
      />

      {/* 4 Summary Stat Cards with curated pastel containers */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={overall > 0 ? formatPercent(overall) : '0%'}
          subtitle={overall > 0 ? 'Semester average' : 'No records yet'}
          change={overall >= 75 ? 'Safe standing' : 'Needs attention'}
          changeType={overall >= 75 ? 'increase' : 'decrease'}
          colorVariant="gold"
          icon={<CalendarCheck className="w-5 h-5 text-[#D97706]" />}
        />
        <StatCard
          title="CGPA"
          value={cgpaValue}
          subtitle={hasResults ? `${results.length} course(s) evaluated` : 'No results published yet'}
          change={hasResults ? 'Active standing' : 'Pending evaluation'}
          changeType="increase"
          colorVariant="blue"
          icon={<GraduationCap className="w-5 h-5 text-[#2563EB]" />}
        />
        <StatCard
          title="Pending Tasks"
          value={pendingAssignments}
          subtitle="Assignments due"
          change={pendingAssignments > 0 ? 'Action needed' : 'All clear'}
          changeType={pendingAssignments > 0 ? 'decrease' : 'increase'}
          colorVariant="emerald"
          icon={<ClipboardList className="w-5 h-5 text-[#059669]" />}
        />
        <StatCard
          title="Fee Balance"
          value={formatCurrency(feeDue)}
          subtitle="Outstanding dues"
          change={feeDue === 0 ? 'All cleared' : 'Due soon'}
          changeType={feeDue === 0 ? 'increase' : 'decrease'}
          colorVariant="purple"
          icon={<IndianRupee className="w-5 h-5 text-[#7C3AED]" />}
        />
      </div>

      {/* Target Course-Wise Placement Opportunity Alert */}
      {placementNotifs.length > 0 && (
        <div className="p-5 rounded-2xl sm:rounded-3xl bg-[#FFFDF5] border border-[#FDE68A] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1E7CF] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] animate-ping" />
              <h3 className="text-sm font-bold text-[#0F172A]">
                A new placement opportunity is available for your course!
              </h3>
            </div>
            <Link to="/student/placement">
              <Button variant="primary" size="sm" className="!py-1.5 !text-xs">
                View & Apply
              </Button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {placementNotifs.slice(0, 3).map((n) => {
              const meta = n.metadata || {};
              return (
                <div key={n._id} className="p-3.5 bg-white rounded-2xl border border-[#F1E7CF] text-xs shadow-2xs hover:border-[#FDE68A] transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-black text-[#0F172A]">{n.companyName || meta.companyName}</span>
                    <Badge variant="teal" size="sm">{n.jobRole || meta.jobTitle || 'Role'}</Badge>
                  </div>
                  <p className="text-[#64748B] mt-1 font-medium">{n.message}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#64748B] font-mono">
                    {meta.displayPackage && (
                      <span className="font-bold text-[#D97706]">{meta.displayPackage}</span>
                    )}
                    {(n.driveDate || meta.driveDate) && (
                      <span>Drive Date: {new Date(n.driveDate || meta.driveDate).toLocaleDateString('en-IN')}</span>
                    )}
                    {(n.applicationDeadline || meta.applicationDeadline) && (
                      <span className="text-[#E11D48] font-bold">
                        Deadline: {new Date(n.applicationDeadline || meta.applicationDeadline).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Navigation Cards Inspired by Reference Image Bottom Feature Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/student/profile', label: 'My Profile', icon: <User className="w-5 h-5" />, desc: 'Personal details & contact info', iconBg: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]' },
          { to: '/student/attendance', label: 'Attendance Report', icon: <CalendarCheck className="w-5 h-5" />, desc: 'Subject-wise attendance & PDF report', iconBg: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
          { to: '/student/progress-report', label: 'Progress Report', icon: <TrendingUp className="w-5 h-5" />, desc: 'Assignments, midterms, lab marks & report', iconBg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' },
          { to: '/student/online-classes', label: 'Online Classes', icon: <Video className="w-5 h-5" />, desc: 'Virtual lectures, meeting links & live rooms', iconBg: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]' },
          { to: '/student/assignments', label: 'Assignments & Exams', icon: <ClipboardList className="w-5 h-5" />, desc: 'Active tasks, submissions & exam schedule', iconBg: 'bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]' },
          { to: '/student/projects', label: 'Live Projects', icon: <Code className="w-5 h-5" />, desc: 'Project portfolio submission & reviews', iconBg: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]' },
          { to: '/student/admit-card', label: 'Admit Card', icon: <FileCheck2 className="w-5 h-5" />, desc: 'Examination hall tickets & schedule', iconBg: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
          { to: '/student/certificates', label: 'Certificates & Resume', icon: <Award className="w-5 h-5" />, desc: 'Online tests, verified certificates & resume boost', iconBg: 'bg-[#FFF8E6] text-[#D97706] border-[#FDE68A]' },
          { to: '/student/fees', label: 'Fees & Invoices', icon: <IndianRupee className="w-5 h-5" />, desc: 'Semester invoices & payment receipts', iconBg: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]' },
          { to: '/student/placement', label: 'Placement Drives', icon: <Briefcase className="w-5 h-5" />, desc: 'Recruitment drives & resume application', iconBg: 'bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group block">
            <div className="p-5 rounded-2xl sm:rounded-3xl border border-[#F1E7CF] bg-white hover:border-[#FDE68A] shadow-[0_4px_20px_rgba(217,119,6,0.03)] hover:shadow-[0_12px_32px_rgba(217,119,6,0.09)] transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col justify-between">
              <div>
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-3.5 shadow-2xs group-hover:scale-110 transition-transform ${item.iconBg}`}>
                  {item.icon}
                </div>
                <p className="font-black text-[#0F172A] text-sm group-hover:text-[#D97706] transition-colors">{item.label}</p>
                <p className="text-xs text-[#64748B] font-medium mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Card title="Recent Notices" subtitle="Latest verified campus communications" badge={<Badge variant="teal" size="sm">Notice Board</Badge>}>
        <div className="space-y-3">
          {notifications.slice(0, 3).map((n) => (
            <div key={n._id || n.id} className="p-4 rounded-2xl border border-[#F1E7CF] bg-white hover:bg-[#FFFDF5] hover:border-[#FDE68A] transition-all text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-[#0F172A]">{n.title}</span>
                <Badge variant={n.priority === 'High' ? 'warning' : 'neutral'} size="sm">{n.category || 'General'}</Badge>
              </div>
              <p className="text-[#64748B] text-xs mt-1.5 leading-relaxed font-medium">{n.message || n.content}</p>
              <p className="text-[#64748B] text-[11px] font-semibold mt-1.5">{n.date || (n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : '')}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center text-[#64748B] text-sm py-6">No notices published yet</div>
          )}
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
  const [notifications, setNotifications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState(null);
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
      const [profileRes, resultsRes, feesRes, notifRes, attRes, assignRes] = await Promise.allSettled([
        studentService.getMyProfile(),
        resultService.list({ limit: 100 }),
        feeService.list({ limit: 100 }),
        studentService.getMyNotifications({ limit: 50 }),
        studentService.getAttendanceReport(),
        assignmentService.getMyAssignments(),
      ]);
      if (profileRes.status === 'fulfilled' && profileRes.value?.success) setProfile(profileRes.value.data);
      if (resultsRes.status === 'fulfilled' && resultsRes.value?.success) setResults(resultsRes.value.data || []);
      if (feesRes.status === 'fulfilled' && feesRes.value?.success) setFees(feesRes.value.data || []);
      if (notifRes.status === 'fulfilled' && notifRes.value?.success) setNotifications(notifRes.value.data || []);
      if (attRes.status === 'fulfilled' && attRes.value?.data) setAttendanceReport(attRes.value.data);
      if (assignRes.status === 'fulfilled' && assignRes.value?.data) {
        const list = assignRes.value.data?.assignments || assignRes.value.data || [];
        setAssignments(Array.isArray(list) ? list : []);
      }
    } catch {
      setError('Some data could not be loaded. Please refresh.');
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

  const loggedInName = user?.name || user?.username || 'Student';

  const SECTION_LABELS = {
    profile: 'My Profile',
    attendance: 'Attendance Report',
    academics: 'Academic Progress Report',
    'progress-report': 'Academic Progress Report',
    'online-classes': 'Online Classes & Live Lectures',
    assignments: 'Assignments & Examination Timetable',
    projects: 'Live Project Portfolio',
    'live-projects': 'Live Project Portfolio',
    'admit-card': 'Admit Card & Hall Ticket',
    certificates: 'Certificates & Resume Enhancement',
    'certificate-enhancement': 'Certificates & Resume Enhancement',
    fees: 'Fees & Invoices',
    placement: 'Placement Drives & Recruitment',
  };

  const sectionLabel = currentSection ? (SECTION_LABELS[currentSection] || currentSection) : null;

  return (
    <div className="space-y-6">
      {sectionLabel ? (
        <PageHeader
          title={sectionLabel}
          subtitle={`${loggedInName} · ${profile?.studentId || '—'} · ${profile?.department?.name || 'Computer Science & Engineering'}`}
          breadcrumbs={[
            { label: 'Student Portal', to: '/student' },
            { label: sectionLabel },
          ]}
          badge={<Badge variant="teal" size="sm"><Star className="w-3.5 h-3.5 mr-1 inline" />Dean's List</Badge>}
          actions={
            <div className="flex items-center gap-2.5">
              <Link to="/student">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Overview
                </Button>
              </Link>
              <Button variant="secondary" size="sm" leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} onClick={loadData} disabled={loading}>
                Refresh
              </Button>
            </div>
          }
        />
      ) : null}

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#FFF8E6] border border-[#D99A00] text-xs sm:text-sm text-[#111827] font-medium">
          <AlertCircle className="w-5 h-5 text-[#D99A00] flex-shrink-0" />{error}
        </div>
      )}
      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#FFF8E6] border border-[#D99A00] text-xs sm:text-sm text-[#111827] font-bold">
          <Check className="w-5 h-5 text-[#D99A00] flex-shrink-0" />Profile updated successfully.
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#FFF8E6] border border-[#111827] text-xs sm:text-sm text-[#111827] font-bold">
          <AlertCircle className="w-5 h-5 text-[#111827] flex-shrink-0" />{saveError}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[#FFF8E6]/30 animate-pulse border border-[#F1E7CF]" />)}
        </div>
      ) : (
        <React.Suspense fallback={<div className="h-40 rounded-2xl bg-[#FFF8E6]/30 animate-pulse border border-[#F1E7CF]" />}>
          {(!currentSection || currentSection === 'overview') && (
            <OverviewSection
              profile={profile}
              results={results}
              fees={fees}
              notifications={notifications}
              attendanceReport={attendanceReport}
              assignments={assignments}
            />
          )}
          {currentSection === 'profile' && (
            <ProfileSection user={user} profile={profile} onSave={handleSaveProfile} saving={saving} />
          )}
          {currentSection === 'attendance' && (
            <StudentAttendanceSection profile={profile} />
          )}
          {currentSection === 'online-classes' && (
            <StudentOnlineClassesSection profile={profile} />
          )}
          {(currentSection === 'progress-report' || currentSection === 'academics') && (
            <StudentProgressReportSection profile={profile} />
          )}
          {currentSection === 'assignments' && (
            <StudentAssignmentSection profile={profile} />
          )}
          {(currentSection === 'projects' || currentSection === 'live-projects') && (
            <StudentLiveProjectSection profile={profile} />
          )}
          {currentSection === 'admit-card' && (
            <StudentAdmitCardSection profile={profile} />
          )}
          {(currentSection === 'certificates' || currentSection === 'certificate-enhancement') && (
            <StudentCertificateSection profile={profile} />
          )}
          {currentSection === 'placement' && (
            <StudentPlacementSection profile={profile} />
          )}
          {currentSection === 'fees' && (
            <FeesSection fees={fees} />
          )}
        </React.Suspense>
      )}
    </div>
  );
};

export default StudentDashboard;
