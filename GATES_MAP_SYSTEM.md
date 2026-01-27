# 🗺️ Gates Karten-System

## Übersicht

Das Gates Karten-System bietet eine **interaktive Weltkarte** für das Gatefall-Spiel mit konfigurierbaren Spawn-Zonen für Gates.

## Features

### 1. Interaktive Spieler-Karte (`gates-map.html`)
- ✅ Zeigt alle aktiven Gates auf der Weltkarte
- ✅ Hintergrund: `Weltkarte 1.png` aus `/public/assets/sprites/`
- ✅ Interaktive Steuerung:
  - **Mausrad**: Zoom (50% - 300%)
  - **Ziehen**: Karte bewegen
  - **Klick**: Gate auswählen
- ✅ Farbcodierte Gates nach Typ:
  - 📘 Standard (Blau)
  - ⚡ Instabil (Orange)
  - ⭐ Elite (Lila)
  - ⚠️ Katastrophe (Rot)
  - 💎 Geheim (Gold)
- ✅ Rang-Anzeige (D-SS) auf jedem Gate
- ✅ Spawn-Zonen werden angezeigt
- ✅ Gate-Details-Panel beim Klick
- ✅ Direkt Gate betreten von der Karte

### 2. Admin Spawn-Zonen Editor (`admin-spawn-zones.html`)
- ✅ Visuelle Konfiguration von Spawn-Zonen
- ✅ Zonen-Eigenschaften:
  - **Name**: Anzeigename der Zone
  - **Typ**: safe/standard/elite/danger
  - **Position**: X/Y Koordinaten (Klick auf Karte)
  - **Radius**: Größe der Zone (50-300px)
  - **Rang-Range**: Min/Max Ränge (D-SS)
  - **Spawn-Gewicht**: Wie oft Gates hier spawnen (0.1-2.0)
  - **Farbe**: Visuelle Anzeige auf der Karte
  - **Aktiv**: Zone an/aus
- ✅ Echtzeit-Vorschau beim Bearbeiten
- ✅ CRUD-Operationen (Erstellen/Bearbeiten/Löschen)

### 3. Datenbank-Integration

