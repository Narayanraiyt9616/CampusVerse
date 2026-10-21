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
    badgeVariant: 'info',
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
    badgeVariant: 'success',
    dashboardPath: '/placement',
    demoUser: {
      email: 'placement@campusverse.edu',
      password: 'Placement@2026',
      label: 'Demo Placement Officer',
    },
  },
  staff: {
    canonicalRole: 'staff',
    title: 'Hostel & Transport Staff',
    subtitle: 'Campus hostel block allocation, estate maintenance, and fleet logistics',
    badgeVariant: 'warning',
    dashboardPath: '/staff',
    demoUser: {
      email: 'staff@campusverse.edu',
      password: 'Staff@2026',
      label: 'Demo Operations Staff',
    },
  },
  'super-admin': {
    canonicalRole: 'superadmin',
    title: 'Super Admin Console',
    subtitle: 'Root security governance, audit logs, system diagnostics, and user telemetry',
    badgeVariant: 'danger',
    dashboardPath: '/super-admin',
    demoUser: {
      email: 'superadmin@campusverse.edu',
      password: 'SuperAdmin@2026',
      label: 'Super Admin Account',
    },
  },
  superadmin: {
    canonicalRole: 'superadmin',
    title: 'Super Admin Console',
    subtitle: 'Root security governance, audit logs, system diagnostics, and user telemetry',
    badgeVariant: 'danger',
    dashboardPath: '/super-admin',
    demoUser: {
      email: 'superadmin@campusverse.edu',
      password: 'SuperAdmin@2026',
      label: 'Super Admin Account',
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
      const user = await login(email, password, portal.canonicalRole);
      // Determine redirection destination
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
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5 p-1 rounded-lg">
          <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center text-teal-400 shadow-sm mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
        </Link>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={portal.badgeVariant} size="sm">
            {portal.title}
          </Badge>
          <span className="text-[11px] font-mono text-slate-500">
            role: {portal.canonicalRole}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Sign In to {portal.title}
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {portal.subtitle}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-elevation rounded-2xl border border-slate-200 space-y-5">
          {/* Quick Demo Credentials Autofill Banner */}
          {portal.demoUser && (
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-teal-900 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-teal-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>{portal.demoUser.label}</span>
                </div>
                <div className="text-[11px] text-teal-800 font-mono">
                  {portal.demoUser.email}
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 text-[11px] font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
              >
                Autofill
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <AlertBanner
              variant="danger"
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
                hasError={Boolean(validationErrors.email)}
                errorMessage={validationErrors.email}
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
                  hasError={Boolean(validationErrors.password)}
                  errorMessage={validationErrors.password}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="teal"
              size="md"
              className="w-full justify-center mt-2"
              loading={submitting}
              disabled={submitting}
              rightIcon={!submitting && <ArrowRight className="w-4 h-4" />}
            >
              {submitting ? 'Verifying Credentials...' : `Sign In to ${portal.title}`}
            </Button>
          </form>

          {/* Navigation helpers */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </Link>

            <Link
              to="/"
              className="text-slate-400 hover:text-slate-600 transition-colors"
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
