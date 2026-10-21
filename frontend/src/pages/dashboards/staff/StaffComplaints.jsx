import React, { useState, useEffect } from 'react';
import {
  Wrench,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Pin,
  Megaphone,
  X,
  Edit,
  Save,
  MessageSquare,
  Building2,
  Bus,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { staffService } from '../../../services/api';

export const StaffComplaints = () => {
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'notices'
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'Hostel' | 'Transport'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [logForm, setLogForm] = useState({
    type: 'Hostel',
    category: 'Electrical',
    title: '',
    description: '',
    studentName: 'Resident Student',
    hostelBlock: 'Block A (Boys)',
    roomNumber: '',
    routeNumber: '',
    priority: 'Medium',
    assignedTo: 'Duty Technician',
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'In Progress',
    assignedTo: '',
    resolutionNotes: '',
  });

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All',
    pinned: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [compRes, notRes] = await Promise.all([
        staffService.getComplaints(),
        staffService.getNotices(),
      ]);

      if (compRes && compRes.success) setComplaints(compRes.complaints || []);
      if (notRes && notRes.success) setNotices(notRes.notices || []);
    } catch (err) {
      setError(err.message || 'Failed to load tickets and notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (c.ticketNumber || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.studentName || '').toLowerCase().includes(q) ||
      (c.hostelBlock || '').toLowerCase().includes(q) ||
      (c.routeNumber || '').toLowerCase().includes(q);

    return matchesType && matchesStatus && matchesPriority && matchesSearch;
  });

  // Handle Log Ticket
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logForm.title || !logForm.description) {
      alert('Title and description are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffService.createComplaint(logForm);
      if (res && res.success) {
        setSuccessMsg(`Ticket ${res.complaint?.ticketNumber} logged into maintenance queue.`);
        setShowLogModal(false);
        setLogForm({
          type: 'Hostel',
          category: 'Electrical',
          title: '',
          description: '',
          studentName: 'Resident Student',
          hostelBlock: 'Block A (Boys)',
          roomNumber: '',
          routeNumber: '',
          priority: 'Medium',
          assignedTo: 'Duty Technician',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to log ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Update Modal
  const openUpdateModal = (ticket) => {
    setActiveTicket(ticket);
    setUpdateForm({
      status: ticket.status || 'In Progress',
      assignedTo: ticket.assignedTo || 'Duty Officer',
      resolutionNotes: ticket.resolutionNotes || '',
    });
    setShowUpdateModal(true);
  };

  // Handle Update Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    setSubmitting(true);
    try {
      const res = await staffService.updateComplaint(activeTicket._id, updateForm);
      if (res && res.success) {
        setSuccessMsg(`Ticket ${activeTicket.ticketNumber} updated to status "${updateForm.status}".`);
        setShowUpdateModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to update ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Notice
  const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.content) {
      alert('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffService.createNotice(noticeForm);
      if (res && res.success) {
        setSuccessMsg('Service notice published on university circular board.');
        setShowNoticeModal(false);
        setNoticeForm({
          title: '',
          content: '',
          category: 'General',
          targetAudience: 'All',
          pinned: false,
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const openTicketsCount = complaints.filter((c) => c.status === 'Open').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  if (loading && complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-[#102A43]/70 font-medium">Loading complaints & circular bulletins...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Maintenance Desk Alert"
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

      {/* KPI Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#102A43] text-white p-5 rounded-2xl shadow-sm border border-[#102A43] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
          <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider block">Open Tickets</span>
          <span className="text-3xl font-bold font-mono text-white mt-1 block">{openTicketsCount}</span>
          <span className="text-xs text-[#CCFBF1]/80 font-medium mt-1 block">Pending initial dispatch</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#CCFBF1] shadow-xs hover:border-[#0D9488] transition-all">
          <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">In Progress</span>
          <span className="text-3xl font-bold font-mono text-[#0D9488] mt-1 block">{inProgressCount}</span>
          <span className="text-xs text-[#0D9488] font-semibold mt-1 block">Technicians assigned</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#CCFBF1] shadow-xs hover:border-[#0D9488] transition-all">
          <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">Resolved & Closed</span>
          <span className="text-3xl font-bold font-mono text-[#102A43] mt-1 block">{resolvedCount}</span>
          <span className="text-xs text-[#0D9488] font-semibold mt-1 block">Verified by duty officer</span>
        </div>
        <div className="bg-[#CCFBF1]/40 p-5 rounded-2xl border border-[#0D9488]/30 shadow-xs hover:border-[#0D9488] transition-all">
          <span className="text-xs font-bold text-[#102A43]/80 uppercase tracking-wider block">Service Bulletins</span>
          <span className="text-3xl font-bold font-mono text-[#102A43] mt-1 block">{notices.length}</span>
          <span className="text-xs text-[#102A43]/70 font-medium mt-1 block">Live Campus Circulars</span>
        </div>
      </div>

      {/* Tabs Switcher & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#CCFBF1]/30 rounded-2xl border border-[#CCFBF1] w-fit">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'complaints'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#102A43] hover:text-[#0D9488] hover:bg-[#CCFBF1]/40'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Hostel & Transport Complaints
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'complaints' ? 'bg-white/20 text-white' : 'bg-[#CCFBF1] text-[#102A43]'
              }`}
            >
              {complaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notices'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'text-[#102A43] hover:text-[#0D9488] hover:bg-[#CCFBF1]/40'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Announcements & Service Advisories
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'notices' ? 'bg-white/20 text-white' : 'bg-[#CCFBF1] text-[#102A43]'
              }`}
            >
              {notices.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'complaints' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowLogModal(true)}
            >
              Log Ticket
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowNoticeModal(true)}
            >
              Post Service Advisory
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <Card
          title="Maintenance & Transit Grievance Desk"
          subtitle="Real-time ticket ledger for electrical, plumbing, geyser, and transit delay issues"
          className="border border-[#CCFBF1] shadow-xs rounded-2xl overflow-hidden bg-white"
          headerAction={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#0D9488] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search ticket # or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs bg-[#F0FDFA] border border-[#CCFBF1] text-[#102A43] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9488] w-48 font-medium"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="ALL">All Types</option>
                <option value="Hostel">Hostel Only</option>
                <option value="Transport">Transport Only</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          }
        >
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#102A43]/60 font-medium">
              No tickets found matching your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0FDFA] text-[#102A43] font-bold uppercase tracking-wider text-[11px] border-b border-[#CCFBF1]">
                  <tr>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">Type & Category</th>
                    <th className="p-3.5">Title & Description</th>
                    <th className="p-3.5">Location / Context</th>
                    <th className="p-3.5 text-center">Priority</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Assigned Lead</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CCFBF1]/60">
                  {filteredComplaints.map((c) => {
                    const isUrgent = c.priority === 'High' || c.priority === 'Emergency';
                    return (
                      <tr key={c._id} className="hover:bg-[#CCFBF1]/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#0D9488]">
                          {c.ticketNumber}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-[#102A43] block">{c.type}</span>
                          <span className="text-[11px] text-[#102A43]/70">{c.category}</span>
                        </td>
                        <td className="p-3.5 max-w-sm">
                          <span className="font-bold text-[#102A43] block">{c.title}</span>
                          <span className="text-[11px] text-[#102A43]/70 block line-clamp-2 leading-relaxed">
                            {c.description}
                          </span>
                          {c.resolutionNotes && (
                            <span className="mt-1 text-[10px] text-[#0D9488] bg-[#CCFBF1] px-2 py-0.5 rounded-lg inline-block font-mono font-bold">
                              ✓ {c.resolutionNotes}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-[#102A43]">
                          {c.type === 'Hostel' ? (
                            <div>
                              <span className="font-medium block">{c.hostelBlock}</span>
                              <span className="text-[11px] font-mono text-[#102A43]/70">{c.roomNumber}</span>
                            </div>
                          ) : (
                            <span className="font-mono font-medium">{c.routeNumber}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge variant={isUrgent ? 'danger' : 'warning'} size="sm">
                            {c.priority}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge
                            variant={
                              c.status === 'Resolved'
                                ? 'teal'
                                : c.status === 'In Progress'
                                ? 'teal'
                                : 'warning'
                            }
                            size="sm"
                            hasDot
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-[#102A43]/80 font-mono text-[11px]">
                          {c.assignedTo || 'Unassigned'}
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Edit className="w-3.5 h-3.5" />}
                            onClick={() => openUpdateModal(c)}
                          >
                            Update
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: ANNOUNCEMENTS */}
      {activeTab === 'notices' && (
        <Card
          title="Important Announcements & Service Updates"
          subtitle="Notices for overhead water tank cleaning, transit route diversions, and curfew schedules"
          className="border border-[#CCFBF1] shadow-xs rounded-2xl overflow-hidden bg-white"
        >
          <div className="space-y-4">
            {notices.map((n) => (
              <div
                key={n._id}
                className="p-5 rounded-2xl border border-[#CCFBF1] bg-white hover:border-[#0D9488] hover:shadow-sm transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {n.pinned && (
                      <Badge variant="warning" size="sm">
                        PINNED
                      </Badge>
                    )}
                    <Badge variant={n.category === 'Urgent' ? 'danger' : 'teal'} size="sm">
                      {n.category || 'General'}
                    </Badge>
                    <h4 className="text-sm font-bold text-[#102A43]">{n.title}</h4>
                  </div>
                  <span className="text-xs font-mono text-[#102A43]/60 shrink-0">
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('en-IN') : 'Recent'}
                  </span>
                </div>

                <p className="text-xs text-[#102A43]/80 leading-relaxed whitespace-pre-line">
                  {n.content}
                </p>

                <div className="pt-3 border-t border-[#CCFBF1]/60 flex items-center justify-between text-[11px] text-[#102A43]/60">
                  <span>Issued by: {n.authorName || 'Campus Logistics & Facilities'}</span>
                  <span className="font-mono">Target: {n.targetAudience || 'All'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL: LOG NEW TICKET */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#102A43]/60 hover:text-[#102A43] hover:bg-[#CCFBF1]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#0D9488]" />
              Log Maintenance / Transit Complaint
            </h3>
            <p className="text-xs text-[#102A43]/70 mt-1">Submit a repair, facility maintenance, or transit irregularity ticket.</p>

            <form onSubmit={handleLogSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Ticket Type *</label>
                  <select
                    value={logForm.type}
                    onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    <option value="Hostel">Hostel Complex</option>
                    <option value="Transport">Transport Transit</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Category *</label>
                  <select
                    value={logForm.category}
                    onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="HVAC / Geyser">HVAC / Geyser</option>
                    <option value="Cleanliness">Cleanliness & Hygiene</option>
                    <option value="Bus Delay">Bus Delay</option>
                    <option value="Bus Route / Stop">Bus Route / Stop</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#102A43] block mb-1">Issue Title *</label>
                <input
                  required
                  type="text"
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                  placeholder="e.g. Geyser thermostat failure in 2nd floor washroom"
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#102A43] block mb-1">Detailed Description *</label>
                <textarea
                  required
                  rows={3}
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  placeholder="Provide precise location, symptoms, and severity..."
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {logForm.type === 'Hostel' ? (
                  <>
                    <div>
                      <label className="font-semibold text-[#102A43] block mb-1">Hostel Block</label>
                      <select
                        value={logForm.hostelBlock}
                        onChange={(e) => setLogForm({ ...logForm, hostelBlock: e.target.value })}
                        className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                      >
                        <option value="Block A (Boys)">Block A (Boys)</option>
                        <option value="Block B (Boys)">Block B (Boys)</option>
                        <option value="Block C (Girls)">Block C (Girls)</option>
                        <option value="Block D (Girls)">Block D (Girls)</option>
                        <option value="Block E (PG Wings)">Block E (PG Wings)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-[#102A43] block mb-1">Room Number</label>
                      <input
                        type="text"
                        value={logForm.roomNumber}
                        onChange={(e) => setLogForm({ ...logForm, roomNumber: e.target.value })}
                        placeholder="e.g. Room B-201"
                        className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="font-semibold text-[#102A43] block mb-1">Route Number</label>
                    <input
                      type="text"
                      value={logForm.routeNumber}
                      onChange={(e) => setLogForm({ ...logForm, routeNumber: e.target.value })}
                      placeholder="e.g. Route 4"
                      className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Priority</label>
                  <select
                    value={logForm.priority}
                    onChange={(e) => setLogForm({ ...logForm, priority: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Assign Technician / Lead</label>
                  <input
                    type="text"
                    value={logForm.assignedTo}
                    onChange={(e) => setLogForm({ ...logForm, assignedTo: e.target.value })}
                    placeholder="e.g. Electrician Ravi"
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#CCFBF1] flex items-center justify-end gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setShowLogModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Logging...' : 'Submit Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE TICKET STATUS */}
      {showUpdateModal && activeTicket && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowUpdateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#102A43]/60 hover:text-[#102A43] hover:bg-[#CCFBF1]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#0D9488]" />
              Update Ticket: {activeTicket.ticketNumber}
            </h3>
            <p className="text-xs text-[#102A43]/70 mt-0.5">{activeTicket.title}</p>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Ticket Status *</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Assigned Lead</label>
                  <input
                    type="text"
                    value={updateForm.assignedTo}
                    onChange={(e) => setUpdateForm({ ...updateForm, assignedTo: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#102A43] block mb-1">Resolution / Action Notes</label>
                <textarea
                  rows={3}
                  value={updateForm.resolutionNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, resolutionNotes: e.target.value })}
                  placeholder="Record work completed, components replaced, or dispatch outcome..."
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              <div className="pt-4 border-t border-[#CCFBF1] flex items-center justify-end gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Update Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST ADVISORY NOTICE */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowNoticeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#102A43]/60 hover:text-[#102A43] hover:bg-[#CCFBF1]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#0D9488]" />
              Publish Service Advisory
            </h3>
            <p className="text-xs text-[#102A43]/70 mt-1">Broadcast estate, maintenance, or transit updates to campus users.</p>

            <form onSubmit={handleNoticeSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#102A43] block mb-1">Advisory Title *</label>
                <input
                  required
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="e.g. Route 4 Morning Diversion — Metro Work"
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#102A43] block mb-1">Notice Content *</label>
                <textarea
                  required
                  rows={4}
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder="Provide complete guidelines, timing window, and alternate arrangements..."
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Category</label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    <option value="General">General Estate</option>
                    <option value="Urgent">Urgent / Alert</option>
                    <option value="Event">Campus Event</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#102A43] block mb-1">Target Audience</label>
                  <select
                    value={noticeForm.targetAudience}
                    onChange={(e) => setNoticeForm({ ...noticeForm, targetAudience: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-medium focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  >
                    <option value="All">All Campus</option>
                    <option value="Students">Students Only</option>
                    <option value="Staff">Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-advisory"
                  checked={noticeForm.pinned}
                  onChange={(e) => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
                  className="rounded text-[#0D9488] focus:ring-[#0D9488] accent-[#0D9488]"
                />
                <label htmlFor="pin-advisory" className="font-medium text-[#102A43] cursor-pointer">
                  Pin to top of notice board as critical advisory
                </label>
              </div>

              <div className="pt-4 border-t border-[#CCFBF1] flex items-center justify-end gap-2.5">
                <Button variant="secondary" size="sm" onClick={() => setShowNoticeModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish Advisory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffComplaints;
