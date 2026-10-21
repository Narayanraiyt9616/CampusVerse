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
  { id: 'staff', label: 'Hostel & Transport Staff', portal: '/login/staff', badge: 'warning', desc: 'Hostel blocks & transport fleet operations' },
  { id: 'superadmin', label: 'Super Admin', portal: '/login/super-admin', badge: 'danger', desc: 'Root security governance & audit telemetry' },
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
        setCreateSuccess(`Credentials for ${sectionLabel} saved successfully in MongoDB database!`);
        setLastCreated({
          section: credForm.section,
          sectionLabel,
          portal: sectionObj?.portal || `/login/${credForm.section}`,
          username: credForm.username.trim(),
          password: credForm.password,
          name: res.user?.name || credForm.username.trim(),
          createdAt: new Date().toLocaleTimeString(),
        });
        setCredForm((prev) => ({
          ...prev,
          username: '',
          password: '',
          name: '',
        }));
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
    const text = `Section: ${lastCreated.sectionLabel}\nUsername: ${lastCreated.username}\nPassword: ${lastCreated.password}\nLogin Portal: ${window.location.origin}${lastCreated.portal}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await adminService.updateStatus(user.id || user._id, nextStatus);
      if (res && res.success) {
        fetchUsers();
      }
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!resetModalUser) return;

    setResetLoading(true);
    setResetSuccessMsg('');
    try {
      const res = await adminService.resetPassword(resetModalUser.id || resetModalUser._id, newPassword || undefined);
      if (res && res.success) {
        setResetSuccessMsg(`Password successfully reset! Temporary password: ${res.temporaryPassword || newPassword}`);
        setTimeout(() => {
          setResetModalUser(null);
          setNewPassword('');
          setResetSuccessMsg('');
        }, 3000);
      }
    } catch (err) {
      alert(`Password reset failed: ${err.message}`);
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
          <p className="font-semibold text-slate-800 text-xs">{r.name || r.username}</p>
          <p className="font-mono text-[11px] text-slate-500">@{r.username} • {r.email}</p>
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
              : v === 'student'
              ? 'teal'
              : v === 'placement'
              ? 'success'
              : 'neutral'
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
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            v === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${v === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {v}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Credential Controls',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            leftIcon={<RotateCcw className="w-3 h-3" />}
            onClick={() => {
              setResetModalUser(r);
              setNewPassword('');
              setResetSuccessMsg('');
            }}
          >
            Reset Password
          </Button>

          <Button
            variant={r.status === 'active' ? 'secondary' : 'teal'}
            size="sm"
            className="text-xs"
            leftIcon={r.status === 'active' ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
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
      {/* Module 1: Existing Credential Creation System (Preserved 100%) */}
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
              variant="danger"
              title="Credential Error"
              message={createError}
              dismissible
              onDismiss={() => setCreateError('')}
            />
          )}

          {/* Quick copy credentials feedback card */}
          {lastCreated && (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span className="font-bold text-teal-900">Recently Saved Credentials:</span>
                  <Badge variant="teal" size="sm">{lastCreated.sectionLabel}</Badge>
                </div>
                <div className="text-slate-700 font-mono text-[11px] space-x-3">
                  <span>Username: <strong>{lastCreated.username}</strong></span>
                  <span>•</span>
                  <span>Password: <strong>{lastCreated.password}</strong></span>
                  <span>•</span>
                  <span className="text-slate-500">Saved at {lastCreated.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  onClick={handleCopyCredentials}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <a
                  href={lastCreated.portal}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
                >
                  <span>Open {lastCreated.sectionLabel} Login</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Creation Form */}
          <form onSubmit={handleCreateCredentials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Section / Portal <span className="text-rose-500">*</span>
                </label>
                <select
                  value={credForm.section}
                  onChange={(e) => setCredForm((prev) => ({ ...prev, section: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
                >
                  {SECTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.portal})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
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
                <p className="mt-1 text-[11px] text-slate-500">
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
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Hashed with bcrypt (12 rounds) before database storage.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
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
                  variant="teal"
                  size="md"
                  className="w-full sm:w-auto"
                  loading={createLoading}
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
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">Search</Button>
            </form>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
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
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setResetModalUser(null)}>
              Cancel
            </Button>
            <Button
              variant="teal"
              size="sm"
              loading={resetLoading}
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
                <p className="text-[11px] text-slate-500 mt-1">
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
