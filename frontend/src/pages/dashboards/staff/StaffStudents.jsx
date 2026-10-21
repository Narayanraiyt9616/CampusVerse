import React, { useState, useEffect } from 'react';
import {
  Users,
  Home,
  Bus,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  CreditCard,
  X,
  ExternalLink,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { staffService } from '../../../services/api';

export const StaffStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'HOSTEL' | 'TRANSPORT'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await staffService.getStudentRecords({
        filterType: filterType === 'ALL' ? undefined : filterType,
      });
      if (res && res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student estate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filterType]);

  // Client-side search
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesName = (s.name || '').toLowerCase().includes(q);
    const matchesId = (s.studentId || '').toLowerCase().includes(q);
    const matchesDept = (s.department || '').toLowerCase().includes(q);
    const matchesRoom = (s.hostel?.roomNumber || '').toLowerCase().includes(q);
    const matchesRoute = (s.transport?.routeNumber || '').toLowerCase().includes(q);
    return matchesName || matchesId || matchesDept || matchesRoom || matchesRoute;
  });

  if (loading && students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-[#102A43]/70 font-medium">Loading unified student logistics records...</p>
      </div>
    );
  }

  const residentsCount = students.filter((s) => s.hostel?.isResident).length;
  const commutersCount = students.filter((s) => s.transport?.hasPass).length;

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Student Records Alert"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* KPI Ribbons matching Student Portal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#102A43] text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#CCFBF1] uppercase tracking-wider block">
              Total Enrolled Students
            </span>
            <span className="text-3xl font-extrabold font-mono text-white mt-1.5 block">
              {students.length}
            </span>
            <span className="text-xs text-[#CCFBF1] mt-0.5 block font-medium">Under Department SIS</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 text-[#CCFBF1] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#CCFBF1] text-center shadow-sm flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider block">
              Hostel Boarders
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-extrabold text-[#0D9488] font-mono">
                {residentsCount}
              </span>
              <span className="text-xs text-[#102A43]/70 font-semibold">residents</span>
            </div>
            <span className="text-xs text-[#0D9488] mt-0.5 block font-bold">
              Active Bed Allotments
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center">
            <Home className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#CCFBF1] border border-[#0D9488] text-center shadow-sm flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold text-[#102A43] uppercase tracking-wider block">
              Transit Commuters
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-extrabold text-[#102A43] font-mono">
                {commutersCount}
              </span>
              <span className="text-xs text-[#102A43]/70 font-semibold">commuters</span>
            </div>
            <span className="text-xs text-[#102A43] mt-0.5 block font-bold">
              Active RFID Bus Passes
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#0D9488] text-white flex items-center justify-center">
            <Bus className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Student Records Card */}
      <Card
        title="Student Logistics & Accommodation Records"
        subtitle="Unified master list combining basic academic profile, hostel residence, and transport pass allocations"
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#102A43]/50 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, roll #, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-[#0D9488] text-[#102A43] w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#CCFBF1]/30 p-1 border border-[#CCFBF1] rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'ALL' ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm' : 'text-[#102A43] hover:bg-[#CCFBF1]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('HOSTEL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'HOSTEL' ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm' : 'text-[#102A43] hover:bg-[#CCFBF1]'
                }`}
              >
                Hostel Residents
              </button>
              <button
                onClick={() => setFilterType('TRANSPORT')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterType === 'TRANSPORT' ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm' : 'text-[#102A43] hover:bg-[#CCFBF1]'
                }`}
              >
                Bus Commuters
              </button>
            </div>

            <Button variant="secondary" size="sm" onClick={fetchStudents} leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#0D9488]" />}>
              Sync
            </Button>
          </div>
        }
      >
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#102A43]/60 font-semibold">
            No student records matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0FDFA] text-[#102A43] font-bold text-xs uppercase tracking-wider border-b border-[#CCFBF1]">
                <tr>
                  <th className="p-3.5">Student Details</th>
                  <th className="p-3.5">Academic Program</th>
                  <th className="p-3.5">Hostel Accommodation</th>
                  <th className="p-3.5">Transit Bus Pass</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCFBF1]">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-[#CCFBF1]/30 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-[#102A43] block">{s.name}</span>
                      <span className="text-[11px] font-mono text-[#0D9488] font-bold block">
                        {s.studentId}
                      </span>
                      <span className="text-[10px] text-[#102A43]/60 block font-mono">
                        {s.email}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-[#102A43] block">
                        {s.department}
                      </span>
                      <span className="text-[11px] text-[#102A43]/70 font-semibold">
                        Semester {s.semester}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {s.hostel?.isResident ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-[#102A43]">
                            <Home className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                            <span>Room {s.hostel.roomNumber}</span>
                          </div>
                          <span className="text-[11px] text-[#102A43]/70 font-medium block">
                            {s.hostel.block} ({s.hostel.bedNumber})
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#102A43]/50 italic text-[11px]">Day Scholar (Non-Resident)</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {s.transport?.hasPass ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-[#102A43]">
                            <Bus className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                            <span>{s.transport.routeNumber}</span>
                          </div>
                          <span className="text-[11px] text-[#102A43]/70 font-medium block">
                            Halt: {s.transport.pickupStop}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#0D9488] block">
                            Pass: {s.transport.passNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#102A43]/50 italic text-[11px]">No Bus Pass Issued</span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <Badge variant="teal" size="sm" hasDot>
                        {s.status}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="text-xs font-bold text-[#0D9488] hover:underline inline-flex items-center gap-1"
                      >
                        Logistics Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* STUDENT LOGISTICS MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-[#102A43]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#102A43]/60 hover:text-[#102A43] hover:bg-[#CCFBF1] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-[#CCFBF1] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] border border-[#0D9488]/30 flex items-center justify-center text-[#0D9488] font-bold text-xl">
                {selectedStudent.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102A43]">{selectedStudent.name}</h3>
                <p className="text-xs text-[#102A43]/70 font-mono font-semibold">
                  Roll No: {selectedStudent.studentId} • {selectedStudent.department}
                </p>
              </div>
            </div>

            {/* Hostel Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#0D9488]" />
                Residential Hostel File
              </h4>
              {selectedStudent.hostel?.isResident ? (
                <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Hostel Block</span>
                    <span className="font-bold text-[#102A43]">{selectedStudent.hostel.block}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Room & Bed #</span>
                    <span className="font-bold text-[#102A43] font-mono">
                      Room {selectedStudent.hostel.roomNumber} ({selectedStudent.hostel.bedNumber})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Allotment Date</span>
                    <span className="font-mono font-bold text-[#102A43]">
                      {selectedStudent.hostel.checkInDate ? new Date(selectedStudent.hostel.checkInDate).toLocaleDateString('en-IN') : 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Emergency Contact</span>
                    <span className="font-bold text-[#102A43]">
                      {selectedStudent.hostel.emergencyContact?.name || 'Guardian'} (
                      {selectedStudent.hostel.emergencyContact?.phone || '—'})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] text-xs text-[#102A43]/60 italic font-medium">
                  Not registered for on-campus hostel accommodation.
                </div>
              )}
            </div>

            {/* Transport Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-[#0D9488]" />
                University Transit Pass
              </h4>
              {selectedStudent.transport?.hasPass ? (
                <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Bus Pass ID</span>
                    <span className="font-bold text-[#0D9488] font-mono">{selectedStudent.transport.passNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Assigned Route</span>
                    <span className="font-bold text-[#102A43]">
                      {selectedStudent.transport.routeNumber}: {selectedStudent.transport.routeName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Boarding Halt</span>
                    <span className="font-bold text-[#102A43]">{selectedStudent.transport.pickupStop}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#102A43]/70 uppercase tracking-wider font-bold block">Valid Till</span>
                    <span className="font-mono font-bold text-[#102A43]">
                      {selectedStudent.transport.validTill ? new Date(selectedStudent.transport.validTill).toLocaleDateString('en-IN') : 'End of Academic Year'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] text-xs text-[#102A43]/60 italic font-medium">
                  No active suburban transit pass issued for this student.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#CCFBF1] flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffStudents;
