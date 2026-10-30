import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Route Guard
import ProtectedRoute from '../components/common/ProtectedRoute';

// Route-level code-splitting (lazy loaded on demand for minimal initial bundle)
const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const LoginPage = lazy(() => import('../pages/public/LoginPage'));
const PortalLoginPage = lazy(() => import('../pages/public/PortalLoginPage'));
const UnauthorizedPage = lazy(() => import('../pages/public/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));
const AboutPage = lazy(() => import('../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('../pages/public/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('../pages/public/TermsPage'));
const HelpSupportPage = lazy(() => import('../pages/public/HelpSupportPage'));

// Role Dashboard Pages (lazy loaded per role)
const StudentDashboard = lazy(() => import('../pages/dashboards/StudentDashboard'));
const FacultyDashboard = lazy(() => import('../pages/dashboards/FacultyDashboard'));
const AdminDashboard = lazy(() => import('../pages/dashboards/AdminDashboard'));
const ParentDashboard = lazy(() => import('../pages/dashboards/ParentDashboard'));
const PlacementDashboard = lazy(() => import('../pages/dashboards/PlacementDashboard'));
const StaffDashboard = lazy(() => import('../pages/dashboards/StaffDashboard'));

// Clean loading placeholder matching CampusVerse aesthetic
const RouteLoadingFallback = () => (
  <div className="min-h-[45vh] flex flex-col items-center justify-center p-6 space-y-3">
    <div className="w-8 h-8 border-2 border-[#D99A00] border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold text-[#6B7280] tracking-wide">Loading...</span>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:portalId" element={<PortalLoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/support" element={<HelpSupportPage />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/faq" element={<HelpSupportPage />} />
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
    </Suspense>
  );
};

export default AppRoutes;
