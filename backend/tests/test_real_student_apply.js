const API = 'http://localhost:5001/api';

async function test() {
  try {
    console.log('1. Logging in as studentdemo...');
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'studentdemo',
        password: 'Student@2026',
        portalRole: 'student',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login success:', loginData.success);
    const token = loginData.token;
    console.log('User role:', loginData.user?.role, 'Email:', loginData.user?.email);

    console.log('\n2. Fetching eligible placement drives...');
    const drivesRes = await fetch(`${API}/placement/eligible-drives`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const drivesData = await drivesRes.json();
    console.log('Drives count:', drivesData.count);
    const drives = drivesData.drives || [];

    console.log('\n3. Fetching existing student applications...');
    const appsRes = await fetch(`${API}/placement/my-applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appsData = await appsRes.json();
    console.log('Existing applications count:', (appsData.applications || []).length);
    const existingDriveIds = new Set((appsData.applications || []).map(a => (a.drive?._id || a.drive || '').toString()));

    for (const d of drives) {
      console.log(`\nDrive: ${d.companyName} (${d.jobTitle}) - ID: ${d._id}`);
      console.log(`Status: ${d.status} | DeadlineStatus: ${d.deadlineStatus} | Deadline: ${d.applicationDeadline}`);
      console.log(`Already applied?: ${existingDriveIds.has(d._id.toString())}`);

      if (d.deadlineStatus !== 'Deadline Expired' && d.status === 'Registration Open' && !existingDriveIds.has(d._id.toString())) {
        console.log(`-> Testing application submission for open drive ${d.companyName}...`);

        const form = new FormData();
        form.append('driveId', d._id.toString());
        form.append('coverNote', 'Testing submission from student portal');
        const fileBlob = new Blob(['%PDF-1.4 Real Student Resume Simulation\n%%EOF'], { type: 'application/pdf' });
        form.append('resume', fileBlob, 'Student_Resume_Test.pdf');

        const applyRes = await fetch(`${API}/placement/applications`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });
        const applyData = await applyRes.json();
        console.log('-> Apply HTTP status:', applyRes.status);
        console.log('-> Apply result:', applyData);
        break; // test one
      }
    }
  } catch (err) {
    console.error('Fatal error:', err);
  }
}

test();
