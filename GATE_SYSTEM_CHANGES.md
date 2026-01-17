# Gate-System Überarbeitung - Änderungsdokumentation

## Übersicht
Das Gate-System wurde komplett überarbeitet, um ein modernes, prozedural generiertes Dungeon-System mit 60 verschiedenen Gates pro Tag zu implementieren.

## 🎯 Hauptänderungen

### 1. Boss-System & Gate-Ränge
**Datei**: `src/combat/gates.ts` (NEU)

- **60+ Bosse** über alle Ränge (D bis SS)
- Jeder Rang hat Boss-Gegner und Elite/Mini-Bosse
- Bosse haben spezifische Stats (HP, Schaden) pro Rang:
  - 🟤 **D-Rang**: Höhlentroll, Grabwächter, etc. (HP: 450-600)
  - 🔵 **C-Rang**: Schattenbestie, Flammenhüter, etc. (HP: 750-900)
  - 🟢 **B-Rang**: Kettenrichter, Blutarchivar, etc. (HP: 1150-1300)
  - 🟡 **A-Rang**: Dämonenfürst, Seelenverschlinger, etc. (HP: 1750-2000)
  - 🔴 **S-Rang**: Erzdrache, Leviathan, etc. (HP: 2850-3300)
  - ⚫ **SS-Rang**: Namenloser Monarch, Weltenverschlinger, etc. (HP: 4800-6000)

### 2. Prozeduraler Gate-Generator
**Features**:
- Generiert 60 Gates täglich mit festem Seed (basierend auf Datum)
- Verteilung: 15×D, 15×C, 12×B, 10×A, 6×S, 2×SS
- Jedes Gate hat:
  - Einzigartige Namen (z.B. "Verlassene Höhle", "Dämonenpalast")
  - 3-8 normale Gegner (je nach Rang)
  - 1-4 Elite/Mini-Bosse (je nach Rang)
  - 1 Haupt-Boss am Ende
  - Schwierigkeitsgrad 1-10

### 3. Rollensystem mit Level-basierten Titeln
**Datei**: `src/combat/types.ts`

**Neue Funktion**: `getPlayerTitle(level, rank, role)`

- **Level 1-9**: Titel = Rang + Rollenname
  - Beispiel: "D-Rang Heiler", "C-Rang Magier"
- **Level 10+**: Titel = Rang + "Hunter"
  - Beispiel: "C-Rang Hunter", "B-Rang Hunter"

**Wichtig**: Rolle kann nach Registrierung NICHT mehr gewechselt werden!

### 4. Kachel-UI für Gates
**Datei**: `index.html`, `styles.css`

**Neue UI-Komponenten**:
- Gates-Header mit Statistiken
  - Anzeige: Abgeschlossene Gates (z.B. "12/60 Gates")
  - Täglicher Reset-Timer (Countdown bis Mitternacht)
  
- Filter-Leiste
  - Buttons für: Alle, D, C, B, A, S, SS
  - Zeigt Anzahl verfügbarer Gates pro Rang
  
- Gates-Grid (Kachelsystem)
  - Responsive Grid (auto-fill, min. 280px pro Kachel)
  - Jede Kachel zeigt:
    - Rang-Badge mit Farbe
    - Gate-Name
    - Schwierigkeit (1-10 Punkte)
    - Anzahl Gegner
    - Boss-Name
    - "BETRETEN" Button oder "ABGESCHLOSSEN" Badge

