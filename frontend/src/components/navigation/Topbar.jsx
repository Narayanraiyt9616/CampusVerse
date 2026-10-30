import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  ChevronDown,
  X,
  Loader2,
  Users,
  GraduationCap,
  IndianRupee,
  FileCheck2,
  BookOpen,
  LayoutDashboard,
  ExternalLink,
  CalendarCheck,
  Award,
  Clock,
  Settings,
  Building2,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ROLE_CONFIGS } from './roleConfigs';
import { useAuth } from '../../context/AuthContext';
import { searchService, studentService, facultyService, notificationService } from '../../services/api';

export const Topbar = ({
  role = 'student',
  onMenuToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.student;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [dbResults, setDbResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const notificationsRef = useRef(null);
  const roleMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isFacultyUser = role === 'faculty' || user?.role === 'faculty';
  const isStudentUser = role === 'student' || user?.role === 'student';

  const formatNotificationDate = (d) => {
    if (!d) return 'Just now';
    try {
      const date = new Date(d);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch {
      return 'Recent';
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

  const fetchLiveNotifications = async () => {
    try {
      // Unified notification service works across ALL portals (student, faculty, admin, parent, hostel, placement)
      const res = await notificationService.getMyNotifications({ limit: 25 });
      if (res && res.success && Array.isArray(res.data || res.notifications)) {
        setNotifications(res.data || res.notifications);
        return;
      }
    } catch {
      // Graceful fallback to legacy endpoints if necessary
      if (isStudentUser) {
        try {
          const res = await studentService.getMyNotifications({ limit: 25 });
          if (res && res.success && Array.isArray(res.data)) {
            setNotifications(res.data);
          }
        } catch {}
      } else if (isFacultyUser) {
        try {
          const res = await facultyService.getNotifications();
          if (res && res.success && Array.isArray(res.data || res.notifications)) {
            setNotifications(res.data || res.notifications);
          }
        } catch {}
      }
    }
  };

  const userId = user?._id || user?.id || user?.email;
  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 30000);
    return () => clearInterval(interval);
  }, [role, userId]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      if (isFacultyUser) {
        await facultyService.markAllNotificationsRead().catch(() => {});
      } else {
        await studentService.markAllNotificationsRead().catch(() => {});
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    if (!id) return;
    setDeletingId(id);
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      if (isStudentUser) {
        try {
          await studentService.deleteNotification(id);
          setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
        } catch {}
      } else if (isFacultyUser) {
        try {
          await facultyService.deleteNotification(id);
          setNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
        } catch {}
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      if (isStudentUser) {
        try {
          await studentService.clearAllNotifications();
          setNotifications([]);
          setShowClearConfirm(false);
        } catch {}
      } else if (isFacultyUser) {
        try {
          await facultyService.clearAllNotifications();
          setNotifications([]);
          setShowClearConfirm(false);
        } catch {}
      }
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead && notif._id) {
      try {
        await notificationService.markNotificationRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch {
        if (isFacultyUser) {
          await facultyService.markNotificationRead(notif._id).catch(() => {});
        } else {
          await studentService.markNotificationRead(notif._id).catch(() => {});
        }
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
    }
    setShowNotifications(false);
    if (notif.type === 'PLACEMENT_DRIVE' || notif.category === 'Placement') {
      navigate('/student/placement');
    } else if (notif.type === 'ASSIGNMENT_PUBLISHED' || notif.type === 'ASSIGNMENT_EVALUATION') {
      navigate('/student/assignments');
    } else if (notif.type === 'ASSIGNMENT_SUBMISSION') {
      navigate('/faculty/assignments');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const mockNotifications = [
    { id: 'm1', title: 'Academic Calendar Schedule Updated', time: '10 mins ago', unread: true },
    { id: 'm2', title: 'Fee Statement Receipt Verified', time: '2 hours ago', unread: false },
    { id: 'm3', title: 'Placement Drive Schedule Live', time: 'Yesterday', unread: false },
  ];

  // Match local role navigation sections
  const matchedNavSections = searchQuery.trim().length >= 2
    ? (config.menuItems || []).filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  // Mutually exclusive toggle handlers
  const handleToggleNotifications = () => {
    if (showNotifications) {
      setShowNotifications(false);
      setShowClearConfirm(false);
    } else {
      setShowRoleMenu(false);
      setShowSearchResults(false);
      setIsMobileSearchOpen(false);
      setShowNotifications(true);
    }
  };

  const handleToggleRoleMenu = () => {
    if (showRoleMenu) {
      setShowRoleMenu(false);
    } else {
      setShowNotifications(false);
      setShowClearConfirm(false);
      setShowSearchResults(false);
      setIsMobileSearchOpen(false);
      setShowRoleMenu(true);
    }
  };

  // Global keyboard shortcut: Ctrl+K / Cmd+K to focus search, Escape to close all panels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowNotifications(false);
        setShowRoleMenu(false);
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setShowSearchResults(true);
        } else if (mobileSearchInputRef.current) {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
        }
      } else if (e.key === 'Escape') {
        setShowSearchResults(false);
        setIsMobileSearchOpen(false);
        setShowNotifications(false);
        setShowRoleMenu(false);
        setShowClearConfirm(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to dismiss search, notifications, or role menu dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
        setShowClearConfirm(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-close all open floating dropdowns and panels whenever route or section changes
  useEffect(() => {
    setShowNotifications(false);
    setShowRoleMenu(false);
    setShowSearchResults(false);
    setIsMobileSearchOpen(false);
    setShowClearConfirm(false);
  }, [location.pathname, location.search]);

  // Debounced database search query
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setDbResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchService.globalSearch(q);
        if (res && res.success) {
          setDbResults(res.results || []);
        } else {
          setDbResults([]);
        }
      } catch (err) {
        console.warn('Search query error:', err);
        setDbResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (url) => {
    setShowSearchResults(false);
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    if (url) {
      navigate(url);
    }
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'student':
        return <Users className="w-3.5 h-3.5 text-[#D99A00]" />;
      case 'faculty':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
      case 'fee':
        return <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />;
      case 'admit-card':
        return <FileCheck2 className="w-3.5 h-3.5 text-[#D99A00]" />;
      case 'course':
        return <BookOpen className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Search className="w-3.5 h-3.5 text-[#4B5563]" />;
    }
  };

  const hasAnyResults = matchedNavSections.length > 0 || dbResults.length > 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#F1E7CF] shadow-[0_2px_16px_rgba(217,119,6,0.04)] px-4 sm:px-6 flex items-center justify-between">
      {/* ──────────────────────────────────────────────────────────────────────────
          Left: Mobile Hamburger & Search Bar
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-[#111827] hover:bg-[#FFF8E6] focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Search Toggle Button */}
        <button
          type="button"
          onClick={() => {
            setShowNotifications(false);
            setShowRoleMenu(false);
            setIsMobileSearchOpen(true);
            setTimeout(() => mobileSearchInputRef.current?.focus(), 150);
          }}
          className="sm:hidden p-2 rounded-xl border border-[#F1E7CF] text-[#111827] hover:bg-[#FFF8E6] transition-colors"
          title="Open Search"
          aria-label="Open Search"
        >
          <Search className="w-4 h-4 text-[#D99A00]" />
        </button>

        {/* Desktop / Tablet Live Search Input Container */}
        <div ref={searchContainerRef} className="relative w-full max-w-md hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setShowNotifications(false);
                setShowRoleMenu(false);
                if (searchQuery.trim().length >= 2) setShowSearchResults(true);
              }}
              placeholder="Search courses, roll numbers, fees, admit cards..."
              className="w-full pl-10 pr-20 py-2 rounded-xl border border-[#F1E7CF] bg-[#FFFDF5] text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:border-[#D99A00] focus:ring-2 focus:ring-[#D99A00]/20 transition-all font-medium"
              aria-label="Campus Search"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDbResults([]);
                    setShowSearchResults(false);
                  }}
                  className="p-1 rounded-md text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F1E7CF]/50 text-[#64748B] uppercase">
                ⌘K
              </span>
            </div>
          </div>

          {/* Search Dropdown Overlay */}
          {showSearchResults && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-[#F1E7CF] shadow-2xl z-50 overflow-hidden max-h-[460px] flex flex-col">
              <div className="px-4 py-2 bg-[#FFFDF5] border-b border-[#F1E7CF] flex items-center justify-between text-xs text-[#4B5563]">
                <span className="font-bold text-[#111827]">
                  Search Results for "{searchQuery}"
                </span>
                {isSearching && (
                  <span className="flex items-center gap-1 text-[#D99A00] font-semibold text-[11px]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Querying records...
                  </span>
                )}
              </div>

              <div className="overflow-y-auto divide-y divide-[#F1E7CF]">
                {/* 1. Portal Navigation Shortcuts */}
                {matchedNavSections.length > 0 && (
                  <div className="p-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">
                      Portal Sections
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {matchedNavSections.map((navItem) => (
                        <button
                          key={navItem.to}
                          type="button"
                          onClick={() => handleSelectResult(navItem.to)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#FFF8E6] transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#FFF8E6] border border-[#F1E7CF] text-[#D99A00] flex items-center justify-center shrink-0 group-hover:bg-[#D99A00] group-hover:text-white transition-colors">
                              <LayoutDashboard className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-xs text-[#111827]">
                              {navItem.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#4B5563] font-semibold bg-white border border-[#F1E7CF] px-2 py-0.5 rounded-md">
                            Section
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Live Database Records */}
                {dbResults.length > 0 && (
                  <div className="p-2">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">
                      University Records ({dbResults.length})
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dbResults.map((record) => (
                        <button
                          key={record.id || `${record.type}-${record.title}`}
                          type="button"
                          onClick={() => handleSelectResult(record.url)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-[#FFF8E6] transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                              {getRecordIcon(record.type)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-[#111827] truncate group-hover:text-[#D99A00] transition-colors">
                                {record.title}
                              </p>
                              <p className="text-[11px] text-[#4B5563] truncate font-medium">
                                {record.subtitle}
                              </p>
                            </div>
                          </div>
                          {record.badge && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] shrink-0">
                              {record.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Empty State */}
                {!isSearching && !hasAnyResults && (
                  <div className="p-8 text-center text-xs text-[#4B5563]">
                    <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-[#111827]">No records found</p>
                    <p className="mt-1 font-medium">
                      No matching sections, students, faculty, or invoices for "{searchQuery}".
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          Mobile Search Full-Screen Overlay
      ────────────────────────────────────────────────────────────────────────── */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col p-3 sm:hidden">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#F1E7CF] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-3 border-b border-[#F1E7CF] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#D99A00] shrink-0" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, roll numbers, fees..."
                className="w-full text-xs font-semibold text-[#111827] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#4B5563]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-2 divide-y divide-[#F1E7CF]">
              {isSearching ? (
                <div className="p-6 text-center text-xs text-[#4B5563]">
                  <Loader2 className="w-5 h-5 text-[#D99A00] animate-spin mx-auto mb-2" />
                  Searching records...
                </div>
              ) : hasAnyResults ? (
                <>
                  {matchedNavSections.map((navItem) => (
                    <button
                      key={navItem.to}
                      type="button"
                      onClick={() => handleSelectResult(navItem.to)}
                      className="w-full flex items-center justify-between p-2.5 text-left hover:bg-[#FFF8E6] text-xs font-bold text-[#111827]"
                    >
                      <span>{navItem.label}</span>
                      <span className="text-[10px] text-[#4B5563] bg-slate-100 px-2 py-0.5 rounded">Section</span>
                    </button>
                  ))}
                  {dbResults.map((record) => (
                    <button
                      key={record.id || record.title}
                      type="button"
                      onClick={() => handleSelectResult(record.url)}
                      className="w-full flex items-center justify-between p-2.5 text-left hover:bg-[#FFF8E6]"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-xs text-[#111827] truncate">{record.title}</p>
                        <p className="text-[11px] text-[#4B5563] truncate">{record.subtitle}</p>
                      </div>
                      {record.badge && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFF8E6] text-[#D99A00]">
                          {record.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-6 text-center text-xs text-[#4B5563]">
                  {searchQuery.trim().length >= 2 ? `No records found for "${searchQuery}".` : 'Type at least 2 characters to search...'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          Right Controls: User Identity, Portal Switcher, Alerts, Logout
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* User Identity Pill - Matching Reference Image */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FFF8E6] border border-[#FDE68A] text-xs shadow-xs">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white flex items-center justify-center font-black text-xs uppercase shadow-xs ring-1 ring-[#FDE68A]">
            {(user?.name || user?.username || 'U')[0]}
          </div>
          <div className="text-left hidden md:block">
            <span className="font-bold text-[#0F172A] block text-xs leading-tight">
              {user?.name || user?.username || 'Authenticated User'}
            </span>
            <span className="text-[10px] text-[#B45309] font-bold capitalize block leading-tight">
              {config.label}
            </span>
          </div>
        </div>

        {/* Role Switcher Dropdown */}
        <div ref={roleMenuRef} className="relative">
          <button
            type="button"
            onClick={handleToggleRoleMenu}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] hover:border-[#FDE68A] text-xs font-bold text-[#0F172A] transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
            aria-expanded={showRoleMenu}
            aria-label="Switch portal view"
          >
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <span className="hidden md:inline">Portals</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#0F172A]" />
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#F1E7CF] shadow-elevation py-2 z-50 text-xs"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-4 py-2 border-b border-[#F1E7CF] text-[11px] font-bold text-[#111827] uppercase tracking-wider">
                Select Portal View
              </div>
              <Link
                to="/student"
                state={{ targetPortal: 'student', portalLogin: '/login/student', attemptedPath: '/student' }}
                onClick={() => {
                  try {
                    sessionStorage.setItem('campusverse_selected_portal', '/login/student');
                  } catch (e) {}
                }}
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'student' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                1. Student Dashboard
              </Link>
              <Link
                to="/faculty"
                state={{ targetPortal: 'faculty', portalLogin: '/login/faculty', attemptedPath: '/faculty' }}
                onClick={() => {
                  try {
                    sessionStorage.setItem('campusverse_selected_portal', '/login/faculty');
                  } catch (e) {}
                }}
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'faculty' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                2. Faculty Dashboard
              </Link>
              <Link
                to="/admin"
                state={{ targetPortal: 'admin', portalLogin: '/login/admin', attemptedPath: '/admin' }}
                onClick={() => {
                  try {
                    sessionStorage.setItem('campusverse_selected_portal', '/login/admin');
                  } catch (e) {}
                }}
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'admin' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                3. Administrator Dashboard
              </Link>
              <Link
                to="/parent"
                state={{ targetPortal: 'parent', portalLogin: '/login/parent', attemptedPath: '/parent' }}
                onClick={() => {
                  try {
                    sessionStorage.setItem('campusverse_selected_portal', '/login/parent');
                  } catch (e) {}
                }}
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'parent' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                4. Parent / Guardian Portal
              </Link>
              <Link
                to="/placement"
                state={{ targetPortal: 'placement', portalLogin: '/login/placement', attemptedPath: '/placement' }}
                onClick={() => {
                  try {
                    sessionStorage.setItem('campusverse_selected_portal', '/login/placement');
                  } catch (e) {}
                }}
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'placement' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                5. Placement Cell Dashboard
              </Link>
              <Link
                to="/hostel"
                state={{ targetPortal: 'hostel', portalLogin: '/login/hostel', attemptedPath: '/hostel' }}
                onClick={() => {
                  try {
                    sessionStorage.setItem('campusverse_selected_portal', '/login/hostel');
                  } catch (e) {}
                }}
                className={`block px-4 py-2.5 hover:bg-[#FFF8E6] transition-colors ${role === 'staff' || role === 'hostel' ? 'text-[#D99A00] font-bold bg-[#FFF8E6]' : 'text-[#111827] font-semibold'}`}
              >
                6. Hostel Portal
              </Link>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="p-2.5 rounded-xl border border-[#F1E7CF] bg-white text-[#111827] hover:bg-[#FFF8E6] focus:outline-none focus:ring-2 focus:ring-[#D99A00] relative"
            aria-expanded={showNotifications}
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D99A00] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D99A00] ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-88 sm:w-96 rounded-2xl bg-white border border-[#F1E7CF] shadow-elevation py-2 z-50 text-xs"
            >
              <div className="px-4 py-2.5 border-b border-[#F1E7CF] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#111827] text-sm">Campus Alerts</span>
                  {notifications.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FFF8E6] text-[#D99A00] font-bold text-[10px] border border-[#F1E7CF]">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#D99A00] font-bold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-[11px] text-red-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      title="Clear all alerts"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Clear All Confirmation Banner */}
              {showClearConfirm && (
                <div className="p-3 bg-red-50/80 border-b border-red-200 text-xs">
                  <div className="flex items-start gap-2 text-red-900 font-semibold mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>Are you sure you want to delete all notifications? This action cannot be undone.</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      disabled={isClearingAll}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      disabled={isClearingAll}
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {isClearingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      {isClearingAll ? 'Clearing...' : 'Yes, Clear All'}
                    </button>
                  </div>
                </div>
              )}

              <div className="divide-y divide-[#F1E7CF] max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n._id || n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 hover:bg-[#FFF8E6]/50 transition-colors cursor-pointer group relative ${
                        !n.isRead ? 'bg-[#FFFDF5]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#D99A00] shrink-0" />}
                          <p className="font-bold text-[#111827] text-xs leading-snug truncate">{n.title}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(e, n._id || n.id)}
                          disabled={deletingId === (n._id || n.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-70 group-hover:opacity-100 transition-all shrink-0 cursor-pointer"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          {deletingId === (n._id || n.id) ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#4B5563] mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[10px]">
                        <span className="text-[#D99A00] font-bold">
                          {n.companyName
                            ? `${n.companyName} • ${n.jobRole || 'Opportunity'}`
                            : formatNotificationDate(n.createdAt)}
                        </span>
                        <span className="text-[#64748B] flex items-center gap-1 font-medium bg-[#FFFDF5] px-1.5 py-0.5 rounded border border-[#F1E7CF]">
                          <Clock className="w-2.5 h-2.5 text-[#D99A00]" />
                          {getRemainingHours(n)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#64748B]">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-[#111827] text-xs">No active alerts</p>
                    <p className="text-[11px] mt-0.5">All notifications auto-delete 48 hours after creation.</p>
                  </div>
                )}
              </div>
              <div className="p-2.5 border-t border-[#F1E7CF] text-center bg-[#FFFDF5] rounded-b-2xl flex items-center justify-center gap-1 text-[11px] text-[#64748B] font-medium">
                <Clock className="w-3 h-3 text-[#D99A00]" />
                <span>Auto-deletes after 48 hours • Real-time CampusVerse AI Alerts</span>
              </div>
            </div>
          )}
        </div>

        {/* Authentication Sign Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#F1E7CF] text-xs font-bold text-[#111827] hover:bg-[#FFF8E6] transition-colors"
          title="Sign out of CampusVerse"
        >
          <LogOut className="w-4 h-4 text-[#111827]" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default React.memo(Topbar);
