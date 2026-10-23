import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Sparkles
} from 'lucide-react';

export const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ submitting: false, success: false, error: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ submitting: false, success: false, error: 'Please fill in all required fields.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setStatus({ submitting: false, success: false, error: 'Please enter a valid email address.' });
      return;
    }

    setStatus({ submitting: true, error: '' });
    // Simulate inquiry intake
    setTimeout(() => {
      setStatus({
        submitting: false,
        success: true,
        error: '',
      });
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E6] border border-[#FDE68A] text-xs font-bold text-[#D97706] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Campus Communication Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
          Contact <span className="text-[#D97706]">CampusVerseAI</span>
        </h1>
        <p className="text-sm sm:text-base text-[#64748B]">
          Have questions regarding academic portals, admissions, parental access, or institutional support? Reach out directly to our campus team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#F1E7CF] shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#D97706]" />
              <span>Campus Central Office</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#475569]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0F172A]">Institution Location</strong>
                  <span>CampusVerse Institute of Advanced Technology & AI</span>
                  <br />
                  <span>Academic Gateway, Outer Ring Road</span>
                  <br />
                  <span>Bengaluru, Karnataka 560103</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0F172A]">Telephone Helpdesk</strong>
                  <a href="tel:+918041228900" className="text-[#D97706] font-semibold hover:underline">
                    +91 (80) 4122-8900
                  </a>
                  <span className="block text-xs text-[#64748B] mt-0.5">Mon – Fri, 9:00 AM – 5:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-[#0F172A]">Institutional Inquiries</strong>
                  <div className="flex flex-col gap-0.5">
                    <a href="mailto:admin@campusverse.edu" className="text-[#D97706] hover:underline">
                      admin@campusverse.edu (Executive Office)
                    </a>
                    <a href="mailto:parents@campusverse.edu" className="text-[#D97706] hover:underline">
                      parents@campusverse.edu (Guardian Desk)
                    </a>
                    <a href="mailto:student@campusverse.edu" className="text-[#D97706] hover:underline">
                      student@campusverse.edu (Student Services)
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#0F172A]">Academic Office Hours</strong>
                  <span>Monday – Friday: 08:30 – 17:30</span>
                  <br />
                  <span>Saturday (Academic Sessions): 09:00 – 13:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F1E7CF] p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#0F172A] mb-1">Send an Inquiry</h2>
          <p className="text-xs sm:text-sm text-[#64748B] mb-6">
            Submit your query and our administrative team will respond within 1 business day.
          </p>

          {status.success && (
            <div className="mb-6 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] flex items-start gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong>Message Dispatched Successfully!</strong>
                <p className="text-xs text-[#166534] mt-0.5">
                  Your inquiry has been received by the CampusVerse Academic Helpdesk. A support representative will follow up via email.
                </p>
              </div>
            </div>
          )}

          {status.error && (
            <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] text-[#B91C1C] flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold text-[#0F172A] mb-1">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aarav Singhania"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#FDE68A] text-sm text-[#0F172A] outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold text-[#0F172A] mb-1">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. user@campusverse.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#FDE68A] text-sm text-[#0F172A] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-bold text-[#0F172A] mb-1">
                Department / Inquiry Topic
              </label>
              <input
                id="contact-subject"
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Student Portal Credentials or Placement Cell Inquiry"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#FDE68A] text-sm text-[#0F172A] outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-bold text-[#0F172A] mb-1">
                Message Content *
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Please describe your question, required support, or specific campus module."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#F59E0B] focus:ring-2 focus:ring-[#FDE68A] text-sm text-[#0F172A] outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={status.submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#0F172A] font-extrabold text-sm shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{status.submitting ? 'Transmitting...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
