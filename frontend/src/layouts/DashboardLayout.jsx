import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';

/**
 * Dashboard Layout supporting all 7 user roles with responsive navigation and mobile sidebar drawer
 */
export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine active role from pathname
  const getRoleFromPath = (path) => {
    if (path.startsWith('/faculty')) return 'faculty';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/parent')) return 'parent';
    if (path.startsWith('/placement')) return 'placement';
    if (path.startsWith('/staff')) return 'staff';
    if (path.startsWith('/super-admin')) return 'super-admin';
    return 'student';
  };

  const currentRole = getRoleFromPath(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        role={currentRole}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Header */}
        <Topbar
          role={currentRole}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
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
