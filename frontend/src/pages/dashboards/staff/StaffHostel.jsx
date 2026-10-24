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
    bedNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Parent',
    remarks: '',
  });

  const [allocateErrors, setAllocateErrors] = useState({});

  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    block: 'Block A (Boys)',
    floor: 1,
    roomType: 'Double',
    capacity: 2,
    monthlyRent: 4800,
    amenities: 'Wi-Fi, Attached Bath, Study Desk',
  });

  const [roomErrors, setRoomErrors] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [roomsRes, allocsRes, complaintsRes, studentsRes] = await Promise.all([
        staffService.getHostelRooms().catch(() => null),
        staffService.getHostelAllocations().catch(() => null),
        staffService.getComplaints({ type: 'Hostel' }).catch(() => null),
        staffService.getStudentRecords().catch(() => studentService.getAll().catch(() => null)),
      ]);

      const fetchedRooms = roomsRes && roomsRes.success ? (roomsRes.rooms || []) : [];
      const fetchedAllocs = allocsRes && allocsRes.success ? (allocsRes.allocations || []) : [];
      const fetchedComplaints = complaintsRes && complaintsRes.success ? (complaintsRes.complaints || []) : [];
      const fetchedStudents = studentsRes && studentsRes.success ? (studentsRes.students || studentsRes.data || []) : [];

      setRooms(fetchedRooms);
      setAllocations(fetchedAllocs);
      setComplaints(fetchedComplaints);
      setAllStudents(fetchedStudents);
    } catch (err) {
      setError(err.message || 'Failed to load hostel records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showAllocateModal) setShowAllocateModal(false);
        if (showAddRoomModal) {
          setShowAddRoomModal(false);
          setRoomErrors({});
        }
      }
    };
    if (showAllocateModal || showAddRoomModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAllocateModal, showAddRoomModal]);

  // Compute active allocations by student ID for duplicate prevention
  const activeAllocatedStudentIds = new Set(
    allocations
      .filter((a) => a.status === 'Active')
      .map((a) => String(a.student?._id || a.student))
  );

  // Compute selected room details and unallocated beds
  const selectedRoomForAllocation = rooms.find((r) => String(r._id) === String(allocateForm.roomId));
  const activeAllocationsForSelectedRoom = allocations.filter(
    (a) =>
      a.status === 'Active' &&
      String(a.room?._id || a.room) === String(allocateForm.roomId)
  );
  const occupiedBedSet = new Set(
    activeAllocationsForSelectedRoom.map((a) => (a.bedNumber || '').trim())
  );

  const availableBedsForSelectedRoom = [];
  if (selectedRoomForAllocation) {
    const totalCap = selectedRoomForAllocation.capacity || 2;
    for (let i = 1; i <= totalCap; i++) {
      const bLabel = `Bed ${i}`;
      if (!occupiedBedSet.has(bLabel)) {
        availableBedsForSelectedRoom.push(bLabel);
      }
    }
  }

  // When room is selected in modal, sync bed number to first free bed if current choice is invalid
  const handleRoomSelectChange = (roomId) => {
    const roomObj = rooms.find((r) => String(r._id) === String(roomId));
    const activeInRoom = allocations.filter(
      (a) => a.status === 'Active' && String(a.room?._id || a.room) === String(roomId)
    );
    const occBeds = new Set(activeInRoom.map((a) => (a.bedNumber || '').trim()));
    const freeBeds = [];
    if (roomObj) {
      for (let i = 1; i <= (roomObj.capacity || 2); i++) {
        const b = `Bed ${i}`;
        if (!occBeds.has(b)) freeBeds.push(b);
      }
    }

    setAllocateForm((prev) => ({
      ...prev,
      roomId,
      bedNumber: freeBeds.length > 0 ? freeBeds[0] : '',
    }));

    if (allocateErrors.roomId || allocateErrors.bedNumber) {
      setAllocateErrors((prev) => ({ ...prev, roomId: '', bedNumber: '' }));
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesBlock =
      selectedBlock === 'All Blocks' || r.block === selectedBlock;
    const matchesStatus =
      statusFilter === 'ALL' || r.status === statusFilter;
    const roomNum = String(r.roomNumber || '');
    const blockName = String(r.block || '');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      roomNum.toLowerCase().includes(q) ||
      blockName.toLowerCase().includes(q);
    return matchesBlock && matchesStatus && matchesSearch;
  });

  // Filtered allocations
  const filteredAllocations = allocations.filter((a) => {
    const name = a.student?.name || a.studentName || '';
    const id = a.student?.studentId || '';
    const room = a.room?.roomNumber || a.roomNumber || '';
    const block = a.room?.block || a.hostelBlock || '';
    const q = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      room.toLowerCase().includes(q) ||
      block.toLowerCase().includes(q)
    );
  });

  // Validate Allocation Form
  const validateAllocateForm = () => {
    const errs = {};
    if (!allocateForm.studentId) {
      errs.studentId = 'Please select a student for hostel allocation.';
    } else if (activeAllocatedStudentIds.has(String(allocateForm.studentId))) {
      errs.studentId = 'Selected student already has an active bed allocation. Duplicate allocation is not allowed.';
    }

    if (!allocateForm.roomId) {
      errs.roomId = 'Please select an available hostel room.';
    }

    if (!allocateForm.bedNumber || !allocateForm.bedNumber.trim()) {
      errs.bedNumber = 'Please select an available bed.';
    } else if (occupiedBedSet.has(allocateForm.bedNumber.trim())) {
      errs.bedNumber = `${allocateForm.bedNumber} is already occupied. Each bed can be assigned to only one student at a time.`;
    }

    if (!allocateForm.emergencyContactName.trim()) {
      errs.emergencyContactName = 'Emergency contact person name is required.';
    } else if (allocateForm.emergencyContactName.trim().length < 2) {
      errs.emergencyContactName = 'Name must be at least 2 characters.';
    }

    const cleanPhone = allocateForm.emergencyContactPhone.replace(/[^0-9+]/g, '');
    if (!allocateForm.emergencyContactPhone.trim()) {
      errs.emergencyContactPhone = 'Emergency contact phone number is required.';
    } else if (cleanPhone.length < 7) {
      errs.emergencyContactPhone = 'Please provide a valid contact phone number (min 7 digits).';
    }

    if (!allocateForm.emergencyContactRelation.trim()) {
      errs.emergencyContactRelation = 'Emergency contact relation is required.';
    }

    setAllocateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Allocate Bed
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!validateAllocateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await staffService.allocateHostelBed({
        studentId: allocateForm.studentId,
        roomId: allocateForm.roomId,
        bedNumber: allocateForm.bedNumber.trim(),
        emergencyContact: {
          name: allocateForm.emergencyContactName.trim(),
          phone: allocateForm.emergencyContactPhone.trim(),
          relation: allocateForm.emergencyContactRelation.trim(),
        },
        remarks: allocateForm.remarks ? allocateForm.remarks.trim() : '',
      });

      if (res && res.success) {
        setSuccessMsg(`Bed ${allocateForm.bedNumber} successfully allocated and marked Occupied.`);
        setShowAllocateModal(false);
        setAllocateForm({
          studentId: '',
          roomId: '',
          bedNumber: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: 'Parent',
          remarks: '',
        });
        setAllocateErrors({});
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to allocate hostel bed.';
      setAllocateErrors((prev) => ({ ...prev, form: msg }));
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Validate Room Form
  const validateRoomForm = () => {
    const errs = {};
    const trimmedNum = (roomForm.roomNumber || '').trim();
    const trimmedBlock = (roomForm.block || '').trim();

    if (!trimmedNum) {
      errs.roomNumber = 'Room number is required.';
    } else {
      // Check for duplicate room number in the same block (case-insensitive)
      const isDuplicate = rooms.some(
        (r) =>
          String(r.block || '').trim().toLowerCase() === trimmedBlock.toLowerCase() &&
          String(r.roomNumber || '').trim().toLowerCase() === trimmedNum.toLowerCase()
      );
      if (isDuplicate) {
        errs.roomNumber = `Room ${trimmedNum} already exists in ${trimmedBlock}. Duplicate room records are not permitted.`;
      }
    }

    if (!trimmedBlock) {
      errs.block = 'Hostel block is required.';
    }

    const floorNum = Number(roomForm.floor);
    if (isNaN(floorNum) || floorNum < 0 || floorNum > 10) {
      errs.floor = 'Floor must be a number between 0 and 10.';
    }

    const capNum = Number(roomForm.capacity);
    if (isNaN(capNum) || capNum < 1 || capNum > 6) {
      errs.capacity = 'Bed capacity must be between 1 and 6.';
    }

    const rentNum = Number(roomForm.monthlyRent);
    if (isNaN(rentNum) || rentNum <= 0) {
      errs.monthlyRent = 'Monthly rent must be a positive number.';
    }

    setRoomErrors(errs);
    return Object.keys(errs).length === 0;
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
    if (!validateRoomForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const amenitiesArr = roomForm.amenities.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await staffService.createHostelRoom({
        roomNumber: roomForm.roomNumber.trim(),
        block: roomForm.block.trim(),
        floor: Number(roomForm.floor),
        roomType: roomForm.roomType,
        capacity: Number(roomForm.capacity),
        monthlyRent: Number(roomForm.monthlyRent),
        amenities: amenitiesArr,
      });

      if (res && res.success) {
        setSuccessMsg(`Room ${roomForm.roomNumber.trim()} registered in inventory.`);
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
        setRoomErrors({});
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to register room.';
      setRoomErrors((prev) => ({ ...prev, roomNumber: msg }));
      alert(msg);
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
        <p className="mt-3 text-xs text-[#4B5563] font-semibold">Loading residential inventory & records...</p>
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
        <div className="p-5 rounded-2xl bg-[#111827] text-white shadow-sm">
          <span className="text-xs font-bold text-[#F1E7CF] uppercase tracking-wider block">Total Rooms</span>
          <span className="text-2xl font-extrabold font-mono text-white mt-1.5 block">{rooms.length}</span>
          <span className="text-xs text-[#F1E7CF] font-medium mt-0.5 block">Across 5 Blocks</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-center shadow-sm">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Bed Capacity</span>
          <span className="text-2xl font-extrabold font-mono text-[#111827] mt-1.5 block">{totalBeds} Beds</span>
          <span className="text-xs text-[#4B5563] font-medium mt-0.5 block">Furnished Inventory</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-center shadow-sm">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Occupied Beds</span>
          <span className="text-2xl font-extrabold font-mono text-[#D99A00] mt-1.5 block">{occupiedBeds}</span>
          <span className="text-xs text-[#D99A00] font-bold mt-0.5 block">{Math.round((occupiedBeds / (totalBeds || 1)) * 100)}% Occupancy</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#FFF8E6] border border-[#D99A00] text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#111827] block">Available Beds</span>
          <span className="text-2xl font-extrabold font-mono text-[#111827] mt-1.5 block">{availableBeds}</span>
          <span className="text-xs text-[#111827] font-semibold mt-0.5 block">Ready for check-in</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-center shadow-sm">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Maintenance</span>
          <span className="text-2xl font-extrabold font-mono text-[#111827] mt-1.5 block">{maintenanceRooms}</span>
          <span className="text-xs text-[#4B5563] font-medium mt-0.5 block">Civil / Electrical tasks</span>
        </div>
      </div>

      {/* Tabs Switcher & Actions Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="p-1.5 rounded-2xl bg-[#FFF8E6]/30 border border-[#F1E7CF] flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            Hostel Rooms & Inventory
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'rooms' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('allocations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'allocations'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <Users className="w-4 h-4" />
            Student Accommodations
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'allocations' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {allocations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Hostel Complaints
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'complaints' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
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
                  <Search className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search room #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00] w-36 sm:w-44"
                  />
                </div>

                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                >
                  {BLOCKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Available">Available Beds</option>
                  <option value="Occupied">Occupied (Partial)</option>
                  <option value="Fully Occupied">Fully Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            }
          >
            {filteredRooms.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#4B5563] font-semibold">
                No rooms found matching the selected filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FFFDF5] text-[#111827] font-bold text-xs uppercase tracking-wider border-b border-[#F1E7CF]">
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
                  <tbody className="divide-y divide-[#F1E7CF]">
                    {filteredRooms.map((r) => {
                      const avail = Math.max(0, r.capacity - r.occupiedBeds);
                      return (
                        <tr key={r._id} className="hover:bg-[#FFF8E6]/30 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#111827] text-sm">
                            {r.roomNumber}
                          </td>
                          <td className="p-3.5 font-bold text-[#111827]">
                            {r.block}
                          </td>
                          <td className="p-3.5 font-mono font-medium text-[#4B5563]">
                            Floor {r.floor}
                          </td>
                          <td className="p-3.5">
                            <Badge variant="neutral" size="sm">{r.roomType}</Badge>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#111827]">
                            {r.capacity}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#D99A00]">
                            {r.occupiedBeds}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#D99A00]">
                            {avail}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(r.amenities || []).map((am, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFF8E6] text-[#111827] font-mono font-semibold">
                                  {am}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-[#111827]">
                            ₹{(r.monthlyRent || 4500).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right">
                            <Badge
                              variant={
                                r.status === 'Available'
                                  ? 'teal'
                                  : r.status === 'Occupied'
                                  ? 'warning'
                                  : r.status === 'Fully Occupied'
                                  ? 'neutral'
                                  : r.status === 'Maintenance'
                                  ? 'danger'
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
              <Search className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00] w-52"
              />
            </div>
          }
        >
          {filteredAllocations.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#4B5563] font-semibold">
              No accommodation records found matching your query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDF5] text-[#111827] font-bold text-xs uppercase tracking-wider border-b border-[#F1E7CF]">
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
                <tbody className="divide-y divide-[#F1E7CF]">
                  {filteredAllocations.map((a) => {
                    const isActive = a.status === 'Active';
                    return (
                      <tr key={a._id} className="hover:bg-[#FFF8E6]/30 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-[#111827] block">{a.student?.name || 'Student'}</span>
                          <span className="text-[11px] font-mono text-[#D99A00] font-bold block">
                            {a.student?.studentId} • Sem {a.student?.semester || 7}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-[#111827]">
                          {a.room?.block || 'Hostel Block'}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="font-bold text-[#111827] block">Room {a.room?.roomNumber}</span>
                          <span className="text-[11px] text-[#4B5563] font-semibold">{a.bedNumber}</span>
                        </td>
                        <td className="p-3.5 font-mono font-medium text-[#111827]">
                          {a.checkInDate ? new Date(a.checkInDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="p-3.5 text-[#111827]">
                          {a.emergencyContact?.name ? (
                            <div>
                              <span className="font-bold text-[#111827] block">
                                {a.emergencyContact.name} ({a.emergencyContact.relation || 'Guardian'})
                              </span>
                              <span className="text-[11px] font-mono text-[#4B5563] font-semibold flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#D99A00]" />
                                {a.emergencyContact.phone}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#4B5563] italic">Not specified</span>
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
            <div className="p-12 text-center text-xs text-[#4B5563] font-semibold">
              Zero complaints logged for hostel residential halls.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDF5] text-[#111827] font-bold text-xs uppercase tracking-wider border-b border-[#F1E7CF]">
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
                <tbody className="divide-y divide-[#F1E7CF]">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-[#FFF8E6]/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#D99A00]">
                        {c.ticketNumber}
                      </td>
                      <td className="p-3.5 font-bold text-[#111827]">
                        <span>{c.hostelBlock}</span>
                        {c.roomNumber && <span className="block text-[11px] font-mono text-[#4B5563] font-semibold">{c.roomNumber}</span>}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="neutral" size="sm">{c.category}</Badge>
                        <span className="font-bold text-[#111827] block mt-1">{c.title}</span>
                      </td>
                      <td className="p-3.5 text-[#4B5563] max-w-xs text-[11px] font-medium">
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
                      <td className="p-3.5 text-[#111827] font-mono text-[11px] font-semibold">
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
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAllocateModal(false)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAllocateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#D99A00]" />
              Allocate Hostel Bed
            </h3>
            <p className="text-xs text-[#4B5563] font-medium mt-1">Assign an available hostel bed to a registered university student.</p>

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-3 text-xs">
              {allocateErrors.form && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-xs">
                  {allocateErrors.form}
                </div>
              )}

              <div>
                <label className="font-bold text-[#111827] block mb-1">Select Student *</label>
                <select
                  value={allocateForm.studentId}
                  onChange={(e) => {
                    setAllocateForm({ ...allocateForm, studentId: e.target.value });
                    if (allocateErrors.studentId) setAllocateErrors({ ...allocateErrors, studentId: '' });
                  }}
                  className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                    allocateErrors.studentId ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                  }`}
                >
                  <option value="">-- Choose Student --</option>
                  {allStudents.map((s) => {
                    const isAllocated = activeAllocatedStudentIds.has(String(s._id));
                    return (
                      <option key={s._id} value={s._id} disabled={isAllocated}>
                        {s.name} ({s.studentId}) — {s.department?.name || s.department || 'Student'}{' '}
                        {isAllocated ? '— [Already Allocated]' : ''}
                      </option>
                    );
                  })}
                </select>
                {allocateErrors.studentId && (
                  <span className="text-[11px] text-red-600 font-semibold block mt-1">
                    {allocateErrors.studentId}
                  </span>
                )}
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Select Available Room *</label>
                <select
                  value={allocateForm.roomId}
                  onChange={(e) => handleRoomSelectChange(e.target.value)}
                  className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                    allocateErrors.roomId ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                  }`}
                >
                  <option value="">-- Choose Room with Available Bed --</option>
                  {rooms
                    .filter(
                      (r) =>
                        (r.status === 'Available' || r.status === 'Occupied') &&
                        (r.occupiedBeds || 0) < (r.capacity || 2)
                    )
                    .map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.block} • Room {r.roomNumber} ({r.roomType}) — {r.capacity - (r.occupiedBeds || 0)} bed(s) free
                      </option>
                    ))}
                </select>
                {allocateErrors.roomId && (
                  <span className="text-[11px] text-red-600 font-semibold block mt-1">
                    {allocateErrors.roomId}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Select Bed Number *</label>
                  <select
                    value={allocateForm.bedNumber}
                    disabled={!allocateForm.roomId || availableBedsForSelectedRoom.length === 0}
                    onChange={(e) => {
                      setAllocateForm({ ...allocateForm, bedNumber: e.target.value });
                      if (allocateErrors.bedNumber) setAllocateErrors({ ...allocateErrors, bedNumber: '' });
                    }}
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      allocateErrors.bedNumber ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    } ${!allocateForm.roomId ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {!allocateForm.roomId ? (
                      <option value="">First select a room</option>
                    ) : availableBedsForSelectedRoom.length === 0 ? (
                      <option value="">No beds available in room</option>
                    ) : (
                      <>
                        <option value="">-- Choose Bed --</option>
                        {availableBedsForSelectedRoom.map((b) => (
                          <option key={b} value={b}>
                            {b} (Available)
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {allocateErrors.bedNumber && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {allocateErrors.bedNumber}
                    </span>
                  )}
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Emergency Relation *</label>
                  <select
                    value={allocateForm.emergencyContactRelation}
                    onChange={(e) => {
                      setAllocateForm({ ...allocateForm, emergencyContactRelation: e.target.value });
                      if (allocateErrors.emergencyContactRelation) setAllocateErrors({ ...allocateErrors, emergencyContactRelation: '' });
                    }}
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      allocateErrors.emergencyContactRelation ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    }`}
                  >
                    <option value="Parent">Parent</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Relative</option>
                  </select>
                  {allocateErrors.emergencyContactRelation && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {allocateErrors.emergencyContactRelation}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Emergency Contact Name *</label>
                  <input
                    type="text"
                    value={allocateForm.emergencyContactName}
                    onChange={(e) => {
                      setAllocateForm({ ...allocateForm, emergencyContactName: e.target.value });
                      if (allocateErrors.emergencyContactName) setAllocateErrors({ ...allocateErrors, emergencyContactName: '' });
                    }}
                    placeholder="Parent / Guardian Name"
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      allocateErrors.emergencyContactName ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    }`}
                  />
                  {allocateErrors.emergencyContactName && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {allocateErrors.emergencyContactName}
                    </span>
                  )}
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Emergency Phone *</label>
                  <input
                    type="text"
                    value={allocateForm.emergencyContactPhone}
                    onChange={(e) => {
                      setAllocateForm({ ...allocateForm, emergencyContactPhone: e.target.value });
                      if (allocateErrors.emergencyContactPhone) setAllocateErrors({ ...allocateErrors, emergencyContactPhone: '' });
                    }}
                    placeholder="+91 XXXXX XXXXX"
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      allocateErrors.emergencyContactPhone ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    }`}
                  />
                  {allocateErrors.emergencyContactPhone && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {allocateErrors.emergencyContactPhone}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={allocateForm.remarks}
                  onChange={(e) => setAllocateForm({ ...allocateForm, remarks: e.target.value })}
                  placeholder="Additional accommodation notes..."
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                />
              </div>

              <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setShowAllocateModal(false); setAllocateErrors({}); }}>
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
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => { setShowAddRoomModal(false); setRoomErrors({}); }}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setShowAddRoomModal(false); setRoomErrors({}); }}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#D99A00]" />
              Add Room to Inventory
            </h3>
            <p className="text-xs text-[#4B5563] font-medium mt-1">Register a newly constructed or refurbished room.</p>

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={roomForm.roomNumber}
                    onChange={(e) => {
                      setRoomForm({ ...roomForm, roomNumber: e.target.value });
                      if (roomErrors.roomNumber) setRoomErrors({ ...roomErrors, roomNumber: '' });
                    }}
                    placeholder="e.g. B-301"
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      roomErrors.roomNumber ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    }`}
                  />
                  {roomErrors.roomNumber && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {roomErrors.roomNumber}
                    </span>
                  )}
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Hostel Block *</label>
                  <select
                    value={roomForm.block}
                    onChange={(e) => {
                      setRoomForm({ ...roomForm, block: e.target.value });
                      if (roomErrors.block) setRoomErrors({ ...roomErrors, block: '' });
                    }}
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      roomErrors.block ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    }`}
                  >
                    <option value="Block A (Boys)">Block A (Boys)</option>
                    <option value="Block B (Boys)">Block B (Boys)</option>
                    <option value="Block C (Girls)">Block C (Girls)</option>
                    <option value="Block D (Girls)">Block D (Girls)</option>
                    <option value="Block E (PG Wings)">Block E (PG Wings)</option>
                  </select>
                  {roomErrors.block && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {roomErrors.block}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Floor *</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={roomForm.floor}
                    onChange={(e) => {
                      setRoomForm({ ...roomForm, floor: e.target.value });
                      if (roomErrors.floor) setRoomErrors({ ...roomErrors, floor: '' });
                    }}
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      roomErrors.floor ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    }`}
                  />
                  {roomErrors.floor && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {roomErrors.floor}
                    </span>
                  )}
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Room Type</label>
                  <select
                    value={roomForm.roomType}
                    onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Four-Bed">Four-Bed</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Bed Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={roomForm.capacity}
                    onChange={(e) => {
                      setRoomForm({ ...roomForm, capacity: e.target.value });
                      if (roomErrors.capacity) setRoomErrors({ ...roomErrors, capacity: '' });
                    }}
                    className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                      roomErrors.capacity ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                    }`}
                  />
                  {roomErrors.capacity && (
                    <span className="text-[11px] text-red-600 font-semibold block mt-1">
                      {roomErrors.capacity}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Monthly Rent (INR) *</label>
                <input
                  type="number"
                  value={roomForm.monthlyRent}
                  onChange={(e) => {
                    setRoomForm({ ...roomForm, monthlyRent: e.target.value });
                    if (roomErrors.monthlyRent) setRoomErrors({ ...roomErrors, monthlyRent: '' });
                  }}
                  className={`w-full p-2.5 bg-[#FFFDF5] border rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 ${
                    roomErrors.monthlyRent ? 'border-red-400 focus:ring-red-500' : 'border-[#F1E7CF] focus:ring-[#D99A00]'
                  }`}
                />
                {roomErrors.monthlyRent && (
                  <span className="text-[11px] text-red-600 font-semibold block mt-1">
                    {roomErrors.monthlyRent}
                  </span>
                )}
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Amenities (Comma-separated)</label>
                <input
                  type="text"
                  value={roomForm.amenities}
                  onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                  placeholder="e.g. Wi-Fi, Attached Bath, AC, Balcony"
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                />
              </div>

              <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setShowAddRoomModal(false); setRoomErrors({}); }}>
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
