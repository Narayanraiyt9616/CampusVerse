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
      badgeVariant: 'info',
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
      badgeVariant: 'success',
      demoInfo: 'placement@campusverse.edu',
    },
    {
      role: 'Staff',
      canonicalRole: 'staff',
      loginPath: '/login/staff',
      title: 'Hostel & Transport Staff',
      description: 'Manage residential room allotments, maintenance dispatch tickets, and campus transport fleet rosters.',
      badgeVariant: 'warning',
      demoInfo: 'staff@campusverse.edu',
    },
    {
      role: 'Super Admin',
      canonicalRole: 'superadmin',
      loginPath: '/login/super-admin',
      title: 'Super Admin Console',
      description: 'System health diagnostics, audit logging, security role governance, and 15-module readiness telemetry.',
      badgeVariant: 'danger',
      demoInfo: 'superadmin@campusverse.edu',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2.5 p-1 rounded-lg">
            <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-teal-400 shadow-sm mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Role-Based Authentication Gateway</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Select Your University Portal
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            CampusVerse AI enforces strict cryptographic role authentication. Choose your designated portal below to open its dedicated sign-in terminal.
          </p>
        </div>

        {/* Logged in state notice */}
        {isAuthenticated && user && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-teal-700" />
              <span>
                Currently authenticated as <strong className="font-semibold">{user.email}</strong> ({user.role})
              </span>
            </div>
            <Link to={`/${user.role === 'superadmin' ? 'super-admin' : user.role}`}>
              <Button variant="teal" size="sm">
                Open Active Portal
              </Button>
            </Link>
          </div>
        )}

        {/* 7 Portal Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portals.map((p) => (
            <Card
              key={p.role}
              hoverable
              className="flex flex-col justify-between border-slate-200 transition-all hover:shadow-elevation"
              bodyClassName="p-5 flex flex-col justify-between h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={p.badgeVariant} size="sm">
                    {p.role}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {p.canonicalRole}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Authorized ID:</span>
                  <span className="font-mono text-slate-600">{p.demoInfo}</span>
                </div>
                <Link to={p.loginPath} className="block w-full">
                  <Button
                    variant="teal"
                    size="sm"
                    className="w-full justify-between"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
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
            className="text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors"
          >
            &larr; Return to CampusVerse Public Landing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
