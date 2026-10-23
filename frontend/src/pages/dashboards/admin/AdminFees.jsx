import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  FileText,
  DollarSign,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

const FEE_CATEGORIES = [
  'Tuition Fee',
  'Hostel & Mess',
  'Examination Fee',
  'Library & IEEE',
  'Transport',
  'Miscellaneous',
];

export const AdminFees = () => {
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Invoice Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    student: '',
    category: 'Tuition Fee',
    amount: 65000,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    description: '',
    semester: 7,
    academicYear: '2025-2026',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Record Payment Modal
  const [paymentModalFee, setPaymentModalFee] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paidAmount: 0,
    paymentMode: 'Online',
    receiptNumber: '',
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Edit Fee Modal
  const [editModalFee, setEditModalFee] = useState(null);
  const [editForm, setEditForm] = useState({
    category: 'Tuition Fee',
    amount: 0,
    paidAmount: 0,
    status: 'Pending',
    dueDate: '',
    semester: 7,
    academicYear: '2025-2026',
    paymentMode: 'Online',
    receiptNumber: '',
    description: '',
    remarks: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadFeeData = async () => {
    setLoading(true);
    setError('');
    try {
      const [feeRes, sumRes, studRes] = await Promise.all([
        adminService.getFees({
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        adminService.getFeeSummary(),
        adminService.getStudents({ limit: 50 }),
      ]);

      if (feeRes && feeRes.success) setFees(feeRes.fees || []);
      if (sumRes && sumRes.success) setSummary(sumRes);
      if (studRes && studRes.success) setStudents(studRes.students || []);
    } catch (err) {
      setError(err.message || 'Failed to load fee ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeData();
  }, [categoryFilter, statusFilter]);

  const handleCreateInvoice = async (e) => {
    if (e) e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminService.createFee(createForm);
      if (res && res.success) {
        setSuccess(`Fee Invoice ${res.fee?.invoiceNumber || ''} issued successfully.`);
        setIsCreateModalOpen(false);
        loadFeeData();
      }
    } catch (err) {
      setError(err.message || 'Failed to issue invoice.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenPayment = (fee) => {
    setPaymentModalFee(fee);
    setPaymentForm({
      paidAmount: Math.max(0, fee.amount - (fee.paidAmount || 0)),
      paymentMode: 'Online',
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    });
  };

  const handleRecordPayment = async (e) => {
    if (e) e.preventDefault();
    if (!paymentModalFee) return;

    setPaymentLoading(true);
    setError('');
    setSuccess('');
    try {
      const totalPaid = (paymentModalFee.paidAmount || 0) + Number(paymentForm.paidAmount);
      const isFull = totalPaid >= paymentModalFee.amount;

      const res = await adminService.updateFee(paymentModalFee._id, {
        paidAmount: totalPaid,
        status: isFull ? 'Paid' : 'Pending',
        paymentMode: paymentForm.paymentMode,
        receiptNumber: paymentForm.receiptNumber,
        paymentDate: new Date(),
      });

      if (res && res.success) {
        setSuccess(`Verified payment recorded! Receipt: ${paymentForm.receiptNumber}`);
        setPaymentModalFee(null);
        loadFeeData();
      }
    } catch (err) {
      setError(err.message || 'Payment recording failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleOpenEdit = (fee) => {
    setEditModalFee(fee);
    setEditError('');
    setEditForm({
      category: fee.category || 'Tuition Fee',
      amount: fee.amount || 0,
      paidAmount: fee.paidAmount || 0,
      status: fee.status || 'Pending',
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 10) : '',
      semester: fee.semester || 7,
      academicYear: fee.academicYear || '2025-2026',
      paymentMode: fee.paymentMode || 'Online',
      receiptNumber: fee.receiptNumber || '',
      description: fee.description || '',
      remarks: fee.remarks || '',
    });
  };

  const handleEditSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!editModalFee) return;

    setEditError('');
    const amt = Number(editForm.amount);
    const paid = Number(editForm.paidAmount);

    if (isNaN(amt) || amt < 0) {
      setEditError('Total invoiced amount must be a positive number or zero.');
      return;
    }
    if (isNaN(paid) || paid < 0) {
      setEditError('Paid amount cannot be negative.');
      return;
    }
    if (!editForm.dueDate) {
      setEditError('Due date is required.');
      return;
    }

    setEditLoading(true);
    try {
      const res = await adminService.updateFee(editModalFee._id, {
        category: editForm.category,
        amount: amt,
        paidAmount: paid,
        status: editForm.status,
        dueDate: editForm.dueDate,
        semester: Number(editForm.semester),
        academicYear: editForm.academicYear,
        paymentMode: editForm.paymentMode,
        receiptNumber: editForm.receiptNumber,
        description: editForm.description,
        remarks: editForm.remarks,
        paymentDate: paid > 0 ? (editModalFee.paymentDate || new Date()) : null,
      });

      if (res && res.success) {
        setSuccess(`Fee Invoice ${editModalFee.invoiceNumber} updated successfully in database!`);
        setEditModalFee(null);
        loadFeeData();
      } else {
        setEditError(res?.error?.message || 'Failed to update fee record.');
      }
    } catch (err) {
      setEditError(err.message || 'Error occurred while saving fee changes to database.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteFee(deleteTarget._id);
      setSuccess('Invoice removed from database.');
      setDeleteTarget(null);
      loadFeeData();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredFees = fees.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const inv = (f.invoiceNumber || '').toLowerCase();
    const sName = (f.student?.name || '').toLowerCase();
    const sid = (f.student?.studentId || '').toLowerCase();
    return inv.includes(q) || sName.includes(q) || sid.includes(q);
  });

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice ID',
      render: (v) => <span className="font-mono font-bold text-xs text-navy-900">{v}</span>,
    },
    {
      key: 'student',
      header: 'Student Payer',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{s?.name || 'Student'}</p>
          <p className="font-mono text-[11px] text-slate-500">{s?.studentId}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Fee Category',
      render: (v) => <Badge variant="navy" size="sm">{v}</Badge>,
    },
    {
      key: 'amount',
      header: 'Invoiced / Paid',
      render: (v, r) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#111827]">₹{v.toLocaleString()}</span>
          <p className="text-[11px] text-[#D99A00] font-mono font-bold">Paid: ₹{(r.paidAmount || 0).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (v) => <span className="font-mono text-xs text-[#4B5563] font-medium">{v ? new Date(v).toLocaleDateString() : 'N/A'}</span>,
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (v) => (
        <Badge variant={v === 'Paid' ? 'success' : v === 'Overdue' ? 'danger' : 'warning'} size="sm" hasDot>
          {v}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            className="text-xs h-8 px-2.5"
            leftIcon={<Edit2 className="w-3 h-3 text-[#D99A00]" />}
            onClick={() => handleOpenEdit(r)}
            title="Edit Fee Details"
          >
            Edit
          </Button>

          {r.status !== 'Paid' && (
            <Button
              variant="primary"
              size="sm"
              className="text-xs h-8 px-2.5"
              onClick={() => handleOpenPayment(r)}
            >
              Verify Payment
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            className="text-xs h-8 px-2"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => setDeleteTarget(r)}
            title="Delete Invoice"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const totalInvoiced = summary?.totals?.totalInvoiced || 0;
  const totalCollected = summary?.totals?.totalCollected || 0;
  const totalPending = summary?.totals?.totalPending || 0;
  const rate = summary?.totals?.collectionRate || 0;

  return (
    <div className="space-y-6">
      {success && (
        <AlertBanner
          variant="success"
          title="Fee Transaction Committed"
          message={success}
          dismissible
          onDismiss={() => setSuccess('')}
        />
      )}

      {error && (
        <AlertBanner
          variant="danger"
          title="Fee Transaction Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#F1E7CF] rounded-xl shadow-xs">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-black text-[#111827] mt-1 font-mono">₹{totalInvoiced.toLocaleString()}</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5">Annual billed tuition & fees</p>
        </div>

        <div className="p-4 bg-white border border-[#F1E7CF] rounded-xl shadow-xs">
          <p className="text-xs font-bold text-[#D99A00] uppercase tracking-wider">Realized Collections</p>
          <p className="text-2xl font-black text-[#D99A00] mt-1 font-mono">₹{totalCollected.toLocaleString()}</p>
          <p className="text-[11px] text-[#D99A00] font-bold mt-0.5">{rate}% Recovery Rate</p>
        </div>

        <div className="p-4 bg-white border border-[#F1E7CF] rounded-xl shadow-xs">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Pending Institutional Dues</p>
          <p className="text-2xl font-black text-[#111827] mt-1 font-mono">₹{totalPending.toLocaleString()}</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5">Outstanding student balances</p>
        </div>

        <div className="p-4 bg-white border border-[#F1E7CF] rounded-xl shadow-xs">
          <p className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">Total Invoices Tracked</p>
          <p className="text-2xl font-black text-[#111827] mt-1 font-mono">{fees.length}</p>
          <p className="text-[11px] text-[#4B5563] mt-0.5">Real MongoDB fee documents</p>
        </div>
      </div>

      <Card
        title="Institutional Fee Invoicing & Ledger Management"
        subtitle="Issue student fee invoices, register verified bank transactions, and maintain audit receipts"
        badge={<Badge variant="teal" size="sm">{fees.length} Invoices</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              setCreateForm({
                student: students[0]?._id || '',
                category: 'Tuition Fee',
                amount: 65000,
                dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                description: 'Semester 7 Academic Tuition Fee',
                semester: 7,
                academicYear: '2025-2026',
              });
              setIsCreateModalOpen(true);
            }}
          >
            Issue Fee Invoice
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#D99A00] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by invoice ID, student name, or roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFDF5] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-2.5 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              >
                <option value="all">All Categories</option>
                {FEE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-2.5 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
                onClick={loadFeeData}
              >
                Refresh
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            data={filteredFees}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No fee invoices match your search."
          />
        </div>
      </Card>

      {/* Issue Fee Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Issue Student Fee Invoice"
        description="Creates official financial charge in MongoDB linked to student billing ledger"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={createLoading}
              disabled={createLoading}
              onClick={handleCreateInvoice}
            >
              Issue Invoice
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Target Student <span className="text-[#D99A00]">*</span>
              </label>
              <select
                value={createForm.student}
                onChange={(e) => setCreateForm((p) => ({ ...p, student: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
                required
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Fee Category <span className="text-[#D99A00]">*</span>
              </label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              >
                {FEE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Amount (INR ₹)"
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Input
                label="Payment Due Date"
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm((p) => ({ ...p, dueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">Semester</label>
              <select
                value={createForm.semester}
                onChange={(e) => setCreateForm((p) => ({ ...p, semester: Number(e.target.value) }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Input
              label="Invoice Description"
              type="text"
              placeholder="e.g. B.Tech Semester 7 Academic Tuition Fee"
              value={createForm.description}
              onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
        </form>
      </Modal>

      {/* Record Verified Payment Modal */}
      <Modal
        isOpen={Boolean(paymentModalFee)}
        onClose={() => setPaymentModalFee(null)}
        title="Verify & Record Student Payment"
        description={`Record real receipt for invoice ${paymentModalFee?.invoiceNumber} (${paymentModalFee?.student?.name})`}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPaymentModalFee(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={paymentLoading}
              disabled={paymentLoading}
              onClick={handleRecordPayment}
            >
              Verify Payment
            </Button>
          </div>
        }
      >
        {paymentModalFee && (
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3 bg-[#FFF8E6]/30 border border-[#F1E7CF] rounded-lg text-xs text-[#111827] space-y-1">
              <p><strong>Student:</strong> {paymentModalFee.student?.name} ({paymentModalFee.student?.studentId})</p>
              <p><strong>Total Invoiced:</strong> ₹{paymentModalFee.amount.toLocaleString()}</p>
              <p><strong>Previously Paid:</strong> ₹{(paymentModalFee.paidAmount || 0).toLocaleString()}</p>
              <p><strong>Remaining Dues:</strong> ₹{Math.max(0, paymentModalFee.amount - (paymentModalFee.paidAmount || 0)).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Amount Received (₹)"
                  type="number"
                  value={paymentForm.paidAmount}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, paidAmount: Number(e.target.value) }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1.5">Payment Mode</label>
                <select
                  value={paymentForm.paymentMode}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, paymentMode: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
                >
                  <option value="Online">Online Gateway / NetBanking</option>
                  <option value="Cash">Cash at University Cashier</option>
                  <option value="DD">Demand Draft (DD)</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>
            </div>

            <div>
              <Input
                label="Bank Transaction / Receipt Reference Number"
                type="text"
                value={paymentForm.receiptNumber}
                onChange={(e) => setPaymentForm((p) => ({ ...p, receiptNumber: e.target.value }))}
                required
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Fee Invoice Modal */}
      <Modal
        isOpen={Boolean(editModalFee)}
        onClose={() => setEditModalFee(null)}
        title={`Edit Fee Invoice — ${editModalFee?.invoiceNumber || ''}`}
        description={`Modify fee amount, category, payment status, and due dates for ${editModalFee?.student?.name || 'student'} (${editModalFee?.student?.studentId || '—'}). All updates persist directly to MongoDB.`}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditModalFee(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={editLoading}
              disabled={editLoading}
              onClick={handleEditSubmit}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              {editLoading ? 'Saving Changes...' : 'Save & Update Database'}
            </Button>
          </div>
        }
      >
        {editModalFee && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {editError && (
              <AlertBanner
                variant="danger"
                title="Validation Error"
                message={editError}
                dismissible
                onDismiss={() => setEditError('')}
              />
            )}

            <div className="p-3 rounded-xl bg-[#FFF8E6]/40 border border-[#F1E7CF] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#4B5563] font-semibold">Student Candidate:</span>
                <p className="font-extrabold text-[#111827] mt-0.5">
                  {editModalFee.student?.name} ({editModalFee.student?.studentId})
                </p>
              </div>
              <div className="text-right">
                <span className="text-[#4B5563] font-semibold">Invoice ID:</span>
                <p className="font-mono font-bold text-[#D99A00] mt-0.5">
                  {editModalFee.invoiceNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1">Fee Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
                >
                  {FEE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1">Payment Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
                >
                  <option value="Pending">Pending (Unpaid / Partial)</option>
                  <option value="Paid">Paid (Full Settlement)</option>
                  <option value="Overdue">Overdue (Past Deadline)</option>
                  <option value="Waived">Waived (Scholarship / Exemption)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Input
                  label="Total Invoiced Amount (₹)"
                  type="number"
                  min="0"
                  step="1"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Input
                  label="Paid Amount (₹)"
                  type="number"
                  min="0"
                  step="1"
                  value={editForm.paidAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditForm((f) => ({
                      ...f,
                      paidAmount: e.target.value,
                      status: val >= Number(f.amount) && Number(f.amount) > 0 ? 'Paid' : f.status,
                    }));
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <Input
                  label="Due Date"
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Input
                  label="Semester"
                  type="number"
                  min="1"
                  max="12"
                  value={editForm.semester}
                  onChange={(e) => setEditForm((f) => ({ ...f, semester: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Input
                  label="Academic Year"
                  type="text"
                  value={editForm.academicYear}
                  onChange={(e) => setEditForm((f) => ({ ...f, academicYear: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1">Payment Mode</label>
                <select
                  value={editForm.paymentMode}
                  onChange={(e) => setEditForm((f) => ({ ...f, paymentMode: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
                >
                  <option value="Online">Online Gateway / NetBanking</option>
                  <option value="Cash">Cash at University Cashier</option>
                  <option value="DD">Demand Draft (DD)</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Waived">Waived / Direct Credit</option>
                </select>
              </div>

              <div>
                <Input
                  label="Receipt / Transaction Reference"
                  type="text"
                  placeholder="e.g. REC-984321"
                  value={editForm.receiptNumber}
                  onChange={(e) => setEditForm((f) => ({ ...f, receiptNumber: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Input
                label="Invoice Description"
                type="text"
                placeholder="e.g. 7th Semester Tuition Fee & Laboratory Access Charges"
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">Administrative Remarks</label>
              <textarea
                rows={2}
                value={editForm.remarks}
                onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))}
                placeholder="Optional internal remarks or verification notes..."
                className="w-full p-2.5 text-xs rounded-lg border border-[#F1E7CF] bg-white text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Delete Invoice"
        description="Are you sure you want to permanently cancel this fee invoice?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-xs text-[#4B5563]">This action will update the financial telemetry in MongoDB.</p>
      </Modal>
    </div>
  );
};

export default AdminFees;
