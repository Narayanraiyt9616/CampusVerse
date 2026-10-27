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
  RefreshCw,
  X,
  CheckCircle2,
  CalendarDays,
  Globe,
  Share2,
  Info,
  Settings,
  Zap,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
  Key,
  Hash,
  BookmarkCheck,
} from 'lucide-react';
import { onlineClassService } from '../../../services/api';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import {
  getMeetingPlatformUrl,
  setMeetingPlatformUrl,
  resetMeetingPlatformUrl,
  openExternalMeetingPlatform,
  validateMeetingUrl,
  DEFAULT_FALLBACK_URL,
} from '../../../utils/meetingConfig';

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

const getStatusBadge = (cls) => {
  if (cls.published === false) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
        <Bookmark className="w-3 h-3 text-slate-500" />
        Draft
      </span>
    );
  }

  const status = cls.computedStatus || cls.status;
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

const padZero = (n) => String(n).padStart(2, '0');

const getNowTimeStrings = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = padZero(now.getMonth() + 1);
  const day = padZero(now.getDate());
  const dateStr = `${year}-${month}-${day}`;
  const startH = padZero(now.getHours());
  const startM = padZero(now.getMinutes());
  const startTime = `${startH}:${startM}`;
  const endH = padZero((now.getHours() + 1) % 24);
  const endTime = `${endH}:${startM}`;
  return { dateStr, startTime, endTime };
};

const INITIAL_FORM = {
  title: '',
  subject: '',
  description: '',
  instructions: '',
  scheduledDate: new Date().toISOString().split('T')[0],
  startTime: '10:00',
  endTime: '11:00',
  meetingUrl: '',
  meetingCode: '',
  platform: 'Google Meet',
  passcode: '',
  semester: 7,
  departmentName: 'Computer Science & Engineering',
  courseName: 'B.Tech CSE',
  section: 'A',
  studentGroup: '',
  published: true,
  allowPastLinks: true,
  isImmediate: false,
};

