const http = require('http');

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method: 'GET',
      headers,
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  console.log('\n=== CampusVerse Live E2E Multi-Role Auth Verification ===\n');

  // Test 1: Admin login on Admin Console
  console.log('[Test 1] Administrator Login on Admin Console');
  const adminRes = await post('/api/auth/login', {
    email: 'admin@campusverse.edu',
    password: 'CampusAdmin@2026',
    portalRole: 'admin',
  });
  console.log(`         Status : ${adminRes.status}`);
  console.log(`         User   : ${adminRes.body.user?.email} (${adminRes.body.user?.role})`);
  console.log(`         Token  : ${adminRes.body.token ? 'Issued (JWT)' : 'None'}`);

  if (adminRes.status !== 200 || adminRes.body.user?.role !== 'admin') {
    console.error('FAILED Test 1');
    process.exit(1);
  }

  // Test 2: Case 3 - Admin credentials on Student Portal
  console.log('\n[Test 2] CASE 3: Admin credentials on Student Portal (Must Reject)');
  const case3Res = await post('/api/auth/login', {
    email: 'admin@campusverse.edu',
    password: 'CampusAdmin@2026',
    portalRole: 'student',
  });
  console.log(`         Status : ${case3Res.status}`);
  console.log(`         Error  : ${case3Res.body.error}`);
  if (case3Res.status !== 403 || !case3Res.body.error.includes('Student Portal')) {
    console.error('FAILED Test 2');
    process.exit(1);
  }

  // Test 3: Case 4 - Student credentials on Administrator Console
  console.log('\n[Test 3] CASE 4: Student credentials on Administrator Console (Must Reject)');
  const case4Res = await post('/api/auth/login', {
    email: 'student@campusverse.edu',
    password: 'Student@2026',
    portalRole: 'admin',
  });
  console.log(`         Status : ${case4Res.status}`);
  console.log(`         Error  : ${case4Res.body.error}`);
  if (case4Res.status !== 403 || !case4Res.body.error.includes('Administrator Console')) {
    console.error('FAILED Test 3');
    process.exit(1);
  }

  // Test 4: Superadmin Login and Protected API access
  console.log('\n[Test 4] Super Admin Login & Guarded API Verification');
  const saRes = await post('/api/auth/login', {
    email: 'superadmin@campusverse.edu',
    password: 'SuperAdmin@2026',
    portalRole: 'superadmin',
  });
  console.log(`         Status : ${saRes.status}`);
  console.log(`         User   : ${saRes.body.user?.email} (${saRes.body.user?.role})`);

  const saHealth = await get('/api/superadmin/health', {
    Authorization: `Bearer ${saRes.body.token}`,
  });
  console.log(`         Superadmin Health API Status : ${saHealth.status}`);
  console.log(`         Accounts in DB               : ${saHealth.body.userTelemetry?.totalAccounts}`);

  // Test 5: Admin Token trying to access Superadmin API
  console.log('\n[Test 5] Normal Admin Token Accessing Superadmin API (Must Reject with 403)');
  const adminToSa = await get('/api/superadmin/health', {
    Authorization: `Bearer ${adminRes.body.token}`,
  });
  console.log(`         Status : ${adminToSa.status} (Expected 403)`);
  if (adminToSa.status !== 403) {
    console.error('FAILED Test 5');
    process.exit(1);
  }

  console.log('\n✅ ALL LIVE VERIFICATION CHECKS PASSED!\n');
})();
