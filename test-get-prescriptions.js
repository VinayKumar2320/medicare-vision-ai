#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

async function testGetPrescriptions() {
  try {
    console.log('🔐 Testing Get Prescriptions API\n');

    // 1. Login first
    console.log('1️⃣  Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@medicare.com',
        password: 'Demo123!'
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData);
      return;
    }
    const token = loginData.data.token;
    console.log('✅ Logged in\n');

    // 2. Get prescriptions
    console.log('2️⃣  Fetching prescriptions...');
    const getRes = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const getData = await getRes.json();
    console.log('✅ Get prescriptions response:', JSON.stringify(getData, null, 2));
    
    if (getData.success && getData.data) {
      console.log(`\n📋 Found ${getData.data.length} prescription(s):`);
      getData.data.forEach((p, idx) => {
        console.log(`\n${idx + 1}. ${p.name}`);
        console.log(`   Dosage: ${p.dosage}`);
        console.log(`   Frequency: ${p.frequency}`);
        console.log(`   Morning: ${p.Morning} (type: ${typeof p.Morning})`);
        console.log(`   Evening: ${p.Evening} (type: ${typeof p.Evening})`);
        console.log(`   Night: ${p.Night} (type: ${typeof p.Night})`);
        console.log(`   Doctor: ${p.doctorName || 'N/A'}`);
        console.log(`   Date: ${p.prescriptionDate || 'N/A'}`);
      });
    }

    console.log('\n✨ Test completed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testGetPrescriptions();

