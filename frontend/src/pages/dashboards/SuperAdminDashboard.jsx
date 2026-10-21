import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Server,
  Layers,
  Cpu,
  Terminal,
  Activity,
  ArrowLeft
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import DemoNotice from '../../components/common/DemoNotice';
import { DEMO_SUPER_ADMIN } from '../../utils/demoData';
import { useAuth } from '../../context/AuthContext';

export const SuperAdminDashboard = () => {
  const { section } = useParams();
  const { user } = useAuth();
  const currentSection = section ? section.toLowerCase() : null;
  const loggedInName = user?.name || user?.username || DEMO_SUPER_ADMIN.name;

  const sectionTitles = {
    modules: '15 Planned University Management Modules Matrix',
    audit: 'System Topology, Audit Log & Health Diagnostics',
  };

  const serviceColumns = [
    {
      key: 'name',
      header: 'Service / Subsystem',
      render: (v) => <span className="font-bold text-navy-900 text-xs">{v}</span>,
    },
    {
      key: 'version',
      header: 'Version Tag',
      render: (v) => <span className="font-mono text-xs text-slate-600">{v}</span>,
    },
    {
      key: 'status',
      header: 'Operational State',
      render: (v) => (
        <Badge variant={v.includes('Active') ? 'success' : v.includes('Planned') ? 'neutral' : 'info'} size="sm" hasDot>
          {v}
        </Badge>
      ),
    },
    {
      key: 'latency',
      header: 'Response Time',
      render: (v) => <span className="font-mono text-xs text-slate-700">{v}</span>,
    },
  ];

  const moduleColumns = [
    {
      key: 'id',
      header: 'Mod #',
      render: (v) => <span className="font-mono font-bold text-navy-900 text-xs">M{v}</span>,
    },
    {
      key: 'name',
      header: 'Planned Campus Module',
      render: (v) => <span className="font-semibold text-slate-900 text-xs">{v}</span>,
    },
    {
      key: 'phase',
      header: 'Implementation Roadmap',
      render: (v) => <span className="text-xs text-slate-600">{v}</span>,
    },
    {
      key: 'status',
      header: 'Part 1 Status',
      render: (v) => <Badge variant="teal" size="sm" hasDot>{v}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top navigation back button when viewing a specific section */}
      {currentSection && (
        <div className="flex items-center justify-between pb-1">
          <Link
            to="/super-admin"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Super Admin Console
          </Link>
          <span className="text-xs font-medium text-slate-500">
            Dedicated Page: <strong className="text-slate-800">{sectionTitles[currentSection] || currentSection}</strong>
          </span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={currentSection ? `${sectionTitles[currentSection] || currentSection}` : `Welcome, ${loggedInName}`}
        subtitle={currentSection ? `Super Admin Console • ${loggedInName}` : `${DEMO_SUPER_ADMIN.systemVersion}`}
        breadcrumbs={
          currentSection
            ? [{ label: 'Super Admin', to: '/super-admin' }, { label: sectionTitles[currentSection] || currentSection }]
            : [{ label: 'Super Admin', to: '/super-admin' }, { label: 'System Health & Architecture' }]
        }
        badge={<Badge variant="danger" size="sm">Root Privilege Console</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Terminal className="w-3.5 h-3.5" />}
              onClick={() => alert('Terminal diagnostics will connect in Part 2 via the secure admin socket.')}
            >
              Diagnostic Probe
            </Button>
          </div>
        }
      />

      <DemoNotice roleName="Super Admin Console" />

      {/* Metrics - Only on Overview */}
      {!currentSection && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="System Architecture Health"
            value="Operational"
            subtitle="All Frontend Tokens Passing"
            change="99.98% SLA"
            changeType="increase"
            colorVariant="emerald"
            icon={<Activity className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            title="Planned Modules Matrix"
            value="15 Modules"
            subtitle="All 15 Mapped in Schema"
            change="Architecture Ready"
            changeType="increase"
            colorVariant="teal"
            icon={<Layers className="w-5 h-5 text-teal-600" />}
          />
          <StatCard
            title="Database Engine Target"
            value="MongoDB"
            subtitle="Schema Specified for Part 2"
            change="Replica Set"
            changeType="neutral"
            colorVariant="navy"
            icon={<Server className="w-5 h-5 text-navy-800" />}
          />
          <StatCard
            title="AI Microservice Target"
            value="FastAPI"
            subtitle="Python 3.11 Runtime (Part 3)"
            change="Spec Prepared"
            changeType="neutral"
            colorVariant="amber"
            icon={<Cpu className="w-5 h-5 text-amber-600" />}
          />
        </div>
      )}

      {/* 15 Modules Matrix Section */}
      {(!currentSection || currentSection === 'modules') && (
        <Card
          title="15 Planned University Management Modules Matrix"
          subtitle="End-to-end breakdown of the planned CampusVerse AI system across development parts"
          badge={<Badge variant="teal" size="sm">Full Scope: 15 Modules</Badge>}
        >
          <Table
            columns={moduleColumns}
            data={DEMO_SUPER_ADMIN.plannedModulesMatrix}
            keyField="id"
          />
        </Card>
      )}

      {/* Multi-Tier Services Health / Audit Section */}
      {(!currentSection || currentSection === 'audit') && (
        <Card
          title="Multi-Tier Service Staging & Readiness"
          subtitle="Tracking the lifecycle of frontend, backend, database, and AI reasoning microservices"
        >
          <Table
            columns={serviceColumns}
            data={DEMO_SUPER_ADMIN.activeServices}
            keyField="name"
          />
        </Card>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
