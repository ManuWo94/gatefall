// Direkt auf Plesk ausführen: node plesk-test.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

console.log('🔍 Plesk Diagnose-Script\n');

const dbPath = path.join(__dirname, 'server', 'gatefall.db');
console.log('📁 Datenbank-Pfad:', dbPath);
console.log('📁 __dirname:', __dirname);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Fehler beim Öffnen der Datenbank:', err.message);
    process.exit(1);
  }
  console.log('✓ Datenbank geöffnet\n');
});

// 1. Prüfe alle Benutzer
console.log('👥 Vorhandene Benutzer:');
db.all('SELECT id, email, display_name, email_verified_at FROM users', [], (err, users) => {
  if (err) {
    console.error('❌ Fehler:', err.message);
  } else if (users.length === 0) {
    console.log('   Keine Benutzer gefunden!\n');
  } else {
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.display_name}) [ID: ${user.id}]`);
    });
    console.log('');
  }

  // 2. Teste test@dev.de Login
  console.log('🔐 Teste Login für test@dev.de...');
  db.get('SELECT * FROM users WHERE email = ?', ['test@dev.de'], async (err, user) => {
    if (err) {
      console.error('❌ Fehler:', err.message);
    } else if (!user) {
      console.log('❌ Account test@dev.de existiert NICHT!\n');
      console.log('🔧 Erstelle Account jetzt...\n');
      
      // Account erstellen
      const passwordHash = await bcrypt.hash('12345678', 10);
      db.run(
        `INSERT INTO users (email, password_hash, display_name, email_verified_at, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        ['test@dev.de', passwordHash, 'Manu', new Date().toISOString(), new Date().toISOString()],
        function(err) {
          if (err) {
            console.error('❌ Fehler beim Erstellen:', err.message);
          } else {
            const userId = this.lastID;
            console.log('✅ User erstellt (ID:', userId, ')');
            
            // Progression erstellen
            db.run(
              'INSERT INTO progression (user_id, level, xp, gold, awakening_state) VALUES (?, 1, 0, 0, "locked")',
              [userId],
              (err) => {
                if (err) {
                  console.error('❌ Progression Fehler:', err.message);
                } else {
                  console.log('✅ Progression erstellt\n');
                  console.log('🎉 Account bereit!');
                  console.log('📧 E-Mail: test@dev.de');
                  console.log('🔑 Passwort: 12345678');
                }
                db.close();
              }
            );
          }
        }
      );
    } else {
      console.log('✓ Account gefunden!');
      
      // Teste Passwort
      bcrypt.compare('12345678', user.password_hash, (err, valid) => {
        if (err) {
          console.error('❌ bcrypt Fehler:', err.message);
        } else if (valid) {
          console.log('✅ Passwort ist KORREKT!\n');
          console.log('✅ Login sollte funktionieren!');
        } else {
          console.log('❌ Passwort ist FALSCH!');
          console.log('⚠️  Aktualisiere Passwort...\n');
          
          bcrypt.hash('12345678', 10, (err, hash) => {
            if (err) {
              console.error('❌ Hash Fehler:', err.message);
              db.close();
            } else {
              db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id], (err) => {
                if (err) {
                  console.error('❌ Update Fehler:', err.message);
                } else {
                  console.log('✅ Passwort aktualisiert!');
                }
                db.close();
              });
            }
          });
        }
      });
    }
  });
});
