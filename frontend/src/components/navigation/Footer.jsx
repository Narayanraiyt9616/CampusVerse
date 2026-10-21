import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Shield, Server, Cpu, Code2 } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 text-sm border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white tracking-tight">
                  CampusVerse<span className="text-teal-400">AI</span>
                </span>
                <p className="text-xs text-slate-400">
                  Intelligent University Management Ecosystem
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An enterprise-grade, integrated university operating system uniting 15 critical campus modules into a coherent, role-governed digital ecosystem.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-navy-900 text-teal-300 border border-navy-700">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                Part 1 Frontend Active
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-navy-900 text-slate-400 border border-navy-700">
                Node.js & MongoDB in Part 2
              </span>
            </div>
          </div>

          {/* Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/student" className="hover:text-teal-400 transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/faculty" className="hover:text-teal-400 transition-colors">
                  Faculty Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-400 transition-colors">
                  Administrator Portal
                </Link>
              </li>
              <li>
                <Link to="/parent" className="hover:text-teal-400 transition-colors">
                  Parent / Guardian Portal
                </Link>
              </li>
              <li>
                <Link to="/placement" className="hover:text-teal-400 transition-colors">
                  Training & Placement
                </Link>
              </li>
              <li>
                <Link to="/staff" className="hover:text-teal-400 transition-colors">
                  Hostel & Transport Staff
                </Link>
              </li>
              <li>
                <Link to="/super-admin" className="hover:text-teal-400 transition-colors">
                  Super Admin Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Technical Stack
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-teal-400" />
                <span>React 19 + Vite 6 + Tailwind</span>
              </li>
              <li className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Node / Express (Part 2)</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">JWT & RBAC Security (Part 2)</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">FastAPI AI Copilot (Part 3)</span>
              </li>
            </ul>
          </div>

          {/* Project Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Project Governance
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Final Year Computer Science Engineering Capstone Project. Structured across modular development phases.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              <p>Strict Separation of Concerns</p>
              <p className="mt-1">Verified Design System Tokens</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {CURRENT_YEAR} CampusVerse AI. Final Year Project Engineering. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400">Privacy Policy (Planned)</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400">Terms of Governance</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400">System Status: Nominal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
