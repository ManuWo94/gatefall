// Migration script - adds missing columns to existing database
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/gatefall.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Running database migration...\n');

db.serialize(() => {
  // Check and add missing columns to progression table
  db.all("PRAGMA table_info(progression)", [], (err, columns) => {
    if (err) {
      console.error('❌ Error checking progression table:', err);
      return;
    }

    const columnNames = columns.map(col => col.name);
    console.log('Current columns:', columnNames.join(', '));

    const migrations = [
      { name: 'awakening_state', sql: 'ALTER TABLE progression ADD COLUMN awakening_state TEXT DEFAULT "locked"' },
      { name: 'hunter_rank', sql: 'ALTER TABLE progression ADD COLUMN hunter_rank TEXT DEFAULT "D"' },
      { name: 'guild_id', sql: 'ALTER TABLE progression ADD COLUMN guild_id TEXT' },
      { name: 'role', sql: 'ALTER TABLE progression ADD COLUMN role TEXT DEFAULT "waechter"' }
    ];

    let completed = 0;
    let migrated = 0;

    migrations.forEach(migration => {
      if (!columnNames.includes(migration.name)) {
        db.run(migration.sql, (err) => {
          completed++;
          if (err) {
            console.error(`❌ Error adding ${migration.name}:`, err.message);
          } else {
            console.log(`✅ Added column: ${migration.name}`);
            migrated++;
          }
          
          if (completed === migrations.length) {
            finishMigration(migrated);
          }
        });
      } else {
        completed++;
        console.log(`⏭️  Column ${migration.name} already exists`);
        if (completed === migrations.length) {
          finishMigration(migrated);
        }
      }
    });
  });

  // Check player_gates table
  db.run(`
    CREATE TABLE IF NOT EXISTS player_gates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      gate_date TEXT NOT NULL,
      completed_gate_ids TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, gate_date)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating player_gates table:', err);
    } else {
      console.log('✅ player_gates table ready');
    }
  });

  function finishMigration(count) {
    setTimeout(() => {
      console.log(`\n✨ Migration complete! ${count} column(s) added.`);
      db.close();
      process.exit(0);
    }, 100);
  }
});
