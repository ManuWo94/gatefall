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

  db.run(`
    CREATE TABLE IF NOT EXISTS progression (
      user_id INTEGER UNIQUE NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      gold INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

  console.log('✓ Datenbank initialisiert:', dbPath);
});

module.exports = db;
