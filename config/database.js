import Database from 'better-sqlite3';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = join(__dirname, '..', 'data');
const DB_FILE = join(DB_DIR, 'database.sqlite');
let db;

// Initialize database synchronously
try {
  // ensure data dir exists synchronously
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  db = new Database(DB_FILE);
  // create users table if not exists
  db.prepare(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`
  ).run();
  // create prescriptions table if not exists
  db.prepare(
    `CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      Morning TEXT DEFAULT '0',
      Evening TEXT DEFAULT '0',
      Night TEXT DEFAULT '0',
      doctorName TEXT,
      prescriptionDate TEXT,
      notes TEXT,
      imageUrl TEXT,
      ocrText TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`
  ).run();
  
  // create blood_reports table if not exists
  db.prepare(
    `CREATE TABLE IF NOT EXISTS blood_reports (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      testDate TEXT NOT NULL,
      testName TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT,
      normalRange TEXT,
      status TEXT,
      fileUrl TEXT,
      ocrText TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    )`
  ).run();
  
  // Migrate database schema if needed
  try {
    const tableInfo = db.prepare("PRAGMA table_info(prescriptions)").all();
    const columnNames = tableInfo.map(col => col.name);
    
    // Check if we need to migrate from old column names
    const hasOldColumns = columnNames.some(name => name === 'morningTablets' || name === 'eveningTablets' || name === 'nightTablets');
    const hasNewColumns = columnNames.some(name => name === 'Morning' || name === 'Evening' || name === 'Night');
    
    if (hasOldColumns && !hasNewColumns) {
      console.log('🔄 Migrating prescriptions table: renaming columns...');
      // Create new table with correct column names
      db.prepare(`CREATE TABLE prescriptions_new (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT,
        frequency TEXT,
        Morning TEXT DEFAULT '0',
        Evening TEXT DEFAULT '0',
        Night TEXT DEFAULT '0',
        doctorName TEXT,
        prescriptionDate TEXT,
        notes TEXT,
        imageUrl TEXT,
        ocrText TEXT,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      )`).run();
      
      // Copy data from old table to new table
      db.prepare(`INSERT INTO prescriptions_new 
        (id, userId, name, dosage, frequency, Morning, Evening, Night, doctorName, prescriptionDate, notes, imageUrl, ocrText, createdAt)
        SELECT id, userId, name, dosage, frequency, 
               COALESCE(morningTablets, '0') as Morning,
               COALESCE(eveningTablets, '0') as Evening,
               COALESCE(nightTablets, '0') as Night,
               COALESCE(doctorName, '') as doctorName,
               COALESCE(prescriptionDate, '') as prescriptionDate,
               COALESCE(notes, '') as notes,
               COALESCE(imageUrl, '') as imageUrl,
               COALESCE(ocrText, '') as ocrText,
               createdAt
        FROM prescriptions`).run();
      
      // Drop old table and rename new one
      db.prepare('DROP TABLE prescriptions').run();
      db.prepare('ALTER TABLE prescriptions_new RENAME TO prescriptions').run();
      console.log('✅ Migration completed successfully');
    } else if (!hasNewColumns) {
      // Table exists but doesn't have the new columns - add them
      console.log('🔄 Adding missing columns to prescriptions table...');
      
      // Add missing columns one by one (SQLite doesn't support adding multiple columns at once easily)
      if (!columnNames.includes('Morning')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN Morning TEXT DEFAULT "0"').run();
        console.log('  ✅ Added Morning column');
      }
      if (!columnNames.includes('Evening')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN Evening TEXT DEFAULT "0"').run();
        console.log('  ✅ Added Evening column');
      }
      if (!columnNames.includes('Night')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN Night TEXT DEFAULT "0"').run();
        console.log('  ✅ Added Night column');
      }
      if (!columnNames.includes('doctorName')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN doctorName TEXT').run();
        console.log('  ✅ Added doctorName column');
      }
      if (!columnNames.includes('prescriptionDate')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN prescriptionDate TEXT').run();
        console.log('  ✅ Added prescriptionDate column');
      }
      if (!columnNames.includes('notes')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN notes TEXT').run();
        console.log('  ✅ Added notes column');
      }
      if (!columnNames.includes('imageUrl')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN imageUrl TEXT').run();
        console.log('  ✅ Added imageUrl column');
      }
      if (!columnNames.includes('ocrText')) {
        db.prepare('ALTER TABLE prescriptions ADD COLUMN ocrText TEXT').run();
        console.log('  ✅ Added ocrText column');
      }
      
      // Update existing rows to have default values for new columns
      db.prepare(`UPDATE prescriptions SET Morning = '0' WHERE Morning IS NULL`).run();
      db.prepare(`UPDATE prescriptions SET Evening = '0' WHERE Evening IS NULL`).run();
      db.prepare(`UPDATE prescriptions SET Night = '0' WHERE Night IS NULL`).run();
      
      console.log('✅ Schema migration completed successfully');
    }
  } catch (migrateErr) {
    console.error('❌ Migration failed:', migrateErr.message);
    console.warn('⚠️ Continuing with existing schema...');
  }
} catch (err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}

export function createUserInDb({ id, email, name, passwordHash }) {
  const stmt = db.prepare('INSERT INTO users (id, email, name, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)');
  stmt.run(id, email, name || '', passwordHash, new Date().toISOString());
}

export function getUserByEmail(email) {
  const stmt = db.prepare('SELECT id, email, name, passwordHash, createdAt FROM users WHERE email = ?');
  return stmt.get(email.toLowerCase());
}

export function getUserById(id) {
  const stmt = db.prepare('SELECT id, email, name, createdAt FROM users WHERE id = ?');
  return stmt.get(id);
}

export function getPrescriptionsByUserId(userId) {
  const stmt = db.prepare('SELECT id, userId, name, dosage, frequency, Morning, Evening, Night, doctorName, prescriptionDate, notes, imageUrl, ocrText, createdAt FROM prescriptions WHERE userId = ? ORDER BY createdAt DESC');
  const results = stmt.all(userId);
  
  // Log what we're returning from database
  console.log(`📊 Database: Returning ${results.length} prescriptions for user ${userId}`);
  results.forEach((p, idx) => {
    console.log(`  ${idx + 1}. ${p.name} - Morning: ${p.Morning} (${typeof p.Morning}), Evening: ${p.Evening} (${typeof p.Evening}), Night: ${p.Night} (${typeof p.Night})`);
  });
  
  return results;
}

export function createPrescription(id, userId, name, dosage, frequency) {
  const stmt = db.prepare('INSERT INTO prescriptions (id, userId, name, dosage, frequency, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(id, userId, name, dosage || '', frequency || '', new Date().toISOString());
}

export function deletePrescription(prescriptionId) {
  const stmt = db.prepare('DELETE FROM prescriptions WHERE id = ?');
  stmt.run(prescriptionId);
}

export function createPrescriptionDetailed(id, userId, name, dosage, frequency, Morning, Evening, Night, doctorName, prescriptionDate, notes, imageUrl, ocrText) {
  const stmt = db.prepare(`INSERT INTO prescriptions 
    (id, userId, name, dosage, frequency, Morning, Evening, Night, doctorName, prescriptionDate, notes, imageUrl, ocrText, createdAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(id, userId, name, dosage, frequency, Morning, Evening, Night, doctorName, prescriptionDate, notes, imageUrl, ocrText, new Date().toISOString());
}

export function getBloodReportsByUserId(userId) {
  const stmt = db.prepare('SELECT id, userId, testDate, testName, value, unit, normalRange, status, fileUrl, ocrText, createdAt FROM blood_reports WHERE userId = ? ORDER BY testDate DESC, createdAt DESC');
  return stmt.all(userId);
}

export function createBloodReport(id, userId, testDate, testName, value, unit, normalRange, status, fileUrl, ocrText) {
  const stmt = db.prepare(`INSERT INTO blood_reports 
    (id, userId, testDate, testName, value, unit, normalRange, status, fileUrl, ocrText, createdAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  stmt.run(id, userId, testDate, testName, value, unit, normalRange, status, fileUrl, ocrText, new Date().toISOString());
}

export function deleteBloodReport(reportId) {
  const stmt = db.prepare('DELETE FROM blood_reports WHERE id = ?');
  stmt.run(reportId);
}

export { db };

