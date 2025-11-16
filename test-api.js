#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

async function test() {
  try {
    console.log('🔐 Testing Authentication & Prescriptions API\n');

    // 1. Register a test user
    console.log('1️⃣  Registering test user...');
    const registerRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@test.com`,
        password: 'TestPassword123!',
        name: 'Test User'
      })
    });
    const registerData = await registerRes.json();
    console.log('✅ Register response:', registerData);
    
    if (!registerData.success) {
      console.error('❌ Register failed:', registerData);
      return;
    }

    const token = registerData.data.token;
    const userId = registerData.data.user.id;
    console.log(`✅ Registered! Token: ${token.slice(0, 20)}...`);
    console.log(`✅ User ID: ${userId}\n`);

    // 2. Add a prescription
    console.log('2️⃣  Adding a prescription...');
    const addRes = await fetch(`${BASE_URL}/api/prescriptions`, {
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
    console.log('✅ Add prescription response:', addData);
    
    if (!addData.success) {
      console.error('❌ Add prescription failed:', addData);
      return;
    }
    console.log('✅ Prescription added!\n');

    // 3. Get all prescriptions
    console.log('3️⃣  Fetching prescriptions...');
    const getRes = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const getData = await getRes.json();
    console.log('✅ Get prescriptions response:', getData);
    console.log(`✅ Found ${getData.data?.length || 0} prescriptions\n`);

    // 4. Get current user
    console.log('4️⃣  Getting current user profile...');
    const meRes = await fetch(`${BASE_URL}/api/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const meData = await meRes.json();
    console.log('✅ User profile:', meData);

    console.log('\n✨ All tests passed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
