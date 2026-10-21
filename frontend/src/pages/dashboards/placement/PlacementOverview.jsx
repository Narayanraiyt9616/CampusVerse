import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Award,
  Users,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import StatCard from '../../../components/common/StatCard';
import AlertBanner from '../../../components/common/AlertBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { placementService } from '../../../services/api';

export const PlacementOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await placementService.getDashboard();
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Fetch placement dashboard error:', err);
      setError(err.message || 'Failed to load placement cell metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading placement analytics & corporate drives...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalStudents: 0,
    registeredStudents: 0,
    eligibleStudents: 0,
    placedStudents: 0,
    placementPercentage: 0,
    upcomingDrivesCount: 0,
    activeOpportunitiesCount: 0,
    totalApplicationsCount: 0,
    shortlistedCount: 0,
    interviewingCount: 0,
    totalOffersCount: 0,
    averageCtc: '0 LPA',
    highestCtc: '0 LPA',
    totalRecruiters: 0,
  };

  const upcomingDrives = data?.upcomingDrives || [];
  const recentApplications = data?.recentApplications || [];
  const topRecruiters = data?.topRecruiters || [];
  const departmentStats = data?.departmentStats || [];

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Placement Cell Telemetry Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Top Placement KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Batch Placement Rate"
          value={`${stats.placementPercentage}%`}
          subtitle={`${stats.placedStudents} of ${stats.registeredStudents} Graduating Candidates Placed`}
          change={`${stats.totalOffersCount} Offers Made`}
          changeType="increase"
          colorVariant="emerald"
          icon={<Award className="w-5 h-5 text-emerald-600" />}
        />

        <StatCard
          title="Placement Eligibility"
          value={`${stats.eligibleStudents}`}
          subtitle={`${stats.registeredStudents} Registered • CGPA >= 7.0`}
          change="Clean Academic Standing"
          changeType="increase"
          colorVariant="teal"
          icon={<Users className="w-5 h-5 text-teal-600" />}
        />

        <StatCard
          title="Active Drives & Openings"
          value={stats.activeOpportunitiesCount}
          subtitle={`${stats.upcomingDrivesCount} Scheduled Campus Drives`}
          change="Tier 1 Dream Partners"
          changeType="increase"
          colorVariant="navy"
          icon={<Briefcase className="w-5 h-5 text-navy-800" />}
        />

        <StatCard
          title="Compensation Benchmark"
          value={stats.highestCtc}
          subtitle={`Average CTC: ${stats.averageCtc}`}
          change="National Top Decile"
          changeType="increase"
          colorVariant="purple"
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Main Grid: Upcoming Drives (2 Cols) + Recruitment Funnel (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Placement Drives */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Scheduled Campus Recruitment Drives"
            subtitle="Tier 1 Corporate partners, eligibility criteria, CTC packages, and assessment dates"
            headerAction={
              <Link
                to="/placement/companies"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                Manage Drives <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            {upcomingDrives.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No upcoming placement drives scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F0FDFA] text-[#102A43] font-bold border-b border-[#CCFBF1]">
                    <tr>
                      <th className="p-3.5">Hiring Partner & Role</th>
                      <th className="p-3.5">Compensation (CTC)</th>
                      <th className="p-3.5">Eligibility Criteria</th>
                      <th className="p-3.5">Drive Date & Venue</th>
                      <th className="p-3.5 text-center">Applicants</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CCFBF1]">
                    {upcomingDrives.map((d) => (
                      <tr key={d._id} className="hover:bg-[#CCFBF1]/30 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-[#102A43] text-sm block">
                            {d.companyName}
                          </span>
                          <span className="text-xs font-semibold text-[#0D9488] block">
                            {d.jobTitle}
                          </span>
                          <span className="text-xs text-[#102A43]/60 font-mono">
                            {d.jobType}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#102A43]">
                          {d.salaryPackage?.displayPackage || 'Best in Industry'}
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono text-[#102A43] block">
                            Min CGPA: <strong>{d.eligibilityCriteria?.minCgpa || 7.0}</strong>
                          </span>
                          <span className="text-xs text-[#102A43]/60 block font-medium">
                            Max {d.eligibilityCriteria?.maxBacklogs || 0} Backlog
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="font-semibold text-[#102A43] block">
                            {new Date(d.driveDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-xs text-[#102A43]/60 block truncate max-w-[150px]">
                            {d.venue || 'Auditorium 2'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-[#0D9488]">
                          {d.totalApplicationsCount || 0}
                        </td>
                        <td className="p-3.5 text-right">
                          <Badge
                            variant={d.status === 'Registration Open' ? 'success' : 'teal'}
                            size="sm"
                            hasDot
                          >
                            {d.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Department Placement Statistics */}
          <Card
            title="Department-wise Placement Performance"
            subtitle="Graduation cohort placement rate and offer distribution by engineering branch"
          >
            <div className="space-y-4">
              {departmentStats.length === 0 ? (
                <p className="text-xs text-[#102A43]/60 py-4 text-center font-medium">No department statistics available.</p>
              ) : (
                departmentStats.map((dept, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#102A43]">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#0D9488]" />
                        <span>{dept.department}</span>
                      </div>
                      <span className="font-mono text-[#0D9488]">
                        {dept.placed} / {dept.total} Placed ({dept.placementRate}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#CCFBF1] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0D9488] transition-all duration-500"
                        style={{ width: `${Math.min(dept.placementRate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Application Pipeline & Corporate Partners */}
        <div className="space-y-6">
          {/* Active Applications Funnel */}
          <Card
            title="Recent Student Applications"
            subtitle="Live status updates from recruitment pipeline"
            headerAction={
              <Link
                to="/placement/applications"
                className="text-xs font-bold text-[#0D9488] hover:underline"
              >
                All Applications
              </Link>
            }
          >
            <div className="space-y-3">
              {recentApplications.length === 0 ? (
                <p className="text-xs text-[#102A43]/60 py-6 text-center font-medium">No active applications found.</p>
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app._id}
                    className="p-3.5 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] hover:bg-[#CCFBF1]/40 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#102A43] text-sm">
                        {app.student?.name}
                      </span>
                      <Badge
                        variant="teal"
                        size="sm"
                      >
                        {app.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-[#102A43]/80">
                      <span className="font-bold text-[#0D9488]">{app.drive?.companyName}</span> • {app.drive?.jobTitle}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-[#102A43]/60 font-mono">
                      <span>Roll: {app.student?.studentId}</span>
                      <span>{app.currentRound || 'Screening'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Hiring Corporate Partners */}
          <Card title="Key Corporate Partners" subtitle="Active recruiters visiting campus">
            <div className="space-y-2.5">
              {topRecruiters.map((comp) => (
                <div
                  key={comp._id}
                  className="p-3 rounded-xl border border-[#CCFBF1] bg-[#FFFFFF] hover:bg-[#CCFBF1]/20 flex items-center justify-between shadow-xs text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] border border-[#0D9488]/30 flex items-center justify-center font-bold text-[#0D9488]">
                      {comp.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-[#102A43] block">{comp.name}</span>
                      <span className="text-xs text-[#102A43]/60 block truncate max-w-[140px] font-medium">{comp.industry}</span>
                    </div>
                  </div>
                  <Badge variant="teal" size="sm">{comp.tier}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlacementOverview;
