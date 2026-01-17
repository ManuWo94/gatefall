# Railway.app Deployment (EMPFOHLEN)

## Warum Railway?
- ✅ Automatische Node.js-Erkennung
- ✅ Automatische Deployments bei Git-Push
- ✅ Kostenloser Plan verfügbar
- ✅ HTTPS automatisch
- ✅ Umgebungsvariablen einfach setzen
- ✅ Keine Server-Konfiguration nötig

## Setup (5 Minuten)

### 1. Account erstellen
- Gehe zu: https://railway.app
- Klicke **"Start a New Project"**
- Login mit GitHub

### 2. Projekt deployen
- **"Deploy from GitHub repo"**
- Repository auswählen: `ManuWo94/gatefall`
- Railway erkennt automatisch Node.js

### 3. Environment Variables setzen
- Im Railway-Dashboard → **Variables**
- Folgende hinzufügen:

```
DISCORD_CLIENT_ID=1461890075355906099
DISCORD_CLIENT_SECRET=zLmhrLJRFZ8Q3oYCHmHBAZJ8YYZUopYR
DISCORD_CALLBACK_URL=https://deine-railway-domain.up.railway.app/api/auth/discord/callback
SESSION_SECRET=gatefall-production-secret-$(openssl rand -hex 32)
BASE_URL=https://deine-railway-domain.up.railway.app
NODE_ENV=production
```

### 4. Start Command setzen (falls nötig)
- Settings → **Start Command**: `npm run server`

### 5. Domain bekommen
- Railway gibt dir automatisch eine Domain wie:
  `gatefall-production-xyz.up.railway.app`
- Oder verbinde deine eigene Domain

### 6. Discord Redirect URI aktualisieren
- Discord Developer Portal → OAuth2 → Redirects
- Aktualisiere zu: `https://deine-railway-domain.up.railway.app/api/auth/discord/callback`

## Automatische Updates
Jedes Mal wenn du `git push` machst:
- Railway zieht automatisch den Code
- Baut die App neu
- Deployed sie

## Fertig! 🚀

Die App läuft dann unter deiner Railway-URL und funktioniert sofort!

---

# Alternative: Render.com

Falls Railway nicht funktioniert:

1. https://render.com → Sign Up
2. **New** → **Web Service**
3. GitHub-Repo verbinden: `ManuWo94/gatefall`
4. **Settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run server`
5. Environment Variables wie oben eintragen
6. **Create Web Service**
