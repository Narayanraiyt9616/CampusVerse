import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import StatCard from '../../../components/common/StatCard';
import AlertBanner from '../../../components/common/AlertBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { staffService } from '../../../services/api';

export const StaffOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await staffService.getDashboard();
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Fetch staff dashboard error:', err);
      setError(err.message || 'Failed to load estate operations telemetry.');
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
        <p className="mt-3 text-xs text-[#102A43]/70 font-semibold">Loading estate & fleet telemetry from database...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    occupancyRate: 0,
    totalResidents: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    totalVehicles: 0,
    onScheduleVehicles: 0,
    openComplaints: 0,
    highPriorityComplaints: 0,
  };

  const blocks = data?.hostelBlocksSummary || [];
  const fleet = data?.transportFleet || [];
  const complaints = data?.recentComplaints || [];
  const alerts = data?.alerts || [];

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
              className="p-4 rounded-2xl border border-[#0D9488]/30 bg-[#CCFBF1] text-[#102A43] flex items-start gap-3 shadow-sm"
            >
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#0D9488]" />
              <div className="flex-1 text-sm">
                <span className="font-bold block text-base text-[#102A43]">{al.title}</span>
                <p className="mt-0.5 text-[#102A43]/80 leading-relaxed font-medium">{al.message}</p>
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
          icon={<Home className="w-5 h-5 text-[#0D9488]" />}
        />

        <StatCard
          title="Active Transit Routes"
          value={stats.activeRoutes}
          subtitle={`${stats.totalRoutes} Metro & Suburban Corridors`}
          change={stats.delayedRoutes > 0 ? `${stats.delayedRoutes} Delayed` : 'All On Time'}
          changeType={stats.delayedRoutes > 0 ? 'decrease' : 'increase'}
          icon={<Bus className="w-5 h-5 text-[#0D9488]" />}
        />

        <StatCard
          title="Assigned Fleet Buses"
          value={stats.totalVehicles}
          subtitle={`${stats.onScheduleVehicles} Vehicles In Service`}
          change="Operational"
          changeType="increase"
          icon={<CheckCircle2 className="w-5 h-5 text-[#0D9488]" />}
        />

        <StatCard
          title="Open Maintenance Tickets"
          value={stats.openComplaints}
          subtitle="Electrical, Plumbing & Fleet"
          change={stats.highPriorityComplaints > 0 ? `${stats.highPriorityComplaints} Urgent` : 'Normal Queue'}
          changeType={stats.highPriorityComplaints > 0 ? 'decrease' : 'neutral'}
          icon={<Wrench className="w-5 h-5 text-[#0D9488]" />}
        />
      </div>

      {/* Quick Access Module Cards Grid matching Student Portal signature */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { to: '/staff/hostel', label: 'Hostel Management', icon: <Home className="w-5 h-5" />, desc: 'Room inventory, bed allocation & vacancy ledger' },
          { to: '/staff/transport', label: 'Transport Fleet', icon: <Bus className="w-5 h-5" />, desc: 'Fleet telemetry, commuter routes & bus passes' },
          { to: '/staff/students', label: 'Student Records', icon: <Users className="w-5 h-5" />, desc: 'Master roster of hostel boarders & transit commuters' },
          { to: '/staff/complaints', label: 'Complaints & Notices', icon: <ClipboardList className="w-5 h-5" />, desc: 'Maintenance tickets & campus service advisories' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="group block">
            <div className="p-5 rounded-2xl border border-[#CCFBF1] bg-white hover:border-[#0D9488] shadow-sm hover:shadow-card-hover transition-all duration-200 group-hover:-translate-y-0.5 h-full">
              <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center mb-3.5 shadow-sm group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <p className="font-bold text-[#102A43] text-sm">{item.label}</p>
              <p className="text-xs text-[#102A43]/70 font-medium mt-1 leading-relaxed">{item.desc}</p>
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
                to="/staff/hostel"
                className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1"
              >
                Manage Rooms <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F0FDFA] text-[#102A43] font-bold text-xs uppercase tracking-wider border-b border-[#CCFBF1]">
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
                <tbody className="divide-y divide-[#CCFBF1]">
                  {blocks.map((b, idx) => (
                    <tr key={idx} className="hover:bg-[#CCFBF1]/30 transition-colors">
                      <td className="p-3.5 font-bold text-[#102A43]">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#0D9488]" />
                          <span>{b.block}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono text-[#102A43] font-medium">
                        {b.totalRooms}
                      </td>
                      <td className="p-3.5 text-center font-mono text-[#102A43]">
                        {b.totalCapacity}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-[#0D9488]">
                        {b.occupied}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-[#102A43]">
                        {b.available}
                      </td>
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-mono font-bold text-[#102A43]">
                            <span>{b.occupancyPct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#CCFBF1] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#0D9488] transition-all duration-500"
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
                to="/staff/transport"
                className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1"
              >
                Fleet Manager <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F0FDFA] text-[#102A43] font-bold text-xs uppercase tracking-wider border-b border-[#CCFBF1]">
                  <tr>
                    <th className="p-3.5">Vehicle #</th>
                    <th className="p-3.5">Model & Fuel</th>
                    <th className="p-3.5">Assigned Route</th>
                    <th className="p-3.5">Driver Contact</th>
                    <th className="p-3.5 text-right">Telemetry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CCFBF1]">
                  {fleet.map((v) => (
                    <tr key={v._id} className="hover:bg-[#CCFBF1]/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#102A43]">
                        {v.vehicleNumber}
                      </td>
                      <td className="p-3.5 text-[#102A43]">
                        <span className="font-bold block">{v.model}</span>
                        <span className="text-xs text-[#102A43]/70 font-mono font-medium">{v.fuelType} • {v.capacity} Seats</span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#0D9488]">
                        {v.assignedRoute?.routeNumber ? (
                          <span>{v.assignedRoute.routeNumber}: {v.assignedRoute.routeName}</span>
                        ) : (
                          <span className="text-[#102A43]/50 italic">Standby / Unassigned</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#102A43]">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#0D9488]" />
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
                to="/staff/complaints"
                className="text-xs font-bold text-[#0D9488] hover:underline"
              >
                View All
              </Link>
            }
          >
            <div className="space-y-3">
              {complaints.length === 0 ? (
                <p className="text-xs text-[#102A43]/60 py-6 text-center font-medium">No open complaints reported.</p>
              ) : (
                complaints.map((c) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-2xl border border-[#CCFBF1] bg-white hover:bg-[#CCFBF1]/20 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#0D9488]">
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

                    <h4 className="text-sm font-bold text-[#102A43] line-clamp-1">{c.title}</h4>
                    <p className="text-xs text-[#102A43]/80 line-clamp-2 leading-relaxed font-medium">
                      {c.description}
                    </p>

                    <div className="pt-2 border-t border-[#CCFBF1] flex items-center justify-between text-xs text-[#102A43]/70 font-mono font-medium">
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
                to="/staff/hostel"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#CCFBF1] bg-white hover:bg-[#CCFBF1] text-xs font-bold text-[#102A43] transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-[#0D9488]" />
                  <span>Allocate Hostel Bed to Student</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#0D9488]" />
              </Link>

              <Link
                to="/staff/transport"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#CCFBF1] bg-white hover:bg-[#CCFBF1] text-xs font-bold text-[#102A43] transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Bus className="w-4 h-4 text-[#0D9488]" />
                  <span>Issue Student Bus Pass</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#0D9488]" />
              </Link>

              <Link
                to="/staff/complaints"
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[#CCFBF1] bg-white hover:bg-[#CCFBF1] text-xs font-bold text-[#102A43] transition-all shadow-sm"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-[#0D9488]" />
                  <span>Log Maintenance / Transit Complaint</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#0D9488]" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffOverview;
