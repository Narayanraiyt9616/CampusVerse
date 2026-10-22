import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Bell,
  Pin,
  Calendar,
  AlertTriangle,
  Info,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  BookOpen,
  GraduationCap,
  Megaphone,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { parentService } from '../../../services/api';

const CATEGORIES = ['All', 'Urgent', 'Exam', 'Academic', 'General', 'Event'];

export const ParentNotices = ({ selectedStudentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await parentService.getNotices({ studentId: selectedStudentId || undefined });
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch circulars and alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedStudentId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading institutional circulars & alerts...</p>
      </div>
    );
  }

  const notices = data?.notices || [];
  const systemAlerts = data?.systemAlerts || [];

  // Filter notices
  const filteredNotices = notices.filter((n) => {
    const matchesCategory =
      activeCategory === 'All' ? true : (n.category || '').toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.pinned);
  const standardNotices = filteredNotices.filter((n) => !n.pinned);

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Notice Board Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Dynamic Telemetry Alerts Section (Attendance shortage & Fee reminders) */}
      {systemAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D99A00] animate-ping" />
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
              Urgent Ward Attention Notices ({systemAlerts.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-[#FFF8E6] border border-[#D99A00]/40 rounded-2xl p-5 shadow-xs flex items-start gap-4 transition-all text-[#111827]"
              >
                <div className="p-2.5 rounded-xl bg-[#FFFFFF] text-[#D99A00] shrink-0 mt-0.5 border border-[#D99A00]/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-[#111827]">{alert.title}</h4>
                    <Badge variant="teal" size="sm">
                      Urgent Action Required
                    </Badge>
                  </div>
                  <p className="text-xs text-[#111827]/85 leading-relaxed font-medium">
                    {alert.content}
                  </p>
                  <div className="pt-1 text-xs font-mono text-[#4B5563] flex items-center gap-1.5 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#D99A00]" />
                    <span>Generated on {alert.date} • System Telemetry Monitor</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Notice Board Card */}
      <Card
        title="Campus Circulars & Official Announcements"
        subtitle="Examination schedules, holiday advisories, academic symposiums, and administrative circulars"
        headerAction={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#4B5563] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search circulars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-lg focus:outline-hidden focus:border-[#D99A00] text-[#111827] w-44"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotices}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#D99A00]" />}
            >
              Refresh
            </Button>
          </div>
        }
      >
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#F1E7CF]">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? notices.length
                : notices.filter((n) => (n.category || '').toLowerCase() === cat.toLowerCase()).length;
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                    : 'bg-[#FFFDF5] hover:bg-[#FFF8E6] text-[#111827] border border-[#F1E7CF]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notices Stream */}
        <div className="mt-4 space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#4B5563] space-y-2 font-medium">
              <Megaphone className="w-8 h-8 mx-auto text-[#D99A00]" />
              <p className="font-bold text-[#111827]">No announcements found.</p>
              <p>There are no circulars matching category &quot;{activeCategory}&quot;.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pinned Announcements */}
              {pinnedNotices.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#D99A00] uppercase tracking-wider">
                    <Pin className="w-3.5 h-3.5 rotate-45 text-[#D99A00]" />
                    <span>Pinned Campus Advisories</span>
                  </div>

                  {pinnedNotices.map((n) => (
                    <div
                      key={n._id}
                      className="p-5 rounded-2xl border-2 border-[#D99A00] bg-[#FFF8E6]/40 shadow-xs space-y-2 hover:bg-[#FFF8E6]/60 transition-all text-[#111827]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="teal" size="sm">
                            PINNED
                          </Badge>
                          <Badge variant="neutral" size="sm">
                            {n.category || 'General'}
                          </Badge>
                          <h4 className="text-sm font-bold text-[#111827]">{n.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-[#4B5563] shrink-0 font-medium">
                          {n.publishedAt
                            ? new Date(n.publishedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Today'}
                        </span>
                      </div>

                      <p className="text-xs text-[#111827]/85 leading-relaxed font-normal whitespace-pre-line">
                        {n.content}
                      </p>

                      <div className="pt-2 border-t border-[#F1E7CF] flex items-center justify-between text-xs text-[#4B5563] font-medium">
                        <span>Issued by: {n.authorName || 'Office of Academic Affairs'}</span>
                        <span className="font-mono">Audience: {n.targetAudience || 'All'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Standard Announcements */}
              <div className="space-y-3">
                {pinnedNotices.length > 0 && standardNotices.length > 0 && (
                  <h4 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider pt-2">
                    Recent Bulletins
                  </h4>
                )}

                {standardNotices.map((n) => {
                  return (
                    <div
                      key={n._id}
                      className="p-5 rounded-2xl border border-[#F1E7CF] bg-[#FFFFFF] hover:bg-[#FFF8E6]/20 transition-all shadow-xs space-y-2 text-[#111827]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="teal"
                            size="sm"
                          >
                            {n.category || 'General'}
                          </Badge>
                          <h4 className="text-sm font-bold text-[#111827]">{n.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-[#4B5563] shrink-0 font-medium">
                          {n.publishedAt
                            ? new Date(n.publishedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                      </div>

                      <p className="text-xs text-[#4B5563] leading-relaxed font-normal whitespace-pre-line">
                        {n.content}
                      </p>

                      <div className="pt-2 border-t border-[#F1E7CF] flex items-center justify-between text-xs text-[#4B5563] font-medium">
                        <span>Issued by: {n.authorName || 'University Administration'}</span>
                        <span className="font-mono">Audience: {n.targetAudience || 'Students & Parents'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ParentNotices;
