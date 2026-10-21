import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  CheckCircle2,
  ArrowLeft,
  CalendarCheck,
  Receipt,
  GraduationCap
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import DemoNotice from '../../components/common/DemoNotice';
import { DEMO_PARENT } from '../../utils/demoData';
import { useAuth } from '../../context/AuthContext';

export const ParentDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const currentSection = section ? section.toLowerCase() : null;
  const loggedInName = user?.name || user?.username || DEMO_PARENT.name;
  const ward = DEMO_PARENT.ward;

  const sectionTitles = {
    academic: 'Ward Academic Record & Milestones',
    attendance: 'Biometric Attendance Telemetry',
    fees: 'Fee Invoices & Institutional Dues',
  };

  return (
    <div className="space-y-6">
      {/* Top navigation back button when viewing a specific section */}
      {currentSection && (
        <div className="flex items-center justify-between pb-1">
          <Link
            to="/parent"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Parent Overview
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Dedicated Page: <strong className="text-slate-800">{sectionTitles[currentSection] || currentSection}</strong>
          </span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={currentSection ? `${sectionTitles[currentSection] || currentSection}` : `Welcome, ${loggedInName}`}
        subtitle={currentSection ? `Parent & Guardian Portal • ${loggedInName}` : "Transparent academic telemetry, biometric attendance alerts, and institutional invoicing"}
        breadcrumbs={
          currentSection
            ? [{ label: 'Parent Portal', to: '/parent' }, { label: sectionTitles[currentSection] || currentSection }]
            : [{ label: 'Parent Portal', to: '/parent' }, { label: 'Ward Overview' }]
        }
        badge={<Badge variant="teal" size="sm">Guardian Active</Badge>}
      />

      {/* Demo Notice */}
      <DemoNotice roleName="Parent / Guardian Portal" />

      {/* Ward Profile Banner - shown on overview and academic */}
      {(!currentSection || currentSection === 'academic') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-lg">
                {ward.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{ward.name}</h2>
                  <Badge variant="success" size="sm" hasDot>Good Standing</Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll No: {ward.rollNumber} • {ward.degree}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Faculty Advisor</span>
              <span className="text-xs font-semibold text-slate-800">{ward.advisorName}</span>
              <span className="text-[11px] text-slate-500 block font-mono">{ward.advisorContact}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Cumulative CGPA</span>
              <span className="text-lg font-bold text-teal-700 font-mono">{ward.cgpa.toFixed(2)} / 10.0</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Attendance Rate</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{ward.attendanceOverall}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Hostel Residence</span>
              <span className="text-xs font-semibold text-slate-800">{ward.hostelResident}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Semester Fee</span>
              <span className="text-xs font-semibold text-emerald-700">{ward.feeStatus}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ward Telemetry & Activity Stream */}
      {(!currentSection || currentSection === 'academic') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title="Recent Academic & Campus Milestones"
            subtitle="Real-time timeline of examinations, attendance logs, and drive registrations"
          >
            <div className="space-y-3">
              {DEMO_PARENT.recentWardActivities.map((act, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start gap-3 text-xs"
                >
                  <div className="p-1 rounded bg-teal-100 text-teal-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{act.activity}</span>
                      <Badge variant="neutral" size="sm">{act.category}</Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">{act.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Guardian Communication Channel */}
          <Card
            title="Direct Campus Communication"
            subtitle="Reach out to department leadership or request an academic consultation"
          >
            <div className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">
                Parents can schedule one-on-one appointments with the Head of Department or Dean of Academic Affairs.
              </p>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>Parent Hotline: +91 (80) 4122-8900 (Mon - Fri, 9 AM - 5 PM)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600" />
                  <span>Guardian Desk: parents@campusverse.edu</span>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => alert('Appointment scheduling will integrate with faculty calendar API in Part 2.')}
                >
                  Request Faculty Meeting
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Telemetry Section */}
      {currentSection === 'attendance' && (
        <Card
          title="Ward Biometric Attendance Telemetry"
          subtitle="Detailed daily attendance percentage, lecture hall turnstile check-ins, and mandatory thresholds"
          badge={<Badge variant="teal" size="sm">{ward.attendanceOverall} Overall</Badge>}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Lecture Attendance</span>
                <span className="text-2xl font-bold text-teal-700 font-mono">{ward.attendanceOverall}</span>
                <p className="text-[11px] text-slate-500 mt-1">Exceeds university minimum requirement of 75%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Laboratory Sessions</span>
                <span className="text-2xl font-bold text-slate-900 font-mono">94.2%</span>
                <p className="text-[11px] text-slate-500 mt-1">16 out of 17 practical lab sessions attended</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-1">Hostel Curfew Check-in</span>
                <span className="text-2xl font-bold text-emerald-700 font-mono">100%</span>
                <p className="text-[11px] text-slate-500 mt-1">Zero curfew violations reported</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Fee Invoices & Dues Section */}
      {currentSection === 'fees' && (
        <Card
          title="Institutional Fee Invoices & Receipts"
          subtitle="Verified payment ledger, pending tuition invoices, and hostel accommodation dues"
          badge={<Badge variant="success" size="sm">{ward.feeStatus}</Badge>}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-emerald-900">Current Semester Status: All Dues Cleared</h4>
                <p className="text-emerald-700 text-[11px]">Academic Year 2026-27 • Semester 7</p>
              </div>
              <Badge variant="success" size="sm">No Dues Outstanding</Badge>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Date Paid</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-mono font-bold text-navy-900">INV-2026-0081</td>
                    <td className="p-3">Semester 7 Tuition & Laboratory Fees</td>
                    <td className="p-3 font-mono font-semibold">₹ 1,25,000</td>
                    <td className="p-3 font-mono text-slate-500">12 Aug 2026</td>
                    <td className="p-3 text-right"><Badge variant="success" size="sm">Paid</Badge></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-navy-900">INV-2026-0042</td>
                    <td className="p-3">Hostel Accommodation & Mess Dues</td>
                    <td className="p-3 font-mono font-semibold">₹ 45,000</td>
                    <td className="p-3 font-mono text-slate-500">15 Jul 2026</td>
                    <td className="p-3 text-right"><Badge variant="success" size="sm">Paid</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ParentDashboard;
