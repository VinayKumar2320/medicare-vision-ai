import Database from 'better-sqlite3';

const db = new Database('./data/database.sqlite');

console.log('\n=== 📋 PRESCRIPTIONS IN DATABASE ===\n');

const prescriptions = db.prepare('SELECT id, userId, name, dosage, frequency, Morning, Evening, Night, doctorName, prescriptionDate, notes, imageUrl, createdAt FROM prescriptions').all();

if (prescriptions.length === 0) {
  console.log('No prescriptions found in database.');
} else {
  prescriptions.forEach((prescription, index) => {
    console.log(`${index + 1}. ${prescription.name || 'N/A'}`);
    console.log(`   Dosage: ${prescription.dosage || 'N/A'}`);
    console.log(`   Frequency: ${prescription.frequency || 'N/A'}`);
    console.log(`   Morning: ${prescription.Morning || '0'}`);
    console.log(`   Evening: ${prescription.Evening || '0'}`);
    console.log(`   Night: ${prescription.Night || '0'}`);
    console.log(`   Doctor: ${prescription.doctorName || 'N/A'}`);
    console.log(`   Date: ${prescription.prescriptionDate || 'N/A'}`);
    console.log(`   Created: ${prescription.createdAt}`);
    console.log('');
  });
}

console.log(`Total Prescriptions: ${prescriptions.length}`);
console.log('\n=== DATABASE LOCATION ===');
console.log('📁 File: data/database.sqlite');
console.log('🗄️  Type: SQLite3');
console.log('📋 Table: prescriptions');
console.log('');

db.close();

