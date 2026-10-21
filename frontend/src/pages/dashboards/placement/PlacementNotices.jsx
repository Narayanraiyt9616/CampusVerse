import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Megaphone,
  Pin,
  Calendar,
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Sparkles,
  AlertTriangle,
  X,
  GraduationCap,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { placementService } from '../../../services/api';

const CATEGORIES = [
  'All',
  'Drive Alert',
  'Shortlist Announced',
  'Interview Schedule',
  'Policy & Guidelines',
  'Urgent',
];

export const PlacementNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    companyName: '',
    content: '',
    category: 'Drive Alert',
    targetBatch: 2026,
    targetDepartments: 'All Departments',
    pinned: false,
  });

  const fetchNotices = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await placementService.getNotices();
      if (res && res.success) {
        setNotices(res.notices || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch placement circulars.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Filter notices
  const filteredNotices = notices.filter((n) => {
    const matchesCategory =
      activeCategory === 'All' || n.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q) ||
      (n.companyName || '').toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.pinned);
  const regularNotices = filteredNotices.filter((n) => !n.pinned);

  // Handle Publish
  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      alert('Notice title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      const depts = noticeForm.targetDepartments
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);

      const res = await placementService.createNotice({
        title: noticeForm.title,
        companyName: noticeForm.companyName,
        content: noticeForm.content,
        category: noticeForm.category,
        targetBatch: Number(noticeForm.targetBatch),
        targetDepartments: depts,
        pinned: noticeForm.pinned,
      });

      if (res && res.success) {
        setSuccessMsg('Placement announcement successfully published.');
        setShowPublishModal(false);
        setNoticeForm({
          title: '',
          companyName: '',
          content: '',
          category: 'Drive Alert',
          targetBatch: 2026,
          targetDepartments: 'All Departments',
          pinned: false,
        });
        fetchNotices();
      }
    } catch (err) {
      alert(err.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && notices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading placement circulars & advisories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Placement Notice Board Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner
          variant="success"
          title="Announcement Published"
          message={successMsg}
          dismissible
          onDismiss={() => setSuccessMsg('')}
        />
      )}

      {/* Main Notice Board Card */}
      <Card
        title="Training & Corporate Placement Announcements"
        subtitle="Live recruitment schedules, shortlisted roll numbers, evaluation guidelines, and company advisories"
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 w-44 sm:w-56"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowPublishModal(true)}
            >
              Post Notice
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchNotices} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Sync
            </Button>
          </div>
        }
      >
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? notices.length
                : notices.filter((n) => n.category === cat).length;
            const isSelected = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
                    : 'bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#102A43] border border-[#CCFBF1]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notice List */}
        <div className="mt-4 space-y-4">
          {filteredNotices.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-1">
              <Megaphone className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700">No placement announcements in this category.</p>
              <p>Check other tabs or publish a new announcement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pinned Circulars */}
              {pinnedNotices.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0D9488] uppercase tracking-wider">
                    <Pin className="w-3.5 h-3.5 rotate-45 text-[#0D9488]" />
                    <span>Pinned Campus Placement Advisories</span>
                  </div>

                  {pinnedNotices.map((n) => (
                    <div
                      key={n._id}
                      className="p-5 rounded-2xl border-2 border-[#0D9488] bg-[#CCFBF1]/40 shadow-xs space-y-2 hover:bg-[#CCFBF1]/60 transition-all text-[#102A43]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="warning" size="sm">PINNED</Badge>
                          <Badge variant="teal" size="sm">{n.category}</Badge>
                          {n.companyName && (
                            <span className="font-bold text-xs text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                              {n.companyName}
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-slate-500 shrink-0">
                          {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-IN') : 'Recent'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                        {n.content}
                      </p>

                      <div className="pt-2 border-t border-amber-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                        <span>Issued by: {n.authorName || 'T&P Cell'}</span>
                        <span className="font-mono text-slate-400">
                          Batch of {n.targetBatch || 2026} • {(n.targetDepartments || []).join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Standard Bulletins */}
              <div className="space-y-3">
                {pinnedNotices.length > 0 && regularNotices.length > 0 && (
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                    Recent Recruitment Circulars
                  </h4>
                )}

                {regularNotices.map((n) => {
                  const isUrgent = n.category === 'Urgent';
                  const isSchedule = n.category === 'Interview Schedule';

                  return (
                    <div
                      key={n._id}
                      className="p-5 rounded-2xl border border-[#CCFBF1] bg-[#FFFFFF] hover:bg-[#CCFBF1]/20 transition-all shadow-xs space-y-2 text-[#102A43]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="teal"
                            size="sm"
                          >
                            {n.category}
                          </Badge>
                          {n.companyName && (
                            <span className="font-semibold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {n.companyName}
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-slate-500 shrink-0">
                          {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-IN') : 'Recent'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-normal">
                        {n.content}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{n.authorName || 'Office of Corporate Relations'}</span>
                        <span>Batch {n.targetBatch || 2026}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* MODAL: POST PLACEMENT NOTICE */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowPublishModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-teal-600" />
              Publish Placement Announcement
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Post recruitment circulars, company test instructions, or interview slots.</p>

            <form onSubmit={handlePublishSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Announcement Title *</label>
                <input
                  required
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. Amazon AWS SDE Intern: HackerRank Test Credentials Dispatched"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Tag (Optional)</label>
                  <input
                    type="text"
                    value={noticeForm.companyName}
                    onChange={(e) => setNoticeForm({ ...noticeForm, companyName: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Notice Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Drive Alert">Drive Alert</option>
                    <option value="Shortlist Announced">Shortlist Announced</option>
                    <option value="Interview Schedule">Interview Schedule</option>
                    <option value="Policy & Guidelines">Policy & Guidelines</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notice Content *</label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Provide test timing, roll numbers, venue room, or dress code guidelines..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Batch</label>
                  <input
                    type="number"
                    value={noticeForm.targetBatch}
                    onChange={(e) => setNoticeForm({ ...noticeForm, targetBatch: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Departments</label>
                  <input
                    type="text"
                    value={noticeForm.targetDepartments}
                    onChange={(e) => setNoticeForm({ ...noticeForm, targetDepartments: e.target.value })}
                    placeholder="All Departments or CSE, ECE"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-placement-notice"
                  checked={noticeForm.pinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="pin-placement-notice" className="font-medium text-slate-700 cursor-pointer">
                  Pin announcement to top of placement board
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowPublishModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementNotices;
