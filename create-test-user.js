// Test-Account erstellen
// Führe aus mit: node create-test-user.js

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'gatefall.db');
const db = new sqlite3.Database(dbPath);

const TEST_USER = {
  email: 'test@dev.de',
  password: '12345678',
  displayName: 'Manu'
};

async function createTestUser() {
  try {
    // Passwort hashen
    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
    
    // Prüfe ob User existiert
    db.get('SELECT id FROM users WHERE email = ?', [TEST_USER.email], (err, existing) => {
      if (err) {
        console.error('Fehler beim Prüfen:', err);
        return;
      }

      if (existing) {
        console.log('❌ Test-User existiert bereits!');
        console.log('📧 E-Mail:', TEST_USER.email);
        console.log('🔑 Passwort:', TEST_USER.password);
        db.close();
        return;
      }

      // User erstellen (bereits verifiziert)
      db.run(
        `INSERT INTO users (email, password_hash, display_name, email_verified_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          TEST_USER.email,
          passwordHash,
          TEST_USER.displayName,
          new Date().toISOString(),
          new Date().toISOString()
        ],
        function(err) {
          if (err) {
            console.error('Fehler beim Erstellen:', err);
            db.close();
            return;
          }

          const userId = this.lastID;

          // Progression erstellen
          db.run(
            'INSERT INTO progression (user_id, level, xp, gold) VALUES (?, ?, ?, ?)',
            [userId, 1, 0, 0],
            (err) => {
              if (err) {
                console.error('Fehler bei Progression:', err);
              } else {
                console.log('✅ Test-User erfolgreich erstellt!');
                console.log('');
                console.log('📧 E-Mail:', TEST_USER.email);
                console.log('🔑 Passwort:', TEST_USER.password);
                console.log('👤 Name:', TEST_USER.displayName);
                console.log('✓ E-Mail bereits verifiziert');
              }
              db.close();
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Fehler:', error);
    db.close();
  }
}

createTestUser();
