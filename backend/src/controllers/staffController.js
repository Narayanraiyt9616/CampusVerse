const HostelRoom = require('../models/HostelRoom');
const HostelAllocation = require('../models/HostelAllocation');
const TransportRoute = require('../models/TransportRoute');
const TransportVehicle = require('../models/TransportVehicle');
const TransportAllocation = require('../models/TransportAllocation');
const StaffComplaint = require('../models/StaffComplaint');
const Student = require('../models/Student');
const Notice = require('../models/Notice');

/**
 * 1. GET /api/staff/dashboard
 * Aggregated statistics for hostel residents, room availability, transport fleet, routes, and alerts
 */
exports.getStaffDashboard = async (req, res) => {
  try {
    const [rooms, allocations, routes, vehicles, complaints, notices] = await Promise.all([
      HostelRoom.find().sort({ block: 1, roomNumber: 1 }),
      HostelAllocation.find({ status: 'Active' }).populate('student', 'name studentId email'),
      TransportRoute.find().sort({ routeNumber: 1 }),
      TransportVehicle.find().populate('assignedRoute', 'routeNumber routeName').sort({ vehicleNumber: 1 }),
      StaffComplaint.find().sort({ createdAt: -1 }),
      Notice.find().sort({ pinned: -1, publishedAt: -1 }).limit(5),
    ]);

    // Hostel calculations
    let totalBeds = 0;
    let occupiedBeds = 0;
    const blockStatsMap = {};

    rooms.forEach((r) => {
      totalBeds += r.capacity || 0;
      occupiedBeds += r.occupiedBeds || 0;

      if (!blockStatsMap[r.block]) {
        blockStatsMap[r.block] = {
          block: r.block,
          totalRooms: 0,
          totalCapacity: 0,
          occupied: 0,
          maintenanceRooms: 0,
        };
      }
      blockStatsMap[r.block].totalRooms += 1;
      blockStatsMap[r.block].totalCapacity += r.capacity || 0;
      blockStatsMap[r.block].occupied += r.occupiedBeds || 0;
      if (r.status === 'Maintenance') blockStatsMap[r.block].maintenanceRooms += 1;
    });

    const hostelBlocksSummary = Object.values(blockStatsMap).map((b) => ({
      ...b,
      available: Math.max(0, b.totalCapacity - b.occupied),
      occupancyPct: b.totalCapacity > 0 ? Math.round((b.occupied / b.totalCapacity) * 100) : 0,
      status: b.maintenanceRooms > 0 ? `${b.maintenanceRooms} Under Maintenance` : 'Normal Operations',
    }));

    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Transport calculations
    const activeRoutes = routes.filter((r) => r.status === 'Active').length;
    const delayedRoutes = routes.filter((r) => r.status === 'Delayed' || (r.delayMinutes && r.delayMinutes > 0)).length;
    const onScheduleVehicles = vehicles.filter((v) => v.status === 'On Schedule').length;

    // Complaints calculations
    const openComplaints = complaints.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;
    const highPriorityComplaints = complaints.filter((c) => (c.priority === 'High' || c.priority === 'Emergency') && c.status !== 'Resolved').length;

    // Operational alerts
    const alerts = [];
    if (delayedRoutes > 0) {
      alerts.push({
        type: 'warning',
        title: `${delayedRoutes} Transit Route(s) Reporting Delay`,
        message: 'Morning commuter bus schedule impacted by arterial traffic or road diversions.',
      });
    }
    if (highPriorityComplaints > 0) {
      alerts.push({
        type: 'danger',
        title: `${highPriorityComplaints} High Priority Maintenance Ticket(s) Pending`,
        message: 'Immediate electrical or HVAC dispatch required in resident blocks.',
      });
    }
    if (totalBeds - occupiedBeds <= 5) {
      alerts.push({
        type: 'warning',
        title: 'Hostel Bed Capacity Near Saturation',
        message: `Only ${totalBeds - occupiedBeds} beds remaining across campus residential halls.`,
      });
    }

    return res.json({
      success: true,
      stats: {
        totalRooms: rooms.length,
        totalBeds,
        occupiedBeds,
        availableBeds: Math.max(0, totalBeds - occupiedBeds),
        occupancyRate,
        totalResidents: allocations.length,
        totalRoutes: routes.length,
        activeRoutes,
        delayedRoutes,
        totalVehicles: vehicles.length,
        onScheduleVehicles,
        openComplaints,
        highPriorityComplaints,
      },
      hostelBlocksSummary,
      transportFleet: vehicles,
      routes,
      recentComplaints: complaints.slice(0, 6),
      alerts,
      notices,
    });
  } catch (err) {
    console.error('getStaffDashboard error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 2. HOSTEL MANAGEMENT
 */

// GET /api/staff/hostel/rooms
exports.getHostelRooms = async (req, res) => {
  try {
    const { block, status, roomType, search } = req.query;
    const filter = {};

    if (block) filter.block = block;
    if (status) filter.status = status;
    if (roomType) filter.roomType = roomType;
    if (search) filter.roomNumber = { $regex: search, $options: 'i' };

    const rooms = await HostelRoom.find(filter).sort({ block: 1, roomNumber: 1 });
    return res.json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/staff/hostel/rooms
exports.createHostelRoom = async (req, res) => {
  try {
    const { roomNumber, block, floor, roomType, capacity, monthlyRent, amenities } = req.body;
    if (!roomNumber || !block) {
      return res.status(400).json({ success: false, error: 'Room number and block are required.' });
    }

    const room = await HostelRoom.create({
      roomNumber,
      block,
      floor: Number(floor) || 1,
      roomType: roomType || 'Double',
      capacity: Number(capacity) || 2,
      monthlyRent: Number(monthlyRent) || 4500,
      amenities: amenities || ['Wi-Fi', 'Attached Bath'],
    });

    return res.status(201).json({ success: true, room });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/staff/hostel/rooms/:id
exports.updateHostelRoom = async (req, res) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found.' });
    return res.json({ success: true, room });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/staff/hostel/allocations
exports.getHostelAllocations = async (req, res) => {
  try {
    const allocations = await HostelAllocation.find()
      .populate('student', 'name studentId email department semester')
      .populate('room', 'roomNumber block roomType floor capacity occupiedBeds status')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: allocations.length, allocations });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/staff/hostel/allocate
exports.allocateHostelBed = async (req, res) => {
  try {
    const { studentId, roomId, bedNumber, emergencyContact, remarks } = req.body;
    if (!studentId || !roomId) {
      return res.status(400).json({ success: false, error: 'Student and Room are required.' });
    }

    const room = await HostelRoom.findById(roomId);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found.' });

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({ success: false, error: 'Selected room is already fully occupied.' });
    }

    // Check if student already has active allocation
    const existing = await HostelAllocation.findOne({ student: studentId, status: 'Active' });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Student already has an active room allocation.' });
    }

    const allocation = await HostelAllocation.create({
      student: studentId,
      room: roomId,
      bedNumber: bedNumber || `Bed ${room.occupiedBeds + 1}`,
      checkInDate: new Date(),
      status: 'Active',
      emergencyContact,
      remarks,
    });

    // Update room occupied beds and status
    room.occupiedBeds += 1;
    if (room.occupiedBeds >= room.capacity) {
      room.status = 'Fully Occupied';
    }
    await room.save();

    const populated = await HostelAllocation.findById(allocation._id)
      .populate('student', 'name studentId email department')
      .populate('room', 'roomNumber block');

    return res.status(201).json({ success: true, allocation: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/staff/hostel/vacate/:id
exports.vacateHostelBed = async (req, res) => {
  try {
    const allocation = await HostelAllocation.findById(req.params.id);
    if (!allocation) return res.status(404).json({ success: false, error: 'Allocation not found.' });

    if (allocation.status === 'Vacated') {
      return res.status(400).json({ success: false, error: 'Room bed is already vacated.' });
    }

    allocation.status = 'Vacated';
    allocation.vacateDate = new Date();
    await allocation.save();

    // Decrement occupiedBeds
    const room = await HostelRoom.findById(allocation.room);
    if (room) {
      room.occupiedBeds = Math.max(0, room.occupiedBeds - 1);
      if (room.status === 'Fully Occupied' && room.occupiedBeds < room.capacity) {
        room.status = 'Available';
      }
      await room.save();
    }

    return res.json({ success: true, message: 'Bed successfully vacated.', allocation });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. TRANSPORT MANAGEMENT
 */

// GET /api/staff/transport/vehicles
exports.getTransportVehicles = async (req, res) => {
  try {
    const vehicles = await TransportVehicle.find()
      .populate('assignedRoute', 'routeNumber routeName startPoint destination stops status delayMinutes')
      .sort({ vehicleNumber: 1 });

    return res.json({ success: true, count: vehicles.length, vehicles });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/staff/transport/vehicles
exports.createTransportVehicle = async (req, res) => {
  try {
    const { vehicleNumber, model, capacity, fuelType, assignedRoute, driver, status } = req.body;
    if (!vehicleNumber || !model || !driver?.name || !driver?.phone) {
      return res.status(400).json({ success: false, error: 'Vehicle number, model, and driver details are required.' });
    }

    const vehicle = await TransportVehicle.create({
      vehicleNumber,
      model,
      capacity: Number(capacity) || 40,
      fuelType: fuelType || 'Diesel',
      assignedRoute: assignedRoute || undefined,
      driver,
      status: status || 'On Schedule',
    });

    const populated = await TransportVehicle.findById(vehicle._id).populate('assignedRoute');
    return res.status(201).json({ success: true, vehicle: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/staff/transport/vehicles/:id
exports.updateTransportVehicle = async (req, res) => {
  try {
    const vehicle = await TransportVehicle.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedRoute');
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found.' });
    return res.json({ success: true, vehicle });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/staff/transport/routes
exports.getTransportRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.find().sort({ routeNumber: 1 });
    return res.json({ success: true, count: routes.length, routes });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/staff/transport/routes
exports.createTransportRoute = async (req, res) => {
  try {
    const { routeNumber, routeName, startPoint, destination, stops, totalDistanceKm, estimatedDurationMins, status } = req.body;
    if (!routeNumber || !routeName || !startPoint || !destination) {
      return res.status(400).json({ success: false, error: 'Route number, name, start point and destination are required.' });
    }

    const route = await TransportRoute.create({
      routeNumber,
      routeName,
      startPoint,
      destination,
      stops: stops || [],
      totalDistanceKm: Number(totalDistanceKm) || 25,
      estimatedDurationMins: Number(estimatedDurationMins) || 45,
      status: status || 'Active',
    });

    return res.status(201).json({ success: true, route });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/staff/transport/routes/:id
exports.updateTransportRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ success: false, error: 'Route not found.' });
    return res.json({ success: true, route });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/staff/transport/allocations
exports.getTransportAllocations = async (req, res) => {
  try {
    const allocations = await TransportAllocation.find()
      .populate('student', 'name studentId email department semester')
      .populate('route', 'routeNumber routeName startPoint destination')
      .populate('vehicle', 'vehicleNumber model driver')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: allocations.length, allocations });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/staff/transport/allocate
exports.allocateTransportPass = async (req, res) => {
  try {
    const { studentId, routeId, vehicleId, pickupStop, dropStop, validTill } = req.body;
    if (!studentId || !routeId || !pickupStop) {
      return res.status(400).json({ success: false, error: 'Student, route, and pickup stop are required.' });
    }

    const passNumber = `TP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const allocation = await TransportAllocation.create({
      student: studentId,
      route: routeId,
      vehicle: vehicleId || undefined,
      pickupStop,
      dropStop: dropStop || 'Campus Main Gate Terminal',
      passNumber,
      status: 'Active',
      validFrom: new Date(),
      validTill: validTill || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    const populated = await TransportAllocation.findById(allocation._id)
      .populate('student', 'name studentId email')
      .populate('route', 'routeNumber routeName')
      .populate('vehicle', 'vehicleNumber model driver');

    return res.status(201).json({ success: true, allocation: populated });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 4. STUDENT RECORDS
 * Unified view of assigned students' basic details, hostel allocations, and transport passes
 */
exports.getStaffStudentRecords = async (req, res) => {
  try {
    const { search, department, filterType } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;

    const students = await Student.find(query)
      .populate('department', 'name code')
      .sort({ name: 1 });

    const studentIds = students.map((s) => s._id);

    // Fetch active hostel allocations
    const hostelAllocations = await HostelAllocation.find({
      student: { $in: studentIds },
      status: 'Active',
    }).populate('room', 'roomNumber block floor roomType');

    // Fetch active transport passes
    const transportAllocations = await TransportAllocation.find({
      student: { $in: studentIds },
      status: 'Active',
    })
      .populate('route', 'routeNumber routeName')
      .populate('vehicle', 'vehicleNumber model driver');

    const hostelMap = {};
    hostelAllocations.forEach((h) => {
      hostelMap[h.student.toString()] = h;
    });

    const transportMap = {};
    transportAllocations.forEach((t) => {
      transportMap[t.student.toString()] = t;
    });

    const combined = students.map((s) => {
      const hAlloc = hostelMap[s._id.toString()];
      const tAlloc = transportMap[s._id.toString()];

      return {
        _id: s._id,
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        department: s.department?.name || 'Engineering',
        departmentCode: s.department?.code || 'ENG',
        semester: s.semester,
        status: s.status,
        hostel: hAlloc
          ? {
              isResident: true,
              block: hAlloc.room?.block,
              roomNumber: hAlloc.room?.roomNumber,
              bedNumber: hAlloc.bedNumber,
              checkInDate: hAlloc.checkInDate,
              emergencyContact: hAlloc.emergencyContact,
            }
          : { isResident: false },
        transport: tAlloc
          ? {
              hasPass: true,
              passNumber: tAlloc.passNumber,
              routeNumber: tAlloc.route?.routeNumber,
              routeName: tAlloc.route?.routeName,
              vehicleNumber: tAlloc.vehicle?.vehicleNumber,
              pickupStop: tAlloc.pickupStop,
              validTill: tAlloc.validTill,
            }
          : { hasPass: false },
      };
    });

    // Optional filter by resident / transport
    let results = combined;
    if (filterType === 'HOSTEL') {
      results = results.filter((r) => r.hostel.isResident);
    } else if (filterType === 'TRANSPORT') {
      results = results.filter((r) => r.transport.hasPass);
    }

    return res.json({ success: true, count: results.length, students: results });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 5. COMPLAINTS & NOTICES
 */

// GET /api/staff/complaints
exports.getStaffComplaints = async (req, res) => {
  try {
    const { type, priority, status, search } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { hostelBlock: { $regex: search, $options: 'i' } },
      ];
    }

    const complaints = await StaffComplaint.find(filter)
      .populate('student', 'name studentId email')
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: complaints.length, complaints });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/staff/complaints
exports.createStaffComplaint = async (req, res) => {
  try {
    const { type, category, title, description, studentId, studentName, hostelBlock, roomNumber, routeNumber, priority, assignedTo } = req.body;
    if (!type || !category || !title || !description) {
      return res.status(400).json({ success: false, error: 'Type, category, title, and description are required.' });
    }

    const ticketNumber = `CMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const complaint = await StaffComplaint.create({
      ticketNumber,
      type,
      category,
      title,
      description,
      student: studentId || undefined,
      studentName: studentName || 'Campus Resident',
      hostelBlock,
      roomNumber,
      routeNumber,
      priority: priority || 'Medium',
      assignedTo: assignedTo || 'Duty Officer',
      status: 'Open',
    });

    return res.status(201).json({ success: true, complaint });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/staff/complaints/:id
exports.updateStaffComplaint = async (req, res) => {
  try {
    const { status, assignedTo, resolutionNotes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (assignedTo !== undefined) update.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) update.resolutionNotes = resolutionNotes;
    if (status === 'Resolved' || status === 'Closed') {
      update.resolvedAt = new Date();
    }

    const complaint = await StaffComplaint.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!complaint) return res.status(404).json({ success: false, error: 'Complaint not found.' });

    return res.json({ success: true, complaint });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/staff/notices
exports.getStaffNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ pinned: -1, publishedAt: -1 });
    return res.json({ success: true, count: notices.length, notices });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/staff/notices
exports.createStaffNotice = async (req, res) => {
  try {
    const { title, content, category, targetAudience, pinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const notice = await Notice.create({
      title,
      content,
      category: category || 'General',
      targetAudience: targetAudience || 'All',
      author: req.user._id,
      authorName: `${req.user.name || 'M. Karthikeyan'} (Hostel & Transport Cell)`,
      pinned: Boolean(pinned),
      publishedAt: new Date(),
    });

    return res.status(201).json({ success: true, notice });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
