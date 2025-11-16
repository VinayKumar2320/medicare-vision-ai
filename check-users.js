import Database from 'better-sqlite3';

const db = new Database('./data/database.sqlite');

console.log('\n=== 📊 USERS IN DATABASE ===\n');

const users = db.prepare('SELECT id, email, name, createdAt FROM users').all();

if (users.length === 0) {
  console.log('No users found in database.');
} else {
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name || 'N/A'}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('');
  });
}

console.log(`Total Users: ${users.length}`);
console.log('\n=== DATABASE LOCATION ===');
console.log('📁 File: data/database.sqlite');
console.log('🗄️  Type: SQLite3');
console.log('📋 Table: users');
console.log('');

db.close();
