import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Menu, 
  X, 
  ChevronRight, 
  Layers, 
  Sparkles
} from 'lucide-react';
import Button from '../common/Button';

export const LandingNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-teal-400 shadow-sm group-hover:bg-navy-800 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg sm:text-xl text-navy-950 tracking-tight">
                  CampusVerse<span className="text-teal-600">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 hidden sm:inline-block">
                  Part 1
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight hidden sm:block">
                Intelligent University Management Ecosystem
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#overview" className="hover:text-teal-700 transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-teal-700 transition-colors">
              Campus Services
            </a>
            <a href="#ai-intelligence" className="hover:text-teal-700 transition-colors flex items-center gap-1.5 text-navy-900">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AI Roadmap</span>
            </a>
            <a href="#benefits" className="hover:text-teal-700 transition-colors">
              Stakeholder Value
            </a>
            <a href="#roles" className="hover:text-teal-700 transition-colors">
              7 Unified Roles
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/student">
              <Button variant="secondary" size="sm" leftIcon={<Layers className="w-3.5 h-3.5 text-slate-500" />}>
                Demo Portals
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                Portal Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/login">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-sm font-medium text-slate-700">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 hover:text-teal-700"
            >
              Platform Overview
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 hover:text-teal-700"
            >
              Campus Services
            </a>
            <a
              href="#ai-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI Intelligence Architecture
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 hover:text-teal-700"
            >
              Stakeholder Benefits
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-50 hover:text-teal-700"
            >
              Explore 7 User Roles
            </a>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/student" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full justify-center">
                Explore Demo Portals
              </Button>
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center">
                Portal Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
