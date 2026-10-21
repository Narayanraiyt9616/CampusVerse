import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  Check,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { adminService } from '../../../services/api';

const SECTIONS = [
  { id: 'student', label: 'Student', portal: '/login/student', badge: 'teal', desc: 'Student academic, timetable & attendance portal' },
  { id: 'faculty', label: 'Faculty', portal: '/login/faculty', badge: 'info', desc: 'Course instruction, attendance & marks portal' },
  { id: 'parent', label: 'Parent', portal: '/login/parent', badge: 'teal', desc: 'Parent / Guardian tracking & fee portal' },
  { id: 'placement', label: 'Placement', portal: '/login/placement', badge: 'success', desc: 'Placement cell recruitment drives portal' },
  { id: 'staff', label: 'Hostel Portal', portal: '/login/hostel', badge: 'teal', desc: 'Hostel residential blocks & estate operations' },
];

export const AdminCredentials = () => {
  // Credential creation state
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
  const [lastCreated, setLastCreated] = useState(null);
  const [copied, setCopied] = useState(false);

  // User management list state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Reset password modal state
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 10,
        q: search || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res && res.success) {
        setUsers(res.users || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalCount(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

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
        const sectionObj = SECTIONS.find((s) => s.id === credForm.section);
        const sectionLabel = sectionObj?.label || credForm.section;
        const portalUrl = sectionObj?.portal || '/login';

        setCreateSuccess(`Credentials for ${sectionLabel} created & saved securely in MongoDB!`);
        setLastCreated({
          sectionLabel,
          username: credForm.username.trim(),
          password: credForm.password,
          portal: portalUrl,
          createdAt: new Date().toLocaleTimeString(),
        });

        setCredForm({
          section: 'student',
          username: '',
          password: '',
          name: '',
        });

        fetchUsers();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to save credentials in database.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!lastCreated) return;
    const text = `CampusVerse AI Credentials\nPortal: ${lastCreated.sectionLabel}\nUsername: ${lastCreated.username}\nPassword: ${lastCreated.password}\nLogin URL: ${window.location.origin}${lastCreated.portal}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async (userObj) => {
    try {
      const newStatus = userObj.status === 'active' ? 'disabled' : 'active';
      const res = await adminService.updateUserStatus(userObj.id || userObj._id, newStatus);
      if (res && res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(`Could not update account status: ${err.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (!resetModalUser) return;
    setResetLoading(true);
    try {
      const res = await adminService.resetPassword(resetModalUser.id || resetModalUser._id, newPassword);
      if (res && res.success) {
        setResetSuccessMsg(`Password for ${resetModalUser.name || resetModalUser.username} has been reset successfully to: ${res.temporaryPassword || newPassword}`);
      }
    } catch (err) {
      alert(`Failed to reset password: ${err.message}`);
    } finally {
      setResetLoading(false);
    }
  };

  const columns = [
    {
      key: 'username',
      header: 'Username / Email',
      render: (_, r) => (
        <div>
          <p className="font-bold text-[#102A43] text-sm">{r.name || r.username}</p>
          <p className="font-mono text-xs text-[#102A43]/70 font-medium">@{r.username} • {r.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role / Terminal',
      render: (v) => (
        <Badge
          variant={
            v === 'admin'
              ? 'danger'
              : v === 'faculty'
              ? 'info'
              : 'teal'
          }
          size="sm"
        >
          {v}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      render: (v) => (
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#CCFBF1] text-[#102A43] border border-[#0D9488]"
        >
          <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
          {v}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Credential Controls',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => {
              setResetModalUser(r);
              setNewPassword('');
              setResetSuccessMsg('');
            }}
          >
            Reset Password
          </Button>

          <Button
            variant={r.status === 'active' ? 'secondary' : 'primary'}
            size="sm"
            className="text-xs"
            leftIcon={r.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            onClick={() => handleToggleStatus(r)}
          >
            {r.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module 1: Existing Credential Creation System */}
      <Card
        title="Provision Section Credentials"
        subtitle="Create, hash (bcrypt 12-rounds), and link authentication credentials for authorized university roles"
        badge={<Badge variant="teal" size="sm">RBAC Protected</Badge>}
      >
        <div className="space-y-6">
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
              title="Credential Error"
              message={createError}
              dismissible
              onDismiss={() => setCreateError('')}
            />
          )}

          {/* Quick copy credentials feedback card */}
          {lastCreated && (
            <div className="p-4 rounded-2xl bg-[#CCFBF1] border border-[#0D9488] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 text-xs text-[#102A43]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                  <span className="font-bold text-sm text-[#102A43]">Recently Saved Credentials:</span>
                  <Badge variant="teal" size="sm">{lastCreated.sectionLabel}</Badge>
                </div>
                <div className="text-[#102A43] font-mono text-xs space-x-3 font-semibold">
                  <span>Username: <strong>{lastCreated.username}</strong></span>
                  <span>•</span>
                  <span>Password: <strong>{lastCreated.password}</strong></span>
                  <span>•</span>
                  <span className="text-[#102A43]/70 font-medium">Saved at {lastCreated.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-[#0D9488]" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopyCredentials}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <a
                  href={lastCreated.portal}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0D9488] text-white hover:opacity-90 transition-colors shadow-sm"
                >
                  <span>Open {lastCreated.sectionLabel} Login</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Creation Form */}
          <form onSubmit={handleCreateCredentials} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2">
                  Target Section / Portal <span className="text-[#0D9488]">*</span>
                </label>
                <select
                  value={credForm.section}
                  onChange={(e) => setCredForm((prev) => ({ ...prev, section: e.target.value }))}
                  className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-[#CCFBF1] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                >
                  {SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.portal})
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-[#102A43]/70 font-medium">
                  {SECTIONS.find((s) => s.id === credForm.section)?.desc}
                </p>
              </div>

              <div>
                <Input
                  label="Username"
                  id="cred-username"
                  type="text"
                  placeholder="e.g. rahul_student or prof_roy"
                  value={credForm.username}
                  onChange={(e) => setCredForm((prev) => ({ ...prev, username: e.target.value }))}
                  required
                />
                <p className="mt-1.5 text-xs text-[#102A43]/70 font-medium">
                  Used exclusively to log in to this section.
                </p>
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    id="cred-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter secure password"
                    value={credForm.password}
                    onChange={(e) => setCredForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-9 text-[#102A43]/60 hover:text-[#102A43] p-1 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[#102A43]/70 font-medium">
                  Hashed with bcrypt (12 rounds) before database storage.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="w-full sm:w-auto">
                <Input
                  label="Full Name (Optional)"
                  id="cred-name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={credForm.name}
                  onChange={(e) => setCredForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="w-full sm:w-auto sm:self-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  isLoading={createLoading}
                  disabled={createLoading}
                  leftIcon={<Key className="w-4 h-4" />}
                >
                  {createLoading ? 'Saving Credentials...' : 'Save Credentials to Database'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      {/* Module 2: User Maintenance Directory & Credentials Management */}
      <Card
        title="Authorized Users & Credential Roster"
        subtitle="Manage account states, reset passwords, and inspect access permissions across all sections"
        badge={<Badge variant="navy" size="sm">{totalCount} Accounts</Badge>}
      >
        <div className="space-y-5">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#102A43]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm font-medium rounded-xl border border-[#CCFBF1] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">Search</Button>
            </form>

            <div className="flex items-center gap-2.5">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 text-xs sm:text-sm font-semibold rounded-xl border border-[#CCFBF1] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="parent">Parent</option>
                <option value="placement">Placement</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 text-xs sm:text-sm font-semibold rounded-xl border border-[#CCFBF1] bg-white text-[#102A43] focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />}
                onClick={fetchUsers}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            data={users}
            keyField="id"
            isLoading={usersLoading}
            emptyMessage="No accounts match the current filter criteria."
          />

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs sm:text-sm text-[#102A43]/70 font-semibold pt-3 border-t border-[#CCFBF1]">
              <span>Showing page {page} of {totalPages} ({totalCount} total users)</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Reset Password Modal */}
      <Modal
        isOpen={Boolean(resetModalUser)}
        onClose={() => setResetModalUser(null)}
        title="Reset User Password"
        description={`Set a new temporary password for ${resetModalUser?.name || resetModalUser?.username} (${resetModalUser?.email})`}
        footer={
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => setResetModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={resetLoading}
              disabled={resetLoading}
              onClick={handleResetPassword}
            >
              Confirm Password Reset
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {resetSuccessMsg ? (
            <AlertBanner variant="success" message={resetSuccessMsg} />
          ) : (
            <>
              <div>
                <Input
                  label="New Password (Leave blank to auto-generate)"
                  type="text"
                  placeholder="e.g. NewPass#2026"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-[#102A43]/70 font-medium mt-1.5">
                  The password will be hashed with bcrypt in the database immediately upon saving.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminCredentials;
