import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { AlertBanner } from '../../components/common/AlertBanner';
import { studentService, apiClient } from '../../services/api';
import { useAuth } from '../../utils/auth';

export const StudentManagementList = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // expects { role: 'admin', ... }

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', semester: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Fetch departments for filter dropdown (once)
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiClient.get('/departments');
        setDepartments(res.data || []);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch student list whenever query changes
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
        };
        if (search) params.search = search;
        if (filters.department) params.department = filters.department;
        if (filters.semester) params.semester = filters.semester;
        if (filters.status) params.status = filters.status;
        const res = await studentService.listStudents(params);
        setStudents(res.data || []);
        const { total, totalPages } = res.pagination || {};
        setPagination((prev) => ({ ...prev, total: total || 0, totalPages: totalPages || 1 }));
      } catch (err) {
        setError(err.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [search, filters, pagination.page, pagination.limit]);

  const columns = [
    { header: 'Student ID', accessor: 'studentId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Department', accessor: (row) => row.department?.name || '' },
    { header: 'Semester', accessor: 'semester' },
    { header: 'Enrollment Year', accessor: 'enrollmentYear' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/students/${row._id}`)}>
            View
          </Button>
          {user && (user.role === 'admin' || user.role === 'super-admin') && (
            <Button size="sm" onClick={() => navigate(`/admin/students/${row._id}/edit`)}>
              Edit
            </Button>
          )}
        </div>
      ),
      render: (value) => value,
    },
  ];

  const handleAddStudent = () => {
    navigate('/admin/students/add');
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    setPagination((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#102A43]">Student Management</h1>
          <p className="text-xs text-[#102A43]/70 mt-0.5">View and manage enrolled student directories</p>
        </div>
        {user && (user.role === 'admin' || user.role === 'super-admin') && (
          <Button onClick={handleAddStudent}>Add Student</Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Input placeholder="Search by name, ID, or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select
          placeholder="All Departments"
          options={[{ label: 'All', value: '' }, ...departments.map((d) => ({ label: d.name, value: d._id }))]}
          value={filters.department}
          onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
        />
        <Select
          placeholder="All Semesters"
          options={[{ label: 'All', value: '' }, ...Array.from({ length: 12 }, (_, i) => ({ label: `Sem ${i + 1}`, value: i + 1 }))]}
          value={filters.semester}
          onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))}
        />
        <Select
          placeholder="All Statuses"
          options={[{ label: 'All', value: '' }, { label: 'Active', value: 'Active' }, { label: 'Graduated', value: 'Graduated' }, { label: 'Suspended', value: 'Suspended' }, { label: 'On Leave', value: 'On Leave' }]}
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
        />
        <Select
          placeholder="Rows per page"
          options={[10, 20, 50].map((v) => ({ label: `${v}`, value: v }))}
          value={pagination.limit}
          onChange={handleLimitChange}
        />
      </div>

      {loading && <LoadingSpinner />}
      {error && <AlertBanner type="error" message={error} />}
      {!loading && !error && students.length === 0 && <EmptyState message="No students found." />}

      {!loading && !error && students.length > 0 && (
        <>
          <Table columns={columns} data={students} keyField="_id" />
          <div className="flex justify-between items-center mt-4">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <div className="flex gap-2">
              <Button size="sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
                Prev
              </Button>
              <Button size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
