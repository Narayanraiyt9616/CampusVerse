import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  Send,
  Loader2,
  RefreshCw,
  Bell,
  Check,
  Search,
  Upload,
  FileText,
  ExternalLink,
  DollarSign,
  UserCheck,
  X,
  FileCheck2,
  Trash2,
  Globe,
  Lock,
  Info,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import AlertBanner from '../../../components/common/AlertBanner';
import Modal from '../../../components/common/Modal';
import { placementService, studentService, notificationService } from '../../../services/api';

export const StudentPlacementSection = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('drives'); // 'drives', 'applications', 'notifications'
  const [drives, setDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Application modal states
  const [applyingDrive, setApplyingDrive] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeLinkInput, setResumeLinkInput] = useState('');
  const [githubLinkInput, setGithubLinkInput] = useState('');
  const [portfolioLinkInput, setPortfolioLinkInput] = useState('');
  const [liveProjectLinkInput, setLiveProjectLinkInput] = useState('');
  const [coverNoteInput, setCoverNoteInput] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const resumeInputRef = useRef(null);

  const studentCourseName =
    profile?.course ||
    profile?.department?.name ||
    'Computer Science & Engineering';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [drivesRes, appsRes, notifRes] = await Promise.allSettled([
        placementService.getEligibleDrives(),
        placementService.getMyApplications(),
        studentService.getMyNotifications({ limit: 50 }),
      ]);

      if (drivesRes.status === 'fulfilled' && drivesRes.value?.success) {
        setDrives(drivesRes.value.drives || []);
      } else if (drivesRes.status === 'fulfilled' && !drivesRes.value?.success) {
        setError(drivesRes.value?.message || 'Failed to fetch eligible placement drives.');
      }

      if (appsRes.status === 'fulfilled' && appsRes.value?.success) {
        setMyApplications(appsRes.value.applications || appsRes.value.data || []);
      }

      if (notifRes.status === 'fulfilled' && notifRes.value?.success) {
        setNotifications(notifRes.value.data || notifRes.value.notifications || []);
      }
    } catch (err) {
      setError(err?.message || 'Error communicating with placement portal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenApplyModal = (drive) => {
    setApplyingDrive(drive);
    setResumeFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
    // Prefill with student's profile resume or previously uploaded application resume
    const existingResume =
      profile?.resumeUrl ||
      profile?.resumeLink ||
      myApplications.find((a) => a.resumeLink)?.resumeLink ||
      '';
    setResumeLinkInput(existingResume);
    setGithubLinkInput(profile?.githubUrl || profile?.githubLink || '');
    setPortfolioLinkInput(profile?.portfolioUrl || profile?.portfolioLink || profile?.linkedinUrl || '');
    setLiveProjectLinkInput(profile?.liveProjectUrl || profile?.liveProjectLink || '');
    setCoverNoteInput('');
    setModalError('');
    setIsDragging(false);
  };

  const handleCloseApplyModal = () => {
    setApplyingDrive(null);
    setResumeFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
    setResumeLinkInput('');
    setGithubLinkInput('');
    setPortfolioLinkInput('');
    setLiveProjectLinkInput('');
    setCoverNoteInput('');
    setModalError('');
    setIsDragging(false);
  };

  const processResumeFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setModalError('Invalid format: Please upload your resume in PDF (.pdf) or Word (.doc, .docx) format.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setModalError('Resume file size exceeds the 10 MB limit.');
      return;
    }
    setResumeFile(file);
    setModalError('');
  };

  const handleResumeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processResumeFile(e.target.files[0]);
    }
  };

  const handleRemoveResume = (e) => {
    e?.stopPropagation();
    setResumeFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyingDrive) return;

    if (!resumeFile && !resumeLinkInput.trim()) {
      setModalError('Please upload your resume file (PDF/Word) or provide a valid resume link.');
      return;
    }

    setSubmittingApp(true);
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('driveId', applyingDrive._id);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      if (resumeLinkInput.trim()) {
        formData.append('resumeLink', resumeLinkInput.trim());
      }
      if (githubLinkInput.trim()) {
        formData.append('githubLink', githubLinkInput.trim());
      }
      if (portfolioLinkInput.trim()) {
        formData.append('portfolioLink', portfolioLinkInput.trim());
      }
      if (liveProjectLinkInput.trim()) {
        formData.append('liveProjectLink', liveProjectLinkInput.trim());
      }
      if (coverNoteInput.trim()) {
        formData.append('coverNote', coverNoteInput.trim());
      }

      const res = await placementService.createApplication(formData);
      if (res?.success) {
        setSuccessMsg(`Application successfully submitted for ${applyingDrive.companyName} (${applyingDrive.jobTitle})!`);
        handleCloseApplyModal();
        fetchData();
        setActiveTab('applications');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setModalError(res?.error || res?.message || 'Failed to submit application.');
      }
    } catch (err) {
      setModalError(err?.message || err?.error || 'Failed to apply for drive.');
    } finally {
      setSubmittingApp(false);
    }
  };

  const [deletingNotifId, setDeletingNotifId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleMarkNotificationRead = async (id) => {
    try {
      await studentService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!id) return;
    setDeletingNotifId(id);
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    } catch {
      try {
        await studentService.deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
      } catch {}
    } finally {
      setDeletingNotifId(null);
    }
  };

  const handleClearAllNotifications = async () => {
    setIsClearingAll(true);
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setShowClearConfirm(false);
    } catch {
      try {
        await studentService.clearAllNotifications();
        setNotifications([]);
        setShowClearConfirm(false);
      } catch {}
    } finally {
      setIsClearingAll(false);
    }
  };

  const getRemainingHours = (notif) => {
    try {
      const created = notif.createdAt ? new Date(notif.createdAt).getTime() : Date.now();
      const expiresAt = notif.expiresAt ? new Date(notif.expiresAt).getTime() : created + 48 * 3600 * 1000;
      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) return 'Expired';
      const hours = Math.floor(remainingMs / (1000 * 3600));
      if (hours >= 1) return `${hours}h left`;
      const mins = Math.max(1, Math.floor(remainingMs / (1000 * 60)));
      return `${mins}m left`;
    } catch {
      return '48h auto-delete';
    }
  };

  const appliedDriveIdSet = new Set(
    myApplications.map((a) => (a.drive?._id || a.drive || '').toString())
  );

  // Filter drives by query
  const filteredDrives = drives.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      (d.companyName || '').toLowerCase().includes(q) ||
      (d.jobTitle || '').toLowerCase().includes(q) ||
      (d.jobField || '').toLowerCase().includes(q) ||
      (d.eligibleCourses || []).some((c) => c.toLowerCase().includes(q))
    );
  });

  const placementNotifications = notifications.filter(
    (n) => n.category === 'Placement' || (n.type && n.type.startsWith('PLACEMENT_'))
  );

  // Helper to determine real-time deadline status
  const getDriveDeadlineInfo = (drive) => {
    if (!drive) return { status: 'Open', label: 'Open', variant: 'success', isExpired: false };
    if (drive.status === 'Cancelled') {
      return { status: 'Drive Cancelled', label: 'Drive Cancelled', variant: 'danger', isExpired: true };
    }
    if (drive.status === 'Applications Closed' || drive.status === 'Completed') {
      return { status: 'Applications Closed', label: 'Applications Closed', variant: 'neutral', isExpired: true };
    }
    if (!drive.applicationDeadline) {
      return { status: 'Open', label: 'Open', variant: 'success', isExpired: false };
    }
    const deadline = new Date(drive.applicationDeadline);
    if (isNaN(deadline.getTime())) {
      return { status: 'Open', label: 'Open', variant: 'success', isExpired: false };
    }
    const now = new Date();
    if (deadline < now) {
      return { status: 'Deadline Expired', label: 'Deadline Expired', variant: 'danger', isExpired: true };
    }
    const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 48) {
      const hoursLeft = Math.max(1, Math.ceil(diffHours));
      return { status: 'Closing Soon', label: `Closing Soon (${hoursLeft}h left)`, variant: 'warning', isExpired: false };
    }
    return { status: 'Open', label: 'Open', variant: 'success', isExpired: false };
  };

  const isApplyDisabled = (drive) => {
    if (!drive) return true;
    if (drive.status === 'Cancelled' || drive.status === 'Applications Closed' || drive.status === 'Completed') {
      return true;
    }
    if (drive.applicationDeadline && new Date(drive.applicationDeadline) < new Date()) {
      return true;
    }
    return false;
  };

  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'Applied':
        return <Badge variant="neutral" size="sm" hasDot>Applied</Badge>;
      case 'Under Review':
        return <Badge variant="info" size="sm" hasDot className="!bg-blue-50 !text-blue-800 !border-blue-200">Under Review</Badge>;
      case 'Shortlisted':
        return <Badge variant="teal" size="sm" hasDot className="!bg-teal-50 !text-teal-800 !border-teal-200">Shortlisted</Badge>;
      case 'Accepted':
        return <Badge variant="success" size="sm" hasDot className="!bg-emerald-50 !text-emerald-800 !border-emerald-200">Accepted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="warning" size="sm" hasDot className="!bg-purple-50 !text-purple-800 !border-purple-200">Interview Scheduled</Badge>;
      case 'Selected':
      case 'Selected / Offered':
        return <Badge variant="teal" size="sm" hasDot className="!bg-emerald-100 !text-emerald-900 !border-emerald-300">Selected</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm" hasDot>Rejected</Badge>;
      case 'Not Selected':
        return <Badge variant="danger" size="sm" hasDot className="!bg-rose-50 !text-rose-800 !border-rose-200">Not Selected</Badge>;
      case 'Withdrawn':
        return <Badge variant="neutral" size="sm" hasDot>Withdrawn</Badge>;
      default:
        return <Badge variant="neutral" size="sm" hasDot>{status || 'Applied'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Eligibility Verification Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8E6] border border-[#D99A00] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D99A00] text-white flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111827]">
                Course-Wise Targeted Placement Access
              </h3>
              <Badge variant="teal" size="sm">Verified Eligible</Badge>
            </div>
            <p className="text-xs text-[#4B5563] mt-1 font-medium leading-relaxed">
              Enrolled Course: <span className="font-bold text-[#111827]">{studentCourseName}</span>.
              Only recruitment drives and targeted notifications matching your degree course are displayed below.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          onClick={fetchData}
          disabled={loading}
          className="shrink-0"
        >
          Refresh Drives
        </Button>
      </div>

      {error && (
        <AlertBanner
          variant="danger"
          title="Placement Notice"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner
          variant="success"
          title="Application Confirmed"
          message={successMsg}
          dismissible
          onDismiss={() => setSuccessMsg('')}
        />
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-[#F1E7CF] pb-2">
        <button
          onClick={() => setActiveTab('drives')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'drives'
              ? 'border-[#D99A00] text-[#D99A00]'
              : 'border-transparent text-[#4B5563] hover:text-[#111827]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Available Placement Drives ({filteredDrives.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'applications'
              ? 'border-[#D99A00] text-[#D99A00]'
              : 'border-transparent text-[#4B5563] hover:text-[#111827]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          My Applications ({myApplications.length})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'notifications'
              ? 'border-[#D99A00] text-[#D99A00]'
              : 'border-transparent text-[#4B5563] hover:text-[#111827]'
          }`}
        >
          <Bell className="w-4 h-4" />
          Selection & Alerts ({placementNotifications.length})
        </button>
      </div>

      {/* TAB 1: AVAILABLE PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search eligible drives by company, job role, domain, or skills..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-[#D99A00] animate-spin" />
              <p className="text-xs text-[#4B5563] font-medium">Fetching active placement drives...</p>
            </div>
          ) : filteredDrives.length === 0 ? (
            <div className="text-center py-14 px-4 border border-dashed border-[#F1E7CF] rounded-2xl bg-[#FFFDF5]">
              <Briefcase className="w-10 h-10 text-[#D99A00] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#111827]">No Placement Drives Match Your Criteria</p>
              <p className="text-xs text-[#4B5563] mt-1">
                Recruitment drives scheduled for {studentCourseName} will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrives.map((d) => {
                const isAlreadyApplied = appliedDriveIdSet.has(d._id.toString());
                const courses = d.eligibleCourses?.length > 0
                  ? d.eligibleCourses
                  : (d.eligibilityCriteria?.eligibleCourses?.length > 0
                      ? d.eligibilityCriteria.eligibleCourses
                      : (d.eligibilityCriteria?.eligibleDepartments || []));
                const deadlineInfo = getDriveDeadlineInfo(d);
                const isExpired = isApplyDisabled(d);

                return (
                  <div
                    key={d._id}
                    className="p-5 rounded-2xl bg-white border border-[#F1E7CF] hover:border-[#D99A00]/70 transition-all shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold text-[#D99A00] bg-[#FFF8E6] px-2.5 py-0.5 rounded border border-[#F1E7CF] uppercase">
                            {d.jobField || 'Software Development'}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            {d.salaryPackage?.displayPackage || 'Industry Best Package'}
                          </span>
                          <Badge variant={deadlineInfo.variant} size="xs" hasDot>
                            {deadlineInfo.label}
                          </Badge>
                        </div>
                        <h3 className="text-base font-extrabold text-[#111827] mt-1.5">{d.companyName}</h3>
                        <p className="text-xs font-semibold text-[#4B5563]">{d.jobTitle}</p>
                      </div>

                      <div className="shrink-0">
                        {isAlreadyApplied ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Application Submitted
                          </span>
                        ) : isExpired ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled
                            leftIcon={<Lock className="w-3.5 h-3.5 text-gray-400" />}
                            className="opacity-75 cursor-not-allowed text-xs font-semibold"
                            title="Applications are closed or the deadline has expired."
                          >
                            {deadlineInfo.status === 'Deadline Expired' ? 'Deadline Expired' : 'Applications Closed'}
                          </Button>
                        ) : (
                          <Button
                            id={`apply-drive-btn-${d._id}`}
                            variant="primary"
                            size="sm"
                            leftIcon={<Upload className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenApplyModal(d)}
                          >
                            Apply with Resume
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Drive Cancelled Banner */}
                    {d.status === 'Cancelled' && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                        <span className="font-bold flex items-center gap-1 text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Placement Drive Cancelled
                        </span>
                        {d.cancellationReason && (
                          <p className="text-rose-700 font-medium">Reason: {d.cancellationReason}</p>
                        )}
                      </div>
                    )}

                    {/* Eligible Courses Banner */}
                    <div className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#D99A00] uppercase tracking-wider flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Eligible Degree Courses
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          Your course is verified eligible
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {courses.map((crs, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#F1E7CF] text-[#111827] font-medium"
                          >
                            {crs}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cutoff, Schedule, and Rounds */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB]">
                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Academic Cutoff</span>
                        <div className="font-semibold text-[#111827] mt-0.5">
                          Min CGPA: <span className="font-mono text-[#D99A00]">{d.eligibilityCriteria?.minCgpa ?? 7.0}</span> &bull; Max {d.eligibilityCriteria?.maxBacklogs ?? 0} Backlog
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Skills Required</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {(d.requiredSkills || []).map((sk, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#374151] font-mono">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Drive Date & Venue</span>
                        <div className="font-mono font-semibold text-[#111827] mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#D99A00]" />
                          <span>{new Date(d.driveDate).toLocaleDateString('en-IN')}</span>
                        </div>
                        <span className="text-[10px] text-[#6B7280] block truncate">{d.venue}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7280] pt-1 border-t border-[#F1E7CF]">
                      <div className={`flex items-center gap-1.5 font-mono font-semibold ${deadlineInfo.isExpired ? 'text-red-600' : 'text-[#374151]'}`}>
                        <Clock className="w-3.5 h-3.5 text-[#D99A00]" />
                        <span>
                          Application Deadline: {d.applicationDeadline
                            ? new Date(d.applicationDeadline).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : 'Open Until Notice'}
                        </span>
                      </div>
                      <div className="text-[11px]">
                        <strong>Rounds:</strong> {(d.evaluationRounds || []).join(' ➔ ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-[#D99A00] animate-spin" />
              <p className="text-xs text-[#4B5563] font-medium">Fetching your application history...</p>
            </div>
          ) : myApplications.length === 0 ? (
            <div className="text-center py-14 px-4 border border-dashed border-[#F1E7CF] rounded-2xl bg-[#FFFDF5]">
              <FileCheck2 className="w-10 h-10 text-[#D99A00] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#111827]">No Applications Submitted Yet</p>
              <p className="text-xs text-[#4B5563] mt-1">
                Explore available placement drives and submit your resume to start tracking recruitment rounds.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab('drives')}
              >
                Browse Eligible Drives
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => {
                const drive = app.drive || {};
                const isSelected = app.status === 'Selected' || app.status === 'Selected / Offered';
                const isAccepted = app.status === 'Accepted';
                const isShortlisted = app.status === 'Shortlisted';
                const isRejected = app.status === 'Rejected';
                const isNotSelected = app.status === 'Not Selected';
                const deadlineInfo = getDriveDeadlineInfo(drive);

                return (
                  <div
                    key={app._id}
                    className={`p-5 rounded-2xl bg-white border transition-all shadow-xs space-y-3.5 ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : isAccepted
                        ? 'border-emerald-200 bg-[#FDFFFD]'
                        : isRejected || isNotSelected
                        ? 'border-rose-200 bg-[#FFFDFD]'
                        : 'border-[#F1E7CF] hover:border-[#D99A00]/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-base text-[#111827]">
                            {drive.companyName || 'Corporate Partner'}
                          </span>
                          {getApplicationStatusBadge(app.status)}
                          <Badge variant={deadlineInfo.variant} size="xs">
                            {deadlineInfo.label}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-[#4B5563] mt-0.5">
                          {drive.jobTitle || 'Role'} &bull; {drive.salaryPackage?.displayPackage || 'Package Details'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right text-xs space-y-0.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#6B7280]">Applied On: </span>
                          <span className="font-mono font-bold text-[#111827]">
                            {new Date(app.appliedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#6B7280]">Drive Deadline: </span>
                          <span className={`font-mono text-xs ${deadlineInfo.isExpired ? 'text-red-600 font-bold' : 'text-[#4B5563]'}`}>
                            {drive.applicationDeadline
                              ? new Date(drive.applicationDeadline).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })
                              : 'Open'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Notice: Application Accepted for next round */}
                    {isAccepted && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Application Accepted for Evaluation Rounds</span>
                        </div>
                        <p className="text-emerald-700 font-medium">
                          Your profile has passed initial screening and has been accepted by the placement committee for subsequent evaluation rounds. (Note: Official final selection and offer will be confirmed after completing interview rounds).
                        </p>
                      </div>
                    )}

                    {/* Status Notice: Shortlisted */}
                    {isShortlisted && (
                      <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-teal-800">
                          <Award className="w-4 h-4 text-teal-600" />
                          <span>Candidate Shortlisted</span>
                        </div>
                        <p className="text-teal-700 font-medium">
                          Your application has been shortlisted for {drive.companyName}. Placement administrators will communicate your interview slot shortly.
                        </p>
                      </div>
                    )}

                    {/* Selection Offer Details Banner */}
                    {isSelected && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <Award className="w-4 h-4 text-emerald-600" />
                          <span>Official Selection Offer Confirmed</span>
                        </div>
                        <p className="text-emerald-700 text-xs font-medium">
                          Congratulations! You have received a formal recruitment offer from {drive.companyName}.
                          {app.offerDetails?.designation && ` Role: ${app.offerDetails.designation}.`}
                          {app.offerDetails?.offeredCtc && ` Offered Package: ${app.offerDetails.offeredCtc}.`}
                        </p>
                      </div>
                    )}

                    {/* Interview Schedule Details with Instructions */}
                    {app.interviewSchedule?.date && (
                      <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="font-bold flex items-center gap-1.5 text-purple-900">
                            <Calendar className="w-4 h-4 text-purple-700" />
                            Interview Scheduled &bull; {app.interviewSchedule.roundName || app.currentRound || 'Technical / HR Round'}
                          </span>
                          <span className="font-mono font-bold text-purple-800">
                            {new Date(app.interviewSchedule.date).toLocaleDateString('en-IN')} at{' '}
                            {app.interviewSchedule.time || '10:00 AM'}
                          </span>
                        </div>
                        {app.interviewSchedule.venueOrLink && (
                          <div className="text-purple-900 font-medium">
                            <strong>Venue / Video Link:</strong> {app.interviewSchedule.venueOrLink}
                          </div>
                        )}
                        {app.interviewSchedule.instructions && (
                          <div className="p-2.5 rounded-lg bg-white/90 border border-purple-200 text-purple-950">
                            <strong className="block text-purple-900 mb-0.5">Instructions & Preparation Guidelines:</strong>
                            {app.interviewSchedule.instructions}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rejection / Outcome Reason Feedback Banner */}
                    {(isRejected || isNotSelected) && app.rejectionReason && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>Review Feedback / Outcome Reason</span>
                        </div>
                        <p className="text-rose-700 font-medium leading-relaxed">
                          {app.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Drive Cancelled Banner */}
                    {drive.status === 'Cancelled' && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Placement Drive Cancelled</span>
                        </div>
                        <p className="text-rose-700 font-medium">
                          This recruitment drive was cancelled by placement administration.
                          {drive.cancellationReason && ` Reason: ${drive.cancellationReason}`}
                        </p>
                      </div>
                    )}

                    {/* Application Attachments & Links */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2.5 border-t border-[#F1E7CF]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[#6B7280]">Submitted Documents:</span>
                        {app.resumeLink ? (
                          <a
                            href={app.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#D99A00] hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Resume
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[#9CA3AF]">Resume on record</span>
                        )}
                        {app.githubLink && (
                          <a
                            href={app.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#4B5563] hover:text-[#111827] flex items-center gap-1"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            GitHub
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {app.portfolioLink && (
                          <a
                            href={app.portfolioLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#4B5563] hover:text-[#111827] flex items-center gap-1"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            Portfolio
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {app.liveProjectLink && (
                          <a
                            href={app.liveProjectLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#4B5563] hover:text-[#111827] flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Live Project
                          </a>
                        )}
                      </div>

                      <span className="text-[11px] text-[#6B7280]">
                        Current Stage: <strong className="text-[#111827]">{app.currentRound || 'Application Screening'}</strong>
                      </span>
                    </div>

                    {app.coverNote && (
                      <div className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-[#4B5563]">
                        <strong className="text-[#111827]">Submitted Cover Note: </strong>
                        {app.coverNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLACEMENT NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {/* Header Actions & Notice */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D99A00] shrink-0" />
              <span className="text-[#4B5563] font-medium">
                Alerts automatically delete <strong>48 hours</strong> after creation. You can also delete alerts manually below.
              </span>
            </div>
            {placementNotifications.length > 0 && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => setShowClearConfirm(true)}
                className="!text-red-600 hover:!bg-red-50 !border-red-200 shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Alerts
              </Button>
            )}
          </div>

          {/* Clear All Confirmation Banner */}
          {showClearConfirm && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2.5">
              <div className="flex items-start gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Are you sure you want to clear all placement alerts? This action cannot be undone.</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="xs"
                  disabled={isClearingAll}
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  disabled={isClearingAll}
                  onClick={handleClearAllNotifications}
                  className="!bg-red-600 hover:!bg-red-700 !text-white flex items-center gap-1"
                >
                  {isClearingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {isClearingAll ? 'Clearing...' : 'Confirm Clear All'}
                </Button>
              </div>
            </div>
          )}

          {placementNotifications.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-[#F1E7CF] rounded-2xl bg-[#FFFDF5]">
              <Bell className="w-10 h-10 text-[#D99A00] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#111827]">No Placement Notifications</p>
              <p className="text-xs text-[#4B5563] mt-1">
                Updates regarding your applications, interview schedules, and selection offers will appear here. All alerts auto-expire after 48 hours.
              </p>
            </div>
          ) : (
            placementNotifications.map((notif) => {
              const isSelected = notif.type === 'PLACEMENT_SELECTED' || (notif.title || '').includes('Selected');

              return (
                <div
                  key={notif._id}
                  className={`p-4 rounded-xl border transition-all text-xs relative group ${
                    isSelected
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                      : notif.isRead
                      ? 'bg-white border-[#F1E7CF] opacity-85'
                      : 'bg-[#FFFDF5] border-[#D99A00] shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1E7CF] pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FFF8E6] text-[#D99A00]'
                      }`}>
                        {isSelected ? <Award className="w-4 h-4" /> : <Briefcase className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#111827] block">
                          {notif.title}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
                          <span>{new Date(notif.createdAt).toLocaleString('en-IN')}</span>
                          <span>&bull;</span>
                          <span className="text-[#D99A00] font-semibold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {getRemainingHours(notif)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <Badge variant="teal" size="sm">Offer Confirmed</Badge>
                      ) : (
                        <Badge variant="warning" size="sm">{notif.priority || 'Normal'}</Badge>
                      )}
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleMarkNotificationRead(notif._id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteNotification(notif._id)}
                        disabled={deletingNotifId === notif._id}
                        className="!text-slate-400 hover:!text-red-600 hover:!bg-red-50 !p-1.5 cursor-pointer"
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        {deletingNotifId === notif._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <p className="text-[#374151] leading-relaxed font-medium">
                    {notif.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Apply Modal with Resume Upload and Project Links */}
      {applyingDrive && (
        <Modal
          isOpen={!!applyingDrive}
          onClose={handleCloseApplyModal}
          title={`Apply for ${applyingDrive.companyName}`}
          maxWidth="max-w-xl"
          closeOnNavigate={false}
          id="student-apply-drive-modal"
        >
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-[#111827]">
                <span>Role: {applyingDrive.jobTitle}</span>
                <span className="font-mono text-emerald-700">{applyingDrive.salaryPackage?.displayPackage || 'Standard CTC'}</span>
              </div>
              <div className="text-[#6B7280]">
                Drive Date: {new Date(applyingDrive.driveDate).toLocaleDateString('en-IN')} &bull; Venue: {applyingDrive.venue}
              </div>
              <div className="text-[#6B7280]">
                Deadline: {applyingDrive.applicationDeadline ? new Date(applyingDrive.applicationDeadline).toLocaleString('en-IN') : 'Open'}
              </div>
              <div className="text-[#6B7280]">
                Eligibility: Minimum {applyingDrive.eligibilityCriteria?.minCgpa ?? 7.0} CGPA across {studentCourseName}
              </div>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {modalError}
              </div>
            )}            {/* Resume Upload File Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Resume Document (.pdf, .doc, .docx) *
                </label>
                {resumeFile && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    File Attached
                  </span>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={resumeInputRef}
                type="file"
                id="placement-resume-input"
                onChange={handleResumeFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              {resumeFile ? (
                /* Attached File Card */
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-left flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-emerald-950 truncate">{resumeFile.name}</p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to submit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resumeInputRef.current?.click();
                      }}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline px-1.5 py-1"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="p-1 rounded-lg text-emerald-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Clickable Dropzone using label */
                <label
                  htmlFor="placement-resume-input"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processResumeFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer block transition-all ${
                    isDragging
                      ? 'border-[#D99A00] bg-[#FFF8E6]'
                      : 'border-[#F1E7CF] hover:border-[#D99A00] bg-[#FFFDF5]'
                  }`}
                >
                  <Upload className="w-7 h-7 text-[#D99A00] mx-auto mb-2" />
                  <span className="text-xs font-bold text-[#111827] block">
                    Click to select resume document from device
                  </span>
                  <span className="text-[11px] text-[#6B7280] block mt-1">
                    Drag and drop or browse files &bull; Supported: PDF, DOC, DOCX up to 10 MB
                  </span>
                </label>
              )}
            </div>

            {/* Optional Online Resume / Portfolio Link */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Online Resume Link (Optional if uploading file above)
              </label>
              <input
                type="url"
                value={resumeLinkInput}
                onChange={(e) => setResumeLinkInput(e.target.value)}
                placeholder="https://drive.google.com/your-resume.pdf"
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
              />
            </div>

            {/* GitHub Profile Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                  GitHub Profile Link (Optional)
                </label>
                <input
                  type="url"
                  value={githubLinkInput}
                  onChange={(e) => setGithubLinkInput(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
                />
              </div>

              {/* Portfolio / Website Link */}
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                  Portfolio / Website (Optional)
                </label>
                <input
                  type="url"
                  value={portfolioLinkInput}
                  onChange={(e) => setPortfolioLinkInput(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
                />
              </div>
            </div>

            {/* Live Project Demo Link */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Live Project / Demo Link (Optional)
              </label>
              <input
                type="url"
                value={liveProjectLinkInput}
                onChange={(e) => setLiveProjectLinkInput(e.target.value)}
                placeholder="https://demo-app.com or live deployment URL"
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
              />
            </div>

            {/* Cover Note / Brief Pitch */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Cover Note / Statement of Interest (Optional)
              </label>
              <textarea
                value={coverNoteInput}
                onChange={(e) => setCoverNoteInput(e.target.value)}
                rows={3}
                placeholder="Share a brief introduction, your key projects, or why you're interested in this role..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1E7CF]">
              <Button variant="secondary" size="sm" type="button" onClick={handleCloseApplyModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={submittingApp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                disabled={submittingApp}
              >
                {submittingApp ? 'Submitting Application...' : 'Confirm Application'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentPlacementSection;
