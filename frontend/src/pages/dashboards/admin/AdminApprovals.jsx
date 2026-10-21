import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

export const AdminApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Review Modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [decision, setDecision] = useState('Approved'); // 'Approved' | 'Rejected'
  const [adminRemarks, setAdminRemarks] = useState('');
  const [decisionLoading, setDecisionLoading] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getLeaves({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res && res.success) {
        setLeaves(res.leaves || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch leave applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleOpenReview = (leave, initialDecision = 'Approved') => {
    setSelectedLeave(leave);
    setDecision(initialDecision);
    setAdminRemarks(initialDecision === 'Approved' ? 'Authorized by Dean of Academics.' : 'Leave denied due to examination invigilation schedule.');
  };

  const handleCommitDecision = async (e) => {
    if (e) e.preventDefault();
    if (!selectedLeave) return;

    setDecisionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminService.updateLeaveStatus(selectedLeave._id, {
        status: decision,
        adminRemarks,
      });

      if (res && res.success) {
        setSuccess(`Leave application ${decision.toLowerCase()} successfully!`);
        setSelectedLeave(null);
        fetchLeaves();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit decision.');
    } finally {
      setDecisionLoading(false);
    }
  };

  const columns = [
    {
      key: 'faculty',
      header: 'Faculty Applicant',
      render: (f) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{f?.name || 'Faculty Member'}</p>
          <p className="font-mono text-[11px] text-slate-500">{f?.email}</p>
        </div>
      ),
    },
    {
      key: 'leaveType',
      header: 'Category of Leave',
      render: (v) => <Badge variant="navy" size="sm">{v}</Badge>,
    },
    {
      key: 'dates',
      header: 'Duration',
      render: (_, r) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-800">{r.fromDate} → {r.toDate}</span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason for Leave',
      render: (v) => <p className="text-xs text-slate-600 line-clamp-1 max-w-xs">{v}</p>,
    },
    {
      key: 'status',
      header: 'Current Status',
      render: (v) => (
        <Badge
          variant={v === 'Approved' ? 'success' : v === 'Rejected' ? 'danger' : 'warning'}
          size="sm"
          hasDot
        >
          {v}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Executive Action',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1.5">
          {r.status === 'Pending' ? (
            <>
              <Button
                variant="teal"
                size="sm"
                className="text-xs"
                onClick={() => handleOpenReview(r, 'Approved')}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="text-xs"
                onClick={() => handleOpenReview(r, 'Rejected')}
              >
                Reject
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={() => handleOpenReview(r, r.status)}
            >
              View Decision
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pendingCount = leaves.filter((l) => l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {success && (
        <AlertBanner
          variant="success"
          title="Executive Decision Recorded"
          message={success}
          dismissible
          onDismiss={() => setSuccess('')}
        />
      )}

      {error && (
        <AlertBanner
          variant="danger"
          title="Approval Processing Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      <Card
        title="Faculty Leave Approvals & Institutional Decisions Pipeline"
        subtitle="Review, approve, or reject instructional leave applications submitted by university faculty in MongoDB"
        badge={
          pendingCount > 0 ? (
            <Badge variant="warning" size="sm">{pendingCount} Action Required</Badge>
          ) : (
            <Badge variant="success" size="sm">All Reviewed</Badge>
          )
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="all">All Statuses ({leaves.length})</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchLeaves}
            >
              Refresh Pipeline
            </Button>
          </div>

          <Table
            columns={columns}
            data={leaves}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No leave applications match the selected status filter."
          />
        </div>
      </Card>

      {/* Review & Decision Modal */}
      <Modal
        isOpen={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        title="Executive Approval Review"
        description="Formal Dean authorization for instructional absence"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectedLeave(null)}>
              Cancel
            </Button>
            {selectedLeave?.status === 'Pending' ? (
              <Button
                variant={decision === 'Approved' ? 'teal' : 'danger'}
                size="sm"
                loading={decisionLoading}
                disabled={decisionLoading}
                onClick={handleCommitDecision}
              >
                Confirm {decision}
              </Button>
            ) : (
              <Button variant="teal" size="sm" onClick={() => setSelectedLeave(null)}>
                Close
              </Button>
            )}
          </div>
        }
      >
        {selectedLeave && (
          <form onSubmit={handleCommitDecision} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900">{selectedLeave.faculty?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Category:</span>
                <span className="font-medium text-slate-800">{selectedLeave.leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-mono text-slate-800">{selectedLeave.fromDate} → {selectedLeave.toDate}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Stated Reason:</span>
                <p className="text-slate-700 font-medium italic bg-white p-2 rounded border border-slate-200">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            {selectedLeave.status === 'Pending' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Executive Decision</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecision('Approved')}
                      className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        decision === 'Approved'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Authorize Leave</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecision('Rejected')}
                      className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        decision === 'Rejected'
                          ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Deny Request</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Input
                    label="Executive Remarks / Digital Notation"
                    type="text"
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    This decision will be communicated back to the faculty portal immediately.
                  </p>
                </div>
              </>
            ) : (
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                <p><strong>Decision Recorded:</strong> <Badge variant={selectedLeave.status === 'Approved' ? 'success' : 'danger'} size="sm">{selectedLeave.status}</Badge></p>
                <p><strong>Admin Remarks:</strong> {selectedLeave.adminRemarks || 'No remarks provided.'}</p>
                <p><strong>Reviewed At:</strong> {selectedLeave.approvedAt ? new Date(selectedLeave.approvedAt).toLocaleString() : 'N/A'}</p>
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminApprovals;
