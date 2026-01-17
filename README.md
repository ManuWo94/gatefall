# Gatefall

A browser-based "Solo Leveling"-style dungeon game with UI-based combat.

## Setup & Running

### Prerequisites
- Node.js (for TypeScript compiler and backend server)

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Email (optional):**
   Create a `.env` file in the root directory for production email sending:
   ```env
   SMTP_HOST=smtp.your-provider.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-password
   SMTP_FROM=GateFall <noreply@gatefall.com>
   BASE_URL=http://localhost:3000
   
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_CALLBACK_URL=http://localhost:3000/api/auth/discord/callback
   
   SESSION_SECRET=change-this-to-random-string-in-production
   ```
   
   **Development Mode:** If no `.env` is configured, verification links will be logged to the console.
   
   **Discord Setup:**
   1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
   2. Create a new application
   3. Navigate to OAuth2 settings
   4. Add redirect URI: `http://localhost:3000/api/auth/discord/callback`
   5. Copy Client ID and Client Secret to `.env`

3. **Compile TypeScript:**
   ```bash
   npm run build
   ```

4. **Start the server:**
   ```bash
   npm run server
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000`

### Development Mode

For automatic recompilation on file changes:
```bash
npm run watch
```

Run this in a separate terminal while the server is running.

## Current Features

### Step 7.0: Account-System
- E-Mail/Passwort-Registrierung und Login
- Sichere Session-Verwaltung mit Cookies
- Passwort-Hashing mit bcrypt
- SQLite-Datenbank für Nutzer und Progression

### Step 7.1: E-Mail-Verifizierung
- Registrierte Nutzer müssen ihre E-Mail-Adresse bestätigen
- Versand von Verifizierungs-E-Mails mit nodemailer
- Sichere Token-Generierung und -Hashing
- Verifizierungsbanner im Spiel
- Gameplay-Sperre bis zur Bestätigung
- "Link erneut senden"-Funktion mit Rate Limiting (60 Sek.)
- Dev-Mode: Verifizierungslinks werden in der Konsole ausgegeben

### Discord OAuth2 Login
- Anmeldung mit Discord-Account
- Automatische Account-Erstellung für neue Discord-Nutzer
- Discord-Avatar und Username-Integration
- E-Mail-Verifizierung nicht erforderlich bei Discord-Login (falls von Discord verifiziert)
- Unterstützung für beide Login-Methoden (E-Mail/Passwort + Discord)

### Combat Features (Step 1)
- Basic UI combat sandbox
- Player vs single enemy
- Auto-attack combat (350ms ticks)
- HP/MP bars with visual feedback
- Combat log
- Victory/defeat conditions
- Skill buttons (placeholder)

## Project Structure

```
gatefall/
├── index.html              # Main HTML layout
├── styles.css              # UI styling
├── src/
│   ├── main.ts            # Application bootstrap
│   ├── ui.ts              # UI rendering logic
│   └── combat/
│       ├── types.ts       # Type definitions
│       └── engine.ts      # Combat tick engine
├── dist/                  # Compiled JavaScript (generated)
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```
