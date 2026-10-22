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
    { id: 1, title: 'Academic Calendar Schedule Updated', time: '10 mins ago', unread: true },
    { id: 2, title: 'Fee Statement Receipt Verified', time: '2 hours ago', unread: false },
    { id: 3, title: 'Placement Drive Schedule Live', time: 'Yesterday', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#F1E7CF] shadow-subtle px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-[#111827] hover:bg-[#FFF8E6] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            placeholder="Search courses, roll numbers, timetables, records..."
            className="w-full pl-10 pr-12 py-2 rounded-xl border border-[#F1E7CF] bg-[#FFFDF5] text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:border-[#D99A00] focus:ring-2 focus:ring-[#D99A00]/20 transition-all font-medium"
            aria-label="Campus Search"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[11px] font-bold text-[#64748B] uppercase">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* User Identity Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] text-xs">
          <div className="w-7 h-7 rounded-full bg-[#D99A00] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {(user?.name || user?.username || 'U')[0]}
          </div>
          <div className="text-left">
            <span className="font-bold text-[#111827] block text-xs leading-tight">
              {user?.name || user?.username || 'Authenticated User'}
            </span>
            <span className="text-[11px] text-[#D99A00] font-bold capitalize block leading-tight">
              {config.label}
            </span>
          </div>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] text-xs font-bold text-[#111827] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
            aria-expanded={showRoleMenu}
            aria-label="Switch portal view"
          >
            <span className="w-2 h-2 rounded-full bg-[#D99A00]" />
            <span className="hidden md:inline">Portals</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#111827]" />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#F1E7CF] shadow-elevation py-2 z-50 text-xs"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-4 py-2 border-b border-[#F1E7CF] text-[11px] font-bold text-[#111827] uppercase tracking-wider">
                Select Portal View
              </div>
              <Link
                to="/student"
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'student' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                1. Student Dashboard
              </Link>
              <Link
                to="/faculty"
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'faculty' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                2. Faculty Dashboard
              </Link>
              <Link
                to="/admin"
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'admin' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                3. Administrator Dashboard
              </Link>
              <Link
                to="/parent"
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'parent' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                4. Parent / Guardian Portal
              </Link>
              <Link
                to="/placement"
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'placement' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                5. Placement Cell Dashboard
              </Link>
              <Link
                to="/hostel"
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'staff' || role === 'hostel' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                6. Hostel Portal
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl border border-[#F1E7CF] bg-white text-[#111827] hover:bg-[#FFF8E6] focus:outline-none focus:ring-2 focus:ring-[#D99A00] relative"
            aria-expanded={showNotifications}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D99A00] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#F1E7CF] shadow-elevation py-2 z-50 text-xs"
              onClick={() => setShowNotifications(false)}
            >
              <div className="px-4 py-2.5 border-b border-[#F1E7CF] flex items-center justify-between">
                <span className="font-bold text-[#111827] text-sm">Campus Alerts</span>
                <span className="text-xs text-[#D99A00] font-bold hover:underline cursor-pointer">
                  Mark all as read
                </span>
              </div>
              <div className="divide-y divide-[#F1E7CF] max-h-64 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-[#FFF8E6]/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-[#111827] text-xs">{n.title}</p>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-[#D99A00] shrink-0 mt-1" />}
                    </div>
                    <span className="text-[11px] text-[#64748B] font-medium mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2.5 border-t border-[#F1E7CF] text-center bg-[#FFFDF5] rounded-b-2xl">
                <span className="text-[11px] text-[#64748B] font-medium">
                  Real-time CampusVerse AI Alerts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Authentication Sign Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#F1E7CF] text-xs font-bold text-[#111827] hover:bg-[#FFF8E6] transition-colors"
          title="Sign out of CampusVerse"
        >
          <LogOut className="w-4 h-4 text-[#111827]" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
