import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  BookOpen,
  MapPin,
  User,
  AlertCircle,
  CheckCircle2,
  FileText,
  Filter,
  RefreshCw,
  CalendarDays,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { parentService } from '../../../services/api';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ParentSchedule = ({ selectedStudentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' | 'timetable' | 'exams'
  const [selectedDay, setSelectedDay] = useState(() => {
    const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
    if (todayIndex >= 1 && todayIndex <= 6) {
      return DAYS_OF_WEEK[todayIndex - 1];
    }
    return 'Monday';
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await parentService.getAssignmentsAndTimetable({
        studentId: selectedStudentId || undefined,
      });
      if (res && res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch assignments and class schedules.');
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
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading coursework & schedule...</p>
      </div>
    );
  }

  const assignments = data?.assignments || [];
  const timetables = data?.timetables || [];
  const exams = data?.exams || [];
  const student = data?.student;

  // Timetable for selected day
  const dayClasses = timetables
    .filter((t) => t.dayOfWeek?.toLowerCase() === selectedDay.toLowerCase())
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  // Calculate assignment deadlines
  const now = new Date();
  const pendingAssignments = assignments.filter((a) => new Date(a.dueDate) >= now);
  const pastAssignments = assignments.filter((a) => new Date(a.dueDate) < now);

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Schedule Telemetry Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Top Banner KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Active Assignments
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#0D9488] font-mono">
                {pendingAssignments.length}
              </span>
              <span className="text-xs text-[#102A43]/60">pending</span>
            </div>
            <span className="text-xs text-[#102A43]/60 mt-1 block font-medium">
              {assignments.length} total coursework tasks
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Weekly Lectures
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#102A43] font-mono">
                {timetables.length}
              </span>
              <span className="text-xs text-[#102A43]/60">periods/wk</span>
            </div>
            <span className="text-xs text-[#0D9488] mt-1 block font-bold">
              Semester {student?.semester || 7} Timetable
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#CCFBF1] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#102A43]/70 uppercase tracking-wider block">
              Scheduled Examinations
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-[#102A43] font-mono">
                {exams.length}
              </span>
              <span className="text-xs text-[#102A43]/60">papers</span>
            </div>
            <span className="text-xs text-[#102A43]/60 mt-1 block font-medium">
              End-Term & Unit Assessments
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488]">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#CCFBF1] pb-2">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'assignments'
              ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
              : 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1]'
          }`}
        >
          <FileText className="w-4 h-4" />
          Assignments & Deadlines
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'assignments' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
          }`}>
            {assignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timetable'
              ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
              : 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1]'
          }`}
        >
          <Clock className="w-4 h-4" />
          Classroom Timetable
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'timetable' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
          }`}>
            Weekly
          </span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'exams'
              ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
              : 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Examination Schedule
          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            activeTab === 'exams' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
          }`}>
            {exams.length}
          </span>
        </button>

        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={fetchData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Sync
          </Button>
        </div>
      </div>

      {/* TAB 1: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <Card
            title="Coursework Assignments & Deadlines"
            subtitle="Faculty submissions, due dates, maximum marks, and project briefs"
            badge={
              <Badge variant="teal" size="sm">
                {pendingAssignments.length} Pending Submission
              </Badge>
            }
          >
            {assignments.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700">No coursework assignments posted.</p>
                <p>Course faculty have not assigned active homework or projects for this semester.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignments.map((item) => {
                    const due = new Date(item.dueDate);
                    const isOverdue = due < now;
                    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

                    return (
                      <div
                        key={item._id}
                        className={`p-5 rounded-xl border transition-all ${
                          isOverdue
                            ? 'bg-slate-50/70 border-slate-200'
                            : diffDays <= 3
                            ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-teal-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono font-bold text-teal-700 uppercase">
                              {item.course?.courseCode || 'COURSE'} • {item.course?.title}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h4>
                          </div>
                          <Badge
                            variant={isOverdue ? 'neutral' : diffDays <= 3 ? 'warning' : 'teal'}
                            size="sm"
                          >
                            {isOverdue
                              ? 'Past Due'
                              : diffDays === 0
                              ? 'Due Today'
                              : `${diffDays} days left`}
                          </Badge>
                        </div>

                        {item.description && (
                          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Due: {due.toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono text-slate-700 font-semibold">
                              Max: {item.maxMarks} marks
                            </span>
                            {item.faculty?.name && (
                              <span className="text-[11px] text-slate-500">
                                Prof. {item.faculty.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          <Card
            title="Master Class Timetable"
            subtitle="Scheduled lectures, laboratory tutorials, and allocated classroom halls"
          >
            {/* Day Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
              {DAYS_OF_WEEK.map((day) => {
                const count = timetables.filter(
                  (t) => t.dayOfWeek?.toLowerCase() === day.toLowerCase()
                ).length;
                const isSelected = selectedDay.toLowerCase() === day.toLowerCase();

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#0D9488] text-[#FFFFFF] shadow-sm'
                        : 'bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#102A43] border border-[#CCFBF1]'
                    }`}
                  >
                    <span>{day}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#CCFBF1] text-[#102A43]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timetable Period Cards for the day */}
            <div className="mt-4">
              {dayClasses.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 space-y-1">
                  <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">No scheduled periods for {selectedDay}.</p>
                  <p>Study hall, laboratory research, or weekend recess.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayClasses.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono text-center shrink-0">
                          <span className="text-xs font-bold block">{item.startTime}</span>
                          <span className="text-[10px] text-teal-600 block">to {item.endTime}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {item.course?.title || item.course?.courseCode || 'Lecture Period'}
                            </span>
                            <Badge variant="neutral" size="sm">
                              Section {item.section || 'A'}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">
                            {item.course?.courseCode || 'Course'} • Semester {item.semester}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{item.classroom || 'Lecture Hall A'}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{item.faculty?.name ? `Prof. ${item.faculty.name}` : 'Assigned Faculty'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: EXAMINATIONS */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <Card
            title="Scheduled Examination Dates & Seating"
            subtitle="Mid-term, end-term, and practical laboratory assessment schedule"
            badge={
              <Badge variant="teal" size="sm">
                Controller of Examinations
              </Badge>
            }
          >
            {exams.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                <CalendarDays className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700">No examinations currently scheduled.</p>
                <p>The examination calendar for this semester has not yet been notified.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F0FDFA] text-[#102A43] font-bold border-b border-[#CCFBF1]">
                    <tr>
                      <th className="p-3.5">Subject & Title</th>
                      <th className="p-3.5">Assessment Type</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5 text-center">Duration</th>
                      <th className="p-3.5">Hall / Venue</th>
                      <th className="p-3.5 text-center">Max Marks</th>
                      <th className="p-3.5">Proctor / Faculty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((ex, idx) => (
                      <tr key={ex._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">{ex.title}</span>
                          <span className="text-[11px] font-mono text-teal-700 block">
                            {ex.subject} ({ex.className})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <Badge variant="purple" size="sm">
                            {ex.examType || 'Mid-Term'}
                          </Badge>
                        </td>
                        <td className="p-3.5 font-mono">
                          <div className="font-semibold text-slate-800">{ex.examDate}</div>
                          <div className="text-[11px] text-slate-500">{ex.startTime} IST</div>
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-700 font-medium">
                          {ex.duration} mins
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <MapPin className="w-3.5 h-3.5 text-teal-600" />
                            <span>{ex.venue || 'Exam Hall 101'}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                          {ex.maxMarks}
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {ex.faculty?.name ? `Prof. ${ex.faculty.name}` : 'Department Proctor'}
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
    </div>
  );
};

export default ParentSchedule;
