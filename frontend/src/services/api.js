import axios from 'axios';

/**
 * CampusVerse AI - Central Axios API Client
 * Configured for Part 2 Node.js/Express (Port 5001) + MongoDB authentication and session management.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage if present
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Storage access may be restricted in private browsing
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardized error parsing
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorResponse = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
      data: error.response?.data || null,
      errors: error.response?.data?.errors || null,
    };
    return Promise.reject(errorResponse);
  }
);

/**
 * Multi-Role Authentication Service
 */
export const authService = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  forgotPassword: async (payload) => {
    return apiClient.post('/auth/forgot-password', payload);
  },
  resetPassword: async (payload) => {
    return apiClient.post('/auth/reset-password', payload);
  },
  changePassword: async (payload) => {
    return apiClient.post('/auth/change-password', payload);
  },
};

export const studentService = {
  // Admin: list all students
  listStudents: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/students?${queryString}` : '/students';
    return apiClient.get(url);
  },
  // Get all students (alias for listStudents with graceful fallbacks)
  getAll: async (params = {}) => {
    try {
      const res = await apiClient.get('/staff/students', { params });
      if (res && res.success && res.students) {
        return { success: true, data: res.students };
      }
    } catch (e) {}
    try {
      const res = await apiClient.get('/students', { params });
      return { success: true, data: res.data || res.students || [] };
    } catch (e) {
      return { success: true, data: [] };
    }
  },
  // Admin: get any student by ID/rollNumber
  getProfile: async (studentId) => {
    return apiClient.get(`/students/${studentId}`);
  },
  // Student: get own profile (merged with metadata)
  getMyProfile: async () => {
    return apiClient.get('/students/me');
  },
  // Student: update own editable metadata
  updateMyProfile: async (data) => {
    return apiClient.patch('/students/me', data);
  },
  // Legacy helper stubs (not backed by routes yet, return null gracefully)
  getAttendance: async (studentId) => {
    return apiClient.get(`/students/${studentId}/attendance`).catch(() => null);
  },
  getCourses: async (studentId) => {
    return apiClient.get(`/students/${studentId}/courses`).catch(() => null);
  },
  getTimetable: async (studentId) => {
    return apiClient.get(`/students/${studentId}/timetable`).catch(() => null);
  },
  getAssignments: async (studentId) => {
    return apiClient.get(`/students/${studentId}/assignments`).catch(() => null);
  },
  getFees: async (studentId) => {
    return apiClient.get(`/students/${studentId}/fees`).catch(() => null);
  },
};

export const resultService = {
  // List results - students see own published results, faculty/admin see all
  list: async (params = {}) => {
    return apiClient.get('/results', { params });
  },
  create: async (data) => apiClient.post('/results', data),
  update: async (id, data) => apiClient.patch(`/results/${id}`, data),
  remove: async (id) => apiClient.delete(`/results/${id}`),
};

export const feeService = {
  // Students see own fees, admins see all
  list: async (params = {}) => {
    return apiClient.get('/fees', { params });
  },
  get: async (id) => apiClient.get(`/fees/${id}`),
  create: async (data) => apiClient.post('/fees', data),
  update: async (id, data) => apiClient.patch(`/fees/${id}`, data),
  remove: async (id) => apiClient.delete(`/fees/${id}`),
};

export const assignmentSubmissionService = {
  // Get submissions for a specific assignment (faculty/admin)
  listForAssignment: async (assignmentId) => apiClient.get(`/submissions?assignment=${assignmentId}`),
  // Submit an assignment (student)
  submit: async (data) => apiClient.post('/submissions', data),
  // Update submission (faculty grading)
  update: async (id, data) => apiClient.patch(`/submissions/${id}`, data),
};

export const facultyService = {
  // Profile
  getMyProfile: () => apiClient.get('/faculty/me'),
  updateMyProfile: (data) => apiClient.patch('/faculty/me', data),

  // Student Management
  getAssignedStudents: (params = {}) => apiClient.get('/faculty/students', { params }),
  getStudentProfile: (id) => apiClient.get(`/faculty/students/${id}`),

  // Attendance
  getAttendanceRecords: (params = {}) => apiClient.get('/faculty/attendance', { params }),
  markAttendance: (data) => apiClient.post('/faculty/attendance', data),
  editAttendance: (id, data) => apiClient.patch(`/faculty/attendance/${id}`, data),

  // Assignments
  getMyAssignments: () => apiClient.get('/faculty/assignments'),
  createAssignment: (data) => apiClient.post('/faculty/assignments', data),
  getSubmissions: (assignmentId) => apiClient.get(`/faculty/assignments/${assignmentId}/submissions`),
  giveFeedback: (submissionId, data) => apiClient.patch(`/faculty/submissions/${submissionId}/feedback`, data),

  // Exams
  getMyExams: () => apiClient.get('/faculty/exams'),
  scheduleExam: (data) => apiClient.post('/faculty/exams', data),
  updateExam: (id, data) => apiClient.patch(`/faculty/exams/${id}`, data),

  // Results
  getMyResults: () => apiClient.get('/faculty/results'),
  enterResult: (data) => apiClient.post('/faculty/results', data),
  updateResult: (id, data) => apiClient.patch(`/faculty/results/${id}`, data),

  // Timetable
  getMyTimetable: () => apiClient.get('/faculty/timetable'),

  // Leave
  getMyLeaves: () => apiClient.get('/faculty/leaves'),
  applyLeave: (data) => apiClient.post('/faculty/leaves', data),
  cancelLeave: (id) => apiClient.delete(`/faculty/leaves/${id}`),

  // Notices
  getNotices: () => apiClient.get('/faculty/notices'),
  createNotice: (data) => apiClient.post('/faculty/notices', data),

  // Legacy stubs kept for backward compat
  getAssignedCourses: (facultyId) => apiClient.get(`/faculty/${facultyId}/courses`).catch(() => null),
  recordAttendance: (courseId, payload) => apiClient.post(`/faculty/courses/${courseId}/attendance`, payload).catch(() => null),
  submitMarks: (courseId, payload) => apiClient.post(`/faculty/courses/${courseId}/marks`, payload).catch(() => null),
};

export const adminService = {
  getStats: async () => apiClient.get('/admin/stats'),
  getUsers: async (params = {}) => apiClient.get('/admin/users', { params }),
  getUser: async (id) => apiClient.get(`/admin/users/${id}`),
  createUser: async (userData) => apiClient.post('/admin/users', userData),
  createCredentials: async (credentialsData) => apiClient.post('/admin/credentials', credentialsData),
  updateUser: async (id, data) => apiClient.patch(`/admin/users/${id}`, data),
  updateStatus: async (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }),
  resetPassword: async (id, password) => apiClient.post(`/admin/users/${id}/reset-password`, { password }),
  forcePasswordChange: async (id) => apiClient.post(`/admin/users/${id}/force-password-change`),
  getAuditLogs: async (params = {}) => apiClient.get('/admin/audit-logs', { params }),

  // Student Management
  getStudents: async (params = {}) => apiClient.get('/admin/students', { params }),
  createStudent: async (data) => apiClient.post('/admin/students', data),
  updateStudent: async (id, data) => apiClient.patch(`/admin/students/${id}`, data),
  deleteStudent: async (id) => apiClient.delete(`/admin/students/${id}`),

  // Faculty Management
  getFaculty: async () => apiClient.get('/admin/faculty'),
  createFaculty: async (data) => apiClient.post('/admin/faculty', data),
  updateFaculty: async (id, data) => apiClient.patch(`/admin/faculty/${id}`, data),
  deleteFaculty: async (id) => apiClient.delete(`/admin/faculty/${id}`),

  // Academic Management
  getDepartments: async () => apiClient.get('/admin/departments'),
  createDepartment: async (data) => apiClient.post('/admin/departments', data),
  updateDepartment: async (id, data) => apiClient.patch(`/admin/departments/${id}`, data),
  deleteDepartment: async (id) => apiClient.delete(`/admin/departments/${id}`),

  getCourses: async (params = {}) => apiClient.get('/admin/courses', { params }),
  createCourse: async (data) => apiClient.post('/admin/courses', data),
  updateCourse: async (id, data) => apiClient.patch(`/admin/courses/${id}`, data),
  deleteCourse: async (id) => apiClient.delete(`/admin/courses/${id}`),

  // Attendance Management
  getAttendance: async (params = {}) => apiClient.get('/admin/attendance', { params }),
  getAttendanceShortages: async () => apiClient.get('/admin/attendance/shortages'),
  correctAttendance: async (attendanceId, recordId, data) =>
    apiClient.patch(`/admin/attendance/${attendanceId}/records/${recordId}`, data),

  // Assignments, Examinations & Results
  getAssignments: async () => apiClient.get('/admin/assignments'),
  getExams: async () => apiClient.get('/admin/exams'),
  createExam: async (data) => apiClient.post('/admin/exams', data),
  updateExam: async (id, data) => apiClient.patch(`/admin/exams/${id}`, data),
  deleteExam: async (id) => apiClient.delete(`/admin/exams/${id}`),

  getResults: async (params = {}) => apiClient.get('/admin/results', { params }),
  createResult: async (data) => apiClient.post('/admin/results', data),
  updateResult: async (id, data) => apiClient.patch(`/admin/results/${id}`, data),
  togglePublishResult: async (id) => apiClient.patch(`/admin/results/${id}/publish`),
  deleteResult: async (id) => apiClient.delete(`/admin/results/${id}`),

  // Fees Management
  getFeeSummary: async () => apiClient.get('/admin/fees/summary'),
  getFees: async (params = {}) => apiClient.get('/admin/fees', { params }),
  createFee: async (data) => apiClient.post('/admin/fees', data),
  updateFee: async (id, data) => apiClient.patch(`/admin/fees/${id}`, data),
  deleteFee: async (id) => apiClient.delete(`/admin/fees/${id}`),

  // Timetable, Notices & Leaves
  getTimetables: async (params = {}) => apiClient.get('/admin/timetables', { params }),
  createTimetable: async (data) => apiClient.post('/admin/timetables', data),
  deleteTimetable: async (id) => apiClient.delete(`/admin/timetables/${id}`),

  getNotices: async () => apiClient.get('/admin/notices'),
  createNotice: async (data) => apiClient.post('/admin/notices', data),
  updateNotice: async (id, data) => apiClient.patch(`/admin/notices/${id}`, data),
  deleteNotice: async (id) => apiClient.delete(`/admin/notices/${id}`),

  getLeaves: async (params = {}) => apiClient.get('/admin/leaves', { params }),
  updateLeaveStatus: async (id, data) => apiClient.patch(`/admin/leaves/${id}/status`, data),

  // Reports & Settings
  getReportData: async (type) => apiClient.get('/admin/reports', { params: { type } }),
  getSettings: async () => apiClient.get('/admin/settings'),
};

export const superAdminService = {
  getSystemHealth: async () => {
    return apiClient.get('/superadmin/health');
  },
  getAuditLogs: async () => {
    return apiClient.get('/superadmin/audit-logs');
  },
  listUsers: async () => {
    return apiClient.get('/superadmin/users');
  },
  updateUserStatus: async (id, status) => {
    return apiClient.patch(`/superadmin/users/${id}/status`, { status });
  },
};

export const parentService = {
  getDashboard: async (params = {}) => apiClient.get('/parent/dashboard', { params }),
  getStudentInfo: async (params = {}) => apiClient.get('/parent/student', { params }),
  getAttendanceAndResults: async (params = {}) => apiClient.get('/parent/attendance-and-results', { params }),
  getAssignmentsAndTimetable: async (params = {}) => apiClient.get('/parent/assignments-and-timetable', { params }),
  getFees: async (params = {}) => apiClient.get('/parent/fees', { params }),
  getNotices: async (params = {}) => apiClient.get('/parent/notices', { params }),
  getWards: async () => apiClient.get('/parent/wards'),
};

export const staffService = {
  getDashboard: async () => apiClient.get('/staff/dashboard'),
  getHostelRooms: async (params = {}) => apiClient.get('/staff/hostel/rooms', { params }),
  createHostelRoom: async (data) => apiClient.post('/staff/hostel/rooms', data),
  updateHostelRoom: async (id, data) => apiClient.put(`/staff/hostel/rooms/${id}`, data),
  getHostelAllocations: async () => apiClient.get('/staff/hostel/allocations'),
  allocateHostelBed: async (data) => apiClient.post('/staff/hostel/allocate', data),
  vacateHostelBed: async (id) => apiClient.put(`/staff/hostel/vacate/${id}`),
  getTransportVehicles: async () => apiClient.get('/staff/transport/vehicles'),
  createTransportVehicle: async (data) => apiClient.post('/staff/transport/vehicles', data),
  updateTransportVehicle: async (id, data) => apiClient.put(`/staff/transport/vehicles/${id}`, data),
  getTransportRoutes: async () => apiClient.get('/staff/transport/routes'),
  createTransportRoute: async (data) => apiClient.post('/staff/transport/routes', data),
  updateTransportRoute: async (id, data) => apiClient.put(`/staff/transport/routes/${id}`, data),
  getTransportAllocations: async () => apiClient.get('/staff/transport/allocations'),
  allocateTransportPass: async (data) => apiClient.post('/staff/transport/allocate', data),
  getStudentRecords: async (params = {}) => apiClient.get('/staff/students', { params }),
  getComplaints: async (params = {}) => apiClient.get('/staff/complaints', { params }),
  createComplaint: async (data) => apiClient.post('/staff/complaints', data),
  updateComplaint: async (id, data) => apiClient.put(`/staff/complaints/${id}`, data),
  getNotices: async () => apiClient.get('/staff/notices'),
  createNotice: async (data) => apiClient.post('/staff/notices', data),
};

export const placementService = {
  getDashboard: async () => apiClient.get('/placement/dashboard'),
  getCompanies: async (params = {}) => apiClient.get('/placement/companies', { params }),
  createCompany: async (data) => apiClient.post('/placement/companies', data),
  updateCompany: async (id, data) => apiClient.put(`/placement/companies/${id}`, data),
  getDrives: async (params = {}) => apiClient.get('/placement/drives', { params }),
  createDrive: async (data) => apiClient.post('/placement/drives', data),
  updateDrive: async (id, data) => apiClient.put(`/placement/drives/${id}`, data),
  getStudents: async (params = {}) => apiClient.get('/placement/students', { params }),
  updateStudentProfile: async (id, data) => apiClient.put(`/placement/students/${id}`, data),
  getApplications: async (params = {}) => apiClient.get('/placement/applications', { params }),
  createApplication: async (data) => apiClient.post('/placement/applications', data),
  updateApplication: async (id, data) => apiClient.put(`/placement/applications/${id}`, data),
  getNotices: async (params = {}) => apiClient.get('/placement/notices', { params }),
  createNotice: async (data) => apiClient.post('/placement/notices', data),
};

export default apiClient;
