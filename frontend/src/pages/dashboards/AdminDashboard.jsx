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
  Download,
  Plus,
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
import AdminAdmitCards from './admin/AdminAdmitCards';

const SECTIONS_NAV = [
  { id: '', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'credentials', label: 'Credentials', icon: Key },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'faculty', label: 'Faculty', icon: GraduationCap },
  { id: 'academics', label: 'Academics', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'examinations', label: 'Exams & Results', icon: Award },
  { id: 'admit-cards', label: 'Admit Cards', icon: FileCheck2 },
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

  // Export Reports modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState('students');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');
  // Admit Card creation modal trigger for header action
  const [admitCardModalTrigger, setAdmitCardModalTrigger] = useState(0);

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
      case 'admit-cards':
        return 'Admit Card Management & Examination Hall Tickets';
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
      {/* Top Page Header (displayed on sub-sections) */}
      {currentSection && (
        <PageHeader
          title={getSectionTitle()}
          subtitle={`Dean & Registrar Administrator: ${user?.name || user?.username || 'Dr. Suresh Nambiar'} • ${user?.email || 'admin@campusverse.edu'}`}
          breadcrumbs={[
            { label: 'Admin Console', to: '/admin' },
            { label: getSectionTitle() },
          ]}
          badge={<Badge variant="navy" size="sm">Academic Year 2025-2026</Badge>}
          actions={
            <div className="flex items-center gap-2.5">
              <Link to="/admin">
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Overview
                </Button>
              </Link>
            {currentSection === 'credentials' && (
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
            )}
            {currentSection === 'admit-cards' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setAdmitCardModalTrigger((prev) => prev + 1)}
              >
                Create Admit Card
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              onClick={() => {
                setIsExportModalOpen(true);
                setExportError('');
              }}
            >
              Export Reports
            </Button>
          </div>
        }
      />
      )}

      {/* Quick Navigation Scroll Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#F1E7CF]">
        {SECTIONS_NAV.map((tab) => {
          const Icon = tab.icon;
          const isCurrent = currentSection === tab.id;
          return (
            <Link
              key={tab.id || 'overview'}
              to={tab.id ? `/admin/${tab.id}` : '/admin'}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                isCurrent
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-xs border border-[#F59E0B]'
                  : 'bg-white text-[#0F172A] hover:bg-[#FFF8E6] hover:border-[#FDE68A] border border-[#F1E7CF]'
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
        {currentSection === 'admit-cards' && <AdminAdmitCards createTrigger={admitCardModalTrigger} />}
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

      {/* Global Interactive Export Reports Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Institutional Data & Reports"
        description="Generate and download comprehensive official university datasets with accurate, live database records."
        footer={
          <div className="flex items-center justify-between w-full">
            <Link
              to="/admin/reports"
              onClick={() => setIsExportModalOpen(false)}
              className="text-xs font-bold text-[#D99A00] hover:underline"
            >
              Open Interactive Reports Table →
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExportModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={exportLoading}
                disabled={exportLoading}
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={async () => {
                  setExportLoading(true);
                  setExportError('');
                  try {
                    const res = await adminService.getReportData(exportType);
                    const rows = (res && res.data) || [];
                    if (rows.length === 0) {
                      setExportError('No records available for the selected report category.');
                      return;
                    }
                    const timestamp = new Date().toISOString().slice(0, 10);
                    const filename = `CampusVerse_${exportType}_Report_${timestamp}.${exportFormat}`;

                    if (exportFormat === 'json') {
                      const jsonStr = JSON.stringify(rows, null, 2);
                      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } else {
                      const headers = Object.keys(rows[0]);
                      let csv = '\uFEFF';
                      csv += headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';
                      rows.forEach((r) => {
                        csv += headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',') + '\r\n';
                      });
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }
                    setIsExportModalOpen(false);
                  } catch (err) {
                    setExportError(err.message || 'Failed to download report.');
                  } finally {
                    setExportLoading(false);
                  }
                }}
              >
                {exportLoading ? 'Generating File...' : `Download ${exportFormat.toUpperCase()}`}
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {exportError && (
            <AlertBanner
              variant="error"
              title="Export Error"
              message={exportError}
              dismissible
              onDismiss={() => setExportError('')}
            />
          )}

          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
              Select Report Dataset
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
            >
              <option value="students">Student Enrollment Registry (Students, Programs, Semesters)</option>
              <option value="faculty">Faculty & Academic Staff Roster (Designations, Qualifications)</option>
              <option value="attendance">Attendance Compliance & Shortage Report (Percentages, Defaulters)</option>
              <option value="results">Academic Performance & Examination Results (Grades, Marks)</option>
              <option value="fees">Institutional Fee Invoices & Dues Ledger (Collections, Balances)</option>
              <option value="admit-cards">Examination Admit Cards & Hall Ticket Registry</option>
              <option value="courses">Course Catalog & Curricula Mapping (Credits, Departments)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
              Export File Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  exportFormat === 'csv'
                    ? 'border-[#D99A00] bg-[#FFF8E6]/50 ring-1 ring-[#D99A00]'
                    : 'border-[#F1E7CF] bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="accent-[#D99A00]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#111827]">CSV / Excel</p>
                    <p className="text-[10px] text-[#4B5563]">Spreadsheet compatible with UTF-8</p>
                  </div>
                </div>
                <FileSpreadsheet className="w-4 h-4 text-[#D99A00]" />
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  exportFormat === 'json'
                    ? 'border-[#D99A00] bg-[#FFF8E6]/50 ring-1 ring-[#D99A00]'
                    : 'border-[#F1E7CF] bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                    className="accent-[#D99A00]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#111827]">JSON Dataset</p>
                    <p className="text-[10px] text-[#4B5563]">Structured programmatic schema</p>
                  </div>
                </div>
                <FileCheck2 className="w-4 h-4 text-[#D99A00]" />
              </label>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#4B5563] space-y-1">
            <p className="font-bold text-[#111827] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Complete & Live Data Export Guarantee:
            </p>
            <p className="leading-relaxed">
              The exported file will contain all live records directly from MongoDB without pagination truncation,
              including academic metadata, student identifications, and ledger records.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
