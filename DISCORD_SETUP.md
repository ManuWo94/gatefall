# Discord OAuth Setup-Anleitung

## 1. Discord Application erstellen

1. Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
2. Klicke auf "New Application"
3. Gib einen Namen ein (z.B. "GateFall")
4. Akzeptiere die Nutzungsbedingungen und klicke auf "Create"

## 2. OAuth2 konfigurieren

1. Wähle deine App aus der Liste
2. Gehe zu "OAuth2" im Seitenmenü
3. Klicke auf "Add Redirect" unter "Redirects"
4. Füge hinzu:
   - Lokal: `http://localhost:3000/api/auth/discord/callback`
   - Produktion: `https://deine-domain.de/api/auth/discord/callback`
5. Klicke auf "Save Changes"

## 3. Client-Credentials abrufen

1. Gehe zu "OAuth2" → "General"
2. Kopiere die **CLIENT ID**
3. Klicke auf "Reset Secret" (falls nötig) und kopiere das **CLIENT SECRET**
   ⚠️ **Wichtig:** Das Secret wird nur einmal angezeigt!

## 4. .env-Datei konfigurieren

Erstelle eine `.env`-Datei im Root-Verzeichnis (oder bearbeite die existierende):

```env
DISCORD_CLIENT_ID=deine_client_id_hier
DISCORD_CLIENT_SECRET=dein_client_secret_hier
DISCORD_CALLBACK_URL=http://localhost:3000/api/auth/discord/callback
```

Für Produktion:
```env
DISCORD_CALLBACK_URL=https://deine-domain.de/api/auth/discord/callback
```

## 5. Server neu starten

```bash
npm run server
```

Du solltest diese Meldung sehen:
```
✓ Discord OAuth aktiviert
```

## 6. Testen

1. Öffne http://localhost:3000
2. Klicke auf "Mit Discord anmelden"
3. Autorisiere die App
4. Du wirst automatisch eingeloggt und weitergeleitet

## Fehlerbehebung

### "Discord OAuth nicht konfiguriert"
- Überprüfe, ob die `.env`-Datei im Root-Verzeichnis ist
- Stelle sicher, dass `DISCORD_CLIENT_ID` und `DISCORD_CLIENT_SECRET` gesetzt sind
- Starte den Server neu

### "discord_auth_failed" in der URL
- Überprüfe die Redirect URI in der Discord-App
- Sie muss exakt mit `DISCORD_CALLBACK_URL` übereinstimmen
- Protokoll (http/https), Port und Pfad müssen identisch sein

### "Invalid OAuth2 redirect_uri"
- Die Redirect URI in der Discord-App stimmt nicht mit der konfigurierten überein
- Füge die korrekte URL in den Discord OAuth2-Einstellungen hinzu

## Scopes

Die App nutzt folgende Scopes:
- `identify`: Zugriff auf Discord-Username und Avatar
- `email`: Zugriff auf verifizierte E-Mail-Adresse (falls vorhanden)

## Sicherheitshinweise

- **Teile niemals dein CLIENT SECRET!**
- Füge `.env` zu `.gitignore` hinzu (bereits vorhanden)
- In Produktion: Verwende Umgebungsvariablen des Hosting-Anbieters
- Setze ein starkes `SESSION_SECRET` in der `.env`
