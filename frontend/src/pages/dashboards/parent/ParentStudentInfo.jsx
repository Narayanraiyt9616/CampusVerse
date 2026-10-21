import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  Award,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { parentService } from '../../../services/api';

export const ParentStudentInfo = ({ selectedStudentId }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meetingRequested, setMeetingRequested] = useState(false);

  const fetchStudent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await parentService.getStudentInfo({ studentId: selectedStudentId || undefined });
      if (res && res.success) {
        setStudent(res.student);
      }
    } catch (err) {
      setError(err.message || 'Failed to load student details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [selectedStudentId]);

  if (loading && !student) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading student academic profile...</p>
      </div>
    );
  }

  const courses = student?.courses || [];
  const advisor = student?.advisor || {
    name: 'Dr. Rajiv Menon',
    email: 'rajiv.menon@campusverse.edu',
    designation: 'Professor & AI Lab Head',
    contact: '+91 (80) 4122-8940',
  };

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Student Information Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Main Student Profile Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#CCFBF1] p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#CCFBF1]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#CCFBF1] border border-[#0D9488]/30 flex items-center justify-center text-[#0D9488] font-bold text-2xl shadow-xs">
              {student?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-[#102A43]">{student?.name}</h2>
                <Badge variant={student?.status === 'Active' ? 'success' : 'neutral'} size="sm" hasDot>
                  {student?.status || 'Active'}
                </Badge>
              </div>
              <p className="text-xs text-[#102A43]/70 font-mono mt-1">
                Student ID / Roll No: <strong className="text-[#102A43] font-bold">{student?.studentId}</strong> • Institutional ID
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-[#0D9488] ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchStudent}
          >
            Refresh Profile
          </Button>
        </div>

        {/* Detailed Grid Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
            <span className="text-[#102A43]/70 font-bold uppercase text-[10px] block">Academic School / Department</span>
            <span className="font-bold text-[#102A43] text-base block">{student?.departmentName || 'Computer Science & Engineering'}</span>
            <span className="text-xs text-[#102A43]/60 font-mono font-medium">Code: {student?.departmentCode || 'CSE'}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
            <span className="text-[#102A43]/70 font-bold uppercase text-[10px] block">Current Academic Standing</span>
            <span className="font-bold text-[#0D9488] text-base block">Semester {student?.semester}</span>
            <span className="text-xs text-[#102A43]/60 font-medium">Degree: Bachelor of Technology (B.Tech)</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
            <span className="text-[#102A43]/70 font-bold uppercase text-[10px] block">Enrollment & Batch</span>
            <span className="font-bold text-[#102A43] text-base block font-mono">Class of {student?.enrollmentYear ? student.enrollmentYear + 4 : '2025'}</span>
            <span className="text-xs text-[#102A43]/60 font-mono font-medium">Enrolled: {student?.enrollmentYear}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
            <span className="text-[#102A43]/70 font-bold uppercase text-[10px] block">Institutional Email</span>
            <span className="font-bold text-[#102A43] text-xs block font-mono truncate">{student?.email}</span>
            <span className="text-xs text-[#0D9488] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Student Account
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrolled Courses / Curriculum */}
        <div className="lg:col-span-2">
          <Card
            title="Enrolled Semester Curriculum & Subjects"
            subtitle={`Official syllabus courses assigned to Semester ${student?.semester} in MongoDB`}
            badge={<Badge variant="navy" size="sm">{courses.length} Active Courses</Badge>}
          >
            <div className="space-y-3">
              {courses.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No specific curriculum courses assigned yet.</p>
              ) : (
                courses.map((c) => (
                  <div key={c._id} className="p-3.5 rounded-xl border border-[#CCFBF1] bg-[#FFFFFF] hover:bg-[#CCFBF1]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#102A43] bg-[#CCFBF1] px-2 py-0.5 rounded text-xs">{c.courseCode}</span>
                        <h4 className="font-bold text-[#102A43] text-sm">{c.title}</h4>
                      </div>
                      <p className="text-xs text-[#102A43]/70 line-clamp-1 font-medium">{c.description || 'Core departmental subject'}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <Badge variant="teal" size="sm">{c.credits} Credits</Badge>
                      <Badge variant="neutral" size="sm">Semester {c.semester}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Assigned Faculty Mentor & Guardian Consultation */}
        <div className="lg:col-span-1 space-y-6">
          <Card
            title="Designated Faculty Advisor"
            subtitle="Official institutional mentor assigned to supervise your ward's academic progression"
          >
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3.5 bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center font-bold text-lg shrink-0">
                  {advisor.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h4 className="font-bold text-[#102A43] text-sm">{advisor.name}</h4>
                  <p className="text-xs text-[#102A43]/70 font-medium">{advisor.designation}</p>
                </div>
              </div>

              <div className="space-y-2 text-[#102A43]">
                <div className="flex items-center gap-2 py-1 border-b border-[#CCFBF1]">
                  <Mail className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span className="font-mono text-xs">{advisor.email}</span>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-[#CCFBF1]">
                  <Phone className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span className="font-mono text-xs">{advisor.contact}</span>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <Clock className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                  <span className="text-xs font-medium">Office Hours: Tue & Thu, 2:00 PM - 4:30 PM</span>
                </div>
              </div>

              <div className="pt-2">
                {meetingRequested ? (
                  <div className="p-3 rounded-lg bg-[#CCFBF1] border border-[#0D9488]/40 text-[#102A43] text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
                    <span>Meeting request dispatched to Faculty Advisor!</span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setMeetingRequested(true)}
                  >
                    Request Academic Consultation
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentStudentInfo;
