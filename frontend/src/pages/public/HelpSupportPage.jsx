import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Sparkles, 
  Search,
  ArrowRight,
  GraduationCap,
  Users,
  Shield,
  Briefcase
} from 'lucide-react';

export const HelpSupportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How do I sign in to my designated university portal?',
      a: 'Navigate to the Portal Sign In page or select your role from the "Choose Your Portal" section. Enter your institutional email (e.g. student@campusverse.edu) and password. Your dashboard will open automatically with role-verified permissions.',
      category: 'General',
    },
    {
      q: 'How does the Parent Portal link to student academic records?',
      a: 'Parents access a specialized guardian console linked directly to their ward’s university roll number. You can review live attendance percentages, semester grades, timetable schedules, and fee balance statements in real-time.',
      category: 'Parent',
    },
    {
      q: 'Where do students upload resumes and project links for campus placement drives?',
      a: 'Inside the Student Portal, open the "Placement & Internship" section. Here you can submit your live project repository links and upload your PDF resume. Placement officers review these submissions directly during applicant shortlisting.',
      category: 'Placement',
    },
    {
      q: 'How is duplicate hostel bed allocation prevented?',
      a: 'CampusVerseAI implements real-time relational bed validation. When a bed is assigned to a resident student, its status is immediately marked as "Occupied" across the system, preventing any duplicate assignment across blocks or rooms.',
      category: 'Hostel',
    },
    {
      q: 'What should I do if I forget my password or portal credentials?',
      a: 'Contact the Central Academic Registrar Helpdesk at admin@campusverse.edu or call +91 (80) 4122-8900 during campus office hours (08:30 – 17:30 IST) for identity verification and credential recovery.',
      category: 'General',
    },
    {
      q: 'How do faculty members submit course grades and attendance?',
      a: 'Faculty members sign in through the Faculty Portal to access their assigned course rosters. Attendance can be marked per lecture session, and semester marks can be finalized with automated grade point calculation.',
      category: 'Faculty',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#FDE68A] text-xs font-bold text-[#D97706] shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Knowledge Base & FAQs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
          Help & <span className="text-[#D97706]">Support Center</span>
        </h1>
        <p className="text-sm sm:text-base text-[#64748B]">
          Find quick solutions, explore frequently asked questions, or connect with our campus technical support desk.
        </p>

        {/* Search Input */}
        <div className="pt-4 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search FAQs by question or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#E2E8F0] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#FDE68A] text-sm text-[#0F172A] outline-none shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Quick Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Student Portal', icon: <GraduationCap className="w-5 h-5 text-[#D97706]" />, to: '/login/student' },
          { label: 'Faculty Support', icon: <Users className="w-5 h-5 text-[#D97706]" />, to: '/login/faculty' },
          { label: 'Parent Desk', icon: <Shield className="w-5 h-5 text-[#D97706]" />, to: '/login/parent' },
          { label: 'Placement Cell', icon: <Briefcase className="w-5 h-5 text-[#D97706]" />, to: '/login/placement' },
        ].map((cat, idx) => (
          <Link
            key={idx}
            to={cat.to}
            className="p-4 rounded-2xl bg-white border border-[#F1E7CF] hover:border-[#F59E0B] text-center flex flex-col items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] flex items-center justify-center group-hover:scale-105 transition-transform">
              {cat.icon}
            </div>
            <span className="text-xs font-bold text-[#0F172A]">{cat.label}</span>
          </Link>
        ))}
      </div>

      {/* Accordion FAQ List */}
      <div className="bg-white rounded-3xl border border-[#F1E7CF] p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
          Frequently Asked Questions
        </h2>

        {filteredFaqs.length === 0 ? (
          <p className="text-sm text-[#64748B] py-6 text-center">
            No FAQs match your search. Please check our Contact Support desk below.
          </p>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#F1E7CF] rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 bg-[#FFFEFA] hover:bg-[#FFFDF7] transition-colors"
                >
                  <span className="text-sm font-bold text-[#0F172A]">{faq.q}</span>
                  <div className="w-7 h-7 rounded-full bg-[#FFF8E6] flex items-center justify-center shrink-0 text-[#D97706]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed bg-[#FFFEFA] border-t border-[#F8F1DE]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support Direct Contact Box */}
      <div className="bg-gradient-to-r from-[#FFFDF5] via-white to-[#FFFDF7] rounded-3xl border border-[#F1E7CF] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-[#0F172A]">Still need assistance?</h3>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Our university support staff is available Monday through Friday from 08:30 to 17:30 IST.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="tel:+918041228900"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-[#0F172A] font-bold text-xs border border-[#FDE68A] hover:border-[#D97706] shadow-2xs transition-all"
          >
            <Phone className="w-4 h-4 text-[#D97706]" />
            <span>+91 (80) 4122-8900</span>
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#0F172A] font-extrabold text-xs shadow-xs transition-all"
          >
            <span>Contact Support Desk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
