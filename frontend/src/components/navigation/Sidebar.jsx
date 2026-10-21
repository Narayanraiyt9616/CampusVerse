import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  X
} from 'lucide-react';
import { ROLE_CONFIGS } from './roleConfigs';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({
  role = 'student',
  isOpen = false,
  onClose = null,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.student;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-950 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-navy-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-navy-800/80">
            <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded-lg p-1">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-base text-white tracking-tight">
                  CampusVerse<span className="text-teal-400">AI</span>
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Intelligent ERP
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Indicator */}
          <div className="px-4 py-3 bg-navy-900/60 border-b border-navy-800/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Role View
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-700/60">
                Part 1 Demo
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-semibold text-white text-sm">
                {config.label}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
            {config.menuItems.map((item, idx) => {
              const isSelected = location.pathname === item.to || (location.pathname === config.basePath && idx === 0 && !location.hash);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isSelected ? 'text-teal-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Role Switcher & User preview */}
        <div className="p-3 border-t border-navy-800/80 bg-navy-900/50 space-y-3">
          {/* Active Security Session Info */}
          <div className="p-2.5 rounded-lg bg-navy-900/80 border border-navy-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span>Security Realm</span>
              <span className="text-[10px] text-teal-400 font-mono">RBAC Active</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Isolated Portal: <strong className="text-white">{config.label}</strong>
            </div>
          </div>

          {/* User profile capsule */}
          <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-teal-800/50 border border-teal-600/40 text-teal-200 font-semibold flex items-center justify-center shrink-0 text-xs">
                {(user?.name || config.profileName).charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-white font-medium truncate">{user?.name || config.profileName}</p>
                <p className="text-[10px] text-teal-300 font-mono truncate">{user?.email || config.roleTitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
