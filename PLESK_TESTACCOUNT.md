# Plesk Deployment Guide

## Problem: Testaccount funktioniert nicht

Der Testaccount existiert nur lokal im Codespace. Die Datenbank auf dem Plesk-Server muss synchronisiert werden.

## ✅ Lösung: Deploy Command in Plesk

In Plesk Git Settings → **"Deploy actions"** oder **"Additional Deploy Commands"** eintragen:
```
deploy
```

**WICHTIG:** Nur `deploy` eintragen, NICHT `npm run deploy` oder `node deploy.js`!
Plesk fügt automatisch `npm run` davor hinzu.

## Alternative: Manuell über Plesk Terminal

1. Öffne **Plesk** → **Websites & Domains**
2. Wähle: **keen-goldwasser.5-9-96-43.plesk.page**
3. Klicke auf **"File Manager"** → **"Terminal"** oder **"Web Terminal"**
4. Führe aus:

```bash
cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall
npm run deploy
```

## Testaccount Daten:

```
📧 E-Mail: test@dev.de
🔑 Passwort: 12345678
👤 Name: Manu
```

## Wichtig:

- Die Datenbank `server/gatefall.db` wird NICHT via Git synchronisiert
- Nach jedem Deployment wird der Testaccount neu erstellt
- Wenn der Account schon existiert, wird eine Meldung angezeigt
