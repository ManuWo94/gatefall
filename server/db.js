const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'gatefall.db');
const db = new Database(dbPath);

// Tabellen erstellen
db.exec(`
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
const userColumns = db.prepare("PRAGMA table_info(users)").all();
const hasVerifiedAt = userColumns.some(col => col.name === 'email_verified_at');
const hasTokenHash = userColumns.some(col => col.name === 'verify_token_hash');
const hasTokenExpiry = userColumns.some(col => col.name === 'verify_token_expires_at');
const hasDiscordId = userColumns.some(col => col.name === 'discord_id');
const hasDiscordUsername = userColumns.some(col => col.name === 'discord_username');
const hasDiscordAvatar = userColumns.some(col => col.name === 'discord_avatar');

if (!hasVerifiedAt) {
  db.exec('ALTER TABLE users ADD COLUMN email_verified_at DATETIME');
  console.log('✓ Spalte email_verified_at hinzugefügt');
}

if (!hasTokenHash) {
  db.exec('ALTER TABLE users ADD COLUMN verify_token_hash TEXT');
  console.log('✓ Spalte verify_token_hash hinzugefügt');
}

if (!hasTokenExpiry) {
  db.exec('ALTER TABLE users ADD COLUMN verify_token_expires_at DATETIME');
  console.log('✓ Spalte verify_token_expires_at hinzugefügt');
}

if (!hasDiscordId) {
  db.exec('ALTER TABLE users ADD COLUMN discord_id TEXT');
  console.log('✓ Spalte discord_id hinzugefügt');
}

if (!hasDiscordUsername) {
  db.exec('ALTER TABLE users ADD COLUMN discord_username TEXT');
  console.log('✓ Spalte discord_username hinzugefügt');
}

if (!hasDiscordAvatar) {
  db.exec('ALTER TABLE users ADD COLUMN discord_avatar TEXT');
  console.log('✓ Spalte discord_avatar hinzugefügt');
}

// Progression Tabelle
db.exec(`
  CREATE TABLE IF NOT EXISTS progression (
    user_id INTEGER UNIQUE NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 0,
    awakening_state TEXT DEFAULT 'locked',
    hunter_rank TEXT DEFAULT 'D',
    role TEXT DEFAULT 'waechter',
    guild_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Migration: Add awakening_state, hunter_rank, guild_id, role to progression table
const progressionColumns = db.prepare("PRAGMA table_info(progression)").all();
const hasAwakeningState = progressionColumns.some(col => col.name === 'awakening_state');
const hasHunterRank = progressionColumns.some(col => col.name === 'hunter_rank');
const hasGuildId = progressionColumns.some(col => col.name === 'guild_id');
const hasRole = progressionColumns.some(col => col.name === 'role');

if (!hasAwakeningState) {
  db.exec('ALTER TABLE progression ADD COLUMN awakening_state TEXT DEFAULT "locked"');
  console.log('✓ Spalte awakening_state hinzugefügt');
}

if (!hasHunterRank) {
  db.exec('ALTER TABLE progression ADD COLUMN hunter_rank TEXT DEFAULT "D"');
  console.log('✓ Spalte hunter_rank hinzugefügt');
}

if (!hasGuildId) {
  db.exec('ALTER TABLE progression ADD COLUMN guild_id TEXT');
  console.log('✓ Spalte guild_id hinzugefügt');
}

if (!hasRole) {
  db.exec('ALTER TABLE progression ADD COLUMN role TEXT DEFAULT "waechter"');
  console.log('✓ Spalte role hinzugefügt');
}

// Player-owned Guilds
db.exec(`
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
db.exec(`
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
db.exec(`
  CREATE TABLE IF NOT EXISTS player_gates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    gate_date TEXT NOT NULL,
    completed_gate_ids TEXT DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, gate_date)
  )
`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_guild_applications ON guild_applications(guild_id, status)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_player_gates ON player_gates(user_id, gate_date)`);

console.log('✓ Datenbank initialisiert:', dbPath);

// Wrapper für Kompatibilität mit altem sqlite3 API
const dbWrapper = {
  prepare: (sql) => db.prepare(sql),
  exec: (sql) => db.exec(sql),
  
  run: function(sql, params, callback) {
    try {
      const stmt = db.prepare(sql);
      const info = params && params.length > 0 ? stmt.run(...params) : stmt.run();
      if (callback) callback(null, info);
      return { lastID: info.lastInsertRowid, changes: info.changes };
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  },
  
  get: function(sql, params, callback) {
    try {
      const stmt = db.prepare(sql);
      const row = params && params.length > 0 ? stmt.get(...params) : stmt.get();
      if (callback) callback(null, row);
      return row;
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  },
  
  all: function(sql, params, callback) {
    try {
      const stmt = db.prepare(sql);
      const rows = params && params.length > 0 ? stmt.all(...params) : stmt.all();
      if (callback) callback(null, rows);
      return rows;
    } catch (err) {
      if (callback) callback(err);
      throw err;
    }
  }
};

module.exports = dbWrapper;
