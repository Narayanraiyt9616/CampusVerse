import React, { useState, useEffect } from 'react';
import {
  Building2,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  RefreshCw,
  Search,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

export const AdminAcademics = () => {
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'courses'
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '', status: 'Active' });
  const [deptLoading, setDeptLoading] = useState(false);

  // Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    title: '',
    description: '',
    credits: 4,
    department: '',
    semester: 1,
    status: 'Active',
  });
  const [courseLoading, setCourseLoading] = useState(false);

  // Delete modal
  const [deleteItem, setDeleteItem] = useState(null); // { type: 'dept'|'course', item }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAcademics = async () => {
    setLoading(true);
    setError('');
    try {
      const [deptRes, courseRes] = await Promise.all([
        adminService.getDepartments(),
        adminService.getCourses(),
      ]);

      if (deptRes && deptRes.success) setDepartments(deptRes.departments || []);
      if (courseRes && courseRes.success) setCourses(courseRes.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch academic structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  // Department Handlers
  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptForm({ name: '', code: '', description: '', status: 'Active' });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      status: dept.status || 'Active',
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = async (e) => {
    if (e) e.preventDefault();
    setDeptLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editingDept) {
        const res = await adminService.updateDepartment(editingDept._id, deptForm);
        if (res && res.success) {
          setSuccess(`Department ${deptForm.code} updated.`);
          setIsDeptModalOpen(false);
          fetchAcademics();
        }
      } else {
        const res = await adminService.createDepartment(deptForm);
        if (res && res.success) {
          setSuccess(`Department ${deptForm.code} created.`);
          setIsDeptModalOpen(false);
          fetchAcademics();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save department.');
    } finally {
      setDeptLoading(false);
    }
  };

  // Course Handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      courseCode: '',
      title: '',
      description: '',
      credits: 4,
      department: departments[0]?._id || '',
      semester: 1,
      status: 'Active',
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      courseCode: course.courseCode,
      title: course.title,
      description: course.description || '',
      credits: course.credits || 4,
      department: course.department?._id || course.department || '',
      semester: course.semester || 1,
      status: course.status || 'Active',
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    if (e) e.preventDefault();
    setCourseLoading(true);
    setError('');
    setSuccess('');
    try {
      if (editingCourse) {
        const res = await adminService.updateCourse(editingCourse._id, courseForm);
        if (res && res.success) {
          setSuccess(`Course ${courseForm.courseCode} updated.`);
          setIsCourseModalOpen(false);
          fetchAcademics();
        }
      } else {
        const res = await adminService.createCourse(courseForm);
        if (res && res.success) {
          setSuccess(`Course ${courseForm.courseCode} created.`);
          setIsCourseModalOpen(false);
          fetchAcademics();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save course.');
    } finally {
      setCourseLoading(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      if (deleteItem.type === 'dept') {
        const res = await adminService.deleteDepartment(deleteItem.item._id);
        if (res && res.success) {
          setSuccess(`Department deleted.`);
          setDeleteItem(null);
          fetchAcademics();
        }
      } else {
        const res = await adminService.deleteCourse(deleteItem.item._id);
        if (res && res.success) {
          setSuccess(`Course deleted.`);
          setDeleteItem(null);
          fetchAcademics();
        }
      }
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const deptColumns = [
    {
      key: 'code',
      header: 'Department Code',
      render: (v) => <span className="font-mono font-bold text-xs text-[#111827]">{v}</span>,
    },
    {
      key: 'name',
      header: 'Department Name & Focus',
      render: (v, r) => (
        <div>
          <p className="font-bold text-[#111827] text-xs">{v}</p>
          <p className="text-[11px] text-[#4B5563] line-clamp-1">{r.description || 'No description provided.'}</p>
        </div>
      ),
    },
    {
      key: 'coursesCount',
      header: 'Curriculum Depth',
      render: (_, r) => {
        const count = courses.filter((c) => (c.department?._id || c.department) === r._id).length;
        return <span className="text-xs font-bold text-[#111827]">{count} Courses</span>;
      },
    },
    {
      key: 'status',
      header: 'Operational Status',
      render: (v) => <Badge variant={v === 'Active' ? 'success' : 'neutral'} size="sm">{v}</Badge>,
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
            onClick={() => handleOpenEditDept(r)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="text-xs"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => setDeleteItem({ type: 'dept', item: r })}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const courseColumns = [
    {
      key: 'courseCode',
      header: 'Course Code',
      render: (v) => <span className="font-mono font-bold text-xs text-[#111827]">{v}</span>,
    },
    {
      key: 'title',
      header: 'Course Title',
      render: (v, r) => (
        <div>
          <p className="font-bold text-[#111827] text-xs">{v}</p>
          <p className="text-[11px] text-[#4B5563] line-clamp-1">{r.description || 'No description.'}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (v) => <span className="text-xs font-semibold text-[#111827]">{v?.name || v?.code || 'General'}</span>,
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (v) => <Badge variant="teal" size="sm">Sem {v}</Badge>,
    },
    {
      key: 'credits',
      header: 'Credits',
      render: (v) => <span className="font-mono text-xs font-bold text-[#D99A00]">{v} Credits</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => <Badge variant={v === 'Active' ? 'success' : 'neutral'} size="sm">{v}</Badge>,
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
            onClick={() => handleOpenEditCourse(r)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="text-xs"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => setDeleteItem({ type: 'course', item: r })}
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
          title="Academic Registry Updated"
          message={success}
          dismissible
          onDismiss={() => setSuccess('')}
        />
      )}

      {error && (
        <AlertBanner
          variant="danger"
          title="Academic Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Tabs Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 bg-[#FFF8E6]/30 border border-[#F1E7CF] rounded-xl">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'departments'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6]/50'
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6]/50'
            }`}
          >
            Courses & Subjects ({courses.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchAcademics}
          >
            Refresh
          </Button>

          {activeTab === 'departments' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddDept}
            >
              Add Department
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleOpenAddCourse}
            >
              Add Course
            </Button>
          )}
        </div>
      </div>

      {/* Tab 1: Departments */}
      {activeTab === 'departments' && (
        <Card
          title="Academic Departments & Schools of Study"
          subtitle="Governing faculties, departmental codes, and curriculum divisions in MongoDB"
          badge={<Badge variant="teal" size="sm">{departments.length} Departments</Badge>}
        >
          <Table
            columns={deptColumns}
            data={departments}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No departments configured."
          />
        </Card>
      )}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' && (
        <Card
          title="Degree Courses, Subjects & Curricular Offerings"
          subtitle="Course credits, semester mapping, and syllabus information"
          badge={<Badge variant="info" size="sm">{courses.length} Courses</Badge>}
        >
          <Table
            columns={courseColumns}
            data={courses}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No courses registered in this catalog."
          />
        </Card>
      )}

      {/* Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.code}` : 'Create Academic Department'}
        description="Establish an accredited university department or school in MongoDB"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={deptLoading}
              disabled={deptLoading}
              onClick={handleSaveDept}
            >
              {editingDept ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDept} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Department Code"
                type="text"
                placeholder="e.g. CSE, ECE, ME"
                value={deptForm.code}
                onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            <div>
              <Input
                label="Department Name"
                type="text"
                placeholder="e.g. Computer Science & Engineering"
                value={deptForm.name}
                onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Academic disciplines, laboratory research focuses, and degree tracks..."
              value={deptForm.description}
              onChange={(e) => setDeptForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full p-2.5 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Status</label>
            <select
              value={deptForm.status}
              onChange={(e) => setDeptForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingCourse ? `Edit Course: ${editingCourse.courseCode}` : 'Register New Course'}
        description="Add course subject to university curriculum schedule in MongoDB"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsCourseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={courseLoading}
              disabled={courseLoading}
              onClick={handleSaveCourse}
            >
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Course Code"
                type="text"
                placeholder="e.g. CS701"
                value={courseForm.courseCode}
                onChange={(e) => setCourseForm((p) => ({ ...p, courseCode: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            <div>
              <Input
                label="Course Title"
                type="text"
                placeholder="e.g. Artificial Intelligence & Neural Networks"
                value={courseForm.title}
                onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Department <span className="text-[#D99A00]">*</span>
              </label>
              <select
                value={courseForm.department}
                onChange={(e) => setCourseForm((p) => ({ ...p, department: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
                required
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Semester <span className="text-[#D99A00]">*</span>
              </label>
              <select
                value={courseForm.semester}
                onChange={(e) => setCourseForm((p) => ({ ...p, semester: Number(e.target.value) }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Credits"
                type="number"
                min={1}
                max={10}
                value={courseForm.credits}
                onChange={(e) => setCourseForm((p) => ({ ...p, credits: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Course Description / Syllabus Overview</label>
            <textarea
              rows={3}
              placeholder="Core prerequisites, learning outcomes, laboratory modules..."
              value={courseForm.description}
              onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full p-2.5 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        title={`Confirm Delete ${deleteItem?.type === 'dept' ? 'Department' : 'Course'}`}
        description="Are you sure you want to permanently remove this academic entity?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteItem(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteLoading}
              disabled={deleteLoading}
              onClick={handleDeleteConfirm}
            >
              Confirm Delete
            </Button>
          </div>
        }
      >
        {deleteItem && (
          <div className="p-3 bg-[#FFF8E6]/30 border border-[#F1E7CF] rounded-lg text-xs text-[#111827]">
            <p><strong>Item:</strong> {deleteItem.item?.name || deleteItem.item?.title} ({deleteItem.item?.code || deleteItem.item?.courseCode})</p>
            <p className="mt-2 text-[11px] text-[#4B5563]">
              Note: This action will be recorded in the administrative security audit log.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAcademics;
