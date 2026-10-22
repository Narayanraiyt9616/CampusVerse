import React, { useState, useEffect } from 'react';
import {
  Award,
  Users,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileCheck2,
  X,
  Edit,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { placementService } from '../../../services/api';

export const PlacementApplications = () => {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDriveId, setSelectedDriveId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activeApp, setActiveApp] = useState(null);
  const [modalMode, setModalMode] = useState('interview'); // 'interview' | 'offer'
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Technical Interview Round 1',
    date: '',
    time: '10:00 AM IST',
    venueOrLink: 'Placement Block Auditorium & MS Teams',
    interviewerNotes: '',
  });

  const [offerForm, setOfferForm] = useState({
    designation: 'Software Development Engineer - I',
    offeredCtc: '₹ 32.0 LPA',
    joiningLocation: 'Bangalore, India',
    remarks: 'Candidate cleared all rounds with distinction.',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appsRes, drivesRes] = await Promise.all([
        placementService.getApplications(),
        placementService.getDrives(),
      ]);

      if (appsRes && appsRes.success) setApplications(appsRes.applications || []);
      if (drivesRes && drivesRes.success) setDrives(drivesRes.drives || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recruitment pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter applications
  const filteredApps = applications.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesDrive =
      selectedDriveId === 'ALL' || a.drive?._id === selectedDriveId;

    const q = searchQuery.toLowerCase();
    const name = a.student?.name || '';
    const id = a.student?.studentId || '';
    const company = a.drive?.companyName || '';
    const role = a.drive?.jobTitle || '';

    const matchesSearch =
      name.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      company.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q);

    return matchesStatus && matchesDrive && matchesSearch;
  });

  // Open Interview Modal
  const openScheduleInterview = (app) => {
    setActiveApp(app);
    setModalMode('interview');
    setInterviewForm({
      roundName: app.interviewSchedule?.roundName || 'Technical Interview Round 1',
      date: app.interviewSchedule?.date ? new Date(app.interviewSchedule.date).toISOString().split('T')[0] : '',
      time: app.interviewSchedule?.time || '11:00 AM IST',
      venueOrLink: app.interviewSchedule?.venueOrLink || 'Placement Block Labs & Virtual Meet',
      interviewerNotes: app.interviewSchedule?.interviewerNotes || '',
    });
  };

  // Open Offer Modal
  const openConfirmOffer = (app) => {
    setActiveApp(app);
    setModalMode('offer');
    setOfferForm({
      designation: app.drive?.jobTitle || 'Software Engineer',
      offeredCtc: app.drive?.salaryPackage?.displayPackage || '₹ 28.0 LPA',
      joiningLocation: 'Bangalore, India',
      remarks: 'Candidate verified for final corporate employment offer.',
    });
  };

  // Submit Interview Schedule
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmitting(true);
    try {
      const res = await placementService.updateApplication(activeApp._id, {
        status: 'Interview Scheduled',
        currentRound: interviewForm.roundName,
        interviewSchedule: {
          roundName: interviewForm.roundName,
          date: interviewForm.date || new Date(),
          time: interviewForm.time,
          venueOrLink: interviewForm.venueOrLink,
          interviewerNotes: interviewForm.interviewerNotes,
        },
      });

      if (res && res.success) {
        setSuccessMsg(`Interview scheduled for ${activeApp.student?.name}.`);
        setActiveApp(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Offer
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmitting(true);
    try {
      const res = await placementService.updateApplication(activeApp._id, {
        status: 'Selected / Offered',
        currentRound: 'Offer Letter Dispatched',
        offerDetails: {
          designation: offerForm.designation,
          offeredCtc: offerForm.offeredCtc,
          joiningLocation: offerForm.joiningLocation,
          offerDate: new Date(),
        },
        remarks: offerForm.remarks,
      });

      if (res && res.success) {
        setSuccessMsg(`Placement offer confirmed for ${activeApp.student?.name}!`);
        setActiveApp(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm offer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Mark Shortlisted or Rejected
  const handleDirectStatus = async (appId, newStatus) => {
    try {
      const res = await placementService.updateApplication(appId, {
        status: newStatus,
        currentRound: newStatus === 'Shortlisted' ? 'Technical Evaluation' : 'Application Closed',
      });
      if (res && res.success) {
        setSuccessMsg(`Candidate marked as "${newStatus}".`);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading recruitment applications pipeline...</p>
      </div>
    );
  }

  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const interviewingCount = applications.filter((a) => a.status === 'Interview Scheduled').length;
  const offeredCount = applications.filter((a) => a.status === 'Selected / Offered').length;

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Recruitment Pipeline Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner
          variant="success"
          title="Action Confirmed"
          message={successMsg}
          dismissible
          onDismiss={() => setSuccessMsg('')}
        />
      )}

      {/* KPI Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Total Applications</span>
          <span className="text-2xl font-bold font-mono text-[#111827] mt-1 block">{applications.length}</span>
          <span className="text-xs text-[#4B5563] font-medium">Across All Active Drives</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Shortlisted Candidates</span>
          <span className="text-2xl font-bold font-mono text-[#D99A00] mt-1 block">{shortlistedCount}</span>
          <span className="text-xs text-[#D99A00] font-semibold">Cleared initial screening</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Interviewing Live</span>
          <span className="text-2xl font-bold font-mono text-[#111827] mt-1 block">{interviewingCount}</span>
          <span className="text-xs text-[#D99A00] font-semibold">Active panel assessments</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Offers Dispatched</span>
          <span className="text-2xl font-bold font-mono text-[#D99A00] mt-1 block">{offeredCount}</span>
          <span className="text-xs text-[#D99A00] font-bold">Final placement contracts</span>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Student Applications & Recruitment Pipeline"
        subtitle="Track screening assessments, coordinate interview slots, and confirm placement employment offers"
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D99A00] w-44"
              />
            </div>

            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Drives</option>
              {drives.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.companyName} — {d.jobTitle}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected / Offered">Selected / Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        }
      >
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No applications found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFFDF5] text-[#111827] font-bold border-b border-[#F1E7CF]">
                <tr>
                  <th className="p-3.5">Candidate Details</th>
                  <th className="p-3.5">Company & Role</th>
                  <th className="p-3.5">Current Stage</th>
                  <th className="p-3.5">Interview / Offer Details</th>
                  <th className="p-3.5 text-center">Selection Status</th>
                  <th className="p-3.5 text-right">Recruitment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block text-sm">
                        {a.student?.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#D99A00] block">
                        {a.student?.studentId} • {a.student?.department?.code || 'CSE'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">
                        {a.drive?.companyName}
                      </span>
                      <span className="text-xs text-[#D99A00] font-medium block">
                        {a.drive?.jobTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {a.drive?.salaryPackage?.displayPackage}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-700 font-medium">
                      {a.currentRound || 'Application Screening'}
                    </td>

                    <td className="p-3.5 text-xs text-slate-600 max-w-xs">
                      {a.status === 'Selected / Offered' && a.offerDetails ? (
                        <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                          <span className="font-bold text-emerald-900 block font-mono">
                            Offer: {a.offerDetails.offeredCtc}
                          </span>
                          <span className="text-[11px] text-emerald-700 block">
                            {a.offerDetails.designation} ({a.offerDetails.joiningLocation || 'HQ'})
                          </span>
                        </div>
                      ) : a.status === 'Interview Scheduled' && a.interviewSchedule ? (
                        <div className="p-2 rounded bg-purple-50 border border-purple-200 space-y-0.5">
                          <span className="font-semibold text-purple-900 block">
                            {a.interviewSchedule.roundName}
                          </span>
                          <span className="text-[11px] font-mono text-purple-700 block flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {a.interviewSchedule.time}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Under evaluation queue</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <Badge
                        variant={
                          a.status === 'Selected / Offered'
                            ? 'success'
                            : a.status === 'Interview Scheduled'
                            ? 'purple'
                            : a.status === 'Shortlisted'
                            ? 'teal'
                            : 'neutral'
                        }
                        size="sm"
                        hasDot
                      >
                        {a.status}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {a.status !== 'Selected / Offered' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openScheduleInterview(a)}
                            >
                              Schedule
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openConfirmOffer(a)}
                            >
                              Offer
                            </Button>
                          </>
                        )}
                        {a.status === 'Applied' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDirectStatus(a._id, 'Shortlisted')}
                          >
                            Shortlist
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL: SCHEDULE INTERVIEW */}
      {activeApp && modalMode === 'interview' && (
        <div className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Schedule Candidate Interview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeApp.student?.name} ({activeApp.student?.studentId}) for {activeApp.drive?.companyName}
            </p>

            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Evaluation Round Name *</label>
                <input
                  required
                  type="text"
                  value={interviewForm.roundName}
                  onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                  placeholder="e.g. Technical Round 2 (System Design & DSA)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interview Date *</label>
                  <input
                    required
                    type="date"
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interview Time Slot *</label>
                  <input
                    required
                    type="text"
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    placeholder="10:30 AM IST"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Virtual Meeting Link / Venue Hall</label>
                <input
                  type="text"
                  value={interviewForm.venueOrLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })}
                  placeholder="https://teams.microsoft.com/... or Auditorium 2 Room 101"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interviewer Instructions & Notes</label>
                <textarea
                  rows={2}
                  value={interviewForm.interviewerNotes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerNotes: e.target.value })}
                  placeholder="Focus topics, live coding problem expectations..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setActiveApp(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Dispatch Interview Invite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM PLACEMENT OFFER */}
      {activeApp && modalMode === 'offer' && (
        <div className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Confirm Corporate Placement Offer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorize formal offer for {activeApp.student?.name} at {activeApp.drive?.companyName}.
            </p>

            <form onSubmit={handleOfferSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Offered Designation *</label>
                <input
                  required
                  type="text"
                  value={offerForm.designation}
                  onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                  placeholder="e.g. SDE-1"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Offered CTC Package *</label>
                  <input
                    required
                    type="text"
                    value={offerForm.offeredCtc}
                    onChange={(e) => setOfferForm({ ...offerForm, offeredCtc: e.target.value })}
                    placeholder="e.g. ₹ 32.5 LPA"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Location</label>
                  <input
                    type="text"
                    value={offerForm.joiningLocation}
                    onChange={(e) => setOfferForm({ ...offerForm, joiningLocation: e.target.value })}
                    placeholder="e.g. Bangalore, India"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Selection Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={offerForm.remarks}
                  onChange={(e) => setOfferForm({ ...offerForm, remarks: e.target.value })}
                  placeholder="Offer letter dispatch reference and acceptance deadline..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setActiveApp(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Authorize Placement Offer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementApplications;
