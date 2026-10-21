import React, { useState, useEffect } from 'react';
import {
  Clock,
  Bell,
  Plus,
  Trash2,
  Pin,
  Calendar,
  Building2,
  RefreshCw,
  Search,
  CheckCircle2,
  PinOff,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const AdminSchedule = () => {
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' | 'notices'
  const [timetables, setTimetables] = useState([]);
  const [notices, setNotices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Timetable Modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    department: '',
    course: '',
    faculty: '',
    semester: 7,
    section: 'A',
    dayOfWeek: 'Monday',
    startTime: '10:00',
    endTime: '11:00',
    classroom: 'LH-301',
    session: '2025-2026',
  });
  const [slotLoading, setSlotLoading] = useState(false);

  // Notice Modal
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All',
    pinned: false,
  });
  const [noticeLoading, setNoticeLoading] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ttRes, notRes, deptRes, courseRes, facRes] = await Promise.all([
        adminService.getTimetables(),
        adminService.getNotices(),
        adminService.getDepartments(),
        adminService.getCourses(),
        adminService.getFaculty(),
      ]);

      if (ttRes && ttRes.success) setTimetables(ttRes.timetables || []);
      if (notRes && notRes.success) setNotices(notRes.notices || []);
      if (deptRes && deptRes.success) setDepartments(deptRes.departments || []);
      if (courseRes && courseRes.success) setCourses(courseRes.courses || []);
      if (facRes && facRes.success) setFaculty(facRes.faculty || []);
    } catch (err) {
      setError(err.message || 'Failed to load schedule & notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddSlot = () => {
    setSlotForm({
      department: departments[0]?._id || '',
      course: courses[0]?._id || '',
      faculty: faculty[0]?.user?._id || faculty[0]?.user?.id || '',
      semester: 7,
      section: 'A',
      dayOfWeek: 'Monday',
      startTime: '10:00',
      endTime: '11:00',
      classroom: 'LH-301',
      session: '2025-2026',
    });
    setIsSlotModalOpen(true);
  };

  const handleSaveSlot = async (e) => {
    if (e) e.preventDefault();
    setSlotLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminService.createTimetable(slotForm);
      if (res && res.success) {
        setSuccess('Class slot scheduled successfully!');
        setIsSlotModalOpen(false);
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to schedule slot.');
    } finally {
      setSlotLoading(false);
    }
  };

  const handleSaveNotice = async (e) => {
    if (e) e.preventDefault();
    setNoticeLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminService.createNotice(noticeForm);
      if (res && res.success) {
        setSuccess('Official campus notice published!');
        setIsNoticeModalOpen(false);
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to publish notice.');
    } finally {
      setNoticeLoading(false);
    }
  };

  const handleTogglePinNotice = async (notice) => {
    try {
      const res = await adminService.updateNotice(notice._id, { pinned: !notice.pinned });
      if (res && res.success) {
        setSuccess(`Notice ${notice.pinned ? 'unpinned' : 'pinned to top'}.`);
        loadData();
      }
    } catch (err) {
      alert(`Pin toggle failed: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'timetable') {
        await adminService.deleteTimetable(deleteTarget.id);
        setSuccess('Timetable slot removed.');
      } else {
        await adminService.deleteNotice(deleteTarget.id);
        setSuccess('Notice deleted.');
      }
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const timetableColumns = [
    {
      key: 'dayOfWeek',
      header: 'Day of Week',
      render: (v) => <Badge variant="teal" size="sm">{v}</Badge>,
    },
    {
      key: 'time',
      header: 'Time Slot',
      render: (_, r) => (
        <span className="font-mono text-xs font-bold text-[#102A43]">
          {r.startTime} - {r.endTime}
        </span>
      ),
    },
    {
      key: 'course',
      header: 'Course & Subject',
      render: (c) => (
        <div>
          <p className="font-mono font-bold text-xs text-[#102A43]">{c?.courseCode || 'Course'}</p>
          <p className="text-[11px] text-[#102A43]/70 line-clamp-1">{c?.title}</p>
        </div>
      ),
    },
    {
      key: 'faculty',
      header: 'Instructor',
      render: (f) => <span className="text-xs font-semibold text-[#102A43]">{f?.name || 'Assigned Faculty'}</span>,
    },
    {
      key: 'classroom',
      header: 'Room',
      render: (v) => <span className="font-mono text-xs font-bold text-[#0D9488]">{v}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, r) => (
        <Button
          variant="danger"
          size="sm"
          className="text-xs"
          leftIcon={<Trash2 className="w-3 h-3" />}
          onClick={() => setDeleteTarget({ type: 'timetable', id: r._id, name: `${r.dayOfWeek} ${r.startTime}` })}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {success && (
        <AlertBanner
          variant="success"
          title="Operation Complete"
          message={success}
          dismissible
          onDismiss={() => setSuccess('')}
        />
      )}

      {error && (
        <AlertBanner
          variant="danger"
          title="Schedule & Notice Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 bg-[#CCFBF1]/30 border border-[#CCFBF1] rounded-xl">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('timetable')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'timetable'
                ? 'bg-[#0D9488] text-[#FFFFFF] shadow-xs'
                : 'text-[#102A43]/70 hover:text-[#102A43] hover:bg-[#CCFBF1]/50'
            }`}
          >
            Weekly Timetable Slots ({timetables.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notices')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notices'
                ? 'bg-[#0D9488] text-[#FFFFFF] shadow-xs'
                : 'text-[#102A43]/70 hover:text-[#102A43] hover:bg-[#CCFBF1]/50'
            }`}
          >
            Campus Notices & Broadcasts ({notices.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>

          {activeTab === 'timetable' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddSlot}
            >
              Add Class Slot
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                setNoticeForm({
                  title: '',
                  content: '',
                  category: 'General',
                  targetAudience: 'All',
                  pinned: false,
                });
                setIsNoticeModalOpen(true);
              }}
            >
              Publish Notice
            </Button>
          )}
        </div>
      </div>

      {/* Tab 1: Timetable */}
      {activeTab === 'timetable' && (
        <Card
          title="Master Weekly Institutional Timetable"
          subtitle="Classroom scheduling, faculty instruction slots, and room occupancy in MongoDB"
          badge={<Badge variant="teal" size="sm">{timetables.length} Active Slots</Badge>}
        >
          <Table
            columns={timetableColumns}
            data={timetables}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No timetable slots scheduled."
          />
        </Card>
      )}

      {/* Tab 2: Notices */}
      {activeTab === 'notices' && (
        <Card
          title="Official University Notices & Circulars"
          subtitle="Campus-wide broadcast bulletins and administrative announcements"
          badge={<Badge variant="teal" size="sm">{notices.length} Published</Badge>}
        >
          <div className="space-y-3">
            {notices.length === 0 ? (
              <p className="text-xs text-[#102A43]/70 py-8 text-center font-medium">No notices published yet.</p>
            ) : (
              notices.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 rounded-xl border transition-all ${
                    n.pinned
                      ? 'bg-[#CCFBF1]/30 border-[#0D9488] shadow-xs'
                      : 'bg-white border-[#CCFBF1]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {n.pinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0D9488] border border-[#0D9488]/40">
                          <Pin className="w-3 h-3 fill-[#0D9488] text-[#0D9488]" />
                          PINNED
                        </span>
                      )}
                      <Badge variant="teal" size="sm">{n.category}</Badge>
                      <Badge variant="neutral" size="sm">Audience: {n.targetAudience}</Badge>
                      <span className="text-[11px] text-[#102A43]/70 font-mono">
                        {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                        leftIcon={n.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                        onClick={() => handleTogglePinNotice(n)}
                      >
                        {n.pinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Trash2 className="w-3 h-3" />}
                        onClick={() => setDeleteTarget({ type: 'notice', id: n._id, name: n.title })}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#102A43]">{n.title}</h4>
                  <p className="text-xs text-[#102A43]/80 mt-1.5 leading-relaxed">{n.content}</p>
                  <p className="text-[10px] text-[#102A43]/60 mt-2 font-medium">
                    Issued by: {n.authorName || 'Campus Administration'}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Add Timetable Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Schedule Class Slot"
        description="Assigns faculty, classroom, and course slot with conflict checking"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={slotLoading}
              disabled={slotLoading}
              onClick={handleSaveSlot}
            >
              Schedule Slot
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">Department</label>
              <select
                value={slotForm.department}
                onChange={(e) => setSlotForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
                required
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">Course Subject</label>
              <select
                value={slotForm.course}
                onChange={(e) => setSlotForm((p) => ({ ...p, course: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
                required
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.courseCode} - {c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">Assigned Faculty</label>
              <select
                value={slotForm.faculty}
                onChange={(e) => setSlotForm((p) => ({ ...p, faculty: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
                required
              >
                {faculty.map((f) => (
                  <option key={f._id} value={f.user?._id || f.user?.id}>{f.user?.name || 'Faculty Member'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">Day of Week</label>
              <select
                value={slotForm.dayOfWeek}
                onChange={(e) => setSlotForm((p) => ({ ...p, dayOfWeek: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Start Time (HH:mm)"
                type="text"
                placeholder="10:00"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm((p) => ({ ...p, startTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="End Time (HH:mm)"
                type="text"
                placeholder="11:00"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm((p) => ({ ...p, endTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Classroom / Hall"
                type="text"
                placeholder="LH-301"
                value={slotForm.classroom}
                onChange={(e) => setSlotForm((p) => ({ ...p, classroom: e.target.value }))}
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        title="Broadcast Campus Notice"
        description="Publish official institutional announcement to campus portals"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsNoticeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={noticeLoading}
              disabled={noticeLoading}
              onClick={handleSaveNotice}
            >
              Broadcast Notice
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveNotice} className="space-y-4">
          <div>
            <Input
              label="Notice Headline / Title"
              type="text"
              placeholder="e.g. End-Semester Examination Admit Cards Available"
              value={noticeForm.title}
              onChange={(e) => setNoticeForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">Category</label>
              <select
                value={noticeForm.category}
                onChange={(e) => setNoticeForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Event">Event</option>
                <option value="Urgent">Urgent Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">Target Audience</label>
              <select
                value={noticeForm.targetAudience}
                onChange={(e) => setNoticeForm((p) => ({ ...p, targetAudience: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                <option value="All">All Campus Roles</option>
                <option value="Students">Students Only</option>
                <option value="Faculty">Faculty Only</option>
                <option value="Staff">Staff Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#102A43] mb-1.5">Notice Content / Body</label>
            <textarea
              rows={4}
              placeholder="Full official circular details..."
              value={noticeForm.content}
              onChange={(e) => setNoticeForm((p) => ({ ...p, content: e.target.value }))}
              className="w-full p-2.5 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#102A43]">
              <input
                type="checkbox"
                checked={noticeForm.pinned}
                onChange={(e) => setNoticeForm((p) => ({ ...p, pinned: e.target.checked }))}
                className="rounded text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span>Pin this notice to top of portals</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Removal"
        description={`Are you sure you want to delete ${deleteTarget?.name}?`}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-xs text-[#102A43]/80">This action will update the schedules and feeds in MongoDB.</p>
      </Modal>
    </div>
  );
};

export default AdminSchedule;
