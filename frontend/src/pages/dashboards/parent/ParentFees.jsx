import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  FileText,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { parentService } from '../../../services/api';

export const ParentFees = ({ selectedStudentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'receipts'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceipt, setActiveReceipt] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await parentService.getFees({ studentId: selectedStudentId || undefined });
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch fee invoices and payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStudentId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading institutional fee ledgers...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalBilled: 0,
    totalPaid: 0,
    pendingAmount: 0,
    overdueCount: 0,
    allDuesCleared: true,
  };
  const invoices = data?.invoices || [];
  const receipts = data?.receipts || [];
  const student = data?.student;

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.category || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PAID'
        ? inv.status === 'Paid'
        : statusFilter === 'PENDING'
        ? inv.status === 'Pending'
        : inv.status === 'Overdue';

    return matchesSearch && matchesStatus;
  });

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Finance Telemetry Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Critical Overdue Warning Banner if any */}
      {summary.overdueCount > 0 && (
        <div className="bg-[#CCFBF1] border border-[#0D9488]/40 p-4 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#0D9488] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#102A43]">
                Institutional Fee Overdue: {summary.overdueCount} Invoice(s) Past Due Date
              </h4>
              <p className="text-xs text-[#102A43]/80 leading-relaxed font-medium">
                Outstanding dues of ₹{summary.pendingAmount.toLocaleString('en-IN')} are currently past due. Please clear pending balances via the university payment gateway or cashier desk to prevent examination hall-ticket blocks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Total Billed
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-[#102A43] font-mono">
                ₹{summary.totalBilled.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-xs text-[#102A43]/60 mt-1 block font-medium">
              {invoices.length} Invoices Issued
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Total Paid
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-[#0D9488] font-mono">
                ₹{summary.totalPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-xs text-[#0D9488] mt-1 block font-bold">
              Verified by Bursar Office
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Outstanding Dues
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-[#102A43]">
                ₹{summary.pendingAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-xs text-[#102A43]/60 mt-1 block font-medium">
              {summary.overdueCount > 0 ? `${summary.overdueCount} Overdue` : 'No Overdue Bills'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Account Clearance
            </span>
            <div className="mt-2">
              <Badge
                variant={summary.allDuesCleared ? 'success' : summary.overdueCount > 0 ? 'danger' : 'warning'}
                size="md"
                hasDot
              >
                {summary.allDuesCleared
                  ? 'Cleared'
                  : summary.overdueCount > 0
                  ? 'Overdue'
                  : 'Pending'}
              </Badge>
            </div>
            <span className="text-xs text-[#102A43]/60 mt-1 block font-medium">
              {summary.allDuesCleared ? 'Eligible for Convocation' : 'Action Required'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex items-center gap-2 border-b border-[#CCFBF1] pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'invoices'
              ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
              : 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1]'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          Fee Invoices & Dues
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'invoices' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
          }`}>
            {invoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'receipts'
              ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
              : 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Verified Receipts Ledger
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'receipts' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
          }`}>
            {receipts.length}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Sync
          </Button>
        </div>
      </div>

      {/* TAB 1: INVOICES & DUES */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <Card
            title="Institutional Fee Invoices"
            subtitle="Tuition, laboratory, hostel, mess, and examination billings"
            headerAction={
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 w-44"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500"
                >
                  <option value="ALL">All Invoices</option>
                  <option value="PENDING">Pending Dues</option>
                  <option value="OVERDUE">Overdue Only</option>
                  <option value="PAID">Paid & Settled</option>
                </select>
              </div>
            }
          >
            {filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No fee invoices found matching the current criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F0FDFA] text-[#102A43] font-bold border-b border-[#CCFBF1]">
                    <tr>
                      <th className="p-3.5">Invoice #</th>
                      <th className="p-3.5">Category & Description</th>
                      <th className="p-3.5 text-right">Amount</th>
                      <th className="p-3.5 text-right">Paid</th>
                      <th className="p-3.5 text-right">Balance</th>
                      <th className="p-3.5">Due Date</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => {
                      const balance = Math.max(0, (inv.amount || 0) - (inv.paidAmount || 0));
                      const isPaid = inv.status === 'Paid';

                      return (
                        <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-900 block">{inv.category}</span>
                            <span className="text-[11px] text-slate-500 block">
                              {inv.description || 'Semester fee billing'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                            ₹{(inv.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right font-mono text-emerald-700 font-medium">
                            ₹{(inv.paidAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                            {balance > 0 ? (
                              <span className="text-rose-600">₹{balance.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-emerald-700">₹0</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600">
                            {inv.dueDate
                              ? new Date(inv.dueDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="p-3.5 text-center">
                            <Badge
                              variant={
                                inv.status === 'Paid'
                                  ? 'success'
                                  : inv.status === 'Overdue'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                              hasDot
                            >
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="p-3.5 text-right">
                            {isPaid || (inv.paidAmount && inv.paidAmount > 0) ? (
                              <button
                                onClick={() => setActiveReceipt(inv)}
                                className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold underline text-xs"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                Receipt
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Pending Cashier</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: RECEIPTS LEDGER */}
      {activeTab === 'receipts' && (
        <div className="space-y-6">
          <Card
            title="Verified Official Payment Receipts"
            subtitle="Tamper-proof bursar payment receipts for income tax and institutional verification"
          >
            {receipts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <Receipt className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700">No verified payment receipts found.</p>
                <p>Receipts are generated immediately once online or cashier payments are confirmed.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F0FDFA] text-[#102A43] font-bold border-b border-[#CCFBF1]">
                    <tr>
                      <th className="p-3.5">Receipt #</th>
                      <th className="p-3.5">Invoice Ref</th>
                      <th className="p-3.5">Fee Category</th>
                      <th className="p-3.5 text-right">Paid Amount</th>
                      <th className="p-3.5">Payment Date</th>
                      <th className="p-3.5">Payment Mode</th>
                      <th className="p-3.5 text-right">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipts.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-teal-800">
                          {rec.receiptNumber || `RCP-${rec.invoiceNumber || 'VERIFIED'}`}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {rec.invoiceNumber}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          {rec.category}
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                          ₹{(rec.paidAmount || rec.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">
                          {rec.paymentDate
                            ? new Date(rec.paymentDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : new Date().toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                        </td>
                        <td className="p-3.5">
                          <Badge variant="neutral" size="sm">
                            {rec.paymentMode || 'Online Transfer'}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                            onClick={() => setActiveReceipt(rec)}
                          >
                            View Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* OFFICIAL RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Receipt Paper */}
            <div id="printable-receipt" className="space-y-6 text-slate-800">
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-4 space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-xs">
                  CV
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  CampusVerse University Institute
                </h3>
                <p className="text-[11px] text-slate-500">
                  Office of the Bursar & Financial Controller • Institutional E-Receipt
                </p>
                <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                  Payment Verified
                </div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Receipt Number</span>
                  <span className="font-bold text-slate-900">
                    {activeReceipt.receiptNumber || `RCP-${activeReceipt.invoiceNumber}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Date of Payment</span>
                  <span className="font-bold text-slate-900">
                    {activeReceipt.paymentDate
                      ? new Date(activeReceipt.paymentDate).toLocaleDateString('en-IN')
                      : new Date().toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Student Ward</span>
                  <span className="font-bold text-slate-900">{student?.name || 'Aarav Singhania'}</span>
                  <span className="text-[10px] text-slate-500 block">Roll: {student?.studentId || 'CS21B1042'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">Payment Method</span>
                  <span className="font-bold text-slate-900">{activeReceipt.paymentMode || 'Net Banking'}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-50 p-2.5 font-semibold text-slate-600 flex justify-between border-b border-slate-200">
                  <span>Particulars</span>
                  <span>Amount (INR)</span>
                </div>
                <div className="p-3 flex justify-between items-center border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-900 block">{activeReceipt.category}</span>
                    <span className="text-[11px] text-slate-500">{activeReceipt.description || 'Institutional Tuition & Lab Fee'}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{(activeReceipt.paidAmount || activeReceipt.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3 bg-teal-50/50 flex justify-between items-center font-bold text-sm text-teal-900">
                  <span>Total Amount Paid</span>
                  <span className="font-mono">
                    ₹{(activeReceipt.paidAmount || activeReceipt.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Verification Stamp */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Digitally Authorized Document</span>
                </div>
                <span className="font-mono">Transaction ID: TXN-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setActiveReceipt(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={handlePrintReceipt}
              >
                Print / Save Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentFees;
