const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
  PARENT: 'parent',
  PLACEMENT: 'placement',
  STAFF: 'staff',
  SUPERADMIN: 'superadmin',
  // Backward-compatibility aliases
  PLACEMENT_OFFICER: 'placement',
  SUPER_ADMIN: 'superadmin',
};

const ALLOWED_ROLES = [
  ROLES.STUDENT,
  ROLES.FACULTY,
  ROLES.ADMIN,
  ROLES.PARENT,
  ROLES.PLACEMENT,
  ROLES.STAFF,
  ROLES.SUPERADMIN,
];

module.exports = {
  ...ROLES,
  ROLES,
  ALLOWED_ROLES,
};

