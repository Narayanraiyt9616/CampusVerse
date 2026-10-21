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
          className="fixed inset-0 z-40 bg-[#102A43]/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - Deep Blue (#102A43) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#102A43] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#CCFBF1]/20 shadow-elevation ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#CCFBF1]/20 bg-[#102A43]">
            <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#0D9488] rounded-xl p-1">
              <div className="w-9 h-9 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  CampusVerse<span className="text-[#CCFBF1]">AI</span>
                </span>
                <span className="block text-[11px] text-[#CCFBF1] uppercase tracking-wider font-semibold">
                  Intelligent ERP
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#CCFBF1] hover:text-white hover:bg-[#0D9488] focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Indicator */}
          <div className="px-4 py-3 bg-[#102A43] border-b border-[#CCFBF1]/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#CCFBF1] uppercase tracking-wider">
                Active Portal View
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#CCFBF1] text-[#102A43]">
                ERP System
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-bold text-white text-base">
                {config.label}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
            {config.menuItems.map((item, idx) => {
              const isSelected = location.pathname === item.to || (location.pathname === config.basePath && idx === 0 && !location.hash);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#0D9488] text-white shadow-sm font-bold border border-[#0D9488]'
                      : 'text-white/85 hover:text-white hover:bg-[#CCFBF1]/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? 'text-white' : 'text-[#CCFBF1]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#CCFBF1]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Role Switcher & User preview */}
        <div className="p-3 border-t border-[#CCFBF1]/20 bg-[#102A43] space-y-3">
          {/* Active Security Session Info */}
          <div className="p-3 rounded-xl bg-[#102A43] border border-[#CCFBF1]/30 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#CCFBF1] font-bold">
              <span>Security Realm</span>
              <span className="text-[11px] text-[#CCFBF1] font-mono font-bold">RBAC Verified</span>
            </div>
            <div className="text-xs text-white/90 font-medium">
              Portal: <strong className="text-white font-bold">{config.label}</strong>
            </div>
          </div>

          {/* User profile capsule */}
          <div className="pt-2 border-t border-[#CCFBF1]/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#0D9488] text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-sm">
                {(user?.name || config.profileName).charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-white font-bold truncate text-xs">{user?.name || config.profileName}</p>
                <p className="text-[11px] text-[#CCFBF1] font-medium truncate">{user?.email || config.roleTitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-[#0D9488] transition-colors"
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
