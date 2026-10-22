import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Lock,
  UserCheck
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const portals = [
    {
      role: 'Student',
      canonicalRole: 'student',
      loginPath: '/login/student',
      title: 'Student Portal',
      description: 'Track attendance, weekly timetables, active assignments, exam marks, and pending fee invoices.',
      badgeVariant: 'teal',
      demoInfo: 'student@campusverse.edu',
    },
    {
      role: 'Faculty',
      canonicalRole: 'faculty',
      loginPath: '/login/faculty',
      title: 'Faculty Portal',
      description: 'Review assigned courses, record class attendance, evaluate student submissions, and submit marks.',
      badgeVariant: 'teal',
      demoInfo: 'faculty@campusverse.edu',
    },
    {
      role: 'Administrator',
      canonicalRole: 'admin',
      loginPath: '/login/admin',
      title: 'Administrator Console',
      description: 'Manage campus departments, academic programs, pending administrative approvals, and student grievances.',
      badgeVariant: 'navy',
      demoInfo: 'narayanrai',
    },
    {
      role: 'Parent',
      canonicalRole: 'parent',
      loginPath: '/login/parent',
      title: 'Parent / Guardian Portal',
      description: 'Transparent visibility into ward academic progress, attendance percentage, and fee receipts.',
      badgeVariant: 'teal',
      demoInfo: 'parent@campusverse.edu',
    },
    {
      role: 'Placement',
      canonicalRole: 'placement',
      loginPath: '/login/placement',
      title: 'Placement Cell',
      description: 'Coordinate campus recruitment drives, verify student eligibility criteria, and track recruitment metrics.',
      badgeVariant: 'teal',
      demoInfo: 'placement@campusverse.edu',
    },
    {
      role: 'Hostel Staff',
      canonicalRole: 'staff',
      loginPath: '/login/hostel',
      title: 'Hostel Portal',
      description: 'Manage residential room allotments, maintenance dispatch tickets, and campus transport fleet rosters.',
      badgeVariant: 'teal',
      demoInfo: 'staff@campusverse.edu',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] py-14 px-4 sm:px-6 lg:px-8 bg-[#FFFEFA] text-[#111827]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2.5 p-1 rounded-xl">
            <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center text-[#FFC107] shadow-sm mx-auto border border-[#F1E7CF]">
              <GraduationCap className="w-8 h-8 text-[#FFC107]" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#F1E7CF] text-xs font-semibold text-[#D99A00]">
            <ShieldCheck className="w-4 h-4 text-[#D99A00]" />
            <span>Role-Based Authentication Gateway</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight sm:text-4xl">
            Select Your University Portal
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
            CampusVerse AI enforces cryptographic role authentication. Choose your designated portal below to open its dedicated sign-in terminal.
          </p>
        </div>

        {/* Logged in state notice */}
        {isAuthenticated && user && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#FFFFFF] border border-[#F1E7CF] text-[#111827] flex items-center justify-between text-xs sm:text-sm font-medium shadow-xs">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-[#16A34A]" />
              <span>
                Currently authenticated as <strong className="font-semibold text-[#111827]">{user.email}</strong> ({user.role})
              </span>
            </div>
            <Link to={`/${user.role === 'staff' ? 'hostel' : user.role}`}>
              <Button size="sm" className="!bg-[#D99A00] hover:!bg-[#E5A900] !text-white !border-transparent shadow-xs transition-colors">
                Open Active Portal
              </Button>
            </Link>
          </div>
        )}

        {/* 6 Portal Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((p) => (
            <Card
              key={p.role}
              hoverable
              className="flex flex-col justify-between !bg-[#FFFFFF] !border-[#F1E7CF] hover:!border-[#D99A00] hover:!shadow-md transition-all duration-200 shadow-xs"
              bodyClassName="p-6 flex flex-col justify-between h-full bg-[#FFFFFF]"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <Badge variant={p.badgeVariant} size="sm" className="!bg-[#FFF8E6] !text-[#D99A00] !border-[#F1E7CF] font-semibold">
                    {p.role}
                  </Badge>
                  <span className="text-xs text-[#64748B] font-mono font-medium">
                    {p.canonicalRole}
                  </span>
                </div>
                <h3 className="font-bold text-[#111827] text-lg">{p.title}</h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal">
                  {p.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1E7CF] space-y-3">
                <div className="text-xs text-[#4B5563] font-medium flex items-center justify-between">
                  <span>Authorized ID:</span>
                  <span className="font-mono text-[#111827] font-semibold">{p.demoInfo}</span>
                </div>
                <Link to={p.loginPath} className="block w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-between !bg-[#D99A00] hover:!bg-[#E5A900] !text-white !border-transparent shadow-xs transition-colors font-bold"
                    rightIcon={<ArrowRight className="w-4 h-4 text-white" />}
                  >
                    Open {p.role} Sign In
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="text-center pt-4">
          <Link
            to="/"
            className="text-xs sm:text-sm text-[#4B5563] hover:text-[#D99A00] font-semibold transition-colors"
          >
            &larr; Return to CampusVerse Public Landing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
