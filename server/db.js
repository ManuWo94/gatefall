const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gatefall.db');
const db = new sqlite3.Database(dbPath);

// Tabellen erstellen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE COLLATE NOCASE,
      password_hash TEXT,
      display_name TEXT NOT NULL,
      discord_id TEXT UNIQUE,
      discord_username TEXT,
      discord_avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      email_verified_at DATETIME,
      verify_token_hash TEXT,
      verify_token_expires_at DATETIME
    )
  `);

  // Migration: Füge Verification-Felder hinzu falls sie fehlen
  db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
      console.error('Fehler beim Prüfen der Tabelle:', err);
      return;
    }
    
    const hasVerifiedAt = columns.some(col => col.name === 'email_verified_at');
    const hasTokenHash = columns.some(col => col.name === 'verify_token_hash');
    const hasTokenExpiry = columns.some(col => col.name === 'verify_token_expires_at');
    const hasDiscordId = columns.some(col => col.name === 'discord_id');
    const hasDiscordUsername = columns.some(col => col.name === 'discord_username');
    const hasDiscordAvatar = columns.some(col => col.name === 'discord_avatar');
    
    if (!hasVerifiedAt) {
      db.run('ALTER TABLE users ADD COLUMN email_verified_at DATETIME', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von email_verified_at:', err);
        else console.log('✓ Spalte email_verified_at hinzugefügt');
      });
    }
    
    if (!hasTokenHash) {
      db.run('ALTER TABLE users ADD COLUMN verify_token_hash TEXT', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von verify_token_hash:', err);
        else console.log('✓ Spalte verify_token_hash hinzugefügt');
      });
    }
    
    if (!hasTokenExpiry) {
      db.run('ALTER TABLE users ADD COLUMN verify_token_expires_at DATETIME', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von verify_token_expires_at:', err);
        else console.log('✓ Spalte verify_token_expires_at hinzugefügt');
      });
    }

    if (!hasDiscordId) {
      db.run('ALTER TABLE users ADD COLUMN discord_id TEXT', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von discord_id:', err);
        else console.log('✓ Spalte discord_id hinzugefügt');
      });
    }

    if (!hasDiscordUsername) {
      db.run('ALTER TABLE users ADD COLUMN discord_username TEXT', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von discord_username:', err);
        else console.log('✓ Spalte discord_username hinzugefügt');
      });
    }

    if (!hasDiscordAvatar) {
      db.run('ALTER TABLE users ADD COLUMN discord_avatar TEXT', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von discord_avatar:', err);
        else console.log('✓ Spalte discord_avatar hinzugefügt');
      });
    }
  });

  // Migration: Add awakening_state, hunter_rank, guild_id to progression table
  db.all("PRAGMA table_info(progression)", [], (err, columns) => {
    if (err) {
      console.error('Fehler beim Prüfen der progression Tabelle:', err);
      return;
    }

    const hasAwakeningState = columns.some(col => col.name === 'awakening_state');
    const hasHunterRank = columns.some(col => col.name === 'hunter_rank');
    const hasGuildId = columns.some(col => col.name === 'guild_id');

    if (!hasAwakeningState) {
      db.run('ALTER TABLE progression ADD COLUMN awakening_state TEXT DEFAULT "locked"', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von awakening_state:', err);
        else console.log('✓ Spalte awakening_state hinzugefügt');
      });
    }

    if (!hasHunterRank) {
      db.run('ALTER TABLE progression ADD COLUMN hunter_rank TEXT DEFAULT "D"', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von hunter_rank:', err);
        else console.log('✓ Spalte hunter_rank hinzugefügt');
      });
    }

    if (!hasGuildId) {
      db.run('ALTER TABLE progression ADD COLUMN guild_id TEXT', (err) => {
        if (err) console.error('Fehler beim Hinzufügen von guild_id:', err);
        else console.log('✓ Spalte guild_id hinzugefügt');
      });
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS progression (
      user_id INTEGER UNIQUE NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      gold INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Player-owned Guilds
  db.run(`
    CREATE TABLE IF NOT EXISTS player_guilds (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      owner_id INTEGER NOT NULL,
      minimum_hunter_rank TEXT NOT NULL DEFAULT 'D',
      gold_bonus REAL NOT NULL DEFAULT 0.10,
      reputation INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Guild join applications
  db.run(`
    CREATE TABLE IF NOT EXISTS guild_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guild_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      decided_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(guild_id, user_id)
    )
  `);

  // Daily Gates for Players
  db.run(`
    CREATE TABLE IF NOT EXISTS player_gates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      gate_date TEXT NOT NULL,
      completed_gate_ids TEXT DEFAULT '[]',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, gate_date)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_guild_applications ON guild_applications(guild_id, status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_player_gates ON player_gates(user_id, gate_date)`);

  console.log('✓ Datenbank initialisiert:', dbPath);
});

module.exports = db;
