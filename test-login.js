// Test Login
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'gatefall.db');
const db = new sqlite3.Database(dbPath);

const TEST_EMAIL = 'test@dev.de';
const TEST_PASSWORD = '12345678';

db.get(
  'SELECT id, email, password_hash, display_name FROM users WHERE email = ?',
  [TEST_EMAIL],
  async (err, user) => {
    if (err) {
      console.error('❌ Database error:', err);
      db.close();
      return;
    }

    if (!user) {
      console.error('❌ User nicht gefunden!');
      db.close();
      return;
    }

    console.log('✓ User gefunden:', user.email);
    console.log('✓ Display Name:', user.display_name);
    console.log('✓ Password Hash:', user.password_hash.substring(0, 29) + '...');

    try {
      const validPassword = await bcrypt.compare(TEST_PASSWORD, user.password_hash);
      
      if (validPassword) {
        console.log('✅ Passwort ist KORREKT!');
      } else {
        console.log('❌ Passwort ist FALSCH!');
      }
    } catch (error) {
      console.error('❌ bcrypt error:', error);
    }

    db.close();
  }
);
