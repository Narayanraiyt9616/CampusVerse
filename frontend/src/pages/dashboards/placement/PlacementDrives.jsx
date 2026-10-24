import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  X,
  Award,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Edit,
  Check,
  AlertCircle,
  AlertTriangle,
  Layers,
  Ban,
  RotateCcw,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { placementService } from '../../../services/api';

export const AVAILABLE_COURSES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Electrical & Electronics Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'School of Management Studies (MBA)',
];

export const JOB_FIELDS = [
  'Software Development',
  'Web Development',
  'Data Analytics & BI',
  'Artificial Intelligence & Machine Learning',
  'Cloud Computing & DevOps',
  'Cybersecurity & Network Engineering',
  'Mobile Application Development',
  'Core Engineering & Embedded Systems',
  'Product Management & Consulting',
  'Quality Assurance & Test Automation',
];

const formatForDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
};

const DEFAULT_DRIVE_FORM = {
  companyName: '',
  jobTitle: '',
  jobField: 'Software Development',
  jobType: 'Full-Time',
  description: '',
  displayPackage: '₹ 24.0 LPA (CTC)',
  minCgpa: 7.5,
  maxBacklogs: 0,
  requiredSkills: 'Data Structures, C++, Python, System Design',
  eligibleCourses: ['Computer Science & Engineering', 'Information Technology'],
  driveDate: '',
  applicationDeadline: '',
  venue: 'Auditorium 2 & Online HackerEarth Labs',
  evaluationRounds: 'Online Coding Test, Technical Interview 1, HR Discussion',
  status: 'Registration Open',
  cancellationReason: '',
};

