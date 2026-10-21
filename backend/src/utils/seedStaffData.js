const HostelRoom = require('../models/HostelRoom');
const HostelAllocation = require('../models/HostelAllocation');
const TransportRoute = require('../models/TransportRoute');
const TransportVehicle = require('../models/TransportVehicle');
const TransportAllocation = require('../models/TransportAllocation');
const StaffComplaint = require('../models/StaffComplaint');
const Student = require('../models/Student');
const Notice = require('../models/Notice');
const User = require('../models/User');

async function seedStaffData() {
  try {
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('[SeedStaff] No students found, skipping staff seed.');
      return;
    }

    const students = await Student.find();
    const aarav = students.find((s) => s.studentId === 'CS21B1042') || students[0];
    const aditi = students.find((s) => s.studentId === 'CS21B1001') || students[1] || students[0];
    const rohan = students.find((s) => s.studentId === 'EC22B2014') || students[2] || students[0];
    const pooja = students.find((s) => s.studentId === 'ME23B3008') || students[3] || students[0];

    // 1. Seed Hostel Rooms
    const existingRooms = await HostelRoom.countDocuments();
    if (existingRooms === 0) {
      const roomsData = [
        // Block A
        { roomNumber: 'A-101', block: 'Block A (Boys)', floor: 1, roomType: 'Double', capacity: 2, occupiedBeds: 0, status: 'Available', amenities: ['Wi-Fi', 'Attached Bath', 'Balcony'], monthlyRent: 4800 },
        { roomNumber: 'A-102', block: 'Block A (Boys)', floor: 1, roomType: 'Double', capacity: 2, occupiedBeds: 1, status: 'Available', amenities: ['Wi-Fi', 'Study Desk', 'Balcony'], monthlyRent: 4500 },
        { roomNumber: 'A-201', block: 'Block A (Boys)', floor: 2, roomType: 'Single', capacity: 1, occupiedBeds: 1, status: 'Fully Occupied', amenities: ['Wi-Fi', 'AC', 'Attached Bath'], monthlyRent: 7500 },
        { roomNumber: 'A-202', block: 'Block A (Boys)', floor: 2, roomType: 'Triple', capacity: 3, occupiedBeds: 0, status: 'Maintenance', amenities: ['Wi-Fi', 'Study Desk'], monthlyRent: 4000 },
        // Block B
        { roomNumber: 'B-101', block: 'Block B (Boys)', floor: 1, roomType: 'Double', capacity: 2, occupiedBeds: 0, status: 'Available', amenities: ['Wi-Fi', 'Attached Bath'], monthlyRent: 4800 },
        { roomNumber: 'B-201', block: 'Block B (Boys)', floor: 2, roomType: 'Double', capacity: 2, occupiedBeds: 1, status: 'Available', amenities: ['Wi-Fi', 'Attached Bath', 'Study Lamp'], monthlyRent: 4800 },
        { roomNumber: 'B-202', block: 'Block B (Boys)', floor: 2, roomType: 'Double', capacity: 2, occupiedBeds: 2, status: 'Fully Occupied', amenities: ['Wi-Fi', 'Balcony'], monthlyRent: 4500 },
        // Block C
        { roomNumber: 'C-101', block: 'Block C (Girls)', floor: 1, roomType: 'Double', capacity: 2, occupiedBeds: 1, status: 'Available', amenities: ['Wi-Fi', 'Attached Bath', 'Study Desk'], monthlyRent: 4800 },
        { roomNumber: 'C-201', block: 'Block C (Girls)', floor: 2, roomType: 'Single', capacity: 1, occupiedBeds: 0, status: 'Available', amenities: ['Wi-Fi', 'AC', 'Attached Bath'], monthlyRent: 7500 },
        { roomNumber: 'C-202', block: 'Block C (Girls)', floor: 2, roomType: 'Double', capacity: 2, occupiedBeds: 2, status: 'Fully Occupied', amenities: ['Wi-Fi', 'Balcony'], monthlyRent: 4500 },
        // Block D
        { roomNumber: 'D-101', block: 'Block D (Girls)', floor: 1, roomType: 'Triple', capacity: 3, occupiedBeds: 2, status: 'Available', amenities: ['Wi-Fi', 'Study Desk'], monthlyRent: 4000 },
        { roomNumber: 'D-201', block: 'Block D (Girls)', floor: 2, roomType: 'Double', capacity: 2, occupiedBeds: 0, status: 'Available', amenities: ['Wi-Fi', 'Attached Bath'], monthlyRent: 4800 },
        // Block E
        { roomNumber: 'E-101', block: 'Block E (PG Wings)', floor: 1, roomType: 'Single', capacity: 1, occupiedBeds: 1, status: 'Fully Occupied', amenities: ['Wi-Fi', 'AC', 'Attached Bath', 'Kitchenette'], monthlyRent: 9500 },
        { roomNumber: 'E-201', block: 'Block E (PG Wings)', floor: 2, roomType: 'Single', capacity: 1, occupiedBeds: 0, status: 'Available', amenities: ['Wi-Fi', 'AC', 'Attached Bath'], monthlyRent: 8500 },
      ];

      const insertedRooms = await HostelRoom.insertMany(roomsData);
      console.log(`[SeedStaff] Inserted ${insertedRooms.length} hostel rooms.`);

      // Seed Allocations
      const roomB201 = insertedRooms.find((r) => r.roomNumber === 'B-201');
      const roomC101 = insertedRooms.find((r) => r.roomNumber === 'C-101');
      const roomA102 = insertedRooms.find((r) => r.roomNumber === 'A-102');

      const allocations = [
        {
          student: aarav._id,
          room: roomB201._id,
          bedNumber: 'Bed 1 (Window Side)',
          checkInDate: new Date('2026-07-20'),
          status: 'Active',
          emergencyContact: { name: 'Rajendra Singhania', phone: '+91 98450 11223', relation: 'Father' },
          remarks: 'Registered resident. Cleared all hostel and mess deposits.',
        },
        {
          student: aditi._id,
          room: roomC101._id,
          bedNumber: 'Bed 1',
          checkInDate: new Date('2026-07-22'),
          status: 'Active',
          emergencyContact: { name: 'Mrs. Jayanti Nair', phone: '+91 98450 33445', relation: 'Mother' },
          remarks: 'Resident in good standing. Prefers quiet study wing.',
        },
        {
          student: rohan._id,
          room: roomA102._id,
          bedNumber: 'Bed 2',
          checkInDate: new Date('2026-08-01'),
          status: 'Active',
          emergencyContact: { name: 'S. Deshmukh', phone: '+91 98450 55667', relation: 'Guardian' },
          remarks: 'Hostel committee student representative.',
        },
      ];

      await HostelAllocation.insertMany(allocations);
      console.log('[SeedStaff] Inserted hostel allocations.');
    }

    // 2. Seed Transport Routes & Vehicles
    const existingRoutes = await TransportRoute.countDocuments();
    if (existingRoutes === 0) {
      const routesData = [
        {
          routeNumber: 'Route 1',
          routeName: 'City Center Metro Junction Express',
          startPoint: 'MG Road Metro Station',
          destination: 'Campus Main Gate Terminal',
          stops: [
            { stopName: 'MG Road Metro Station (Gate 2)', time: '07:15 AM', order: 1 },
            { stopName: 'Indiranagar 100ft Junction', time: '07:30 AM', order: 2 },
            { stopName: 'Domlur Flyover Underpass', time: '07:45 AM', order: 3 },
            { stopName: 'Campus Main Gate Terminal', time: '08:20 AM', order: 4 },
          ],
          totalDistanceKm: 22,
          estimatedDurationMins: 45,
          status: 'Active',
        },
        {
          routeNumber: 'Route 4',
          routeName: 'North Suburban Terminal',
          startPoint: 'Hebbal Flyover Junction',
          destination: 'Campus Main Gate Terminal',
          stops: [
            { stopName: 'Hebbal Flyover Junction', time: '07:20 AM', order: 1 },
            { stopName: 'Yelahanka Police Station Circle', time: '07:35 AM', order: 2 },
            { stopName: 'Jakkur Aerodrome Cross', time: '07:50 AM', order: 3 },
            { stopName: 'Campus Main Gate Terminal', time: '08:25 AM', order: 4 },
          ],
          totalDistanceKm: 28,
          estimatedDurationMins: 50,
          status: 'Delayed',
          delayMinutes: 8,
        },
        {
          routeNumber: 'Route 7',
          routeName: 'Tech Corridor Hub Route',
          startPoint: 'Electronic City Phase 1 Toll Plaza',
          destination: 'Campus Main Gate Terminal',
          stops: [
            { stopName: 'Electronic City Phase 1 Toll', time: '07:10 AM', order: 1 },
            { stopName: 'Silk Board Flyover Ramp', time: '07:30 AM', order: 2 },
            { stopName: 'HSR Layout Sector 2 Junction', time: '07:45 AM', order: 3 },
            { stopName: 'Campus Main Gate Terminal', time: '08:20 AM', order: 4 },
          ],
          totalDistanceKm: 32,
          estimatedDurationMins: 55,
          status: 'Active',
        },
        {
          routeNumber: 'Route 14',
          routeName: 'South Bypass Ring Road',
          startPoint: 'Banashankari BDA Complex',
          destination: 'Campus Main Gate Terminal',
          stops: [
            { stopName: 'Banashankari BDA Complex', time: '07:15 AM', order: 1 },
            { stopName: 'JP Nagar 6th Phase Junction', time: '07:30 AM', order: 2 },
            { stopName: 'Bannerghatta National Park Road', time: '07:45 AM', order: 3 },
            { stopName: 'Campus Main Gate Terminal', time: '08:25 AM', order: 4 },
          ],
          totalDistanceKm: 26,
          estimatedDurationMins: 45,
          status: 'Active',
        },
      ];

      const insertedRoutes = await TransportRoute.insertMany(routesData);
      console.log(`[SeedStaff] Inserted ${insertedRoutes.length} transport routes.`);

      // Seed Vehicles
      const r1 = insertedRoutes.find((r) => r.routeNumber === 'Route 1');
      const r4 = insertedRoutes.find((r) => r.routeNumber === 'Route 4');
      const r7 = insertedRoutes.find((r) => r.routeNumber === 'Route 7');
      const r14 = insertedRoutes.find((r) => r.routeNumber === 'Route 14');

      const vehiclesData = [
        {
          vehicleNumber: 'KA-05-EX-4412',
          model: 'Tata Starbus Ultra 40-Seater',
          capacity: 40,
          assignedRoute: r1._id,
          driver: { name: 'Rajesh G.', phone: '+91 98451 22341', licenseNumber: 'KA-05-2014-9921', experienceYears: 9 },
          status: 'On Schedule',
          fuelType: 'Diesel',
          lastServiceDate: new Date('2026-09-15'),
          insuranceValidTill: new Date('2027-04-30'),
        },
        {
          vehicleNumber: 'KA-05-EX-8821',
          model: 'Ashok Leyland Lynx 45-Seater',
          capacity: 45,
          assignedRoute: r4._id,
          driver: { name: 'Imran Khan', phone: '+91 98451 77312', licenseNumber: 'KA-05-2016-4410', experienceYears: 7 },
          status: 'Delayed',
          fuelType: 'Diesel',
          lastServiceDate: new Date('2026-09-02'),
          insuranceValidTill: new Date('2027-05-15'),
        },
        {
          vehicleNumber: 'KA-05-EX-1904',
          model: 'Eicher Skyline Pro EV 40-Seater',
          capacity: 40,
          assignedRoute: r7._id,
          driver: { name: 'B. Srinivas', phone: '+91 98451 90843', licenseNumber: 'KA-05-2012-7811', experienceYears: 12 },
          status: 'On Schedule',
          fuelType: 'EV Electric',
          lastServiceDate: new Date('2026-09-20'),
          insuranceValidTill: new Date('2027-08-30'),
        },
        {
          vehicleNumber: 'KA-05-EX-6523',
          model: 'BharatBenz 50-Seater Deluxe',
          capacity: 50,
          assignedRoute: r14._id,
          driver: { name: 'Gurpreet Singh', phone: '+91 98451 55678', licenseNumber: 'KA-05-2015-1102', experienceYears: 8 },
          status: 'On Schedule',
          fuelType: 'Diesel',
          lastServiceDate: new Date('2026-08-25'),
          insuranceValidTill: new Date('2027-03-31'),
        },
        {
          vehicleNumber: 'KA-05-EX-3190',
          model: 'Force Traveller 18-Seater (Standby)',
          capacity: 18,
          driver: { name: 'Ramesh Gowda', phone: '+91 98451 12399', licenseNumber: 'KA-05-2018-0912', experienceYears: 5 },
          status: 'Standby',
          fuelType: 'CNG',
          lastServiceDate: new Date('2026-09-10'),
          insuranceValidTill: new Date('2027-06-15'),
        },
      ];

      const insertedVehicles = await TransportVehicle.insertMany(vehiclesData);
      console.log(`[SeedStaff] Inserted ${insertedVehicles.length} vehicles.`);

      // Seed Student Transport Allocation
      const v1 = insertedVehicles.find((v) => v.vehicleNumber === 'KA-05-EX-4412');
      const v7 = insertedVehicles.find((v) => v.vehicleNumber === 'KA-05-EX-1904');

      const transAllocations = [
        {
          student: pooja._id,
          route: r1._id,
          vehicle: v1._id,
          pickupStop: 'Indiranagar 100ft Junction',
          dropStop: 'Campus Main Gate Terminal',
          passNumber: 'TP-2026-0042',
          status: 'Active',
          validFrom: new Date('2026-07-01'),
          validTill: new Date('2027-06-30'),
        },
        {
          student: rohan._id,
          route: r7._id,
          vehicle: v7._id,
          pickupStop: 'HSR Layout Sector 2 Junction',
          dropStop: 'Campus Main Gate Terminal',
          passNumber: 'TP-2026-0089',
          status: 'Active',
          validFrom: new Date('2026-07-01'),
          validTill: new Date('2027-06-30'),
        },
      ];

      await TransportAllocation.insertMany(transAllocations);
      console.log('[SeedStaff] Inserted transport allocations.');
    }

    // 3. Seed Complaints
    const existingComplaints = await StaffComplaint.countDocuments();
    if (existingComplaints === 0) {
      const complaintsData = [
        {
          ticketNumber: 'CMP-2026-001',
          type: 'Hostel',
          category: 'Electrical',
          title: 'Flickering CFL tube and power socket spark in Room B-201',
          description: 'The ceiling tube light is buzzing and the secondary laptop charging plug socket in Room B-201 gives intermittent sparks. Requires immediate electrician inspection.',
          student: aarav._id,
          studentName: aarav.name,
          hostelBlock: 'Block B (Boys)',
          roomNumber: 'B-201',
          priority: 'High',
          status: 'In Progress',
          assignedTo: 'Electrician Ravi Kumar',
          resolutionNotes: 'Spare 36W LED fixture requested from inventory. Will replace by 4 PM.',
        },
        {
          ticketNumber: 'CMP-2026-002',
          type: 'Hostel',
          category: 'HVAC / Geyser',
          title: 'Solar Geyser not supplying hot water in Block C 2nd floor washroom',
          description: 'Water temperature remains lukewarm in the morning hours between 6 AM and 8 AM. Requesting thermostat inspection.',
          student: aditi._id,
          studentName: aditi.name,
          hostelBlock: 'Block C (Girls)',
          roomNumber: 'C-201',
          priority: 'Medium',
          status: 'Open',
          assignedTo: 'Plumbing Staff Satish',
          resolutionNotes: '',
        },
        {
          ticketNumber: 'CMP-2026-003',
          type: 'Transport',
          category: 'Bus Delay',
          title: 'Route 4 bus arrived 15 minutes late due to Hebbal flyover construction',
          description: 'Students standing at Yelahanka circle experienced an unannounced delay due to road diversion work. Real-time SMS update recommended.',
          routeNumber: 'Route 4',
          priority: 'Medium',
          status: 'Resolved',
          assignedTo: 'Transit Dispatcher Rajesh',
          resolutionNotes: 'Driver instructed to take parallel Service Road bypass during peak 07:30 AM window. Transit alert broadcasted to commuters.',
          resolvedAt: new Date(),
        },
        {
          ticketNumber: 'CMP-2026-004',
          type: 'Hostel',
          category: 'Cleanliness',
          title: 'Corridor water cooler filter replacement required in Block A',
          description: 'TDS monitor indicator light is flashing red on the ground floor drinking water station.',
          hostelBlock: 'Block A (Boys)',
          roomNumber: 'Ground Floor Lobby',
          priority: 'Low',
          status: 'Open',
          assignedTo: 'Sanitation Lead Ramesh',
        },
      ];

      await StaffComplaint.insertMany(complaintsData);
      console.log('[SeedStaff] Inserted staff complaints.');
    }

    // 4. Seed Notices for Staff/Hostel
    const staffUser = await User.findOne({ role: 'staff' });
    const authorId = staffUser ? staffUser._id : students[0]._id;

    const existingNotices = await Notice.find({
      title: { $regex: /hostel|transport|bus|water/i },
    });

    if (existingNotices.length === 0) {
      await Notice.create([
        {
          title: 'Scheduled Overhead Water Tank Cleaning — Block A & B (Boys Hostel)',
          content: 'The campus estate maintenance team will carry out semi-annual disinfection and cleaning of the main overhead water reservoir tanks on Saturday, 24th October from 09:00 AM to 02:00 PM. Water supply will remain temporarily suspended during this window. Residents are advised to store necessary drinking water.',
          author: authorId,
          authorName: 'M. Karthikeyan (Hostel & Facilities Cell)',
          category: 'General',
          targetAudience: 'All',
          pinned: true,
          publishedAt: new Date(),
        },
        {
          title: 'Suburban Bus Route 4 Temporary Diversion — Metro Flyover Work',
          content: 'Effective Monday, Route 4 buses will bypass the direct Hebbal Underpass due to ongoing BMRCL metro pier construction. The temporary morning pickup will be accommodated at the Hebbal Outer Ring Road Bus Shelter. Route timings remain advanced by 10 minutes.',
          author: authorId,
          authorName: 'Transit Fleet Management Desk',
          category: 'Urgent',
          targetAudience: 'Students',
          pinned: false,
          publishedAt: new Date(),
        },
      ]);
      console.log('[SeedStaff] Inserted staff estate notices.');
    }

    console.log('[SeedStaff] Staff collections seeded successfully.');
  } catch (err) {
    console.error('[SeedStaff] Error seeding staff data:', err);
  }
}

module.exports = { seedStaffData };
