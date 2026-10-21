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
    <header className="sticky top-0 z-40 w-full bg-[#FFFEFA]/95 backdrop-blur-md border-b border-[#F1E7CF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#FFC107] rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-[#FFC107] shadow-xs group-hover:bg-[#1F2937] transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg sm:text-xl text-[#111827] tracking-tight">
                  CampusVerse<span className="text-[#D99A00]">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] hidden sm:inline-block">
                  Part 1
                </span>
              </div>
              <p className="text-[10px] text-[#64748B] font-medium tracking-tight hidden sm:block">
                Intelligent University Management Ecosystem
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4B5563]">
            <a href="#overview" className="text-[#D99A00] font-semibold hover:text-[#B45309] transition-colors">
              Platform
            </a>
            <a href="#features" className="hover:text-[#D99A00] transition-colors">
              Campus Services
            </a>
            <a href="#ai-intelligence" className="hover:text-[#D99A00] transition-colors flex items-center gap-1.5 text-[#111827]">
              <Sparkles className="w-3.5 h-3.5 text-[#D99A00]" />
              <span>AI Roadmap</span>
            </a>
            <a href="#benefits" className="hover:text-[#D99A00] transition-colors">
              Stakeholder Value
            </a>
            <a href="#roles" className="hover:text-[#D99A00] transition-colors">
              University Portals
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/student">
              <Button variant="secondary" size="sm" className="!bg-[#FFFFFF] hover:!bg-[#FFF8E6] !text-[#111827] !border-[#F1E7CF] shadow-xs font-semibold" leftIcon={<Layers className="w-3.5 h-3.5 text-[#64748B]" />}>
                Demo Portals
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm" className="!bg-[#FFC107] hover:!bg-[#E5A900] !text-[#111827] !border-transparent font-bold shadow-[0_2px_10px_rgba(255,193,7,0.3)] transition-all" rightIcon={<ChevronRight className="w-3.5 h-3.5 text-[#111827]" />}>
                Portal Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/login">
              <Button variant="primary" size="sm" className="!bg-[#FFC107] hover:!bg-[#E5A900] !text-[#111827] !border-transparent font-bold">
                Sign In
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6] focus:outline-none focus:ring-2 focus:ring-[#FFC107]"
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
        <div className="md:hidden border-b border-[#F1E7CF] bg-[#FFFEFA] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-sm font-medium text-[#4B5563]">
            <a
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#FFF8E6] hover:text-[#D99A00]"
            >
              Platform Overview
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#FFF8E6] hover:text-[#D99A00]"
            >
              Campus Services
            </a>
            <a
              href="#ai-intelligence"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#FFF8E6] hover:text-[#D99A00] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#D99A00]" />
              AI Intelligence Architecture
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#FFF8E6] hover:text-[#D99A00]"
            >
              Stakeholder Benefits
            </a>
            <a
              href="#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-[#FFF8E6] hover:text-[#D99A00]"
            >
              Explore University Portals
            </a>
          </nav>
          <div className="pt-3 border-t border-[#F1E7CF] flex flex-col gap-2">
            <Link to="/student" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full justify-center !bg-[#FFFFFF] hover:!bg-[#FFF8E6] !text-[#111827] !border-[#F1E7CF]">
                Explore Demo Portals
              </Button>
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="md" className="w-full justify-center !bg-[#FFC107] hover:!bg-[#E5A900] !text-[#111827] !border-transparent font-bold">
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
