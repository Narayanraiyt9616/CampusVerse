import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const normalizeRole = (r) => {
  if (!r) return '';
  const s = String(r).toLowerCase().trim();
  if (s === 'super-admin' || s === 'super_admin') return 'superadmin';
  if (s === 'placement_officer' || s === 'placement-officer') return 'placement';
  if (s === 'hostel' || s === 'hostel-portal' || s === 'hostel_portal') return 'staff';
  return s;
};

/**
 * Route protection guard ensuring users are authenticated and have authorized roles.
 * Redirects unauthenticated users to the portal login page.
 * Redirects users with mismatched roles to /unauthorized.
 */
export const ProtectedRoute = ({ children, allowedRoles = [], portalLogin = '/login' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Verifying CampusVerse security session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Preserve intended destination in redirect state
    return <Navigate to={portalLogin} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = normalizeRole(user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    // Each section opens strictly with its own authorized credentials
    const isAllowed = normalizedAllowed.includes(userRole);

    if (!isAllowed) {
      return <Navigate to="/unauthorized" state={{ attemptedPath: location.pathname }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
