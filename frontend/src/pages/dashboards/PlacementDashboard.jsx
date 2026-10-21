import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  Award,
  TrendingUp,
  Building2,
  Download,
  ArrowLeft,
  Users
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import DemoNotice from '../../components/common/DemoNotice';
import { DEMO_PLACEMENT } from '../../utils/demoData';
import { useAuth } from '../../context/AuthContext';

export const PlacementDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const currentSection = section ? section.toLowerCase() : null;
  const loggedInName = user?.name || user?.username || DEMO_PLACEMENT.officerName;
  const stats = DEMO_PLACEMENT.stats;

  const sectionTitles = {
    recruiters: 'Hiring Company Partners & Corporate Drives',
    students: 'Candidate Eligibility & Placement Shortlists',
  };

  const driveColumns = [
    {
      key: 'company',
      header: 'Hiring Partner',
      render: (v) => <span className="font-bold text-navy-900 text-xs">{v}</span>,
    },
    {
      key: 'role',
      header: 'Job Profile',
      render: (v) => <span className="font-medium text-slate-800 text-xs">{v}</span>,
    },
    {
      key: 'date',
      header: 'Drive Date',
      render: (v) => <span className="font-mono text-xs text-slate-600">{v}</span>,
    },
    {
      key: 'eligibility',
      header: 'Eligibility Criteria',
      render: (v) => <Badge variant="teal" size="sm">{v}</Badge>,
    },
    {
      key: 'registeredCount',
      header: 'Registered',
      render: (v) => <span className="font-semibold text-slate-700 text-xs">{v} Candidates</span>,
    },
    {
      key: 'rounds',
      header: 'Evaluation Process',
      render: (v) => <span className="text-xs text-slate-500">{v}</span>,
    },
  ];

  const candidateColumns = [
    {
      key: 'rollNo',
      header: 'Roll Number',
      render: (v) => <span className="font-mono font-bold text-navy-900 text-xs">{v}</span>,
    },
    {
      key: 'name',
      header: 'Candidate Name',
      render: (v) => <span className="font-semibold text-slate-900 text-xs">{v}</span>,
    },
    {
      key: 'cgpa',
      header: 'CGPA',
      render: (v) => <span className="font-mono font-bold text-teal-700 text-xs">{v}</span>,
    },
    {
      key: 'shortlistedFor',
      header: 'Offers / Shortlists',
      render: (v) => <Badge variant="teal" size="sm">{v}</Badge>,
    },
    {
      key: 'status',
      header: 'Placement Status',
      render: (v) => (
        <Badge variant={v === 'Placed' ? 'success' : 'info'} size="sm" hasDot>
          {v}
        </Badge>
      ),
    },
  ];

  const candidateData = [
    { rollNo: 'CS21B1042', name: 'Aarav Singhania', cgpa: '9.42', shortlistedFor: 'Google, Microsoft', status: 'Placed' },
    { rollNo: 'CS21B1015', name: 'Ananya Sharma', cgpa: '9.18', shortlistedFor: 'Amazon, Adobe', status: 'Placed' },
    { rollNo: 'CS21B1089', name: 'Rohan Varma', cgpa: '8.85', shortlistedFor: 'Goldman Sachs', status: 'Shortlisted' },
    { rollNo: 'CS21B1033', name: 'Pooja Iyer', cgpa: '8.72', shortlistedFor: 'Oracle Cloud', status: 'Shortlisted' },
  ];

  return (
    <div className="space-y-6">
      {/* Top navigation back button when viewing a specific section */}
      {currentSection && (
        <div className="flex items-center justify-between pb-1">
          <Link
            to="/placement"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Placement Overview
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Dedicated Page: <strong className="text-slate-800">{sectionTitles[currentSection] || currentSection}</strong>
          </span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={currentSection ? `${sectionTitles[currentSection] || currentSection}` : `Welcome, ${loggedInName}`}
        subtitle={currentSection ? `Training & Placement Cell • ${loggedInName}` : `Graduating Batch ${DEMO_PLACEMENT.season}`}
        breadcrumbs={
          currentSection
            ? [{ label: 'Placement Portal', to: '/placement' }, { label: sectionTitles[currentSection] || currentSection }]
            : [{ label: 'Placement Portal', to: '/placement' }, { label: 'Recruitment Season' }]
        }
        badge={<Badge variant="success" size="sm">Active Drive Phase</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => alert('Placement brochure and recruiter metrics export will connect in Part 2.')}
            >
              Export Placement Metrics
            </Button>
          </div>
        }
      />

      <DemoNotice roleName="Placement Officer Portal" />

      {/* Metric Cards - Only on Overview */}
      {!currentSection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Placement Conversion"
            value={`${stats.placementPercentage}%`}
            subtitle={`${stats.placedStudents} of ${stats.totalEligibleStudents} Students Placed`}
            change="Strong Momentum"
            changeType="increase"
            colorVariant="emerald"
            icon={<Award className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Highest CTC Offered"
            value={stats.highestDomesticCtc.split(' ')[0]}
            subtitle={stats.highestDomesticCtc}
            change="Domestic Record"
            changeType="increase"
            colorVariant="teal"
            icon={<TrendingUp className="w-5 h-5 text-teal-600" />}
          />
          <StatCard
            title="Average CTC Package"
            value={stats.averageCtc}
            subtitle="Across All Engineering Streams"
            change="+18% vs Last Year"
            changeType="increase"
            colorVariant="navy"
            icon={<Briefcase className="w-5 h-5 text-navy-800" />}
          />
          <StatCard
            title="Active Recruiters"
            value={stats.activeRecruitingPartners}
            subtitle="Tier-1 Enterprise Partners"
            change="68 Companies"
            changeType="neutral"
            colorVariant="amber"
            icon={<Building2 className="w-5 h-5 text-amber-600" />}
          />
        </div>
      )}

      {/* Upcoming Placement Drives / Recruiters Section */}
      {(!currentSection || currentSection === 'recruiters') && (
        <Card
          title="Scheduled Campus Recruitment Drives"
          subtitle="Tier-1 software, consulting, and quantitative trading campus drives"
          badge={<Badge variant="teal" size="sm">{DEMO_PLACEMENT.upcomingDrives.length} Drives Scheduled</Badge>}
        >
          <Table
            columns={driveColumns}
            data={DEMO_PLACEMENT.upcomingDrives}
            keyField="company"
          />
        </Card>
      )}

      {/* Candidate Shortlists Section */}
      {(!currentSection || currentSection === 'students') && (
        <Card
          title="Candidate Shortlists & Placement Roster"
          subtitle="Live evaluation progress, shortlisted profiles, and institutional offer letters"
          badge={<Badge variant="teal" size="sm">Eligible Candidates</Badge>}
        >
          <Table
            columns={candidateColumns}
            data={candidateData}
            keyField="rollNo"
          />
        </Card>
      )}
    </div>
  );
};

export default PlacementDashboard;