**CSS-Styling**:
- Rang-spezifische Farben:
  - D: Braun (#d2691e)
  - C: Blau (#60a5fa)
  - B: Grün (#4ade80)
  - A: Gelb (#facc15)
  - S: Rot (#f87171)
  - SS: Lila (#c084fc)

### 5. Gates-UI Manager
**Datei**: `src/gates-ui.ts` (NEU)

**Funktionalität**:
- Lädt Gates beim Panel-Öffnen
- Filtert Gates nach Rang
- Rendert Gate-Kacheln dynamisch
- Verwaltet abgeschlossene Gates
- Speichert Fortschritt auf Server
- Täglicher Reset-Timer

### 6. Backend-Integration

#### Neue Datenbank-Tabelle
**Datei**: `server/db.js`
```sql
CREATE TABLE player_gates (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    gate_date TEXT NOT NULL,
    completed_gate_ids TEXT DEFAULT '[]',
    UNIQUE(user_id, gate_date)
)
```

#### Neue API-Routen
**Datei**: `server/routes/gates.js` (NEU)

- `GET /api/gates` - Lädt abgeschlossene Gates des Tages
- `POST /api/gates/complete` - Markiert Gate als abgeschlossen

### 7. Tägliches Reset-System

**Mechanismus**:
- Gates werden mit Datum-basiertem Seed generiert
- Jeder Tag hat andere Gates
- Um Mitternacht (00:00 Uhr) reset
- Abgeschlossene Gates werden pro Tag gespeichert

**Implementation**:
```typescript
const dateSeed = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const gates = GateGenerator.generateGatePool(playerLevel, playerRank);
```

## 📊 Datenfluss

1. **Spieler öffnet Gates-Panel**
   - Frontend lädt Player-Level & Rang
   - Generiert 60 Gates mit heutigem Seed
   - Lädt abgeschlossene Gates vom Server

2. **Spieler betritt Gate**
   - Gate-Daten werden an Combat-Engine übergeben
   - Panel wechselt zu Combat
   - Kampf startet mit Gate-Gegnern

3. **Spieler besiegt Boss**
   - Gate wird als abgeschlossen markiert
   - Gate-ID wird an Server gesendet
   - UI aktualisiert (Kachel zeigt "ABGESCHLOSSEN")

4. **Täglicher Reset (Mitternacht)**
   - Neuer Tag = Neues Seed
   - Neue 60 Gates werden generiert
   - Alte abgeschlossene Gates bleiben in DB (historisch)

## 🎮 NPC-Party-System (Geplant)

Siehe: `NPC_PARTY_SYSTEM.md`

**Konzept**:
- Spieler können bis zu 3 NPCs aus ihrer Vereinigung mitnehmen
- NPCs haben eigene Stats und Rollen
- NPCs greifen automatisch an und verwenden Skills
- Bessere Vereinigungen = Bessere NPCs

**Status**: Dokumentiert, noch nicht implementiert

## 🔄 Migration & Kompatibilität

**Bestehende Systeme**:
- ✅ Combat-Engine kompatibel
- ✅ Progression-System erweitert (hunter_rank vorhanden)
- ✅ Rollen-System unverändert (nur Titel-Display neu)

**Neue Anforderungen**:
- TypeScript muss kompiliert werden: `npx tsc`
- Server muss neu gestartet werden (neue Route)
- Datenbank-Migration läuft automatisch beim Start

## 📁 Neue Dateien

1. `src/combat/gates.ts` - Boss-Definitionen & Gate-Generator
2. `src/gates-ui.ts` - UI-Manager für Gates
3. `server/routes/gates.js` - API-Routen
4. `NPC_PARTY_SYSTEM.md` - Dokumentation

## 🎨 UI-Verbesserungen

- Kachel-basiertes Design (wie gewünscht)
- Hover-Effekte mit Glow
- Rang-spezifische Farben
- Schwierigkeits-Indikator (10 Punkte)
- Filter-System für schnelle Navigation
- Reset-Timer für Transparenz

## 🚀 Nächste Schritte (Optional)

1. **Multiplayer-Gates**: Mehrere Spieler können zusammen Gates betreten
2. **NPC-Party Implementation**: System aus Dokumentation umsetzen
3. **Gate-Statistiken**: Tracking von Clear-Zeiten, Highscores
4. **Belohnungs-System**: Bessere Rewards für höhere Ränge
5. **Gate-Schwierigkeit**: Dynamische Anpassung an Spieler-Level

## 📝 Testing-Empfehlung

1. Compilieren: `npx tsc`
2. Server starten: `node server/index.js`
3. Einloggen und Gates-Panel öffnen
4. Verschiedene Filter testen
5. Gate betreten und Kampf testen
6. Abgeschlossenes Gate überprüfen
7. Am nächsten Tag: Neue Gates überprüfen
