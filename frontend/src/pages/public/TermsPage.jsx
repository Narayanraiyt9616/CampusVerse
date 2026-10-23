import React from 'react';
import { BookOpen, Scale, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#FDE68A] text-xs font-bold text-[#D97706] shadow-2xs">
          <Scale className="w-3.5 h-3.5 text-[#D97706]" />
          <span>System Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          Terms & Conditions of Service
        </h1>
        <p className="text-sm text-[#64748B]">
          Institutional User Agreement & Academic System Policies &bull; CampusVerseAI
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#F1E7CF] p-6 sm:p-10 shadow-xs space-y-8 text-sm text-[#475569] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            <span>1. Acceptance of Institutional Usage Terms</span>
          </h2>
          <p>
            By accessing or signing in to any portal within the CampusVerseAI platform (including Student, Faculty, Administration, Parent, Placement, or Facilities portals), you agree to adhere to all university technology usage guidelines, academic honesty codes, and cryptographic session security standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D97706]" />
            <span>2. Authorized Account Usage & Role Separation</span>
          </h2>
          <p>
            Each user is issued credentials corresponding to their verified university role. You are solely responsible for maintaining the confidentiality of your sign-in credentials. Sharing institutional accounts or attempting to access modules outside your designated role boundaries is strictly prohibited and logged by automated security auditing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#D97706]" />
            <span>3. Academic & Operational Accuracy</span>
          </h2>
          <p>
            Information submitted into CampusVerseAI—including assignment uploads, project links, attendance entries, hostel bed bookings, and placement applications—must be truthful and accurate. Misrepresentation of academic credentials or malicious uploads may result in disciplinary action under university bylaws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>4. System Availability & Maintenance</span>
          </h2>
          <p>
            While CampusVerseAI strives for continuous 99.9% platform availability, scheduled maintenance windows may occur during non-peak hours. University announcements and emergency notices will be broadcast via the central notification banner. For urgent system inquiries, contact the central administrative registrar at <a href="mailto:admin@campusverse.edu" className="text-[#D97706] font-semibold hover:underline">admin@campusverse.edu</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
