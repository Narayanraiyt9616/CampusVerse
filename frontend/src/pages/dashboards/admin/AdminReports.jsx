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
  CheckCircle2,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Table from '../../../components/common/Table';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

const REPORT_TYPES = [
  { id: 'students', label: 'Student Enrollment Registry', icon: Users, desc: 'Registered students, departments, semesters, and account status' },
  { id: 'attendance', label: 'Attendance Compliance & Shortage Report', icon: CalendarCheck, desc: 'Lectures tracked, percentage rates, and shortage defaulter flags' },
  { id: 'results', label: 'Academic Performance & Results', icon: Award, desc: 'Coursework grades, assessment percentages, and pass/fail standings' },
  { id: 'fees', label: 'Fee Dues & Realized Collections', icon: IndianRupee, desc: 'Tuition and hostel invoices, realized payments, and outstanding dues' },
];

export const AdminReports = () => {
  const [selectedType, setSelectedType] = useState('students');
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReport = async (type = selectedType) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getReportData(type);
      if (res && res.success) {
        setReportData(res.data || []);
        setReportTitle(res.title || 'Institutional Report');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedType);
  }, [selectedType]);

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(reportData[0]);
    const csvRows = [];
    csvRows.push(headers.map((h) => `"${h}"`).join(','));

    reportData.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header] === undefined || row[header] === null ? '' : String(row[header]);
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CampusVerse_${selectedType}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = reportData.length > 0
    ? Object.keys(reportData[0]).map((key) => ({
        key,
        header: key,
        render: (v) => {
          if (v === 'Compliant' || v === 'Pass' || v === 'Paid' || v === 'Active') {
            return <Badge variant="success" size="sm">{v}</Badge>;
          }
          if (v === 'Shortage Defaulter' || v === 'Fail' || v === 'Overdue') {
            return <Badge variant="danger" size="sm">{v}</Badge>;
          }
          if (v === 'Pending') {
            return <Badge variant="warning" size="sm">{v}</Badge>;
          }
          return <span className="text-xs text-[#102A43] font-medium">{String(v)}</span>;
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
                  ? 'border-[#0D9488] bg-[#CCFBF1]/40 ring-1 ring-[#0D9488] shadow-xs'
                  : 'border-[#CCFBF1] bg-white hover:border-[#0D9488]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#0D9488] text-white' : 'bg-[#CCFBF1]/30 text-[#102A43]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && <Badge variant="teal" size="sm">Active</Badge>}
                </div>
                <h4 className="text-xs font-bold text-[#102A43]">{t.label}</h4>
                <p className="text-[11px] text-[#102A43]/70 mt-1 leading-relaxed font-medium">{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Report View */}
      <Card
        title={reportTitle}
        subtitle={`Real database records aggregated live from MongoDB (${reportData.length} records)`}
        badge={<Badge variant="teal" size="sm">{reportData.length} Data Rows</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={() => fetchReport(selectedType)}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCSV}
              disabled={reportData.length === 0}
            >
              Export to CSV
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Table
            columns={columns}
            data={reportData}
            keyField={columns[0]?.key || 'id'}
            isLoading={loading}
            emptyMessage="No data records available for this report type."
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminReports;
