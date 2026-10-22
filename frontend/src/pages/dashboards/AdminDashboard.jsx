import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Building2,
  CalendarCheck,
  Award,
  IndianRupee,
  Clock,
  FileCheck2,
  FileSpreadsheet,
  Settings,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowLeft,
  LayoutDashboard,
  GraduationCap,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import AlertBanner from '../../components/common/AlertBanner';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';

// Sub-components for all 10 Admin Portal modules
import AdminOverview from './admin/AdminOverview';
import AdminCredentials from './admin/AdminCredentials';
import AdminStudents from './admin/AdminStudents';
import AdminFaculty from './admin/AdminFaculty';
import AdminAcademics from './admin/AdminAcademics';
import AdminAttendance from './admin/AdminAttendance';
import AdminExaminations from './admin/AdminExaminations';
import AdminFees from './admin/AdminFees';
import AdminSchedule from './admin/AdminSchedule';
import AdminApprovals from './admin/AdminApprovals';
import AdminReports from './admin/AdminReports';
import AdminSettings from './admin/AdminSettings';

const SECTIONS_NAV = [
  { id: '', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'credentials', label: 'Credentials', icon: Key },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'faculty', label: 'Faculty', icon: GraduationCap },
  { id: 'academics', label: 'Academics', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'examinations', label: 'Exams & Results', icon: Award },
  { id: 'fees', label: 'Fees & Invoices', icon: IndianRupee },
  { id: 'schedule', label: 'Schedule & Notices', icon: Clock },
  { id: 'approvals', label: 'Leaves & Approvals', icon: FileCheck2 },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const SECTIONS_CRED = [
  { id: 'student', label: 'Student', portal: '/login/student', badge: 'teal', desc: 'Student academic, timetable & attendance portal' },
  { id: 'faculty', label: 'Faculty', portal: '/login/faculty', badge: 'info', desc: 'Course instruction, attendance & marks portal' },
  { id: 'parent', label: 'Parent', portal: '/login/parent', badge: 'teal', desc: 'Parent / Guardian tracking & fee portal' },
  { id: 'placement', label: 'Placement', portal: '/login/placement', badge: 'success', desc: 'Placement cell recruitment drives portal' },
  { id: 'staff', label: 'Hostel Portal', portal: '/login/hostel', badge: 'teal', desc: 'Hostel blocks & estate operations' },
];

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { section } = useParams();

  // Create Credentials global modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [credForm, setCredForm] = useState({
    section: 'student',
    username: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const currentSection = section ? section.toLowerCase() : '';

  const handleCreateCredentials = async (e) => {
    if (e) e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!credForm.username.trim()) {
      setCreateError('Username is required.');
      return;
    }
    if (!credForm.password) {
      setCreateError('Password is required.');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await adminService.createCredentials({
        section: credForm.section,
        role: credForm.section,
        username: credForm.username.trim(),
        password: credForm.password,
        name: credForm.name.trim() || undefined,
      });

      if (res && res.success) {
        const sectionObj = SECTIONS_CRED.find((s) => s.id === credForm.section);
        const sectionLabel = sectionObj?.label || credForm.section;
        setCreateSuccess(`Credentials for ${sectionLabel} saved successfully in MongoDB database!`);
        setCredForm({
          section: 'student',
          username: '',
          password: '',
          name: '',
        });
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to save credentials in database.');
    } finally {
      setCreateLoading(false);
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'credentials':
        return 'Section Credential & User Management';
      case 'students':
        return 'Student Registry & Academic Profile Management';
      case 'faculty':
        return 'Teaching Faculty Roster & Department Governance';
      case 'academics':
      case 'departments':
        return 'Academic Departments, Courses & Curricula';
      case 'attendance':
        return 'Attendance Monitoring & Shortage Enforcement';
      case 'examinations':
        return 'Examinations Schedule & Results Publishing';
      case 'fees':
        return 'Institutional Fees Invoicing & Financial Ledger';
      case 'schedule':
        return 'Master Timetable Scheduling & Official Notices';
      case 'approvals':
      case 'complaints':
        return 'Faculty Leave Approvals & Executive Decisions';
      case 'reports':
        return 'Institutional Reports & Analytics Engine';
      case 'settings':
        return 'Administrative Security, Audit Logs & Settings';
      default:
        return 'CampusVerse AI Executive Administration Console';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <PageHeader
        title={getSectionTitle()}
        subtitle={`Dean & Registrar Administrator: ${user?.name || user?.username || 'Dr. Suresh Nambiar'} • ${user?.email || 'admin@campusverse.edu'}`}
        breadcrumbs={
          currentSection
            ? [{ label: 'Admin Console', to: '/admin' }, { label: getSectionTitle() }]
            : [{ label: 'Admin Console', to: '/admin' }, { label: 'Executive Overview' }]
        }
        badge={<Badge variant="navy" size="sm">Academic Year 2025-2026</Badge>}
        actions={
          <div className="flex items-center gap-2.5">
            {currentSection && (
              <Link to="/admin">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Overview
                </Button>
              </Link>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Key className="w-3.5 h-3.5" />}
              onClick={() => {
                setIsCreateModalOpen(true);
                setCreateError('');
                setCreateSuccess('');
              }}
            >
              Create Credentials
            </Button>
            <Link to="/admin/reports">
              <Button variant="secondary" size="sm" leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}>
                Export Reports
              </Button>
            </Link>
          </div>
        }
      />

      {/* Quick Navigation Scroll Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#F1E7CF]">
        {SECTIONS_NAV.map((tab) => {
          const Icon = tab.icon;
          const isCurrent = currentSection === tab.id;
          return (
            <Link
              key={tab.id || 'overview'}
              to={tab.id ? `/admin/${tab.id}` : '/admin'}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isCurrent
                  ? 'bg-[#D99A00] text-white shadow-sm border border-[#D99A00]'
                  : 'bg-white text-[#111827] hover:bg-[#FFF8E6] border border-[#F1E7CF]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Dynamic Section View Rendering */}
      <div>
        {!currentSection && <AdminOverview onOpenCreateCreds={() => setIsCreateModalOpen(true)} />}
        {currentSection === 'credentials' && <AdminCredentials />}
        {currentSection === 'students' && <AdminStudents />}
        {currentSection === 'faculty' && <AdminFaculty />}
        {(currentSection === 'academics' || currentSection === 'departments') && <AdminAcademics />}
        {currentSection === 'attendance' && <AdminAttendance />}
        {currentSection === 'examinations' && <AdminExaminations />}
        {currentSection === 'fees' && <AdminFees />}
        {currentSection === 'schedule' && <AdminSchedule />}
        {(currentSection === 'approvals' || currentSection === 'complaints') && <AdminApprovals />}
        {currentSection === 'reports' && <AdminReports />}
        {currentSection === 'settings' && <AdminSettings />}
      </div>

      {/* Global Quick Create Credentials Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Section Credentials"
        description="Provision secure login credentials for Student, Faculty, Parent, Placement, Hostel & Transport Staff, or Super Admin."
        footer={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={createLoading}
              disabled={createLoading}
              leftIcon={<Key className="w-3.5 h-3.5" />}
              onClick={handleCreateCredentials}
            >
              {createLoading ? 'Saving...' : 'Create & Save to DB'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {createSuccess && (
            <AlertBanner
              variant="success"
              title="Credentials Saved Securely"
              message={createSuccess}
              dismissible
              onDismiss={() => setCreateSuccess('')}
            />
          )}

          {createError && (
            <AlertBanner
              variant="error"
              title="Error"
              message={createError}
              dismissible
              onDismiss={() => setCreateError('')}
            />
          )}

          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
              Target Section / Portal Role <span className="text-[#D99A00]">*</span>
            </label>
            <select
              value={credForm.section}
              onChange={(e) => setCredForm((prev) => ({ ...prev, section: e.target.value }))}
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
            >
              {SECTIONS_CRED.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.portal})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Input
              label="Username"
              type="text"
              placeholder="e.g. rahul_cse or prof_sharma"
              value={credForm.username}
              onChange={(e) => setCredForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter account password"
                value={credForm.password}
                onChange={(e) => setCredForm((prev) => ({ ...prev, password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-9 text-[#4B5563] hover:text-[#111827] p-1 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <Input
              label="Full Name (Optional)"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={credForm.name}
              onChange={(e) => setCredForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
