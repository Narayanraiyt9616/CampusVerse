import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';

/**
 * Dashboard Layout supporting all 7 user roles with responsive navigation and mobile sidebar drawer
 */
export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Auto-close mobile sidebar whenever route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Determine active role from pathname
  const currentRole = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/faculty')) return 'faculty';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/parent')) return 'parent';
    if (path.startsWith('/placement')) return 'placement';
    if (path.startsWith('/hostel')) return 'hostel';
    if (path.startsWith('/staff')) return 'staff';
    return 'student';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FFFEFA] text-[#4B5563] flex relative">
      {/* Decorative Warm Ivory & Golden Ambient Glow (inspired by reference image) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FACC15]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#D97706]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#F59E0B]/8 rounded-full blur-3xl" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        role={currentRole}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300 relative z-10">
        {/* Top Header */}
        <Topbar
          role={currentRole}
          onMenuToggle={handleToggleSidebar}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
