import Database from 'better-sqlite3';

const db = new Database('./data/database.sqlite');

console.log('\n=== 📋 UPDATING PRESCRIPTION VALUES ===\n');

// Example: Update prescriptions with sample values
// You can modify these values as needed

const updates = [
  {
    name: 'AMOXICILLIN',
    Morning: '1',
    Evening: '1',
    Night: '0'
  },
  {
    name: 'paracetamol',
    Morning: '1',
    Evening: '0',
    Night: '0'
  },
  {
    name: 'citrazin',
    Morning: '0',
    Evening: '1',
    Night: '1'
  }
];

// Update each prescription
updates.forEach(update => {
  const stmt = db.prepare(`
    UPDATE prescriptions 
    SET Morning = ?, Evening = ?, Night = ?
    WHERE name = ? AND (Morning = '0' OR Morning IS NULL)
  `);
  
  const result = stmt.run(update.Morning, update.Evening, update.Night, update.name);
  console.log(`✅ Updated ${result.changes} prescription(s) named "${update.name}"`);
  console.log(`   Morning: ${update.Morning}, Evening: ${update.Evening}, Night: ${update.Night}`);
});

console.log('\n=== 📋 VERIFYING UPDATES ===\n');

const prescriptions = db.prepare(`
  SELECT id, name, Morning, Evening, Night 
  FROM prescriptions 
  ORDER BY createdAt DESC
`).all();

prescriptions.forEach((p, idx) => {
  const total = (parseInt(p.Morning || '0', 10) || 0) + 
                (parseInt(p.Evening || '0', 10) || 0) + 
                (parseInt(p.Night || '0', 10) || 0);
  console.log(`${idx + 1}. ${p.name}`);
  console.log(`   Morning: ${p.Morning}, Evening: ${p.Evening}, Night: ${p.Night} = ${total} tablets/day`);
});

console.log('\n✅ Database updated! Refresh your app to see the changes.\n');

db.close();

