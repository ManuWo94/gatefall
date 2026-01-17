# Plesk Deployment - Gatefall

## Automatisches Deployment

Wenn du Code-Änderungen auf Plesk deployen möchtest, führe einfach das Deploy-Skript aus:

```bash
cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall
bash deploy-plesk.sh
```

Das Skript macht automatisch:
- ✅ Git Pull (neuester Code)
- ✅ npm install (Dependencies)
- ✅ Datenbank-Migration (neue Spalten)
- ✅ TypeScript kompilieren
- ✅ Test-Account erstellen
- ✅ PM2 Neustart

## Oder via Plesk Git-Integration

Wenn du die Plesk Git-Integration nutzt:

1. Gehe zu: **Git** → **Pull Updates**
2. Dann führe aus:
```bash
cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall
bash auto-deploy.sh
```

## Manuelle Schritte (falls nötig)

### 1. Datenbank migrieren
```bash
node migrate-db.js
```

### 2. TypeScript kompilieren
```bash
npx tsc
```

### 3. Server neu starten
```bash
pm2 restart gatefall
```

### 4. Server-Status prüfen
```bash
pm2 status
pm2 logs gatefall --lines 50
```

## Erstmaliges Setup auf Plesk

```bash
cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall
npm install
node migrate-db.js
npx tsc
node create-test-user.js
pm2 start app.js --name gatefall
pm2 save
pm2 startup
```

## Test-Account

Nach dem Deployment kannst du dich einloggen mit:
- 📧 E-Mail: `test@dev.de`
- 🔑 Passwort: `12345678`
- 👤 Name: `Manu`

## Debugging

Wenn etwas nicht funktioniert:

```bash
# Prüfe Server-Status
bash check-plesk.sh

# Prüfe Datenbank-Schema
node check-db-schema.js

# Prüfe PM2-Logs
pm2 logs gatefall --lines 100
```

## Wichtige Änderungen

### Neue Features in diesem Update:
- ✅ Rollensystem: Spieler wählen bei Registrierung eine Rolle
- ✅ Gates-System: 60 prozedural generierte Dungeons täglich
- ✅ Level-basierte Titel: "D-Rang Heiler" → "C-Rang Hunter" ab Level 10
- ✅ Kachel-UI für Gates mit Filter-System
- ✅ Täglicher Reset-Timer

### Datenbank-Änderungen:
- Neue Spalte: `progression.role` (Spieler-Rolle)
- Neue Tabelle: `player_gates` (Abgeschlossene Gates)

## Troubleshooting

### Problem: "404 Not Found" bei /api/profile
**Lösung:** Server neu starten
```bash
pm2 restart gatefall
```

### Problem: "400 Bad Request" bei Registrierung
**Lösung:** Datenbank migrieren
```bash
node migrate-db.js
pm2 restart gatefall
```

### Problem: Gates werden nicht geladen
**Lösung:** TypeScript neu kompilieren
```bash
npx tsc
pm2 restart gatefall
```

### Problem: PM2 läuft nicht
**Lösung:** PM2 starten
```bash
pm2 start app.js --name gatefall
pm2 save
```
