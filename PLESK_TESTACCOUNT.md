# Plesk Deployment Guide

## Problem: Testaccount funktioniert nicht

Der Testaccount existiert nur lokal im Codespace. Die Datenbank auf dem Plesk-Server muss synchronisiert werden.

## Lösung 1: Über Plesk File Manager

1. Öffne Plesk → Websites & Domains → keen-goldwasser.5-9-96-43.plesk.page
2. Klicke auf "File Manager"
3. Navigiere zu: `/httpdocs/gatefall/`
4. Öffne die Terminal/SSH-Option oder führe über Scheduled Tasks aus:

```bash
cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall
git pull origin main
node create-test-user.js
```

## Lösung 2: Via Git Deployment Hook

Das deploy-plesk.sh Script automatisch nach jedem `git push` ausführen:

1. In Plesk: Git Settings → "Deploy actions"
2. Füge hinzu: `bash deploy-plesk.sh`

## Lösung 3: Manuell via SSH (falls verfügbar)

```bash
ssh plesk@5-9-96-43.plesk.page
cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall
bash deploy-plesk.sh
```

## Aktueller Testaccount:

```
📧 E-Mail: test@dev.de
🔑 Passwort: 12345678
👤 Name: Manu
```

## Wichtig:

Die Datenbank `server/gatefall.db` wird NICHT automatisch via Git synchronisiert!
Nach jedem `git pull` muss `node create-test-user.js` ausgeführt werden.
