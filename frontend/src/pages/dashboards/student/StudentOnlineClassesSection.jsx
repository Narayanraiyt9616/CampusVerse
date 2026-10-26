import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Video,
  Clock,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  User,
  Search,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  X,
  CheckCircle2,
  CalendarDays,
  Globe,
  Megaphone,
  BookOpen,
  Info,
  Lock,
} from 'lucide-react';
import { onlineClassService } from '../../../services/api';
import Button from '../../../components/common/Button';
import {
  openExternalMeetingPlatform,
  validateMeetingUrl,
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

const getStatusBadge = (status) => {
  switch (status) {
    case 'Live Now':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-300 shadow-xs animate-pulse">
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

export const StudentOnlineClassesSection = ({ profile }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [joinError, setJoinError] = useState(null);

  // Load student classes from backend
  const loadClasses = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await onlineClassService.list({});
      if (res?.success) {
        setClasses(res.classes || []);
      } else {
        setError(res?.error || 'Failed to load your online classes.');
      }
    } catch (err) {
      setError(err?.message || 'Unable to connect to the online classes service.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
    const interval = setInterval(() => loadClasses(true), 60000);
    return () => clearInterval(interval);
  }, [loadClasses]);

  // Copy meeting link
  const handleCopyLink = (cls) => {
    if (!cls?.meetingUrl) return;
    navigator.clipboard.writeText(cls.meetingUrl);
    setCopiedId(cls._id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy meeting code
  const handleCopyCode = (cls) => {
    if (!cls?.meetingCode) return;
    navigator.clipboard.writeText(cls.meetingCode);
    setCopiedCodeId(cls._id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Launch external meeting platform
  const handleOpenMeetingPlatform = () => {
    const res = openExternalMeetingPlatform();
    if (!res.success) {
      setError(res.message || 'External meeting website has not been properly configured.');
    }
  };

  // Join class using faculty provided URL
  const handleJoinClassUrl = (e, url) => {
    if (!url) {
      e.preventDefault();
      setJoinError('No valid meeting URL was provided for this class.');
      return;
    }
    const val = validateMeetingUrl(url);
    if (!val.isValid) {
      e.preventDefault();
      setJoinError(`Invalid meeting URL: ${val.error}`);
      return;
    }
    // Valid URL: open in new tab
    setJoinError(null);
  };

  // Find currently live class for top highlight banner
  const liveClass = useMemo(() => {
    return classes.find(
      (c) => (c.computedStatus === 'Live Now' || c.status === 'Live Now') && c.status !== 'Cancelled'
    );
  }, [classes]);

  // Filter classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const status = (cls.computedStatus || cls.status || '').toLowerCase();

      // Tab filter
      if (activeTab === 'live' && status !== 'live now') return false;
      if (activeTab === 'upcoming' && status !== 'upcoming' && status !== 'rescheduled') return false;
      if (activeTab === 'completed' && status !== 'completed') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (cls.title || '').toLowerCase().includes(q);
        const matchSub = (cls.subject || '').toLowerCase().includes(q);
        const matchFaculty = (cls.facultyName || '').toLowerCase().includes(q);
        const matchDesc = (cls.description || '').toLowerCase().includes(q);
        const matchInstructions = (cls.instructions || '').toLowerCase().includes(q);
        const matchCode = (cls.meetingCode || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchFaculty && !matchDesc && !matchInstructions && !matchCode) {
          return false;
        }
      }

      return true;
    });
  }, [classes, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: classes.length, live: 0, upcoming: 0, completed: 0 };
    classes.forEach((cls) => {
      const s = (cls.computedStatus || cls.status || '').toLowerCase();
      if (s === 'live now') counts.live++;
      else if (s === 'upcoming' || s === 'rescheduled') counts.upcoming++;
      else if (s === 'completed') counts.completed++;
    });
    return counts;
  }, [classes]);

  return (
    <div className="space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          PART 2.2: EXTERNAL MEETING WEBSITE CARD
          "Join Your Live Classroom"
          ───────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E6] to-[#FDF5DC] border-2 border-[#F1E7CF] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-[#D97706] text-white shadow-xs">
                <Video className="w-5 h-5" />
              </span>
              <span className="text-xs font-black text-[#D97706] uppercase tracking-wider font-mono">
                Live Classroom Hub
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#111827]">
              Join Your Live Classroom
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
              Open the online meeting platform and join your scheduled class using the meeting link or code provided by your faculty.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              onClick={handleOpenMeetingPlatform}
              className="!bg-[#111827] hover:!bg-[#1F2937] !text-white !font-black !px-6 !py-3 shadow-md justify-center whitespace-nowrap"
            >
              Open Meeting Platform
            </Button>
          </div>
        </div>
      </div>

      {/* LIVE NOW BANNER (if any class is currently in session) */}
      {liveClass && (
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-r from-rose-50 via-amber-50 to-[#FFF8E6] border-2 border-rose-400 shadow-md animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  CLASS IN PROGRESS RIGHT NOW
                </span>
                <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider font-mono">
                  {liveClass.subject}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111827]">
                {liveClass.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#475569] font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#D97706]" />
                  {liveClass.facultyName || 'Course Instructor'}
                </span>
                <span>•</span>
                <span className="font-mono font-bold text-[#111827]">
                  {liveClass.startTime} - {liveClass.endTime || 'Session End'}
                </span>
                {liveClass.meetingCode && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                      Code: {liveClass.meetingCode}
                    </span>
                  </>
                )}
                {liveClass.passcode && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      Passcode: <code className="font-mono font-bold">{liveClass.passcode}</code>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {liveClass.meetingUrl ? (
                <a
                  href={liveClass.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleJoinClassUrl(e, liveClass.meetingUrl)}
                  className="w-full md:w-auto flex-1 md:flex-initial"
                >
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<ExternalLink className="w-4 h-4" />}
                    className="w-full justify-center !bg-rose-600 hover:!bg-rose-700 !text-white !font-black !px-6 shadow-md"
                  >
                    Join Live Class Now
                  </Button>
                </a>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                  onClick={handleOpenMeetingPlatform}
                  className="w-full md:w-auto justify-center !bg-rose-600 hover:!bg-rose-700 !text-white !font-black !px-6 shadow-md"
                >
                  Open Platform to Join
                </Button>
              )}

              {liveClass.meetingCode && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleCopyCode(liveClass)}
                  className="!px-3 bg-white font-bold"
                  title="Copy meeting code"
                >
                  {copiedCodeId === liveClass._id ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                      <Check className="w-4 h-4" /> Code Copied!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-700 text-xs">
                      <Copy className="w-4 h-4" /> Copy Code
                    </span>
                  )}
                </Button>
              )}

              {liveClass.meetingUrl && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleCopyLink(liveClass)}
                  className="!px-3 bg-white"
                  title="Copy meeting link"
                >
                  {copiedId === liveClass._id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-600" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PART 2.3: CLASSES SHARED BY FACULTY
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D97706]" />
              Classes Shared by Faculty
            </h3>
            <p className="text-xs text-[#64748B] font-medium">
              Lectures, meeting links, and joining codes published for your academic cohort.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={() => loadClasses(true)}
            disabled={refreshing || loading}
          >
            Refresh Schedule
          </Button>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs: Organized into Upcoming, Live, Completed */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#F1E7CF] shadow-2xs">
            {[
              { id: 'all', label: 'All Classes', count: tabCounts.all },
              { id: 'live', label: 'Live Classes', count: tabCounts.live, isLive: true },
              { id: 'upcoming', label: 'Upcoming Classes', count: tabCounts.upcoming },
              { id: 'completed', label: 'Completed Classes', count: tabCounts.completed },
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

          {/* Search Input */}
          <div className="relative sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject, faculty, or code..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F1E7CF] bg-white text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00]/20"
            />
          </div>
        </div>

        {/* Global Errors or Join Warnings */}
        {(error || joinError) && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{joinError || error}</span>
            </div>
            <button
              onClick={() => {
                setError(null);
                setJoinError(null);
              }}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Class Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-[#FFF8E6]/20 border border-[#F1E7CF] animate-pulse"
              />
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#F1E7CF] shadow-xs space-y-3">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FFF8E6] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-[#111827]">
              {activeTab === 'live'
                ? 'No live classes right now'
                : activeTab === 'upcoming'
                ? 'No upcoming online classes scheduled'
                : 'No online classes found'}
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto font-medium">
              {activeTab === 'live'
                ? 'There are no active online classes at this moment. Upcoming classes will notify you before starting.'
                : searchQuery
                ? 'No classes match your search query. Try another keyword.'
                : 'Your faculty will publish online class schedules and meeting links here.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-[#D97706] hover:underline"
              >
                Clear search filter
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

              const hasUrl = Boolean(cls.meetingUrl && cls.meetingUrl.trim());
              const hasCode = Boolean(cls.meetingCode && cls.meetingCode.trim());

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
                        {getStatusBadge(status)}
                      </div>
                      <span className="text-[11px] font-bold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-lg font-mono">
                        Sem {cls.semester}
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
                      <p className="text-xs text-[#475569] font-semibold mt-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#D97706]" />
                        Instructor: <span className="text-[#111827]">{cls.facultyName || 'Faculty'}</span>
                      </p>
                      {cls.description && (
                        <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 font-medium leading-relaxed">
                          {cls.description}
                        </p>
                      )}
                    </div>

                    {/* Faculty Instructions */}
                    {(cls.instructions || cls.description) && (
                      <div className="mt-2.5 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                        <p className="font-bold flex items-center gap-1.5 text-[11px]">
                          <Info className="w-3.5 h-3.5 text-[#D97706]" />
                          Faculty Instructions:
                        </p>
                        <p className="mt-0.5 font-medium text-[11px] leading-relaxed">
                          {cls.instructions || cls.description}
                        </p>
                      </div>
                    )}

                    {/* Date, Time & Passcode */}
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
                      {cls.passcode && (
                        <div className="text-[11px] text-[#64748B] font-medium flex items-center justify-between pt-1 border-t border-[#F1E7CF]">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#D97706]" /> Meeting Passcode:
                          </span>
                          <code className="px-1.5 py-0.5 rounded bg-white border border-[#F1E7CF] font-mono font-bold text-[#111827]">
                            {cls.passcode}
                          </code>
                        </div>
                      )}
                    </div>

                    {/* Join Using Meeting Code Section */}
                    {hasCode && (
                      <div className="mt-3 flex items-center justify-between p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                            Meeting Code:
                          </span>
                          <p className="font-mono font-black text-sm text-[#111827]">
                            {cls.meetingCode}
                          </p>
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

                    {/* Cancellation Alert */}
                    {isCancelled && (
                      <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-0.5">
                        <p className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          Class Cancelled by Faculty:
                        </p>
                        <p className="font-medium text-[11px]">
                          {cls.cancellationReason || 'No specific cancellation reason provided.'}
                        </p>
                      </div>
                    )}

                    {/* Rescheduled Note */}
                    {cls.rescheduledFrom?.date && (
                      <div className="mt-3 p-2.5 rounded-2xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 font-medium">
                        <span className="font-bold">Rescheduled: </span>
                        Original lecture was on {new Date(cls.rescheduledFrom.date).toLocaleDateString('en-IN')} (
                        {cls.rescheduledFrom.startTime} - {cls.rescheduledFrom.endTime})
                      </div>
                    )}

                    {/* Announcements stream */}
                    {cls.announcements && cls.announcements.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-[11px] font-bold text-[#111827] flex items-center gap-1">
                          <Megaphone className="w-3 h-3 text-[#D97706]" />
                          Instructor Announcements ({cls.announcements.length}):
                        </p>
                        <div className="max-h-24 overflow-y-auto space-y-1 text-xs">
                          {cls.announcements.map((a, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#475569] text-[11px]"
                            >
                              <p className="font-medium">{a.message}</p>
                              <span className="text-[9px] text-slate-400">
                                {new Date(a.postedAt || a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Join Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-[#F1E7CF] space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Join Using Meeting Link */}
                      {hasUrl ? (
                        <a
                          href={cls.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleJoinClassUrl(e, cls.meetingUrl)}
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
                            {isLive ? 'Join Live Class' : 'Join Live Class'}
                          </Button>
                        </a>
                      ) : hasCode ? (
                        /* Join Using Meeting Code button: launches platform */
                        <Button
                          variant={isLive ? 'primary' : 'secondary'}
                          size="sm"
                          leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          onClick={handleOpenMeetingPlatform}
                          className={`flex-1 justify-center !text-xs font-black shadow-xs ${
                            isLive ? '!bg-rose-600 hover:!bg-rose-700 text-white' : ''
                          }`}
                          disabled={isCancelled}
                        >
                          Open Platform to Enter Code
                        </Button>
                      ) : null}

                      {/* Copy Link Button if URL available */}
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentOnlineClassesSection;
