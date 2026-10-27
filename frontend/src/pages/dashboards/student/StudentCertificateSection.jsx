import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import Badge from '../../../components/common/Badge';
import { getCertificationPlatformUrl } from '../../../utils/certificationConfig';

export const StudentCertificateSection = () => {
  const [copied, setCopied] = useState(false);
  const targetUrl = getCertificationPlatformUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Spotlight Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFDF5] via-white to-[#FEF9EE] border border-[#FDE68A] p-6 sm:p-8 lg:p-10 shadow-[0_10px_35px_rgba(217,119,6,0.08)]">
        {/* Ambient Decorative Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#FACC15]/20 via-[#F59E0B]/10 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-tr from-[#D97706]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#F1E7CF] text-xs font-black text-[#B45309] shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>CampusVerse Career Accelerator</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
              Certificates &amp;{' '}
              <span className="text-[#D97706] relative inline-block">
                Resume Enhancement
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-[#FDE68A]" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Student-Friendly Description */}
            <p className="text-sm sm:text-base text-[#475569] font-medium leading-relaxed">
              Validate your technical skills with adaptive online assessments, download accredited digital certificates, and automatically boost your placement resume with verified credentials.
            </p>

            {/* Key Quick Facts */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#0F172A] font-bold">
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-[#F1E7CF]">
                <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                <span>Industry-Recognized Badges</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-[#F1E7CF]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>Verifiable QR Verification</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-[#F1E7CF]">
                <Zap className="w-4 h-4 text-[#2563EB]" />
                <span>Instant PDF Download</span>
              </div>
            </div>
          </div>

          {/* Primary CTA Box */}
          <div className="w-full lg:w-auto flex-shrink-0 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#FDE68A] p-5 sm:p-6 shadow-[0_8px_30px_rgba(217,119,6,0.12)] space-y-4 text-center lg:text-left min-w-[280px] sm:min-w-[320px]">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#B45309] block">
                Direct Certification Portal
              </span>
              <p className="text-xs text-[#64748B] font-medium">
                Launch test center and claim your credentials
              </p>
            </div>

            {/* Explore & Get Certified Button */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="student-explore-get-certified-btn"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-extrabold text-sm shadow-[0_4px_16px_rgba(217,119,6,0.35)] hover:shadow-[0_6px_22px_rgba(217,119,6,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <Award className="w-4 h-4 text-white" />
              <span>Explore &amp; Get Certified</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/90" />
            </a>

            {/* Configurable URL Indicator */}
            <div className="pt-2 border-t border-[#F1E7CF] flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="truncate max-w-[200px] font-mono text-[10px]" title={targetUrl}>
                Target: {targetUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 text-[#D97706] hover:text-[#B45309] font-bold transition-colors ml-2 shrink-0 cursor-pointer"
                title="Copy Target URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Certification Pathway */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
              How It Works: 3 Steps to Enhance Your Resume
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium">
              A frictionless pathway from practice tests to recruiter-ready resume verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="relative p-6 rounded-3xl bg-white border border-[#F1E7CF] hover:border-[#FDE68A] shadow-xs hover:shadow-md transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                01
              </div>
              <Badge variant="warning" size="sm">Online Tests</Badge>
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-base group-hover:text-[#D97706] transition-colors">
                Take Proctored Online Tests
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1.5 leading-relaxed">
                Choose a domain matching your program. Complete timed quizzes and hands-on coding challenges designed by industry advisors.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-[#475569] font-semibold pt-1 border-t border-[#F1E7CF]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                Multiple choice &amp; practical code evaluations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                Instant automated score feedback
              </li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 rounded-3xl bg-white border border-[#F1E7CF] hover:border-[#FDE68A] shadow-xs hover:shadow-md transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                02
              </div>
              <Badge variant="teal" size="sm">Certified Credential</Badge>
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-base group-hover:text-[#059669] transition-colors">
                Earn Downloadable Certificates
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1.5 leading-relaxed">
                Score 70% or higher to instantly receive an official, high-resolution PDF certificate with a verifiable QR code and certificate ID.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-[#475569] font-semibold pt-1 border-t border-[#F1E7CF]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                Cryptographically signed unique serial numbers
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                One-click PDF download &amp; direct print
              </li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 rounded-3xl bg-white border border-[#F1E7CF] hover:border-[#FDE68A] shadow-xs hover:shadow-md transition-all duration-300 space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
                03
              </div>
              <Badge variant="info" size="sm">Career Boost</Badge>
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-base group-hover:text-[#2563EB] transition-colors">
                Enhance Your Resume &amp; Profile
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1.5 leading-relaxed">
                Embed your verified badge link directly into your CV, LinkedIn licenses, and CampusVerse campus placement candidate file.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-[#475569] font-semibold pt-1 border-t border-[#F1E7CF]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                Pre-formatted resume bullet points provided
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                Verified flag on campus recruiter profiles
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resume Enhancement Tips */}
      <div className="bg-[#FFFDF5] rounded-3xl border border-[#FDE68A] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1E7CF] pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8E6] border border-[#F1E7CF] text-xs font-black text-[#B45309]">
              <Briefcase className="w-3.5 h-3.5 text-[#D99A00]" />
              <span>Resume Enhancement Tips</span>
            </div>
            <h3 className="font-extrabold text-[#0F172A] text-lg sm:text-xl">
              Add Verified Impact to Your CV &amp; Professional Profiles
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] font-medium leading-relaxed max-w-2xl">
              Recruiters prioritize applicants with verifiable, test-backed credentials. Here is how you can highlight your achievements:
            </p>
          </div>

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-extrabold shadow-sm transition-colors shrink-0"
          >
            <Award className="w-4 h-4 text-[#FACC15]" />
            <span>Get Certified Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FACC15]" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-[#F1E7CF] space-y-2">
            <p className="font-bold text-[#0F172A] text-sm">1. Resume Certifications Section</p>
            <p className="text-[#64748B] leading-relaxed">
              Add your credential under your resume's Education or Certifications section:
            </p>
            <p className="text-[#B45309] font-mono text-[11px] bg-[#FFF8E6] p-2.5 rounded-xl border border-[#FDE68A]">
              &ldquo;CampusVerse Certified: Advanced Web Engineering (Credential ID: CV-2026)&rdquo;
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#F1E7CF] space-y-2">
            <p className="font-bold text-[#0F172A] text-sm">2. LinkedIn Licenses &amp; Badges</p>
            <p className="text-[#64748B] leading-relaxed">
              Directly paste your credential link into your LinkedIn Licenses &amp; Certifications section to display the verified issuer badge to recruiters.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#F1E7CF] space-y-2">
            <p className="font-bold text-[#0F172A] text-sm">3. Campus Placement Sync</p>
            <p className="text-[#64748B] leading-relaxed">
              Your certified scores automatically reflect in your CampusVerse placement cell applications, granting eligibility boosts in corporate drives.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentCertificateSection;
