import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const UnauthorizedPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        return '/staff';
      case 'superadmin':
      case 'super-admin':
        return '/super-admin';
      case 'student':
      default:
        return '/student';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-rose-200 shadow-elevation text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            You do not have the required role permissions to access this portal or resource.
          </p>
        </div>

        {user && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Logged in as:</span>
              <span className="font-semibold text-slate-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Your Assigned Role:</span>
              <span className="font-bold text-rose-600 uppercase tracking-wide">{user.role}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {user && (
            <Link to={getDashboardPath(user.role)} className="w-full sm:w-auto">
              <Button
                variant="teal"
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
            className="w-full sm:w-auto justify-center text-rose-700 hover:bg-rose-50 border-rose-200"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Switch Account
          </Button>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
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
