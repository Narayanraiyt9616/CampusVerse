import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Bed,
  DoorOpen,
  Wrench,
  UserPlus,
  Trash2,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { staffService, studentService } from '../../../services/api';

const BLOCKS = [
  'All Blocks',
  'Block A (Boys)',
  'Block B (Boys)',
  'Block C (Girls)',
  'Block D (Girls)',
  'Block E (PG Wings)',
];

export const StaffHostel = () => {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'allocations' | 'complaints'
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [selectedBlock, setSelectedBlock] = useState('All Blocks');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [allocateForm, setAllocateForm] = useState({
    studentId: '',
    roomId: '',
    bedNumber: 'Bed 1',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Parent',
    remarks: '',
  });

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    block: 'Block A (Boys)',
    floor: 1,
    roomType: 'Double',
    capacity: 2,
    monthlyRent: 4800,
    amenities: 'Wi-Fi, Attached Bath, Study Desk',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [roomsRes, allocsRes, complaintsRes, studentsRes] = await Promise.all([
        staffService.getHostelRooms(),
        staffService.getHostelAllocations(),
        staffService.getComplaints({ type: 'Hostel' }),
        studentService.getAll(),
      ]);

      if (roomsRes && roomsRes.success) setRooms(roomsRes.rooms || []);
      if (allocsRes && allocsRes.success) setAllocations(allocsRes.allocations || []);
      if (complaintsRes && complaintsRes.success) setComplaints(complaintsRes.complaints || []);
      if (studentsRes && studentsRes.success) setAllStudents(studentsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load hostel records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesBlock =
      selectedBlock === 'All Blocks' || r.block === selectedBlock;
    const matchesStatus =
      statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.block.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBlock && matchesStatus && matchesSearch;
  });

  // Filtered allocations
  const filteredAllocations = allocations.filter((a) => {
    const name = a.student?.name || '';
    const id = a.student?.studentId || '';
    const room = a.room?.roomNumber || '';
    const block = a.room?.block || '';
    const q = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      room.toLowerCase().includes(q) ||
      block.toLowerCase().includes(q)
    );
  });

  // Handle Allocate Bed
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocateForm.studentId || !allocateForm.roomId) {
      alert('Please select both a student and a hostel room.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffService.allocateHostelBed({
        studentId: allocateForm.studentId,
        roomId: allocateForm.roomId,
        bedNumber: allocateForm.bedNumber,
        emergencyContact: {
          name: allocateForm.emergencyContactName,
          phone: allocateForm.emergencyContactPhone,
          relation: allocateForm.emergencyContactRelation,
        },
        remarks: allocateForm.remarks,
      });

      if (res && res.success) {
        setSuccessMsg('Hostel bed successfully allocated to student.');
        setShowAllocateModal(false);
        setAllocateForm({
          studentId: '',
          roomId: '',
          bedNumber: 'Bed 1',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: 'Parent',
          remarks: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to allocate hostel bed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Vacate Bed
  const handleVacate = async (allocationId) => {
    if (!window.confirm('Are you sure you want to mark this resident bed as vacated?')) return;
    try {
      const res = await staffService.vacateHostelBed(allocationId);
      if (res && res.success) {
        setSuccessMsg('Resident marked as vacated and bed restored to inventory.');
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to vacate bed.');
    }
  };

  // Handle Create Room
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber) {
      alert('Room number is required.');
      return;
    }
    setSubmitting(true);
    try {
      const amenitiesArr = roomForm.amenities.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await staffService.createHostelRoom({
        roomNumber: roomForm.roomNumber,
        block: roomForm.block,
        floor: Number(roomForm.floor),
        roomType: roomForm.roomType,
        capacity: Number(roomForm.capacity),
        monthlyRent: Number(roomForm.monthlyRent),
        amenities: amenitiesArr,
      });

      if (res && res.success) {
        setSuccessMsg(`Room ${roomForm.roomNumber} registered in inventory.`);
        setShowAddRoomModal(false);
        setRoomForm({
          roomNumber: '',
          block: 'Block A (Boys)',
          floor: 1,
          roomType: 'Double',
          capacity: 2,
          monthlyRent: 4800,
          amenities: 'Wi-Fi, Attached Bath, Study Desk',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to register room.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate live room availability stats
  const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupiedBeds || 0), 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

  if (loading && rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-[#102A43]/70 font-semibold">Loading residential inventory & records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Hostel Management Error"
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

      {/* Summary KPI Ribbon matching Student Portal metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-5 rounded-2xl bg-[#102A43] text-white shadow-sm">
          <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider block">Total Rooms</span>
          <span className="text-2xl font-extrabold font-mono text-white mt-1.5 block">{rooms.length}</span>
          <span className="text-xs text-[#CCFBF1] font-medium mt-0.5 block">Across 5 Blocks</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
          <span className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider block">Bed Capacity</span>
          <span className="text-2xl font-extrabold font-mono text-[#102A43] mt-1.5 block">{totalBeds} Beds</span>
          <span className="text-xs text-[#102A43]/70 font-medium mt-0.5 block">Furnished Inventory</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
          <span className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider block">Occupied Beds</span>
          <span className="text-2xl font-extrabold font-mono text-[#0D9488] mt-1.5 block">{occupiedBeds}</span>
          <span className="text-xs text-[#0D9488] font-bold mt-0.5 block">{Math.round((occupiedBeds / (totalBeds || 1)) * 100)}% Occupancy</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#CCFBF1] border border-[#0D9488] text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#102A43] block">Available Beds</span>
          <span className="text-2xl font-extrabold font-mono text-[#102A43] mt-1.5 block">{availableBeds}</span>
          <span className="text-xs text-[#102A43] font-semibold mt-0.5 block">Ready for check-in</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm">
          <span className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider block">Maintenance</span>
          <span className="text-2xl font-extrabold font-mono text-[#102A43] mt-1.5 block">{maintenanceRooms}</span>
          <span className="text-xs text-[#102A43]/70 font-medium mt-0.5 block">Civil / Electrical tasks</span>
        </div>
      </div>

      {/* Tabs Switcher & Actions Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="p-1.5 rounded-2xl bg-[#CCFBF1]/30 border border-[#CCFBF1] flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
                : 'text-[#102A43] hover:bg-[#CCFBF1]'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            Hostel Rooms & Inventory
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'rooms' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
            }`}>
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'allocations'
                ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
                : 'text-[#102A43] hover:bg-[#CCFBF1]'
            }`}
          >
            <Users className="w-4 h-4" />
            Student Accommodations
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'allocations' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
            }`}>
              {allocations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
                : 'text-[#102A43] hover:bg-[#CCFBF1]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Hostel Complaints
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'complaints' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
            }`}>
              {complaints.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddRoomModal(true)}
          >
            Add Room
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setShowAllocateModal(true)}
          >
            Allocate Bed
          </Button>
        </div>
      </div>

      {/* TAB 1: HOSTEL ROOMS INVENTORY */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <Card
            title="Hostel Rooms & Bed Availability"
            subtitle="Live status, capacity, occupancy, and room amenities per residential complex"
            headerAction={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#102A43]/60 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search room #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488] w-36 sm:w-44"
                  />
                </div>

                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                >
                  {BLOCKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Available">Available Beds</option>
                  <option value="Fully Occupied">Fully Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            }
          >
            {filteredRooms.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#102A43]/60 font-semibold">
                No rooms found matching the selected filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0FDFA] text-[#102A43] font-bold text-xs uppercase tracking-wider border-b border-[#CCFBF1]">
                    <tr>
                      <th className="p-3.5">Room #</th>
                      <th className="p-3.5">Hostel Complex</th>
                      <th className="p-3.5">Floor</th>
                      <th className="p-3.5">Room Type</th>
                      <th className="p-3.5 text-center">Capacity</th>
                      <th className="p-3.5 text-center">Occupied</th>
                      <th className="p-3.5 text-center">Available</th>
                      <th className="p-3.5">Amenities</th>
                      <th className="p-3.5 text-right">Rent / Mo</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CCFBF1]">
                    {filteredRooms.map((r) => {
                      const avail = Math.max(0, r.capacity - r.occupiedBeds);
                      return (
                        <tr key={r._id} className="hover:bg-[#CCFBF1]/30 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#102A43] text-sm">
                            {r.roomNumber}
                          </td>
                          <td className="p-3.5 font-bold text-[#102A43]">
                            {r.block}
                          </td>
                          <td className="p-3.5 font-mono font-medium text-[#102A43]/70">
                            Floor {r.floor}
                          </td>
                          <td className="p-3.5">
                            <Badge variant="neutral" size="sm">{r.roomType}</Badge>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#102A43]">
                            {r.capacity}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#0D9488]">
                            {r.occupiedBeds}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#0D9488]">
                            {avail}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(r.amenities || []).map((am, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#CCFBF1] text-[#102A43] font-mono font-semibold">
                                  {am}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-[#102A43]">
                            ₹{(r.monthlyRent || 4500).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right">
                            <Badge
                              variant={
                                r.status === 'Available'
                                  ? 'teal'
                                  : r.status === 'Maintenance'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                              hasDot
                            >
                              {r.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: STUDENT ACCOMMODATIONS */}
      {activeTab === 'allocations' && (
        <Card
          title="Student Accommodation Records"
          subtitle="Registered residential students, room allotments, bed assignments, and emergency contacts"
          headerAction={
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#102A43]/60 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488] w-52"
              />
            </div>
          }
        >
          {filteredAllocations.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#102A43]/60 font-semibold">
              No accommodation records found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0FDFA] text-[#102A43] font-bold text-xs uppercase tracking-wider border-b border-[#CCFBF1]">
                  <tr>
                    <th className="p-3.5">Student Name & Roll #</th>
                    <th className="p-3.5">Hostel Block</th>
                    <th className="p-3.5">Room & Bed</th>
                    <th className="p-3.5">Check-In Date</th>
                    <th className="p-3.5">Emergency Contact</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CCFBF1]">
                  {filteredAllocations.map((a) => {
                    const isActive = a.status === 'Active';
                    return (
                      <tr key={a._id} className="hover:bg-[#CCFBF1]/30 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-[#102A43] block">{a.student?.name || 'Student'}</span>
                          <span className="text-[11px] font-mono text-[#0D9488] font-bold block">
                            {a.student?.studentId} • Sem {a.student?.semester || 7}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#102A43]">
                          {a.room?.block || 'Hostel Block'}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-[#102A43] block">Room {a.room?.roomNumber}</span>
                          <span className="text-[11px] text-[#102A43]/70 font-semibold">{a.bedNumber}</span>
                        </td>
                        <td className="p-3.5 font-mono font-medium text-[#102A43]">
                          {a.checkInDate ? new Date(a.checkInDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="p-3.5 text-[#102A43]">
                          {a.emergencyContact?.name ? (
                            <div>
                              <span className="font-bold text-[#102A43] block">
                                {a.emergencyContact.name} ({a.emergencyContact.relation || 'Guardian'})
                              </span>
                              <span className="text-[11px] font-mono text-[#102A43]/70 font-semibold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#0D9488]" />
                                {a.emergencyContact.phone}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#102A43]/50 italic">Not specified</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge variant={isActive ? 'teal' : 'neutral'} size="sm" hasDot>
                            {a.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          {isActive && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleVacate(a._id)}
                            >
                              Vacate Bed
                            </Button>
                          )}
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

      {/* TAB 3: HOSTEL COMPLAINTS */}
      {activeTab === 'complaints' && (
        <Card
          title="Hostel Facility Complaints"
          subtitle="Maintenance requests logged for plumbing, electrical, solar geysers, and hygiene"
        >
          {complaints.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#102A43]/60 font-semibold">
              Zero complaints logged for hostel residential halls.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0FDFA] text-[#102A43] font-bold text-xs uppercase tracking-wider border-b border-[#CCFBF1]">
                  <tr>
                    <th className="p-3.5">Ticket #</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Category & Title</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-center">Priority</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CCFBF1]">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-[#CCFBF1]/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#0D9488]">
                        {c.ticketNumber}
                      </td>
                      <td className="p-3.5 font-bold text-[#102A43]">
                        <span>{c.hostelBlock}</span>
                        {c.roomNumber && <span className="block text-[11px] font-mono text-[#102A43]/70 font-semibold">{c.roomNumber}</span>}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="neutral" size="sm">{c.category}</Badge>
                        <span className="font-bold text-[#102A43] block mt-1">{c.title}</span>
                      </td>
                      <td className="p-3.5 text-[#102A43]/80 max-w-xs text-[11px] font-medium">
                        {c.description}
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge variant={c.priority === 'High' ? 'danger' : 'warning'} size="sm">
                          {c.priority}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge
                          variant={c.status === 'Resolved' ? 'teal' : c.status === 'In Progress' ? 'teal' : 'warning'}
                          size="sm"
                          hasDot
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-[#102A43] font-mono text-[11px] font-semibold">
                        {c.assignedTo || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* MODAL: ALLOCATE BED TO STUDENT */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAllocateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#102A43]/60 hover:text-[#102A43] hover:bg-[#CCFBF1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#0D9488]" />
              Allocate Hostel Bed
            </h3>
            <p className="text-xs text-[#102A43]/70 font-medium mt-1">Assign an available hostel bed to a registered university student.</p>

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#102A43] block mb-1">Select Student *</label>
                <select
                  required
                  value={allocateForm.studentId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                >
                  <option value="">-- Choose Student --</option>
                  {allStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId}) — {s.department?.name || 'Department'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#102A43] block mb-1">Select Available Room *</label>
                <select
                  required
                  value={allocateForm.roomId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, roomId: e.target.value })}
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                >
                  <option value="">-- Choose Room with Available Bed --</option>
                  {rooms
                    .filter((r) => r.status === 'Available' && r.occupiedBeds < r.capacity)
                    .map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.block} • Room {r.roomNumber} ({r.roomType}) — {r.capacity - r.occupiedBeds} beds free
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Bed Number</label>
                  <input
                    type="text"
                    value={allocateForm.bedNumber}
                    onChange={(e) => setAllocateForm({ ...allocateForm, bedNumber: e.target.value })}
                    placeholder="e.g. Bed 1 (Window Side)"
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Relation</label>
                  <select
                    value={allocateForm.emergencyContactRelation}
                    onChange={(e) => setAllocateForm({ ...allocateForm, emergencyContactRelation: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={allocateForm.emergencyContactName}
                    onChange={(e) => setAllocateForm({ ...allocateForm, emergencyContactName: e.target.value })}
                    placeholder="Name"
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={allocateForm.emergencyContactPhone}
                    onChange={(e) => setAllocateForm({ ...allocateForm, emergencyContactPhone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#102A43] block mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={allocateForm.remarks}
                  onChange={(e) => setAllocateForm({ ...allocateForm, remarks: e.target.value })}
                  placeholder="Additional accommodation notes..."
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

              <div className="pt-3 border-t border-[#CCFBF1] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAllocateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Allocating...' : 'Confirm Allocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW ROOM */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddRoomModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#102A43]/60 hover:text-[#102A43] hover:bg-[#CCFBF1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#0D9488]" />
              Add Room to Inventory
            </h3>
            <p className="text-xs text-[#102A43]/70 font-medium mt-1">Register a newly constructed or refurbished room.</p>

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Room Number *</label>
                  <input
                    required
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    placeholder="e.g. B-301"
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Hostel Block *</label>
                  <select
                    value={roomForm.block}
                    onChange={(e) => setRoomForm({ ...roomForm, block: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  >
                    <option value="Block A (Boys)">Block A (Boys)</option>
                    <option value="Block B (Boys)">Block B (Boys)</option>
                    <option value="Block C (Girls)">Block C (Girls)</option>
                    <option value="Block D (Girls)">Block D (Girls)</option>
                    <option value="Block E (PG Wings)">Block E (PG Wings)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Floor</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Room Type</label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Four-Bed">Four-Bed</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#102A43] block mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#102A43] block mb-1">Monthly Rent (INR)</label>
                <input
                  type="number"
                  value={roomForm.monthlyRent}
                  onChange={(e) => setRoomForm({ ...roomForm, monthlyRent: e.target.value })}
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

              <div>
                <label className="font-bold text-[#102A43] block mb-1">Amenities (Comma-separated)</label>
                <input
                  type="text"
                  value={roomForm.amenities}
                  onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                  placeholder="e.g. Wi-Fi, Attached Bath, AC, Balcony"
                  className="w-full p-2.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl text-[#102A43] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
                />
              </div>

              <div className="pt-3 border-t border-[#CCFBF1] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddRoomModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Room to Inventory'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffHostel;
