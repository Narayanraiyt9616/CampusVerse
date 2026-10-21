import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Lock,
  RefreshCw,
  Search,
  CheckCircle2,
  Server,
  Database,
  UserCheck,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService, authService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export const AdminSettings = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Password change state
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, setRes] = await Promise.all([
        adminService.getAuditLogs({ page, limit: 15, action: actionFilter || undefined }),
        adminService.getSettings(),
      ]);

      if (logsRes && logsRes.success) {
        setLogs(logsRes.logs || []);
        setTotalPages(logsRes.pagination?.totalPages || 1);
      }
      if (setRes && setRes.success) {
        setSettings(setRes.settings);
      }
    } catch (err) {
      console.error('Settings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      if (res && res.success) {
        setPassMsg('Administrator password changed successfully!');
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const columns = [
    {
      key: 'action',
      header: 'Security Event Action',
      render: (v) => <span className="font-mono font-bold text-xs text-navy-900">{v}</span>,
    },
    {
      key: 'details',
      header: 'Event Notation',
      render: (v) => <span className="text-xs text-slate-700 font-medium">{v}</span>,
    },
    {
      key: 'ipAddress',
      header: 'Origin IP',
      render: (v) => <span className="font-mono text-[11px] text-slate-500">{v || '127.0.0.1'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (v) => (
        <span className="font-mono text-xs text-slate-500">
          {v ? new Date(v).toLocaleString() : ''}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* System Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Database Node</p>
              <p className="text-sm font-bold text-slate-800">MongoDB Atlas Cluster</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active ReplicaSet Connected
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Security Mode</p>
              <p className="text-sm font-bold text-slate-800">RBAC Role Enforcement</p>
              <span className="text-[10px] text-indigo-600 font-semibold">JWT Bearer Verification Active</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Academic Year</p>
              <p className="text-sm font-bold text-slate-800">{settings?.currentAcademicYear || '2025-2026'}</p>
              <span className="text-[10px] text-purple-600 font-semibold">{settings?.activeSemesterSeason || 'Odd Semester'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Account Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card
            title="Administrator Credentials"
            subtitle="Change executive password"
          >
            {passMsg && <AlertBanner variant="success" message={passMsg} />}
            {passError && <AlertBanner variant="danger" message={passError} />}

            <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
              <div>
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Input
                  label="New Secure Password"
                  type="password"
                  placeholder="Enter new password"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="teal"
                size="md"
                className="w-full"
                loading={passLoading}
                disabled={passLoading}
                leftIcon={<Lock className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </form>
          </Card>

          <Card
            title="Institutional Governance"
            subtitle="CampusVerse AI Core Parameters"
          >
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Institution:</span>
                <span className="font-semibold text-slate-800 text-right">{settings?.institutionName || 'CampusVerse AI'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Attendance Bar:</span>
                <span className="font-bold text-rose-600">{settings?.attendanceShortageThreshold || 75}% Minimum</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Active Admin:</span>
                <span className="font-mono text-slate-800">{user?.email || 'admin@campusverse.edu'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Security Audit Trail */}
        <div className="lg:col-span-2">
          <Card
            title="Administrative Security & Audit Log Stream"
            subtitle="Immutable records of administrative mutations and authentication events"
            badge={<Badge variant="navy" size="sm">Audit Roster</Badge>}
            actions={
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
                onClick={fetchAuditLogs}
              >
                Refresh
              </Button>
            }
          >
            <div className="space-y-4">
              <Table
                columns={columns}
                data={logs}
                keyField="_id"
                isLoading={loading}
                emptyMessage="No audit logs recorded."
              />

              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Page {page} of {totalPages}</span>
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
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
