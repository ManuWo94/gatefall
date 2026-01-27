# Gatefall mit XAMPP nutzen

## ✅ Setup abgeschlossen!

Das Projekt ist jetzt für XAMPP konfiguriert.

## 🚀 Server starten

### 1. XAMPP Control Panel öffnen
- Starte `C:\xampp\xampp-control.exe`
- Klicke auf **Start** bei Apache
- Port 80 sollte aktiv sein

### 2. Backend-Server starten
Öffne eine der folgenden Dateien:
- `START-SERVER.bat` (empfohlen)
- Oder: `START-BACKEND.bat`

Der Node.js-Server läuft dann im Hintergrund auf Port 3000.

## 🌐 Zugriff

Öffne im Browser:
```
http://localhost/Gatefall/
```

## 🔑 Test-Login

- **E-Mail**: test@test.com
- **Passwort**: test123

## ⚙️ Wie es funktioniert

1. **Apache (Port 80)** liefert statische Dateien (HTML, CSS, JS)
2. **Node.js (Port 3000)** verarbeitet API-Requests
3. **.htaccess** leitet `/api/*` Requests an Node.js weiter

## 📁 Wichtige Dateien

- `.htaccess` - Apache Rewrite Rules
- `server/index.js` - Node.js Backend
- `dist/main.js` - Kompiliertes Frontend

## 🛠️ Bei Änderungen

Nach TypeScript-Änderungen kompilieren:
```bash
npm run build
```

Oder automatisch bei Änderungen:
```bash
npm run watch
```

## ❓ Probleme?

### Apache läuft nicht
- XAMPP Control Panel öffnen
- Apache starten
- Port 80 prüfen (nicht von Skype etc. belegt)

### Backend antwortet nicht
- `START-SERVER.bat` ausführen
- Port 3000 darf nicht belegt sein

### Login funktioniert nicht
- Prüfe dass beide Server laufen
- Browser-Konsole (F12) für Fehler prüfen
- Cache leeren (Strg+F5)
