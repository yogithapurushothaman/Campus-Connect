// Comprehensive integration test for RBAC and Event Feed

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Starting RBAC and Event Feed Integration Tests...\n');

  // Test 1: Register Staff User
  console.log('1️⃣ Testing Staff Registration...');
  const staffEmail = `prof.vikram.${Date.now()}@campus.edu`;
  const staffSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Vikram Sen',
      email: staffEmail,
      password: 'password123',
      role: 'STAFF',
    }),
  });

  const staffSignupData = await staffSignupRes.json();
  const staffCookie = staffSignupRes.headers.get('set-cookie');
  console.log('Staff Signup Status:', staffSignupRes.status);
  console.log('Staff Signup Response:', staffSignupData);
  console.log('Staff Cookie Received:', !!staffCookie);

  if (staffSignupRes.status !== 201 || staffSignupData.user.role !== 'STAFF') {
    throw new Error('Staff registration failed');
  }

  // Test 2: Staff Creates Event
  console.log('\n2️⃣ Testing Staff Event Creation...');
  const createEventRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: staffCookie || '',
    },
    body: JSON.stringify({
      title: 'National AI & Cloud Hackathon 2026',
      description: 'Grand 48-hour inter-college AI hackathon with prizes up to 5 Lakhs.',
      date: 'Oct 15-17, 2026 • 09:00 AM',
      category: 'Hackathon',
      locationName: 'Main Campus Innovation Hub',
    }),
  });

  const createEventData = await createEventRes.json();
  console.log('Create Event Status:', createEventRes.status);
  console.log('Create Event Response:', createEventData);

  if (createEventRes.status !== 201 || !createEventData.event.id) {
    throw new Error('Staff event creation failed');
  }

  // Test 3: Register Student User
  console.log('\n3️⃣ Testing Student Registration...');
  const studentEmail = `ananya.${Date.now()}@campus.edu`;
  const studentSignupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ananya Sharma',
      email: studentEmail,
      password: 'password123',
      role: 'STUDENT',
    }),
  });

  const studentSignupData = await studentSignupRes.json();
  const studentCookie = studentSignupRes.headers.get('set-cookie');
  console.log('Student Signup Status:', studentSignupRes.status);
  console.log('Student Signup Response:', studentSignupData);
  console.log('Student Cookie Received:', !!studentCookie);

  if (studentSignupRes.status !== 201 || studentSignupData.user.role !== 'STUDENT') {
    throw new Error('Student registration failed');
  }

  // Test 4: Student Attempts to Post Event (RBAC Security Test)
  console.log('\n4️⃣ Testing RBAC Security: Student Attempts to Create Event (Expect 403 Forbidden)...');
  const unauthorizedPostRes = await fetch(`${BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: studentCookie || '',
    },
    body: JSON.stringify({
      title: 'Unauthorized Student Party',
      description: 'Students should not be allowed to post.',
      date: 'Tonight',
    }),
  });

  const unauthorizedPostData = await unauthorizedPostRes.json();
  console.log('Unauthorized Post Status:', unauthorizedPostRes.status);
  console.log('Unauthorized Post Response:', unauthorizedPostData);

  if (unauthorizedPostRes.status !== 403) {
    throw new Error(`Security violation: Expected 403 Forbidden, got ${unauthorizedPostRes.status}`);
  }
  console.log('✅ RBAC Security Confirmed: Student was strictly forbidden from posting events.');

  // Test 5: Student Fetches Event Feed
  console.log('\n5️⃣ Testing Student Event Feed Retrieval...');
  const fetchEventsRes = await fetch(`${BASE_URL}/api/events`, {
    headers: { Cookie: studentCookie || '' },
  });

  const fetchEventsData = await fetchEventsRes.json();
  console.log('Fetch Events Status:', fetchEventsRes.status);
  console.log('Total Events in Feed:', fetchEventsData.events?.length);
  console.log('First Event Sample:', fetchEventsData.events?.[0]);

  const foundCreated = fetchEventsData.events.find(
    (e) => e.title === 'National AI & Cloud Hackathon 2026'
  );
  if (!foundCreated || foundCreated.author.name !== 'Dr. Vikram Sen') {
    throw new Error('Event was not correctly listed in Student feed with Staff author attribution');
  }
  console.log('✅ Event Feed Confirmed: Staff event appears in student feed with author attribution.');

  // Test 6: Staff Login
  console.log('\n6️⃣ Testing Staff Login...');
  const staffLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: staffEmail,
      password: 'password123',
      role: 'STAFF',
    }),
  });
  const staffLoginData = await staffLoginRes.json();
  console.log('Staff Login Status:', staffLoginRes.status);
  console.log('Staff Login Redirect Target:', staffLoginData.redirectTo);

  if (staffLoginRes.status !== 200 || staffLoginData.redirectTo !== '/staff-dashboard') {
    throw new Error('Staff login failed or redirect target mismatch');
  }

  // Test 7: Student Login
  console.log('\n7️⃣ Testing Student Login...');
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'password123',
      role: 'STUDENT',
    }),
  });
  const studentLoginData = await studentLoginRes.json();
  console.log('Student Login Status:', studentLoginRes.status);
  console.log('Student Login Redirect Target:', studentLoginData.redirectTo);

  if (studentLoginRes.status !== 200 || studentLoginData.redirectTo !== '/student-dashboard') {
    throw new Error('Student login failed or redirect target mismatch');
  }

  // Test 8: Logout
  console.log('\n8️⃣ Testing Logout...');
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
  });
  const logoutData = await logoutRes.json();
  console.log('Logout Status:', logoutRes.status);
  console.log('Logout Response:', logoutData);

  console.log('\n🎉 ALL 8 RBAC & EVENT FEED INTEGRATION TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