export const PlacementDrives = () => {
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'companies'
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deadlineFilter, setDeadlineFilter] = useState('ALL');

  // Modals
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [editingDriveId, setEditingDriveId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customCourseInput, setCustomCourseInput] = useState('');

  // Cancellation Modal
  const [cancellingDrive, setCancellingDrive] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Forms
  const [driveForm, setDriveForm] = useState(DEFAULT_DRIVE_FORM);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: 'Software & Cloud Computing',
    website: '',
    contactEmail: '',
    contactPerson: '',
    contactPhone: '',
    location: 'Bangalore, India',
    tier: 'Tier 1 (Dream)',
    about: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [drivesRes, companiesRes] = await Promise.all([
        placementService.getDrives(),
        placementService.getCompanies(),
      ]);

      if (drivesRes && drivesRes.success) setDrives(drivesRes.drives || []);
      if (companiesRes && companiesRes.success) setCompanies(companiesRes.companies || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recruitment drives.');
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
      if (e.key === 'Escape') {
        if (showAddDriveModal) setShowAddDriveModal(false);
        if (showAddCompanyModal) setShowAddCompanyModal(false);
        if (cancellingDrive) setCancellingDrive(null);
      }
    };
    if (showAddDriveModal || showAddCompanyModal || cancellingDrive) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddDriveModal, showAddCompanyModal, cancellingDrive]);

  // Filter drives
  const filteredDrives = drives.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesDeadline = deadlineFilter === 'ALL' || d.deadlineStatus === deadlineFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (d.companyName || '').toLowerCase().includes(q) ||
      (d.jobTitle || '').toLowerCase().includes(q) ||
      (d.jobField || '').toLowerCase().includes(q) ||
      (d.venue || '').toLowerCase().includes(q) ||
      (d.eligibleCourses || []).some((c) => c.toLowerCase().includes(q));
    return matchesStatus && matchesDeadline && matchesSearch;
  });

  // Filter companies
  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q)
    );
  });

  // Course Multi-select Handlers
  const handleToggleCourse = (course) => {
    setDriveForm((prev) => {
      const exists = prev.eligibleCourses.includes(course);
      const updated = exists
        ? prev.eligibleCourses.filter((c) => c !== course)
        : [...prev.eligibleCourses, course];
      return { ...prev, eligibleCourses: updated };
    });
  };

  const handleSelectAllCourses = () => {
    setDriveForm((prev) => ({
      ...prev,
      eligibleCourses: [...AVAILABLE_COURSES],
    }));
  };

  const handleClearAllCourses = () => {
    setDriveForm((prev) => ({
      ...prev,
      eligibleCourses: [],
    }));
  };

  const handleAddCustomCourse = () => {
    const trimmed = customCourseInput.trim();
    if (!trimmed) return;
    setDriveForm((prev) => {
      if (prev.eligibleCourses.includes(trimmed)) return prev;
      return { ...prev, eligibleCourses: [...prev.eligibleCourses, trimmed] };
    });
    setCustomCourseInput('');
  };

  const handleOpenAddModal = () => {
    setEditingDriveId(null);
    setDriveForm(DEFAULT_DRIVE_FORM);
    setShowAddDriveModal(true);
  };

  const handleOpenEditModal = (drive) => {
    setEditingDriveId(drive._id);
    const existingCourses = drive.eligibleCourses?.length > 0
      ? drive.eligibleCourses
      : drive.eligibilityCriteria?.eligibleCourses || ['Computer Science & Engineering', 'Information Technology'];

    setDriveForm({
      companyName: drive.companyName || '',
      jobTitle: drive.jobTitle || '',
      jobField: drive.jobField || 'Software Development',
      jobType: drive.jobType || 'Full-Time',
      description: drive.description || '',
      displayPackage: drive.salaryPackage?.displayPackage || '₹ 24.0 LPA (CTC)',
      minCgpa: drive.eligibilityCriteria?.minCgpa ?? 7.5,
      maxBacklogs: drive.eligibilityCriteria?.maxBacklogs ?? 0,
      requiredSkills: (drive.requiredSkills || []).join(', '),
      eligibleCourses: existingCourses,
      driveDate: drive.driveDate ? new Date(drive.driveDate).toISOString().slice(0, 10) : '',
      applicationDeadline: drive.applicationDeadline ? formatForDateTimeLocal(drive.applicationDeadline) : '',
      venue: drive.venue || 'Auditorium 2 & Online HackerEarth Labs',
      evaluationRounds: (drive.evaluationRounds || []).join(', '),
      status: drive.status || 'Registration Open',
      cancellationReason: drive.cancellationReason || '',
    });
    setShowAddDriveModal(true);
  };

  // Quick action to reopen an expired or cancelled drive
  const handleReopenDrive = (drive) => {
    const futureDeadline = new Date();
    futureDeadline.setDate(futureDeadline.getDate() + 7);
    futureDeadline.setHours(23, 59, 0, 0);

    setEditingDriveId(drive._id);
    const existingCourses = drive.eligibleCourses?.length > 0
      ? drive.eligibleCourses
      : drive.eligibilityCriteria?.eligibleCourses || ['Computer Science & Engineering', 'Information Technology'];

    setDriveForm({
      companyName: drive.companyName || '',
      jobTitle: drive.jobTitle || '',
      jobField: drive.jobField || 'Software Development',
      jobType: drive.jobType || 'Full-Time',
      description: drive.description || '',
      displayPackage: drive.salaryPackage?.displayPackage || '₹ 24.0 LPA (CTC)',
      minCgpa: drive.eligibilityCriteria?.minCgpa ?? 7.5,
      maxBacklogs: drive.eligibilityCriteria?.maxBacklogs ?? 0,
      requiredSkills: (drive.requiredSkills || []).join(', '),
      eligibleCourses: existingCourses,
      driveDate: drive.driveDate ? new Date(drive.driveDate).toISOString().slice(0, 10) : '',
      applicationDeadline: formatForDateTimeLocal(futureDeadline),
      venue: drive.venue || 'Auditorium 2 & Online HackerEarth Labs',
      evaluationRounds: (drive.evaluationRounds || []).join(', '),
      status: 'Registration Open',
      cancellationReason: '',
    });
    setShowAddDriveModal(true);
  };

  // Handle Save Drive (Create or Edit)
  const handleSaveDrive = async (e) => {
    e.preventDefault();
    if (!driveForm.companyName || !driveForm.jobTitle || !driveForm.driveDate || !driveForm.applicationDeadline) {
      alert('Company, Job Title, Drive Date, and Deadline are required.');
      return;
    }
    if (driveForm.eligibleCourses.length === 0) {
      alert('Please select at least one eligible course for this recruitment drive.');
      return;
    }

    setSubmitting(true);
    try {
      const skillsArr = driveForm.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const roundsArr = driveForm.evaluationRounds.split(',').map((r) => r.trim()).filter(Boolean);

      const payload = {
        companyName: driveForm.companyName,
        jobTitle: driveForm.jobTitle,
        jobField: driveForm.jobField || 'Software Development',
        jobType: driveForm.jobType,
        description: driveForm.description,
        displayPackage: driveForm.displayPackage,
        minCgpa: Number(driveForm.minCgpa),
        maxBacklogs: Number(driveForm.maxBacklogs),
        requiredSkills: skillsArr,
        eligibleCourses: driveForm.eligibleCourses,
        eligibleDepartments: driveForm.eligibleCourses,
        driveDate: driveForm.driveDate,
        applicationDeadline: driveForm.applicationDeadline,
        venue: driveForm.venue,
        evaluationRounds: roundsArr,
        status: driveForm.status || 'Registration Open',
        cancellationReason: driveForm.cancellationReason || '',
      };

      if (editingDriveId) {
        const res = await placementService.updateDrive(editingDriveId, payload);
        if (res && res.success) {
          setSuccessMsg(`Placement drive for ${driveForm.companyName} updated. Targeted student notifications synchronized!`);
          setShowAddDriveModal(false);
          fetchData();
        }
      } else {
        const res = await placementService.createDrive(payload);
        if (res && res.success) {
          setSuccessMsg(`Placement drive for ${driveForm.companyName} scheduled successfully. Automatic targeted notifications dispatched to eligible students!`);
          setShowAddDriveModal(false);
          fetchData();
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save drive.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cancel Drive Action
  const handleOpenCancelModal = (drive) => {
    setCancellingDrive(drive);
    setCancellationReason('');
  };

  const handleCancelDriveSubmit = async (e) => {
    e.preventDefault();
    if (!cancellingDrive) return;
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancelling this recruitment drive.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await placementService.updateDrive(cancellingDrive._id, {
        status: 'Cancelled',
        cancellationReason: cancellationReason.trim(),
      });
      if (res && res.success) {
        setSuccessMsg(`Placement drive for ${cancellingDrive.companyName} cancelled. All student applicants have been notified.`);
        setCancellingDrive(null);
        setCancellationReason('');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel drive.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.industry) {
      alert('Company name and industry are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await placementService.createCompany(companyForm);
      if (res && res.success) {
        setSuccessMsg(`Corporate partner ${companyForm.name} registered.`);
        setShowAddCompanyModal(false);
        setCompanyForm({
          name: '',
          industry: 'Software & Cloud Computing',
          website: '',
          contactEmail: '',
          contactPerson: '',
          contactPhone: '',
          location: 'Bangalore, India',
          tier: 'Tier 1 (Dream)',
          about: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to register company.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && drives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading corporate partners & placement drives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Drive Management Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner
          variant="success"
          title="Operation Confirmed"
          message={successMsg}
          dismissible
          onDismiss={() => setSuccessMsg('')}
        />
      )}

      {/* Tabs & Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F1E7CF] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('drives')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drives'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Job Openings & Drives
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'drives' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {drives.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'companies'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Corporate Hiring Partners
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'companies' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {companies.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'drives' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddModal}
            >
              Schedule Drive
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowAddCompanyModal(true)}
            >
              Register Partner
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <Card
          title="Placement Drives & Corporate Openings"
          subtitle="Salary packages, job field domains, course eligibility mandates, and drive timelines"
          headerAction={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search drive, course, field..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D99A00] w-48"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="Registration Open">Registration Open</option>
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Applications Closed">Applications Closed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="ALL">All Deadlines</option>
                <option value="Open">Deadline: Open</option>
                <option value="Closing Soon">Deadline: Closing Soon</option>
                <option value="Deadline Expired">Deadline: Expired</option>
                <option value="Applications Closed">Deadline: Closed</option>
              </select>
            </div>
          }
        >
          {filteredDrives.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No placement drives found matching search criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrives.map((d) => (
                <div
                  key={d._id}
                  className={`p-5 rounded-2xl border bg-white transition-all shadow-2xs space-y-3 ${
                    d.status === 'Cancelled'
                      ? 'border-red-200 bg-red-50/20'
                      : d.deadlineStatus === 'Deadline Expired'
                      ? 'border-rose-200'
                      : 'border-slate-200 hover:border-[#F1E7CF]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] flex items-center justify-center font-bold text-[#111827] text-lg shrink-0">
                        {d.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{d.companyName}</h4>
                          <Badge variant="teal" size="sm">{d.jobType}</Badge>
                          {d.jobField && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Briefcase className="w-2.5 h-2.5" />
                              {d.jobField}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-[#D99A00] block mt-0.5">{d.jobTitle}</span>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">{d.description}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Compensation</span>
                        <span className="text-base font-bold font-mono text-slate-900">{d.salaryPackage?.displayPackage}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {/* Status badge */}
                        {d.status === 'Cancelled' ? (
                          <Badge variant="danger" size="sm" hasDot>Drive Cancelled</Badge>
                        ) : (
                          <Badge
                            variant={d.status === 'Registration Open' ? 'success' : 'neutral'}
                            size="sm"
                            hasDot
                          >
                            {d.status}
                          </Badge>
                        )}

                        {/* Deadline Status badge */}
                        {d.status !== 'Cancelled' && (
                          <Badge
                            variant={
                              d.deadlineStatus === 'Deadline Expired'
                                ? 'danger'
                                : d.deadlineStatus === 'Closing Soon'
                                ? 'warning'
                                : d.deadlineStatus === 'Applications Closed'
                                ? 'neutral'
                                : 'success'
                            }
                            size="sm"
                            hasDot
                          >
                            {d.deadlineStatus || 'Open'}
                          </Badge>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Edit className="w-3 h-3 text-[#D99A00]" />}
                          onClick={() => handleOpenEditModal(d)}
                          className="!py-1 !px-2.5 !text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </Button>

                        {(d.status === 'Cancelled' || d.deadlineStatus === 'Deadline Expired') && (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<RotateCcw className="w-3 h-3 text-emerald-600" />}
                            onClick={() => handleReopenDrive(d)}
                            className="!py-1 !px-2.5 !text-xs font-medium !text-emerald-700 !bg-emerald-50 !border-emerald-200 hover:!bg-emerald-100"
                          >
                            Reopen Drive
                          </Button>
                        )}

                        {d.status !== 'Cancelled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Ban className="w-3 h-3 text-red-600" />}
                            onClick={() => handleOpenCancelModal(d)}
                            className="!py-1 !px-2.5 !text-xs font-medium !text-red-600 hover:!bg-red-50 !border-red-200"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Reason Alert Banner */}
                  {d.status === 'Cancelled' && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Drive Cancelled:</span>{' '}
                        {d.cancellationReason || 'Recruitment drive cancelled by placement administration. All applicants have been notified.'}
                      </div>
                    </div>
                  )}

                  {/* Course Eligibility & Academic Criteria */}
                  <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-[#D99A00]" />
                        Eligible Degree Courses ({d.eligibleCourses?.length || (d.eligibilityCriteria?.eligibleCourses || []).length || 'All'})
                      </span>
                      <span className="text-[10px] font-mono font-medium text-slate-500">
                        Targeted student notifications dispatched
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(d.eligibleCourses && d.eligibleCourses.length > 0
                        ? d.eligibleCourses
                        : (d.eligibilityCriteria?.eligibleCourses || [])
                      ).map((crs, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-amber-200 text-slate-800 font-medium flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#D99A00]" />
                          {crs}
                        </span>
                      ))}
                      {(!d.eligibleCourses || d.eligibleCourses.length === 0) &&
                        (!d.eligibilityCriteria?.eligibleCourses || d.eligibilityCriteria.eligibleCourses.length === 0) && (
                          <span className="text-[11px] text-slate-500 italic">Open to all university courses</span>
                        )}
                    </div>
                  </div>

                  {/* Skills & Schedule Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Cutoff</span>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        Min CGPA: <span className="font-mono text-[#D99A00]">{d.eligibilityCriteria?.minCgpa ?? 7.0}</span> • Max {d.eligibilityCriteria?.maxBacklogs ?? 0} Backlog
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        Domain: {d.jobField || 'General'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Competencies</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(d.requiredSkills || []).map((sk, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drive Schedule & Venue</span>
                      <div className="font-mono font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(d.driveDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">{d.venue}</span>
                    </div>
                  </div>

                  {/* Evaluation Rounds & Deadlines */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className={`w-3.5 h-3.5 ${d.deadlineStatus === 'Deadline Expired' ? 'text-red-600' : d.deadlineStatus === 'Closing Soon' ? 'text-amber-600' : 'text-slate-500'}`} />
                      <span className={d.deadlineStatus === 'Deadline Expired' ? 'text-red-700 font-bold' : d.deadlineStatus === 'Closing Soon' ? 'text-amber-700 font-bold' : ''}>
                        Application Deadline: {new Date(d.applicationDeadline).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Rounds:</span>
                      <span className="text-slate-600 font-mono">
                        {(d.evaluationRounds || []).join(' ➔ ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: CORPORATE HIRING PARTNERS */}
      {activeTab === 'companies' && (
        <Card
          title="Registered Corporate Hiring Partners"
          subtitle="Directory of MNCs, unicorn tech startups, and enterprise consulting recruiters"
          headerAction={
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D99A00] w-44"
              />
            </div>
          }
        >
          {filteredCompanies.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No corporate partners registered.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((c) => (
                <div
                  key={c._id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#F1E7CF] transition-all shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] flex items-center justify-center font-bold text-[#111827]">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                        <span className="text-xs text-slate-500">{c.industry}</span>
                      </div>
                    </div>
                    <Badge variant="teal" size="sm">{c.tier}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.about || 'Corporate recruiter partnering with CampusVerse university graduates.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D99A00] shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#D99A00] shrink-0" />
                      <span className="truncate">{c.contactEmail || 'campus@recruiter.com'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MODAL: SCHEDULE / EDIT DRIVE */}
      {showAddDriveModal && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddDriveModal(false)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddDriveModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#D99A00]" />
              {editingDriveId ? 'Edit Placement Drive & Eligibility' : 'Schedule Campus Placement Drive'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select eligible courses and job domain. Automatic targeted notifications will be sent to matching students.
            </p>

            <form onSubmit={handleSaveDrive} className="mt-4 space-y-4 text-xs">
              {/* Row 1: Company & Job Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    required
                    type="text"
                    value={driveForm.companyName}
                    onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Title *</label>
                  <input
                    required
                    type="text"
                    value={driveForm.jobTitle}
                    onChange={(e) => setDriveForm({ ...driveForm, jobTitle: e.target.value })}
                    placeholder="e.g. SDE-1 (Cloud Systems)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Row 2: Job Field & Job Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Job Role / Domain / Field *
                  </label>
                  <select
                    value={driveForm.jobField}
                    onChange={(e) => setDriveForm({ ...driveForm, jobField: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    {JOB_FIELDS.map((fld) => (
                      <option key={fld} value={fld}>{fld}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Type</label>
                  <select
                    value={driveForm.jobType}
                    onChange={(e) => setDriveForm({ ...driveForm, jobType: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship + PPO">Internship + PPO</option>
                    <option value="Internship (6 Months)">Internship (6 Months)</option>
                  </select>
                </div>
              </div>

              {/* Row 3: COURSE SELECTION (MULTI-SELECT INTERFACE) */}
              <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                      <GraduationCap className="w-4 h-4 text-[#D99A00]" />
                      Eligible Degree Courses (Multiple Selection) *
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Targeted notifications will ONLY be sent to students belonging to selected courses.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllCourses}
                      className="text-[11px] font-semibold text-[#D99A00] hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllCourses}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Available Courses Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {AVAILABLE_COURSES.map((course) => {
                    const isSelected = driveForm.eligibleCourses.includes(course);
                    return (
                      <button
                        key={course}
                        type="button"
                        onClick={() => handleToggleCourse(course)}
                        className={`flex items-start gap-2 p-2 rounded-lg text-left transition-all border ${
                          isSelected
                            ? 'bg-[#FFF8E6] border-[#D99A00] text-slate-900 shadow-2xs font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-[#D99A00] border-[#D99A00] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs leading-tight">{course}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom / Additional Course Input */}
                <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2">
                  <input
                    type="text"
                    value={customCourseInput}
                    onChange={(e) => setCustomCourseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomCourse();
                      }
                    }}
                    placeholder="Add other custom course/branch..."
                    className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomCourse}
                    className="!py-1.5 !text-xs"
                  >
                    Add Course
                  </Button>
                </div>

                {/* Selected Courses Summary */}
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {driveForm.eligibleCourses.length} course(s) selected:
                  </span>{' '}
                  {driveForm.eligibleCourses.length > 0 ? (
                    driveForm.eligibleCourses.join(', ')
                  ) : (
                    <span className="text-red-600 font-semibold">None selected (at least 1 required)</span>
                  )}
                </div>
              </div>

              {/* Row 4: Compensation & Cutoffs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CTC Package Display *</label>
                  <input
                    required
                    type="text"
                    value={driveForm.displayPackage}
                    onChange={(e) => setDriveForm({ ...driveForm, displayPackage: e.target.value })}
                    placeholder="e.g. ₹ 28.0 LPA (CTC)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={driveForm.minCgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={driveForm.maxBacklogs}
                    onChange={(e) => setDriveForm({ ...driveForm, maxBacklogs: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Skills */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={driveForm.requiredSkills}
                  onChange={(e) => setDriveForm({ ...driveForm, requiredSkills: e.target.value })}
                  placeholder="e.g. C++, Python, Data Structures, System Design"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              {/* Row 6: Schedule Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Drive Date *</label>
                  <input
                    required
                    type="date"
                    value={driveForm.driveDate}
                    onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Application Deadline (Date & Time) *</label>
                  <input
                    required
                    type="datetime-local"
                    value={driveForm.applicationDeadline}
                    onChange={(e) => setDriveForm({ ...driveForm, applicationDeadline: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Server automatically marks expired once this timestamp passes
                  </span>
                </div>
              </div>

              {/* Row 7: Venue & Evaluation Rounds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assessment Venue / Platform</label>
                  <input
                    type="text"
                    value={driveForm.venue}
                    onChange={(e) => setDriveForm({ ...driveForm, venue: e.target.value })}
                    placeholder="e.g. Auditorium 2 & Online HackerEarth"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Evaluation Rounds (Comma-separated)</label>
                  <input
                    type="text"
                    value={driveForm.evaluationRounds}
                    onChange={(e) => setDriveForm({ ...driveForm, evaluationRounds: e.target.value })}
                    placeholder="e.g. Online Test, Tech Interview 1, HR"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              {/* Row 8: Status Selector (When editing) */}
              {editingDriveId && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recruitment Drive Status</label>
                  <select
                    value={driveForm.status}
                    onChange={(e) => setDriveForm({ ...driveForm, status: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="Registration Open">Registration Open (Accepting Applications)</option>
                    <option value="Upcoming">Upcoming (Scheduled)</option>
                    <option value="In Progress">In Progress (Assessments Underway)</option>
                    <option value="Completed">Completed (Recruitment Concluded)</option>
                    <option value="Applications Closed">Applications Closed (Manual Close)</option>
                    <option value="Cancelled">Cancelled (Drive Withdrawn)</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddDriveModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting
                    ? (editingDriveId ? 'Updating...' : 'Scheduling...')
                    : (editingDriveId ? 'Save & Sync Notifications' : 'Confirm & Schedule Drive')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL PLACEMENT DRIVE */}
      {cancellingDrive && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setCancellingDrive(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-red-200 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setCancellingDrive(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cancel Recruitment Drive
                </h3>
                <p className="text-xs text-slate-500">
                  {cancellingDrive.companyName} &bull; {cancellingDrive.jobTitle}
                </p>
              </div>
            </div>

            <div className="p-3 my-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                Cancellation will notify all applicants
              </p>
              <p className="text-red-700 leading-relaxed">
                Cancelling this placement drive will immediately close applications and dispatch real-time cancellation alerts to all students who submitted applications for this opportunity.
              </p>
            </div>

            <form onSubmit={handleCancelDriveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Reason for Drive Cancellation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g. Corporate recruiter postponed hiring cycle to next quarter / hiring quota fulfilled."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setCancellingDrive(null)}
                  disabled={submitting}
                >
                  Go Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  className="!bg-red-600 hover:!bg-red-700 !text-white"
                  disabled={submitting}
                >
                  {submitting ? 'Cancelling...' : 'Confirm Drive Cancellation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER COMPANY */}
      {showAddCompanyModal && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddCompanyModal(false)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddCompanyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D99A00]" />
              Register Corporate Partner
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Add an enterprise recruiter or hiring organization.</p>

            <form onSubmit={handleCreateCompany} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name *</label>
                <input
                  required
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="e.g. NVIDIA India"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Industry Sector *</label>
                  <input
                    required
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    placeholder="e.g. Semiconductors & AI Hardware"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Tier</label>
                  <select
                    value={companyForm.tier}
                    onChange={(e) => setCompanyForm({ ...companyForm, tier: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
                    <option value="Tier 2 (Super Dream)">Tier 2 (Super Dream)</option>
                    <option value="Standard Corporate">Standard Corporate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={companyForm.contactEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                    placeholder="campus-hiring@company.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Office Location</label>
                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    placeholder="Bangalore / Hyderabad"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddCompanyModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Partner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
