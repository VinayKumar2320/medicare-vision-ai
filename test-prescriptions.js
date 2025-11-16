import fs from 'fs';

// Quick API test
const testPrescriptionsAPI = async () => {
  console.log('\n🧪 TESTING PRESCRIPTIONS API\n');

  try {
    // 1. Login
    console.log('1️⃣  Logging in...');
    const loginRes = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@medicare.com', password: 'Demo123!' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(loginData.error);
    const token = loginData.data.token;
    console.log('✅ Logged in as:', loginData.data.user.email);

    // 2. Add prescription
    console.log('\n2️⃣  Adding a prescription...');
    const addRes = await fetch('http://localhost:3001/api/prescriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily'
      })
    });
    const addData = await addRes.json();
    if (!addData.success) throw new Error(addData.error);
    console.log('✅ Added prescription:', addData.data.name);

    // 3. Get prescriptions
    console.log('\n3️⃣  Fetching all prescriptions...');
    const getRes = await fetch('http://localhost:3001/api/prescriptions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getData = await getRes.json();
    if (!getData.success) throw new Error(getData.error);
    console.log(`✅ Found ${getData.data.length} prescription(s):`);
    getData.data.forEach(p => {
      console.log(`   • ${p.name} (${p.dosage}, ${p.frequency})`);
    });

    console.log('\n✅ ALL TESTS PASSED! Prescriptions are stored in database.');
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
  }
};

await testPrescriptionsAPI();
