# GateFall Plesk Setup-Anleitung

## Problem: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

Dein Node.js-Server läuft, aber Plesk leitet die API-Anfragen nicht weiter.

## Lösung: Node.js App in Plesk konfigurieren

### Option 1: Node.js Extension in Plesk nutzen

1. **In Plesk:** Gehe zu deiner Domain
2. **Node.js** (in der Sidebar)
3. **Enable Node.js** aktivieren
4. **Konfiguration:**
   - Application mode: `production`
   - Application root: `/pfad/zu/gatefall`
   - Application startup file: `server/index.js`
   - Node.js version: 18.x oder höher
5. **Environment variables** hinzufügen:
   ```
   NODE_ENV=production
   ```
6. **NPM install** klicken
7. **Restart App** klicken

### Option 2: Reverse Proxy manuell konfigurieren

Wenn Node.js Extension nicht verfügbar ist:

1. **In Plesk:** Domain → **Apache & nginx Settings**
2. **Additional nginx directives** (ganz unten):
   
   ```nginx
   location /api/ {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_cache_bypass $http_upgrade;
   }
   
   location / {
       try_files $uri $uri/ @nodejs;
   }
   
   location @nodejs {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
   }
   ```

3. **OK** klicken
4. Node.js-Server manuell starten:
   ```bash
   cd /pfad/zu/gatefall
   nohup npm run server > server.log 2>&1 &
   ```

### Option 3: PM2 nutzen (empfohlen für Dauerbetrieb)

```bash
# PM2 global installieren
npm install -g pm2

# App mit PM2 starten
cd /pfad/zu/gatefall
pm2 start server/index.js --name gatefall

# Autostart bei Server-Neustart
pm2 startup
pm2 save
```

Dann Reverse Proxy wie in Option 2 konfigurieren.

## Testen

Nach der Konfiguration:
```bash
curl https://keen-goldwasser.5-9-96-43.plesk.page/api/auth/test
```

Sollte JSON zurückgeben, nicht HTML!
