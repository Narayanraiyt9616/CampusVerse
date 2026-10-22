import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Clock,
  IndianRupee,
  FileCheck2,
  ArrowLeft,
  Users,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { parentService } from '../../services/api';

// Subcomponents for the 6 Parent Portal modules
import ParentOverview from './parent/ParentOverview';
import ParentStudentInfo from './parent/ParentStudentInfo';
import ParentAcademics from './parent/ParentAcademics';
import ParentSchedule from './parent/ParentSchedule';
import ParentFees from './parent/ParentFees';
import ParentNotices from './parent/ParentNotices';

const SECTIONS = [
  { id: 'dashboard', path: '/parent', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'student', path: '/parent/student', label: 'Student Information', icon: User },
  { id: 'academics', path: '/parent/academics', label: 'Attendance & Results', icon: CalendarCheck },
  { id: 'schedule', path: '/parent/schedule', label: 'Assignments & Timetable', icon: Clock },
  { id: 'fees', path: '/parent/fees', label: 'Fees & Invoices', icon: IndianRupee },
  { id: 'notices', path: '/parent/notices', label: 'Notices & Alerts', icon: FileCheck2 },
];

export const ParentDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const currentSection = section ? section.toLowerCase() : 'dashboard';
  const loggedInName = user?.name || user?.username || 'Parent / Guardian';

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [wards, setWards] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);

  // Fetch available wards on mount
  useEffect(() => {
    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const res = await parentService.getWards();
        if (res && res.success && res.wards?.length > 0) {
          setWards(res.wards);
          const defaultWard =
            res.wards.find((w) => w.studentId === 'CS21B1042') || res.wards[0];
          if (!selectedStudentId) {
            setSelectedStudentId(defaultWard._id);
          }
        }
      } catch (err) {
        console.error('Failed to load wards in ParentDashboard:', err);
      } finally {
        setLoadingWards(false);
      }
    };
    fetchWards();
  }, []);

  const currentWard = wards.find(
    (w) => w._id === selectedStudentId || w.studentId === selectedStudentId
  ) || wards[0];

  const sectionMetadata = {
    dashboard: {
      title: `Welcome, ${loggedInName}`,
      subtitle: 'Real-time telemetry of attendance, academic progress, pending fees, and circulars',
      breadcrumb: 'Dashboard Overview',
    },
    student: {
      title: 'Ward Academic Profile & Credentials',
      subtitle: 'Institutional details, enrolled department, semester records, and faculty mentor',
      breadcrumb: 'Student Information',
    },
    academics: {
      title: 'Biometric Attendance & Examination Results',
      subtitle: 'Subject-wise attendance compliance, lecture turnstile logs, and published grades',
      breadcrumb: 'Attendance & Results',
    },
    attendance: {
      title: 'Biometric Attendance & Examination Results',
      subtitle: 'Subject-wise attendance compliance, lecture turnstile logs, and published grades',
      breadcrumb: 'Attendance & Results',
    },
    results: {
      title: 'Biometric Attendance & Examination Results',
      subtitle: 'Subject-wise attendance compliance, lecture turnstile logs, and published grades',
      breadcrumb: 'Attendance & Results',
    },
    schedule: {
      title: 'Coursework Deadlines & Class Schedules',
      subtitle: 'Weekly timetable, homework assignments, and upcoming examination seatings',
      breadcrumb: 'Assignments & Timetable',
    },
    timetable: {
      title: 'Coursework Deadlines & Class Schedules',
      subtitle: 'Weekly timetable, homework assignments, and upcoming examination seatings',
      breadcrumb: 'Assignments & Timetable',
    },
    assignments: {
      title: 'Coursework Deadlines & Class Schedules',
      subtitle: 'Weekly timetable, homework assignments, and upcoming examination seatings',
      breadcrumb: 'Assignments & Timetable',
    },
    fees: {
      title: 'Institutional Invoicing & Bursar Ledger',
      subtitle: 'Verified payment history, outstanding semester balances, and e-receipts',
      breadcrumb: 'Fees & Invoices',
    },
    invoices: {
      title: 'Institutional Invoicing & Bursar Ledger',
      subtitle: 'Verified payment history, outstanding semester balances, and e-receipts',
      breadcrumb: 'Fees & Invoices',
    },
    notices: {
      title: 'Campus Circulars & Guardian Telemetry Alerts',
      subtitle: 'Official bulletins, urgent examination announcements, and automated shortage alerts',
      breadcrumb: 'Notices & Alerts',
    },
    alerts: {
      title: 'Campus Circulars & Guardian Telemetry Alerts',
      subtitle: 'Official bulletins, urgent examination announcements, and automated shortage alerts',
      breadcrumb: 'Notices & Alerts',
    },
  };

  const meta = sectionMetadata[currentSection] || sectionMetadata.dashboard;

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'student':
        return <ParentStudentInfo selectedStudentId={selectedStudentId} />;
      case 'academics':
      case 'attendance':
      case 'results':
        return <ParentAcademics selectedStudentId={selectedStudentId} />;
      case 'schedule':
      case 'timetable':
      case 'assignments':
        return <ParentSchedule selectedStudentId={selectedStudentId} />;
      case 'fees':
      case 'invoices':
        return <ParentFees selectedStudentId={selectedStudentId} />;
      case 'notices':
      case 'alerts':
        return <ParentNotices selectedStudentId={selectedStudentId} />;
      case 'dashboard':
      default:
        return (
          <ParentOverview
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Ward Switcher Strip & Dedicated Page Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[#F1E7CF]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#4B5563]">
          <Link
            to="/parent"
            className="hover:text-[#D99A00] flex items-center gap-1 transition-colors"
          >
            Parent Portal
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D99A00]" />
          <span className="text-[#111827] font-bold">{meta.breadcrumb}</span>
        </div>

        {/* Global Ward Switcher Dropdown */}
        {wards.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-[#F1E7CF] shadow-sm">
            <Users className="w-4 h-4 text-[#D99A00]" />
            <span className="text-xs font-bold text-[#111827]">Ward:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs font-bold text-[#111827] bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer"
            >
              {wards.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.studentId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Page Header */}
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        breadcrumbs={[
          { label: 'Parent Portal', to: '/parent' },
          { label: meta.breadcrumb },
        ]}
        badge={
          <Badge variant="teal" size="sm" hasDot>
            Guardian Active
          </Badge>
        }
      />

      {/* Modern Navigation Pills Strip for all 6 Modules */}
      <div className="bg-white p-2 rounded-2xl border border-[#F1E7CF] shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive =
            (currentSection === 'dashboard' && sec.id === 'dashboard') ||
            currentSection === sec.id ||
            (sec.id === 'academics' && (currentSection === 'attendance' || currentSection === 'results')) ||
            (sec.id === 'schedule' && (currentSection === 'timetable' || currentSection === 'assignments')) ||
            (sec.id === 'fees' && currentSection === 'invoices') ||
            (sec.id === 'notices' && currentSection === 'alerts');

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

      {/* Module Content */}
      <div className="transition-all duration-200">
        {renderSectionContent()}
      </div>
    </div>
  );
};

export default ParentDashboard;
