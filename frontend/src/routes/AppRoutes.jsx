import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import PortalLoginPage from '../pages/public/PortalLoginPage';
import UnauthorizedPage from '../pages/public/UnauthorizedPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Route Guard
import ProtectedRoute from '../components/common/ProtectedRoute';

// Dashboard Pages
import StudentDashboard from '../pages/dashboards/StudentDashboard';
import FacultyDashboard from '../pages/dashboards/FacultyDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import ParentDashboard from '../pages/dashboards/ParentDashboard';
import PlacementDashboard from '../pages/dashboards/PlacementDashboard';
import StaffDashboard from '../pages/dashboards/StaffDashboard';
import { StudentManagementList } from '../pages/dashboards/StudentManagementList';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/:portalId" element={<PortalLoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Role Dashboards Protected by RBAC & JWT Session Verification */}
      <Route element={<DashboardLayout />}>
        {/* Student Portal (opens only with student credentials) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']} portalLogin="/login/student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/:section"
          element={
            <ProtectedRoute allowedRoles={['student']} portalLogin="/login/student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Faculty Portal (opens only with faculty credentials) */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRoles={['faculty']} portalLogin="/login/faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/:section"
          element={
            <ProtectedRoute allowedRoles={['faculty']} portalLogin="/login/faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Administrator Console (opens only with admin or superadmin credentials) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} portalLogin="/login/admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/:section"
          element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']} portalLogin="/login/admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Parent / Guardian Portal (opens only with parent credentials) */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']} portalLogin="/login/parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/:section"
          element={
            <ProtectedRoute allowedRoles={['parent']} portalLogin="/login/parent">
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Placement Cell (opens only with placement credentials) */}
        <Route
          path="/placement"
          element={
            <ProtectedRoute allowedRoles={['placement']} portalLogin="/login/placement">
              <PlacementDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/placement/:section"
          element={
            <ProtectedRoute allowedRoles={['placement']} portalLogin="/login/placement">
              <PlacementDashboard />
            </ProtectedRoute>
          }
        />

        {/* Hostel Portal (opens only with authorized hostel/staff credentials) */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'hostel']} portalLogin="/login/hostel">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/:section"
          element={
            <ProtectedRoute allowedRoles={['staff', 'hostel']} portalLogin="/login/hostel">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel"
          element={
            <ProtectedRoute allowedRoles={['staff', 'hostel']} portalLogin="/login/hostel">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hostel/:section"
          element={
            <ProtectedRoute allowedRoles={['staff', 'hostel']} portalLogin="/login/hostel">
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all 404 Route */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