#### Neue Tabelle: `gate_spawn_zones`
```sql
CREATE TABLE gate_spawn_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    zone_name VARCHAR(100) NOT NULL,
    zone_type ENUM('standard', 'elite', 'danger', 'safe'),
    center_x INT NOT NULL,
    center_y INT NOT NULL,
    radius INT NOT NULL DEFAULT 100,
    min_rank ENUM('D', 'C', 'B', 'A', 'S', 'SS'),
    max_rank ENUM('D', 'C', 'B', 'A', 'S', 'SS'),
    is_active BOOLEAN DEFAULT TRUE,
    spawn_weight DECIMAL(3,2) DEFAULT 1.00,
    color VARCHAR(7) DEFAULT '#4CAF50',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Default Spawn-Zonen
6 vorkonfigurierte Zonen:
1. **Anfänger-Zone Nord** (Sicher, D-C, Grün)
2. **Zentrale Ebene** (Standard, D-B, Blau)
3. **Östliches Hochland** (Standard, C-A, Blau)
4. **Südlicher Wald** (Elite, B-S, Orange)
5. **Gefahrenzone West** (Gefahr, A-SS, Rot)
6. **Nordöstliche Wildnis** (Elite, A-SS, Orange)

### 4. Intelligentes Gate-Spawning

#### Rang-basierte Verteilung
- **D/C Gates**: 65% (häufig)
- **B/A Gates**: 30% (selten)
- **S/SS Gates**: 5% (sehr selten)

#### Zonen-basiertes Spawning
```javascript
// Gates spawnen nur in definierten Zonen
// Zonen mit höherem Gewicht bekommen mehr Gates
// Gates spawnen nur in Zonen die ihren Rang erlauben
```

**Beispiel**:
- Ein **S-Rang Gate** kann nur in Zonen spawnen wo `max_rank >= 'S'`
- Eine Zone mit `spawn_weight: 1.5` bekommt 50% mehr Gates als normale Zonen

## Dateien

### TypeScript/JavaScript
- `src/gates-map.ts` - Spieler-Karte (Canvas-Rendering)
- `src/admin-spawn-zones.ts` - Admin-Editor
- `src/gates-map.css` - Styles für beide Karten

### HTML
- `gates-map.html` - Spieler-Karte Seite
- `admin-spawn-zones.html` - Admin-Editor Seite

### Server
- `server/routes/admin-spawn-zones.js` - API für Zonen-Verwaltung
- `server/gates-system.js` - Aktualisiert für zonen-basiertes Spawning
- `server/create-spawn-zones-table.js` - Datenbank-Setup

### API Endpoints

#### GET `/api/admin/spawn-zones`
Gibt alle Spawn-Zonen zurück
```json
{
    "zones": [
        {
            "id": 1,
            "zone_name": "Anfänger-Zone Nord",
            "zone_type": "safe",
            "center_x": 250,
            "center_y": 150,
            "radius": 120,
            "min_rank": "D",
            "max_rank": "C",
            "spawn_weight": 1.50,
            "color": "#4CAF50",
            "is_active": true
        }
    ]
}
```

#### POST `/api/admin/spawn-zones`
Erstellt neue Spawn-Zone

#### PUT `/api/admin/spawn-zones`
Aktualisiert existierende Zone

#### DELETE `/api/admin/spawn-zones/:id`
Löscht Zone

## Installation

1. **Datenbank-Tabelle erstellen**:
```bash
node server/create-spawn-zones-table.js
```

2. **TypeScript kompilieren**:
```bash
npx tsc
```

3. **Server starten**:
```bash
npm run server
```

## Verwendung

### Als Spieler
1. Im Spiel auf "Gates" Panel gehen
2. Auf "🗺️ Weltkarte" Button klicken
3. Karte erkunden:
   - Zoom mit Mausrad
   - Ziehen zum Bewegen
   - Gate anklicken für Details
   - "Gate betreten" zum Kampf starten

### Als Admin
1. Admin Panel öffnen
2. Auf "🗺️ Spawn-Zonen" klicken
3. Neue Zone erstellen:
   - "➕ Neue Zone platzieren" klicken
   - Auf Karte klicken für Position
   - Eigenschaften einstellen
   - Speichern

## Technische Details

### Canvas-Rendering
- Verwendet HTML5 Canvas für Performance
- Transformation-Matrix für Zoom/Pan
- Radial-Gradienten für Portal-Effekte
- Alpha-Blending für Zonen-Overlay

### Zufällige Position-Generierung
```javascript
// Position innerhalb der Zone
const angle = Math.random() * Math.PI * 2;
const distance = Math.random() * zone.radius;
const x = zone.center_x + Math.cos(angle) * distance;
const y = zone.center_y + Math.sin(angle) * distance;
```

### Gewichtete Zonen-Auswahl
```javascript
// Zonen mit höherem Gewicht werden bevorzugt
const totalWeight = zones.reduce((sum, zone) => sum + zone.spawn_weight, 0);
let random = Math.random() * totalWeight;
// ... Select zone based on cumulative weight
```

## Customization

### Weltkarte ändern
Ersetze `/public/assets/sprites/Weltkarte 1.png` mit eigenem Bild (empfohlen: 1000x800px)

### Neue Zonen-Typen hinzufügen
In `gate_spawn_zones` Tabelle:
```sql
ALTER TABLE gate_spawn_zones 
MODIFY zone_type ENUM('standard', 'elite', 'danger', 'safe', 'YOUR_NEW_TYPE');
```

### Spawn-Algorithmus anpassen
In `server/gates-system.js`:
```javascript
// Ändere Rang-Verteilung
const rankDistribution = {
    'D': 0.35,  // 35%
    'C': 0.30,  // 30%
    // ...
};
```

## Troubleshooting

**Gates spawnen nicht**:
- Prüfe ob aktive Zonen existieren: `SELECT * FROM gate_spawn_zones WHERE is_active = 1`
- Prüfe Rang-Range der Zonen

**Karte zeigt nichts**:
- Prüfe Browser-Konsole für Fehler
- Stelle sicher TypeScript kompiliert wurde
- Prüfe ob Weltkarte-Bild existiert

**Admin kann Zonen nicht bearbeiten**:
- Prüfe Authentifizierung
- Prüfe Server-Logs für API-Fehler

## Zukünftige Features

- [ ] Mehrere Weltkarten (verschiedene Kontinente)
- [ ] Animations-Effekte für Gate-Spawns
- [ ] Spieler-Positionen auf der Karte
- [ ] Gate-Historie (wo wurden Gates bereits gecleart)
- [ ] Zonen-basierte Events (Gate-Wellen in bestimmten Zonen)
- [ ] Minimap im Spiel-UI
- [ ] Mobile Touch-Steuerung

## Changelog

### Version 1.0.0 (2026-01-21)
- ✅ Interaktive Weltkarte implementiert
- ✅ Admin Spawn-Zonen Editor
- ✅ Zonen-basiertes Gate-Spawning
- ✅ 6 Default Spawn-Zonen
- ✅ Rang-basierte Spawn-Verteilung
- ✅ Gewichtete Zonen-Auswahl
