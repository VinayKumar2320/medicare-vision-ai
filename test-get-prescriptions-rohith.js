#!/usr/bin/env node

const BASE_URL = 'http://localhost:3001';

async function testGetPrescriptions() {
  try {
    console.log('🔐 Testing Get Prescriptions API for mkrohith775@gmail.com\n');

    // 1. Login first
    console.log('1️⃣  Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mkrohith775@gmail.com',
        password: 'Demo123!' // You may need to use the correct password
      })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData);
      console.log('💡 Try with a different password or register this user first');
      return;
    }
    const token = loginData.data.token;
    console.log('✅ Logged in as:', loginData.data.user.email);
    console.log('   User ID:', loginData.data.user.id);
    console.log('');

    // 2. Get prescriptions
    console.log('2️⃣  Fetching prescriptions...');
    const getRes = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const getData = await getRes.json();
    
    if (getData.success && getData.data) {
      console.log(`✅ Found ${getData.data.length} prescription(s):\n`);
      getData.data.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name}`);
        console.log(`   Dosage: ${p.dosage}`);
        console.log(`   Frequency: ${p.frequency}`);
        console.log(`   Morning: "${p.Morning}" (type: ${typeof p.Morning})`);
        console.log(`   Evening: "${p.Evening}" (type: ${typeof p.Evening})`);
        console.log(`   Night: "${p.Night}" (type: ${typeof p.Night})`);
        console.log(`   Doctor: ${p.doctorName || 'N/A'}`);
        console.log(`   Date: ${p.prescriptionDate || 'N/A'}`);
        console.log('');
      });
      
      // Calculate total tablets
      const total = getData.data.reduce((sum, p) => {
        const m = parseInt(p.Morning || '0', 10) || 0;
        const e = parseInt(p.Evening || '0', 10) || 0;
        const n = parseInt(p.Night || '0', 10) || 0;
        return sum + m + e + n;
      }, 0);
      console.log(`📊 Total tablets for today: ${total}`);
    } else {
      console.log('❌ No prescriptions found or error:', getData);
    }

    console.log('\n✨ Test completed!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testGetPrescriptions();

