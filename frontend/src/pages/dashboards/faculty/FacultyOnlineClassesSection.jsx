import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Link as LinkIcon,
  Copy,
  Check,
  Users,
  ExternalLink,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Edit3,
  Megaphone,
  Search,
  Filter,
  RefreshCw,
  X,
  Radio,
  Eye,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Globe,
  Share2,
  Layers,
  MessageSquare,
  ChevronRight,
  Info,
} from 'lucide-react';
import { onlineClassService } from '../../../services/api';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';

// Platform helpers
const getPlatformMeta = (platform) => {
  switch (platform) {
    case 'Google Meet':
      return {
        label: 'Google Meet',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: Video,
      };
    case 'Zoom':
      return {
        label: 'Zoom Meeting',
        bg: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
        icon: Video,
      };
    case 'Microsoft Teams':
      return {
        label: 'MS Teams',
        bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dot: 'bg-indigo-500',
        icon: Video,
      };
    case 'Custom Website':
    default:
      return {
        label: 'CampusVerse Live / External',
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        dot: 'bg-amber-500',
        icon: Globe,
      };
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Live Now':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 shadow-xs animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          Live Now
        </span>
      );
    case 'Upcoming':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Upcoming
        </span>
      );
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <CheckCircle2 className="w-3 h-3 text-slate-500" />
          Completed
        </span>
      );
    case 'Cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <X className="w-3 h-3 text-red-600" />
          Cancelled
        </span>
      );
    case 'Rescheduled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <CalendarDays className="w-3 h-3 text-purple-600" />
          Rescheduled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
};

const INITIAL_FORM = {
  title: '',
  subject: '',
  description: '',
  scheduledDate: new Date().toISOString().split('T')[0],
  startTime: '10:00',
  endTime: '11:00',
  meetingUrl: '',
  platform: 'Google Meet',
  passcode: '',
  semester: 7,
  departmentName: 'Computer Science & Engineering',
  courseName: 'B.Tech CSE',
  section: 'A',
  studentGroup: '',
  published: true,
  allowPastLinks: true,
};

