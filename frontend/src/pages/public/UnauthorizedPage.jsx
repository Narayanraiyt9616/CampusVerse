import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const resolvePortalLoginPath = (candidate) => {
  if (!candidate) return '';
  const str = String(candidate).trim().toLowerCase();
  if (str.startsWith('/login/')) {
    const segment = str.split('?')[0].split('#')[0];
    if (segment === '/login/staff' || segment === '/login/hostel') return '/login/hostel';
    return segment;
  }
  if (str.includes('/faculty') || str === 'faculty') return '/login/faculty';
  if (str.includes('/admin') || str === 'admin' || str === 'superadmin') return '/login/admin';
  if (str.includes('/parent') || str === 'parent') return '/login/parent';
  if (str.includes('/placement') || str === 'placement') return '/login/placement';
  if (str.includes('/hostel') || str.includes('/staff') || str === 'hostel' || str === 'staff') return '/login/hostel';
  if (str.includes('/student') || str === 'student') return '/login/student';
  return '';
};

export const UnauthorizedPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'faculty':
        return '/faculty';
      case 'admin':
        return '/admin';
      case 'parent':
        return '/parent';
      case 'placement':
        return '/placement';
      case 'staff':
      case 'hostel':
        return '/hostel';
      case 'student':
      default:
        return '/student';
    }
  };

  const getTargetLoginPath = () => {
    // 1. Check navigation state from ProtectedRoute or Topbar
    const fromState =
      resolvePortalLoginPath(location.state?.portalLogin) ||
      resolvePortalLoginPath(location.state?.targetPortal) ||
      resolvePortalLoginPath(location.state?.attemptedPath);
    if (fromState) return fromState;

    // 2. Check sessionStorage
    try {
      const stored = sessionStorage.getItem('campusverse_selected_portal');
      const fromStored = resolvePortalLoginPath(stored);
      if (fromStored) return fromStored;
    } catch (e) {}

    // Fallback: Default directly to student portal login instead of directory
    return '/login/student';
  };

  const handleLogout = async () => {
    const targetLogin = getTargetLoginPath();
    await logout();
    try {
      sessionStorage.removeItem('campusverse_selected_portal');
    } catch (e) {}
    navigate(targetLogin);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FFFEFA] text-[#111827]">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-[#F1E7CF] shadow-card text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF8E6] border border-[#F1E7CF] text-[#D99A00] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-[#4B5563] leading-relaxed font-medium">
            You do not have the required role permissions to access this portal or resource.
          </p>
        </div>

        {user && (
          <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-left text-xs space-y-2 font-medium">
            <div className="flex justify-between">
              <span className="text-[#64748B] font-bold">Logged in as:</span>
              <span className="font-bold text-[#111827]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] font-bold">Your Assigned Role:</span>
              <span className="font-bold text-[#D99A00] uppercase tracking-wide">{user.role}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {user && (
            <Link to={getDashboardPath(user.role)} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                Go to My Dashboard
              </Button>
            </Link>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            className="w-full sm:w-auto justify-center"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Switch Account
          </Button>
        </div>

        <div className="pt-2 border-t border-[#F1E7CF]">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#D99A00] font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
