import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#FDE68A] text-xs font-bold text-[#D97706] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
          <span>About CampusVerseAI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
          Next-Generation Higher Education <span className="text-[#D97706]">Operating Ecosystem</span>
        </h1>
        <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
          CampusVerseAI is an enterprise-grade university management system engineered to eliminate administrative silos and harmonize academic, residential, and career operations into a single source of truth.
        </p>
      </div>

      {/* Main Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] flex items-center justify-center text-[#D97706]">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Unified Campus Architecture</h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Consolidates 15 core higher-education functions—from attendance and examinations to fleet transit and student residences—into a synchronized platform.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] flex items-center justify-center text-[#D97706]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Role-Governed Security</h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Cryptographic authentication, strict session isolation, and granular Role-Based Access Control (RBAC) ensure total data privacy for every student and faculty member.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] flex items-center justify-center text-[#D97706]">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#0F172A]">Stakeholder Inclusion</h2>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Purpose-built workspaces provide tailored dashboards for students, faculty, executives, guardians, corporate recruiters, and campus facilities teams.
          </p>
        </div>
      </div>

      {/* Deep-Dive Card */}
      <div className="bg-white rounded-3xl border border-[#F1E7CF] p-8 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-[#0F172A]">Our Architectural Mission</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Higher education institutes often operate with fragmented, disparate tools: paper attendance, isolated bursar desks, offline hostel allotments, and disjointed placement records. CampusVerseAI bridges these gaps by providing an intuitive, accessible, and high-performance digital foundation designed for long-term scalability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[
            'Single source of truth for academic and examination performance',
            'Real-time parent notifications and attendance tracking',
            'Full placement drive lifecycle with applicant review workflows',
            'Automated hostel bed allocation preventing duplicate occupancy',
            'Integrated transit fleet route monitoring and vehicle telemetry',
            'Comprehensive institutional audits and policy enforcement',
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm font-medium text-[#334155]">{item}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#F1E7CF] flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-[#64748B] font-medium">
            CampusVerse Institute of Advanced Technology & AI &bull; Bengaluru, Karnataka
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/student"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#0F172A] font-bold text-xs border border-[#FDE68A] hover:border-[#D97706] shadow-2xs transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Explore Portals</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#0F172A] font-bold text-xs shadow-xs transition-all"
            >
              <span>Contact Campus Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
