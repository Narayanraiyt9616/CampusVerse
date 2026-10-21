import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Send,
  FileSpreadsheet,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

export const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState('shortages'); // 'shortages' | 'sessions'
  const [shortages, setShortages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Correction Modal State
  const [correctionModal, setCorrectionModal] = useState(null); // { session, record }
  const [correctionStatus, setCorrectionStatus] = useState('Present');
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [correctingLoading, setCorrectingLoading] = useState(false);

  // Filters for sessions
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const fetchShortages = async () => {
    try {
      const res = await adminService.getAttendanceShortages();
      if (res && res.success) {
        setShortages(res.shortages || []);
      }
    } catch (err) {
      console.error('Failed to load shortages:', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await adminService.getAttendance({
        className: classFilter || undefined,
        subject: subjectFilter || undefined,
      });
      if (res && res.success) {
        setSessions(res.attendance || []);
      }
    } catch (err) {
      console.error('Failed to load attendance sessions:', err);
    }
  };

  const reloadData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchShortages(), fetchSessions()]);
    } catch (err) {
      setError(err.message || 'Failed to refresh attendance.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleOpenCorrection = (session, record) => {
    setCorrectionModal({ session, record });
    setCorrectionStatus(record.status || 'Present');
    setCorrectionRemarks('');
  };

  const handleSaveCorrection = async (e) => {
    if (e) e.preventDefault();
    if (!correctionModal) return;

    setCorrectingLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminService.correctAttendance(
        correctionModal.session._id,
        correctionModal.record._id,
        {
          status: correctionStatus,
          remarks: correctionRemarks,
        }
      );

      if (res && res.success) {
        setSuccess(`Attendance corrected to "${correctionStatus}" with audit verification!`);
        setCorrectionModal(null);
        reloadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit authorized correction.');
    } finally {
      setCorrectingLoading(false);
    }
  };

  const shortageColumns = [
    {
      key: 'student',
      header: 'Student Details',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{s?.name || 'Student'}</p>
          <p className="font-mono text-[11px] text-slate-500">{s?.studentId} • {s?.email}</p>
        </div>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (_, r) => <Badge variant="navy" size="sm">Sem {r.student?.semester || 'N/A'}</Badge>,
    },
    {
      key: 'totalSessions',
      header: 'Sessions Tracked',
      render: (v) => <span className="font-mono text-xs font-bold text-[#102A43]">{v} Lectures</span>,
    },
    {
      key: 'present',
      header: 'Attended / Absent',
      render: (_, r) => (
        <span className="text-xs font-mono text-[#102A43]/80">
          <strong className="text-[#0D9488]">{r.present} Present</strong> / <strong className="text-[#102A43]">{r.absent} Absent</strong>
        </span>
      ),
    },
    {
      key: 'percentage',
      header: 'Compliance Rate',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-[#CCFBF1]/40 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-[#0D9488]"
              style={{ width: `${Math.min(100, Math.max(5, v))}%` }}
            />
          </div>
          <span className="font-mono font-bold text-xs text-[#102A43]">
            {v}%
          </span>
        </div>
      ),
    },
    {
      key: 'alertLevel',
      header: 'Regulatory Alert',
      render: (v) => (
        <Badge variant={v === 'Critical' ? 'danger' : 'warning'} size="sm" hasDot>
          {v} Shortage
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Administrative Action',
      align: 'right',
      render: (_, r) => (
        <Button
          variant="secondary"
          size="sm"
          className="text-xs"
          leftIcon={<Send className="w-3 h-3" />}
          onClick={() => alert(`Official shortage warning notice generated for ${r.student?.name} (${r.student?.studentId}) - Attendance: ${r.percentage}%.`)}
        >
          Issue Notice
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {success && (
        <AlertBanner
          variant="success"
          title="Attendance Ledger Updated"
          message={success}
          dismissible
          onDismiss={() => setSuccess('')}
        />
      )}

      {error && (
        <AlertBanner
          variant="danger"
          title="Attendance Management Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 bg-[#CCFBF1]/30 border border-[#CCFBF1] rounded-xl">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('shortages')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shortages'
                ? 'bg-[#0D9488] text-[#FFFFFF] shadow-xs'
                : 'text-[#102A43]/70 hover:text-[#102A43] hover:bg-[#CCFBF1]/50'
            }`}
          >
            Shortage Alerts (&lt; 75%) ({shortages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sessions'
                ? 'bg-[#0D9488] text-[#FFFFFF] shadow-xs'
                : 'text-[#102A43]/70 hover:text-[#102A43] hover:bg-[#CCFBF1]/50'
            }`}
          >
            Class Sessions Log ({sessions.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={reloadData}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab 1: Shortage Monitoring */}
      {activeTab === 'shortages' && (
        <Card
          title="Regulatory Attendance Shortage Monitoring (< 75%)"
          subtitle="Real-time institutional deficit tracking calculated across all attendance sessions in MongoDB"
          badge={
            shortages.length > 0 ? (
              <Badge variant="danger" size="sm">{shortages.length} Shortage Defaulters</Badge>
            ) : (
              <Badge variant="success" size="sm">No Shortages Detected</Badge>
            )
          }
        >
          <Table
            columns={shortageColumns}
            data={shortages}
            keyField="student"
            isLoading={loading}
            emptyMessage="All registered students currently meet or exceed the 75% attendance threshold."
          />
        </Card>
      )}

      {/* Tab 2: Sessions Log & Authorized Correction */}
      {activeTab === 'sessions' && (
        <Card
          title="Faculty Attendance Sessions & Authorized Correction"
          subtitle="Audit submitted lecture logs and perform authenticated corrections on student attendance states"
          badge={<Badge variant="teal" size="sm">{sessions.length} Recorded Sessions</Badge>}
        >
          <div className="space-y-4">
            <div className="divide-y divide-[#CCFBF1]">
              {sessions.length === 0 ? (
                <p className="text-xs text-[#102A43]/70 py-8 text-center font-medium">No attendance sessions recorded yet.</p>
              ) : (
                sessions.map((sess) => (
                  <div key={sess._id} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#102A43]">{sess.subject}</span>
                          <Badge variant="teal" size="sm">{sess.className}</Badge>
                          <Badge variant="teal" size="sm">Sem {sess.semester}</Badge>
                        </div>
                        <p className="text-[11px] text-[#102A43]/70 mt-0.5 font-medium">
                          Date: <strong className="font-mono text-[#102A43]">{sess.date}</strong> • Instructor: {sess.faculty?.name || 'Faculty Member'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0D9488] font-bold border border-[#0D9488]/30">
                          {sess.totalPresent || 0} Present
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#F0FDFA] text-[#102A43] font-bold border border-[#CCFBF1]">
                          {sess.totalAbsent || 0} Absent
                        </span>
                      </div>
                    </div>

                    {/* Student Record Row Chips */}
                    <div className="p-3 bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg">
                      <p className="text-[10px] font-bold text-[#102A43]/70 uppercase tracking-wider mb-2">Student Rolls Marked In This Lecture:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {(sess.records || []).map((rec) => (
                          <div
                            key={rec._id}
                            className="p-2 bg-white rounded-md border border-[#CCFBF1] flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-[#102A43] text-[11px]">{rec.student?.name || 'Student'}</p>
                              <p className="font-mono text-[10px] text-[#102A43]/70">{rec.student?.studentId || ''}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant={rec.status === 'Present' ? 'success' : rec.status === 'Late' ? 'warning' : 'danger'}
                                size="sm"
                              >
                                {rec.status}
                              </Badge>
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection(sess, rec)}
                                className="p-1 text-[#0D9488] hover:text-[#102A43] transition-colors"
                                title="Perform authorized admin correction"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Authorized Correction Modal */}
      <Modal
        isOpen={Boolean(correctionModal)}
        onClose={() => setCorrectionModal(null)}
        title="Authorized Attendance Correction"
        description="Override student attendance status with audit logging"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setCorrectionModal(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={correctingLoading}
              disabled={correctingLoading}
              onClick={handleSaveCorrection}
            >
              Commit Authorized Correction
            </Button>
          </div>
        }
      >
        {correctionModal && (
          <form onSubmit={handleSaveCorrection} className="space-y-4">
            <div className="p-3 rounded-lg bg-[#CCFBF1]/30 border border-[#CCFBF1] text-xs text-[#102A43] space-y-1">
              <p><strong>Student:</strong> {correctionModal.record.student?.name} ({correctionModal.record.student?.studentId})</p>
              <p><strong>Lecture Subject:</strong> {correctionModal.session.subject}</p>
              <p><strong>Date:</strong> {correctionModal.session.date}</p>
              <p><strong>Current Marked Status:</strong> <Badge variant="neutral" size="sm">{correctionModal.record.status}</Badge></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                New Corrected Status <span className="text-[#0D9488]">*</span>
              </label>
              <select
                value={correctionStatus}
                onChange={(e) => setCorrectionStatus(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>
            </div>

            <div>
              <Input
                label="Correction Reason / Regulatory Remark"
                type="text"
                placeholder="e.g. Authorized medical leave certificate verified by Dean office"
                value={correctionRemarks}
                onChange={(e) => setCorrectionRemarks(e.target.value)}
                required
              />
              <p className="text-[11px] text-[#102A43]/70 mt-1">
                Your administrative ID and this remark will be permanently logged in the MongoDB audit trail.
              </p>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminAttendance;
