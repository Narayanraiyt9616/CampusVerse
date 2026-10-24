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
  FileText,
  Eye,
  Download,
  Globe,
  Check,
  AlertTriangle,
  GraduationCap,
  Ban,
  MessageSquare,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { placementService, getBackendFileUrl } from '../../../services/api';

const getFullFileUrl = (url) => getBackendFileUrl(url);

const handleDownloadResume = async (resumeUrl, studentName) => {
  if (!resumeUrl) return;
  try {
    const res = await fetch(resumeUrl);
    if (!res.ok) throw new Error('File download failed');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    const ext = resumeUrl.split('.').pop()?.split(/[?#]/)[0] || 'pdf';
    const filename = `${(studentName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_')}_Resume.${ext}`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    window.open(resumeUrl, '_blank');
  }
};

export const PlacementApplications = () => {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDriveId, setSelectedDriveId] = useState('ALL');
  const [deadlineStatusFilter, setDeadlineStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active App
  const [activeApp, setActiveApp] = useState(null);
  const [modalMode, setModalMode] = useState('details'); // 'details' | 'interview' | 'offer' | 'accept' | 'reject' | 'shortlist' | 'not_selected'
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Forms
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Technical Interview Round 1',
    date: '',
    time: '10:00 AM IST',
    venueOrLink: 'Placement Block Auditorium & MS Teams',
    instructions: 'Please bring your identity card and ensure stable video connection.',
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

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeApp) {
        setActiveApp(null);
      }
    };
    if (activeApp) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeApp]);

  // Unique departments for filter dropdown
  const uniqueDepartments = Array.from(
    new Set(applications.map((a) => a.student?.department?.name).filter(Boolean))
  );

  // Filter applications
  const filteredApps = applications.filter((a) => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesDrive = selectedDriveId === 'ALL' || a.drive?._id === selectedDriveId;
    const matchesDeadline = deadlineStatusFilter === 'ALL' || a.drive?.deadlineStatus === deadlineStatusFilter;
    const matchesDept = deptFilter === 'ALL' || a.student?.department?.name === deptFilter;

    const q = searchQuery.toLowerCase();
    const name = a.student?.name || '';
    const id = a.student?.studentId || '';
    const company = a.drive?.companyName || '';
    const role = a.drive?.jobTitle || '';
    const dept = a.student?.department?.name || '';

    const matchesSearch =
      name.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      company.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q) ||
      dept.toLowerCase().includes(q) ||
      (a.projects || []).some((p) => (p.title || '').toLowerCase().includes(q));

    return matchesStatus && matchesDrive && matchesDeadline && matchesDept && matchesSearch;
  });

  // KPI Calculations
  const totalCount = applications.length;
  const pendingReviewCount = applications.filter((a) => a.status === 'Applied' || a.status === 'Under Review').length;
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const interviewingCount = applications.filter((a) => a.status === 'Interview Scheduled').length;
  const selectedCount = applications.filter((a) => a.status === 'Selected' || a.status === 'Selected / Offered').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected' || a.status === 'Not Selected').length;

  // Open Modals
  const openDetailsModal = (app) => {
    setActiveApp(app);
    setModalMode('details');
  };

  const openAcceptModal = (app) => {
    setActiveApp(app);
    setModalMode('accept');
  };

  const openRejectModal = (app) => {
    setActiveApp(app);
    setModalMode('reject');
    setRejectionReasonInput(app.rejectionReason || '');
  };

  const openShortlistModal = (app) => {
    setActiveApp(app);
    setModalMode('shortlist');
  };

  const openNotSelectedModal = (app) => {
    setActiveApp(app);
    setModalMode('not_selected');
    setRejectionReasonInput(app.rejectionReason || '');
  };

  const openScheduleInterview = (app) => {
    setActiveApp(app);
    setModalMode('interview');
    setInterviewForm({
      roundName: app.interviewSchedule?.roundName || 'Technical Interview Round 1',
      date: app.interviewSchedule?.date ? new Date(app.interviewSchedule.date).toISOString().split('T')[0] : '',
      time: app.interviewSchedule?.time || '11:00 AM IST',
      venueOrLink: app.interviewSchedule?.venueOrLink || 'Placement Block Labs & Virtual Meet',
      instructions: app.interviewSchedule?.instructions || 'Please keep your resume and portfolio handy.',
      interviewerNotes: app.interviewSchedule?.interviewerNotes || '',
    });
  };

  const openConfirmOffer = (app) => {
    setActiveApp(app);
    setModalMode('offer');
    setOfferForm({
      designation: app.drive?.jobTitle || 'Software Engineer',
      offeredCtc: app.drive?.salaryPackage?.displayPackage || '₹ 28.0 LPA',
      joiningLocation: 'Bangalore, India',
      remarks: 'Candidate cleared all rounds with distinction.',
    });
  };

  // Submit Accept
  const handleAcceptSubmit = async () => {
    if (!activeApp) return;
    setSubmitting(true);
    try {
      const res = await placementService.updateApplication(activeApp._id, {
        status: 'Accepted',
        currentRound: 'Screening Accepted (Advancing to Assessment)',
      });
      if (res && res.success) {
        setSuccessMsg(`Application accepted for ${activeApp.student?.name}. Candidate has advanced to the next stage.`);
        setActiveApp(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to accept application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Shortlist
  const handleShortlistSubmit = async () => {
    if (!activeApp) return;
    setSubmitting(true);
    try {
      const res = await placementService.updateApplication(activeApp._id, {
        status: 'Shortlisted',
        currentRound: 'Shortlisted for Technical Assessments',
      });
      if (res && res.success) {
        setSuccessMsg(`Candidate ${activeApp.student?.name} moved to Shortlist.`);
        setActiveApp(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to shortlist candidate.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reject
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmitting(true);
    try {
      const res = await placementService.updateApplication(activeApp._id, {
        status: 'Rejected',
        currentRound: 'Application Closed',
        rejectionReason: rejectionReasonInput.trim(),
      });
      if (res && res.success) {
        setSuccessMsg(`Application for ${activeApp.student?.name} marked as Rejected.`);
        setActiveApp(null);
        setRejectionReasonInput('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Not Selected
  const handleNotSelectedSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmitting(true);
    try {
      const res = await placementService.updateApplication(activeApp._id, {
        status: 'Not Selected',
        currentRound: 'Recruitment Concluded',
        rejectionReason: rejectionReasonInput.trim(),
      });
      if (res && res.success) {
        setSuccessMsg(`Outcome recorded: ${activeApp.student?.name} marked as Not Selected.`);
        setActiveApp(null);
        setRejectionReasonInput('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to record outcome.');
    } finally {
      setSubmitting(false);
    }
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
          instructions: interviewForm.instructions,
          interviewerNotes: interviewForm.interviewerNotes,
        },
      });

      if (res && res.success) {
        setSuccessMsg(`Interview scheduled for ${activeApp.student?.name}. Real-time invite dispatched!`);
        setActiveApp(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule interview.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Offer / Final Selection
  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!activeApp) return;
    setSubmitting(true);
    try {
      const res = await placementService.updateApplication(activeApp._id, {
        status: 'Selected / Offered',
        currentRound: 'Official Offer Dispatched',
        offerDetails: {
          designation: offerForm.designation,
          offeredCtc: offerForm.offeredCtc,
          joiningLocation: offerForm.joiningLocation,
          offerDate: new Date(),
        },
        remarks: offerForm.remarks,
      });

      if (res && res.success) {
        setSuccessMsg(`Placement offer confirmed for ${activeApp.student?.name}! Student profile updated to Placed.`);
        setActiveApp(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm offer.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
      case 'Selected / Offered':
        return <Badge variant="success" size="sm" hasDot>Selected</Badge>;
      case 'Accepted':
        return <Badge variant="emerald" size="sm" hasDot>Accepted</Badge>;
      case 'Shortlisted':
        return <Badge variant="teal" size="sm" hasDot>Shortlisted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="purple" size="sm" hasDot>Interview Scheduled</Badge>;
      case 'Under Review':
        return <Badge variant="blue" size="sm" hasDot>Under Review</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm" hasDot>Rejected</Badge>;
      case 'Not Selected':
        return <Badge variant="danger" size="sm" hasDot>Not Selected</Badge>;
      case 'Withdrawn':
        return <Badge variant="neutral" size="sm" hasDot>Withdrawn</Badge>;
      default:
        return <Badge variant="neutral" size="sm" hasDot>{status || 'Applied'}</Badge>;
    }
  };

  const getDeadlineBadge = (deadlineStatus) => {
    switch (deadlineStatus) {
      case 'Deadline Expired':
        return <Badge variant="danger" size="sm" hasDot>Deadline Expired</Badge>;
      case 'Closing Soon':
        return <Badge variant="warning" size="sm" hasDot>Closing Soon</Badge>;
      case 'Applications Closed':
        return <Badge variant="neutral" size="sm" hasDot>Closed</Badge>;
      default:
        return <Badge variant="success" size="sm" hasDot>Open</Badge>;
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

      {/* KPI Ribbons: 7 summary count cards for complete visibility */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#F1E7CF] shadow-2xs">
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Total Applied</span>
          <span className="text-xl font-bold font-mono text-[#111827] mt-0.5 block">{totalCount}</span>
          <span className="text-[10px] text-[#6B7280]">All drives</span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Pending Review</span>
          <span className="text-xl font-bold font-mono text-blue-900 mt-0.5 block">{pendingReviewCount}</span>
          <span className="text-[10px] text-blue-600">Awaiting screening</span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Accepted</span>
          <span className="text-xl font-bold font-mono text-emerald-800 mt-0.5 block">{acceptedCount}</span>
          <span className="text-[10px] text-emerald-600">Stage 1 passed</span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-teal-200 bg-teal-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">Shortlisted</span>
          <span className="text-xl font-bold font-mono text-teal-800 mt-0.5 block">{shortlistedCount}</span>
          <span className="text-[10px] text-teal-600">Eligible list</span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Interviewing</span>
          <span className="text-xl font-bold font-mono text-purple-900 mt-0.5 block">{interviewingCount}</span>
          <span className="text-[10px] text-purple-600">Active slots</span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-amber-300 bg-amber-50/30 shadow-2xs">
          <span className="text-[10px] font-bold text-[#D99A00] uppercase tracking-wider block">Offers / Selected</span>
          <span className="text-xl font-bold font-mono text-amber-900 mt-0.5 block">{selectedCount}</span>
          <span className="text-[10px] text-[#D99A00] font-semibold">Final selections</span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-red-200 bg-red-50/20 shadow-2xs">
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Rejected / Exit</span>
          <span className="text-xl font-bold font-mono text-red-800 mt-0.5 block">{rejectedCount}</span>
          <span className="text-[10px] text-red-600">Not selected</span>
        </div>
      </div>

      {/* Main Table Card */}
      <Card
        title="Student Applications & Recruitment Pipeline"
        subtitle="Manage end-to-end applicant reviews, accept candidates, schedule interview panels, and record final offers"
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search candidate, roll, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D99A00] w-48"
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
              <option value="ALL">All Application Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Accepted">Accepted (Next Stage)</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected / Offered">Selected / Offered</option>
              <option value="Rejected">Rejected</option>
              <option value="Not Selected">Not Selected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>

            <select
              value={deadlineStatusFilter}
              onChange={(e) => setDeadlineStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Deadlines</option>
              <option value="Open">Drive Open</option>
              <option value="Closing Soon">Closing Soon</option>
              <option value="Deadline Expired">Deadline Expired</option>
              <option value="Applications Closed">Drive Closed</option>
            </select>

            {uniqueDepartments.length > 0 && (
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
          </div>
        }
      >
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No applications found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFFDF5] text-[#111827] font-bold border-b border-[#F1E7CF]">
                <tr>
                  <th className="p-3.5">Candidate Details</th>
                  <th className="p-3.5">Company & Role</th>
                  <th className="p-3.5">Resume & Supporting Links</th>
                  <th className="p-3.5">Current Stage & Details</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Recruitment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-start gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">
                            {a.student?.name}
                          </span>
                          <span className="text-[11px] font-mono text-[#D99A00] block">
                            {a.student?.studentId} &bull; {a.student?.department?.code || a.student?.department?.name || 'CSE'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Applied: {new Date(a.appliedAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">
                        {a.drive?.companyName}
                      </span>
                      <span className="text-xs text-[#D99A00] font-medium block">
                        {a.drive?.jobTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {a.drive?.salaryPackage?.displayPackage}
                      </span>
                      <div className="mt-1">
                        {getDeadlineBadge(a.drive?.deadlineStatus)}
                      </div>
                    </td>

                    <td className="p-3.5 min-w-[240px]">
                      {/* Uploaded Resume */}
                      <div className="mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                          <FileText className="w-3 h-3 text-[#D99A00]" />
                          Uploaded Resume
                        </span>
                        {a.resumeLink ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <a
                              href={getFullFileUrl(a.resumeLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] hover:bg-[#FFF2CC] transition-colors"
                              title="View resume in new tab"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDownloadResume(getFullFileUrl(a.resumeLink), a.student?.name)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Download resume file"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px] block">No resume uploaded</span>
                        )}
                      </div>

                      {/* External Portfolio / GitHub Links */}
                      {(a.githubLink || a.portfolioLink) && (
                        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                          {a.githubLink && (
                            <a
                              href={a.githubLink.startsWith('http') ? a.githubLink : `https://${a.githubLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
                            >
                              <Globe className="w-2.5 h-2.5" />
                              GitHub
                              <ExternalLink className="w-2 h-2" />
                            </a>
                          )}
                          {a.portfolioLink && (
                            <a
                              href={a.portfolioLink.startsWith('http') ? a.portfolioLink : `https://${a.portfolioLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] hover:bg-[#FFF2CC]"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              Portfolio
                              <ExternalLink className="w-2 h-2" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Live Projects Submitted */}
                      {a.projects && a.projects.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                            <Globe className="w-3 h-3 text-emerald-600" />
                            Live Projects ({a.projects.length})
                          </span>
                          <div className="space-y-1">
                            {a.projects.slice(0, 2).map((proj) => (
                              <div
                                key={proj._id}
                                className="flex items-center justify-between gap-1.5 p-1 rounded bg-slate-50 border border-slate-200/80 text-[11px]"
                              >
                                <span className="font-medium text-slate-800 truncate max-w-[120px]" title={proj.title}>
                                  {proj.title}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {proj.liveUrl && (
                                    <a
                                      href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    >
                                      Live
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-xs text-slate-700 max-w-xs">
                      <span className="font-semibold text-slate-900 block font-mono text-xs">
                        {a.currentRound || 'Application Screening'}
                      </span>

                      {/* If rejected, show rejection reason */}
                      {(a.status === 'Rejected' || a.status === 'Not Selected') && a.rejectionReason && (
                        <div className="p-2 mt-1 rounded-lg bg-red-50 border border-red-200 text-red-800 text-[11px] leading-relaxed">
                          <span className="font-bold block text-red-900">Reason:</span>
                          {a.rejectionReason}
                        </div>
                      )}

                      {/* If interview scheduled, show details */}
                      {a.status === 'Interview Scheduled' && a.interviewSchedule && (
                        <div className="p-2 mt-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] space-y-0.5">
                          <span className="font-bold block text-purple-950">{a.interviewSchedule.roundName}</span>
                          <span className="block font-mono text-[10px]">
                            {a.interviewSchedule.date ? new Date(a.interviewSchedule.date).toLocaleDateString('en-IN') : 'Date TBA'} at {a.interviewSchedule.time || 'TBA'}
                          </span>
                          {a.interviewSchedule.instructions && (
                            <span className="text-purple-700 italic block mt-0.5 truncate" title={a.interviewSchedule.instructions}>
                              Note: {a.interviewSchedule.instructions}
                            </span>
                          )}
                        </div>
                      )}

                      {/* If offer confirmed, show details */}
                      {(a.status === 'Selected' || a.status === 'Selected / Offered') && a.offerDetails && (
                        <div className="p-2 mt-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                          <span className="font-bold block font-mono text-emerald-950">Offer: {a.offerDetails.offeredCtc}</span>
                          <span className="block text-[10px] text-emerald-800">{a.offerDetails.designation}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      {getStatusBadge(a.status)}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {/* View Full Application Details */}
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Eye className="w-3 h-3 text-slate-600" />}
                          onClick={() => openDetailsModal(a)}
                          className="!py-1 !px-2 !text-xs font-medium"
                          title="View complete application profile"
                        >
                          Details
                        </Button>

                        {/* Accept button (advances to next stage, not final selection) */}
                        {['Applied', 'Under Review'].includes(a.status) && (
                          <Button
                            variant="secondary"
                            size="xs"
                            leftIcon={<Check className="w-3 h-3 text-emerald-600" />}
                            onClick={() => openAcceptModal(a)}
                            className="!py-1 !px-2 !text-xs font-semibold !text-emerald-700 !bg-emerald-50 !border-emerald-200 hover:!bg-emerald-100"
                            title="Accept candidate for next evaluation stage"
                          >
                            Accept
                          </Button>
                        )}

                        {/* Shortlist button */}
                        {['Applied', 'Under Review'].includes(a.status) && (
                          <Button
                            variant="ghost"
                            size="xs"
                            leftIcon={<FileCheck2 className="w-3 h-3 text-teal-600" />}
                            onClick={() => openShortlistModal(a)}
                            className="!py-1 !px-2 !text-xs font-medium !text-teal-700 hover:!bg-teal-50"
                            title="Move candidate to shortlist"
                          >
                            Shortlist
                          </Button>
                        )}

                        {/* Schedule Interview */}
                        {!['Selected', 'Selected / Offered', 'Rejected', 'Not Selected', 'Withdrawn'].includes(a.status) && (
                          <Button
                            variant="secondary"
                            size="xs"
                            leftIcon={<Calendar className="w-3 h-3 text-purple-600" />}
                            onClick={() => openScheduleInterview(a)}
                            className="!py-1 !px-2 !text-xs font-medium !text-purple-700 !bg-purple-50 !border-purple-200 hover:!bg-purple-100"
                            title="Schedule or reschedule candidate interview"
                          >
                            Schedule
                          </Button>
                        )}

                        {/* Mark Selected / Offer Final Job */}
                        {a.status !== 'Selected' && a.status !== 'Selected / Offered' && (
                          <Button
                            variant="primary"
                            size="xs"
                            leftIcon={<Award className="w-3 h-3" />}
                            onClick={() => openConfirmOffer(a)}
                            className="!py-1 !px-2 !text-xs font-bold"
                            title="Confirm final employment offer"
                          >
                            Mark Selected
                          </Button>
                        )}

                        {/* Reject Application */}
                        {!['Rejected', 'Not Selected', 'Selected', 'Selected / Offered'].includes(a.status) && (
                          <Button
                            variant="outline"
                            size="xs"
                            leftIcon={<XCircle className="w-3 h-3 text-red-600" />}
                            onClick={() => openRejectModal(a)}
                            className="!py-1 !px-2 !text-xs font-medium !text-red-600 hover:!bg-red-50 !border-red-200"
                            title="Reject candidate application"
                          >
                            Reject
                          </Button>
                        )}

                        {/* Mark Not Selected (Final outcome after interviewing) */}
                        {['Shortlisted', 'Accepted', 'Interview Scheduled'].includes(a.status) && (
                          <Button
                            variant="ghost"
                            size="xs"
                            leftIcon={<Ban className="w-3 h-3 text-rose-500" />}
                            onClick={() => openNotSelectedModal(a)}
                            className="!py-1 !px-1.5 !text-[11px] font-medium !text-rose-600 hover:!bg-rose-50"
                            title="Record final outcome as not selected"
                          >
                            Not Selected
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

      {/* MODAL 1: VIEW DETAILS */}
      {activeApp && modalMode === 'details' && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveApp(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] flex items-center justify-center font-bold text-[#111827] text-lg shrink-0">
                {activeApp.student?.name?.charAt(0) || 'C'}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">{activeApp.student?.name}</h3>
                  {getStatusBadge(activeApp.status)}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll No: <span className="font-mono font-semibold text-slate-800">{activeApp.student?.studentId}</span> &bull; Course: <span className="font-semibold text-slate-800">{activeApp.student?.department?.name || 'Engineering'}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Email: <span className="font-medium text-slate-700">{activeApp.student?.email}</span>
                </p>
              </div>
            </div>

            <div className="my-4 space-y-4 text-xs">
              {/* Application Target Drive */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{activeApp.drive?.companyName}</span>
                  <span className="font-mono font-bold text-emerald-800">{activeApp.drive?.salaryPackage?.displayPackage}</span>
                </div>
                <div className="text-slate-600">
                  Role: <span className="font-semibold">{activeApp.drive?.jobTitle}</span> &bull; Venue: {activeApp.drive?.venue || 'Campus Auditorium'}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Deadline: {new Date(activeApp.drive?.applicationDeadline).toLocaleString('en-IN')}
                  </span>
                  {getDeadlineBadge(activeApp.drive?.deadlineStatus)}
                </div>
              </div>

              {/* Cover Note if provided */}
              {activeApp.coverNote && (
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Applicant Cover Note / Statement:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">{activeApp.coverNote}</p>
                </div>
              )}

              {/* Resume & Portfolio Documents */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                  Uploaded Application Documents & Links
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {activeApp.resumeLink ? (
                    <>
                      <a
                        href={getFullFileUrl(activeApp.resumeLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] hover:bg-[#FFF2CC]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Preview Resume
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(getFullFileUrl(activeApp.resumeLink), activeApp.student?.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download File
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">No resume file attached</span>
                  )}

                  {activeApp.githubLink && (
                    <a
                      href={activeApp.githubLink.startsWith('http') ? activeApp.githubLink : `https://${activeApp.githubLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      GitHub Profile
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {activeApp.portfolioLink && (
                    <a
                      href={activeApp.portfolioLink.startsWith('http') ? activeApp.portfolioLink : `https://${activeApp.portfolioLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] hover:bg-[#FFF2CC]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Personal Portfolio
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Submitted Live Projects */}
              {activeApp.projects && activeApp.projects.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                    Verified Projects Portfolio ({activeApp.projects.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeApp.projects.map((proj) => (
                      <div key={proj._id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{proj.title}</span>
                          <span className="text-[10px] text-slate-400">{proj.category || 'Web App'}</span>
                        </div>
                        {proj.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2">{proj.description}</p>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <Globe className="w-3 h-3" /> Live Demo
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-slate-700 font-medium hover:underline flex items-center gap-0.5"
                            >
                              Code Repository
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview / Rejection / Offer status specifics */}
              {activeApp.status === 'Interview Scheduled' && activeApp.interviewSchedule && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                  <span className="font-bold text-purple-900 block">Interview Schedule on Record:</span>
                  <div className="text-purple-800">
                    Round: <strong>{activeApp.interviewSchedule.roundName}</strong> &bull; Date: {new Date(activeApp.interviewSchedule.date).toLocaleDateString('en-IN')} at {activeApp.interviewSchedule.time}
                  </div>
                  {activeApp.interviewSchedule.venueOrLink && (
                    <div className="text-purple-700">Venue / Meeting: {activeApp.interviewSchedule.venueOrLink}</div>
                  )}
                  {activeApp.interviewSchedule.instructions && (
                    <div className="text-purple-700 italic">Instructions: {activeApp.interviewSchedule.instructions}</div>
                  )}
                </div>
              )}

              {(activeApp.status === 'Rejected' || activeApp.status === 'Not Selected') && activeApp.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-1">
                  <span className="font-bold text-red-900 block">Review Feedback / Rejection Reason:</span>
                  <p className="text-red-800 leading-relaxed">{activeApp.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveApp(null)}>
                Close
              </Button>
              <div className="flex flex-wrap items-center gap-1.5">
                {['Applied', 'Under Review'].includes(activeApp.status) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setModalMode('accept')}
                    className="!text-emerald-700 !bg-emerald-50 !border-emerald-200"
                  >
                    Accept Candidate
                  </Button>
                )}
                {!['Selected', 'Selected / Offered'].includes(activeApp.status) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setModalMode('offer')}
                  >
                    Mark Selected / Offer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM ACCEPT APPLICATION */}
      {activeApp && modalMode === 'accept' && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveApp(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Accept Student Application
                </h3>
                <p className="text-xs text-slate-500">
                  {activeApp.student?.name} for {activeApp.drive?.companyName}
                </p>
              </div>
            </div>

            <div className="p-3 my-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
              <p className="font-bold text-emerald-950">Next Stage Advancement Notice:</p>
              <p className="text-emerald-800 leading-relaxed">
                Accepting this application confirms candidate screening and advances them to the technical evaluation phase.
              </p>
              <p className="font-semibold text-emerald-950 pt-1 border-t border-emerald-200">
                Note: Accepting an application does NOT finalize job selection. Final corporate offers are recorded under &ldquo;Mark Selected&rdquo;.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setActiveApp(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptSubmit}
                disabled={submitting}
                className="!bg-emerald-600 hover:!bg-emerald-700 !text-white"
              >
                {submitting ? 'Accepting...' : 'Confirm Acceptance'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM SHORTLIST */}
      {activeApp && modalMode === 'shortlist' && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveApp(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Shortlist Candidate
                </h3>
                <p className="text-xs text-slate-500">
                  {activeApp.student?.name} for {activeApp.drive?.companyName}
                </p>
              </div>
            </div>

            <p className="my-4 text-xs text-slate-600 leading-relaxed">
              Moving this student to the official shortlist for {activeApp.drive?.jobTitle}. A notification will be dispatched to the candidate portal.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setActiveApp(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleShortlistSubmit}
                disabled={submitting}
                className="!bg-teal-600 hover:!bg-teal-700 !text-white"
              >
                {submitting ? 'Shortlisting...' : 'Confirm Shortlist'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM REJECT APPLICATION */}
      {activeApp && modalMode === 'reject' && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveApp(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-red-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Reject Application
                </h3>
                <p className="text-xs text-slate-500">
                  {activeApp.student?.name} ({activeApp.student?.studentId}) for {activeApp.drive?.companyName}
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Rejection Reason & Feedback (Optional, visible to student)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Assessment test score was below cutoff / Role requires experience in specified cloud framework."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setActiveApp(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={submitting}
                  className="!bg-red-600 hover:!bg-red-700 !text-white"
                >
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RECORD NOT SELECTED OUTCOME */}
      {activeApp && modalMode === 'not_selected' && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveApp(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Record Outcome: Not Selected
                </h3>
                <p className="text-xs text-slate-500">
                  {activeApp.student?.name} for {activeApp.drive?.companyName}
                </p>
              </div>
            </div>

            <p className="my-3 text-xs text-slate-600">
              Conclude the recruitment process for this candidate as Not Selected.
            </p>

            <form onSubmit={handleNotSelectedSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Outcome Feedback / Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Candidate completed technical rounds; vacancy limits reached."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="secondary" size="sm" type="button" onClick={() => setActiveApp(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={submitting}
                  className="!bg-rose-600 hover:!bg-rose-700 !text-white"
                >
                  {submitting ? 'Recording...' : 'Confirm Not Selected'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: SCHEDULE CANDIDATE INTERVIEW */}
      {activeApp && modalMode === 'interview' && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveApp(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Schedule Candidate Interview Slot
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
                  placeholder="e.g. Technical Round 2 (System Architecture & Live Coding)"
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
                <label className="font-semibold text-slate-700 block mb-1">Venue Hall / Virtual Meeting Link *</label>
                <input
                  required
                  type="text"
                  value={interviewForm.venueOrLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, venueOrLink: e.target.value })}
                  placeholder="Auditorium 2 Room 101 / https://teams.microsoft.com/..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Student Instructions & Guidelines</label>
                <textarea
                  rows={2}
                  value={interviewForm.instructions}
                  onChange={(e) => setInterviewForm({ ...interviewForm, instructions: e.target.value })}
                  placeholder="e.g. Bring updated resume copies, ID card, and review DSA & system design notes."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Internal Interviewer Notes (Confidential)</label>
                <input
                  type="text"
                  value={interviewForm.interviewerNotes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerNotes: e.target.value })}
                  placeholder="Focus topics, live coding problem expectations..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setActiveApp(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Dispatch Interview Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: CONFIRM FINAL OFFER / MARK SELECTED */}
      {activeApp && modalMode === 'offer' && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveApp(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-300 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveApp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D99A00] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mark Candidate as Selected / Issue Offer
                </h3>
                <p className="text-xs text-slate-500">
                  {activeApp.student?.name} ({activeApp.student?.studentId}) at {activeApp.drive?.companyName}
                </p>
              </div>
            </div>

            <div className="p-3 my-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Final Placement Confirmation:</span>
              <p className="text-amber-800 leading-relaxed">
                Confirming selection will update the student&rsquo;s institutional placement profile status to &ldquo;Placed&rdquo; and notify the student with congratulations.
              </p>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Offered Designation *</label>
                <input
                  required
                  type="text"
                  value={offerForm.designation}
                  onChange={(e) => setOfferForm({ ...offerForm, designation: e.target.value })}
                  placeholder="e.g. Associate Software Engineer - Backend"
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
                  <label className="font-semibold text-slate-700 block mb-1">Joining Location</label>
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
                <label className="font-semibold text-slate-700 block mb-1">Offer Remarks & Next Steps</label>
                <textarea
                  rows={2}
                  value={offerForm.remarks}
                  onChange={(e) => setOfferForm({ ...offerForm, remarks: e.target.value })}
                  placeholder="e.g. Official letter dispatched via email; joining date July 2026."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setActiveApp(null)} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Confirming...' : 'Authorize Final Selection'}
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
