# 🎯 EINFACHES DEPLOYMENT - Ohne Terminal!

## So deployed du die neuesten Änderungen:

### Schritt 1: Öffne dein Plesk-Panel
Gehe zu: https://dein-plesk-login.de

### Schritt 2: Navigiere zu deiner Domain
- Klicke auf "keen-goldwasser.5-9-96-43.plesk.page"

### Schritt 3: Git-Updates ziehen
- Klicke im Menü auf **"Git"**
- Klicke auf **"Pull Updates"** (der blaue Button)
- Warte bis "Success" erscheint

### Schritt 4: Deployment ausführen

**Option A: Im Browser (EINFACHSTE METHODE)**
1. Öffne in deinem Browser:
   ```
   https://keen-goldwasser.5-9-96-43.plesk.page/deploy-web.html
   ```
2. Klicke auf den Button **"Deploy starten"**
3. Warte bis "✅ Deployment abgeschlossen!" erscheint
4. Fertig! 🎉

**Option B: Über Plesk File Manager**
1. Gehe im Plesk zu **"Dateien"** (File Manager)
2. Navigiere zu: `httpdocs/gatefall/`
3. Rechtsklick auf `deploy-plesk.sh`
4. Wähle "Execute" oder "Run"

**Option C: Über Plesk Terminal (Scheduled Tasks)**
1. Gehe zu **"Scheduled Tasks"** (Geplante Aufgaben)
2. Erstelle neue Aufgabe
3. Befehl: `cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall && bash deploy-plesk.sh`
4. Klicke "Run Now"

## Das war's! 🚀

Nach dem Deployment kannst du die Website normal nutzen:
- URL: https://keen-goldwasser.5-9-96-43.plesk.page
- Test-Login: test@dev.de / 12345678

## Troubleshooting

**Website lädt nicht?**
- Warte 30 Sekunden (Server braucht Zeit zum Neustart)
- Leere Browser-Cache (Strg + F5)

**Deploy-Button funktioniert nicht?**
- Stelle sicher, dass `deploy-handler.php` hochgeladen wurde
- Prüfe ob PHP auf dem Server läuft

**Immer noch Probleme?**
- Gehe zu Plesk → Node.js → Restart Application