export const FacultyOnlineClassesSection = ({ showToast }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit' | 'reschedule'
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancellation modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingClass, setCancellingClass] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Announcement modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementClass, setAnnouncementClass] = useState(null);
  const [announcementMessage, setAnnouncementMessage] = useState('');

  // Feedback copied
  const [copiedId, setCopiedId] = useState(null);

  // Load classes from API
  const loadClasses = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await onlineClassService.list({});
      if (res?.success) {
        setClasses(res.classes || []);
      }
    } catch (err) {
      if (showToast) showToast(err?.message || 'Failed to load online classes.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadClasses();
    // Refresh periodic status every 60 seconds
    const interval = setInterval(() => loadClasses(true), 60000);
    return () => clearInterval(interval);
  }, [loadClasses]);

  // Platform auto-detection on URL change
  const handleMeetingUrlChange = (val) => {
    let detected = 'Custom Website';
    const lower = val.toLowerCase();
    if (lower.includes('meet.google.com')) detected = 'Google Meet';
    else if (lower.includes('zoom.us')) detected = 'Zoom';
    else if (lower.includes('teams.microsoft.com') || lower.includes('teams.live.com')) detected = 'Microsoft Teams';

    setForm((prev) => ({
      ...prev,
      meetingUrl: val,
      platform: detected,
    }));

    if (formErrors.meetingUrl) {
      setFormErrors((prev) => ({ ...prev, meetingUrl: null }));
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setForm(INITIAL_FORM);
    setFormErrors({});
    setFormMode('create');
    setSelectedClassId(null);
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cls) => {
    setSelectedClassId(cls._id);
    setForm({
      title: cls.title || '',
      subject: cls.subject || '',
      description: cls.description || '',
      scheduledDate: cls.scheduledDate ? new Date(cls.scheduledDate).toISOString().split('T')[0] : '',
      startTime: cls.startTime || '10:00',
      endTime: cls.endTime || '11:00',
      meetingUrl: cls.meetingUrl || '',
      platform: cls.platform || 'Custom Website',
      passcode: cls.passcode || '',
      semester: cls.semester ?? 7,
      departmentName: cls.departmentName || 'Computer Science & Engineering',
      courseName: cls.courseName || 'B.Tech CSE',
      section: cls.section || 'A',
      studentGroup: cls.studentGroup || '',
      published: cls.published !== false,
      allowPastLinks: cls.allowPastLinks !== false,
    });
    setFormErrors({});
    setFormMode('edit');
    setFormModalOpen(true);
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (cls) => {
    handleOpenEdit(cls);
    setFormMode('reschedule');
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Class title is required.';
    if (!form.subject.trim()) errors.subject = 'Subject name is required.';
    if (!form.scheduledDate) errors.scheduledDate = 'Date is required.';
    if (!form.startTime) errors.startTime = 'Start time is required.';
    if (!form.endTime) errors.endTime = 'End time is required.';
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      errors.endTime = 'End time must be later than start time.';
    }
    if (!form.meetingUrl.trim()) {
      errors.meetingUrl = 'Meeting URL is required.';
    } else {
      try {
        const u = new URL(form.meetingUrl.trim());
        if (u.protocol !== 'https:' && u.protocol !== 'http:') {
          errors.meetingUrl = 'Meeting URL must begin with https://';
        }
      } catch {
        errors.meetingUrl = 'Please enter a valid URL (e.g. https://meet.google.com/xyz)';
      }
    }
    return errors;
  };

  // Submit create / edit / reschedule
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      if (formMode === 'create') {
        const res = await onlineClassService.create(form);
        if (res?.success) {
          showToast?.('Online class scheduled and published successfully!');
          setFormModalOpen(false);
          loadClasses();
        }
      } else {
        const res = await onlineClassService.update(selectedClassId, form);
        if (res?.success) {
          showToast?.(formMode === 'reschedule' ? 'Class rescheduled and students notified!' : 'Online class updated successfully!');
          setFormModalOpen(false);
          loadClasses();
        }
      }
    } catch (err) {
      showToast?.(err?.message || 'Failed to save online class.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancellation handlers
  const handleOpenCancel = (cls) => {
    setCancellingClass(cls);
    setCancellationReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingClass) return;
    setIsSubmitting(true);
    try {
      const res = await onlineClassService.cancel(cancellingClass._id, {
        cancellationReason: cancellationReason.trim() || 'Class cancelled by faculty.',
      });
      if (res?.success) {
        showToast?.('Class cancelled and enrolled students have been notified.');
        setCancelModalOpen(false);
        setCancellingClass(null);
        loadClasses();
      }
    } catch (err) {
      showToast?.(err?.message || 'Failed to cancel class.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Announcement handlers
  const handleOpenAnnouncement = (cls) => {
    setAnnouncementClass(cls);
    setAnnouncementMessage('');
    setAnnouncementModalOpen(true);
  };

  const handleSendAnnouncement = async () => {
    if (!announcementClass || !announcementMessage.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await onlineClassService.addAnnouncement(announcementClass._id, {
        message: announcementMessage.trim(),
      });
      if (res?.success) {
        showToast?.('Announcement broadcasted to enrolled students.');
        setAnnouncementModalOpen(false);
        setAnnouncementClass(null);
        loadClasses();
      }
    } catch (err) {
      showToast?.(err?.message || 'Failed to send announcement.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete class
  const handleDeleteClass = async (cls) => {
    if (!window.confirm(`Are you sure you want to delete "${cls.title}"? This cannot be undone.`)) return;
    try {
      const res = await onlineClassService.delete(cls._id);
      if (res?.success) {
        showToast?.('Online class deleted.');
        loadClasses();
      }
    } catch (err) {
      showToast?.(err?.message || 'Failed to delete class.', 'error');
    }
  };

  // Copy link
  const handleCopyLink = (cls) => {
    if (!cls?.meetingUrl) return;
    navigator.clipboard.writeText(cls.meetingUrl);
    setCopiedId(cls._id);
    showToast?.('Meeting link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      // Tab filter
      const status = (cls.computedStatus || cls.status || '').toLowerCase();
      if (activeTab === 'live' && status !== 'live now') return false;
      if (activeTab === 'upcoming' && status !== 'upcoming' && status !== 'rescheduled') return false;
      if (activeTab === 'completed' && status !== 'completed') return false;
      if (activeTab === 'cancelled' && status !== 'cancelled') return false;

      // Semester filter
      if (semesterFilter !== 'all' && Number(cls.semester) !== Number(semesterFilter)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (cls.title || '').toLowerCase().includes(q);
        const matchSub = (cls.subject || '').toLowerCase().includes(q);
        const matchDesc = (cls.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchDesc) return false;
      }
      return true;
    });
  }, [classes, activeTab, semesterFilter, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const counts = { all: classes.length, live: 0, upcoming: 0, completed: 0, cancelled: 0 };
    classes.forEach((cls) => {
      const s = (cls.computedStatus || cls.status || '').toLowerCase();
      if (s === 'live now') counts.live++;
      else if (s === 'upcoming' || s === 'rescheduled') counts.upcoming++;
      else if (s === 'completed') counts.completed++;
      else if (s === 'cancelled') counts.cancelled++;
    });
    return counts;
  }, [classes]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#FFFDF5] border border-[#F1E7CF] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#FFF8E6] text-[#D97706] border border-[#FDE68A]">
              <Video className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-[#111827]">Virtual Classrooms & Scheduling</h2>
              <p className="text-xs text-[#64748B] font-medium">
                Host live lectures via Google Meet, Zoom, MS Teams, or your custom video platform.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => loadClasses(true)}
            disabled={refreshing || loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
            className="shadow-sm"
          >
            Schedule Online Class
          </Button>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#F1E7CF] shadow-2xs">
          {[
            { id: 'all', label: 'All Classes', count: tabCounts.all },
            { id: 'live', label: 'Live Now', count: tabCounts.live, isLive: true },
            { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
            { id: 'completed', label: 'Completed', count: tabCounts.completed },
            { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#111827] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-[#FFF8E6]/60'
                }`}
              >
                {tab.isLive && tab.count > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-[#475569]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Semester Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject or title..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F1E7CF] bg-white text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00]/20"
            />
          </div>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#F1E7CF] bg-white text-xs font-bold text-[#111827] focus:outline-none focus:border-[#D99A00]"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-56 rounded-3xl bg-[#FFF8E6]/20 border border-[#F1E7CF] animate-pulse" />
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#F1E7CF] shadow-xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FFF8E6] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-[#111827]">No online classes found</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto font-medium">
            {searchQuery || semesterFilter !== 'all' || activeTab !== 'all'
              ? 'No classes match the chosen filters. Try clearing your search or switching tabs.'
              : 'You have not scheduled any online classes yet. Click "Schedule Online Class" above to set up your first virtual lecture.'}
          </p>
          {(searchQuery || semesterFilter !== 'all' || activeTab !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSemesterFilter('all');
                setActiveTab('all');
              }}
              className="text-xs font-bold text-[#D97706] hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClasses.map((cls) => {
            const platformMeta = getPlatformMeta(cls.platform);
            const PlatformIcon = platformMeta.icon;
            const status = cls.computedStatus || cls.status;
            const isLive = status === 'Live Now';
            const isCancelled = status === 'Cancelled';
            const isCompleted = status === 'Completed';

            return (
              <div
                key={cls._id}
                className={`relative rounded-3xl border bg-white p-5 shadow-xs transition-all duration-300 flex flex-col justify-between hover:shadow-md ${
                  isLive
                    ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/10'
                    : isCancelled
                    ? 'border-slate-200 bg-slate-50/50 opacity-80'
                    : 'border-[#F1E7CF] hover:border-[#D99A00]'
                }`}
              >
                {/* Header row: Platform + Status + Academic cohort */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${platformMeta.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${platformMeta.dot}`} />
                        <PlatformIcon className="w-3 h-3" />
                        {cls.platform || 'Custom Meeting'}
                      </span>
                      {getStatusBadge(status)}
                    </div>
                    <span className="text-[11px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-lg font-mono">
                      Sem {cls.semester} • {cls.section ? `Sec ${cls.section}` : 'All Sections'}
                    </span>
                  </div>

                  {/* Subject and Title */}
                  <div className="mt-3">
                    <p className="text-xs font-bold text-[#D97706] uppercase tracking-wide">
                      {cls.subject}
                    </p>
                    <h3 className="text-base font-black text-[#111827] mt-0.5 line-clamp-1">
                      {cls.title}
                    </h3>
                    {cls.description && (
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2 font-medium leading-relaxed">
                        {cls.description}
                      </p>
                    )}
                  </div>

                  {/* Date, Time & Passcode */}
                  <div className="mt-3.5 p-3 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[#111827]">
                      <span className="inline-flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
                        {new Date(cls.scheduledDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-mono font-bold text-[#D97706]">
                        <Clock className="w-3.5 h-3.5" />
                        {cls.startTime} - {cls.endTime}
                      </span>
                    </div>
                    {cls.departmentName && (
                      <div className="text-[11px] text-[#64748B] font-medium">
                        Dept: <span className="font-semibold text-[#111827]">{cls.departmentName}</span>
                      </div>
                    )}
                    {cls.passcode && (
                      <div className="text-[11px] text-[#64748B] font-medium flex items-center justify-between">
                        <span>Meeting Passcode:</span>
                        <code className="px-1.5 py-0.5 rounded bg-white border border-[#F1E7CF] font-mono font-bold text-[#111827]">
                          {cls.passcode}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Cancellation Reason alert if cancelled */}
                  {isCancelled && cls.cancellationReason && (
                    <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Cancellation Notice:
                      </p>
                      <p className="mt-0.5 font-medium">{cls.cancellationReason}</p>
                    </div>
                  )}

                  {/* Rescheduled From alert */}
                  {cls.rescheduledFrom?.date && (
                    <div className="mt-3 p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 font-medium">
                      <span className="font-bold">Rescheduled from: </span>
                      {new Date(cls.rescheduledFrom.date).toLocaleDateString('en-IN')} (
                      {cls.rescheduledFrom.startTime} - {cls.rescheduledFrom.endTime})
                    </div>
                  )}

                  {/* Latest Announcements */}
                  {cls.announcements && cls.announcements.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-[#111827] flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-[#D97706]" />
                        Announcements ({cls.announcements.length}):
                      </p>
                      <div className="max-h-24 overflow-y-auto space-y-1 text-xs">
                        {cls.announcements.slice(-2).map((a, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#475569] text-[11px]"
                          >
                            <p className="font-medium">{a.message}</p>
                            <span className="text-[9px] text-slate-400">
                              {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-[#F1E7CF] space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Join Class button */}
                    <a
                      href={cls.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant={isLive ? 'primary' : 'secondary'}
                        size="sm"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        className="w-full justify-center !text-xs font-black shadow-xs"
                        disabled={isCancelled}
                      >
                        {isLive ? 'Join Live Class Now' : 'Open Meeting Link'}
                      </Button>
                    </a>

                    {/* Copy Link Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopyLink(cls)}
                      className="!px-2.5"
                      title="Copy meeting link"
                    >
                      {copiedId === cls._id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </Button>
                  </div>

                  {/* Secondary Faculty Operations */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAnnouncement(cls)}
                        className="px-2 py-1 rounded-lg text-slate-600 hover:text-[#111827] hover:bg-[#FFF8E6] font-semibold text-[11px] transition-colors flex items-center gap-1"
                      >
                        <Megaphone className="w-3 h-3 text-[#D97706]" />
                        Announce
                      </button>

                      {!isCancelled && !isCompleted && (
                        <button
                          onClick={() => handleOpenReschedule(cls)}
                          className="px-2 py-1 rounded-lg text-slate-600 hover:text-[#111827] hover:bg-[#FFF8E6] font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <CalendarDays className="w-3 h-3" />
                          Reschedule
                        </button>
                      )}

                      {!isCancelled && !isCompleted && (
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="px-2 py-1 rounded-lg text-slate-600 hover:text-[#111827] hover:bg-[#FFF8E6] font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!isCancelled && !isCompleted && (
                        <button
                          onClick={() => handleOpenCancel(cls)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-[11px] transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClass(cls)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT / RESCHEDULE MODAL */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={
          formMode === 'create'
            ? 'Schedule New Online Class'
            : formMode === 'reschedule'
            ? 'Reschedule Online Class'
            : 'Edit Online Class'
        }
        subtitle={
          formMode === 'create'
            ? 'Broadcast live lecture links to enrolled students across target course and semester'
            : 'Update class timing or meeting details (enrolled students will receive real-time notifications)'
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          {/* Title & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Class Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Distributed Consensus in Blockchain"
                className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]/20 ${
                  formErrors.title ? 'border-red-400 bg-red-50/20' : 'border-[#F1E7CF] focus:border-[#D99A00]'
                }`}
              />
              {formErrors.title && <p className="text-[11px] text-red-500 mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Artificial Intelligence"
                className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]/20 ${
                  formErrors.subject ? 'border-red-400 bg-red-50/20' : 'border-[#F1E7CF] focus:border-[#D99A00]'
                }`}
              />
              {formErrors.subject && <p className="text-[11px] text-red-500 mt-1">{formErrors.subject}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              Class Description / Agenda
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Lecture topics, prerequisites, reference links..."
              className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-2 focus:ring-[#D99A00]/20"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Date *
              </label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] focus:outline-none ${
                  formErrors.scheduledDate ? 'border-red-400' : 'border-[#F1E7CF] focus:border-[#D99A00]'
                }`}
              />
              {formErrors.scheduledDate && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.scheduledDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Start Time (24h) *
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
              />
              {formErrors.startTime && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                End Time (24h) *
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] focus:outline-none ${
                  formErrors.endTime ? 'border-red-400' : 'border-[#F1E7CF] focus:border-[#D99A00]'
                }`}
              />
              {formErrors.endTime && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.endTime}</p>
              )}
            </div>
          </div>

          {/* Meeting URL + Auto-detected Platform Badge */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#111827]">
                Online Meeting URL *
              </label>
              <span className="text-[11px] font-semibold text-[#D97706]">
                Detected: {form.platform}
              </span>
            </div>
            <input
              type="url"
              value={form.meetingUrl}
              onChange={(e) => handleMeetingUrlChange(e.target.value)}
              placeholder="https://meet.google.com/xyz or https://your-class-website.com/room/123"
              className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] focus:outline-none font-mono ${
                formErrors.meetingUrl ? 'border-red-400 bg-red-50/20' : 'border-[#F1E7CF] focus:border-[#D99A00]'
              }`}
            />
            {formErrors.meetingUrl && (
              <p className="text-[11px] text-red-500">{formErrors.meetingUrl}</p>
            )}
            <p className="text-[10px] text-[#64748B]">
              Supports Google Meet, Zoom, MS Teams, and your own online class website.
            </p>
          </div>

          {/* Passcode & Platform Override */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Platform Identifier
              </label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Custom Website">Custom Website / CampusVerse Live</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Passcode / Access PIN (Optional)
              </label>
              <input
                type="text"
                value={form.passcode}
                onChange={(e) => setForm({ ...form, passcode: e.target.value })}
                placeholder="e.g. AI-2026"
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] font-mono focus:outline-none focus:border-[#D99A00]"
              />
            </div>
          </div>

          {/* Target Cohort: Semester, Department, Section */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-[#111827] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D97706]" />
              Target Student Cohort
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Semester *
                </label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={form.departmentName}
                  onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Section / Group (Optional)
                </label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  placeholder="e.g. A or All"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
                />
              </div>
            </div>
          </div>

          {/* Options & Visibility Checkboxes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-[#F1E7CF] text-[#D97706] focus:ring-[#D99A00]"
              />
              Publish immediately to student portals
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowPastLinks}
                onChange={(e) => setForm({ ...form, allowPastLinks: e.target.checked })}
                className="rounded border-[#F1E7CF] text-[#D97706] focus:ring-[#D99A00]"
              />
              Allow meeting link access after class ends
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F1E7CF]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="font-black"
            >
              {isSubmitting
                ? 'Saving...'
                : formMode === 'create'
                ? 'Schedule & Broadcast'
                : formMode === 'reschedule'
                ? 'Save Rescheduled Time'
                : 'Update Class Details'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CANCELLATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Online Class"
        subtitle="Enrolled students will be immediately notified about the cancellation."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <p className="font-bold">
              Class: {cancellingClass?.subject} — "{cancellingClass?.title}"
            </p>
            <p>
              Scheduled for:{' '}
              {cancellingClass?.scheduledDate &&
                new Date(cancellingClass.scheduledDate).toLocaleDateString('en-IN')}{' '}
              at {cancellingClass?.startTime}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              Reason for Cancellation (Shown to students)
            </label>
            <textarea
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Faculty medical leave / Urgent departmental meeting. Rescheduled lecture will be posted shortly."
              className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1E7CF]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={isSubmitting}
            >
              Keep Class
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Post Class Announcement"
        subtitle="Broadcast notes, preparation materials, or last-minute instructions to enrolled students."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs">
            <span className="font-bold text-[#D97706]">Target Class:</span>{' '}
            <span className="font-semibold text-[#111827]">
              {announcementClass?.subject} — "{announcementClass?.title}"
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              Announcement Message *
            </label>
            <textarea
              rows={4}
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
              placeholder="e.g. Please review Chapter 4 slides before joining. The live lab environment has been prepared."
              className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F1E7CF]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAnnouncementModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendAnnouncement}
              disabled={isSubmitting || !announcementMessage.trim()}
              className="font-bold"
            >
              {isSubmitting ? 'Broadcasting...' : 'Broadcast Announcement'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyOnlineClassesSection;
