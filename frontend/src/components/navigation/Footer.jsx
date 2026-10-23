import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Building2,
  Shield,
  GraduationCap
} from 'lucide-react';
import { newsletterService } from '../../services/api';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setStatus({ loading: false, success: false, message: 'Please enter your email address.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatus({ loading: false, success: false, message: 'Please enter a valid university or personal email format.' });
      return;
    }

    setStatus({ loading: true, success: false, message: '' });
    try {
      const res = await newsletterService.subscribe(email.trim());
      if (res && res.success) {
        setStatus({ loading: false, success: true, message: res.message });
        setEmail('');
      } else {
        setStatus({ loading: false, success: false, message: res?.message || 'Subscription could not be processed.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to connect to subscription service. Please try again.';
      setStatus({ loading: false, success: false, message: msg });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B132B] text-slate-300 text-sm border-t border-[#1E293B] relative z-20">
      {/* Top subtle golden accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#D97706] via-[#FACC15] to-[#D97706] opacity-80" />

      <div className="max-w-[1740px] 2xl:max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-14 pb-10">
        {/* 5 Organized Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 xl:gap-12">
          
          {/* Column 1: Brand Information (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none" aria-label="CampusVerseAI Home">
              <img
                src="/campusverse-emblem.png"
                alt="CampusVerseAI Emblem"
                className="w-10 h-10 object-contain drop-shadow-[0_2px_10px_rgba(250,204,21,0.25)] transition-transform group-hover:scale-105"
              />
              <div>
                <span className="font-display font-black text-xl text-white tracking-tight">
                  CampusVerse<span className="text-[#FACC15]">AI</span>
                </span>
                <p className="text-[10.5px] text-[#94A3B8] font-medium leading-tight">
                  Intelligent University Management Ecosystem
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              CampusVerseAI connects students, faculty, parents, administrators, placement teams, and hostel management in a unified, role-governed digital campus operating platform.
            </p>

            {/* Configured Social Media / Repository Profile Links */}
            <div className="pt-1 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Official Repository & Verified Code
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://github.com/Narayanraiyt9616/CampusVerse"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="CampusVerse GitHub Repository"
                  className="w-9 h-9 rounded-xl bg-[#16223F] hover:bg-[#1E2E56] border border-[#23355E] hover:border-[#FACC15] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <span className="text-xs text-slate-400">Open source capstone architecture</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
              <span>Quick Links</span>
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link to="/" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Home
                </Link>
              </li>
              <li>
                <a href="/#overview" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Platform
                </a>
              </li>
              <li>
                <a href="/#features" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Campus Services
                </a>
              </li>
              <li>
                <a href="/#roles" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> University Portals
                </a>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: University Portals (Span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
              <span>University Portals</span>
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link to="/student" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Student Portal
                </Link>
              </li>
              <li>
                <Link to="/faculty" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Faculty Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/parent" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Parent Portal
                </Link>
              </li>
              <li>
                <Link to="/placement" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Placement Cell
                </Link>
              </li>
              <li>
                <Link to="/hostel" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Hostel & Transport
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Support & Resources (Span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
              <span>Support & Resources</span>
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link to="/support" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Help and Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Terms and Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-[#FACC15] transition-colors flex items-center gap-1.5">
                  <span className="text-slate-600">&rsaquo;</span> Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact Information & Newsletter (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]" />
              <span>Contact & Dispatches</span>
            </h2>

            {/* Official Contact Details */}
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <span>Academic Gateway, Outer Ring Road, Bengaluru, Karnataka 560103</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FACC15] shrink-0" />
                <a href="tel:+918041228900" className="hover:text-white hover:underline transition-colors">
                  +91 (80) 4122-8900
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FACC15] shrink-0" />
                <a href="mailto:admin@campusverse.edu" className="hover:text-white hover:underline transition-colors">
                  admin@campusverse.edu
                </a>
              </div>
            </div>

            {/* Real Newsletter Subscription Form */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-white block mb-1.5">
                Subscribe to Campus Dispatches
              </span>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Receive official academic circulars, drive dates, and institutional updates.
              </p>

              {status.message && (
                <div className={`p-2.5 rounded-xl text-xs mb-2 flex items-start gap-2 ${
                  status.success 
                    ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30' 
                    : 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30'
                }`}>
                  {status.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@campusverse.edu"
                  aria-label="Newsletter email subscription"
                  required
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#16223F] border border-[#23355E] focus:border-[#FACC15] focus:ring-1 focus:ring-[#FACC15] text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={status.loading}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B132B] text-xs font-extrabold shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {status.loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Separator Border */}
        <div className="mt-12 pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          {/* Copyright notice */}
          <p className="text-center sm:text-left">
            &copy; {CURRENT_YEAR} <strong className="text-white font-semibold">CampusVerseAI</strong>. All rights reserved.
          </p>

          {/* Links & Back to Top */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/privacy" className="hover:text-[#FACC15] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <Link to="/terms" className="hover:text-[#FACC15] transition-colors">
              Terms and Conditions
            </Link>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <Link to="/support" className="hover:text-[#FACC15] transition-colors">
              Help Desk
            </Link>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            
            {/* Functional Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Scroll back to top of page"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16223F] hover:bg-[#1E2E56] text-[#FACC15] hover:text-white border border-[#23355E] hover:border-[#FACC15] transition-all cursor-pointer shadow-2xs group"
            >
              <span className="text-[11px] font-bold">Back to Top</span>
              <ArrowUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
