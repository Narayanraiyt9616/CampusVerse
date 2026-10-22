import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCcw,
  Edit2,
  Key,
  ToggleLeft,
  ToggleRight,
  Copy,
  CheckCircle,
  X,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { adminService } from '../../services/api';

const ROLES = [
  { value: 'student',   label: 'Student'           },
  { value: 'faculty',   label: 'Faculty'            },
  { value: 'parent',    label: 'Parent / Guardian'  },
  { value: 'placement', label: 'Placement Officer'  },
  { value: 'staff',     label: 'Staff'              },
];

const ROLE_BADGE = {
  student:   'teal',
  faculty:   'navy',
  parent:    'success',
  placement: 'warning',
  staff:     'neutral',
  admin:     'danger',
  superadmin:'danger',
};

const PORTAL_MAP = {
  student:   '/student',
  faculty:   '/faculty',
  parent:    '/parent',
  placement: '/placement',
  staff:     '/staff',
};

const EMPTY_FORM = {
  name: '',
  email: '',
  username: '',
  role: '',
  department: '',
  customPassword: '',
  metadata: {
    studentId: '',
    semester: '',
    enrollmentYear: '',
    employeeId: '',
    designation: '',
    phone: '',
  },
};

/* ───────────── Credential Display Modal ───────────── */
function CredentialModal({ isOpen, onClose, data }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Username: ${data?.user?.username || ''}\nPassword: ${data?.temporaryPassword || ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Account Created — Credentials"
      description="Share these temporary credentials with the user. They must change their password on first login."
    >
      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFF8E6] border border-[#D99A00] rounded-2xl space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#4B5563] font-bold">Name</span>
              <span className="font-bold text-[#111827]">{data.user?.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#4B5563] font-bold">Email</span>
              <span className="font-mono font-semibold text-[#111827]">{data.user?.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#4B5563] font-bold">Username</span>
              <span className="font-mono font-extrabold text-[#D99A00]">@{data.user?.username}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#4B5563] font-bold">Role</span>
              <Badge variant="teal" size="sm">
                {data.user?.role}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-[#D99A00]/30 pt-3">
              <span className="text-[#4B5563] font-bold">Temporary Password</span>
              <span className="font-mono font-extrabold text-lg text-[#111827] tracking-wider bg-white px-3.5 py-1 rounded-xl border border-[#D99A00]">
                {data.temporaryPassword}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#4B5563] font-bold">Portal URL</span>
              <span className="font-mono text-xs font-semibold text-[#111827]">
                {window.location.origin}{PORTAL_MAP[data.user?.role] || '/'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-3.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl">
            <AlertTriangle className="w-4 h-4 text-[#D99A00] shrink-0" />
            <p className="text-xs text-[#111827] font-semibold">
              This password will not be shown again. Copy and share it securely with the user.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full"
            leftIcon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            onClick={handleCopy}
          >
            {copied ? 'Copied to Clipboard!' : 'Copy Credentials to Clipboard'}
          </Button>
        </div>
      )}
    </Modal>
  );
}

/* ───────────── Create / Edit User Modal ───────────── */
function UserFormModal({ isOpen, onClose, onSuccess, editUser, departments }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const activeRole = editUser ? editUser.role : form.role;

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name || '',
        email: editUser.email || '',
        username: editUser.username || '',
        role: editUser.role || '',
        department: editUser.department?._id || editUser.department || '',
        customPassword: '',
        metadata: {
          studentId:     editUser.metadata?.studentId     || '',
          semester:      editUser.metadata?.semester      || '',
          enrollmentYear:editUser.metadata?.enrollmentYear|| '',
          employeeId:    editUser.metadata?.employeeId    || '',
          designation:   editUser.metadata?.designation   || '',
          phone:         editUser.metadata?.phone         || '',
        },
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
    setShowPwd(false);
  }, [editUser, isOpen]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setMeta = (key, val) => setForm((f) => ({ ...f, metadata: { ...f.metadata, [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }
    if (!editUser && !form.role) {
      setError('Please select a role for the new account.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        username: form.username.trim() || undefined,
        department: form.department || undefined,
        metadata: form.metadata,
      };
      if (!editUser) {
        payload.role = form.role;
        if (form.customPassword.trim()) {
          payload.customPassword = form.customPassword.trim();
        }
      }
      const result = editUser
        ? await adminService.updateUser(editUser.id, payload)
        : await adminService.createUser(payload);

      onSuccess(result, !editUser);
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editUser ? 'Edit User Account' : 'Create New User Account'}
      description={
        editUser
          ? `Editing profile for ${editUser.email}`
          : 'Create an account for Student, Faculty, Parent, Placement Officer, or Staff.'
      }
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="teal"
            size="sm"
            leftIcon={loading ? <LoadingSpinner size="sm" /> : <ShieldCheck className="w-4 h-4" />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {editUser ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} id="user-form" className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <X className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="uf-name"
            label="Full Name"
            name="name"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Dr. Arjun Sharma"
          />
          <Input
            id="uf-email"
            label="Email Address"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="user@campusverse.edu"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="uf-username"
            label="Username (optional)"
            name="username"
            value={form.username}
            onChange={(e) => set('username', e.target.value)}
            placeholder="auto-generated if blank"
            helperText="Letters, numbers, dots, underscores"
          />
          {!editUser ? (
            <Select
              id="uf-role"
              label="Role"
              name="role"
              required
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
              placeholder="Select role..."
            />
          ) : (
            <Select
              id="uf-dept"
              label="Department"
              name="department"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              options={[{ value: '', label: 'No department' }, ...departments.map((d) => ({ value: d._id, label: d.name }))]}
              placeholder="No department"
            />
          )}
        </div>

        {!editUser && (
          <Select
            id="uf-dept2"
            label="Department (optional)"
            name="department"
            value={form.department}
            onChange={(e) => set('department', e.target.value)}
            options={[{ value: '', label: 'No department' }, ...departments.map((d) => ({ value: d._id, label: d.name }))]}
            placeholder="No department"
          />
        )}

        {/* Student-specific metadata */}
        {activeRole === 'student' && (
          <div className="p-3 bg-[#FFF8E6] border border-[#F1E7CF] rounded-lg space-y-3">
            <p className="text-xs font-semibold text-[#D99A00] uppercase tracking-wider">Student Details</p>
            <div className="grid grid-cols-3 gap-3">
              <Input id="uf-sid" label="Student ID" value={form.metadata.studentId} onChange={(e) => setMeta('studentId', e.target.value)} placeholder="CS21B1042" />
              <Input id="uf-sem" label="Semester" type="number" value={form.metadata.semester} onChange={(e) => setMeta('semester', e.target.value)} placeholder="1–12" />
              <Input id="uf-year" label="Enrollment Year" type="number" value={form.metadata.enrollmentYear} onChange={(e) => setMeta('enrollmentYear', e.target.value)} placeholder="2024" />
            </div>
          </div>
        )}

        {/* Faculty/Staff/Placement metadata */}
        {['faculty', 'staff', 'placement'].includes(activeRole) && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Staff / Faculty Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Input id="uf-eid" label="Employee ID" value={form.metadata.employeeId} onChange={(e) => setMeta('employeeId', e.target.value)} placeholder="FAC-001" />
              <Input id="uf-des" label="Designation" value={form.metadata.designation} onChange={(e) => setMeta('designation', e.target.value)} placeholder="Assistant Professor" />
            </div>
          </div>
        )}

        {/* Parent metadata */}
        {activeRole === 'parent' && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-3">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Guardian Details</p>
            <Input id="uf-phone" label="Contact Number" value={form.metadata.phone} onChange={(e) => setMeta('phone', e.target.value)} placeholder="+91 98765 43210" />
          </div>
        )}

        {/* Password field (create only) */}
        {!editUser && (
          <div className="relative">
            <Input
              id="uf-pwd"
              label="Custom Temporary Password (optional)"
              name="customPassword"
              type={showPwd ? 'text' : 'password'}
              value={form.customPassword}
              onChange={(e) => set('customPassword', e.target.value)}
              placeholder="Leave blank to auto-generate"
              helperText="Min. 8 characters. Leave blank to auto-generate a strong password."
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="pointer-events-auto text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700">
            {editUser
              ? 'Profile changes are saved immediately. Password is not affected by this form.'
              : 'Password is hashed with bcrypt (12 rounds). The user must change it on first login.'}
          </p>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────── Reset Password Modal ───────────── */
function ResetPasswordModal({ isOpen, onClose, user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.resetPassword(user.id);
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset User Password"
      description={`Generate a new temporary password for ${user?.name || 'this user'}.`}
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReset}
            disabled={loading}
            leftIcon={loading ? <LoadingSpinner size="sm" /> : <Key className="w-4 h-4" />}
          >
            Reset Password
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <X className="w-4 h-4" /> {error}
          </div>
        )}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Account</span>
            <span className="font-semibold">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-mono">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <Badge variant={ROLE_BADGE[user?.role] || 'neutral'} size="sm">{user?.role}</Badge>
          </div>
        </div>
        <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
          <p className="text-xs text-rose-700">
            The existing password will be immediately invalidated. A new cryptographically secure temporary
            password will be generated and displayed once. The user must change it on their next login.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── Main User Management Page ───────────── */
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [createModal, setCreateModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [credentialData, setCredentialData] = useState(null);
  const [statusTogglingId, setStatusTogglingId] = useState(null);

  const searchTimer = useRef(null);

  const fetchUsers = useCallback(async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit: 12 };
      if (search.trim()) params.q = search.trim();
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.users);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users. Ensure you are logged in as Admin.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    adminService.getDepartments()
      .then((res) => { if (res?.data) setDepartments(res.data); })
      .catch(() => {});
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers(1), 500);
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    setStatusTogglingId(user.id);
    try {
      const res = await adminService.updateStatus(user.id, newStatus);
      if (res.success) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setStatusTogglingId(null);
    }
  };

  const handleCreateSuccess = (result, wasCreate) => {
    if (wasCreate && result.temporaryPassword) {
      setCredentialData(result);
    }
    fetchUsers();
  };

  const handleResetSuccess = (result) => {
    if (result.temporaryPassword) {
      setCredentialData(result);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'User',
      render: (v, r) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{v}</p>
          <p className="text-[11px] text-slate-500 font-mono">{r.email}</p>
          {r.username && <p className="text-[11px] text-slate-400">@{r.username}</p>}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (v) => <Badge variant={ROLE_BADGE[v] || 'neutral'} size="sm" hasDot>{v}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => (
        <Badge variant={v === 'active' ? 'success' : 'danger'} size="sm" hasDot>
          {v === 'active' ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      key: 'mustChangePassword',
      header: 'Password',
      render: (v) => v ? (
        <Badge variant="warning" size="sm">Must Change</Badge>
      ) : (
        <Badge variant="neutral" size="sm">Normal</Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (v) => (
        <span className="font-mono text-xs text-slate-500">
          {v ? new Date(v).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setEditUser(r)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            title="Edit user profile"
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => setResetUser(r)}
            leftIcon={<Key className="w-3.5 h-3.5" />}
            title="Reset password"
          >
            Reset Pwd
          </Button>
          <Button
            variant={r.status === 'active' ? 'danger' : 'teal'}
            size="sm"
            className="text-xs"
            disabled={statusTogglingId === r.id}
            onClick={() => handleToggleStatus(r)}
            leftIcon={r.status === 'active'
              ? <ToggleRight className="w-3.5 h-3.5" />
              : <ToggleLeft className="w-3.5 h-3.5" />
            }
          >
            {statusTogglingId === r.id ? '…' : r.status === 'active' ? 'Disable' : 'Enable'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Create, edit, and manage all portal user accounts with full access control"
        breadcrumbs={[{ label: 'Admin Console', to: '/admin' }, { label: 'User Management' }]}
        badge={<Badge variant="navy" size="sm">{pagination.total} Users</Badge>}
        actions={
          <Button
            variant="teal"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            id="btn-create-user"
            onClick={() => setCreateModal(true)}
          >
            Create User
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 max-w-sm">
            <Input
              id="um-search"
              label="Search"
              placeholder="Name, email, username..."
              value={search}
              onChange={handleSearchChange}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select
            id="um-role-filter"
            label="Role"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            options={[
              { value: 'all', label: 'All Roles' },
              ...ROLES.map((r) => ({ value: r.value, label: r.label })),
              { value: 'admin', label: 'Admin' },
              { value: 'superadmin', label: 'Super Admin' },
            ]}
            className="w-44"
          />
          <Select
            id="um-status-filter"
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'disabled', label: 'Disabled' },
            ]}
            className="w-36"
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCcw className="w-3.5 h-3.5" />}
            onClick={() => fetchUsers()}
            className="mb-0.5"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card
        title={`User Accounts — ${pagination.total} total`}
        subtitle="All registered portal users with role-based access control"
        badge={
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <Badge variant="neutral" size="sm">Pg {pagination.page}/{pagination.totalPages}</Badge>
          </div>
        }
      >
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting filters or create a new account.</p>
          </div>
        ) : (
          <>
            <Table columns={columns} data={users} keyField="id" />
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.totalPages} — {pagination.total} total users
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    ← Prev
                  </Button>
                  <Button variant="secondary" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      <UserFormModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        onSuccess={handleCreateSuccess}
        editUser={null}
        departments={departments}
      />
      <UserFormModal
        isOpen={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        onSuccess={handleCreateSuccess}
        editUser={editUser}
        departments={departments}
      />
      {resetUser && (
        <ResetPasswordModal
          isOpen={Boolean(resetUser)}
          onClose={() => setResetUser(null)}
          user={resetUser}
          onSuccess={handleResetSuccess}
        />
      )}
      <CredentialModal
        isOpen={Boolean(credentialData)}
        onClose={() => setCredentialData(null)}
        data={credentialData}
      />
    </div>
  );
};

export default UserManagement;
