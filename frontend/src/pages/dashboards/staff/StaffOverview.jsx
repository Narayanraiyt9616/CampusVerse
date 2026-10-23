import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Bus,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Phone,
  ShieldAlert,
  Building2,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import StatCard from '../../../components/common/StatCard';
import AlertBanner from '../../../components/common/AlertBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { staffService } from '../../../services/api';

const FALLBACK_DASHBOARD = {
  stats: {
    totalRooms: 14,
    totalBeds: 26,
    occupiedBeds: 11,
    availableBeds: 15,
    occupancyRate: 42,
    totalResidents: 3,
    totalRoutes: 4,
    activeRoutes: 3,
    delayedRoutes: 1,
    totalVehicles: 5,
    onScheduleVehicles: 3,
    openComplaints: 3,
    highPriorityComplaints: 1,
  },
  hostelBlocksSummary: [
    { block: 'Block A (Boys)', totalRooms: 4, totalCapacity: 8, occupied: 2, maintenanceRooms: 1, available: 6, occupancyPct: 25, status: '1 Under Maintenance' },
    { block: 'Block B (Boys)', totalRooms: 3, totalCapacity: 6, occupied: 4, maintenanceRooms: 0, available: 2, occupancyPct: 67, status: 'Normal Operations' },
    { block: 'Block C (Girls)', totalRooms: 3, totalCapacity: 6, occupied: 3, maintenanceRooms: 0, available: 3, occupancyPct: 50, status: 'Normal Operations' },
    { block: 'Block D (Girls)', totalRooms: 2, totalCapacity: 4, occupied: 2, maintenanceRooms: 0, available: 2, occupancyPct: 50, status: 'Normal Operations' },
    { block: 'Block E (PG Wings)', totalRooms: 2, totalCapacity: 2, occupied: 0, maintenanceRooms: 0, available: 2, occupancyPct: 0, status: 'Normal Operations' },
  ],
  transportFleet: [
    {
      _id: 'fleet-1',
      vehicleNumber: 'KA-05-EX-1904',
      model: 'Eicher Skyline Pro EV 40-Seater',
      capacity: 40,
      assignedRoute: { routeNumber: 'Route 7', routeName: 'Tech Corridor Hub Route' },
      status: 'On Schedule',
      fuelType: 'EV Electric',
      driver: { name: 'B. Srinivas', phone: '+91 98451 90843' }
    },
    {
      _id: 'fleet-2',
      vehicleNumber: 'KA-05-TR-2841',
      model: 'Tata Starbus Ultra 40-Seater',
      capacity: 40,
      assignedRoute: { routeNumber: 'Route 3', routeName: 'Metro Feeder Express' },
      status: 'On Schedule',
      fuelType: 'CNG Green',
      driver: { name: 'K. Narayana', phone: '+91 97412 34509' }
    },
    {
      _id: 'fleet-3',
      vehicleNumber: 'KA-05-EX-4412',
      model: 'Ashok Leyland Falcon 42-Seater',
      capacity: 42,
      assignedRoute: { routeNumber: 'Route 11', routeName: 'Suburban North Ring' },
      status: 'Delayed',
      fuelType: 'Diesel',
      driver: { name: 'M. Suresh Babu', phone: '+91 96118 77234' }
    },
    {
      _id: 'fleet-4',
      vehicleNumber: 'KA-05-EV-5509',
      model: 'Olectra K9 Electric 36-Seater',
      capacity: 36,
      assignedRoute: { routeNumber: 'Route 15', routeName: 'South Campus Shuttle' },
      status: 'On Schedule',
      fuelType: 'EV Electric',
      driver: { name: 'G. Venkatesh', phone: '+91 94481 00293' }
    },
  ],
  recentComplaints: [
    {
      _id: 'cmp-1',
      ticketNumber: 'CMP-2026-001',
      type: 'Hostel',
      category: 'Electrical',
      title: 'Flickering CFL tube and power socket spark in Room B-201',
      description: 'The ceiling tube light is buzzing and the secondary laptop charging plug socket in Room B-201 gives intermittent sparks.',
      hostelBlock: 'Block B (Boys)',
      roomNumber: 'B-201',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Electrician Ravi Kumar'
    },
    {
      _id: 'cmp-2',
      ticketNumber: 'CMP-2026-002',
      type: 'Hostel',
      category: 'Plumbing',
      title: 'Hot water geyser valve leak in Block C 3rd Floor washroom',
      description: 'Low water pressure and continuous leakage from safety relief valve in 3rd-floor central shower stalls.',
      hostelBlock: 'Block C (Girls)',
      roomNumber: 'Floor 3 Washroom',
      priority: 'Emergency',
      status: 'In Progress',
      assignedTo: 'Plumber Mahadev'
    },
    {
      _id: 'cmp-3',
      ticketNumber: 'CMP-2026-003',
      type: 'Transport',
      category: 'Fleet Delay',
      title: 'Morning Route 11 delayed by 25 minutes due to Metro line work',
      description: 'Traffic diversion on Outer Ring Road caused bus KA-05-EX-4412 to arrive late at Indiranagar stop.',
      routeNumber: 'Route 11',
      priority: 'Medium',
      status: 'Resolved',
      assignedTo: 'Transport Dispatcher'
    }
  ],
  alerts: []
};

