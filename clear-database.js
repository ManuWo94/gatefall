const db = require('./server/db');

console.log('🗑️  Lösche alle Daten aus der Datenbank...\n');

// Alle Tabellen leeren
db.serialize(() => {
  // Progression zuerst (wegen Foreign Key)
  db.run('DELETE FROM progression', (err) => {
    if (err) {
      console.error('❌ Fehler beim Löschen von progression:', err);
    } else {
      console.log('✅ Tabelle progression geleert');
    }
  });

  // Users
  db.run('DELETE FROM users', (err) => {
    if (err) {
      console.error('❌ Fehler beim Löschen von users:', err);
    } else {
      console.log('✅ Tabelle users geleert');
    }
  });

  // SQLite Sequences zurücksetzen
  db.run('DELETE FROM sqlite_sequence WHERE name IN ("users", "progression")', (err) => {
    if (err) {
      console.error('❌ Fehler beim Zurücksetzen der IDs:', err);
    } else {
      console.log('✅ Auto-Increment IDs zurückgesetzt');
    }
  });

  // Abschließend Anzahl prüfen
  setTimeout(() => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('❌ Fehler:', err);
      } else {
        console.log('\n📊 Anzahl User:', row.count);
      }
    });

    db.get('SELECT COUNT(*) as count FROM progression', (err, row) => {
      if (err) {
        console.error('❌ Fehler:', err);
      } else {
        console.log('📊 Anzahl Progression:', row.count);
        console.log('\n✅ Datenbank ist jetzt leer!\n');
        process.exit(0);
      }
    });
  }, 500);
});
