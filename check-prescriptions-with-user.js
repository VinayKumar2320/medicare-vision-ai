import Database from 'better-sqlite3';

const db = new Database('./data/database.sqlite');

console.log('\n=== 📋 PRESCRIPTIONS WITH USER INFO ===\n');

const prescriptions = db.prepare(`
  SELECT 
    p.id, 
    p.userId, 
    p.name, 
    p.dosage, 
    p.frequency, 
    p.Morning, 
    p.Evening, 
    p.Night, 
    p.doctorName, 
    p.prescriptionDate, 
    p.notes, 
    p.imageUrl, 
    p.createdAt,
    u.email as userEmail,
    u.name as userName
  FROM prescriptions p
  LEFT JOIN users u ON p.userId = u.id
  ORDER BY p.createdAt DESC
`).all();

if (prescriptions.length === 0) {
  console.log('No prescriptions found in database.');
} else {
  prescriptions.forEach((prescription, index) => {
    console.log(`${index + 1}. ${prescription.name || 'N/A'}`);
    console.log(`   User: ${prescription.userEmail || prescription.userId} (${prescription.userName || 'N/A'})`);
    console.log(`   Dosage: ${prescription.dosage || 'N/A'}`);
    console.log(`   Frequency: ${prescription.frequency || 'N/A'}`);
    console.log(`   Morning: ${prescription.Morning || '0'} (type: ${typeof prescription.Morning})`);
    console.log(`   Evening: ${prescription.Evening || '0'} (type: ${typeof prescription.Evening})`);
    console.log(`   Night: ${prescription.Night || '0'} (type: ${typeof prescription.Night})`);
    console.log(`   Doctor: ${prescription.doctorName || 'N/A'}`);
    console.log(`   Date: ${prescription.prescriptionDate || 'N/A'}`);
    console.log(`   Created: ${prescription.createdAt}`);
    console.log('');
  });
}

console.log(`Total Prescriptions: ${prescriptions.length}`);

// Also show all users
console.log('\n=== 👥 ALL USERS ===\n');
const users = db.prepare('SELECT id, email, name, createdAt FROM users').all();
users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.email} (${user.name || 'N/A'}) - ID: ${user.id}`);
});

db.close();

