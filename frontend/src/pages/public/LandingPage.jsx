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
  Layers,
  Landmark,
  UserCheck,
  Video,
  ExternalLink,
  FileCheck
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import campusHeroBg from '../../assets/campus_hero_bg.jpg';
import { VERSEMEET_URL, getCertificationPlatformUrl } from '../../utils/certificationConfig';

export const LandingPage = () => {
  const certDemoUrl = getCertificationPlatformUrl();
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


  // 3D Visual Illustrations matching Reference Image
  const StudentIllustration = () => (
    <svg viewBox="0 0 200 125" className="w-full h-20 sm:h-24 object-contain pointer-events-none select-none drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="studShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bookBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="bookMidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="112" rx="72" ry="9" fill="url(#studShadow)" />
      <g transform="translate(28, 72)">
        <path d="M10 22 C 40 30, 110 30, 140 22 L 140 34 C 110 42, 40 42, 10 34 Z" fill="#B45309" />
        <path d="M10 22 L 12 10 C 42 18, 112 18, 142 10 L 140 22 C 110 30, 40 30, 10 22 Z" fill="#FFFBEB" />
        <path d="M12 10 C 42 18, 112 18, 142 10 L 138 0 C 108 8, 38 8, 8 0 Z" fill="url(#bookBottomGrad)" />
        <path d="M8 0 L 10 34 C 9 34, 7 32, 6 26 L 4 0 Z" fill="#92400E" />
      </g>
      <g transform="translate(34, 52) rotate(-2 70 20)">
        <path d="M8 20 C 38 28, 108 28, 138 20 L 138 30 C 108 38, 38 38, 8 30 Z" fill="#D97706" />
        <path d="M8 20 L 10 9 C 40 17, 110 17, 140 9 L 138 20 C 108 28, 38 28, 8 20 Z" fill="#FEF3C7" />
        <path d="M10 9 C 40 17, 110 17, 140 9 L 136 0 C 106 8, 36 8, 6 0 Z" fill="url(#bookMidGrad)" />
        <path d="M6 0 L 8 30 C 7 30, 5 28, 4 22 L 2 0 Z" fill="#B45309" />
      </g>
      <g transform="translate(64, 12)">
        <path d="M22 28 C 22 28, 38 38, 54 28 L 54 36 C 38 46, 22 36, 22 36 Z" fill="#0F172A" opacity="0.95" />
        <path d="M38 6 L 74 22 L 38 36 L 2 22 Z" fill="url(#capGrad)" stroke="#334155" strokeWidth="1" />
        <ellipse cx="38" cy="21" rx="4" ry="2.5" fill="#F59E0B" />
        <path d="M38 22 C 48 24, 64 28, 66 38" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="66" cy="40" r="3.5" fill="#D97706" />
        <path d="M64 42 L 68 50 L 64 50 Z" fill="#F59E0B" />
      </g>
    </svg>
  );

  const FacultyIllustration = () => (
    <svg viewBox="0 0 200 125" className="w-full h-20 sm:h-24 object-contain pointer-events-none select-none drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="facShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lapScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF5FF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="lapBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>
      <ellipse cx="95" cy="112" rx="72" ry="9" fill="url(#facShadow)" />
      <g transform="translate(32, 26)">
        <rect x="22" y="6" width="86" height="58" rx="7" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="1.5" />
        <rect x="27" y="11" width="76" height="48" rx="4" fill="url(#lapScreenGrad)" />
        <circle cx="44" cy="28" r="9" fill="#C4B5FD" />
        <circle cx="44" cy="26" r="4.5" fill="#8B5CF6" />
        <path d="M37 34 C 37 31, 51 31, 51 34" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />
        <rect x="58" y="22" width="38" height="4" rx="2" fill="#8B5CF6" opacity="0.8" />
        <rect x="58" y="30" width="30" height="3" rx="1.5" fill="#A78BFA" opacity="0.7" />
        <rect x="34" y="44" width="62" height="6" rx="2" fill="#DDD6FE" />
        <path d="M10 64 L 120 64 L 132 84 L -2 84 Z" fill="url(#lapBodyGrad)" stroke="#8B5CF6" strokeWidth="1" />
        <rect x="52" y="72" width="26" height="9" rx="2" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="0.8" />
        <path d="M18 67 L 112 67" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>
      <g transform="translate(144, 62)">
        <path d="M8 24 L 28 24 L 24 44 L 12 44 Z" fill="#8B5CF6" />
        <ellipse cx="18" cy="24" rx="10" ry="3" fill="#A78BFA" />
        <path d="M18 22 Q 10 8 4 14 Q 10 22 18 22" fill="#10B981" />
        <path d="M18 22 Q 22 2 30 6 Q 26 18 18 22" fill="#34D399" />
        <path d="M18 22 Q 16 0 18 -2 Q 22 10 18 22" fill="#059669" />
      </g>
    </svg>
  );

  const AdminIllustration = () => (
    <svg viewBox="0 0 200 125" className="w-full h-20 sm:h-24 object-contain pointer-events-none select-none drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="admShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
        <linearGradient id="podiumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE4E6" />
          <stop offset="100%" stopColor="#FECDD3" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="112" rx="72" ry="9" fill="url(#admShadow)" />
      <g transform="translate(64, 70)">
        <path d="M10 24 L 90 24 L 105 40 L -5 40 Z" fill="url(#podiumGrad)" stroke="#FDA4AF" strokeWidth="1" />
        <g transform="translate(66, -10)">
          <rect x="0" y="20" width="10" height="24" rx="2" fill="#F43F5E" opacity="0.6" />
          <rect x="14" y="10" width="10" height="34" rx="2" fill="#FB7185" />
          <rect x="28" y="0" width="10" height="44" rx="2" fill="#F43F5E" />
        </g>
      </g>
      <g transform="translate(48, 28)">
        <circle cx="36" cy="38" r="28" fill="#E11D48" />
        <circle cx="34" cy="36" r="28" fill="url(#gearGrad)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="30"
            y="4"
            width="8"
            height="10"
            rx="2"
            fill="#FB7185"
            transform={`rotate(${angle} 34 36)`}
          />
        ))}
        <circle cx="34" cy="36" r="11" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="2" />
      </g>
    </svg>
  );

  const ParentIllustration = () => (
    <svg viewBox="0 0 200 125" className="w-full h-20 sm:h-24 object-contain pointer-events-none select-none drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="parShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="112" rx="72" ry="9" fill="url(#parShadow)" />
      <g transform="translate(38, 46)">
        <path d="M10 44 Q 64 34 64 48 Q 64 34 118 44 L 124 50 Q 64 40 64 54 Q 64 40 4 50 Z" fill="#047857" />
        <path d="M12 42 Q 64 32 64 46 L 64 12 Q 64 0 12 8 Z" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
        <path d="M116 42 Q 64 32 64 46 L 64 12 Q 64 0 116 8 Z" fill="#FFFFFF" stroke="#BBF7D0" strokeWidth="1" />
        <line x1="22" y1="18" x2="54" y2="18" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="26" x2="50" y2="26" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="22" y1="34" x2="44" y2="34" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="74" y1="18" x2="106" y2="18" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="74" y1="26" x2="102" y2="26" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="74" y1="34" x2="94" y2="34" stroke="#A7F3D0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M64 12 Q 62 30 60 56 L 65 52 L 70 56 Q 66 30 64 12" fill="#F43F5E" />
      </g>
      <g transform="translate(98, 26)">
        <circle cx="16" cy="16" r="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="16" cy="12" r="5" fill="#FFFFFF" />
        <path d="M8 24 C 8 19 24 19 24 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g transform="translate(148, 56)">
        <path d="M4 36 Q 16 16 32 18 Q 24 34 4 36 Z" fill="#10B981" />
        <path d="M6 34 Q 28 32 30 46 Q 14 46 6 34 Z" fill="#34D399" />
      </g>
    </svg>
  );

  const PlacementIllustration = () => (
    <svg viewBox="0 0 200 125" className="w-full h-20 sm:h-24 object-contain pointer-events-none select-none drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="plcShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="112" rx="72" ry="9" fill="url(#plcShadow)" />
      <g transform="translate(50, 22)">
        <g transform="translate(10, 42)">
          <rect x="0" y="8" width="18" height="38" fill="#60A5FA" />
          <polygon points="18,8 28,0 28,38 18,46" fill="#3B82F6" />
          <polygon points="0,8 10,0 28,0 18,8" fill="#93C5FD" />
        </g>
        <g transform="translate(36, 22)">
          <rect x="0" y="8" width="18" height="58" fill="#3B82F6" />
          <polygon points="18,8 28,0 28,58 18,66" fill="#2563EB" />
          <polygon points="0,8 10,0 28,0 18,8" fill="#60A5FA" />
        </g>
        <g transform="translate(62, 0)">
          <rect x="0" y="8" width="18" height="80" fill="#2563EB" />
          <polygon points="18,8 28,0 28,80 18,88" fill="#1D4ED8" />
          <polygon points="0,8 10,0 28,0 18,8" fill="#3B82F6" />
        </g>
      </g>
      <g transform="translate(132, 66)">
        <circle cx="16" cy="16" r="15" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="16" cy="12" r="5" fill="#FFFFFF" />
        <path d="M8 24 C 8 19 24 19 24 24" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );

  const HostelIllustration = () => (
    <svg viewBox="0 0 200 125" className="w-full h-20 sm:h-24 object-contain pointer-events-none select-none drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="hosShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="busBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="112" rx="72" ry="9" fill="url(#hosShadow)" />
      <path d="M10 106 Q 90 92 190 96 L 195 108 Q 95 104 5 118 Z" fill="#F3E8C8" opacity="0.8" />
      <path d="M30 103 Q 95 96 175 99" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 6" fill="none" />
      <g transform="translate(172, 70)">
        <line x1="6" y1="16" x2="6" y2="28" stroke="#B45309" strokeWidth="2" />
        <ellipse cx="6" cy="14" rx="7" ry="10" fill="#10B981" />
      </g>
      <g transform="translate(182, 74)">
        <line x1="5" y1="14" x2="5" y2="24" stroke="#B45309" strokeWidth="1.5" />
        <ellipse cx="5" cy="12" rx="5" ry="8" fill="#34D399" />
      </g>
      <g transform="translate(54, 46)">
        <ellipse cx="50" cy="54" rx="42" ry="6" fill="#78350F" opacity="0.25" />
        <path d="M10 8 C 10 4 16 0 24 0 L 78 0 C 86 0 90 4 90 12 L 90 44 C 90 46 88 48 86 48 L 10 48 C 8 48 6 46 6 40 L 6 16 C 6 10 8 8 10 8 Z" fill="url(#busBodyGrad)" stroke="#B45309" strokeWidth="1.2" />
        <path d="M12 6 C 14 4 18 3 24 3 L 38 3 L 38 22 L 10 22 C 10 14 10 9 12 6 Z" fill="#1E293B" />
        <rect x="42" y="4" width="13" height="18" rx="2" fill="#1E293B" />
        <rect x="58" y="4" width="13" height="18" rx="2" fill="#1E293B" />
        <rect x="74" y="4" width="12" height="18" rx="2" fill="#1E293B" />
        <line x1="44" y1="6" x2="52" y2="20" stroke="#64748B" strokeWidth="1" opacity="0.6" />
        <line x1="60" y1="6" x2="68" y2="20" stroke="#64748B" strokeWidth="1" opacity="0.6" />
        <line x1="76" y1="6" x2="84" y2="20" stroke="#64748B" strokeWidth="1" opacity="0.6" />
        <ellipse cx="8" cy="30" rx="3" ry="4" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.8" />
        <rect x="5" y="38" width="5" height="7" rx="1" fill="#475569" />
        <rect x="8" y="46" width="80" height="4" rx="2" fill="#334155" />
        <g transform="translate(18, 42)">
          <circle cx="6" cy="6" r="8" fill="#0F172A" />
          <circle cx="6" cy="6" r="4" fill="#64748B" />
        </g>
        <g transform="translate(68, 42)">
          <circle cx="6" cy="6" r="8" fill="#0F172A" />
          <circle cx="6" cy="6" r="4" fill="#64748B" />
        </g>
      </g>
    </svg>
  );

  const roleCards = [
    {
      role: 'Student',
      loginPath: '/login/student',
      title: 'Student Portal',
      description: 'Track academics, view timetables, submit assignments and more.',
      bgGradient: 'from-[#FFFDF7] via-white to-[#FEF9EE]',
      borderColor: 'border-[#FDE68A]/80 hover:border-[#F59E0B]',
      iconBg: 'bg-[#F59E0B]',
      arrowBg: 'bg-[#FEF3C7] text-[#D97706] group-hover:bg-[#F59E0B] group-hover:text-white',
      btnBg: 'bg-[#D97706] hover:bg-[#B45309]',
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      illustration: <StudentIllustration />,
    },
    {
      role: 'Faculty',
      loginPath: '/login/faculty',
      title: 'Faculty Portal',
      description: 'Manage subjects, upload resources, record attendance and evaluate students.',
      bgGradient: 'from-[#FAF7FF] via-white to-[#F5F0FF]',
      borderColor: 'border-[#E9D5FF]/80 hover:border-[#8B5CF6]',
      iconBg: 'bg-[#8B5CF6]',
      arrowBg: 'bg-[#F3E8FF] text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white',
      btnBg: 'bg-[#8B5CF6] hover:bg-[#7C3AED]',
      icon: <Users className="w-6 h-6 text-white" />,
      illustration: <FacultyIllustration />,
    },
    {
      role: 'Administrator',
      loginPath: '/login/admin',
      title: 'Admin Portal',
      description: 'Manage campus operations, departments, programs and system settings.',
      bgGradient: 'from-[#FFF7F7] via-white to-[#FFF0F0]',
      borderColor: 'border-[#FECDD3]/80 hover:border-[#F43F5E]',
      iconBg: 'bg-[#F43F5E]',
      arrowBg: 'bg-[#FFE4E6] text-[#F43F5E] group-hover:bg-[#F43F5E] group-hover:text-white',
      btnBg: 'bg-[#F43F5E] hover:bg-[#E11D48]',
      icon: <Shield className="w-6 h-6 text-white" />,
      illustration: <AdminIllustration />,
    },
    {
      role: 'Parent',
      loginPath: '/login/parent',
      title: 'Parent Portal',
      description: "Track your child's academic progress, attendance and important updates.",
      bgGradient: 'from-[#F2FBF6] via-white to-[#ECFDF5]',
      borderColor: 'border-[#BBF7D0]/80 hover:border-[#10B981]',
      iconBg: 'bg-[#10B981]',
      arrowBg: 'bg-[#DCFCE7] text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white',
      btnBg: 'bg-[#10B981] hover:bg-[#059669]',
      icon: <UserCheck className="w-6 h-6 text-white" />,
      illustration: <ParentIllustration />,
    },
    {
      role: 'Placement',
      loginPath: '/login/placement',
      title: 'Placement Cell',
      description: 'Explore job opportunities, view drives, apply online and track your progress.',
      bgGradient: 'from-[#F2F8FE] via-white to-[#EBF5FF]',
      borderColor: 'border-[#BAE6FD]/80 hover:border-[#3B82F6]',
      iconBg: 'bg-[#3B82F6]',
      arrowBg: 'bg-[#E0F2FE] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white',
      btnBg: 'bg-[#2563EB] hover:bg-[#1D4ED8]',
      icon: <Briefcase className="w-6 h-6 text-white" />,
      illustration: <PlacementIllustration />,
    },
    {
      role: 'Hostel Staff',
      loginPath: '/login/hostel',
      title: 'Hostel & Transport',
      description: 'Manage hostel allotment, transport routes, leave requests and travel information.',
      bgGradient: 'from-[#FFFDF7] via-white to-[#FEF9EE]',
      borderColor: 'border-[#FDE68A]/80 hover:border-[#F59E0B]',
      iconBg: 'bg-[#F59E0B]',
      arrowBg: 'bg-[#FEF3C7] text-[#D97706] group-hover:bg-[#F59E0B] group-hover:text-white',
      btnBg: 'bg-[#D97706] hover:bg-[#B45309]',
      icon: <Bus className="w-6 h-6 text-white" />,
      illustration: <HostelIllustration />,
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20 bg-[#FFFEFA] text-[#111827]">
      {/* Hero Section */}
      <section id="overview" className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#F1E7CF]">
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

      {/* Choose Your Portal Section (Redesigned matching reference image) */}
      <section id="roles" className="relative w-full max-w-[97vw] 2xl:max-w-[1740px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 scroll-mt-24">
        {/* Subtle Ambient Decorative Golden Arcs */}
        <div className="absolute -top-10 left-1/4 w-80 h-80 bg-gradient-to-br from-[#FEF08A]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-1/4 w-80 h-80 bg-gradient-to-bl from-[#FEF08A]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-8 sm:space-y-10">
          {/* Header Row with Badge, Main Title, Decorative Dots & Paper Airplane */}
          <div className="relative text-center max-w-3xl mx-auto space-y-3 pt-2">
            {/* Left Decorative Dots Grid */}
            <div className="hidden md:block absolute -left-10 lg:-left-20 top-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                {[6, 22, 38, 54].map((x) =>
                  [6, 22, 38, 54].map((y) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#FDE047" opacity="0.85" />
                  ))
                )}
              </svg>
            </div>

            {/* Right Decorative Paper Airplane with Trail */}
            <div className="hidden md:block absolute -right-10 lg:-right-20 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="76" height="54" viewBox="0 0 76 54" fill="none">
                <path
                  d="M6 42 C 20 42, 28 32, 46 24"
                  stroke="#FDE047"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <g transform="translate(44, 4) rotate(18)">
                  <path d="M0 18 L32 0 L18 32 L13 20 Z" fill="#F59E0B" />
                  <path d="M13 20 L32 0 L18 32 Z" fill="#FBBF24" />
                  <path d="M13 20 L18 32 L15 20 Z" fill="#D97706" />
                </g>
              </svg>
            </div>

            {/* Top Golden Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-xs font-semibold text-[#B45309] shadow-2xs">
              <Landmark className="w-4 h-4 text-[#D97706]" />
              <span>Welcome to CampusVerse</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
                Choose Your <span className="text-[#D97706]">Portal</span>
              </h2>
              {/* Subtle Decorative Golden Underline Bar */}
              <div className="w-14 h-1.5 bg-[#D97706] rounded-full mx-auto mt-2" />
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#64748B] font-normal leading-relaxed max-w-xl mx-auto pt-1">
              Access your role-based portal and explore a personalized campus experience.
            </p>
          </div>

          {/* 6 Portal Cards in Single Row on Large Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4 xl:gap-4 2xl:gap-5">
            {roleCards.map((rc) => (
              <div
                key={rc.role}
                className={`relative flex flex-col justify-between bg-gradient-to-b ${rc.bgGradient} rounded-3xl border ${rc.borderColor} p-5 xl:p-4.5 2xl:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 group overflow-hidden min-h-[380px] xl:min-h-[390px]`}
              >
                {/* Upper Content */}
                <div>
                  {/* Top Icon & Circular Arrow */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${rc.iconBg} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200`}>
                      {rc.icon}
                    </div>
                    <Link
                      to={rc.loginPath}
                      aria-label={`Open ${rc.title}`}
                      className={`w-8 h-8 rounded-full ${rc.arrowBg} flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-110`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-extrabold text-[#0F172A] text-lg mt-4 tracking-tight">
                    {rc.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#64748B] mt-2 leading-relaxed font-normal min-h-[50px]">
                    {rc.description}
                  </p>

                  {/* Sign In Button */}
                  <div className="mt-4">
                    <Link
                      to={rc.loginPath}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full ${rc.btnBg} text-white text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 group-hover:translate-x-0.5`}
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </Link>
                  </div>
                </div>

                {/* Bottom 3D Graphic Illustration */}
                <div className="pt-2 flex items-end justify-center w-full transition-transform duration-300 group-hover:scale-105">
                  {rc.illustration}
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

      {/* Featured Innovations: Online Meeting & Certification Platform */}
      <section id="innovations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-xs font-bold text-[#B45309] shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span>Interactive Campus Tools &amp; Career Acceleration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight">
            Connect Live &amp; <span className="text-[#D97706]">Elevate Your Career</span>
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] font-normal leading-relaxed">
            Collaborate in real-time through seamless virtual meeting rooms, and unlock industry-recognized credentials with online skill assessments.
          </p>
        </div>

        {/* 2 Modern, Visually Distinct Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: Online Meeting */}
          <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#FFFDF7] via-white to-[#F0F7FF] rounded-3xl border border-[#BFDBFE] p-6 sm:p-8 shadow-[0_4px_24px_rgba(37,99,235,0.06)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
            {/* Ambient decorative tint */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 via-sky-50/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Top Row: Pill Badge + Status */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Virtual Collaboration</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-100">
                  VerseMeet Live
                </span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Video className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-xl sm:text-2xl tracking-tight">
                    Online Meeting
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">
                    Fast, secure HD video conferencing for classes and discussions
                  </p>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Connect instantly with faculty, peers, and project teams. Jump directly into virtual classrooms and collaborative meeting spaces with zero configuration or complex downloads.
              </p>

              {/* Feature Highlights Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-blue-100/80 text-xs font-semibold text-[#1E293B]">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>HD Video &amp; Audio</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-blue-100/80 text-xs font-semibold text-[#1E293B]">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Screen Sharing</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-blue-100/80 text-xs font-semibold text-[#1E293B]">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>No Install Needed</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="relative z-10 pt-6 mt-6 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <a
                href={VERSEMEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="frontpage-open-meeting-btn"
                aria-label="Open Meeting on VerseMeet directly"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Video className="w-4 h-4 text-white" />
                <span>Open Meeting</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/90" />
              </a>

              <span className="text-[11px] text-[#64748B] font-mono text-center sm:text-right">
                Opens versemeet-1.onrender.com ↗
              </span>
            </div>
          </div>

          {/* Card 2: Online Certification & Resume Enhancement */}
          <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#FFFDF7] via-white to-[#FEF9EE] rounded-3xl border border-[#FDE68A] p-6 sm:p-8 shadow-[0_4px_24px_rgba(217,119,6,0.06)] hover:shadow-[0_20px_40px_rgba(217,119,6,0.12)] transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
            {/* Ambient decorative tint */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/50 via-yellow-50/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Top Row: Pill Badge + Status */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-xs font-bold text-[#B45309] shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Accreditation &amp; Careers</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#B45309] bg-[#FFF8E6] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                  Verified Certificates
                </span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-xl sm:text-2xl tracking-tight">
                    Online Certification &amp; Resume Enhancement
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">
                    Online tests, downloadable certificates &amp; verified resume credentials
                  </p>
                </div>
              </div>

              {/* Description explaining tests, certificates, resumes */}
              <p className="text-sm text-[#475569] leading-relaxed font-normal">
                Take online skill-based tests, earn verifiable downloadable certificates, and enhance your resume to showcase verified proof of competence to campus placement recruiters and industry leaders.
              </p>

              {/* Feature Highlights Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-amber-100/80 text-xs font-semibold text-[#1E293B]">
                  <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>Online Tests</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-amber-100/80 text-xs font-semibold text-[#1E293B]">
                  <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>PDF Certificates</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-amber-100/80 text-xs font-semibold text-[#1E293B]">
                  <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>Resume Boost</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="relative z-10 pt-6 mt-6 border-t border-[#F1E7CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <a
                href={certDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="frontpage-cert-try-demo-btn"
                aria-label="Try Demo for Online Certification & Resume Enhancement"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/25 hover:shadow-lg hover:shadow-amber-600/35 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Try Demo</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/90" />
              </a>

              <span className="text-[11px] text-[#64748B] font-mono text-center sm:text-right">
                Configurable Live / Demo URL ↗
              </span>
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

    </div>
  );
};

export default LandingPage;
