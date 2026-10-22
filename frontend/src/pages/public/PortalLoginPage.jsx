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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import AlertBanner from '../../components/common/AlertBanner';

export const PORTAL_METADATA = {
  student: {
    canonicalRole: 'student',
    title: 'Student Portal',
    subtitle: 'Access academic profiles, course rosters, attendance telemetry, and grades',
    badgeVariant: 'teal',
    dashboardPath: '/student',
    demoUser: {
      email: 'student@campusverse.edu',
      password: 'Student@2026',
      label: 'Demo Student Account',
    },
  },
  faculty: {
    canonicalRole: 'faculty',
    title: 'Faculty Portal',
    subtitle: 'Course instruction, attendance rosters, submissions, and marks management',
    badgeVariant: 'teal',
    dashboardPath: '/faculty',
    demoUser: {
      email: 'faculty@campusverse.edu',
      password: 'Faculty@2026',
      label: 'Demo Faculty Account',
    },
  },
  admin: {
    canonicalRole: 'admin',
    title: 'Administrator Console',
    subtitle: 'Academic administration, departments, students, approvals, and compliance',
    badgeVariant: 'navy',
    dashboardPath: '/admin',
    demoUser: {
      email: 'narayanrai',
      password: '321456',
      label: 'Admin Account (narayanrai)',
    },
  },
  parent: {
    canonicalRole: 'parent',
    title: 'Parent / Guardian Portal',
    subtitle: 'Transparent monitoring of student attendance, progress, and fee invoicing',
    badgeVariant: 'teal',
    dashboardPath: '/parent',
    demoUser: {
      email: 'parent@campusverse.edu',
      password: 'Parent@2026',
      label: 'Demo Parent Account',
    },
  },
  placement: {
    canonicalRole: 'placement',
    title: 'Placement Cell',
    subtitle: 'Campus recruitment drives, recruiter relations, and student job eligibility',
    badgeVariant: 'teal',
    dashboardPath: '/placement',
    demoUser: {
      email: 'placement@campusverse.edu',
      password: 'Placement@2026',
      label: 'Demo Placement Officer',
    },
  },
  staff: {
    canonicalRole: 'staff',
    title: 'Hostel Portal',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Operations Staff',
    },
  },
  hostel: {
    canonicalRole: 'staff',
    title: 'Hostel Portal',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Operations Staff',
    },
  },
  'hostel-portal': {
    canonicalRole: 'staff',
    title: 'Hostel Portal',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Operations Staff',
    },
  },
  hostel_portal: {
    canonicalRole: 'staff',
    title: 'Hostel Portal',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics',
    badgeVariant: 'teal',
    dashboardPath: '/hostel',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Hostel & Operations Staff',
    },
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
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleFillDemo = () => {
    if (portal.demoUser) {
      setEmail(portal.demoUser.email);
      setPassword(portal.demoUser.password);
      setErrorMessage('');
      setValidationErrors({});
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Username or email address is required.';
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
      const destination = location.state?.from?.pathname || portal.dashboardPath;
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Authentication failed. Please check your credentials and portal selection.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFEFA] text-[#111827]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3.5">
        <Link to="/" className="inline-flex items-center gap-2.5 p-1 rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#111827] flex items-center justify-center text-[#FFC107] shadow-md mx-auto border border-[#F1E7CF]">
            <GraduationCap className="w-8 h-8 text-[#FFC107]" />
          </div>
        </Link>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={portal.badgeVariant} size="sm">
            {portal.title}
          </Badge>
          <span className="text-xs font-mono font-bold text-[#64748B]">
            role: {portal.canonicalRole}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
          Sign In to {portal.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] max-w-sm mx-auto font-medium">
          {portal.subtitle}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card rounded-2xl border border-[#F1E7CF] space-y-5">
          {/* Quick Demo Credentials Autofill Banner */}
          {portal.demoUser && (
            <div className="p-4 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] text-[#111827] flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-[#111827] flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#D99A00]" />
                  <span>{portal.demoUser.label}</span>
                </div>
                <div className="text-xs text-[#64748B] font-mono font-semibold">
                  {portal.demoUser.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 text-xs font-bold bg-[#D99A00] text-white rounded-lg hover:bg-[#E5A900] transition-colors shadow-sm"
              >
                Autofill
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <AlertBanner
              variant="error"
              title="Authentication Error"
              message={errorMessage}
              dismissible
              onDismiss={() => setErrorMessage('')}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Input
                label="Username or Institutional Email"
                id="portal-email"
                type="text"
                placeholder="e.g. narayanrai or name@campusverse.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: '' }));
                  }
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                error={validationErrors.email}
                required
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  id="portal-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: '' }));
                    }
                  }}
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={validationErrors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-9 text-[#64748B] hover:text-[#111827] p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-2"
              isLoading={submitting}
              disabled={submitting}
              rightIcon={!submitting && <ArrowRight className="w-4 h-4" />}
            >
              {submitting ? 'Verifying Credentials...' : `Sign In to ${portal.title}`}
            </Button>
          </form>

          {/* Navigation helpers */}
          <div className="pt-3.5 border-t border-[#F1E7CF] flex items-center justify-between text-xs">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[#64748B] hover:text-[#D99A00] font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </Link>

            <Link
              to="/"
              className="text-[#64748B] hover:text-[#D99A00] font-bold transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLoginPage;
