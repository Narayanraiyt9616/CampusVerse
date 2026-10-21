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
  ChevronRight,
  Sparkles,
  Bell,
  User,
  Users,
  Shield,
  BookOpen,
  FileText,
  Bot,
  BarChart3,
  Zap,
  Layers
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import campusHeroBg from '../../assets/campus_hero_bg.jpg';

export const LandingPage = () => {
  const campusServices = [
    {
      icon: <GraduationCap className="w-5 h-5 text-[#D99A00]" />,
      title: 'Student Information System (SIS)',
      description: 'Comprehensive 360° student academic profiles, program registrations, credit audits, and cumulative grade point telemetry.',
      moduleTag: 'Module 1',
    },
    {
      icon: <CalendarCheck className="w-5 h-5 text-[#D99A00]" />,
      title: 'Autonomous Attendance Tracking',
      description: 'Multi-mode attendance management supporting biometric roster sync, subject threshold warnings (<75%), and faculty sign-offs.',
      moduleTag: 'Module 3',
    },
    {
      icon: <Clock className="w-5 h-5 text-[#D99A00]" />,
      title: 'Dynamic Timetable & Schedule',
      description: 'Algorithmic room and faculty scheduling preventing conflicting bookings across lecture halls, research studios, and seminar complexes.',
      moduleTag: 'Module 6',
    },
    {
      icon: <Award className="w-5 h-5 text-[#D99A00]" />,
      title: 'Exams, Grading & Assessment',
      description: 'Continuous assessment tracking, mid-term grading, end-semester evaluation workflows, and instant SGPA/CGPA transcript generation.',
      moduleTag: 'Module 4',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-[#D99A00]" />,
      title: 'Fee Invoicing & Payment Audits',
      description: 'Transparent tuition, hostel, and exam fee billing with real-time receipt generation, deadline reminders, and clearance tracking.',
      moduleTag: 'Module 5',
    },
    {
      icon: <Briefcase className="w-5 h-5 text-[#D99A00]" />,
      title: 'Training & Corporate Placement',
      description: 'End-to-end recruiter engagement portal, eligibility filtering, drive registration, interview tracking, and CTC package analytics.',
      moduleTag: 'Module 7',
    },
    {
      icon: <Home className="w-5 h-5 text-[#D99A00]" />,
      title: 'Hostel & Residence Allotment',
      description: 'Warden occupancy registers, digital room allocation, mess grievance tracking, and facility maintenance dispatch.',
      moduleTag: 'Module 8',
    },
    {
      icon: <Bus className="w-5 h-5 text-[#D99A00]" />,
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
      accentColor: '#D99A00',
      bgCard: 'bg-[#FFFDF5]',
      borderCard: 'border-[#F1E7CF] hover:border-[#FFC107]',
      iconBg: 'bg-[#FFF8E6] text-[#D99A00]',
      btnBg: 'bg-[#FFF8E6] hover:bg-[#FFC107] text-[#D99A00] hover:text-[#111827]',
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      role: 'Faculty',
      path: '/faculty',
      loginPath: '/login/faculty',
      title: 'Faculty Portal',
      description: 'Review assigned courses, record class attendance, evaluate student submissions, and submit marks.',
      badgeVariant: 'teal',
      accentColor: '#7C3AED',
      bgCard: 'bg-[#FAF8FF]',
      borderCard: 'border-[#E9E4F5] hover:border-[#7C3AED]',
      iconBg: 'bg-[#F0EBFA] text-[#7C3AED]',
      btnBg: 'bg-[#F0EBFA] hover:bg-[#7C3AED] text-[#7C3AED] hover:text-white',
      icon: <Users className="w-6 h-6" />,
    },
    {
      role: 'Administrator',
      path: '/admin',
      loginPath: '/login/admin',
      title: 'Admin Portal',
      fullTitle: 'Administrator Console',
      description: 'Manage campus departments, academic programs, pending administrative approvals, and student grievances.',
      badgeVariant: 'navy',
      accentColor: '#EF4444',
      bgCard: 'bg-[#FFF8F8]',
      borderCard: 'border-[#FCE6E6] hover:border-[#EF4444]',
      iconBg: 'bg-[#FDE8E8] text-[#EF4444]',
      btnBg: 'bg-[#FDE8E8] hover:bg-[#EF4444] text-[#EF4444] hover:text-white',
      icon: <Shield className="w-6 h-6" />,
    },
    {
      role: 'Parent',
      path: '/parent',
      loginPath: '/login/parent',
      title: 'Parent Portal',
      fullTitle: 'Parent / Guardian Portal',
      description: 'Transparent visibility into ward academic progress, attendance percentage, and fee receipts.',
      badgeVariant: 'teal',
      accentColor: '#16A34A',
      bgCard: 'bg-[#F6FDF9]',
      borderCard: 'border-[#DEF7EC] hover:border-[#16A34A]',
      iconBg: 'bg-[#DEF7EC] text-[#16A34A]',
      btnBg: 'bg-[#DEF7EC] hover:bg-[#16A34A] text-[#16A34A] hover:text-white',
      icon: <User className="w-6 h-6" />,
    },
    {
      role: 'Placement',
      path: '/placement',
      loginPath: '/login/placement',
      title: 'Placement Cell',
      fullTitle: 'Placement Cell',
      description: 'Coordinate campus recruitment drives, verify student eligibility criteria, and track recruitment metrics.',
      badgeVariant: 'teal',
      accentColor: '#2563EB',
      bgCard: 'bg-[#F4F9FF]',
      borderCard: 'border-[#E1EFFE] hover:border-[#2563EB]',
      iconBg: 'bg-[#E1EFFE] text-[#2563EB]',
      btnBg: 'bg-[#E1EFFE] hover:bg-[#2563EB] text-[#2563EB] hover:text-white',
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      role: 'Hostel Staff',
      path: '/hostel',
      loginPath: '/login/hostel',
      title: 'Hostel & Transport',
      fullTitle: 'Hostel Portal',
      description: 'Manage residential room allotments, maintenance dispatch tickets, and campus transport fleet rosters.',
      badgeVariant: 'teal',
      accentColor: '#D99A00',
      bgCard: 'bg-[#FFF9F3]',
      borderCard: 'border-[#FCE8D5] hover:border-[#FFC107]',
      iconBg: 'bg-[#FCE8D5] text-[#D99A00]',
      btnBg: 'bg-[#FCE8D5] hover:bg-[#FFC107] text-[#D99A00] hover:text-[#111827]',
      icon: <Bus className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20 bg-[#FFFEFA] text-[#111827]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#F1E7CF]">
        {/* Ambient Warm Golden Glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#FFC107]/20 via-[#FFF8E6]/60 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/4" />
        <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#FFF8E6]/80 via-[#FFFDF5] to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Hero Content & CTAs */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-6">
              {/* Status Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#F1E7CF] text-xs font-bold text-[#D99A00] shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B301]" />
                <span>CampusVerse AI Enterprise Architecture Active</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.12] text-[#111827]">
                The Intelligent Operating System for{' '}
                <span className="text-[#D99A00] relative inline-block">
                  Modern Universities
                  <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#FFC107] opacity-80" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal max-w-xl">
                CampusVerse AI integrates 15 core university management modules into a unified, role-governed ecosystem designed for students, faculty, executives, parents, and campus staff.
              </p>

              {/* CTA Group */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3.5">
                <Link to="/student" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto justify-center !bg-[#FFC107] hover:!bg-[#E5A900] !text-[#111827] font-bold rounded-full px-7 py-3.5 shadow-[0_4px_16px_rgba(255,193,7,0.35)] !border-transparent transition-all"
                    rightIcon={<ArrowRight className="w-4 h-4 text-[#111827]" />}
                  >
                    Explore Demo Portals
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto justify-center !bg-[#FFFFFF] hover:!bg-[#FFF8E6] !text-[#111827] font-semibold rounded-full px-7 py-3.5 !border-[#F1E7CF] shadow-xs transition-all"
                  >
                    Portal Sign In Preview
                  </Button>
                </Link>
              </div>

              {/* Social Proof Trust Badges */}
              <div className="pt-2 flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces',
                    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&crop=faces'
                  ].map((src, i) => (
                    <img key={i} src={src} alt="Campus Member" className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-xs" />
                  ))}
                </div>
                <p className="text-xs text-[#4B5563] font-medium">
                  Trusted by <strong className="font-bold text-[#111827]">10,000+</strong> students and faculty members
                </p>
              </div>

              {/* Technical Readiness Indicators */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-[#F1E7CF] text-left">
                <div className="p-3 rounded-xl bg-white border border-[#F1E7CF] shadow-xs">
                  <div className="text-base sm:text-lg font-black text-[#111827]">15 Modules</div>
                  <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-0.5">Planned Ecosystem</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] shadow-xs">
                  <div className="text-base sm:text-lg font-black text-[#D99A00]">7 Unified Roles</div>
                  <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-0.5">Role-Based Access</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#F1E7CF] shadow-xs">
                  <div className="text-base sm:text-lg font-black text-[#111827]">Production Stack</div>
                  <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-0.5">UI & Components</div>
                </div>
                <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] shadow-xs">
                  <div className="text-base sm:text-lg font-black text-[#D99A00]">MongoDB Active</div>
                  <div className="text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-0.5">Node/Express</div>
                </div>
              </div>
            </div>

            {/* Right Column: Campus Image & Interactive Dashboard Preview Mockup */}
            <div className="lg:col-span-7 xl:col-span-7 relative">
              {/* Campus Architecture Photography Backdrop */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-40 lg:opacity-75">
                <img
                  src={campusHeroBg}
                  alt="CampusVerse AI Campus Background"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FFFEFA] via-[#FFFEFA]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFFEFA] via-transparent to-transparent" />
              </div>

              {/* Hand-written Script Annotation */}
              <div className="hidden sm:block absolute top-2 left-8 z-20 pointer-events-none -rotate-3">
                <span className="font-serif italic font-bold text-sm sm:text-base text-[#111827]/90 tracking-tight bg-white/80 backdrop-blur-xs px-3 py-1 rounded-lg border border-[#F1E7CF] shadow-xs">
                  Smarter Campus, Brighter Futures ✦
                </span>
              </div>

              {/* Floating Dashboard Preview Card */}
              <div className="relative z-10 bg-white rounded-2xl sm:rounded-3xl border border-[#F1E7CF] shadow-[0_20px_50px_rgba(180,130,20,0.15)] overflow-hidden transition-all duration-300 hover:shadow-[0_25px_60px_rgba(180,130,20,0.2)]">
                {/* Top Window Header */}
                <div className="px-4 py-3 bg-[#FFFEFA] border-b border-[#F1E7CF] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#111827] flex items-center justify-center text-[#FFC107] shadow-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="font-display font-extrabold text-xs sm:text-sm text-[#111827]">
                      CampusVerse<span className="text-[#D99A00]">AI</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative p-1 text-[#64748B]">
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                    </div>
                    <div className="flex items-center gap-1.5 pl-2 border-l border-[#F1E7CF]">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
                        alt="Student"
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-[#F1E7CF]"
                      />
                      <span className="text-xs font-semibold text-[#111827] hidden sm:inline">Hi, Student</span>
                      <span className="text-[10px] text-[#64748B]">▾</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Interior: Two Columns */}
                <div className="grid grid-cols-12 min-h-[330px]">
                  {/* Mini Sidebar */}
                  <div className="col-span-3 border-r border-[#F1E7CF] bg-[#FFFDF5] p-2 space-y-1 text-[11px] font-medium hidden sm:block">
                    <div className="px-2.5 py-1.5 rounded-lg bg-[#FFC107] text-[#111827] font-bold flex items-center gap-1.5 shadow-xs">
                      <Layers className="w-3.5 h-3.5" />
                      <span className="truncate">Dashboard</span>
                    </div>
                    {[
                      { icon: <User className="w-3.5 h-3.5" />, label: 'Students' },
                      { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Faculty' },
                      { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'Academics' },
                      { icon: <CalendarCheck className="w-3.5 h-3.5" />, label: 'Attendance' },
                      { icon: <Award className="w-3.5 h-3.5" />, label: 'Examinations' },
                      { icon: <Clock className="w-3.5 h-3.5" />, label: 'Assignments' },
                      { icon: <Bell className="w-3.5 h-3.5" />, label: 'Notices' },
                      { icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Placements' },
                      { icon: <Home className="w-3.5 h-3.5" />, label: 'Hostel & Transport' },
                    ].map((item, idx) => (
                      <div key={idx} className="px-2.5 py-1 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#FFF8E6] flex items-center gap-1.5 cursor-pointer transition-colors">
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Main Dashboard Canvas */}
                  <div className="col-span-12 sm:col-span-9 p-4 sm:p-5 space-y-4 bg-white">
                    {/* Welcome Header */}
                    <div>
                      <h4 className="font-extrabold text-[#111827] text-sm sm:text-base">Welcome Back!</h4>
                      <p className="text-[11px] sm:text-xs text-[#64748B]">Here's what's happening in your campus today.</p>
                    </div>

                    {/* 4 Metric Tiles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                        <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-semibold">
                          <BookOpen className="w-3 h-3" />
                          <span>Classes</span>
                        </div>
                        <div className="text-base font-extrabold text-[#111827] mt-1">5</div>
                        <div className="text-[10px] text-[#64748B]">Today</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF]">
                        <div className="flex items-center gap-1.5 text-[#D99A00] text-[10px] font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>Assignments</span>
                        </div>
                        <div className="text-base font-extrabold text-[#111827] mt-1">2</div>
                        <div className="text-[10px] text-[#64748B]">Pending</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                        <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-semibold">
                          <Bell className="w-3 h-3" />
                          <span>Notices</span>
                        </div>
                        <div className="text-base font-extrabold text-[#111827] mt-1">3</div>
                        <div className="text-[10px] text-[#64748B]">New</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Attendance</span>
                        </div>
                        <div className="text-base font-extrabold text-[#111827] mt-1">92%</div>
                        <div className="text-[10px] text-[#64748B]">This Month</div>
                      </div>
                    </div>

                    {/* Recent Updates */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#111827]">
                        <span>Recent Updates</span>
                        <span className="text-[11px] text-[#D99A00] hover:underline cursor-pointer">View All</span>
                      </div>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="p-2 rounded-lg bg-[#FFFEFA] border border-[#F1E7CF] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">New assignment posted</div>
                              <div className="text-[10px] text-[#64748B]">Data Structures - Prof. Sharma</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#64748B] font-mono shrink-0">2 hours ago</span>
                        </div>

                        <div className="p-2 rounded-lg bg-[#FFFEFA] border border-[#F1E7CF] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                              <Award className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">Examination schedule released</div>
                              <div className="text-[10px] text-[#64748B]">End Semester Examination</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#64748B] font-mono shrink-0">5 hours ago</span>
                        </div>

                        <div className="p-2 rounded-lg bg-[#FFFEFA] border border-[#F1E7CF] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-bold text-[#111827]">Campus event: Tech Fest 2026</div>
                              <div className="text-[10px] text-[#64748B]">Registrations are now open</div>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#64748B] font-mono shrink-0">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating AI Assistant Widget Pill */}
              <div className="sm:absolute -bottom-4 right-2 sm:right-6 z-20 mt-3 sm:mt-0">
                <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#F1E7CF] shadow-[0_10px_30px_rgba(180,130,20,0.18)]">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-[#D99A00] flex items-center justify-center border border-[#F1E7CF] shrink-0">
                    <Bot className="w-5 h-5 text-[#D99A00]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-[#111827]">AI Assistant</div>
                    <div className="text-[10px] text-[#64748B]">Get instant help with your academic queries</div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#FFC107] text-[#111827] flex items-center justify-center shadow-xs shrink-0 ml-1">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Choose Your Portal Section (Matching Reference Image) */}
      <section id="roles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-[#F1E7CF] p-6 sm:p-10 shadow-[0_10px_30px_rgba(180,130,20,0.06)] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Choose Your Portal
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-normal">
              Access your role-based portal and explore a personalized experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {roleCards.map((rc) => (
              <div
                key={rc.role}
                className={`flex flex-col justify-between ${rc.bgCard} rounded-2xl border ${rc.borderCard} p-5 hover:shadow-md transition-all duration-200 group`}
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${rc.iconBg}`}>
                      {rc.icon}
                    </div>
                    <Link
                      to={rc.loginPath}
                      aria-label={`Open ${rc.title}`}
                      className={`w-8 h-8 rounded-full ${rc.btnBg} flex items-center justify-center transition-colors shadow-xs`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-base group-hover:text-[#D99A00] transition-colors">
                      {rc.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed line-clamp-3">
                      {rc.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1E7CF]/80">
                  <Link to={rc.loginPath} className="block w-full">
                    <span className="text-[11px] font-bold text-[#D99A00] group-hover:underline flex items-center gap-1">
                      Sign In &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Row (Matching Bottom Bar in Reference Image) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#F1E7CF] p-4 sm:p-6 shadow-[0_4px_20px_rgba(180,130,20,0.06)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#D99A00] flex items-center justify-center shrink-0 border border-[#F1E7CF]">
              <Zap className="w-6 h-6 text-[#D99A00]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">All-in-One Platform</h4>
              <p className="text-xs text-[#64748B]">Everything you need in one place</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#D99A00] flex items-center justify-center shrink-0 border border-[#F1E7CF]">
              <Shield className="w-6 h-6 text-[#D99A00]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">Secure & Reliable</h4>
              <p className="text-xs text-[#64748B]">Your data is always safe</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#D99A00] flex items-center justify-center shrink-0 border border-[#F1E7CF]">
              <Users className="w-6 h-6 text-[#D99A00]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">Real-Time Communication</h4>
              <p className="text-xs text-[#64748B]">Stay connected effortlessly</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#D99A00] flex items-center justify-center shrink-0 border border-[#F1E7CF]">
              <BarChart3 className="w-6 h-6 text-[#D99A00]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#111827]">Smart Insights</h4>
              <p className="text-xs text-[#64748B]">Data-driven decisions for a better campus</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] uppercase tracking-wider">
              Unified Campus Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-snug">
              Eliminating Silos with an All-In-One Higher Education Platform
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
              Traditional university campuses operate with fragmented point solutions: disconnected attendance sheets, isolated fee desks, independent placement portals, and paper grievances.
            </p>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-normal">
              CampusVerse AI bridges this gap through a unified data schema and common component design system, ensuring every student, faculty member, administrator, and guardian accesses synchronized information in real time.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-[#111827] font-semibold">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D99A00] shrink-0 mt-0.5" />
                <span>Single Source of Truth across academic, administrative, and facility records.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D99A00] shrink-0 mt-0.5" />
                <span>Strict separation of concerns prepared for scalable microservices.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#D99A00] shrink-0 mt-0.5" />
                <span>Enterprise design system ensuring high contrast, readability, and responsiveness.</span>
              </li>
            </ul>
          </div>

          {/* Architecture Card Preview */}
          <div className="bg-white rounded-3xl border border-[#F1E7CF] p-6 sm:p-8 shadow-[0_10px_30px_rgba(180,130,20,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1E7CF] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#111827]">
                  CampusVerse AI Architecture Blueprint
                </span>
              </div>
              <Badge variant="teal" size="sm" className="!bg-[#FFF8E6] !text-[#D99A00] !border-[#F1E7CF] font-bold">
                Multi-Tier Enterprise
              </Badge>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                <div className="flex items-center justify-between font-bold text-[#111827] mb-1">
                  <span>Frontend Client Layer</span>
                  <Badge variant="teal" size="sm" className="!bg-[#FFF8E6] !text-[#D99A00] !border-[#F1E7CF]">Active</Badge>
                </div>
                <p className="text-[#4B5563] font-normal leading-relaxed">
                  React 19, Vite 6, Tailwind CSS, React Router, Lucide Icons, and accessible 5-color design system components.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                <div className="flex items-center justify-between font-bold text-[#111827] mb-1">
                  <span>Backend REST & Auth Gateway</span>
                  <Badge variant="teal" size="sm" className="!bg-[#FFF8E6] !text-[#D99A00] !border-[#F1E7CF]">Operational</Badge>
                </div>
                <p className="text-[#4B5563] font-normal leading-relaxed">
                  Node.js, Express.js, MongoDB, Mongoose ORM, JWT security tokens, and Role-Based Access Control (RBAC).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                <div className="flex items-center justify-between font-bold text-[#111827] mb-1">
                  <span>AI Reasoning & Optimization Service</span>
                  <Badge variant="warning" size="sm" className="!bg-[#FFF8E6] !text-[#D99A00] !border-[#F1E7CF]">Roadmap</Badge>
                </div>
                <p className="text-[#4B5563] font-normal leading-relaxed">
                  Python, FastAPI, Scikit-learn/PyTorch for predictive student risk alerts and timetable solver.
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs font-semibold text-[#64748B] text-center border-t border-[#F1E7CF]">
              Clean modular boundaries prevent circular dependencies across project phases.
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards: Major Campus Services */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3.5 mb-12">
          <Badge variant="navy" size="md" className="!bg-[#FFF8E6] !text-[#D99A00] !border-[#F1E7CF] font-bold">
            15 Integrated Modules
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            Comprehensive Digital University Services
          </h2>
          <p className="text-sm sm:text-base text-[#4B5563] font-normal">
            Engineered to handle every touchpoint of university life—from enrollment to graduation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campusServices.map((service) => (
            <Card
              key={service.title}
              hoverable
              className="flex flex-col justify-between !bg-white !border-[#F1E7CF] hover:!border-[#FFC107] hover:!shadow-[0_10px_30px_rgba(180,130,20,0.12)] rounded-2xl transition-all duration-200"
              bodyClassName="p-6 flex flex-col justify-between h-full bg-white"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#FFF8E6] text-[#D99A00]">
                    {service.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#111827] bg-[#FFF8E6] border border-[#F1E7CF] px-2.5 py-1 rounded-md">
                    {service.moduleTag}
                  </span>
                </div>
                <h3 className="font-bold text-[#111827] text-base">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed font-normal">
                  {service.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#F1E7CF] flex items-center justify-between text-xs text-[#D99A00] font-bold">
                <span>Architecture Ready</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Stakeholder Benefits Section */}
      <section id="benefits" className="bg-[#FFFDF5] py-16 border-y border-[#F1E7CF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-12">
            <Badge variant="teal" size="md" className="!bg-[#FFF8E6] !text-[#D99A00] !border-[#F1E7CF] font-bold">
              Stakeholder Value
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Benefits Tailored for Every University Member
            </h2>
            <p className="text-sm sm:text-base text-[#4B5563] font-normal">
              Purpose-built workflows reduce administrative friction and elevate academic achievement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F1E7CF] shadow-[0_4px_20px_rgba(180,130,20,0.06)] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] flex items-center justify-center font-black text-base">
                01
              </div>
              <h3 className="text-lg font-bold text-[#111827]">For Students</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#4B5563] font-normal">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Real-time visibility into attendance and 75% threshold safety.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Instant assignment tracking with deadline countdowns.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Transparent fee receipts and semester grade sheets.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F1E7CF] shadow-[0_4px_20px_rgba(180,130,20,0.06)] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] flex items-center justify-center font-black text-base">
                02
              </div>
              <h3 className="text-lg font-bold text-[#111827]">For Faculty</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#4B5563] font-normal">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Fast attendance recording without manual paperwork rosters.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Structured assignment submissions and gradebook entry.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Automated course schedule and student advisory rosters.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F1E7CF] shadow-[0_4px_20px_rgba(180,130,20,0.06)] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] flex items-center justify-center font-black text-base">
                03
              </div>
              <h3 className="text-lg font-bold text-[#111827]">For University Leadership</h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#4B5563] font-normal">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Campus-wide metrics on enrollment, fee collections, and exams.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Grievance resolution tracking and approval pipelines.
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFC107] shrink-0" />
                  Placement statistics and institutional compliance audits.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section id="ai-intelligence" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-[#111827] rounded-3xl border border-[#F1E7CF]/30 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          {/* Subtle Golden Glow Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#FFC107]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC107] text-[#111827] text-xs font-bold">
              <Cpu className="w-4 h-4 text-[#111827]" />
              <span>Artificial Intelligence Roadmap (Part 3)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Intelligent Capabilities Built on Python & FastAPI
            </h2>
            <p className="text-sm sm:text-base text-[#D1D5DB] leading-relaxed font-normal">
              In Part 3, CampusVerse AI introduces specialized machine learning services designed to automate cognitive workflows across the university ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 relative z-10">
            {aiCapabilities.map((ai) => (
              <div key={ai.title} className="p-6 rounded-2xl bg-[#1F2937] border border-[#374151] hover:border-[#FFC107]/60 transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-[#FFC107]">{ai.title}</h4>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#FFF8E6] text-[#111827] font-bold">
                    {ai.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed font-normal">
                  {ai.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-[#374151] text-xs sm:text-sm text-[#9CA3AF] flex items-center justify-between flex-wrap gap-2 font-medium">
            <span>Note: Full AI model deployment occurs after backend database integration.</span>
            <span className="text-[#FFC107] font-mono font-bold">FastAPI + Scikit-Learn / PyTorch</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
