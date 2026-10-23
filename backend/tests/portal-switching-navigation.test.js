const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// Replicate the pure resolution logic matching UnauthorizedPage.jsx
function resolvePortalLoginPath(candidate) {
  if (!candidate) return '';
  const str = String(candidate).trim().toLowerCase();
  if (str.startsWith('/login/')) {
    const segment = str.split('?')[0].split('#')[0];
    if (segment === '/login/staff' || segment === '/login/hostel') return '/login/hostel';
    return segment;
  }
  if (str.includes('/faculty') || str === 'faculty') return '/login/faculty';
  if (str.includes('/admin') || str === 'admin' || str === 'superadmin') return '/login/admin';
  if (str.includes('/parent') || str === 'parent') return '/login/parent';
  if (str.includes('/placement') || str === 'placement') return '/login/placement';
  if (str.includes('/hostel') || str.includes('/staff') || str === 'hostel' || str === 'staff') return '/login/hostel';
  if (str.includes('/student') || str === 'student') return '/login/student';
  return '';
}

function getTargetLoginPath(locationState, sessionStorageMap = {}) {
  // 1. Check navigation state passed by ProtectedRoute or Topbar
  const fromState =
    resolvePortalLoginPath(locationState?.portalLogin) ||
    resolvePortalLoginPath(locationState?.targetPortal) ||
    resolvePortalLoginPath(locationState?.attemptedPath);
  if (fromState) return fromState;

  // 2. Check sessionStorage
  const stored = sessionStorageMap['campusverse_selected_portal'];
  const fromStored = resolvePortalLoginPath(stored);
  if (fromStored) return fromStored;

  // Fallback: Default directly to student portal login instead of directory
  return '/login/student';
}

describe('CampusVerse AI - Portal Switching Navigation Suite', () => {
  it('1. Should resolve Faculty Dashboard selection to /login/faculty directly', () => {
    // Topbar link click sets state & sessionStorage
    const state = { targetPortal: 'faculty', portalLogin: '/login/faculty', attemptedPath: '/faculty' };
    const target = getTargetLoginPath(state);
    assert.equal(target, '/login/faculty');
    assert.notEqual(target, '/login');
  });

  it('2. Should resolve Administrator Dashboard selection to /login/admin directly', () => {
    const state = { targetPortal: 'admin', portalLogin: '/login/admin', attemptedPath: '/admin' };
    const target = getTargetLoginPath(state);
    assert.equal(target, '/login/admin');
    assert.notEqual(target, '/login');
  });

  it('3. Should resolve Parent Portal selection to /login/parent directly', () => {
    const state = { targetPortal: 'parent', portalLogin: '/login/parent', attemptedPath: '/parent' };
    const target = getTargetLoginPath(state);
    assert.equal(target, '/login/parent');
    assert.notEqual(target, '/login');
  });

  it('4. Should resolve Placement Cell selection to /login/placement directly', () => {
    const state = { targetPortal: 'placement', portalLogin: '/login/placement', attemptedPath: '/placement' };
    const target = getTargetLoginPath(state);
    assert.equal(target, '/login/placement');
    assert.notEqual(target, '/login');
  });

  it('5. Should resolve Hostel Portal selection to /login/hostel directly', () => {
    const state = { targetPortal: 'hostel', portalLogin: '/login/hostel', attemptedPath: '/hostel' };
    const target = getTargetLoginPath(state);
    assert.equal(target, '/login/hostel');
    assert.notEqual(target, '/login');
  });

  it('6. Should resolve Student Portal selection to /login/student directly', () => {
    const state = { targetPortal: 'student', portalLogin: '/login/student', attemptedPath: '/student' };
    const target = getTargetLoginPath(state);
    assert.equal(target, '/login/student');
    assert.notEqual(target, '/login');
  });

  it('7. Should recover target portal from sessionStorage if state was somehow cleared', () => {
    const emptyState = {};
    const sessionStorageMap = { campusverse_selected_portal: '/login/admin' };
    const target = getTargetLoginPath(emptyState, sessionStorageMap);
    assert.equal(target, '/login/admin');
  });

  it('8. Should recover from attempted sub-paths like /admin/fees or /student/admit-card', () => {
    const state1 = { attemptedPath: '/admin/fees' };
    assert.equal(getTargetLoginPath(state1), '/login/admin');

    const state2 = { attemptedPath: '/student/admit-card' };
    assert.equal(getTargetLoginPath(state2), '/login/student');

    const state3 = { attemptedPath: '/faculty/attendance' };
    assert.equal(getTargetLoginPath(state3), '/login/faculty');
  });

  it('9. Must NEVER redirect to the all-portals overview directory (/login)', () => {
    const allPortals = ['student', 'faculty', 'admin', 'parent', 'placement', 'hostel'];
    for (const portal of allPortals) {
      const state = { targetPortal: portal, attemptedPath: `/${portal}` };
      const resolved = getTargetLoginPath(state);
      assert.notEqual(resolved, '/login', `Portal ${portal} must not redirect to /login`);
      assert.ok(resolved.startsWith('/login/'), `Portal ${portal} must redirect to /login/<portal>`);
    }
  });
});
