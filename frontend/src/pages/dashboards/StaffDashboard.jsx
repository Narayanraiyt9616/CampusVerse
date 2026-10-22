import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Bus,
  Users,
  ClipboardList,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

// Subcomponents for the 5 Hostel & Transport Staff Portal modules
import StaffOverview from './staff/StaffOverview';
import StaffHostel from './staff/StaffHostel';
import StaffTransport from './staff/StaffTransport';
import StaffStudents from './staff/StaffStudents';
import StaffComplaints from './staff/StaffComplaints';

export const StaffDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const isHostelPath = location.pathname.startsWith('/hostel');
  const basePath = isHostelPath ? '/hostel' : '/staff';

  const SECTIONS = [
    { id: 'dashboard', path: basePath, label: 'Overview', icon: LayoutDashboard },
    { id: 'hostel', path: `${basePath}/hostel`, label: 'Hostel Management', icon: Home },
    { id: 'transport', path: `${basePath}/transport`, label: 'Transport Fleet', icon: Bus },
    { id: 'students', path: `${basePath}/students`, label: 'Student Records', icon: Users },
    { id: 'complaints', path: `${basePath}/complaints`, label: 'Complaints & Notices', icon: ClipboardList },
  ];

  const currentSection = section ? section.toLowerCase() : 'dashboard';
  const isOverview = currentSection === 'dashboard' || currentSection === 'overview';
  const loggedInName = user?.name || user?.username || 'M. Karthikeyan';

  const sectionMetadata = {
    dashboard: {
      title: `Welcome, ${loggedInName}`,
      subtitle: `${user?.email || 'staff@campusverse.edu'} · Hostel & Estate Operations · Chief Warden`,
      breadcrumb: 'Overview',
    },
    hostel: {
      title: 'Hostel Complex & Accommodation Management',
      subtitle: 'Manage residential rooms, student bed allocations, vacancy ledger, and facility complaints',
      breadcrumb: 'Hostel Management',
    },
    transport: {
      title: 'University Transit Fleet & Fleet Logistics',
      subtitle: 'Manage buses, suburban routes, driver telemetry, student commuter passes, and schedule delays',
      breadcrumb: 'Transport Fleet',
    },
    students: {
      title: 'Unified Student Accommodation & Transit Records',
      subtitle: 'Master roster of students with active hostel room allotments and suburban bus passes',
      breadcrumb: 'Student Records',
    },
    complaints: {
      title: 'Facility Grievance Desk & Service Announcements',
      subtitle: 'Track maintenance repairs, transit delay grievances, and broadcast estate advisories',
      breadcrumb: 'Complaints & Notices',
    },
  };

  const meta = sectionMetadata[currentSection] || sectionMetadata.dashboard;

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'hostel':
        return <StaffHostel />;
      case 'transport':
        return <StaffTransport />;
      case 'students':
        return <StaffStudents />;
      case 'complaints':
      case 'notices':
        return <StaffComplaints />;
      case 'dashboard':
      case 'overview':
      default:
        return <StaffOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header matching Student Portal */}
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumbs={
          isOverview
            ? [{ label: 'Hostel Portal', to: basePath }, { label: 'Overview' }]
            : [{ label: 'Hostel Portal', to: basePath }, { label: meta.breadcrumb }]
        }
        badge={
          <Badge variant="teal" size="sm" hasDot>
            Estate Operations Active
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2.5">
            {!isOverview && (
              <Link to={basePath}>
                <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Overview
                </Button>
              </Link>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Modern Navigation Pills Strip matching Gold & Yellow theme */}
      <div className="p-1.5 rounded-2xl bg-[#FFF8E6]/60 border border-[#F1E7CF] flex items-center gap-2 overflow-x-auto scrollbar-none">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive =
            (isOverview && sec.id === 'dashboard') ||
            currentSection === sec.id ||
            (sec.id === 'complaints' && currentSection === 'notices');

          return (
            <Link
              key={sec.id}
              to={sec.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#D99A00] text-white shadow-sm'
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

export default StaffDashboard;
