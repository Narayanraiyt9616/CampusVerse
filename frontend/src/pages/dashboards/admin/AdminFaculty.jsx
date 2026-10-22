import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Shield,
  CheckCircle2,
  RefreshCw,
  Building2,
  Layers,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Table from '../../../components/common/Table';
import Modal from '../../../components/common/Modal';
import AlertBanner from '../../../components/common/AlertBanner';
import { adminService } from '../../../services/api';

export const AdminFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    department: 'Computer Science & Engineering',
    position: 'Assistant Professor',
    password: 'Faculty@Campus2026',
    semesters: [3, 5, 7],
    sections: ['A'],
    permissions: {
      attendance: true,
      assignments: true,
      materials: true,
      examinations: true,
      marks: true,
      questionPapers: true,
    },
    status: 'active',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Delete modal
  const [deletingFaculty, setDeletingFaculty] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFaculty = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getFaculty();
      if (res && res.success) {
        setFacultyList(res.faculty || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load faculty.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await adminService.getDepartments();
      if (res && res.success) setDepartments(res.departments || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      department: departments[0]?.name || 'Computer Science & Engineering',
      position: 'Assistant Professor',
      password: 'Faculty@Campus2026',
      semesters: [5, 7],
      sections: ['A'],
      permissions: {
        attendance: true,
        assignments: true,
        materials: true,
        examinations: true,
        marks: true,
        questionPapers: true,
      },
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingFaculty(fac);
    setFormData({
      name: fac.user?.name || '',
      username: fac.user?.username || '',
      email: fac.user?.email || '',
      department: fac.department || 'Computer Science & Engineering',
      position: fac.position || 'Assistant Professor',
      password: '',
      semesters: fac.semesters || [5, 7],
      sections: fac.sections || ['A'],
      permissions: {
        attendance: Boolean(fac.permissions?.attendance),
        assignments: Boolean(fac.permissions?.assignments),
        materials: Boolean(fac.permissions?.materials),
        examinations: Boolean(fac.permissions?.examinations),
        marks: Boolean(fac.permissions?.marks),
        questionPapers: Boolean(fac.permissions?.questionPapers),
      },
      status: fac.user?.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSaveFaculty = async (e) => {
    if (e) e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingFaculty) {
        const res = await adminService.updateFaculty(editingFaculty._id, formData);
        if (res && res.success) {
          setSuccess(`Faculty profile ${formData.name} updated.`);
          setIsModalOpen(false);
          fetchFaculty();
        }
      } else {
        const res = await adminService.createFaculty(formData);
        if (res && res.success) {
          setSuccess(`Faculty member appointed! Username: ${res.faculty?.user?.username} (Password: ${res.temporaryPassword})`);
          setIsModalOpen(false);
          fetchFaculty();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save faculty record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaculty) return;
    setDeleteLoading(true);
    try {
      const res = await adminService.deleteFaculty(deletingFaculty._id);
      if (res && res.success) {
        setSuccess('Faculty record removed.');
        setDeletingFaculty(null);
        fetchFaculty();
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredFaculty = facultyList.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (f.user?.name || '').toLowerCase();
    const email = (f.user?.email || '').toLowerCase();
    const dept = (f.department || '').toLowerCase();
    return name.includes(q) || email.includes(q) || dept.includes(q);
  });

  const columns = [
    {
      key: 'name',
      header: 'Faculty Member',
      render: (_, r) => (
        <div>
          <p className="font-bold text-[#111827] text-xs">{r.user?.name || 'Faculty Member'}</p>
          <p className="text-[11px] text-[#4B5563] font-mono flex items-center gap-1">
            <Mail className="w-3 h-3 text-[#D99A00]" />
            {r.user?.email}
          </p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department & Designation',
      render: (v, r) => (
        <div>
          <p className="font-bold text-[#111827] text-xs">{v}</p>
          <p className="text-[11px] text-[#4B5563] font-medium">{r.position || 'Faculty'}</p>
        </div>
      ),
    },
    {
      key: 'semesters',
      header: 'Teaching Semesters',
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {(v || []).length > 0 ? (
            v.map((s) => (
              <Badge key={s} variant="teal" size="sm">Sem {s}</Badge>
            ))
          ) : (
            <span className="text-[11px] text-[#4B5563]">All Assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Authorized Academic Powers',
      render: (p) => (
        <div className="flex flex-wrap gap-1 text-[10px]">
          {p?.attendance && <span className="px-1.5 py-0.5 rounded bg-[#FFF8E6] text-[#D99A00] font-bold border border-[#D99A00]/30">Attendance</span>}
          {p?.assignments && <span className="px-1.5 py-0.5 rounded bg-[#FFF8E6] text-[#D99A00] font-bold border border-[#D99A00]/30">Assignments</span>}
          {p?.marks && <span className="px-1.5 py-0.5 rounded bg-[#FFF8E6] text-[#D99A00] font-bold border border-[#D99A00]/30">Marks Entry</span>}
          {p?.examinations && <span className="px-1.5 py-0.5 rounded bg-[#FFF8E6] text-[#D99A00] font-bold border border-[#D99A00]/30">Exams</span>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, r) => (
        <Badge variant={r.user?.status === 'active' ? 'success' : 'neutral'} size="sm">
          {r.user?.status || 'Active'}
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
            Edit Profile
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="text-xs"
            leftIcon={<Trash2 className="w-3 h-3" />}
            onClick={() => setDeletingFaculty(r)}
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
          title="Faculty Management Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      <Card
        title="Teaching Faculty Roster & Department Governance"
        subtitle="Manage faculty credentials, academic instruction responsibilities, and portal permissions"
        badge={<Badge variant="info" size="sm">{facultyList.length} Faculty</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={handleOpenAdd}
          >
            Appoint New Faculty
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#D99A00] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by faculty name, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFDF5] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchFaculty}
            >
              Refresh Roster
            </Button>
          </div>

          <Table
            columns={columns}
            data={filteredFaculty}
            keyField="_id"
            isLoading={loading}
            emptyMessage="No faculty records match your search criteria."
          />
        </div>
      </Card>

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? `Edit Faculty: ${editingFaculty.user?.name}` : 'Appoint New Faculty Member'}
        description="Creates faculty credentials, academic instruction responsibilities, and permissions in MongoDB"
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
              onClick={handleSaveFaculty}
            >
              {editingFaculty ? 'Save Changes' : 'Appoint & Provision Credentials'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveFaculty} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Full Name & Title"
                type="text"
                placeholder="e.g. Dr. Rajiv Menon"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Institutional Email"
                type="email"
                placeholder="e.g. rajiv.menon@campusverse.edu"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                disabled={Boolean(editingFaculty)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Department <span className="text-[#D99A00]">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-[#F1E7CF] bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#D99A00] focus:ring-1 focus:ring-[#D99A00] font-medium"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d.name}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Designation / Position"
                type="text"
                placeholder="e.g. Associate Professor & Lab Head"
                value={formData.position}
                onChange={(e) => setFormData((p) => ({ ...p, position: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-2">
              Authorized Portal Permissions
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#FFFDF5] border border-[#F1E7CF] rounded-lg text-xs font-medium text-[#111827]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.attendance}
                  onChange={(e) => setFormData((p) => ({ ...p, permissions: { ...p.permissions, attendance: e.target.checked } }))}
                  className="rounded text-[#D99A00] focus:ring-[#D99A00]"
                />
                <span>Attendance Entry</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.assignments}
                  onChange={(e) => setFormData((p) => ({ ...p, permissions: { ...p.permissions, assignments: e.target.checked } }))}
                  className="rounded text-[#D99A00] focus:ring-[#D99A00]"
                />
                <span>Post Assignments</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.marks}
                  onChange={(e) => setFormData((p) => ({ ...p, permissions: { ...p.permissions, marks: e.target.checked } }))}
                  className="rounded text-[#D99A00] focus:ring-[#D99A00]"
                />
                <span>Enter Marks & Grades</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.examinations}
                  onChange={(e) => setFormData((p) => ({ ...p, permissions: { ...p.permissions, examinations: e.target.checked } }))}
                  className="rounded text-[#D99A00] focus:ring-[#D99A00]"
                />
                <span>Schedule Exams</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.materials}
                  onChange={(e) => setFormData((p) => ({ ...p, permissions: { ...p.permissions, materials: e.target.checked } }))}
                  className="rounded text-[#D99A00] focus:ring-[#D99A00]"
                />
                <span>Upload Materials</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permissions.questionPapers}
                  onChange={(e) => setFormData((p) => ({ ...p, permissions: { ...p.permissions, questionPapers: e.target.checked } }))}
                  className="rounded text-[#D99A00] focus:ring-[#D99A00]"
                />
                <span>Question Papers</span>
              </label>
            </div>
          </div>

          {!editingFaculty && (
            <div>
              <Input
                label="Initial Account Password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                placeholder="Default: Faculty@Campus2026"
              />
              <p className="text-[11px] text-[#4B5563] mt-1">
                Faculty will log in to the Faculty Portal with this password.
              </p>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deletingFaculty)}
        onClose={() => setDeletingFaculty(null)}
        title="Remove Faculty Member"
        description="Are you sure you want to remove this faculty member from active teaching duty?"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeletingFaculty(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={deleteLoading}
              disabled={deleteLoading}
              onClick={handleDelete}
            >
              Confirm Removal
            </Button>
          </div>
        }
      >
        {deletingFaculty && (
          <div className="p-3 bg-[#FFF8E6]/30 border border-[#F1E7CF] rounded-lg text-xs text-[#111827]">
            <p><strong>Faculty:</strong> {deletingFaculty.user?.name}</p>
            <p><strong>Department:</strong> {deletingFaculty.department}</p>
            <p className="mt-2 text-[11px] text-[#4B5563]">
              Their user login account will be disabled in the system.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminFaculty;
