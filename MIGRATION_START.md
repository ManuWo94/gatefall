# 🚀 SCHNELLSTART - MySQL Migration

## ✅ Du bist hier!

MySQL ist erfolgreich eingerichtet! 15 Tabellen wurden erstellt.

---

## 📋 Nächste Schritte:

### **Schritt 1: Backup erstellen** 💾

1. Öffne: http://localhost/Gatefall/admin.html
2. Klicke oben rechts: **"💾 Backup erstellen"**
3. Speichere die JSON-Datei (z.B. `gatefall-backup-2026-01-20.json`)

---

### **Schritt 2: Daten migrieren** 🔄

```bash
cd C:\xampp\htdocs\Gatefall
node server/migrate-to-mysql.js gatefall-backup-2026-01-20.json
```

**Ausgabe:**
```
🔄 Starte Migration...
📦 Importiere XX Skills...
✅ XX Skills importiert
📦 Importiere XX Gegner...
✅ XX Gegner importiert
✅ Migration abgeschlossen!
```

---

### **Schritt 3: Admin User erstellen** 👤

```bash
node server/create-admin.js
```

Oder manuell in phpMyAdmin:
```sql
INSERT INTO users (email, password_hash, display_name, is_admin, email_verified_at)
VALUES ('admin@gatefall.de', '$2a$10$...', '⚙️ ADMIN', TRUE, NOW());
```

---

### **Schritt 4: Server auf MySQL umstellen** 🔧

```bash
# Backup alte db.js
mv server/db.js server/db-sqlite.js.backup

# MySQL db.js aktivieren  
cp server/db-mysql.js server/db.js
```

---

### **Schritt 5: Server testen** 🧪

```bash
npm run server
```

**Erwartete Ausgabe:**
```
✅ MySQL Verbindung erfolgreich!
Server läuft auf Port 3001
```

---

## 🎯 Was ist jetzt anders?

### **Vorher (LocalStorage):**
- ❌ Daten nur im Browser
- ❌ Jeder Browser eigene Daten
- ❌ Kein Multiplayer möglich

### **Jetzt (MySQL):**
- ✅ Zentrale Datenbank
- ✅ Alle Spieler sehen gleiche Daten
- ✅ Multiplayer ready!
- ✅ Echte Gilden & Parties
- ✅ Chat-System
- ✅ Online-Status

---

## 💡 Quick Commands

```bash
# Setup (bereits gemacht ✅)
node server/setup-mysql.js

# Migration
node server/migrate-to-mysql.js <backup.json>

# Server starten
npm run server

# MySQL testen
node -e "require('./server/db').query('SELECT 1').then(() => console.log('✅ OK'))"
```

---

## 🔍 Daten prüfen

### **Via phpMyAdmin:**
http://localhost/phpmyadmin → gatefall_db

### **Via Kommandozeile:**
```bash
mysql -u root gatefall_db
```

```sql
-- Skills anzeigen
SELECT COUNT(*) FROM game_skills;

-- Gegner anzeigen
SELECT COUNT(*) FROM enemies;

-- Users anzeigen
SELECT * FROM users;
```

---

## 🆘 Hilfe?

**Problem: Migration-Fehler**
→ Prüfe ob Backup-Datei gültig ist (JSON Format)
→ Öffne Datei und prüfe auf Fehler

**Problem: Server startet nicht**
→ Prüfe ob MySQL läuft (XAMPP)
→ Prüfe ob Datenbank existiert

**Problem: Keine Verbindung**
→ Prüfe `server/db.js` MySQL Credentials
→ Standard: user: root, password: '' (leer)

---

**Ready to go! 🎮**