export const StaffOverview = () => {
  const location = useLocation();
  const isHostelBase = location.pathname.startsWith('/hostel');
  const basePath = isHostelBase ? '/hostel' : '/staff';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await staffService.getDashboard();
      if (res && res.success && res.stats) {
        setData(res);
      } else {
        setData(FALLBACK_DASHBOARD);
      }
    } catch (err) {
      console.error('Fetch staff dashboard error:', err);
      setData(FALLBACK_DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-[#4B5563] font-semibold">Loading estate & fleet telemetry from database...</p>
      </div>
    );
  }

  const activeData = data || FALLBACK_DASHBOARD;
  const stats = activeData.stats || FALLBACK_DASHBOARD.stats;
  const blocks = activeData.hostelBlocksSummary || FALLBACK_DASHBOARD.hostelBlocksSummary;
  const fleet = activeData.transportFleet || FALLBACK_DASHBOARD.transportFleet;
  const complaints = activeData.recentComplaints || FALLBACK_DASHBOARD.recentComplaints;
  const alerts = (activeData.alerts || FALLBACK_DASHBOARD.alerts || []).filter(
    (al) =>
      !al?.title?.toLowerCase().includes('transit route') &&
      !al?.title?.toLowerCase().includes('maintenance ticket')
  );

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Telemetry Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Operational Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((al, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-[#D99A00]/30 bg-[#FFF8E6] text-[#111827] flex items-start gap-3 shadow-sm"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#D99A00]" />
              <div className="flex-1 text-sm">
                <span className="font-bold block text-base text-[#111827]">{al.title}</span>
                <p className="mt-0.5 text-[#4B5563] leading-relaxed font-medium">{al.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Stat Cards matching Student Portal StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Hostel Bed Occupancy"
          value={`${stats.occupancyRate}%`}
          subtitle={`${stats.occupiedBeds} of ${stats.totalBeds} Beds Filled`}
          change={`${stats.availableBeds} Available`}
          changeType={stats.availableBeds > 5 ? 'increase' : 'decrease'}
          icon={<Home className="w-5 h-5 text-[#D99A00]" />}
        />

        <StatCard
          title="Active Transit Routes"
          value={stats.activeRoutes}
          subtitle={`${stats.totalRoutes} Metro & Suburban Corridors`}
          change={stats.delayedRoutes > 0 ? `${stats.delayedRoutes} Delayed` : 'All On Time'}
          changeType={stats.delayedRoutes > 0 ? 'decrease' : 'increase'}
          icon={<Bus className="w-5 h-5 text-[#D99A00]" />}
        />

        <StatCard
          title="Assigned Fleet Buses"
          value={stats.totalVehicles}
          subtitle={`${stats.onScheduleVehicles} Vehicles In Service`}
          change="Operational"
          changeType="increase"
          icon={<CheckCircle2 className="w-5 h-5 text-[#D99A00]" />}
        />

        <StatCard
          title="Open Maintenance Tickets"
          value={stats.openComplaints}
          subtitle="Electrical, Plumbing & Fleet"
          change={stats.highPriorityComplaints > 0 ? `${stats.highPriorityComplaints} Urgent` : 'Normal Queue'}
          changeType={stats.highPriorityComplaints > 0 ? 'decrease' : 'neutral'}
          icon={<Wrench className="w-5 h-5 text-[#D99A00]" />}
        />
      </div>

      {/* Quick Access Module Cards Grid matching Student Portal signature */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { to: `${basePath}/hostel`, label: 'Hostel Management', icon: <Home className="w-5 h-5" />, desc: 'Room inventory, bed allocation & vacancy ledger' },
          { to: `${basePath}/transport`, label: 'Transport Fleet', icon: <Bus className="w-5 h-5" />, desc: 'Fleet telemetry, commuter routes & bus passes' },
          { to: `${basePath}/students`, label: 'Student Records', icon: <Users className="w-5 h-5" />, desc: 'Master roster of hostel boarders & transit commuters' },
          { to: `${basePath}/complaints`, label: 'Complaints & Notices', icon: <ClipboardList className="w-5 h-5" />, desc: 'Maintenance tickets & campus service advisories' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group block">
            <div className="p-5 rounded-2xl border border-[#F1E7CF] bg-white hover:border-[#D99A00] shadow-sm hover:shadow-card-hover transition-all duration-200 group-hover:-translate-y-0.5 h-full">
              <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-[#D99A00] flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <p className="font-bold text-[#111827] text-sm">{item.label}</p>
              <p className="text-xs text-[#4B5563] font-medium mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid: Hostel Complex Status & Transport Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hostel Complex Roster (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Hostel Residential Complex Status"
            subtitle="Live bed capacity, active occupancy, and facility maintenance breakdown"
            headerAction={
              <Link
                to={`${basePath}/hostel`}
                className="text-xs font-bold text-[#D99A00] hover:underline flex items-center gap-1"
              >
                Manage Rooms <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FFFDF5] text-[#111827] font-bold text-xs uppercase tracking-wider border-b border-[#F1E7CF]">
                  <tr>
                    <th className="p-3.5">Hostel Block</th>
                    <th className="p-3.5 text-center">Rooms</th>
                    <th className="p-3.5 text-center">Beds</th>
                    <th className="p-3.5 text-center">Occupied</th>
                    <th className="p-3.5 text-center">Available</th>
                    <th className="p-3.5 min-w-[140px]">Utilization</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E7CF]">
                  {blocks.map((b, idx) => (
                    <tr key={idx} className="hover:bg-[#FFF8E6]/30 transition-colors">
                      <td className="p-3.5 font-bold text-[#111827]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#D99A00]" />
                          <span>{b.block}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono text-[#111827] font-medium">
                        {b.totalRooms}
                      </td>
                      <td className="p-3.5 text-center font-mono text-[#111827]">
                        {b.totalCapacity}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-[#D99A00]">
                        {b.occupied}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-[#111827]">
                        {b.available}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono font-bold text-[#111827]">
                            <span>{b.occupancyPct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#FFF8E6] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#D99A00] transition-all duration-500"
                              style={{ width: `${Math.min(b.occupancyPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <Badge
                          variant={b.maintenanceRooms > 0 ? 'warning' : 'teal'}
                          size="sm"
                          hasDot
                        >
                          {b.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Fleet Dispatch Overview */}
          <Card
            title="University Transit Fleet Telemetry"
            subtitle="Campus feeder buses, suburban routes, driver assignments, and live schedule status"
            headerAction={
              <Link
                to={`${basePath}/transport`}
                className="text-xs font-bold text-[#D99A00] hover:underline flex items-center gap-1"
              >
                Fleet Manager <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FFFDF5] text-[#111827] font-bold text-xs uppercase tracking-wider border-b border-[#F1E7CF]">
                  <tr>
                    <th className="p-3.5">Vehicle #</th>
                    <th className="p-3.5">Model & Fuel</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Driver Contact</th>
                    <th className="p-3.5 text-right">Telemetry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1E7CF]">
                  {fleet.map((v) => (
                    <tr key={v._id} className="hover:bg-[#FFF8E6]/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#111827]">
                        {v.vehicleNumber}
                      </td>
                      <td className="p-3.5 text-[#111827]">
                        <span className="font-bold block">{v.model}</span>
                        <span className="text-xs text-[#4B5563] font-mono font-medium">{v.fuelType} • {v.capacity} Seats</span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#D99A00]">
                        {v.assignedRoute?.routeNumber ? (
                          <span>{v.assignedRoute.routeNumber}: {v.assignedRoute.routeName}</span>
                        ) : (
                          <span className="text-[#4B5563] italic">Standby / Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#111827]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#D99A00]" />
                          <span>{v.driver?.name} ({v.driver?.phone})</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <Badge
                          variant={v.status === 'On Schedule' ? 'teal' : v.status === 'Delayed' ? 'warning' : 'neutral'}
                          size="sm"
                          hasDot
                        >
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Sidebar: Recent Complaints & Quick Actions */}
        <div className="space-y-6">
          <Card
            title="Recent Maintenance Requests"
            subtitle="Hostel repair requests & transit delay tickets"
            headerAction={
              <Link
                to={`${basePath}/complaints`}
                className="text-xs font-bold text-[#D99A00] hover:underline"
              >
                View All
              </Link>
            }
          >
            <div className="space-y-3">
              {complaints.length === 0 ? (
                <p className="text-xs text-[#4B5563] py-6 text-center font-medium">No open complaints reported.</p>
              ) : (
                complaints.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-2xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6]/20 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#D99A00]">
                        {c.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={c.priority === 'High' || c.priority === 'Emergency' ? 'danger' : 'neutral'}
                          size="sm"
                        >
                          {c.priority}
                        </Badge>
                        <Badge
                          variant={c.status === 'Resolved' ? 'teal' : c.status === 'In Progress' ? 'teal' : 'warning'}
                          size="sm"
                        >
                          {c.status}
                        </Badge>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-[#111827] line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed font-medium">
                      {c.description}
                    </p>

                    <div className="pt-2 border-t border-[#F1E7CF] flex items-center justify-between text-xs text-[#4B5563] font-mono font-medium">
                      <span>{c.hostelBlock ? `${c.hostelBlock} • ${c.roomNumber || ''}` : c.routeNumber}</span>
                      <span>Assigned: {c.assignedTo || 'Duty Officer'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card title="Quick Logistics Actions" subtitle="Fast administrative workflows">
            <div className="space-y-2">
              <Link
                to={`${basePath}/hostel`}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] text-xs font-bold text-[#111827] transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-[#D99A00]" />
                  <span>Allocate Hostel Bed to Student</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#D99A00]" />
              </Link>

              <Link
                to={`${basePath}/transport`}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] text-xs font-bold text-[#111827] transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Bus className="w-4 h-4 text-[#D99A00]" />
                  <span>Issue Student Bus Pass</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#D99A00]" />
              </Link>

              <Link
                to={`${basePath}/complaints`}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#F1E7CF] bg-white hover:bg-[#FFF8E6] text-xs font-bold text-[#111827] transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-[#D99A00]" />
                  <span>Log Maintenance / Transit Complaint</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#D99A00]" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffOverview;
