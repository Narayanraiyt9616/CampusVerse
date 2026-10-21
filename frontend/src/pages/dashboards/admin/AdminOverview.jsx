import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Building2,
  CalendarCheck,
  Award,
  IndianRupee,
  Clock,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Key,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import StatCard from '../../../components/common/StatCard';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

export const AdminOverview = ({ onOpenCreateCreds }) => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStats();
      if (res && res.success) {
        setStats(res.stats);
        setRecentUsers(res.recentUsers || []);
        setRecentLogs(res.recentLogs || []);
      }
    } catch (err) {
      console.error('Fetch overview error:', err);
      setError(err.message || 'Failed to connect to database metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading real-time institutional metrics...</p>
      </div>
    );
  }

  const feeBilled = stats?.fees?.totalBilled || 0;
  const feeCollected = stats?.fees?.totalCollected || 0;
  const feePending = stats?.fees?.pendingAmount || 0;
  const feeRecoveryPct = feeBilled > 0 ? Math.round((feeCollected / feeBilled) * 100) : 0;

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Telemetry Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={stats?.students ?? 0}
          subtitle={`Across ${stats?.departments ?? 0} Departments`}
          change={`${stats?.activeAccounts ?? 0} Active accounts`}
          changeType="increase"
          colorVariant="teal"
          icon={<Users className="w-5 h-5 text-teal-600" />}
        />
        <StatCard
          title="Teaching Faculty"
          value={stats?.faculty ?? 0}
          subtitle="Professors & Instructors"
          change="Accredited"
          changeType="increase"
          colorVariant="navy"
          icon={<GraduationCap className="w-5 h-5 text-navy-800" />}
        />
        <StatCard
          title="Attendance Shortages"
          value={stats?.attendanceShortageCount ?? 0}
          subtitle="Students below 75% threshold"
          change={stats?.attendanceShortageCount > 0 ? 'Action Recommended' : 'Compliant'}
          changeType={stats?.attendanceShortageCount > 0 ? 'decrease' : 'increase'}
          colorVariant={stats?.attendanceShortageCount > 0 ? 'rose' : 'emerald'}
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        />
        <StatCard
          title="Realized Fee Recovery"
          value={`₹${(feeCollected / 1000).toFixed(0)}k`}
          subtitle={`Pending: ₹${(feePending / 1000).toFixed(0)}k`}
          change={`${feeRecoveryPct}% Realized`}
          changeType={feeRecoveryPct >= 70 ? 'increase' : 'decrease'}
          colorVariant="amber"
          icon={<IndianRupee className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Secondary Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Departments</p>
            <p className="text-base font-bold text-slate-800">{stats?.departments ?? 0}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Courses</p>
            <p className="text-base font-bold text-slate-800">{stats?.courses ?? 0}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Attendance Sessions</p>
            <p className="text-base font-bold text-slate-800">{stats?.attendanceSessions ?? 0}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Upcoming Exams</p>
            <p className="text-base font-bold text-slate-800">{stats?.upcomingExams ?? 0}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Pending Leaves</p>
            <p className="text-base font-bold text-slate-800">{stats?.pendingLeavesCount ?? 0}</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Total Accounts</p>
            <p className="text-base font-bold text-slate-800">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection Recovery Progress */}
        <Card
          title="Institutional Fee Recovery"
          subtitle="Real-time collection vs pending student dues"
          badge={<Badge variant={feeRecoveryPct >= 70 ? 'success' : 'warning'} size="sm">{feeRecoveryPct}% Collected</Badge>}
        >
          <div className="space-y-4 pt-1">
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-teal-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, feeRecoveryPct))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Billed</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">₹{feeBilled.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-[10px] text-emerald-600 font-semibold uppercase">Collected</p>
                <p className="text-xs font-bold text-emerald-800 mt-0.5">₹{feeCollected.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-[10px] text-rose-600 font-semibold uppercase">Pending</p>
                <p className="text-xs font-bold text-rose-800 mt-0.5">₹{feePending.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Overdue Invoices: <strong>{stats?.fees?.overdueCount || 0}</strong></span>
              <Link to="/admin/fees" className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1">
                <span>Manage Fees</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Attendance Compliance Distribution */}
        <Card
          title="Attendance Compliance"
          subtitle="Real-time check against 75% regulatory requirement"
          badge={
            stats?.attendanceShortageCount > 0 ? (
              <Badge variant="danger" size="sm">{stats?.attendanceShortageCount} Defaulters</Badge>
            ) : (
              <Badge variant="success" size="sm">100% Compliant</Badge>
            )
          }
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Healthy Attendance (≥ 75%)</p>
                  <p className="text-[11px] text-slate-500">Eligible for end-semester exams</p>
                </div>
              </div>
              <span className="font-bold text-sm text-emerald-700">
                {Math.max(0, (stats?.students || 0) - (stats?.attendanceShortageCount || 0))}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">Shortage Defaulters (&lt; 75%)</p>
                  <p className="text-[11px] text-rose-600">Shortage notices pending</p>
                </div>
              </div>
              <span className="font-bold text-sm text-rose-700">{stats?.attendanceShortageCount || 0}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Recorded Sessions: <strong>{stats?.attendanceSessions || 0}</strong></span>
              <Link to="/admin/attendance" className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1">
                <span>View Shortages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* Quick Administrator Actions */}
        <Card
          title="Quick Institutional Actions"
          subtitle="Direct executive shortcuts for daily operations"
        >
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenCreateCreds}
              className="p-3 text-left rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 transition-colors flex flex-col justify-between"
            >
              <Key className="w-4 h-4 text-teal-700 mb-1.5" />
              <span className="text-xs font-bold text-teal-900">Create Credentials</span>
              <span className="text-[10px] text-teal-700">Student, Faculty, Staff</span>
            </button>

            <Link
              to="/admin/students"
              className="p-3 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col justify-between"
            >
              <Users className="w-4 h-4 text-slate-700 mb-1.5" />
              <span className="text-xs font-bold text-slate-900">Add New Student</span>
              <span className="text-[10px] text-slate-500">Registry & profile</span>
            </Link>

            <Link
              to="/admin/faculty"
              className="p-3 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col justify-between"
            >
              <GraduationCap className="w-4 h-4 text-slate-700 mb-1.5" />
              <span className="text-xs font-bold text-slate-900">Appoint Faculty</span>
              <span className="text-[10px] text-slate-500">Subjects & permissions</span>
            </Link>

            <Link
              to="/admin/fees"
              className="p-3 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col justify-between"
            >
              <IndianRupee className="w-4 h-4 text-slate-700 mb-1.5" />
              <span className="text-xs font-bold text-slate-900">Issue Fee Invoice</span>
              <span className="text-[10px] text-slate-500">Record payments</span>
            </Link>

            <Link
              to="/admin/schedule"
              className="p-3 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col justify-between"
            >
              <Clock className="w-4 h-4 text-slate-700 mb-1.5" />
              <span className="text-xs font-bold text-slate-900">Schedule Notice</span>
              <span className="text-[10px] text-slate-500">Official broadcast</span>
            </Link>

            <Link
              to="/admin/reports"
              className="p-3 text-left rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col justify-between"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-700 mb-1.5" />
              <span className="text-xs font-bold text-slate-900">Export Reports</span>
              <span className="text-[10px] text-slate-500">CSV & Registry</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Activity Streams (Recent Users & Audit Trail) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Database Users */}
        <Card
          title="Recent User Registrations"
          subtitle="Recently provisioned or modified accounts in MongoDB"
          badge={<Badge variant="teal" size="sm">{recentUsers.length} Recorded</Badge>}
        >
          <div className="divide-y divide-slate-100">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent user registrations found.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id || u._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">{u.name || u.username}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'faculty' ? 'info' : 'teal'} size="sm">
                      {u.role}
                    </Badge>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Link to="/admin/credentials" className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1">
              <span>View All Users & Credentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Recent System Audit Logs */}
        <Card
          title="Administrative Audit Trail"
          subtitle="Real-time security governance and immutable transaction logs"
          badge={<Badge variant="navy" size="sm">Live Feed</Badge>}
        >
          <div className="divide-y divide-slate-100">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No audit logs recorded yet.</p>
            ) : (
              recentLogs.slice(0, 6).map((log) => (
                <div key={log._id} className="py-2.5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-slate-700">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{log.details || 'System event recorded.'}</p>
                </div>
              ))
            )}
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Link to="/admin/settings" className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1">
              <span>View Full Security Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
