// Script to check database schema
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/gatefall.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Checking database schema...\n');

// Check users table
db.all("PRAGMA table_info(users)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking users table:', err);
    return;
  }
  console.log('✅ Users table columns:');
  columns.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });
  console.log('');
});

// Check progression table
db.all("PRAGMA table_info(progression)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking progression table:', err);
    return;
  }
  console.log('✅ Progression table columns:');
  columns.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });
  console.log('');
  
  // Check if role column exists
  const hasRole = columns.some(col => col.name === 'role');
  if (hasRole) {
    console.log('✅ Role column exists!');
  } else {
    console.log('❌ Role column is MISSING! Run migration.');
  }
  console.log('');
});

// Check player_gates table
db.all("PRAGMA table_info(player_gates)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error checking player_gates table:', err);
    return;
  }
  console.log('✅ Player_gates table columns:');
  columns.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });
  console.log('');
  
  setTimeout(() => {
    db.close();
    console.log('✅ Database check complete!');
  }, 500);
});
