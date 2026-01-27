# 🚀 MySQL Setup & Migration - Gatefall

## ✅ Was wurde erstellt:

### 📁 Neue Dateien:
- `server/mysql-schema.sql` - Vollständiges Datenbank-Schema
- `server/db-mysql.js` - MySQL Datenbank-Wrapper
- `server/migrate-to-mysql.js` - Migration-Script
- `MYSQL_SETUP.md` - Diese Anleitung

---

## 📋 Setup Schritte

### **Schritt 1: MySQL Packages installieren**

```bash
cd C:\xampp\htdocs\Gatefall
npm install
```

Dies installiert:
- `mysql2` - MySQL Treiber
- `socket.io` - WebSockets für Echtzeit-Features

---

### **Schritt 2: Datenbank Schema importieren**

**Option A: Via phpMyAdmin (einfach):**
1. Öffne phpMyAdmin: http://localhost/phpmyadmin
2. Wähle links die Datenbank `gatefall_db`
3. Klicke oben auf "SQL"
4. Kopiere den Inhalt von `server/mysql-schema.sql`
5. Füge ein und klicke "OK"

**Option B: Via Kommandozeile:**
```bash
mysql -u root -p gatefall_db < server/mysql-schema.sql
```

---

### **Schritt 3: Admin-Daten migrieren**

**A) Backup erstellen (wenn noch nicht vorhanden):**
1. Öffne Admin Panel: http://localhost/Gatefall/admin.html
2. Klicke auf "💾 Backup erstellen"
3. Speichere die `.json` Datei

**B) Migration durchführen:**
```bash
node server/migrate-to-mysql.js gatefall-backup-2026-01-20.json
```

**Ausgabe:**
```
🔄 Starte Migration...

📦 Importiere 25 Skills...
✅ 25 Skills importiert

📦 Importiere 15 Gegner...
✅ 15 Gegner importiert

✅ Migration abgeschlossen!
   Skills: 25
   Gegner: 15
```

---

### **Schritt 4: Server umstellen**

**A) Alte db.js umbenennen:**
```bash
mv server/db.js server/db-sqlite.js.backup
```

**B) MySQL db.js aktivieren:**
```bash
mv server/db-mysql.js server/db.js
```

---

### **Schritt 5: Server testen**

```bash
npm run server
```

**Erwartete Ausgabe:**
```
✅ MySQL Verbindung erfolgreich!
Server läuft auf Port 3001
```

---

## 🗄️ Datenbank-Übersicht

### **Tabellen für Multiplayer:**

| Tabelle | Beschreibung |
|---------|--------------|
| `users` | Benutzer-Accounts |
| `player_stats` | Level, XP, Stats, Gold |
| `guilds` | Spieler-Gilden |
| `parties` | Co-op Gruppen |
| `party_members` | Wer ist in welcher Party |
| `game_skills` | Admin-definierte Skills |
| `player_skills` | Skills pro Spieler |
| `enemies` | Gegner & Bosse |
| `combat_logs` | Kampf-Historie |
| `chat_messages` | Chat-System |
| `inventory` | Items pro Spieler |
| `friendships` | Freundesliste |
| `sessions` | Online-Status |

### **Views:**
- `online_players` - Aktuell online Spieler
- `guild_rankings` - Gilden-Rangliste

### **Triggers:**
- Auto-create `player_stats` bei neuem User
- Auto-update `guild.current_members`

---

## 🔐 Admin Account

**Standard Admin:**
- Email: `admin@gatefall.de`
- Passwort: `admin123`

⚠️ **Bitte Passwort nach dem ersten Login ändern!**

---

## 🧪 Testen

### **Test 1: Datenbank-Verbindung**
```bash
node -e "require('./server/db').query('SELECT 1').then(() => console.log('✅ OK'))"
```

### **Test 2: Skills laden**
```bash
node -e "require('./server/db').getGameSkills().then(s => console.log('Skills:', s.length))"
```

### **Test 3: Admin Login**
```bash
node -e "require('./server/db').getUserByEmail('admin@gatefall.de').then(u => console.log('Admin:', u.display_name))"
```

---

## 🐛 Troubleshooting

### **Fehler: "Cannot connect to MySQL"**
- ✅ MySQL in XAMPP gestartet?
- ✅ Datenbank `gatefall_db` existiert?
- ✅ User/Passwort korrekt in `db-mysql.js`?

### **Fehler: "Table doesn't exist"**
- ✅ Schema importiert? (Schritt 2)
- ✅ Richtige Datenbank ausgewählt?

### **Skills/Gegner nicht da**
- ✅ Migration durchgeführt? (Schritt 3)
- ✅ Backup-Datei korrekt?

---

## 📊 Nächste Schritte

Nach erfolgreicher Migration:

### **Phase 1: Backend anpassen** ✅
- [x] MySQL Schema erstellt
- [x] DB Wrapper erstellt
- [x] Migration-Script erstellt
- [ ] Server-Routes auf MySQL umstellen

### **Phase 2: Frontend anpassen**
- [ ] Admin Panel Skills aus MySQL laden
- [ ] Player Stats aus MySQL laden
- [ ] LocalStorage → API Calls

### **Phase 3: Multiplayer Features**
- [ ] WebSocket-Server
- [ ] Party-System
- [ ] Chat-System
- [ ] Co-op Dungeons

---

## 💡 Wichtig

### **Daten sind jetzt zentral!**
- ✅ Alle Spieler sehen gleiche Skills/Gegner
- ✅ Admin-Änderungen sofort für alle sichtbar
- ✅ Kein LocalStorage mehr für Game-Daten
- ✅ Echte Multiplayer-Features möglich

### **LocalStorage bleibt für:**
- Session-Token (Login-Status)
- UI-Einstellungen
- Temporäre Daten

---

## 🔄 Backup & Restore

### **MySQL Backup erstellen:**
```bash
mysqldump -u root gatefall_db > backup.sql
```

### **MySQL Backup wiederherstellen:**
```bash
mysql -u root gatefall_db < backup.sql
```

---

## 📞 Support

Bei Problemen:
1. Prüfe MySQL Logs in XAMPP
2. Prüfe Node.js Console
3. Prüfe Browser Console (F12)

**Häufige Fehler:**
- Port 3306 blockiert → Anderes Programm nutzt MySQL
- Connection timeout → Firewall/Antivirus
- Schema-Fehler → SQL-Syntax für Views/Triggers

---

**Ready to go! 🚀**
