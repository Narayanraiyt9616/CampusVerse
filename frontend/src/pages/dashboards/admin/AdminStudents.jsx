import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  RefreshCw,
  Mail,
  Building2,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: '',
    semester: 1,
    enrollmentYear: new Date().getFullYear(),
    status: 'Active',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation modal state
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await adminService.getDepartments();
      if (res && res.success) {
        setDepartments(res.departments || []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getStudents({
        page,
        limit: 10,
        q: search || undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        semester: semesterFilter !== 'all' ? semesterFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (res && res.success) {
        setStudents(res.students || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalRecords(res.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, departmentFilter, semesterFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      studentId: '',
      name: '',
      email: '',
      department: departments[0]?._id || '',
      semester: 1,
      enrollmentYear: new Date().getFullYear(),
      status: 'Active',
      password: 'Campus@123',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      department: student.department?._id || student.department || '',
      semester: student.semester || 1,
      enrollmentYear: student.enrollmentYear || new Date().getFullYear(),
      status: student.status || 'Active',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    if (e) e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingStudent) {
        const res = await adminService.updateStudent(editingStudent._id, formData);
        if (res && res.success) {
          setSuccess(`Student ${formData.name} updated successfully.`);
          setIsModalOpen(false);
          fetchStudents();
        }
      } else {
        const res = await adminService.createStudent(formData);
        if (res && res.success) {
          setSuccess(`Student enrolled! Login created: ${formData.email} (Password: ${res.generatedPassword || 'Campus@123'})`);
          setIsModalOpen(false);
          fetchStudents();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save student record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setDeleteLoading(true);
    try {
      const res = await adminService.deleteStudent(deletingStudent._id);
      if (res && res.success) {
        setSuccess(`Student ${deletingStudent.studentId} record deleted.`);
        setDeletingStudent(null);
        fetchStudents();
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'studentId',
      header: 'Roll / ID',
      render: (v) => <span className="font-mono font-bold text-xs text-[#102A43]">{v}</span>,
    },
    {
      key: 'name',
      header: 'Student Name & Contact',
      render: (v, r) => (
        <div>
          <p className="font-bold text-[#102A43] text-xs">{v}</p>
          <p className="text-[11px] text-[#102A43]/70 font-mono flex items-center gap-1">
            <Mail className="w-3 h-3 text-[#0D9488]" />
            {r.email}
          </p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (v) => <span className="text-xs font-semibold text-[#102A43]">{v?.name || v?.code || 'Unassigned'}</span>,
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (v) => <Badge variant="teal" size="sm">Sem {v}</Badge>,
    },
    {
      key: 'enrollmentYear',
      header: 'Batch',
      render: (v) => <span className="font-mono text-xs text-[#102A43] font-semibold">{v}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => (
        <Badge variant={v === 'Active' ? 'success' : v === 'Suspended' ? 'danger' : 'neutral'} size="sm">
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
            className="text-xs"
            leftIcon={<Edit2 className="w-3 h-3" />}
            onClick={() => handleOpenEdit(r)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="text-xs"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => setDeletingStudent(r)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {success && (
        <AlertBanner
          variant="success"
          title="Operation Complete"
          message={success}
          dismissible
          onDismiss={() => setSuccess('')}
        />
      )}

      {error && (
        <AlertBanner
          variant="danger"
          title="Student Record Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      <Card
        title="Student Registry & Academic Profile Management"
        subtitle="Manage student enrollments, academic progression, department assignments, and login status"
        badge={<Badge variant="teal" size="sm">{totalRecords} Registered</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={handleOpenAdd}
          >
            Add New Student
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#0D9488] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, roll no, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#F0FDFA] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
                />
              </div>
              <Button type="submit" variant="secondary" size="sm">Search</Button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>

              <select
                value={semesterFilter}
                onChange={(e) => {
                  setSemesterFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
                <option value="On Leave">On Leave</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
                onClick={fetchStudents}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Student Table */}
          <Table
            columns={columns}
            data={students}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No students match the selected filter criteria."
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#102A43]/70 pt-2 border-t border-[#CCFBF1]">
              <span>Showing page {page} of {totalPages} ({totalRecords} students)</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.studentId}` : 'Enroll New Student'}
        description="Creates student academic profile and provisioned student portal credentials in MongoDB"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={formLoading}
              disabled={formLoading}
              onClick={handleSaveStudent}
            >
              {editingStudent ? 'Save Changes' : 'Enroll & Create Account'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Student Roll / ID"
                type="text"
                placeholder="e.g. CS21B1042"
                value={formData.studentId}
                onChange={(e) => setFormData((p) => ({ ...p, studentId: e.target.value.toUpperCase() }))}
                disabled={Boolean(editingStudent)}
                required
              />
            </div>
            <div>
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Aarav Singhania"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Institutional Email"
                type="email"
                placeholder="e.g. aarav.singhania@campusverse.edu"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                Department <span className="text-[#0D9488]">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
                required
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                Semester <span className="text-[#0D9488]">*</span>
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData((p) => ({ ...p, semester: Number(e.target.value) }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Enrollment Year"
                type="number"
                value={formData.enrollmentYear}
                onChange={(e) => setFormData((p) => ({ ...p, enrollmentYear: Number(e.target.value) }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#CCFBF1] bg-[#FFFFFF] text-[#102A43] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488] font-medium"
              >
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="Suspended">Suspended</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          {!editingStudent && (
            <div>
              <Input
                label="Initial Account Password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                placeholder="Default: Campus@123"
              />
              <p className="text-[11px] text-[#102A43]/70 mt-1">
                Student will use their email and this password to log in to the Student Portal.
              </p>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingStudent)}
        onClose={() => setDeletingStudent(null)}
        title="Delete Student Record"
        description="Are you sure you want to permanently delete this student record from the university database?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeletingStudent(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteLoading}
              disabled={deleteLoading}
              onClick={handleDelete}
            >
              Confirm Deletion
            </Button>
          </div>
        }
      >
        {deletingStudent && (
          <div className="p-3 bg-[#CCFBF1]/30 border border-[#CCFBF1] rounded-lg text-xs text-[#102A43] space-y-1">
            <p><strong>Student:</strong> {deletingStudent.name} ({deletingStudent.studentId})</p>
            <p><strong>Email:</strong> {deletingStudent.email}</p>
            <p className="text-[11px] text-[#102A43]/80 mt-2">
              Warning: This action will permanently remove the student profile from MongoDB and will be logged in the system audit trail.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminStudents;
