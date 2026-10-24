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
  Sparkles,
  Info,
  Radio,
  Lock,
} from 'lucide-react';
import { onlineClassService } from '../../../services/api';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';

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
    // Refresh status every 60 seconds
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

  // Find currently live class for top banner
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
      if (activeTab === 'cancelled' && status !== 'cancelled') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (cls.title || '').toLowerCase().includes(q);
        const matchSub = (cls.subject || '').toLowerCase().includes(q);
        const matchFaculty = (cls.facultyName || '').toLowerCase().includes(q);
        const matchDesc = (cls.description || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchFaculty && !matchDesc) return false;
      }

      return true;
    });
  }, [classes, activeTab, searchQuery]);

  // Tab counts
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
      {/* LIVE NOW BANNER (if any class is currently live) */}
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
                  {liveClass.startTime} - {liveClass.endTime}
                </span>
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
              <a
                href={liveClass.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto"
              >
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                  className="w-full justify-center !bg-rose-600 hover:!bg-rose-700 !text-white !font-black !px-6 shadow-md"
                >
                  Join Live Lecture Now
                </Button>
              </a>
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
            </div>
          </div>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#FFFDF5] border border-[#F1E7CF] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF8E6] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shadow-2xs">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-black text-[#111827]">
              Virtual Lectures & Live Classrooms
            </h2>
            <p className="text-xs text-[#64748B] font-medium">
              Join online classes scheduled for your academic semester and branch.
            </p>
          </div>
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
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#F1E7CF] shadow-2xs">
          {[
            { id: 'all', label: 'All Classes', count: tabCounts.all },
            { id: 'live', label: 'Live Now', count: tabCounts.live, isLive: true },
            { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
            { id: 'completed', label: 'Past Classes', count: tabCounts.completed },
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

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject, faculty, or title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#F1E7CF] bg-white text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00]/20"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
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
              ? 'There are no active online classes at this moment. Upcoming classes will notify you 15 minutes before starting.'
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
            const allowLink = !isCompleted || cls.allowPastLinks !== false;

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
                {/* Header: Platform + Status + Academic cohort */}
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
                    {cls.passcode && (
                      <div className="text-[11px] text-[#64748B] font-medium flex items-center justify-between pt-0.5 border-t border-[#F1E7CF]">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-[#D97706]" /> Meeting Passcode:
                        </span>
                        <code className="px-1.5 py-0.5 rounded bg-white border border-[#F1E7CF] font-mono font-bold text-[#111827]">
                          {cls.passcode}
                        </code>
                      </div>
                    )}
                  </div>

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
                      Was originally set for{' '}
                      {new Date(cls.rescheduledFrom.date).toLocaleDateString('en-IN')} (
                      {cls.rescheduledFrom.startTime} - {cls.rescheduledFrom.endTime})
                    </div>
                  )}

                  {/* Faculty Announcements */}
                  {cls.announcements && cls.announcements.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-[#111827] flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-[#D97706]" />
                        Faculty Announcements ({cls.announcements.length}):
                      </p>
                      <div className="max-h-24 overflow-y-auto space-y-1 text-xs">
                        {cls.announcements.map((a, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[#475569] text-[11px]"
                          >
                            <p className="font-medium">{a.message}</p>
                            <span className="text-[9px] text-slate-400">
                              {new Date(a.createdAt).toLocaleDateString('en-IN')}{' '}
                              {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-4 border-t border-[#F1E7CF]">
                  <div className="flex items-center gap-2">
                    {/* Join Class button */}
                    {isCancelled ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="w-full justify-center !text-xs opacity-60"
                      >
                        Class Cancelled
                      </Button>
                    ) : isCompleted && !allowLink ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled
                        className="w-full justify-center !text-xs opacity-60"
                      >
                        Meeting Ended • Links Disabled
                      </Button>
                    ) : (
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
                            isLive ? '!bg-rose-600 hover:!bg-rose-700 !text-white' : ''
                          }`}
                        >
                          {isLive
                            ? 'Join Live Class Now'
                            : isCompleted
                            ? 'View Meeting Room'
                            : 'Join Online Class'}
                        </Button>
                      </a>
                    )}

                    {/* Copy Link Button */}
                    {allowLink && !isCancelled && (
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
  );
};

export default StudentOnlineClassesSection;
