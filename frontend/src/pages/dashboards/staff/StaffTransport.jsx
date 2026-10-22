import React, { useState, useEffect } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  UserCheck,
  Shield,
  Fuel,
  Users,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { staffService, studentService } from '../../../services/api';

export const StaffTransport = () => {
  const [activeTab, setActiveTab] = useState('fleet'); // 'fleet' | 'routes' | 'passes'
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [showIssuePassModal, setShowIssuePassModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    model: 'Tata Starbus Ultra 40-Seater',
    capacity: 40,
    fuelType: 'Diesel',
    assignedRoute: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    driverExperience: 5,
    status: 'On Schedule',
  });

  const [routeForm, setRouteForm] = useState({
    routeNumber: '',
    routeName: '',
    startPoint: '',
    destination: 'Campus Main Gate Terminal',
    totalDistanceKm: 25,
    estimatedDurationMins: 45,
    stopsStr: 'MG Road Metro (07:15 AM), Indiranagar 100ft (07:30 AM), Domlur (07:45 AM), Campus Terminal (08:20 AM)',
  });

  const [passForm, setPassForm] = useState({
    studentId: '',
    routeId: '',
    vehicleId: '',
    pickupStop: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vehRes, routesRes, allocsRes, studentsRes] = await Promise.all([
        staffService.getTransportVehicles().catch(() => null),
        staffService.getTransportRoutes().catch(() => null),
        staffService.getTransportAllocations().catch(() => null),
        staffService.getStudentRecords().catch(() => studentService.getAll().catch(() => null)),
      ]);

      const fetchedVehicles = vehRes && vehRes.success ? (vehRes.vehicles || []) : [];
      const fetchedRoutes = routesRes && routesRes.success ? (routesRes.routes || []) : [];
      const fetchedAllocs = allocsRes && allocsRes.success ? (allocsRes.allocations || []) : [];
      const fetchedStudents = studentsRes && studentsRes.success ? (studentsRes.students || studentsRes.data || []) : [];

      setVehicles(fetchedVehicles);
      setRoutes(fetchedRoutes);
      setAllocations(fetchedAllocs);
      setAllStudents(fetchedStudents);
    } catch (err) {
      setError(err.message || 'Failed to load transport fleet data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const vehNum = String(v.vehicleNumber || '');
    return (
      vehNum.toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q) ||
      (v.driver?.name || '').toLowerCase().includes(q) ||
      (v.assignedRoute?.routeName || '').toLowerCase().includes(q)
    );
  });

  // Filtered passes
  const filteredPasses = allocations.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      (a.passNumber || '').toLowerCase().includes(q) ||
      (a.student?.name || '').toLowerCase().includes(q) ||
      (a.student?.studentId || '').toLowerCase().includes(q) ||
      (a.pickupStop || '').toLowerCase().includes(q)
    );
  });

  // Handle Create Vehicle
  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.vehicleNumber || !vehicleForm.driverName || !vehicleForm.driverPhone) {
      alert('Vehicle number and driver details are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffService.createTransportVehicle({
        vehicleNumber: vehicleForm.vehicleNumber,
        model: vehicleForm.model,
        capacity: Number(vehicleForm.capacity),
        fuelType: vehicleForm.fuelType,
        assignedRoute: vehicleForm.assignedRoute || undefined,
        status: vehicleForm.status,
        driver: {
          name: vehicleForm.driverName,
          phone: vehicleForm.driverPhone,
          licenseNumber: vehicleForm.driverLicense,
          experienceYears: Number(vehicleForm.driverExperience),
        },
      });

      if (res && res.success) {
        setSuccessMsg(`Vehicle ${vehicleForm.vehicleNumber} added to university fleet.`);
        setShowAddVehicleModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Route
  const handleCreateRoute = async (e) => {
    e.preventDefault();
    if (!routeForm.routeNumber || !routeForm.routeName || !routeForm.startPoint) {
      alert('Route number, name, and start point are required.');
      return;
    }
    setSubmitting(true);
    try {
      const stops = routeForm.stopsStr.split(',').map((item, idx) => {
        const parts = item.trim().split('(');
        const stopName = parts[0]?.trim() || `Stop ${idx + 1}`;
        const time = parts[1] ? parts[1].replace(')', '').trim() : '07:30 AM';
        return { stopName, time, order: idx + 1 };
      });

      const res = await staffService.createTransportRoute({
        routeNumber: routeForm.routeNumber,
        routeName: routeForm.routeName,
        startPoint: routeForm.startPoint,
        destination: routeForm.destination,
        totalDistanceKm: Number(routeForm.totalDistanceKm),
        estimatedDurationMins: Number(routeForm.estimatedDurationMins),
        stops,
      });

      if (res && res.success) {
        setSuccessMsg(`Route ${routeForm.routeNumber} published.`);
        setShowAddRouteModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create route.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Issue Pass
  const handleIssuePass = async (e) => {
    e.preventDefault();
    if (!passForm.studentId || !passForm.routeId || !passForm.pickupStop) {
      alert('Please fill student, route, and pickup stop.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffService.allocateTransportPass({
        studentId: passForm.studentId,
        routeId: passForm.routeId,
        vehicleId: passForm.vehicleId || undefined,
        pickupStop: passForm.pickupStop,
      });

      if (res && res.success) {
        setSuccessMsg(`Transport bus pass generated: ${res.allocation?.passNumber}`);
        setShowIssuePassModal(false);
        setPassForm({ studentId: '', routeId: '', vehicleId: '', pickupStop: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to issue transport pass.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle vehicle status
  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await staffService.updateTransportVehicle(vehicleId, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-[#4B5563] font-semibold">Loading fleet & route schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Transport Operations Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner
          variant="success"
          title="Fleet Action Success"
          message={successMsg}
          dismissible
          onDismiss={() => setSuccessMsg('')}
        />
      )}

      {/* KPI Ribbons matching Student Portal metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#111827] text-white shadow-sm">
          <span className="text-xs font-bold text-[#F1E7CF] uppercase tracking-wider block">Fleet Vehicles</span>
          <span className="text-2xl font-extrabold font-mono text-white mt-1.5 block">{vehicles.length} Buses</span>
          <span className="text-xs text-[#F1E7CF] font-medium mt-0.5 block">{vehicles.filter(v => v.status === 'On Schedule').length} Active on Arterial Routes</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-center shadow-sm">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Transit Routes</span>
          <span className="text-2xl font-extrabold font-mono text-[#D99A00] mt-1.5 block">{routes.length} Corridors</span>
          <span className="text-xs text-[#4B5563] font-medium mt-0.5 block">Serving Metro & Suburban Halts</span>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-[#F1E7CF] text-center shadow-sm">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Active Student Passes</span>
          <span className="text-2xl font-extrabold font-mono text-[#111827] mt-1.5 block">{allocations.length} Commuters</span>
          <span className="text-xs text-[#D99A00] font-bold mt-0.5 block">Digital RFID Bus Passes</span>
        </div>
        <div className="p-5 rounded-2xl bg-[#FFF8E6] border border-[#D99A00] text-center shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#111827] block">Fleet Delays</span>
          <span className="text-2xl font-extrabold font-mono text-[#111827] mt-1.5 block">
            {routes.filter(r => r.status === 'Delayed' || (r.delayMinutes && r.delayMinutes > 0)).length} Route
          </span>
          <span className="text-xs text-[#111827] font-semibold mt-0.5 block">Morning flyover congestion</span>
        </div>
      </div>

      {/* Tabs Switcher & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="p-1.5 rounded-2xl bg-[#FFF8E6]/30 border border-[#F1E7CF] flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'fleet'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <Bus className="w-4 h-4" />
            Vehicles & Drivers
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'fleet' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {vehicles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('routes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'routes'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Routes & Halts
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'routes' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {routes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('passes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'passes'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Student Transport Passes
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'passes' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {allocations.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddVehicleModal(true)}
          >
            Add Vehicle
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowAddRouteModal(true)}
          >
            Add Route
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            onClick={() => setShowIssuePassModal(true)}
          >
            Issue Bus Pass
          </Button>
        </div>
      </div>

      {/* TAB 1: FLEET VEHICLES & DRIVERS */}
      {activeTab === 'fleet' && (
        <Card
          title="University Transit Fleet & Drivers"
          subtitle="Bus specifications, assigned arterial corridors, licensed chauffeurs, and telemetry status"
          headerAction={
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bus # or driver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00] w-48"
              />
            </div>
          }
        >
          {filteredVehicles.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#4B5563] font-semibold">
              No vehicles found matching search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDF5] text-[#111827] font-bold text-xs uppercase tracking-wider border-b border-[#F1E7CF]">
                  <tr>
                    <th className="p-3.5">Registration #</th>
                    <th className="p-3.5">Model & Capacity</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Driver & License</th>
                    <th className="p-3.5">Fuel Type</th>
                    <th className="p-3.5 text-center">Telemetry Status</th>
                    <th className="p-3.5 text-right">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E7CF]">
                  {filteredVehicles.map((v) => (
                    <tr key={v._id} className="hover:bg-[#FFF8E6]/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#111827] text-sm">
                        {v.vehicleNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#111827] block">{v.model}</span>
                        <span className="text-[11px] font-mono text-[#4B5563] font-medium">{v.capacity} Seater Capacity</span>
                      </td>
                      <td className="p-3.5 font-medium text-[#D99A00]">
                        {v.assignedRoute?.routeNumber ? (
                          <div>
                            <span className="font-bold block">{v.assignedRoute.routeNumber}</span>
                            <span className="text-[11px] text-[#4B5563] font-semibold">{v.assignedRoute.routeName}</span>
                          </div>
                        ) : (
                          <span className="text-[#4B5563] italic">Standby Reserve</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#111827] block">{v.driver?.name}</span>
                        <span className="text-[11px] font-mono text-[#4B5563] font-semibold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#D99A00]" />
                          {v.driver?.phone} • {v.driver?.experienceYears}y exp
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Badge variant="neutral" size="sm">{v.fuelType}</Badge>
                      </td>
                      <td className="p-3.5 text-center">
                        <Badge
                          variant={v.status === 'On Schedule' ? 'teal' : v.status === 'Delayed' ? 'warning' : 'neutral'}
                          size="sm"
                          hasDot
                        >
                          {v.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <select
                          value={v.status}
                          onChange={(e) => handleStatusChange(v._id, e.target.value)}
                          className="text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl px-2.5 py-1 text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                        >
                          <option value="On Schedule">On Schedule</option>
                          <option value="Delayed">Delayed</option>
                          <option value="In Maintenance">In Maintenance</option>
                          <option value="Standby">Standby</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: ROUTES & STOPS */}
      {activeTab === 'routes' && (
        <Card
          title="Transit Corridors & Stoppage Matrix"
          subtitle="Complete route sequence, arrival timetables, total kilometers, and transit status"
        >
          <div className="space-y-4">
            {routes.map((r) => (
              <div
                key={r._id}
                className="p-5 rounded-2xl border border-[#F1E7CF] bg-white shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1E7CF] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] flex items-center justify-center text-[#D99A00] font-bold font-mono">
                      {r.routeNumber}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#111827]">{r.routeName}</h4>
                      <p className="text-xs text-[#4B5563] font-mono font-medium">
                        {r.startPoint} ➔ {r.destination} • {r.totalDistanceKm} km ({r.estimatedDurationMins} mins)
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={r.status === 'Active' ? 'teal' : 'warning'}
                    size="sm"
                    hasDot
                  >
                    {r.status} {r.delayMinutes ? `(+${r.delayMinutes} mins delay)` : ''}
                  </Badge>
                </div>

                {/* Stoppages list */}
                <div>
                  <span className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider block mb-2">
                    Sequential Bus Stops & Morning Timetable:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {(r.stops || []).map((stop, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#F1E7CF] text-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-5 h-5 rounded-full bg-[#D99A00] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-[#111827] truncate">{stop.stopName}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#D99A00] shrink-0">
                          {stop.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: STUDENT TRANSPORT PASSES */}
      {activeTab === 'passes' && (
        <Card
          title="Student Transport Commuter Passes"
          subtitle="Issued suburban transport passes, designated boarding halts, and validity"
          headerAction={
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#4B5563] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search pass # or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00] w-48"
              />
            </div>
          }
        >
          {filteredPasses.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#4B5563] font-semibold">
              No transport passes found matching query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDF5] text-[#111827] font-bold text-xs uppercase tracking-wider border-b border-[#F1E7CF]">
                  <tr>
                    <th className="p-3.5">Pass #</th>
                    <th className="p-3.5">Student Commuter</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Pickup Stoppage</th>
                    <th className="p-3.5">Fleet Vehicle</th>
                    <th className="p-3.5">Valid Till</th>
                    <th className="p-3.5 text-right">Pass Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E7CF]">
                  {filteredPasses.map((p) => (
                    <tr key={p._id} className="hover:bg-[#FFF8E6]/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#D99A00]">
                        {p.passNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-[#111827] block">{p.student?.name}</span>
                        <span className="text-[11px] font-mono text-[#4B5563] font-semibold">{p.student?.studentId}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#111827]">
                        {p.route?.routeNumber}: {p.route?.routeName}
                      </td>
                      <td className="p-3.5 text-[#111827]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#D99A00] shrink-0" />
                          <span>{p.pickupStop}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-medium text-[#111827]">
                        {p.vehicle?.vehicleNumber || 'Route Bus'}
                      </td>
                      <td className="p-3.5 font-mono font-medium text-[#111827]">
                        {p.validTill ? new Date(p.validTill).toLocaleDateString('en-IN') : 'End of Academic Year'}
                      </td>
                      <td className="p-3.5 text-right">
                        <Badge variant="teal" size="sm" hasDot>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* MODAL: ADD VEHICLE */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddVehicleModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <Bus className="w-5 h-5 text-[#D99A00]" />
              Register Transit Bus
            </h3>
            <p className="text-xs text-[#4B5563] font-medium mt-1">Enroll a new campus bus or contractual shuttle.</p>

            <form onSubmit={handleCreateVehicle} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Registration # *</label>
                  <input
                    required
                    type="text"
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value.toUpperCase() })}
                    placeholder="e.g. KA-05-EX-9900"
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] uppercase font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Model *</label>
                  <input
                    required
                    type="text"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    placeholder="e.g. Tata Starbus Ultra"
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Capacity</label>
                  <input
                    type="number"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Fuel Type</label>
                  <select
                    value={vehicleForm.fuelType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="EV Electric">EV Electric</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Assign Route</label>
                  <select
                    value={vehicleForm.assignedRoute}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, assignedRoute: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  >
                    <option value="">-- Standby --</option>
                    {routes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.routeNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F1E7CF]">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Driver Full Name *</label>
                  <input
                    required
                    type="text"
                    value={vehicleForm.driverName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                    placeholder="Driver Name"
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Driver Phone *</label>
                  <input
                    required
                    type="text"
                    value={vehicleForm.driverPhone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddVehicleModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ROUTE */}
      {showAddRouteModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddRouteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D99A00]" />
              Create Transit Route
            </h3>
            <p className="text-xs text-[#4B5563] font-medium mt-1">Define an official suburban or metro corridor route.</p>

            <form onSubmit={handleCreateRoute} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Route Identifier *</label>
                  <input
                    required
                    type="text"
                    value={routeForm.routeNumber}
                    onChange={(e) => setRouteForm({ ...routeForm, routeNumber: e.target.value })}
                    placeholder="e.g. Route 9"
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Route Corridor Name *</label>
                  <input
                    required
                    type="text"
                    value={routeForm.routeName}
                    onChange={(e) => setRouteForm({ ...routeForm, routeName: e.target.value })}
                    placeholder="e.g. Whitefield Tech Park Express"
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Starting Point *</label>
                  <input
                    required
                    type="text"
                    value={routeForm.startPoint}
                    onChange={(e) => setRouteForm({ ...routeForm, startPoint: e.target.value })}
                    placeholder="e.g. Hope Farm Junction"
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#111827] block mb-1">Destination *</label>
                  <input
                    required
                    type="text"
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                    className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">
                  Stops & Timetable Sequence (Comma-separated with times in parenthesis)
                </label>
                <textarea
                  rows={3}
                  value={routeForm.stopsStr}
                  onChange={(e) => setRouteForm({ ...routeForm, stopsStr: e.target.value })}
                  placeholder="Stop A (07:15 AM), Stop B (07:30 AM), Stop C (07:45 AM)"
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-mono text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                />
              </div>

              <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddRouteModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Route'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE STUDENT PASS */}
      {showIssuePassModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIssuePassModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#D99A00]" />
              Issue Student Transit Pass
            </h3>
            <p className="text-xs text-[#4B5563] font-medium mt-1">Generate a digital commuter pass for semester bus transit.</p>

            <form onSubmit={handleIssuePass} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827] block mb-1">Select Student *</label>
                <select
                  required
                  value={passForm.studentId}
                  onChange={(e) => setPassForm({ ...passForm, studentId: e.target.value })}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                >
                  <option value="">-- Choose Student --</option>
                  {allStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Select Route *</label>
                <select
                  required
                  value={passForm.routeId}
                  onChange={(e) => setPassForm({ ...passForm, routeId: e.target.value })}
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                >
                  <option value="">-- Choose Route Corridor --</option>
                  {routes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.routeNumber}: {r.routeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827] block mb-1">Designated Pickup Stoppage *</label>
                <input
                  required
                  type="text"
                  value={passForm.pickupStop}
                  onChange={(e) => setPassForm({ ...passForm, pickupStop: e.target.value })}
                  placeholder="e.g. Indiranagar 100ft Junction"
                  className="w-full p-2.5 bg-[#FFFDF5] border border-[#F1E7CF] rounded-xl text-[#111827] font-semibold focus:outline-none focus:ring-1 focus:ring-[#D99A00]"
                />
              </div>

              <div className="pt-3 border-t border-[#F1E7CF] flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowIssuePassModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Issuing Pass...' : 'Confirm & Issue Pass'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTransport;
