import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Home,
  Bus,
  Wrench,
  Users,
  ArrowLeft
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import DemoNotice from '../../components/common/DemoNotice';
import { DEMO_STAFF } from '../../utils/demoData';
import { useAuth } from '../../context/AuthContext';

export const StaffDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const currentSection = section ? section.toLowerCase() : null;
  const loggedInName = user?.name || user?.username || DEMO_STAFF.staffName;
  const stats = DEMO_STAFF.stats;

  const sectionTitles = {
    hostel: 'Hostel Complex & Residential Bed Allocations',
    transport: 'University Transit Fleet & Bus Routes',
  };

  const hostelColumns = [
    {
      key: 'block',
      header: 'Hostel Complex',
      render: (v) => <span className="font-bold text-navy-900 text-xs">{v}</span>,
    },
    {
      key: 'warden',
      header: 'Resident Warden',
      render: (v) => <span className="text-slate-800 text-xs font-medium">{v}</span>,
    },
    {
      key: 'capacity',
      header: 'Total Bed Capacity',
      render: (v) => <span className="text-xs text-slate-600">{v} Beds</span>,
    },
    {
      key: 'occupancy',
      header: 'Current Occupancy',
      render: (v, r) => (
        <span className="text-xs font-semibold text-slate-800">
          {v} ({Math.round((v / r.capacity) * 100)}%)
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Facility Status',
      render: (v) => <Badge variant={v === 'Normal' ? 'success' : 'warning'} size="sm" hasDot>{v}</Badge>,
    },
  ];

  const transportColumns = [
    {
      key: 'routeNo',
      header: 'Route #',
      render: (v) => <span className="font-bold text-navy-900 text-xs">{v}</span>,
    },
    {
      key: 'destination',
      header: 'Suburban Route Destination',
      render: (v) => <span className="text-slate-800 text-xs font-medium">{v}</span>,
    },
    {
      key: 'busNumber',
      header: 'Fleet Registration',
      render: (v) => <span className="font-mono text-xs text-slate-600">{v}</span>,
    },
    {
      key: 'driver',
      header: 'Assigned Driver',
      render: (v) => <span className="text-xs text-slate-700">{v}</span>,
    },
    {
      key: 'onTimeStatus',
      header: 'Schedule Telemetry',
      render: (v) => <Badge variant={v.includes('Delay') ? 'warning' : 'success'} size="sm" hasDot>{v}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top navigation back button when viewing a specific section */}
      {currentSection && (
        <div className="flex items-center justify-between pb-1">
          <Link
            to="/staff"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Staff Overview
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Dedicated Page: <strong className="text-slate-800">{sectionTitles[currentSection] || currentSection}</strong>
          </span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={currentSection ? `${sectionTitles[currentSection] || currentSection}` : `Welcome, ${loggedInName}`}
        subtitle={currentSection ? `Estate & Operations • ${loggedInName}` : `${DEMO_STAFF.department}`}
        breadcrumbs={
          currentSection
            ? [{ label: 'Staff Portal', to: '/staff' }, { label: sectionTitles[currentSection] || currentSection }]
            : [{ label: 'Staff Portal', to: '/staff' }, { label: 'Estate Operations' }]
        }
        badge={<Badge variant="warning" size="sm">Campus Infrastructure Cell</Badge>}
      />

      <DemoNotice roleName="Hostel & Transport Staff Portal" />

      {/* Metrics - Only on overview */}
      {!currentSection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Hostel Bed Occupancy"
            value={`${stats.occupancyRate}%`}
            subtitle={`${stats.occupiedBeds} of ${stats.totalHostelBeds} Beds Occupied`}
            change="High Utilization"
            changeType="increase"
            colorVariant="teal"
            icon={<Home className="w-5 h-5 text-teal-600" />}
          />
          <StatCard
            title="Active Transit Buses"
            value={stats.campusFleetBuses}
            subtitle={`${stats.activeBusRoutes} Suburban Metro Routes`}
            change="Operational"
            changeType="increase"
            colorVariant="navy"
            icon={<Bus className="w-5 h-5 text-navy-800" />}
          />
          <StatCard
            title="Open Maintenance Tickets"
            value={stats.openMaintenanceTickets}
            subtitle="Electrical, Plumbing & HVAC"
            change="Under Dispatch"
            changeType="decrease"
            colorVariant="amber"
            icon={<Wrench className="w-5 h-5 text-amber-600" />}
          />
          <StatCard
            title="Hostel Blocks"
            value={stats.hostelBlocks}
            subtitle="6 Residential Complexes"
            change="Safe Protocols"
            changeType="neutral"
            colorVariant="emerald"
            icon={<Users className="w-5 h-5 text-emerald-600" />}
          />
        </div>
      )}

      {/* Section 1: Hostel Blocks */}
      {(!currentSection || currentSection === 'hostel') && (
        <Card
          title="Residential Hostel Block Allocations"
          subtitle="Warden management, live occupancy counts, and maintenance alert conditions"
          badge={<Badge variant="teal" size="sm">5 Hostels Active</Badge>}
        >
          <Table
            columns={hostelColumns}
            data={DEMO_STAFF.facilitiesRoster}
            keyField="block"
          />
        </Card>
      )}

      {/* Section 2: Transport Fleet */}
      {(!currentSection || currentSection === 'transport') && (
        <Card
          title="University Fleet Transit & Shuttle Routes"
          subtitle="Daily commuter bus routes for day students and university staff"
          badge={<Badge variant="info" size="sm">GPS Sync Staged</Badge>}
        >
          <Table
            columns={transportColumns}
            data={DEMO_STAFF.transportRoster}
            keyField="routeNo"
          />
        </Card>
      )}
    </div>
  );
};

export default StaffDashboard;
