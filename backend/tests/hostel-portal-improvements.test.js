require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Student = require('../src/models/Student');
const Department = require('../src/models/Department');
const HostelRoom = require('../src/models/HostelRoom');
const HostelAllocation = require('../src/models/HostelAllocation');
const TransportRoute = require('../src/models/TransportRoute');
const TransportVehicle = require('../src/models/TransportVehicle');
const TransportAllocation = require('../src/models/TransportAllocation');

const app = createApp();

describe('Hostel Portal — Required Changes Verification Suite', () => {
  let dbConnected = false;
  let staffToken = '';
  let staffUser = null;
  let student1User = null, student2User = null, student3User = null;
  let student1Record = null, student2Record = null, student3Record = null;
  let testRoom = null;
  let testPass = null;
  let testRoute = null;
  let testVehicle = null;

  before(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_minimum_32_chars';
    const conn = await connectDB();
    dbConnected = conn && conn.success;
    if (!dbConnected) return;

    // 1. Staff User & Token
    staffUser = await User.findOneAndUpdate(
      { username: 'test_hostel_warden' },
      {
        name: 'Chief Warden Test',
        username: 'test_hostel_warden',
        email: 'hostel_warden_test@campusverse.edu',
        role: 'staff',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    staffToken = jwt.sign({ sub: staffUser._id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // 2. Department
    let dept = await Department.findOne({
      $or: [{ code: 'CSE' }, { name: /Computer Science/i }],
    });
    if (!dept) {
      dept = await Department.findOne();
    }
    if (!dept) {
      dept = await Department.create({ name: 'Computer Science & Engineering', code: 'CSE' });
    }

    // 3. Three test students
    student1User = await User.findOneAndUpdate(
      { username: 'test_resident_1' },
      {
        name: 'Resident One',
        username: 'test_resident_1',
        email: 'resident1@campusverse.edu',
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    student1Record = await Student.findOneAndUpdate(
      { studentId: 'TEST-RES-001' },
      {
        user: student1User._id,
        name: 'Resident One',
        studentId: 'TEST-RES-001',
        email: 'resident1@campusverse.edu',
        department: dept._id,
        semester: 6,
        status: 'active',
      },
      { upsert: true, new: true }
    );

    student2User = await User.findOneAndUpdate(
      { username: 'test_resident_2' },
      {
        name: 'Resident Two',
        username: 'test_resident_2',
        email: 'resident2@campusverse.edu',
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    student2Record = await Student.findOneAndUpdate(
      { studentId: 'TEST-RES-002' },
      {
        user: student2User._id,
        name: 'Resident Two',
        studentId: 'TEST-RES-002',
        email: 'resident2@campusverse.edu',
        department: dept._id,
        semester: 6,
        status: 'active',
      },
      { upsert: true, new: true }
    );

    student3User = await User.findOneAndUpdate(
      { username: 'test_resident_3' },
      {
        name: 'Resident Three',
        username: 'test_resident_3',
        email: 'resident3@campusverse.edu',
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    student3Record = await Student.findOneAndUpdate(
      { studentId: 'TEST-RES-003' },
      {
        user: student3User._id,
        name: 'Resident Three',
        studentId: 'TEST-RES-003',
        email: 'resident3@campusverse.edu',
        department: dept._id,
        semester: 6,
        status: 'active',
      },
      { upsert: true, new: true }
    );

    // Clean up any stale allocations for these students
    await HostelAllocation.deleteMany({
      student: { $in: [student1Record._id, student2Record._id, student3Record._id] },
    });
    await HostelRoom.deleteMany({
      block: 'Block A (Boys)',
      roomNumber: { $in: ['TEST-A101', 'TEST-DUP-101', 'TEST-VAL-102'] },
    });
  });

  after(async () => {
    try {
      if (testRoom) {
        await HostelAllocation.deleteMany({ room: testRoom._id });
        await HostelRoom.findByIdAndDelete(testRoom._id);
      }
      if (testPass) {
        await TransportAllocation.findByIdAndDelete(testPass._id);
      }
      if (testVehicle) {
        await TransportVehicle.findByIdAndDelete(testVehicle._id);
      }
      if (testRoute) {
        await TransportRoute.findByIdAndDelete(testRoute._id);
      }
      if (student1Record) await Student.findByIdAndDelete(student1Record._id);
      if (student2Record) await Student.findByIdAndDelete(student2Record._id);
      if (student3Record) await Student.findByIdAndDelete(student3Record._id);
      if (student1User) await User.findByIdAndDelete(student1User._id);
      if (student2User) await User.findByIdAndDelete(student2User._id);
      if (student3User) await User.findByIdAndDelete(student3User._id);
      if (staffUser) await User.findByIdAndDelete(staffUser._id);
    } catch {
      // ignore cleanup errors
    }
  });

  // REQUIREMENT 1: Overview Section alerts removal
  it('1. Overview section must NOT include transit route delay or high priority maintenance ticket alerts', async () => {
    const res = await request(app)
      .get('/api/staff/dashboard')
      .set('Authorization', `Bearer ${staffToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.alerts));

    const delayAlert = res.body.alerts.find(
      (a) => a.title && a.title.toLowerCase().includes('transit route')
    );
    assert.strictEqual(delayAlert, undefined, 'Transit Route delay notification must be removed');

    const ticketAlert = res.body.alerts.find(
      (a) => a.title && a.title.toLowerCase().includes('maintenance ticket')
    );
    assert.strictEqual(ticketAlert, undefined, 'High priority maintenance ticket notification must be removed');
  });

  // REQUIREMENT 4: Add New Room Validation & Duplicate Prevention
  it('4. Add new room validation: rejects incomplete details and prevents duplicate room records', async () => {
    // 4.1 Missing roomNumber
    const resNoRoom = await request(app)
      .post('/api/staff/hostel/rooms')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ block: 'Block A (Boys)', floor: 1, capacity: 2, monthlyRent: 4500 });
    assert.strictEqual(resNoRoom.status, 400);
    assert.ok(resNoRoom.body.error.toLowerCase().includes('room number'));

    // 4.2 Invalid floor
    const resBadFloor = await request(app)
      .post('/api/staff/hostel/rooms')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ roomNumber: 'TEST-VAL-102', block: 'Block A (Boys)', floor: 25, capacity: 2, monthlyRent: 4500 });
    assert.strictEqual(resBadFloor.status, 400);
    assert.ok(resBadFloor.body.error.toLowerCase().includes('floor'));

    // 4.3 Invalid capacity
    const resBadCap = await request(app)
      .post('/api/staff/hostel/rooms')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ roomNumber: 'TEST-VAL-102', block: 'Block A (Boys)', floor: 1, capacity: 0, monthlyRent: 4500 });
    assert.strictEqual(resBadCap.status, 400);
    assert.ok(resBadCap.body.error.toLowerCase().includes('capacity'));

    // 4.4 Non-positive monthly rent
    const resBadRent = await request(app)
      .post('/api/staff/hostel/rooms')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ roomNumber: 'TEST-VAL-102', block: 'Block A (Boys)', floor: 1, capacity: 2, monthlyRent: 0 });
    assert.strictEqual(resBadRent.status, 400);
    assert.ok(resBadRent.body.error.toLowerCase().includes('rent'));

    // 4.5 Successfully create valid room
    const resCreate = await request(app)
      .post('/api/staff/hostel/rooms')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        roomNumber: 'TEST-A101',
        block: 'Block A (Boys)',
        floor: 1,
        roomType: 'Double',
        capacity: 2,
        monthlyRent: 5000,
        amenities: ['Wi-Fi', 'Attached Bath', 'Study Desk'],
      });
    assert.strictEqual(resCreate.status, 201);
    assert.strictEqual(resCreate.body.success, true);
    testRoom = resCreate.body.room;
    assert.strictEqual(testRoom.roomNumber, 'TEST-A101');
    assert.strictEqual(testRoom.status, 'Available');
    assert.strictEqual(testRoom.occupiedBeds, 0);

    // 4.6 Attempt to add duplicate roomNumber in same block (case-insensitive)
    const resDuplicate = await request(app)
      .post('/api/staff/hostel/rooms')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        roomNumber: 'test-a101',
        block: 'Block A (Boys)',
        floor: 1,
        capacity: 2,
        monthlyRent: 5000,
      });
    assert.strictEqual(resDuplicate.status, 400);
    assert.ok(resDuplicate.body.error.toLowerCase().includes('already exists') || resDuplicate.body.error.toLowerCase().includes('duplicate'));
  });

  // REQUIREMENT 3: Allocation Form Validation
  it('3. Allocation form validation: rejects missing student, room, bed, and emergency contact details', async () => {
    // 3.1 Missing student
    const resNoStudent = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        roomId: testRoom._id,
        bedNumber: 'Bed 1',
        emergencyContact: { name: 'Parent One', phone: '+91 98451 11111', relation: 'Parent' },
      });
    assert.strictEqual(resNoStudent.status, 400);
    assert.ok(resNoStudent.body.error.toLowerCase().includes('student'));

    // 3.2 Missing room
    const resNoRoom = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student1Record._id,
        bedNumber: 'Bed 1',
        emergencyContact: { name: 'Parent One', phone: '+91 98451 11111', relation: 'Parent' },
      });
    assert.strictEqual(resNoRoom.status, 400);
    assert.ok(resNoRoom.body.error.toLowerCase().includes('room'));

    // 3.3 Missing bedNumber
    const resNoBed = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student1Record._id,
        roomId: testRoom._id,
        bedNumber: '',
        emergencyContact: { name: 'Parent One', phone: '+91 98451 11111', relation: 'Parent' },
      });
    assert.strictEqual(resNoBed.status, 400);
    assert.ok(resNoBed.body.error.toLowerCase().includes('bed'));

    // 3.4 Missing emergency contact
    const resNoEmergency = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student1Record._id,
        roomId: testRoom._id,
        bedNumber: 'Bed 1',
      });
    assert.strictEqual(resNoEmergency.status, 400);
    assert.ok(resNoEmergency.body.error.toLowerCase().includes('emergency contact'));
  });

  // REQUIREMENT 2: Allocated Bed Management, Occupied Status Update & Duplicate Bed Prevention
  it('2. Allocated bed management: auto-updates room status to Occupied, prevents double-assigning beds or students', async () => {
    // 2.1 Allocate Bed 1 to Student 1
    const resAlloc1 = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student1Record._id,
        roomId: testRoom._id,
        bedNumber: 'Bed 1',
        emergencyContact: { name: 'Parent One', phone: '+91 98451 11111', relation: 'Parent' },
        remarks: 'First floor quiet zone allocation',
      });

    assert.strictEqual(resAlloc1.status, 201);
    assert.strictEqual(resAlloc1.body.success, true);
    assert.strictEqual(resAlloc1.body.allocation.bedNumber, 'Bed 1');

    // Verify room status is automatically updated to 'Occupied'
    const updatedRoom1 = await HostelRoom.findById(testRoom._id);
    assert.strictEqual(updatedRoom1.occupiedBeds, 1);
    assert.strictEqual(updatedRoom1.status, 'Occupied');

    // 2.2 Attempt to allocate the SAME Bed 1 to Student 2 (Prevent duplicate bed allocation)
    const resDupBed = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student2Record._id,
        roomId: testRoom._id,
        bedNumber: 'Bed 1',
        emergencyContact: { name: 'Parent Two', phone: '+91 98451 22222', relation: 'Parent' },
      });

    assert.strictEqual(resDupBed.status, 400);
    assert.ok(
      resDupBed.body.error.toLowerCase().includes('already occupied') ||
      resDupBed.body.error.toLowerCase().includes('already allocated')
    );

    // 2.3 Attempt to allocate Bed 2 to Student 1 (Student already has active allocation)
    const resDupStudent = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student1Record._id,
        roomId: testRoom._id,
        bedNumber: 'Bed 2',
        emergencyContact: { name: 'Parent One', phone: '+91 98451 11111', relation: 'Parent' },
      });

    assert.strictEqual(resDupStudent.status, 400);
    assert.ok(resDupStudent.body.error.toLowerCase().includes('already has an active room allocation'));

    // 2.4 Allocate Bed 2 to Student 2 -> room reaches capacity -> status becomes 'Fully Occupied'
    const resAlloc2 = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student2Record._id,
        roomId: testRoom._id,
        bedNumber: 'Bed 2',
        emergencyContact: { name: 'Parent Two', phone: '+91 98451 22222', relation: 'Parent' },
      });

    assert.strictEqual(resAlloc2.status, 201);
    const updatedRoom2 = await HostelRoom.findById(testRoom._id);
    assert.strictEqual(updatedRoom2.occupiedBeds, 2);
    assert.strictEqual(updatedRoom2.status, 'Fully Occupied');

    // 2.5 Attempt to allocate to a fully occupied room with Student 3 -> rejected
    const resAllocFull = await request(app)
      .post('/api/staff/hostel/allocate')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        studentId: student3Record._id,
        roomId: testRoom._id,
        bedNumber: 'Bed 3',
        emergencyContact: { name: 'Parent Three', phone: '+91 98451 33333', relation: 'Parent' },
      });
    assert.strictEqual(resAllocFull.status, 400);
    assert.ok(resAllocFull.body.error.toLowerCase().includes('fully occupied'));

    // 2.6 Vacate Bed 1 -> occupiedBeds decrements to 1 and status returns to 'Occupied'
    const vacateRes = await request(app)
      .put(`/api/staff/hostel/vacate/${resAlloc1.body.allocation._id}`)
      .set('Authorization', `Bearer ${staffToken}`);

    assert.strictEqual(vacateRes.status, 200);
    const updatedRoomVacated = await HostelRoom.findById(testRoom._id);
    assert.strictEqual(updatedRoomVacated.occupiedBeds, 1);
    assert.strictEqual(updatedRoomVacated.status, 'Occupied');
  });

  // REQUIREMENT 5: Transport Fee – Bus Pass PDF Download
  it('5. Transport fee – bus pass PDF download: generates valid printable PDF buffer with actual student credentials', async () => {
    // 5.1 Create test route and vehicle
    testRoute = await TransportRoute.create({
      routeNumber: 'Route 99',
      routeName: 'Outer Ring Express Line',
      startPoint: 'Outer Terminal A',
      destination: 'Campus Main Gate Terminal',
      stops: [
        { stopName: 'Outer Terminal A', time: '07:15 AM', order: 1 },
        { stopName: 'Indiranagar 100ft Junction', time: '07:35 AM', order: 2 },
        { stopName: 'Campus Main Gate Terminal', time: '08:15 AM', order: 3 },
      ],
      totalDistanceKm: 25,
      estimatedDurationMins: 45,
      status: 'Active',
    });

    testVehicle = await TransportVehicle.create({
      vehicleNumber: 'KA-05-TEST-9999',
      model: 'Tata Starbus Deluxe 45-Seater',
      capacity: 45,
      assignedRoute: testRoute._id,
      driver: { name: 'S. Ramamurthy', phone: '+91 98451 00099', licenseNumber: 'KA-05-2019-9999', experienceYears: 10 },
      status: 'On Schedule',
      fuelType: 'Diesel',
    });

    // 5.2 Create Transport Pass allocation for student 1
    testPass = await TransportAllocation.create({
      student: student1Record._id,
      route: testRoute._id,
      vehicle: testVehicle._id,
      pickupStop: 'Indiranagar 100ft Junction',
      dropStop: 'Campus Main Gate Terminal',
      passNumber: 'TP-2026-TEST-0099',
      status: 'Active',
      validFrom: new Date(),
      validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    // 5.3 Test Download PDF endpoint: /api/staff/transport/passes/:id/pdf
    const resPdf = await request(app)
      .get(`/api/staff/transport/passes/${testPass._id}/pdf`)
      .set('Authorization', `Bearer ${staffToken}`)
      .buffer(true)
      .parse((res, callback) => {
        const data = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(data)));
      });

    assert.strictEqual(resPdf.status, 200);
    assert.strictEqual(resPdf.headers['content-type'], 'application/pdf');
    assert.ok(
      resPdf.headers['content-disposition'].includes('attachment') &&
      resPdf.headers['content-disposition'].includes('BusPass_TP-2026-TEST-0099.pdf')
    );

    const pdfBuffer = resPdf.body;
    assert.ok(Buffer.isBuffer(pdfBuffer));
    assert.ok(pdfBuffer.length > 1000, 'PDF buffer must be non-empty');
    assert.strictEqual(pdfBuffer.slice(0, 8).toString(), '%PDF-1.4', 'PDF must start with %PDF-1.4 header');

    // 5.4 Test Preview PDF endpoint: /api/staff/transport/passes/:id/preview
    const resPreview = await request(app)
      .get(`/api/staff/transport/passes/${testPass._id}/preview`)
      .set('Authorization', `Bearer ${staffToken}`)
      .buffer(true)
      .parse((res, callback) => {
        const data = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(data)));
      });

    assert.strictEqual(resPreview.status, 200);
    assert.strictEqual(resPreview.headers['content-type'], 'application/pdf');
    assert.ok(
      resPreview.headers['content-disposition'].includes('inline') &&
      resPreview.headers['content-disposition'].includes('BusPass_TP-2026-TEST-0099.pdf')
    );
    assert.strictEqual(resPreview.body.slice(0, 8).toString(), '%PDF-1.4');
  });
});
