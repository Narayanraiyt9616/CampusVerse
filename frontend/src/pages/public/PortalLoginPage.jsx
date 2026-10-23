import React, { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Check,
  FileText,
  BookOpen,
  Calendar,
  FileCheck2,
  Award,
  UserCheck,
  FileEdit,
  Users,
  Building2,
  LineChart,
  CalendarCheck,
  BellRing,
  Briefcase,
  Building,
  TrendingUp,
  Home,
  KeyRound,
  Bus,
  ClipboardCheck,
  Sparkles,
  Copy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import AlertBanner from '../../components/common/AlertBanner';

export const PORTAL_METADATA = {
  student: {
    canonicalRole: 'student',
    title: 'Student Portal',
    roleLabel: 'Student',
    subtitle: 'Access your academic profile, course rosters, attendance, telemetry, and grades — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/student',
    leftIllustration: '/assets/illustrations/student_building.jpg',
    rightIllustration: '/assets/illustrations/student_books.jpg',
    demoUser: {
      email: 'student@campusverse.edu',
      password: 'Student@2026',
      label: 'Demo Student Account',
    },
    badges: [
      {
        title: 'View Courses',
        desc: 'Access academic resources.',
        icon: BookOpen,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Check Timetable',
        desc: 'Stay updated with class schedules.',
        icon: Calendar,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Submit Assignments',
        desc: 'Upload and track your work.',
        icon: FileCheck2,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'View Grades',
        desc: 'Monitor academic progress.',
        icon: Award,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  faculty: {
    canonicalRole: 'faculty',
    title: 'Faculty Portal',
    roleLabel: 'Faculty',
    subtitle: 'Course instruction, attendance rosters, submissions, and marks management — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/faculty',
    leftIllustration: '/assets/illustrations/faculty_building.jpg',
    rightIllustration: '/assets/illustrations/faculty_books.jpg',
    demoUser: {
      email: 'faculty@campusverse.edu',
      password: 'Faculty@2026',
      label: 'Demo Faculty Account',
    },
    badges: [
      {
        title: 'Manage Courses',
        desc: 'Organize subjects and course materials.',
        icon: BookOpen,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Track Attendance',
        desc: 'Manage student attendance.',
        icon: UserCheck,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Create Assignments',
        desc: 'Prepare and distribute assessments.',
        icon: FileEdit,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Evaluate Students',
        desc: 'Review submissions and grades.',
        icon: Award,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  admin: {
    canonicalRole: 'admin',
    title: 'Administrator Console',
    roleLabel: 'Administrator',
    subtitle: 'Academic administration, departments, students, approvals, and compliance — all in one place.',
    badgeVariant: 'navy',
    dashboardPath: '/admin',
    leftIllustration: '/assets/illustrations/admin_building.jpg',
    rightIllustration: '/assets/illustrations/admin_books.jpg',
    demoUser: {
      email: 'narayanrai',
      password: '321456',
      label: 'Admin Account (narayanrai)',
    },
    badges: [
      {
        title: 'Manage Students',
        desc: 'Access student administration.',
        icon: Users,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Manage Faculty',
        desc: 'Organize faculty records.',
        icon: UserCheck,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Academic Operations',
        desc: 'Manage academic activities.',
        icon: Building2,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Reports & Analytics',
        desc: 'Review institutional information.',
        icon: LineChart,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  superadmin: {
    canonicalRole: 'admin',
    title: 'Administrator Console',
    roleLabel: 'Super Admin',
    subtitle: 'Institutional governance, security controls, system telemetry, and audit operations.',
    badgeVariant: 'navy',
    dashboardPath: '/admin',
    leftIllustration: '/assets/illustrations/admin_building.jpg',
    rightIllustration: '/assets/illustrations/admin_books.jpg',
    demoUser: {
      email: 'narayanrai',
      password: '321456',
      label: 'Admin Account (narayanrai)',
    },
    badges: [
      {
        title: 'Manage Students',
        desc: 'Access student administration.',
        icon: Users,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Manage Faculty',
        desc: 'Organize faculty records.',
        icon: UserCheck,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Academic Operations',
        desc: 'Manage academic activities.',
        icon: Building2,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Reports & Analytics',
        desc: 'Review institutional information.',
        icon: LineChart,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  parent: {
    canonicalRole: 'parent',
    title: 'Parent Portal',
    roleLabel: 'Parent / Guardian',
    subtitle: 'Transparent monitoring of student attendance, progress, and fee invoicing — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/parent',
    leftIllustration: '/assets/illustrations/parent_building.jpg',
    rightIllustration: '/assets/illustrations/parent_books.jpg',
    demoUser: {
      email: 'parent@campusverse.edu',
      password: 'Parent@2026',
      label: 'Demo Parent Account',
    },
    badges: [
      {
        title: 'Academic Progress',
        desc: "Follow your child's progress.",
        icon: GraduationCap,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Attendance',
        desc: 'Review attendance records.',
        icon: CalendarCheck,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Results & Grades',
        desc: 'View academic performance.',
        icon: Award,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Important Updates',
        desc: 'Stay informed about notices.',
        icon: BellRing,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  placement: {
    canonicalRole: 'placement',
    title: 'Placement Cell',
    roleLabel: 'Placement Officer',
    subtitle: 'Campus recruitment drives, recruiter relations, and student job eligibility — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/placement',
    leftIllustration: '/assets/illustrations/placement_building.jpg',
    rightIllustration: '/assets/illustrations/placement_books.jpg',
    demoUser: {
      email: 'placement@campusverse.edu',
      password: 'Placement@2026',
      label: 'Demo Placement Officer',
    },
    badges: [
      {
        title: 'Job Opportunities',
        desc: 'Explore available opportunities.',
        icon: Briefcase,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Company Drives',
        desc: 'View recruitment activities.',
        icon: Building,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Student Applications',
        desc: 'Track applications.',
        icon: FileText,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Placement Progress',
        desc: 'Monitor placement status.',
        icon: TrendingUp,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  staff: {
    canonicalRole: 'staff',
    title: 'Hostel & Transport',
    roleLabel: 'Hostel & Transport Staff',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    leftIllustration: '/assets/illustrations/hostel_building.jpg',
    rightIllustration: '/assets/illustrations/hostel_books.jpg',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Transport Staff',
    },
    badges: [
      {
        title: 'Hostel Management',
        desc: 'View accommodation information.',
        icon: Home,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Room Allocation',
        desc: 'Access room assignment details.',
        icon: KeyRound,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Transport Routes',
        desc: 'View available transport information.',
        icon: Bus,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Requests & Updates',
        desc: 'Track relevant requests.',
        icon: ClipboardCheck,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  hostel: {
    canonicalRole: 'staff',
    title: 'Hostel & Transport',
    roleLabel: 'Hostel & Transport Staff',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    leftIllustration: '/assets/illustrations/hostel_building.jpg',
    rightIllustration: '/assets/illustrations/hostel_books.jpg',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Transport Staff',
    },
    badges: [
      {
        title: 'Hostel Management',
        desc: 'View accommodation information.',
        icon: Home,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Room Allocation',
        desc: 'Access room assignment details.',
        icon: KeyRound,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Transport Routes',
        desc: 'View available transport information.',
        icon: Bus,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Requests & Updates',
        desc: 'Track relevant requests.',
        icon: ClipboardCheck,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  'hostel-portal': {
    canonicalRole: 'staff',
    title: 'Hostel & Transport',
    roleLabel: 'Hostel & Transport Staff',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    leftIllustration: '/assets/illustrations/hostel_building.jpg',
    rightIllustration: '/assets/illustrations/hostel_books.jpg',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Transport Staff',
    },
    badges: [
      {
        title: 'Hostel Management',
        desc: 'View accommodation information.',
        icon: Home,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Room Allocation',
        desc: 'Access room assignment details.',
        icon: KeyRound,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Transport Routes',
        desc: 'View available transport information.',
        icon: Bus,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Requests & Updates',
        desc: 'Track relevant requests.',
        icon: ClipboardCheck,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
  hostel_portal: {
    canonicalRole: 'staff',
    title: 'Hostel & Transport',
    roleLabel: 'Hostel & Transport Staff',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics — all in one place.',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    leftIllustration: '/assets/illustrations/hostel_building.jpg',
    rightIllustration: '/assets/illustrations/hostel_books.jpg',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Transport Staff',
    },
    badges: [
      {
        title: 'Hostel Management',
        desc: 'View accommodation information.',
        icon: Home,
        bg: 'bg-amber-100 text-amber-700 border border-amber-200',
      },
      {
        title: 'Room Allocation',
        desc: 'Access room assignment details.',
        icon: KeyRound,
        bg: 'bg-sky-100 text-sky-700 border border-sky-200',
      },
      {
        title: 'Transport Routes',
        desc: 'View available transport information.',
        icon: Bus,
        bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      },
      {
        title: 'Requests & Updates',
        desc: 'Track relevant requests.',
        icon: ClipboardCheck,
        bg: 'bg-purple-100 text-purple-700 border border-purple-200',
      },
    ],
  },
};

export const PortalLoginPage = () => {
  const { portalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const portalKey = (portalId || 'student').toLowerCase();
  const portal = PORTAL_METADATA[portalKey] || PORTAL_METADATA.student;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [copiedAutofill, setCopiedAutofill] = useState(false);

  const handleFillDemo = () => {
    if (portal.demoUser) {
      setEmail(portal.demoUser.email);
      setPassword(portal.demoUser.password);
      setErrorMessage('');
      setValidationErrors({});
      setCopiedAutofill(true);
      setTimeout(() => setCopiedAutofill(false), 2000);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Username or institutional email is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await login(email, password, portal.canonicalRole);
      let destination = portal.dashboardPath;
      const fromPath =
        location.state?.from?.pathname ||
        (typeof location.state?.from === 'string' ? location.state.from : '');
      if (fromPath && fromPath.startsWith(portal.dashboardPath)) {
        destination = fromPath;
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Authentication failed. Please verify your credentials and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#FFFEFA] text-[#0B132B]">
      {/* ─── BACKGROUND DECORATIVE ELEMENTS ───────────────────────────────────── */}
      
      {/* Subtle Warm Gradient Overlay */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none z-0" style={{
        background: 'radial-gradient(circle at 50% 25%, #FFFDF8 0%, #FFF9EB 60%, #FFF3DB 100%)'
      }} />

      {/* Decorative Golden Leaves & Swirl in Top Right */}
      <div className="absolute top-0 right-0 pointer-events-none select-none z-0 w-72 sm:w-96 md:w-[480px] opacity-70">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Subtle curved dotted line */}
          <path
            d="M50 0 C 180 80, 280 180, 380 320"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeOpacity="0.4"
          />
          {/* Golden Sparkles */}
          <path d="M280 60 Q285 75 300 80 Q285 85 280 100 Q275 85 260 80 Q275 75 280 60Z" fill="#F59E0B" fillOpacity="0.75" />
          <path d="M330 140 Q333 150 345 153 Q333 156 330 166 Q327 156 315 153 Q327 150 330 140Z" fill="#FBBF24" fillOpacity="0.6" />
          <path d="M160 30 Q163 40 175 43 Q163 46 160 56 Q157 46 145 43 Q157 40 160 30Z" fill="#F59E0B" fillOpacity="0.6" />
          {/* Stylized Golden Leaves Branch */}
          <path
            d="M390 10 C340 50, 310 130, 320 220"
            stroke="#D97706"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity="0.35"
          />
          <path
            d="M340 70 C 310 55, 290 80, 320 95 C 350 110, 360 85, 340 70 Z"
            fill="url(#leafGoldGrad)"
            fillOpacity="0.65"
          />
          <path
            d="M320 120 C 285 110, 275 140, 305 150 C 335 160, 340 130, 320 120 Z"
            fill="url(#leafGoldGrad)"
            fillOpacity="0.7"
          />
          <path
            d="M335 180 C 295 180, 290 215, 325 220 C 360 225, 365 190, 335 180 Z"
            fill="url(#leafGoldGrad)"
            fillOpacity="0.6"
          />
          <defs>
            <linearGradient id="leafGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Elegant Golden Flowing Curves at Canvas Bottom-Center */}
      <div className="absolute bottom-12 left-0 right-0 pointer-events-none select-none z-0 overflow-hidden h-72 hidden md:block">
        <svg viewBox="0 0 1440 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full preserve-3d">
          <path
            d="M-50 200 C 200 130, 450 240, 720 180 C 1000 120, 1250 220, 1500 140 L 1500 300 L -50 300 Z"
            fill="url(#goldWaveGrad)"
            fillOpacity="0.18"
          />
          <path
            d="M-50 220 C 300 170, 550 260, 800 210 C 1100 150, 1300 240, 1500 180 L 1500 300 L -50 300 Z"
            fill="url(#goldWaveGrad2)"
            fillOpacity="0.32"
          />
          {/* Dynamic flowing ribbon highlight */}
          <path
            d="M0 215 Q 350 160 700 210 T 1440 175"
            stroke="url(#ribbonStroke)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <defs>
            <linearGradient id="goldWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="goldWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="ribbonStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.2" />
              <stop offset="30%" stopColor="#FBBF24" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ─── LEFT PORTAL ILLUSTRATION (Campus Building) ───────────────────────── */}
      <div className="hidden lg:block absolute left-0 bottom-24 xl:bottom-16 w-[280px] xl:w-[360px] 2xl:w-[440px] pointer-events-none select-none z-0">
        <div className="relative">
          <img
            src={portal.leftIllustration}
            alt={`${portal.title} Building`}
            className="w-full h-auto object-contain object-left-bottom mix-blend-multiply opacity-90 transition-opacity duration-700"
            style={{
              maskImage: 'linear-gradient(to right, black 65%, transparent 100%), linear-gradient(to top, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 65%, transparent 100%), linear-gradient(to top, black 85%, transparent 100%)',
              WebkitMaskComposite: 'destination-in',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </div>

      {/* ─── RIGHT PORTAL ILLUSTRATION (Graduation Cap & Books) ─────────────────── */}
      <div className="hidden lg:block absolute right-0 bottom-24 xl:bottom-16 w-[280px] xl:w-[360px] 2xl:w-[430px] pointer-events-none select-none z-0">
        <div className="relative">
          <img
            src={portal.rightIllustration}
            alt={`${portal.title} Academic Emblems`}
            className="w-full h-auto object-contain object-right-bottom mix-blend-multiply opacity-95 transition-opacity duration-700"
            style={{
              maskImage: 'linear-gradient(to left, black 65%, transparent 100%), linear-gradient(to top, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, black 65%, transparent 100%), linear-gradient(to top, black 85%, transparent 100%)',
              WebkitMaskComposite: 'destination-in',
              maskComposite: 'intersect',
            }}
          />
        </div>
      </div>

      {/* ─── MAIN CONTENT CONTAINER ───────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 flex-1 flex flex-col justify-between">
        
        {/* Top Branding & Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          {/* Logo with Emblem & Title */}
          <Link
            to="/"
            className="inline-flex flex-col items-center group transition-transform duration-200 hover:scale-102"
            aria-label="CampusVerseAI Home"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center p-1 drop-shadow-sm mb-1">
              <img
                src="/campusverse-emblem.png"
                alt="CampusVerse AI Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-0.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0B132B]">CampusVerse</span>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#D97706]">AI</span>
            </div>
            <span className="text-[11px] sm:text-xs text-[#6B7280] font-medium tracking-wide">
              Intelligent University Management Ecosystem
            </span>
          </Link>

          {/* Portal & Role Badge */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FFF3D6] border border-[#FDE68A] text-xs font-bold text-[#92400E] shadow-xs">
              <GraduationCap className="w-4 h-4 text-[#D97706]" />
              <span>{portal.title}</span>
              <span className="text-[#D97706]/40">|</span>
              <span className="text-[#B45309]">Role: {portal.roleLabel}</span>
            </div>
          </div>

          {/* Sign In Heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0B132B] tracking-tight">
            Sign In to <span className="text-[#D97706]">{portal.title}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-[#4B5563] font-medium leading-relaxed max-w-md mx-auto">
            {portal.subtitle}
          </p>

          {/* Decorative Gold Bead Line */}
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto pt-1">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D99A00]/50" />
            <div className="w-2 h-2 rounded-full bg-[#D97706] ring-2 ring-[#FDE68A]" />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D99A00]/50" />
          </div>
        </div>

        {/* ─── CENTER LOGIN CARD ─────────────────────────────────────────────── */}
        <div className="w-full max-w-lg mx-auto mt-6">
          <div className="bg-white rounded-3xl border border-[#F1E7CF] shadow-[0_20px_60px_rgba(217,119,6,0.12)] p-6 sm:p-8 space-y-5 transition-all">
            
            {/* Demo Credentials Box with Autofill Button */}
            {portal.demoUser && (
              <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#FDE68A] flex items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF3D6] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                    <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0B132B]">{portal.demoUser.label}</h4>
                    <div className="text-[11px] text-[#6B7280] font-mono mt-0.5 space-x-1">
                      <span>ID: <strong className="text-[#0B132B] font-semibold">{portal.demoUser.email}</strong></span>
                      {portal.demoUser.password && (
                        <span>&bull; Password: <strong className="text-[#0B132B] font-semibold">{portal.demoUser.password}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-3.5 py-1.5 rounded-xl border border-[#D97706] text-[#D97706] bg-white font-extrabold text-xs hover:bg-[#FFF8E6] active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  {copiedAutofill ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Filled</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Autofill</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message Alert */}
            {errorMessage && (
              <AlertBanner
                variant="error"
                title="Authentication Error"
                message={errorMessage}
                dismissible
                onDismiss={() => setErrorMessage('')}
              />
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Username / Institutional Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="portal-email"
                  className="block text-xs font-extrabold text-[#0B132B] tracking-tight"
                >
                  Username or Institutional Email <span className="text-[#D97706]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Mail className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <input
                    type="text"
                    id="portal-email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="e.g. narayanrai or name@campusverse.edu"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-white border ${
                      validationErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[#F1E7CF]'
                    } focus:outline-none focus:border-[#D99A00] focus:ring-2 focus:ring-[#D99A00]/20 text-[#0B132B] transition-all`}
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-[11px] text-red-600 font-semibold">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="portal-password"
                  className="block text-xs font-extrabold text-[#0B132B] tracking-tight"
                >
                  Password <span className="text-[#D97706]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
                    <Lock className="w-4 h-4 text-[#D97706]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="portal-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder="Enter your account password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm bg-white border ${
                      validationErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-[#F1E7CF]'
                    } focus:outline-none focus:border-[#D99A00] focus:ring-2 focus:ring-[#D99A00]/20 text-[#0B132B] transition-all`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#0B132B] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-[11px] text-red-600 font-semibold">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#F1E7CF] text-[#D97706] focus:ring-[#D97706] accent-[#D97706]"
                  />
                  <span className="font-bold text-[#4B5563]">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert(`Password assistance: For credentials or reset requests, please contact the campus ICT helpdesk at support@campusverse.edu or visit the Administrator console.`)}
                  className="font-extrabold text-[#D97706] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Prominent Golden Sign In Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wide shadow-[0_10px_25px_rgba(217,119,6,0.35)] flex items-center justify-center gap-2 transition-all disabled:opacity-75 disabled:pointer-events-none"
              >
                {submitting ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to {portal.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Card Navigation Links */}
            <div className="pt-2">
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-[#F1E7CF] w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider absolute">
                  OR
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[#64748B] hover:text-[#D97706] font-bold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Portal Selection</span>
                </Link>

                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#D97706] font-bold transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM 4 FEATURE BADGES (Matching Reference Image) ─────────────── */}
        <div className="w-full max-w-4xl mx-auto mt-10 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 bg-white/80 md:bg-transparent backdrop-blur-xs md:backdrop-blur-none rounded-3xl p-5 md:p-0 border border-[#F1E7CF]/70 md:border-none shadow-xs md:shadow-none">
            {portal.badges.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center text-center px-3 sm:px-4 ${
                    idx !== 0 ? 'md:border-l md:border-[#F1E7CF]' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${b.bg} shadow-xs transition-transform hover:scale-105 duration-200`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#0B132B] mb-0.5 tracking-tight">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] font-medium leading-relaxed max-w-[190px]">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PortalLoginPage;
