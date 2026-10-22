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
        <p className="mt-3.5 text-sm text-[#111827] font-bold">Loading real-time institutional metrics...</p>
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
          variant="error"
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
          icon={<Users className="w-5 h-5 text-[#D99A00]" />}
        />
        <StatCard
          title="Teaching Faculty"
          value={stats?.faculty ?? 0}
          subtitle="Professors & Instructors"
          change="Accredited"
          changeType="increase"
          icon={<GraduationCap className="w-5 h-5 text-[#D99A00]" />}
        />
        <StatCard
          title="Attendance Shortages"
          value={stats?.attendanceShortageCount ?? 0}
          subtitle="Students below 75% threshold"
          change={stats?.attendanceShortageCount > 0 ? 'Action Recommended' : 'Compliant'}
          changeType={stats?.attendanceShortageCount > 0 ? 'decrease' : 'increase'}
          icon={<AlertTriangle className="w-5 h-5 text-[#D99A00]" />}
        />
        <StatCard
          title="Realized Fee Recovery"
          value={`₹${(feeCollected / 1000).toFixed(0)}k`}
          subtitle={`Pending: ₹${(feePending / 1000).toFixed(0)}k`}
          change={`${feeRecoveryPct}% Realized`}
          changeType={feeRecoveryPct >= 70 ? 'increase' : 'decrease'}
          icon={<IndianRupee className="w-5 h-5 text-[#D99A00]" />}
        />
      </div>

      {/* Secondary Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Departments', value: stats?.departments ?? 0, icon: <Building2 className="w-4 h-4" /> },
          { label: 'Courses', value: stats?.courses ?? 0, icon: <Clock className="w-4 h-4" /> },
          { label: 'Attendance Sessions', value: stats?.attendanceSessions ?? 0, icon: <CalendarCheck className="w-4 h-4" /> },
          { label: 'Upcoming Exams', value: stats?.upcomingExams ?? 0, icon: <Award className="w-4 h-4" /> },
          { label: 'Pending Leaves', value: stats?.pendingLeavesCount ?? 0, icon: <FileCheck2 className="w-4 h-4" /> },
          { label: 'Total Accounts', value: stats?.totalUsers ?? 0, icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((item) => (
          <div key={item.label} className="p-3.5 bg-white border border-[#F1E7CF] rounded-2xl flex items-center gap-3 shadow-sm hover:border-[#D99A00] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-[#D99A00] flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-[11px] text-[#4B5563] font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-base font-extrabold text-[#111827] mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection Recovery Progress */}
        <Card
          title="Institutional Fee Recovery"
          subtitle="Real-time collection vs pending student dues"
          badge={<Badge variant={feeRecoveryPct >= 70 ? 'teal' : 'warning'} size="sm">{feeRecoveryPct}% Collected</Badge>}
        >
          <div className="space-y-4 pt-1">
            <div className="w-full bg-[#FFF8E6] rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#D99A00] h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, feeRecoveryPct))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center pt-2">
              <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                <p className="text-[10px] text-[#4B5563] font-bold uppercase">Total Billed</p>
                <p className="text-xs font-extrabold text-[#111827] mt-1">₹{feeBilled.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#FFF8E6] border border-[#D99A00]">
                <p className="text-[10px] text-[#111827] font-bold uppercase">Collected</p>
                <p className="text-xs font-extrabold text-[#111827] mt-1">₹{feeCollected.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#F1E7CF]">
                <p className="text-[10px] text-[#4B5563] font-bold uppercase">Pending</p>
                <p className="text-xs font-extrabold text-[#111827] mt-1">₹{feePending.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-between text-xs">
              <span className="text-[#4B5563] font-semibold">Overdue Invoices: <strong className="text-[#111827]">{stats?.fees?.overdueCount || 0}</strong></span>
              <Link to="/admin/fees" className="text-[#D99A00] hover:underline font-bold flex items-center gap-1">
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
              <Badge variant="warning" size="sm">{stats?.attendanceShortageCount} Defaulters</Badge>
            ) : (
              <Badge variant="teal" size="sm">100% Compliant</Badge>
            )
          }
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E6] flex items-center justify-center text-[#D99A00]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111827]">Healthy Attendance (≥ 75%)</p>
                  <p className="text-[11px] text-[#4B5563] font-medium">Eligible for end-semester exams</p>
                </div>
              </div>
              <span className="font-extrabold text-base text-[#D99A00]">
                {Math.max(0, (stats?.students || 0) - (stats?.attendanceShortageCount || 0))}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FFF8E6] border border-[#D99A00]/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#D99A00]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#111827]">Shortage Defaulters (&lt; 75%)</p>
                  <p className="text-[11px] text-[#4B5563] font-medium">Shortage notices pending</p>
                </div>
              </div>
              <span className="font-extrabold text-base text-[#111827]">{stats?.attendanceShortageCount || 0}</span>
            </div>

            <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-between text-xs">
              <span className="text-[#4B5563] font-semibold">Recorded Sessions: <strong className="text-[#111827]">{stats?.attendanceSessions || 0}</strong></span>
              <Link to="/admin/attendance" className="text-[#D99A00] hover:underline font-bold flex items-center gap-1">
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
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenCreateCreds}
              className="p-3.5 text-left rounded-xl border border-[#F1E7CF] bg-[#FFFDF5] hover:bg-[#FFF8E6] transition-colors flex flex-col justify-between"
            >
              <Key className="w-4 h-4 text-[#D99A00] mb-2" />
              <span className="text-xs font-bold text-[#111827]">Create Credentials</span>
              <span className="text-[10px] text-[#4B5563] font-medium mt-0.5">Student, Faculty, Staff</span>
            </button>

            <Link
              to="/admin/students"
              className="p-3.5 text-left rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] transition-colors flex flex-col justify-between"
            >
              <Users className="w-4 h-4 text-[#D99A00] mb-2" />
              <span className="text-xs font-bold text-[#111827]">Add New Student</span>
              <span className="text-[10px] text-[#4B5563] font-medium mt-0.5">Registry & profile</span>
            </Link>

            <Link
              to="/admin/faculty"
              className="p-3.5 text-left rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] transition-colors flex flex-col justify-between"
            >
              <GraduationCap className="w-4 h-4 text-[#D99A00] mb-2" />
              <span className="text-xs font-bold text-[#111827]">Appoint Faculty</span>
              <span className="text-[10px] text-[#4B5563] font-medium mt-0.5">Subjects & permissions</span>
            </Link>

            <Link
              to="/admin/fees"
              className="p-3.5 text-left rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] transition-colors flex flex-col justify-between"
            >
              <IndianRupee className="w-4 h-4 text-[#D99A00] mb-2" />
              <span className="text-xs font-bold text-[#111827]">Issue Fee Invoice</span>
              <span className="text-[10px] text-[#4B5563] font-medium mt-0.5">Record payments</span>
            </Link>

            <Link
              to="/admin/schedule"
              className="p-3.5 text-left rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] transition-colors flex flex-col justify-between"
            >
              <Clock className="w-4 h-4 text-[#D99A00] mb-2" />
              <span className="text-xs font-bold text-[#111827]">Schedule Notice</span>
              <span className="text-[10px] text-[#4B5563] font-medium mt-0.5">Official broadcast</span>
            </Link>

            <Link
              to="/admin/reports"
              className="p-3.5 text-left rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] transition-colors flex flex-col justify-between"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#D99A00] mb-2" />
              <span className="text-xs font-bold text-[#111827]">Export Reports</span>
              <span className="text-[10px] text-[#4B5563] font-medium mt-0.5">CSV & Registry</span>
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
          <div className="divide-y divide-[#F1E7CF]">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-[#4B5563] py-4 text-center font-semibold">No recent user registrations found.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id || u._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#111827] text-sm">{u.name || u.username}</p>
                    <p className="text-[11px] text-[#4B5563] font-mono font-medium">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === 'admin' ? 'navy' : 'teal'} size="sm">
                      {u.role}
                    </Badge>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8E6] text-[#111827]">
                      {u.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-3.5 border-t border-[#F1E7CF] flex justify-end">
            <Link to="/admin/credentials" className="text-xs font-bold text-[#D99A00] hover:underline flex items-center gap-1">
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
          <div className="divide-y divide-[#F1E7CF]">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-[#4B5563] py-4 text-center font-semibold">No audit logs recorded yet.</p>
            ) : (
              recentLogs.slice(0, 6).map((log) => (
                <div key={log._id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#111827]">{log.action}</span>
                    <span className="text-[11px] text-[#4B5563] font-mono font-semibold">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563] font-medium line-clamp-1">{log.details || 'System event recorded.'}</p>
                </div>
              ))
            )}
          </div>
          <div className="pt-3.5 border-t border-[#F1E7CF] flex justify-end">
            <Link to="/admin/settings" className="text-xs font-bold text-[#D99A00] hover:underline flex items-center gap-1">
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
