import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Award,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';

// Subcomponents for the 5 Placement Cell Portal modules
import PlacementOverview from './placement/PlacementOverview';
import PlacementDrives from './placement/PlacementDrives';
import PlacementStudents from './placement/PlacementStudents';
import PlacementApplications from './placement/PlacementApplications';
import PlacementNotices from './placement/PlacementNotices';

const SECTIONS = [
  { id: 'dashboard', path: '/placement', label: 'Placement Dashboard', icon: LayoutDashboard },
  { id: 'companies', path: '/placement/companies', label: 'Company & Drives', icon: Building2 },
  { id: 'students', path: '/placement/students', label: 'Candidate Profiles', icon: Users },
  { id: 'applications', path: '/placement/applications', label: 'Applications & Offers', icon: Award },
  { id: 'notices', path: '/placement/notices', label: 'Placement Notices', icon: FileCheck2 },
];

export const PlacementDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const currentSection = section ? section.toLowerCase() : 'dashboard';
  const loggedInName = user?.name || user?.username || 'Prof. Vikramaditya';

  const sectionMetadata = {
    dashboard: {
      title: `Welcome, ${loggedInName}`,
      subtitle: 'Training & Corporate Placement Cell • Recruitment analytics, active drives, and batch placement rate',
      breadcrumb: 'Placement Dashboard',
    },
    companies: {
      title: 'Hiring Corporate Partners & Placement Drives',
      subtitle: 'Manage MNC recruiters, active job openings, required competencies, CTC packages, and drive dates',
      breadcrumb: 'Company & Drives',
    },
    drives: {
      title: 'Hiring Corporate Partners & Placement Drives',
      subtitle: 'Manage MNC recruiters, active job openings, required competencies, CTC packages, and drive dates',
      breadcrumb: 'Company & Drives',
    },
    recruiters: {
      title: 'Hiring Corporate Partners & Placement Drives',
      subtitle: 'Manage MNC recruiters, active job openings, required competencies, CTC packages, and drive dates',
      breadcrumb: 'Company & Drives',
    },
    students: {
      title: 'Candidate Profiles & Placement Eligibility',
      subtitle: 'Review graduating student academic CGPA, verified skill stacks, résumés, and drive eligibility flags',
      breadcrumb: 'Candidate Profiles',
    },
    candidates: {
      title: 'Candidate Profiles & Placement Eligibility',
      subtitle: 'Review graduating student academic CGPA, verified skill stacks, résumés, and drive eligibility flags',
      breadcrumb: 'Candidate Profiles',
    },
    applications: {
      title: 'Applications & Recruitment Pipeline',
      subtitle: 'Screen student applicants, coordinate interview panels, and authorize formal placement offer letters',
      breadcrumb: 'Applications & Offers',
    },
    recruitment: {
      title: 'Applications & Recruitment Pipeline',
      subtitle: 'Screen student applicants, coordinate interview panels, and authorize formal placement offer letters',
      breadcrumb: 'Applications & Offers',
    },
    notices: {
      title: 'Placement Announcements & Guidelines',
      subtitle: 'Broadcast company assessment credentials, shortlist notices, PPO regulations, and drive guidelines',
      breadcrumb: 'Placement Notices',
    },
    announcements: {
      title: 'Placement Announcements & Guidelines',
      subtitle: 'Broadcast company assessment credentials, shortlist notices, PPO regulations, and drive guidelines',
      breadcrumb: 'Placement Notices',
    },
  };

  const meta = sectionMetadata[currentSection] || sectionMetadata.dashboard;

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'companies':
      case 'drives':
      case 'recruiters':
        return <PlacementDrives />;
      case 'students':
      case 'candidates':
        return <PlacementStudents />;
      case 'applications':
      case 'recruitment':
        return <PlacementApplications />;
      case 'notices':
      case 'announcements':
        return <PlacementNotices />;
      case 'dashboard':
      case 'overview':
      default:
        return <PlacementOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header Strip */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F1E7CF]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4B5563]">
          <Link
            to="/placement"
            className="hover:text-[#D99A00] flex items-center gap-1 transition-colors"
          >
            Placement Cell
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D99A00]" />
          <span className="text-[#111827] font-bold">{meta.breadcrumb}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#111827] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#D99A00]" />
          <span>Corporate Relations Desk</span>
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumbs={[
          { label: 'Placement Cell', to: '/placement' },
          { label: meta.breadcrumb },
        ]}
        badge={
          <Badge variant="teal" size="sm" hasDot>
            Placement Active
          </Badge>
        }
      />

      {/* Modern Navigation Pills Strip for all 5 Modules */}
      <div className="bg-white p-2 rounded-2xl border border-[#F1E7CF] shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive =
            (currentSection === 'dashboard' && sec.id === 'dashboard') ||
            currentSection === sec.id ||
            (sec.id === 'companies' && (currentSection === 'drives' || currentSection === 'recruiters')) ||
            (sec.id === 'students' && currentSection === 'candidates') ||
            (sec.id === 'applications' && currentSection === 'recruitment') ||
            (sec.id === 'notices' && currentSection === 'announcements');

          return (
            <Link
              key={sec.id}
              to={sec.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#D99A00] text-white shadow-sm border border-[#D99A00]'
                  : 'text-[#111827] hover:bg-[#FFF8E6]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sec.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Render Active Module */}
      <div className="transition-all duration-200">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default PlacementDashboard;
