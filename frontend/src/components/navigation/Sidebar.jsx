import React, { useEffect } from 'react';
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

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close mobile sidebar whenever route navigation occurs
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [location.pathname, location.search]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#111827]/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - Deep Dark Navy (#0B132B) with Gold Accents */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B132B] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#1E293B] shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding */}
        <div>
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E293B] bg-[#0B132B]">
            <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] rounded-xl p-1 transition-transform hover:scale-[1.02]">
              <div className="w-9 h-9 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-[#FDE68A]/30 shadow-sm">
                <img src="/campusverse-emblem.png" alt="CampusVerse AI Logo" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <span className="font-display font-black text-lg text-white tracking-tight leading-none block">
                  CampusVerse<span className="text-[#FACC15]">AI</span>
                </span>
                <span className="block text-[10px] text-[#FDE68A] uppercase tracking-wider font-bold mt-0.5">
                  University Ecosystem
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Role Indicator matching the Reference Image Pill */}
          <div className="px-4 py-3 bg-[#0B132B]/80 border-b border-[#1E293B]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A] w-full justify-center shadow-xs">
              <span>{config.label}</span>
              <span className="text-[#D97706]/40">|</span>
              <span className="text-[#D97706] font-semibold">
                Role: {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] scrollbar-none">
            {config.menuItems.map((item, idx) => {
              const isSelected = location.pathname === item.to || (location.pathname === config.basePath && idx === 0 && !location.hash);

              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white shadow-md shadow-[#D97706]/20 border border-[#FDE68A]/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? 'text-white' : 'text-[#FACC15]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-xs shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Role Switcher & User preview */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0B132B] space-y-2.5">
          {/* Active Security Session Info */}
          <div className="px-3 py-2 rounded-xl bg-[#111C38] border border-[#1E293B] text-[11px] space-y-0.5">
            <div className="flex items-center justify-between text-[#FDE68A] font-bold">
              <span>Security Realm</span>
              <span className="text-[10px] text-[#FACC15] font-mono font-bold">RBAC Verified</span>
            </div>
            <div className="text-slate-300 font-medium truncate">
              Portal: <strong className="text-white font-bold">{config?.label || 'Portal'}</strong>
            </div>
          </div>

          {/* User profile capsule */}
          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-black flex items-center justify-center shrink-0 text-sm shadow-sm ring-2 ring-[#FDE68A]/30">
                {(user?.name || config?.profileName || 'Admin').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-white font-bold truncate text-xs">{user?.name || config?.profileName || 'Administrator'}</p>
                <p className="text-[10px] text-[#FDE68A] font-medium truncate">{user?.email || config?.roleTitle || 'Campus Administrator'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
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

export default React.memo(Sidebar);
