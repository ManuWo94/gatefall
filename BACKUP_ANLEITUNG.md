# 📦 Backup & Datensicherung - Gatefall

## ⚠️ Problem
Alle Admin-Daten (Skills, Bilder, Gegner, etc.) werden aktuell im **Browser LocalStorage** gespeichert.  
Das bedeutet:
- ❌ Beim Browser-Cache löschen sind die Daten weg
- ❌ Jeder Browser hat eigene Daten
- ❌ Kein automatisches Backup auf dem Server

---

## ✅ Lösung: Export/Import System

### 🔹 1. Backup erstellen (Export)

**Im Admin Panel:**
1. Klicke oben rechts auf **"💾 Backup erstellen"**
2. Eine JSON-Datei wird heruntergeladen: `gatefall-backup-2026-01-20.json`
3. **Speichere diese Datei an einem sicheren Ort!**

**Was wird gesichert:**
- ⚔️ Alle Skills (inkl. Bilder)
- 👹 Alle Gegner & Bosse
- 👤 Alle Characters
- 🏰 Alle Gilden
- 🎨 Alle Kampf-Hintergründe

---

### 🔹 2. Backup wiederherstellen (Import)

**Im Admin Panel:**
1. Klicke oben rechts auf **"📥 Backup laden"**
2. Wähle deine gespeicherte `.json` Datei aus
3. Alle Daten werden wiederhergestellt!

**Alternative Methode (für Profis):**
1. Gehe zum Tab **"Datenbank"**
2. Füge den JSON-Inhalt in das Textfeld ein
3. Klicke auf **"📤 Importieren"**

---

## 🔄 Auto-Backup

Das System erstellt **automatisch alle 30 Minuten** ein Backup im Browser.

**Backup-Status sehen:**
- Gehe zum Tab **"Datenbank"**
- Dort siehst du:
  - 📦 Anzahl gespeicherter Daten
  - 💾 Letztes manuelles Backup
  - 🔄 Letztes Auto-Backup

---

## 📋 Best Practices

### ✅ DO:
- **Regelmäßig Backups erstellen** (z.B. nach großen Änderungen)
- **Backup-Dateien sicher aufbewahren** (Dropbox, Google Drive, USB-Stick)
- **Vor größeren Updates** ein Backup machen
- **Mehrere Backup-Versionen** behalten (nicht immer überschreiben)

### ❌ DON'T:
- **Nie nur auf Browser LocalStorage verlassen**
- **Browser-Cache nicht löschen** ohne vorheriges Backup
- **Backup-Dateien nicht verlieren**

---

## 🆘 Notfall: Daten verloren?

1. **Auto-Backup prüfen:**
   ```javascript
   // In Browser Console (F12):
   const autoBackup = localStorage.getItem('gatefall_auto_backup');
   console.log(autoBackup);
   ```

2. **Auto-Backup wiederherstellen:**
   - Kopiere den JSON-Text aus der Console
   - Gehe zu Admin Panel → Datenbank
   - Füge den JSON ein und klicke auf "Importieren"

3. **Wenn auch Auto-Backup weg ist:**
   - Prüfe deine Backup-Dateien (`.json`)
   - Importiere das neueste Backup

---

## 🔮 Zukünftige Features (geplant)

- ☁️ Cloud-Sync (automatisch auf Server speichern)
- 📧 Email-Backup (Backup per Mail)
- ⏱️ Versionierung (mehrere Backup-Versionen speichern)
- 🔒 Verschlüsselte Backups

---

## 💡 Tipps

### Backup-Datei öffnen
Backup-Dateien sind **JSON-Dateien** und können mit jedem Texteditor geöffnet werden:
- Notepad
- VS Code
- Notepad++

### Backup manuell bearbeiten
Du kannst die JSON-Datei auch manuell bearbeiten:
```json
{
  "skills": [...],
  "enemies": [...],
  "characters": [...],
  "guilds": [...],
  "backgrounds": [...]
}
```

### Mehrere Backups kombinieren
1. Öffne beide Backup-Dateien
2. Kopiere z.B. Skills aus Backup A
3. Füge sie in Backup B ein
4. Importiere das kombinierte Backup

---

## 📞 Support

Bei Problemen:
1. Prüfe Browser Console (F12) auf Fehlermeldungen
2. Prüfe ob Backup-Datei gültig ist (JSON-Format)
3. Erstelle ein neues Backup und teste Import

**Viel Erfolg mit Gatefall! 🎮**
