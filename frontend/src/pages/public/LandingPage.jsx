import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  CreditCard,
  Clock,
  Briefcase,
  Home,
  Bus,
  Cpu,
  ArrowRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

export const LandingPage = () => {
  const campusServices = [
    {
      icon: <GraduationCap className="w-5 h-5 text-teal-600" />,
      title: 'Student Information System (SIS)',
      description: 'Comprehensive 360° student academic profiles, program registrations, credit audits, and cumulative grade point telemetry.',
      moduleTag: 'Module 1',
    },
    {
      icon: <CalendarCheck className="w-5 h-5 text-teal-600" />,
      title: 'Autonomous Attendance Tracking',
      description: 'Multi-mode attendance management supporting biometric roster sync, subject threshold warnings (<75%), and faculty sign-offs.',
      moduleTag: 'Module 3',
    },
    {
      icon: <Clock className="w-5 h-5 text-teal-600" />,
      title: 'Dynamic Timetable & Schedule',
      description: 'Algorithmic room and faculty scheduling preventing conflicting bookings across lecture halls, research studios, and seminar complexes.',
      moduleTag: 'Module 6',
    },
    {
      icon: <Award className="w-5 h-5 text-teal-600" />,
      title: 'Exams, Grading & Assessment',
      description: 'Continuous assessment tracking, mid-term grading, end-semester evaluation workflows, and instant SGPA/CGPA transcript generation.',
      moduleTag: 'Module 4',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-teal-600" />,
      title: 'Fee Invoicing & Payment Audits',
      description: 'Transparent tuition, hostel, and exam fee billing with real-time receipt generation, deadline reminders, and clearance tracking.',
      moduleTag: 'Module 5',
    },
    {
      icon: <Briefcase className="w-5 h-5 text-teal-600" />,
      title: 'Training & Corporate Placement',
      description: 'End-to-end recruiter engagement portal, eligibility filtering, drive registration, interview tracking, and CTC package analytics.',
      moduleTag: 'Module 7',
    },
    {
      icon: <Home className="w-5 h-5 text-teal-600" />,
      title: 'Hostel & Residence Allotment',
      description: 'Warden occupancy registers, digital room allocation, mess grievance tracking, and facility maintenance dispatch.',
      moduleTag: 'Module 8',
    },
    {
      icon: <Bus className="w-5 h-5 text-teal-600" />,
      title: 'Transport & Fleet Logistics',
      description: 'Campus transit routes, bus vehicle telemetry, driver schedules, and student route allocation monitoring.',
      moduleTag: 'Module 9',
    },
  ];

  const aiCapabilities = [
    {
      title: 'Predictive Academic Early Warning',
      description: 'Detects student distress trends by correlating attendance dropouts with assignment submission gaps, enabling proactive faculty intervention.',
      status: 'FastAPI Spec Ready (Part 3)',
    },
    {
      title: 'Smart Constraint-Satisfaction Timetabling',
      description: 'Eliminates room collisions and faculty overload using heuristic optimization algorithms tailored to institutional room capacities.',
      status: 'FastAPI Spec Ready (Part 3)',
    },
    {
      title: 'Placement Resume & Role Matcher',
      description: 'Evaluates student project portfolios against corporate job descriptions (JDs) to provide targeted skill improvement guidance.',
      status: 'FastAPI Spec Ready (Part 3)',
    },
    {
      title: 'Continuous Formative Rubric Evaluator',
      description: 'Assists teaching faculty with automated similarity analysis, grading rubric alignment, and syntax validation for technical coursework.',
      status: 'FastAPI Spec Ready (Part 3)',
    },
  ];

  const roleCards = [
    {
      role: 'Student',
      path: '/student',
      loginPath: '/login/student',
      title: 'Student Portal',
      description: 'Track attendance, weekly timetables, active assignments, exam marks, and pending fee invoices.',
      badgeVariant: 'teal',
    },
    {
      role: 'Faculty',
      path: '/faculty',
      loginPath: '/login/faculty',
      title: 'Faculty Portal',
      description: 'Review assigned courses, record class attendance, evaluate student submissions, and submit marks.',
      badgeVariant: 'info',
    },
    {
      role: 'Administrator',
      path: '/admin',
      loginPath: '/login/admin',
      title: 'Administrator Console',
      description: 'Manage campus departments, academic programs, pending administrative approvals, and student grievances.',
      badgeVariant: 'navy',
    },
    {
      role: 'Parent',
      path: '/parent',
      loginPath: '/login/parent',
      title: 'Parent / Guardian Portal',
      description: 'Transparent visibility into ward academic progress, attendance percentage, and fee receipts.',
      badgeVariant: 'teal',
    },
    {
      role: 'Placement',
      path: '/placement',
      loginPath: '/login/placement',
      title: 'Placement Cell',
      description: 'Coordinate campus recruitment drives, verify student eligibility criteria, and track recruitment metrics.',
      badgeVariant: 'success',
    },
    {
      role: 'Staff',
      path: '/staff',
      loginPath: '/login/staff',
      title: 'Hostel & Transport Staff',
      description: 'Manage residential room allotments, maintenance dispatch tickets, and campus transport fleet rosters.',
      badgeVariant: 'warning',
    },
    {
      role: 'Super Admin',
      path: '/super-admin',
      loginPath: '/login/super-admin',
      title: 'Super Admin Console',
      description: 'System health diagnostics, audit logging, security role governance, and 15-module readiness telemetry.',
      badgeVariant: 'danger',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-navy-800">
        <div className="absolute inset-0 bg-[radial-gradient(#0D9488_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-800/80 border border-teal-500/30 text-xs font-medium text-teal-300">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Part 1 Architecture Active — Foundation & Design System</span>
            </div>

            {/* Headline */}
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] text-white">
              The Intelligent Operating System for <span className="text-teal-400">Modern Universities</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              CampusVerse AI integrates 15 core university management modules into a unified, role-governed ecosystem designed for students, faculty, executives, parents, and campus staff.
            </p>

            {/* CTA Group */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/student" className="w-full sm:w-auto">
                <Button
                  variant="teal"
                  size="lg"
                  className="w-full sm:w-auto justify-center"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Demo Portals
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto justify-center !bg-navy-800/80 !text-white !border-navy-700 hover:!bg-navy-700"
                >
                  Portal Sign In Preview
                </Button>
              </Link>
            </div>

            {/* Technical Readiness Indicators */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-navy-800/80 text-left">
              <div className="p-3 rounded-lg bg-navy-900/50 border border-navy-800">
                <div className="text-lg font-bold text-white">15 Modules</div>
                <div className="text-xs text-slate-400">Planned Ecosystem</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-900/50 border border-navy-800">
                <div className="text-lg font-bold text-teal-400">7 Unified Roles</div>
                <div className="text-xs text-slate-400">Role-Based Access</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-900/50 border border-navy-800">
                <div className="text-lg font-bold text-white">Part 1 Complete</div>
                <div className="text-xs text-slate-400">UI & Component System</div>
              </div>
              <div className="p-3 rounded-lg bg-navy-900/50 border border-navy-800">
                <div className="text-lg font-bold text-teal-400">Part 2 Next</div>
                <div className="text-xs text-slate-400">Node/Express & Mongo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
              Unified Campus Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              Eliminating Silos with an All-In-One Higher Education Platform
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Traditional university campuses operate with fragmented point solutions: disconnected attendance sheets, isolated fee desks, independent placement portals, and paper grievances.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              CampusVerse AI bridges this gap through a unified data schema and common component design system, ensuring every student, faculty member, administrator, and guardian accesses synchronized information in real time.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>Single Source of Truth across academic, administrative, and facility records.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>Strict separation of concerns prepared for scalable microservices in later phases.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>Enterprise design system ensuring high contrast, accessibility, and responsiveness.</span>
              </li>
            </ul>
          </div>

          {/* Architecture Card Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-elevation space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-600 ml-2">
                  CampusVerse Architecture Blueprint
                </span>
              </div>
              <Badge variant="teal" size="sm">
                Multi-Tier Architecture
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-navy-950 mb-1">
                  <span>Frontend Client Layer (Part 1 Active)</span>
                  <Badge variant="success" size="sm">Implemented</Badge>
                </div>
                <p className="text-slate-600">
                  React 19, Vite 6, Tailwind CSS, React Router, Lucide Icons, and accessible design system components.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-navy-950 mb-1">
                  <span>Backend REST & Auth Gateway (Part 2 Next)</span>
                  <Badge variant="warning" size="sm">Scheduled</Badge>
                </div>
                <p className="text-slate-600">
                  Node.js, Express.js, MongoDB, Mongoose ORM, JWT security tokens, and Role-Based Access Control (RBAC).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-semibold text-navy-950 mb-1">
                  <span>AI Reasoning & Optimization Service (Part 3)</span>
                  <Badge variant="info" size="sm">Specification Ready</Badge>
                </div>
                <p className="text-slate-600">
                  Python, FastAPI, Scikit-learn/PyTorch for predictive student risk alerts and timetable solver.
                </p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 text-center border-t border-slate-100">
              Clean modular boundaries prevent circular dependencies across project phases.
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards: Major Campus Services */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <Badge variant="navy" size="md">
            15 Integrated Modules
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Comprehensive Digital University Services
          </h2>
          <p className="text-sm text-slate-600">
            Engineered to handle every touchpoint of university life—from enrollment to graduation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {campusServices.map((service) => (
            <Card
              key={service.title}
              hoverable
              className="flex flex-col justify-between"
              bodyClassName="p-5 flex flex-col justify-between h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-100">
                    {service.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {service.moduleTag}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-medium">
                <span>Architecture Ready</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stakeholder Benefits Section */}
      <section id="benefits" className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="teal" size="md">
              Stakeholder Value
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Benefits Tailored for Every University Member
            </h2>
            <p className="text-sm text-slate-600">
              Purpose-built workflows reduce administrative friction and elevate academic achievement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-base font-semibold text-slate-900">For Students</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Real-time visibility into attendance and 75% threshold safety.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Instant assignment tracking with deadline countdowns.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Transparent fee receipts and semester grade sheets.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-base font-semibold text-slate-900">For Faculty</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-700" />
                  Fast attendance recording without manual paperwork rosters.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-700" />
                  Structured assignment submissions and gradebook entry.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-700" />
                  Automated course schedule and student advisory rosters.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-card space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-base font-semibold text-slate-900">For University Leadership</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Campus-wide metrics on enrollment, fee collections, and exams.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Grievance resolution tracking and approval pipelines.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  Placement statistics and institutional compliance audits.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities Section (Planned for Part 3) */}
      <section id="ai-intelligence" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-navy-950 rounded-2xl border border-navy-800 p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-medium text-teal-300">
              <Cpu className="w-3.5 h-3.5" />
              <span>Artificial Intelligence Roadmap (Part 3)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Intelligent Capabilities Built on Python & FastAPI
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              In Part 3, CampusVerse AI introduces specialized machine learning services designed to automate cognitive workflows across the university ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8 relative z-10">
            {aiCapabilities.map((ai) => (
              <div key={ai.title} className="p-5 rounded-xl bg-navy-900/80 border border-navy-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-teal-300">{ai.title}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                    {ai.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ai.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-navy-800/80 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>Note: Full AI model deployment occurs after Part 2 backend database integration.</span>
            <span className="text-teal-400 font-mono">FastAPI + Scikit-Learn / PyTorch</span>
          </div>
        </div>
      </section>

      {/* 7 Unified Roles Showcase */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <Badge variant="teal" size="md">
            Interactive Architecture Preview
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Explore All 7 University Role Dashboards
          </h2>
          <p className="text-sm text-slate-600">
            Click any portal below to inspect its dedicated dashboard layout, UI components, and demonstration data.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roleCards.map((rc) => (
            <Card
              key={rc.role}
              hoverable
              className="flex flex-col justify-between"
              bodyClassName="p-5 flex flex-col justify-between h-full"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={rc.badgeVariant} size="sm">
                    {rc.role}
                  </Badge>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {rc.path}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{rc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {rc.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <Link to={rc.loginPath} className="w-full">
                  <Button
                    variant="teal"
                    size="sm"
                    className="w-full justify-between"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Sign In to {rc.role} Portal
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