export const FacultyOnlineClassesSection = ({ showToast }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');

  // Configurable external meeting website
  const [platformUrl, setPlatformUrl] = useState(getMeetingPlatformUrl());
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editUrlInput, setEditUrlInput] = useState('');
  const [configUrlError, setConfigUrlError] = useState('');

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit' | 'reschedule'
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitError, setFormSubmitError] = useState('');
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
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedLinkId, setCopiedLinkId] = useState(null);

  // Saved Meeting Links state
  const [savedLinks, setSavedLinks] = useState([]);
  const [savedLinksLoading, setSavedLinksLoading] = useState(false);
  const [savedLinksSearch, setSavedLinksSearch] = useState('');
  const [savedLinksExpanded, setSavedLinksExpanded] = useState(true);

  // Save / Edit Link Modal
  const [saveLinkModalOpen, setSaveLinkModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [linkForm, setLinkForm] = useState({
    name: '',
    meetingUrl: '',
    meetingCode: '',
    platform: 'Google Meet',
    passcode: '',
    description: '',
  });
  const [linkFormErrors, setLinkFormErrors] = useState({});
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Delete Link Confirmation Modal
  const [deleteLinkModalOpen, setDeleteLinkModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [isDeletingLink, setIsDeletingLink] = useState(false);

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

  // Load saved meeting links permanently from MongoDB
  const loadSavedLinks = useCallback(async () => {
    setSavedLinksLoading(true);
    try {
      const res = await onlineClassService.getSavedLinks();
      if (res?.success) {
        setSavedLinks(res.savedLinks || []);
      }
    } catch (err) {
      console.error('Failed to load saved links:', err);
    } finally {
      setSavedLinksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
    loadSavedLinks();
    setPlatformUrl(getMeetingPlatformUrl());
    const interval = setInterval(() => {
      loadClasses(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [loadClasses, loadSavedLinks]);

  // Platform auto-detection on URL change
  const handleMeetingUrlChange = (val) => {
    let detected = form.platform || 'Custom Website';
    const lower = val.toLowerCase();
    if (lower.includes('meet.google.com')) detected = 'Google Meet';
    else if (lower.includes('zoom.us')) detected = 'Zoom';
    else if (lower.includes('teams.microsoft.com') || lower.includes('teams.live.com')) detected = 'Microsoft Teams';

    setForm((prev) => ({
      ...prev,
      meetingUrl: val,
      platform: detected,
    }));

    if (formErrors.meetingUrl || formErrors.joiningMethod) {
      setFormErrors((prev) => ({ ...prev, meetingUrl: null, joiningMethod: null }));
    }
  };

  const handleMeetingCodeChange = (val) => {
    setForm((prev) => ({ ...prev, meetingCode: val }));
    if (formErrors.joiningMethod) {
      setFormErrors((prev) => ({ ...prev, joiningMethod: null }));
    }
  };

  // Launch external meeting platform
  const handleLaunchMeetingPlatform = () => {
    const res = openExternalMeetingPlatform();
    if (res.success) {
      showToast?.('External meeting platform opened in a new tab.');
    } else {
      showToast?.(res.message || 'Could not launch meeting platform.', 'error');
    }
  };

  // Open Platform URL Config Modal
  const handleOpenConfigModal = () => {
    setEditUrlInput(platformUrl);
    setConfigUrlError('');
    setConfigModalOpen(true);
  };

  const handleSavePlatformUrl = (e) => {
    e.preventDefault();
    const val = validateMeetingUrl(editUrlInput);
    if (!val.isValid) {
      setConfigUrlError(val.error);
      return;
    }
    setMeetingPlatformUrl(val.url);
    setPlatformUrl(val.url);
    setConfigModalOpen(false);
    showToast?.('Meeting platform URL updated successfully.');
  };

  const handleResetPlatformUrl = () => {
    const defaultUrl = resetMeetingPlatformUrl();
    setPlatformUrl(defaultUrl);
    setEditUrlInput(defaultUrl);
    setConfigUrlError('');
    showToast?.('Meeting platform URL reset to default.');
  };

  // Saved Meeting Link: URL change with auto platform detection
  const handleLinkFormUrlChange = (val) => {
    let detected = linkForm.platform || 'Google Meet';
    const lower = val.toLowerCase();
    if (lower.includes('meet.google.com')) detected = 'Google Meet';
    else if (lower.includes('zoom.us')) detected = 'Zoom';
    else if (lower.includes('teams.microsoft.com') || lower.includes('teams.live.com')) detected = 'Microsoft Teams';
    else if (lower.includes('versemeet')) detected = 'CampusVerse Live';

    setLinkForm((prev) => ({
      ...prev,
      meetingUrl: val,
      platform: detected,
    }));
    if (linkFormErrors.meetingUrl) {
      setLinkFormErrors((prev) => ({ ...prev, meetingUrl: null }));
    }
  };

  // Open Save/Edit Modal for meeting links
  const handleOpenSaveLinkModal = (prefill = null) => {
    if (prefill) {
      setEditingLinkId(prefill._id || null);
      setLinkForm({
        name: prefill.name || '',
        meetingUrl: prefill.meetingUrl || '',
        meetingCode: prefill.meetingCode || '',
        platform: prefill.platform || 'Google Meet',
        passcode: prefill.passcode || '',
        description: prefill.description || '',
      });
    } else {
      setEditingLinkId(null);
      setLinkForm({
        name: '',
        meetingUrl: '',
        meetingCode: '',
        platform: 'Google Meet',
        passcode: '',
        description: '',
      });
    }
    setLinkFormErrors({});
    setSaveLinkModalOpen(true);
  };

  // Quick Generate Room and open Save Modal
  const handleGenerateAndSaveRoom = () => {
    const randomCode = Math.random().toString(36).substring(2, 8);
    const cleanPlatform = (platformUrl || DEFAULT_FALLBACK_URL).replace(/\/$/, '');
    const generatedUrl = `${cleanPlatform}/room-${randomCode}`;
    setEditingLinkId(null);
    setLinkForm({
      name: `CampusVerse Live (${randomCode.toUpperCase()})`,
      meetingUrl: generatedUrl,
      meetingCode: `room-${randomCode}`,
      platform: 'CampusVerse Live',
      passcode: '',
      description: 'Persistent live lecture room.',
    });
    setLinkFormErrors({});
    setSaveLinkModalOpen(true);
  };

  // Submit Save / Update Saved Meeting Link
  const handleSaveLinkSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = {};
    if (!linkForm.name.trim()) errors.name = 'Please provide a custom name for this link.';
    if (!linkForm.meetingUrl.trim()) {
      errors.meetingUrl = 'Meeting URL is required.';
    } else {
      let testUrl = linkForm.meetingUrl.trim();
      if (!/^https?:\/\//i.test(testUrl)) testUrl = `https://${testUrl}`;
      try {
        const u = new URL(testUrl);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') {
          errors.meetingUrl = 'URL must start with https://';
        }
      } catch {
        errors.meetingUrl = 'Please enter a valid URL (e.g. https://meet.google.com/xyz)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setLinkFormErrors(errors);
      return;
    }

    setIsSavingLink(true);
    let normalizedUrl = linkForm.meetingUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`;

    const payload = {
      ...linkForm,
      meetingUrl: normalizedUrl,
    };

    try {
      if (editingLinkId) {
        const res = await onlineClassService.updateSavedLink(editingLinkId, payload);
        if (res?.success) {
          showToast?.(`Meeting link "${linkForm.name}" updated successfully!`);
          setSaveLinkModalOpen(false);
          await loadSavedLinks();
        } else {
          showToast?.(res?.error || 'Failed to update link.', 'error');
        }
      } else {
        const res = await onlineClassService.saveLink(payload);
        if (res?.success) {
          showToast?.(`Meeting link "${linkForm.name}" saved permanently!`);
          setSaveLinkModalOpen(false);
          await loadSavedLinks();
        } else {
          showToast?.(res?.error || 'Failed to save meeting link.', 'error');
        }
      }
    } catch (err) {
      showToast?.(err?.message || 'Failed to save meeting link.', 'error');
    } finally {
      setIsSavingLink(false);
    }
  };

  // Copy Saved Link to clipboard
  const handleCopySavedLink = (link) => {
    if (!link?.meetingUrl) return;
    navigator.clipboard.writeText(link.meetingUrl);
    setCopiedLinkId(link._id);
    showToast?.(`Meeting link "${link.name}" copied to clipboard!`);
    setTimeout(() => setCopiedLinkId(null), 2500);
  };

  // Open Saved Meeting in new tab
  const handleOpenSavedMeeting = (link) => {
    if (!link?.meetingUrl) return;
    window.open(link.meetingUrl, '_blank', 'noopener,noreferrer');
    showToast?.(`Opening "${link.name}"...`);
  };

  // Open delete confirmation modal
  const handleOpenDeleteLink = (link) => {
    setLinkToDelete(link);
    setDeleteLinkModalOpen(true);
  };

  // Confirm delete link
  const handleConfirmDeleteLink = async () => {
    if (!linkToDelete) return;
    setIsDeletingLink(true);
    try {
      const res = await onlineClassService.deleteSavedLink(linkToDelete._id);
      if (res?.success) {
        showToast?.(`Saved link "${linkToDelete.name}" deleted.`);
        setSavedLinks((prev) => prev.filter((l) => l._id !== linkToDelete._id));
        setDeleteLinkModalOpen(false);
        setLinkToDelete(null);
      } else {
        showToast?.(res?.error || 'Failed to delete saved link.', 'error');
      }
    } catch (err) {
      showToast?.(err?.message || 'Failed to delete saved link.', 'error');
    } finally {
      setIsDeletingLink(false);
    }
  };

  // Reuse Saved Link anytime in class scheduler
  const handleReuseSavedLink = (link) => {
    const { dateStr, startTime, endTime } = getNowTimeStrings();
    setForm((prev) => ({
      ...prev,
      title: prev.title || `${link.name}`,
      scheduledDate: dateStr,
      startTime,
      endTime,
      meetingUrl: link.meetingUrl,
      meetingCode: link.meetingCode || '',
      platform: link.platform || 'Google Meet',
      passcode: link.passcode || '',
      isImmediate: true,
      published: true,
    }));
    setFormErrors({});
    setFormSubmitError('');
    setFormMode('create');
    setSelectedClassId(null);
    setFormModalOpen(true);
    showToast?.(`Reusing saved link "${link.name}". Ready to share with students!`);
  };

  // Filtered saved links
  const filteredSavedLinks = useMemo(() => {
    if (!savedLinksSearch.trim()) return savedLinks;
    const q = savedLinksSearch.toLowerCase();
    return savedLinks.filter(
      (l) =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.meetingUrl || '').toLowerCase().includes(q) ||
        (l.meetingCode || '').toLowerCase().includes(q) ||
        (l.platform || '').toLowerCase().includes(q)
    );
  }, [savedLinks, savedLinksSearch]);

  // Open Immediate Live Class Modal (Start Class Immediately)
  const handleOpenImmediateLive = () => {
    const { dateStr, startTime, endTime } = getNowTimeStrings();
    setForm({
      ...INITIAL_FORM,
      scheduledDate: dateStr,
      startTime,
      endTime,
      isImmediate: true,
      published: true,
    });
    setFormErrors({});
    setFormSubmitError('');
    setFormMode('create');
    setSelectedClassId(null);
    setFormModalOpen(true);
  };

  // Alias for opening create modal
  const handleOpenCreate = handleOpenImmediateLive;

  // Open Edit Modal
  const handleOpenEdit = (cls) => {
    setSelectedClassId(cls._id);
    setForm({
      title: cls.title || '',
      subject: cls.subject || '',
      description: cls.description || '',
      instructions: cls.instructions || '',
      scheduledDate: cls.scheduledDate ? new Date(cls.scheduledDate).toISOString().split('T')[0] : '',
      startTime: cls.startTime || '10:00',
      endTime: cls.endTime || '11:00',
      meetingUrl: cls.meetingUrl || '',
      meetingCode: cls.meetingCode || '',
      platform: cls.platform || 'Custom Website',
      passcode: cls.passcode || '',
      semester: cls.semester ?? 7,
      departmentName: cls.departmentName || 'Computer Science & Engineering',
      courseName: cls.courseName || 'B.Tech CSE',
      section: cls.section || 'A',
      studentGroup: cls.studentGroup || '',
      published: cls.published !== false,
      allowPastLinks: cls.allowPastLinks !== false,
      isImmediate: false,
    });
    setFormErrors({});
    setFormSubmitError('');
    setFormMode('edit');
    setFormModalOpen(true);
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (cls) => {
    handleOpenEdit(cls);
    setFormMode('reschedule');
  };

  // Validate form
  const validateForm = (willPublish) => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Class title is required.';
    if (!form.subject.trim()) errors.subject = 'Subject name is required.';
    if (!form.scheduledDate) errors.scheduledDate = 'Date is required.';
    if (!form.startTime) errors.startTime = 'Start time is required.';

    if (form.startTime && form.endTime) {
      const [sh, sm] = form.startTime.split(':').map(Number);
      const [eh, em] = form.endTime.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        const startMins = sh * 60 + sm;
        const endMins = eh * 60 + em;
        if (endMins <= startMins && !form.isImmediate) {
          errors.endTime = 'End time must be later than start time.';
        }
      }
    }

    const rawUrl = (form.meetingUrl || '').trim();
    const hasCode = Boolean(form.meetingCode && form.meetingCode.trim());
    const hasUrl = Boolean(rawUrl);

    if (willPublish) {
      if (!hasUrl && !hasCode) {
        errors.joiningMethod = 'Please provide at least one valid joining method (Meeting URL or Meeting Code) before sharing with students.';
      }
    }

    if (hasUrl) {
      const testUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
      try {
        const u = new URL(testUrl);
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
  const handleSubmitForm = async (publishIntent) => {
    if (isSubmitting) return;

    setFormSubmitError('');
    const willPublish = publishIntent === 'publish';
    const errors = validateForm(willPublish);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorMessage =
        errors.joiningMethod ||
        errors.title ||
        errors.subject ||
        errors.scheduledDate ||
        errors.startTime ||
        errors.endTime ||
        errors.meetingUrl ||
        Object.values(errors)[0];
      setFormSubmitError(firstErrorMessage);
      showToast?.(firstErrorMessage, 'error');
      return;
    }

    setIsSubmitting(true);
    let normalizedUrl = (form.meetingUrl || '').trim();
    if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    const payload = {
      ...form,
      meetingUrl: normalizedUrl,
      published: willPublish,
    };

    try {
      if (formMode === 'create') {
        const res = await onlineClassService.create(payload);
        if (res && (res.success || res.class || res._id)) {
          showToast?.(
            willPublish
              ? 'Online class scheduled and shared with students!'
              : 'Online class saved as draft.'
          );
          setFormModalOpen(false);
          setForm(INITIAL_FORM);
          setFormErrors({});
          setFormSubmitError('');
          await loadClasses();
        } else {
          const errMsg = res?.error || res?.message || 'Failed to save online class. Please check all details.';
          setFormSubmitError(errMsg);
          showToast?.(errMsg, 'error');
        }
      } else {
        const res = await onlineClassService.update(selectedClassId, payload);
        if (res && (res.success || res.class || res._id)) {
          showToast?.(
            formMode === 'reschedule'
              ? 'Class rescheduled and students notified!'
              : 'Online class updated successfully!'
          );
          setFormModalOpen(false);
          setForm(INITIAL_FORM);
          setFormErrors({});
          setFormSubmitError('');
          await loadClasses();
        } else {
          const errMsg = res?.error || res?.message || 'Failed to update online class.';
          setFormSubmitError(errMsg);
          showToast?.(errMsg, 'error');
        }
      }
    } catch (err) {
      const errMsg = err?.message || err?.error || 'Failed to save online class. Please check your network and try again.';
      setFormSubmitError(errMsg);
      showToast?.(errMsg, 'error');
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

  // Copy meeting URL
  const handleCopyLink = (cls) => {
    if (!cls?.meetingUrl) return;
    navigator.clipboard.writeText(cls.meetingUrl);
    setCopiedId(cls._id);
    showToast?.('Meeting link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy meeting code
  const handleCopyCode = (cls) => {
    if (!cls?.meetingCode) return;
    navigator.clipboard.writeText(cls.meetingCode);
    setCopiedCodeId(cls._id);
    showToast?.(`Meeting code (${cls.meetingCode}) copied!`);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      // Tab filter
      const isDraft = cls.published === false;
      const status = (cls.computedStatus || cls.status || '').toLowerCase();

      if (activeTab === 'drafts' && !isDraft) return false;
      if (activeTab === 'live' && (isDraft || status !== 'live now')) return false;
      if (activeTab === 'upcoming' && (isDraft || (status !== 'upcoming' && status !== 'rescheduled'))) return false;
      if (activeTab === 'completed' && (isDraft || status !== 'completed')) return false;
      if (activeTab === 'cancelled' && (isDraft || status !== 'cancelled')) return false;

      // Semester filter
      if (semesterFilter !== 'all' && Number(cls.semester) !== Number(semesterFilter)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (cls.title || '').toLowerCase().includes(q);
        const matchSub = (cls.subject || '').toLowerCase().includes(q);
        const matchDesc = (cls.description || '').toLowerCase().includes(q);
        const matchCode = (cls.meetingCode || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchDesc && !matchCode) return false;
      }
      return true;
    });
  }, [classes, activeTab, semesterFilter, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const counts = { all: classes.length, live: 0, upcoming: 0, drafts: 0, completed: 0, cancelled: 0 };
    classes.forEach((cls) => {
      if (cls.published === false) {
        counts.drafts++;
        return;
      }
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
      {/* ─────────────────────────────────────────────────────────────
          PART 1.2: EXTERNAL MEETING WEBSITE INTEGRATION CARD
          "Launch Live Classroom"
          ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E6] to-[#FDF5DC] border-2 border-[#F1E7CF] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-2xl bg-[#D97706] text-white shadow-sm">
                <Video className="w-5 h-5" />
              </span>
              <span className="text-xs font-black text-[#D97706] uppercase tracking-wider font-mono">
                External Meeting Platform Integration
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#111827]">
              Launch Live Classroom
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
              Open the online meeting platform to create a live class and share its joining link or meeting code with your students.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#64748B]">
              <span className="font-semibold text-[#111827]">Current Platform URL:</span>
              <code className="px-2 py-0.5 rounded-lg bg-white border border-[#F1E7CF] font-mono text-[#D97706] max-w-xs truncate font-bold">
                {platformUrl}
              </code>
              <button
                type="button"
                onClick={handleOpenConfigModal}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:text-[#B45309] hover:underline"
              >
                <Settings className="w-3 h-3" /> Change URL
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="primary"
              size="md"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              onClick={handleLaunchMeetingPlatform}
              className="!bg-[#111827] hover:!bg-[#1F2937] !text-white !font-black !px-6 !py-3 shadow-md justify-center"
            >
              Open Meeting Platform
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Zap className="w-4 h-4 text-[#D97706]" />}
              onClick={handleOpenImmediateLive}
              className="!font-black justify-center bg-white border border-[#D97706]/40 hover:border-[#D97706] shadow-xs"
            >
              Start Class Immediately
            </Button>
          </div>
        </div>

        {/* Workflow guidance steps */}
        <div className="mt-5 pt-4 border-t border-[#F1E7CF]/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white border border-[#F1E7CF] font-mono font-bold text-[#D97706] flex items-center justify-center text-[10px]">1</span>
            <span>Click <strong>Open Meeting Platform</strong> above to generate a room</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white border border-[#F1E7CF] font-mono font-bold text-[#D97706] flex items-center justify-center text-[10px]">2</span>
            <span>Copy the meeting URL, meeting code, or passcode</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white border border-[#F1E7CF] font-mono font-bold text-[#D97706] flex items-center justify-center text-[10px]">3</span>
            <span>Return here & click <strong>Start Class Immediately</strong> to share</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PART 1.25: SAVED MEETING LINKS SECTION
          Allows faculty to save, manage, and reuse meeting links permanently
          ───────────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border-2 border-[#F1E7CF] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1E7CF]">
          <div className="flex items-start sm:items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#FFF8E6] text-[#D97706] border border-[#FDE68A] shadow-xs">
              <Bookmark className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#111827]">
                  Saved Meeting Links & Rooms
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#FFF8E6] text-[#D97706] border border-[#FDE68A]">
                  {savedLinks.length} {savedLinks.length === 1 ? 'Link' : 'Links'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Save recurring classroom links with custom names. Copy, launch, or reuse anytime without generating new links.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#D97706]" />}
              onClick={handleGenerateAndSaveRoom}
              className="!font-bold text-xs bg-white border border-[#F1E7CF] hover:border-[#D97706]"
              title="Generate a unique room link on the meeting platform and name it"
            >
              Generate & Save Room
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => handleOpenSaveLinkModal()}
              className="!bg-[#111827] hover:!bg-[#1F2937] !text-white !font-black text-xs shadow-xs"
            >
              Save New Link
            </Button>
            <button
              type="button"
              onClick={() => setSavedLinksExpanded(!savedLinksExpanded)}
              className="p-1.5 rounded-xl border border-[#F1E7CF] text-[#64748B] hover:text-[#111827] hover:bg-[#FFF8E6] transition-colors"
              title={savedLinksExpanded ? 'Collapse section' : 'Expand section'}
            >
              {savedLinksExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {savedLinksExpanded && (
          <>
            {/* Search filter if there are saved links */}
            {savedLinks.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={savedLinksSearch}
                    onChange={(e) => setSavedLinksSearch(e.target.value)}
                    placeholder="Search saved links by name or platform..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F1E7CF] bg-[#FFFDF5] text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#D99A00]"
                  />
                  {savedLinksSearch && (
                    <button
                      onClick={() => setSavedLinksSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-[#64748B] font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Click <strong>Reuse</strong> to immediately schedule or start a class with that saved link.</span>
                </div>
              </div>
            )}

            {/* Content: List or Empty */}
            {savedLinksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 rounded-2xl bg-slate-50 border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : filteredSavedLinks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#FFFDF5] border border-dashed border-[#F1E7CF] space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FFF8E6] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                  <Bookmark className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-[#111827]">
                    {savedLinksSearch ? 'No matching saved links found' : 'No saved meeting links yet'}
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-md mx-auto font-medium">
                    {savedLinksSearch
                      ? `No saved links match "${savedLinksSearch}". Clear the search query to view all links.`
                      : 'Save your recurring Google Meet, Zoom, or CampusVerse meeting links with custom names so you can reuse them anytime without generating a new link each time.'}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenSaveLinkModal()}
                    className="!bg-[#111827] hover:!bg-[#1F2937] !text-white !font-bold text-xs"
                  >
                    Save Your First Link
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#D97706]" />}
                    onClick={handleGenerateAndSaveRoom}
                    className="!font-bold text-xs"
                  >
                    Generate Room Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredSavedLinks.map((link) => {
                  const meta = getPlatformMeta(link.platform);
                  const MetaIcon = meta.icon;
                  const isCopied = copiedLinkId === link._id;

                  return (
                    <div
                      key={link._id}
                      className="rounded-2xl border border-[#F1E7CF] bg-[#FFFDF5] p-4 flex flex-col justify-between hover:shadow-md hover:border-[#D99A00] transition-all group"
                    >
                      <div className="space-y-2.5">
                        {/* Card Header: Platform + Edit + Delete */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                            <MetaIcon className="w-3 h-3" />
                            {link.platform || 'Meeting Room'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenSaveLinkModal(link)}
                              className="p-1 rounded-lg text-slate-400 hover:text-[#111827] hover:bg-white transition-colors"
                              title="Edit link details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteLink(link)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete saved link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Link Custom Name */}
                        <div>
                          <h4 className="text-sm font-black text-[#111827] line-clamp-1 group-hover:text-[#D97706] transition-colors">
                            {link.name}
                          </h4>
                          {link.description && (
                            <p className="text-[11px] text-[#64748B] line-clamp-1 font-medium mt-0.5">
                              {link.description}
                            </p>
                          )}
                        </div>

                        {/* URL snippet */}
                        <div className="p-2 rounded-xl bg-white border border-[#F1E7CF] font-mono text-[11px] text-[#111827] flex items-center justify-between gap-1 overflow-hidden">
                          <span className="truncate text-[#D97706] font-semibold">{link.meetingUrl}</span>
                        </div>

                        {/* Optional Code & Passcode chips */}
                        {(link.meetingCode || link.passcode) && (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#64748B] font-mono">
                            {link.meetingCode && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-[#F1E7CF] flex items-center gap-1 font-bold text-[#111827]">
                                <Hash className="w-2.5 h-2.5 text-[#D97706]" />
                                Code: {link.meetingCode}
                              </span>
                            )}
                            {link.passcode && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-[#F1E7CF] flex items-center gap-1 font-bold text-[#111827]">
                                <Key className="w-2.5 h-2.5 text-[#D97706]" />
                                PIN: {link.passcode}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons (Copy Link, Open Meeting, Reuse in Class, Delete) */}
                      <div className="mt-3 pt-3 border-t border-[#F1E7CF] flex flex-wrap items-center gap-1.5">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={() => handleCopySavedLink(link)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-white hover:bg-slate-50 text-[#111827] border border-[#F1E7CF]'
                          }`}
                          title="Copy meeting link to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        {/* Open Meeting Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenSavedMeeting(link)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-[#FFF8E6] text-[#111827] border border-[#F1E7CF] transition-colors"
                          title="Open meeting room in a new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>Open</span>
                        </button>

                        {/* Reuse in Class Button */}
                        <button
                          type="button"
                          onClick={() => handleReuseSavedLink(link)}
                          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-[#111827] hover:bg-[#1F2937] text-white transition-colors shadow-2xs"
                          title="Launch Start Class Immediately pre-filled with this link"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#FDE68A]" />
                          <span>Reuse</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteLink(link)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete saved link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Tabs and Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#F1E7CF] shadow-2xs">
          {[
            { id: 'all', label: 'All Classes', count: tabCounts.all },
            { id: 'live', label: 'Live Now', count: tabCounts.live, isLive: true },
            { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
            { id: 'drafts', label: 'Drafts', count: tabCounts.drafts },
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
              placeholder="Search subject, code, title..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F1E7CF] bg-white text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00]/20"
            />
          </div>
          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#F1E7CF] bg-white text-xs font-bold text-[#111827] focus:outline-none focus:border-[#D99A00]"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => loadClasses(true)}
            disabled={refreshing || loading}
            title="Refresh class list"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Class Cards Grid */}
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
              : 'You have not started any online classes yet. Click "Start Class Immediately" above to launch your virtual lecture and share the link with students.'}
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
            const isDraft = cls.published === false;

            const hasUrl = Boolean(cls.meetingUrl && cls.meetingUrl.trim());
            const hasCode = Boolean(cls.meetingCode && cls.meetingCode.trim());

            return (
              <div
                key={cls._id}
                className={`relative rounded-3xl border bg-white p-5 shadow-xs transition-all duration-300 flex flex-col justify-between hover:shadow-md ${
                  isLive
                    ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/10'
                    : isDraft
                    ? 'border-dashed border-slate-300 bg-slate-50/40'
                    : isCancelled
                    ? 'border-slate-200 bg-slate-50/50 opacity-80'
                    : 'border-[#F1E7CF] hover:border-[#D99A00]'
                }`}
              >
                <div>
                  {/* Header: Platform + Status + Academic cohort */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${platformMeta.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${platformMeta.dot}`} />
                        <PlatformIcon className="w-3 h-3" />
                        {cls.platform || 'Meeting Platform'}
                      </span>
                      {getStatusBadge(cls)}
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

                  {/* Faculty Instructions if any */}
                  {cls.instructions && (
                    <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                      <p className="font-bold flex items-center gap-1.5 text-[11px]">
                        <Info className="w-3.5 h-3.5 text-[#D97706]" />
                        Faculty Instructions:
                      </p>
                      <p className="mt-0.5 font-medium text-[11px] leading-relaxed">
                        {cls.instructions}
                      </p>
                    </div>
                  )}

                  {/* Date, Time & Passcode Details */}
                  <div className="mt-3 p-3 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs space-y-1.5">
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
                        {cls.startTime} - {cls.endTime || 'End of session'}
                      </span>
                    </div>

                    {cls.departmentName && (
                      <div className="text-[11px] text-[#64748B] font-medium">
                        Dept: <span className="font-semibold text-[#111827]">{cls.departmentName}</span>
                      </div>
                    )}

                    {cls.passcode && (
                      <div className="text-[11px] text-[#64748B] font-medium flex items-center justify-between pt-1 border-t border-[#F1E7CF]">
                        <span>Meeting Passcode:</span>
                        <code className="px-1.5 py-0.5 rounded bg-white border border-[#F1E7CF] font-mono font-bold text-[#111827]">
                          {cls.passcode}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Joining Information Card (Meeting Code / Link) */}
                  <div className="mt-3 space-y-2">
                    {/* Meeting Code Row */}
                    {hasCode && (
                      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                            Meeting Code
                          </span>
                          <p className="font-mono font-black text-sm text-[#111827]">{cls.meetingCode}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyCode(cls)}
                          leftIcon={copiedCodeId === cls._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          className="!px-2.5 !py-1 !text-[11px] bg-white font-bold"
                        >
                          {copiedCodeId === cls._id ? 'Copied' : 'Copy Code'}
                        </Button>
                      </div>
                    )}

                    {/* Meeting URL preview if Code is also present or URL only */}
                    {hasUrl && (
                      <div className="flex items-center justify-between text-xs text-[#64748B] px-1">
                        <span className="truncate max-w-[280px] font-mono text-[11px] text-slate-500">
                          {cls.meetingUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(cls)}
                          className="text-[11px] font-bold text-[#D97706] hover:underline flex items-center gap-1"
                        >
                          {copiedId === cls._id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" /> Copied Link
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cancellation Reason Alert if cancelled */}
                  {isCancelled && cls.cancellationReason && (
                    <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Cancellation Notice:
                      </p>
                      <p className="mt-0.5 font-medium">{cls.cancellationReason}</p>
                    </div>
                  )}

                  {/* Rescheduled From Notice */}
                  {cls.rescheduledFrom?.date && (
                    <div className="mt-3 p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 font-medium">
                      <span className="font-bold">Rescheduled from: </span>
                      {new Date(cls.rescheduledFrom.date).toLocaleDateString('en-IN')} (
                      {cls.rescheduledFrom.startTime} - {cls.rescheduledFrom.endTime})
                    </div>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="mt-4 pt-4 border-t border-[#F1E7CF] space-y-2">
                  <div className="flex items-center gap-2">
                    {/* Primary joining button if meetingUrl is available */}
                    {hasUrl ? (
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
                          className={`w-full justify-center !text-xs font-black shadow-xs ${
                            isLive ? '!bg-rose-600 hover:!bg-rose-700 text-white' : ''
                          }`}
                          disabled={isCancelled}
                        >
                          {isLive ? 'Join Live Class Now' : 'Open Meeting Link'}
                        </Button>
                      </a>
                    ) : hasCode ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={handleLaunchMeetingPlatform}
                        className="flex-1 justify-center !text-xs font-black shadow-xs"
                        disabled={isCancelled}
                      >
                        Open Platform to Enter Code
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(cls)}
                        className="flex-1 justify-center !text-xs font-bold"
                      >
                        Add Joining Link / Code
                      </Button>
                    )}

                    {/* Copy Link Button */}
                    {hasUrl && (
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
                    )}
                  </div>

                  {/* Secondary Faculty Operations */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1">
                      {isDraft ? (
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="px-2.5 py-1 rounded-lg bg-[#111827] text-white hover:bg-[#1F2937] font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Share2 className="w-3 h-3 text-[#D97706]" />
                          Publish to Students
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenAnnouncement(cls)}
                          className="px-2 py-1 rounded-lg text-slate-600 hover:text-[#111827] hover:bg-[#FFF8E6] font-semibold text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Megaphone className="w-3 h-3 text-[#D97706]" />
                          Announce
                        </button>
                      )}

                      {!isCancelled && !isCompleted && !isDraft && (
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
                      {!isCancelled && !isCompleted && !isDraft && (
                        <button
                          onClick={() => handleOpenCancel(cls)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-[11px] transition-colors"
                        >
                          Cancel Class
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClass(cls)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete class permanently"
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

      {/* ─────────────────────────────────────────────────────────────
          PART 1.3: SHARE LIVE CLASS WITH STUDENTS FORM MODAL
          Fields: Class Title, Subject, Meeting Date, Start Time,
          Meeting Platform, Meeting URL, Meeting Code (optional),
          Additional Instructions (optional).
          Actions: Share with Students, Save as Draft, Update Meeting, Cancel Class
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={
          formMode === 'create'
            ? 'Start Class Immediately'
            : formMode === 'reschedule'
            ? 'Reschedule Online Class'
            : 'Update Meeting'
        }
        subtitle={
          formMode === 'create'
            ? 'Enter class details and share meeting URL or code with target students immediately'
            : 'Update live class timing or meeting credentials (changes sync directly to MongoDB)'
        }
        maxWidth="max-w-2xl"
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitForm('publish');
          }}
          className="space-y-4"
        >
          {/* Top-level submission error banner */}
          {formSubmitError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Cannot Share Class</p>
                <p className="text-[11px] font-medium leading-relaxed">{formSubmitError}</p>
              </div>
            </div>
          )}

          {/* Immediate Live Class Banner */}
          {formMode === 'create' && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
              <Zap className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Start Class Immediately — Students will see this live class in their portal right away.</span>
            </div>
          )}

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

          {/* Meeting Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Meeting Date *
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
                Start Time (HH:mm) *
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
                End Time (Optional)
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

          {/* Meeting Platform & Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Meeting Platform
              </label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="CampusVerse Live">CampusVerse Live</option>
                <option value="Custom Website">Custom Website / Other</option>
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

          {/* Joining Credentials: URL or Code (At least one required to publish) */}
          <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#F1E7CF] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#111827] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#D97706]" />
                Joining Credentials (Provide URL, Code, or Both)
              </span>
              <button
                type="button"
                onClick={handleLaunchMeetingPlatform}
                className="text-[11px] font-bold text-[#D97706] hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Open Meeting Platform
              </button>
            </div>

            {formErrors.joiningMethod && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{formErrors.joiningMethod}</span>
              </div>
            )}

            {/* Quick Fill from Saved Links */}
            {savedLinks.length > 0 && (
              <div className="p-2.5 rounded-xl bg-white border border-[#F1E7CF] space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#111827] flex items-center gap-1">
                    <BookmarkCheck className="w-3.5 h-3.5 text-[#D97706]" />
                    Reuse a Saved Meeting Link
                  </label>
                  <span className="text-[10px] text-[#64748B]">Auto-fills URL & platform</span>
                </div>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const chosen = savedLinks.find((l) => l._id === e.target.value);
                    if (chosen) {
                      setForm((prev) => ({
                        ...prev,
                        meetingUrl: chosen.meetingUrl,
                        meetingCode: chosen.meetingCode || prev.meetingCode,
                        platform: chosen.platform || prev.platform,
                        passcode: chosen.passcode || prev.passcode,
                      }));
                      if (formErrors.meetingUrl || formErrors.joiningMethod) {
                        setFormErrors((prev) => ({ ...prev, meetingUrl: null, joiningMethod: null }));
                      }
                      showToast?.(`Loaded saved link "${chosen.name}"`);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#F1E7CF] bg-[#FFFDF5] text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#D99A00]"
                >
                  <option value="">-- Choose from your saved links --</option>
                  {savedLinks.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name} ({l.platform})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[#111827]">
                  Meeting URL
                </label>
                {form.meetingUrl && form.meetingUrl.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenSaveLinkModal({
                        name: form.title ? `${form.title} Room` : '',
                        meetingUrl: form.meetingUrl,
                        meetingCode: form.meetingCode,
                        platform: form.platform,
                        passcode: form.passcode,
                        description: form.subject || '',
                      });
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D97706] hover:underline"
                  >
                    <Save className="w-3 h-3" /> Save this link
                  </button>
                )}
              </div>
              <input
                type="url"
                value={form.meetingUrl}
                onChange={(e) => handleMeetingUrlChange(e.target.value)}
                placeholder="https://meet.google.com/xyz-abcd-efg or https://your-zoom-link"
                className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] font-mono focus:outline-none ${
                  formErrors.meetingUrl ? 'border-red-400 bg-red-50/20' : 'border-[#F1E7CF] focus:border-[#D99A00]'
                }`}
              />
              {formErrors.meetingUrl && (
                <p className="text-[11px] text-red-500">{formErrors.meetingUrl}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#111827]">
                Meeting Code (Optional)
              </label>
              <input
                type="text"
                value={form.meetingCode}
                onChange={(e) => handleMeetingCodeChange(e.target.value)}
                placeholder="e.g. 882-991-002 or room-code-42"
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] font-mono focus:outline-none focus:border-[#D99A00]"
              />
              <p className="text-[10px] text-[#64748B]">
                Students can copy this code and use it on the meeting platform.
              </p>
            </div>
          </div>

          {/* Description & Additional Instructions */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Class Description / Agenda
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Lecture outline, prerequisites, reference topics..."
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Additional Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="e.g. Keep your mics muted on entry, have lab assignment 4 open, join 5 mins early..."
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
              />
            </div>
          </div>

          {/* Target Student Cohort */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-[#111827] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D97706]" />
              Target Student Cohort (Only enrolled students will see this class)
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
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
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
                  placeholder="e.g. Computer Science & Engineering (or 'All')"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Section / Group
                </label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  placeholder="e.g. A, B, or All"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions (Share with Students, Save as Draft, Cancel) */}
          <div className="pt-3 border-t border-[#F1E7CF] flex flex-wrap items-center justify-between gap-2.5">
            <div>
              {formMode === 'edit' && selectedClassId && (
                <button
                  type="button"
                  onClick={() => {
                    const cls = classes.find((c) => c._id === selectedClassId);
                    if (cls) {
                      setFormModalOpen(false);
                      handleOpenCancel(cls);
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Cancel Class
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setFormModalOpen(false)}
                disabled={isSubmitting}
              >
                Close
              </Button>

              {formMode === 'create' && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleSubmitForm('draft')}
                  disabled={isSubmitting}
                  className="!border-[#F1E7CF] !text-[#475569] hover:!text-[#111827]"
                >
                  Save as Draft
                </Button>
              )}

              <Button
                id="btn-share-with-students"
                variant="primary"
                size="md"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmitForm('publish');
                }}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="!bg-[#111827] hover:!bg-[#1F2937] !text-white !font-black !px-6 shadow-sm"
              >
                {isSubmitting
                  ? formMode === 'create'
                    ? 'Sharing with Students...'
                    : 'Updating...'
                  : formMode === 'create'
                  ? 'Share with Students'
                  : 'Update Meeting'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          PLATFORM URL CONFIGURATION MODAL
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        title="Configure External Meeting Platform URL"
        subtitle="Set the meeting platform URL opened by both Faculty and Student portals"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSavePlatformUrl} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              External Meeting Website URL *
            </label>
            <input
              type="url"
              value={editUrlInput}
              onChange={(e) => {
                setEditUrlInput(e.target.value);
                if (configUrlError) setConfigUrlError('');
              }}
              placeholder="https://meet.google.com/new"
              className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] font-mono focus:outline-none ${
                configUrlError ? 'border-red-400 bg-red-50/20' : 'border-[#F1E7CF] focus:border-[#D99A00]'
              }`}
            />
            {configUrlError && <p className="text-[11px] text-red-500 mt-1">{configUrlError}</p>}
            <p className="text-[11px] text-[#64748B] mt-1.5 leading-relaxed">
              Default: <code className="font-mono font-bold">{DEFAULT_FALLBACK_URL}</code>.
              Supports Google Meet, Zoom, MS Teams, Webex, or your own video conferencing service.
            </p>
          </div>

          <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetPlatformUrl}
              className="text-xs font-bold text-[#D97706] hover:underline"
            >
              Reset to Default
            </button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfigModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Platform URL
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          CANCELLATION REASON MODAL
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Scheduled Class"
        subtitle="Enrolled students will receive real-time cancellation alerts"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Are you sure you want to cancel this online class?
            </p>
            <p className="mt-1 font-medium text-[11px]">
              Class: <strong>{cancellingClass?.title}</strong> ({cancellingClass?.subject})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              Cancellation Reason for Students
            </label>
            <textarea
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Rescheduled due to faculty committee meeting, check announcements for updates..."
              className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              className="!bg-rose-600 !text-white !font-bold"
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Class Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          ANNOUNCEMENT MODAL
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Broadcast Class Announcement"
        subtitle="Send an instant message / instructions to all enrolled students"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#64748B]">
            Announcement for <strong>{announcementClass?.title}</strong>:
          </p>
          <textarea
            rows={3}
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            placeholder="Type your message, pre-reading notes, or urgent update..."
            className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
          />
          <div className="pt-2 flex items-center justify-end gap-2">
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
            >
              {isSubmitting ? 'Sending...' : 'Send Announcement'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          SAVE / EDIT MEETING LINK MODAL
          Allows faculty to save a link with custom name permanently
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={saveLinkModalOpen}
        onClose={() => setSaveLinkModalOpen(false)}
        title={editingLinkId ? 'Edit Saved Meeting Link' : 'Save Meeting Link'}
        description="Store your meeting link with a custom name so you can reuse it anytime without generating a new one."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveLinkSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              Custom Link Name *
            </label>
            <input
              type="text"
              value={linkForm.name}
              onChange={(e) => {
                setLinkForm({ ...linkForm, name: e.target.value });
                if (linkFormErrors.name) setLinkFormErrors({ ...linkFormErrors, name: null });
              }}
              placeholder="e.g. Distributed Systems Lecture Hall, Daily CSE Lab"
              className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#D99A00]/20 ${
                linkFormErrors.name ? 'border-red-400 bg-red-50/20' : 'border-[#F1E7CF] focus:border-[#D99A00]'
              }`}
            />
            {linkFormErrors.name && (
              <p className="text-[11px] text-red-500 mt-1">{linkFormErrors.name}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#111827]">
                Meeting URL *
              </label>
              <button
                type="button"
                onClick={handleLaunchMeetingPlatform}
                className="text-[11px] font-bold text-[#D97706] hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" /> Open Platform
              </button>
            </div>
            <input
              type="url"
              value={linkForm.meetingUrl}
              onChange={(e) => handleLinkFormUrlChange(e.target.value)}
              placeholder="https://meet.google.com/xyz-abcd-efg or https://your-zoom-link"
              className={`w-full px-3 py-2 rounded-xl border text-xs text-[#111827] font-mono focus:outline-none ${
                linkFormErrors.meetingUrl ? 'border-red-400 bg-red-50/20' : 'border-[#F1E7CF] focus:border-[#D99A00]'
              }`}
            />
            {linkFormErrors.meetingUrl && (
              <p className="text-[11px] text-red-500 mt-1">{linkFormErrors.meetingUrl}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Meeting Platform
              </label>
              <select
                value={linkForm.platform}
                onChange={(e) => setLinkForm({ ...linkForm, platform: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="CampusVerse Live">CampusVerse Live</option>
                <option value="Custom Website">Custom Website / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Meeting Code (Optional)
              </label>
              <input
                type="text"
                value={linkForm.meetingCode}
                onChange={(e) => setLinkForm({ ...linkForm, meetingCode: e.target.value })}
                placeholder="e.g. 882-991-002"
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] font-mono focus:outline-none focus:border-[#D99A00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Passcode / Access PIN (Optional)
              </label>
              <input
                type="text"
                value={linkForm.passcode}
                onChange={(e) => setLinkForm({ ...linkForm, passcode: e.target.value })}
                placeholder="e.g. PIN-1234"
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] font-mono focus:outline-none focus:border-[#D99A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Description / Notes (Optional)
              </label>
              <input
                type="text"
                value={linkForm.description}
                onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                placeholder="e.g. Regular weekly practical session"
                className="w-full px-3 py-2 rounded-xl border border-[#F1E7CF] text-xs text-[#111827] focus:outline-none focus:border-[#D99A00]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setSaveLinkModalOpen(false)}
              disabled={isSavingLink}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSavingLink}
              leftIcon={<Save className="w-4 h-4" />}
              className="!bg-[#111827] hover:!bg-[#1F2937] !text-white !font-black"
            >
              {isSavingLink ? 'Saving...' : editingLinkId ? 'Update Link' : 'Save Meeting Link'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          DELETE SAVED MEETING LINK CONFIRMATION MODAL
          Shows confirmation before deleting a saved link
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={deleteLinkModalOpen}
        onClose={() => setDeleteLinkModalOpen(false)}
        title="Delete Saved Meeting Link"
        description="Are you sure you want to permanently remove this link from your saved rooms?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Permanent Deletion</p>
              <p className="leading-relaxed">
                This will delete the saved link <strong>&ldquo;{linkToDelete?.name}&rdquo;</strong> from your database.
                Any existing classes that were already scheduled will not be affected.
              </p>
            </div>
          </div>

          {linkToDelete && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Target Link URL:</p>
              <p className="text-[#111827] truncate font-semibold">{linkToDelete.meetingUrl}</p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setDeleteLinkModalOpen(false)}
              disabled={isDeletingLink}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              type="button"
              onClick={handleConfirmDeleteLink}
              disabled={isDeletingLink}
              leftIcon={<Trash2 className="w-4 h-4" />}
              className="!bg-rose-600 hover:!bg-rose-700 !text-white !font-bold"
            >
              {isDeletingLink ? 'Deleting...' : 'Yes, Delete Link'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FacultyOnlineClassesSection;
