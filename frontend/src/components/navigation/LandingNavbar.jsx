import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  LayoutGrid,
  Landmark,
  Layers,
  ArrowRight,
  Bell,
  Menu, 
  X 
} from 'lucide-react';

export const LandingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('platform');
  const navContainerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140;
      const rolesEl = document.getElementById('roles');
      const featuresEl = document.getElementById('features');
      const overviewEl = document.getElementById('overview');

      if (rolesEl && scrollPos >= rolesEl.offsetTop) {
        setActiveSection('portals');
      } else if (featuresEl && scrollPos >= featuresEl.offsetTop) {
        setActiveSection('services');
      } else {
        setActiveSection('platform');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile drawer on route/hash changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-50 w-full pt-2 sm:pt-3 pb-2 px-3 sm:px-5 lg:px-8 transition-all">
      <div ref={navContainerRef} className="max-w-[1740px] 2xl:max-w-[1780px] w-full mx-auto bg-[#FFFDF7]/95 backdrop-blur-md rounded-2xl lg:rounded-full border border-[#EFE5C8] shadow-[0_4px_24px_rgba(0,0,0,0.03)] px-3.5 sm:px-6 lg:px-7 py-2 sm:py-2.5 transition-all">
        <div className="flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2.5 group focus:outline-none rounded-xl transition-transform"
              aria-label="CampusVerse AI Homepage"
            >
              {/* Full Official Logo for Desktop & Tablet */}
              <img
                src="/campusverse-logo-transparent.png"
                alt="CampusVerse AI - Intelligent University Management Ecosystem"
                className="hidden sm:block h-10 md:h-11 xl:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.01]"
              />
              {/* Mobile Compact Emblem + Name */}
              <div className="flex sm:hidden items-center gap-2">
                <img
                  src="/campusverse-emblem.png"
                  alt="CampusVerse AI"
                  className="h-9 w-auto object-contain"
                />
                <span className="font-display font-extrabold text-base text-[#0F172A] tracking-tight">
                  CampusVerse<span className="text-[#D97706]">AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Platform */}
            <a
              href="#overview"
              onClick={() => setActiveSection('platform')}
              className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 ${
                activeSection === 'platform'
                  ? 'bg-[#FFFBEB] text-[#B45309] font-bold shadow-2xs border border-[#FDE68A]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#FFFBEB]/70'
              }`}
            >
              <Home className={`w-4 h-4 ${activeSection === 'platform' ? 'text-[#D97706]' : 'text-[#64748B]'}`} />
              <span>Platform</span>
              {activeSection === 'platform' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              )}
            </a>

            {/* Campus Services */}
            <a
              href="#features"
              onClick={() => setActiveSection('services')}
              className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 ${
                activeSection === 'services'
                  ? 'bg-[#FFFBEB] text-[#B45309] font-bold shadow-2xs border border-[#FDE68A]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#FFFBEB]/70'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${activeSection === 'services' ? 'text-[#D97706]' : 'text-[#64748B]'}`} />
              <span>Campus Services</span>
              {activeSection === 'services' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              )}
            </a>

            {/* University Portals */}
            <a
              href="#roles"
              onClick={() => setActiveSection('portals')}
              className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 ${
                activeSection === 'portals'
                  ? 'bg-[#FFFBEB] text-[#B45309] font-bold shadow-2xs border border-[#FDE68A]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#FFFBEB]/70'
              }`}
            >
              <Landmark className={`w-4 h-4 ${activeSection === 'portals' ? 'text-[#D97706]' : 'text-[#64748B]'}`} />
              <span>University Portals</span>
              {activeSection === 'portals' && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#D97706]" />
              )}
            </a>
          </nav>

          {/* Right: Action Buttons & Notification */}
          <div className="hidden sm:flex items-center gap-2.5 xl:gap-3 shrink-0">
            {/* Subtle Vertical Divider */}
            <div className="hidden xl:block h-6 w-px bg-[#E2E8F0]" />

            {/* Demo Portals Button */}
            <Link
              to="/student"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#FAF9F5] text-[#0F172A] text-xs xl:text-sm font-bold border border-[#FDE68A] hover:border-[#F59E0B] shadow-2xs hover:shadow-xs transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Layers className="w-4 h-4 text-[#0F172A]" />
              <span>Demo Portals</span>
            </Link>

            {/* Portal Sign In Button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#0F172A] text-xs xl:text-sm font-extrabold shadow-[0_4px_16px_rgba(250,204,21,0.4)] hover:shadow-[0_6px_22px_rgba(250,204,21,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span>Portal Sign In</span>
              <ArrowRight className="w-4 h-4 text-[#0F172A]" />
            </Link>

            {/* Notification Bell Button */}
            <div className="relative">
              <Link
                to="/login"
                aria-label="Campus Alerts & Notifications"
                title="Campus Alerts & Notifications - Sign in to view alerts"
                className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] flex items-center justify-center text-[#475569] hover:text-[#0F172A] shadow-2xs hover:bg-[#FAF9F5] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] border-2 border-white absolute top-2 right-2" />
              </Link>
            </div>
          </div>

          {/* Mobile / Tablet Actions & Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/login"
              className="sm:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FACC15] text-[#0F172A] text-xs font-extrabold shadow-xs"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#475569] hover:text-[#0F172A] hover:bg-[#FFF8E6] border border-[#EFE5C8] focus:outline-none transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#F1E7CF] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              <a
                href="#overview"
                onClick={() => {
                  setActiveSection('platform');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeSection === 'platform'
                    ? 'bg-[#FFFBEB] text-[#B45309] font-bold border border-[#FDE68A]'
                    : 'text-[#475569] hover:bg-[#FFF8E6]'
                }`}
              >
                <Home className="w-4 h-4 text-[#D97706]" />
                <span>Platform</span>
              </a>
              <a
                href="#features"
                onClick={() => {
                  setActiveSection('services');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeSection === 'services'
                    ? 'bg-[#FFFBEB] text-[#B45309] font-bold border border-[#FDE68A]'
                    : 'text-[#475569] hover:bg-[#FFF8E6]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-[#64748B]" />
                <span>Campus Services</span>
              </a>
              <a
                href="#roles"
                onClick={() => {
                  setActiveSection('portals');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeSection === 'portals'
                    ? 'bg-[#FFFBEB] text-[#B45309] font-bold border border-[#FDE68A]'
                    : 'text-[#475569] hover:bg-[#FFF8E6]'
                }`}
              >
                <Landmark className="w-4 h-4 text-[#64748B]" />
                <span>University Portals</span>
              </a>
            </nav>

            <div className="pt-2 border-t border-[#F1E7CF] flex flex-col sm:hidden gap-2">
              <Link
                to="/student"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-white text-[#0F172A] font-bold text-xs border border-[#FDE68A] shadow-2xs"
              >
                <Layers className="w-4 h-4 text-[#0F172A]" />
                <span>Demo Portals</span>
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#0F172A] font-extrabold text-xs shadow-md"
              >
                <span>Portal Sign In</span>
                <ArrowRight className="w-4 h-4 text-[#0F172A]" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default LandingNavbar;
