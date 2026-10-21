import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { ROLE_CONFIGS } from './roleConfigs';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({
  role = 'student',
  onMenuToggle,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.student;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const mockNotifications = [
    { id: 1, title: 'Academic Calendar Updated', time: '10 mins ago', unread: true },
    { id: 2, title: 'Fee Receipt #782910 Generated', time: '2 hours ago', unread: false },
    { id: 3, title: 'Placement Drive Schedule Live', time: 'Yesterday', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-subtle px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            placeholder="Search courses, roll numbers, timetables, records..."
            className="w-full pl-9 pr-12 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
            aria-label="Campus Search"
          />
          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[10px] font-semibold text-slate-400 uppercase">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* User Identity Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[11px] uppercase">
            {(user?.name || user?.username || 'U')[0]}
          </div>
          <div className="text-left">
            <span className="font-semibold text-slate-900 block text-xs leading-tight">
              {user?.name || user?.username || 'Authenticated User'}
            </span>
            <span className="text-[10px] text-teal-700 font-medium capitalize block leading-tight">
              {config.label}
            </span>
          </div>
        </div>

        {/* Role Switcher Dropdown for Architecture Review */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-expanded={showRoleMenu}
            aria-label="Switch demonstration role view"
          >
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="hidden md:inline text-slate-500">Portals:</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-elevation py-2 z-50 text-xs"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Role View (Part 1 Demo)
              </div>
              <Link
                to="/student"
                className={`block px-3.5 py-2 hover:bg-slate-50 ${role === 'student' ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'}`}
              >
                1. Student Dashboard
              </Link>
              <Link
                to="/faculty"
                className={`block px-3.5 py-2 hover:bg-slate-50 ${role === 'faculty' ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'}`}
              >
                2. Faculty Dashboard
              </Link>
              <Link
                to="/admin"
                className={`block px-3.5 py-2 hover:bg-slate-50 ${role === 'admin' ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'}`}
              >
                3. Administrator Dashboard
              </Link>
              <Link
                to="/parent"
                className={`block px-3.5 py-2 hover:bg-slate-50 ${role === 'parent' ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'}`}
              >
                4. Parent / Guardian Portal
              </Link>
              <Link
                to="/placement"
                className={`block px-3.5 py-2 hover:bg-slate-50 ${role === 'placement' ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'}`}
              >
                5. Placement Cell Dashboard
              </Link>
              <Link
                to="/staff"
                className={`block px-3.5 py-2 hover:bg-slate-50 ${role === 'staff' ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'}`}
              >
                6. Hostel & Transport Staff
              </Link>
              <Link
                to="/super-admin"
                className={`block px-3.5 py-2 hover:bg-slate-50 ${role === 'super-admin' ? 'text-rose-700 font-semibold bg-rose-50/50' : 'text-slate-700'}`}
              >
                7. Super Admin Console
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 relative"
            aria-expanded={showNotifications}
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-elevation py-2 z-50 text-xs"
              onClick={() => setShowNotifications(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Campus Alerts</span>
                <span className="text-[11px] text-teal-700 hover:underline cursor-pointer">
                  Mark all as read
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800">{n.title}</p>
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1" />}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50/60 rounded-b-xl">
                <span className="text-[11px] text-slate-500">
                  Real-time WebSockets integration planned for later phases
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Real Authentication Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-colors"
          title="Sign out of CampusVerse"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
