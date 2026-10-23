import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import AlertBanner from '../../../components/common/AlertBanner';
import Modal from '../../../components/common/Modal';
import { placementService, studentService } from '../../../services/api';

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
  const [submittingApp, setSubmittingApp] = useState(false);
  const [modalError, setModalError] = useState('');

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
    setResumeLinkInput('');
    setModalError('');
  };

  const handleCloseApplyModal = () => {
    setApplyingDrive(null);
    setResumeFile(null);
    setResumeLinkInput('');
    setModalError('');
  };

  const handleResumeFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
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

  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case 'Selected / Offered':
        return <Badge variant="teal" size="sm" hasDot>Selected / Offered</Badge>;
      case 'Shortlisted':
        return <Badge variant="teal" size="sm" hasDot>Shortlisted</Badge>;
      case 'Interview Scheduled':
        return <Badge variant="warning" size="sm" hasDot>Interview Scheduled</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm" hasDot>Not Shortlisted</Badge>;
      default:
        return <Badge variant="neutral" size="sm" hasDot>Application Submitted</Badge>;
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
                const courses = d.eligibleCourses?.length > 0 ? d.eligibleCourses : d.eligibilityCriteria?.eligibleCourses || [];

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
                        ) : (
                          <Button
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
                      <div className="flex items-center gap-1 text-red-600 font-semibold font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {new Date(d.applicationDeadline).toLocaleDateString('en-IN')}</span>
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
                const isSelected = app.status === 'Selected / Offered';

                return (
                  <div
                    key={app._id}
                    className={`p-5 rounded-2xl bg-white border transition-all shadow-xs space-y-3 ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-[#F1E7CF] hover:border-[#D99A00]/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base text-[#111827]">
                            {drive.companyName || 'Corporate Partner'}
                          </span>
                          {getApplicationStatusBadge(app.status)}
                        </div>
                        <p className="text-xs font-semibold text-[#4B5563] mt-0.5">
                          {drive.jobTitle || 'Role'} &bull; {drive.salaryPackage?.displayPackage || 'Package Details'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Applied Date</span>
                        <span className="font-mono font-bold text-[#111827]">
                          {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>

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

                    {/* Interview Schedule Details */}
                    {app.interviewSchedule?.date && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <span className="font-bold block text-amber-800">Interview Scheduled:</span>
                        <div>
                          Round: {app.interviewSchedule.roundName || app.currentRound} &bull; Date:{' '}
                          {new Date(app.interviewSchedule.date).toLocaleDateString('en-IN')} at{' '}
                          {app.interviewSchedule.time || '10:00 AM'}
                        </div>
                        {app.interviewSchedule.venueOrLink && (
                          <div>Venue / Meeting Link: {app.interviewSchedule.venueOrLink}</div>
                        )}
                      </div>
                    )}

                    {/* Resume Attachment */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F1E7CF]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#6B7280]">Submitted Resume:</span>
                        {app.resumeLink ? (
                          <a
                            href={app.resumeLink.startsWith('http') ? app.resumeLink : app.resumeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#D99A00] hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Uploaded Resume
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[#9CA3AF]">Resume on record</span>
                        )}
                      </div>

                      <span className="text-[11px] text-[#6B7280]">
                        Current Round: <strong>{app.currentRound || 'Application Screening'}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLACEMENT NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {placementNotifications.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-[#F1E7CF] rounded-2xl bg-[#FFFDF5]">
              <Bell className="w-10 h-10 text-[#D99A00] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-bold text-[#111827]">No Placement Notifications</p>
              <p className="text-xs text-[#4B5563] mt-1">
                Updates regarding your applications, interview schedules, and selection offers will appear here.
              </p>
            </div>
          ) : (
            placementNotifications.map((notif) => {
              const isSelected = notif.type === 'PLACEMENT_SELECTED' || (notif.title || '').includes('Selected');

              return (
                <div
                  key={notif._id}
                  className={`p-4 rounded-xl border transition-all text-xs ${
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
                        <span className="text-[10px] text-[#6B7280]">
                          {new Date(notif.createdAt).toLocaleString('en-IN')}
                        </span>
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

      {/* Apply Modal with Resume Upload */}
      {applyingDrive && (
        <Modal
          isOpen={!!applyingDrive}
          onClose={handleCloseApplyModal}
          title={`Apply for ${applyingDrive.companyName}`}
          maxWidth="max-w-lg"
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
                Eligibility: Minimum {applyingDrive.eligibilityCriteria?.minCgpa ?? 7.0} CGPA across {studentCourseName}
              </div>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {modalError}
              </div>
            )}

            {/* Resume Upload File Input */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                Upload Resume File (.pdf, .doc, .docx) *
              </label>
              <div className="border-2 border-dashed border-[#F1E7CF] hover:border-[#D99A00] rounded-xl p-4 text-center cursor-pointer bg-[#FFFDF5] transition-all">
                <input
                  type="file"
                  id="resume-file-input"
                  onChange={handleResumeFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <label htmlFor="resume-file-input" className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-[#D99A00] mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-[#111827] block">
                    {resumeFile ? resumeFile.name : 'Click to select resume document from device'}
                  </span>
                  <span className="text-[11px] text-[#6B7280] block mt-0.5">
                    Supported: PDF, DOC, DOCX up to 10 MB
                  </span>
                </label>
              </div>
            </div>

            {/* Optional Online Resume / Portfolio Link */}
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Online Resume or Portfolio Link (Optional)
              </label>
              <input
                type="text"
                value={resumeLinkInput}
                onChange={(e) => setResumeLinkInput(e.target.value)}
                placeholder="https://drive.google.com/... or https://portfolio.com"
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
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
