import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#FDE68A] text-xs font-bold text-[#D97706] shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Institutional Data Governance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-sm text-[#64748B]">
          Effective Academic Session 2025–2026 &bull; CampusVerseAI Security Directive
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#F1E7CF] p-6 sm:p-10 shadow-xs space-y-8 text-sm text-[#475569] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#D97706]" />
            <span>1. Commitment to Student & Institutional Privacy</span>
          </h2>
          <p>
            CampusVerseAI is dedicated to safeguarding the personal, academic, and financial information of all students, faculty members, guardians, and administrative staff. As a unified university operating platform, our architecture is built with strict privacy-by-design standards in compliance with international and national higher education guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#D97706]" />
            <span>2. Categories of Information Processed</span>
          </h2>
          <p>The platform processes role-governed data strictly necessary for institutional operations:</p>
          <ul className="space-y-2 pl-4 list-disc marker:text-[#D97706]">
            <li><strong>Identity & Authentication:</strong> Name, institutional email, assigned roll/employee ID, hashed credentials, and multi-factor session tokens.</li>
            <li><strong>Academic Performance:</strong> Course registrations, semester grades, CGPA/SGPA calculations, attendance metrics, and admit card clearances.</li>
            <li><strong>Career & Placements:</strong> Resumes, live GitHub project links, drive application statuses, and interview schedules submitted voluntarily by students.</li>
            <li><strong>Residential & Transit Logistics:</strong> Hostel room allotments, bed occupancy status, transit routes, and verified vehicle allocations.</li>
            <li><strong>Financial Records:</strong> Tuition fee invoices, transaction IDs, scholarship grants, and payment status indicators.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D97706]" />
            <span>3. Role-Based Access Isolation</span>
          </h2>
          <p>
            CampusVerseAI enforces strict cryptographic Role-Based Access Control (RBAC). A student’s academic records cannot be accessed by unauthorized peers; parents can only view information linked directly to their ward; faculty access is restricted to their assigned courses and advisees; and placement corporate partners can view only applicant dossiers explicitly submitted for active drives.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
            <span>4. Data Retention & Privacy Inquiries</span>
          </h2>
          <p>
            Academic data is retained in accordance with university archiving statutes. For privacy inquiries, credential resets, or data review requests, students and staff may contact the institutional compliance desk at <a href="mailto:admin@campusverse.edu" className="text-[#D97706] font-semibold hover:underline">admin@campusverse.edu</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
