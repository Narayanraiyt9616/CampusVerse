import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Filter,
  RefreshCw,
  Users,
  CalendarCheck,
  Award,
  IndianRupee,
  GraduationCap,
  FileCheck2,
  Building2,
  CheckCircle2,
  Search,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

const REPORT_TYPES = [
  { id: 'students', label: 'Student Enrollment Registry', icon: Users, desc: 'Registered students, departments, semesters, and account status' },
  { id: 'faculty', label: 'Faculty & Academic Staff', icon: GraduationCap, desc: 'Teaching faculty roster, departments, designations, and qualifications' },
  { id: 'attendance', label: 'Attendance Compliance Report', icon: CalendarCheck, desc: 'Tracked sessions, percentage rates, and shortage defaulter lists' },
  { id: 'results', label: 'Academic Performance & Results', icon: Award, desc: 'Coursework grades, assessment percentages, and pass/fail standings' },
  { id: 'fees', label: 'Fee Dues & Collections Ledger', icon: IndianRupee, desc: 'Invoiced tuition/hostel fees, realized payments, and outstanding balances' },
  { id: 'admit-cards', label: 'Admit Card & Hall Ticket Registry', icon: FileCheck2, desc: 'Issued examination hall tickets, sessions, and digital verification statuses' },
  { id: 'courses', label: 'Course Catalog & Curricula', icon: Building2, desc: 'Accredited courses, credits, departments, and curriculum mapping' },
];

export const AdminReports = () => {
  const [selectedType, setSelectedType] = useState('students');
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');

  const fetchReport = async (type = selectedType) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getReportData(type);
      if (res && res.success) {
        setReportData(res.data || []);
        setReportTitle(res.title || 'Institutional Report');
      } else {
        setError(res?.error || 'Failed to retrieve report data.');
      }
    } catch (err) {
      console.error('Fetch report error:', err);
      setError(err.message || 'Failed to generate report from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchQuery('');
    fetchReport(selectedType);
  }, [selectedType]);

  const handleExport = async (format = exportFormat) => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }

    setExporting(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `CampusVerse_${selectedType}_Report_${timestamp}.${format}`;

      if (format === 'json') {
        const jsonStr = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // RFC 4180 CSV with UTF-8 BOM
        const headers = Object.keys(reportData[0]);
        let csv = '\uFEFF';
        csv += headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

        reportData.forEach((row) => {
          const values = headers.map((h) => {
            const val = row[h] === undefined || row[h] === null ? '' : String(row[h]);
            return `"${val.replace(/"/g, '""')}"`;
          });
          csv += values.join(',') + '\r\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  // Client-side quick filter on current report view
  const filteredData = reportData.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(row).some((val) =>
      val !== undefined && val !== null && String(val).toLowerCase().includes(q)
    );
  });

  const columns = reportData.length > 0
    ? Object.keys(reportData[0]).map((key) => ({
        key,
        header: key,
        render: (v) => {
          if (v === 'Compliant' || v === 'Pass' || v === 'Paid' || v === 'Active' || v === 'Published' || v === 'Issued') {
            return <Badge variant="teal" size="sm" hasDot>{String(v)}</Badge>;
          }
          if (v === 'Shortage Defaulter' || v === 'Fail' || v === 'Overdue') {
            return <Badge variant="danger" size="sm" hasDot>{String(v)}</Badge>;
          }
          if (v === 'Pending' || v === 'Reissued' || v === 'Draft') {
            return <Badge variant="warning" size="sm" hasDot>{String(v)}</Badge>;
          }
          return <span className="text-xs text-[#111827] font-medium">{String(v)}</span>;
        },
      }))
    : [];

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Report Generation Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Report Type Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORT_TYPES.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedType === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedType(t.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#D99A00] bg-[#FFF8E6]/60 ring-1 ring-[#D99A00] shadow-xs'
                  : 'border-[#F1E7CF] bg-white hover:border-[#D99A00]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-[#D99A00] text-white' : 'bg-[#FFF8E6] text-[#D99A00]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Badge variant="teal" size="sm">Active</Badge>}
                </div>
                <h4 className="text-xs font-bold text-[#111827]">{t.label}</h4>
                <p className="text-[11px] text-[#4B5563] mt-1 leading-relaxed font-medium">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Report View */}
      <Card
        title={reportTitle}
        subtitle={`Real institutional records aggregated live from MongoDB (${filteredData.length} records${
          filteredData.length !== reportData.length ? ` of ${reportData.length}` : ''
        })`}
        badge={<Badge variant="teal" size="sm">{reportData.length} Data Rows</Badge>}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-[#F1E7CF] bg-white text-[#111827] font-bold focus:outline-none focus:border-[#D99A00]"
            >
              <option value="csv">CSV (Excel Compatible)</option>
              <option value="json">JSON Dataset</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={() => fetchReport(selectedType)}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => handleExport(exportFormat)}
              isLoading={exporting}
              disabled={reportData.length === 0 || loading || exporting}
            >
              Export {exportFormat.toUpperCase()}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Quick Search on Current Report */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Filter current report records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#F1E7CF] bg-[#FFFDF5] text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:border-[#D99A00] transition-colors"
              />
            </div>

            <div className="text-[11px] font-bold text-[#4B5563]">
              Showing <span className="text-[#D99A00] font-mono">{filteredData.length}</span> of {reportData.length} records
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredData}
            keyField={columns[0]?.key || 'id'}
            isLoading={loading}
            emptyMessage={`No data records found for "${selectedType}".`}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminReports;
