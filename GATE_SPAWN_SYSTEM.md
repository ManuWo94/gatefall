# Gate Spawn System - Dokumentation

## Übersicht
Das Gate-Spawn-System spawnt automatisch 12-24 Gates alle 6 Stunden verteilt über alle Städte mit Spawn-Zonen.

## Funktionsweise

### 1. Spawn-Zonen (Punkt-basiert)
- **Tabelle**: `city_spawn_zones`
- **Felder**:
  - `city_id`: Stadt in der die Zone ist
  - `name`: Name der Zone (z.B. "Anfänger Zone")
  - `map_x`, `map_y`: **Punkt-Koordinaten** (kein Polygon mehr!)
  - `min_rank`: Minimaler Rang (E-SSS)
  - `max_rank`: Maximaler Rang (E-SSS)

### 2. Gate-Spawning
**Zeitplan**: Alle 6 Stunden

**Ablauf**:
1. System lädt alle Spawn-Zonen aus allen Städten
2. Wählt zufällige Anzahl zwischen 12-24 Gates
3. Für jedes Gate:
   - Zufällige Zone auswählen
   - Rang innerhalb Zone-Limits wählen (z.B. E-D)
   - Zufälligen Gate-Typ wählen
   - Position = Zone-Punkt (map_x, map_y)
   - Level basierend auf Rang berechnen
4. Gates werden in Datenbank gespeichert mit `player_id = NULL` (global)

### 3. Rang-System
| Rang | Level-Range | Beschreibung |
|------|-------------|--------------|
| E    | 1-5         | Sehr schwach |
| D    | 6-15        | Schwach |
| C    | 16-30       | Normal |
| B    | 31-45       | Stark |
| A    | 46-60       | Sehr stark |
| S    | 61-80       | Elite |
| SS   | 81-95       | Legende |
| SSS  | 96-100      | Mythisch |

### 4. Gate-Typen
- **normal**: Standard Gate
- **elite**: Elite-Gegner
- **boss**: Boss Gate
- **raid**: Raid-Gate (Multiplayer)
- **dungeon**: Dungeon

Alle Typen werden **zufällig** gewählt (keine Gewichtung).

## Admin-Interface

### Spawn-Zone erstellen
1. Stadt auswählen
2. Tool "Spawn-Zone setzen" aktivieren
3. **1x klicken** auf Karte → Zone wird erstellt
4. Zone-Form öffnet sich:
   - Name eingeben
   - Min Rang wählen (E-SSS)
   - Max Rang wählen (E-SSS)
5. Speichern

### Zone bearbeiten
1. Tool "Auswählen/Bearbeiten" aktivieren
2. Auf Zone klicken (Kreis mit 30px Radius)
3. Werte anpassen
4. Speichern

## Backend-Funktionen

### `spawnGatesGlobal()`
Spawnt 12-24 Gates global verteilt auf alle Städte.

**Code**:
```javascript
const gatesSystem = require('./server/gates-spawn-system.js');
await gatesSystem.spawnGatesGlobal();
```

### `closeGate(gateId)`
Schließt ein Gate (z.B. nach Boss-Sieg).

**Code**:
```javascript
await gatesSystem.closeGate(gateId);
```

### `dailyGateSpawn()`
6-Stunden-Zyklus: Schließt abgelaufene Gates + spawnt neue.

**Automatisch**: Wird alle 6 Stunden vom Server ausgeführt.

## Datenbank-Schema

### gates-Tabelle
```sql
CREATE TABLE gates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  zone_id INT NULL,
  player_id INT NULL,  -- NULL = globales Gate
  name VARCHAR(200),
  gate_rank ENUM('E','D','C','B','A','S','SS','SSS'),
  gate_type ENUM('normal','elite','boss','raid','dungeon'),
  level INT,
  map_x INT,
  map_y INT,
  status ENUM('active','in_progress','completed','expired','cleared'),
  expires_at TIMESTAMP,
  closed_at TIMESTAMP,  -- Boss defeated
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (zone_id) REFERENCES city_spawn_zones(id)
);
```

### city_spawn_zones-Tabelle
```sql
CREATE TABLE city_spawn_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(200),
  map_x INT,     -- Punkt-Position X
  map_y INT,     -- Punkt-Position Y
  min_rank VARCHAR(10) DEFAULT 'E',
  max_rank VARCHAR(10) DEFAULT 'D',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id)
);
```

## Deployment

### Migration ausführen
```powershell
Get-Content server/migrations/update-zones-to-points.sql | 
  & 'C:\xampp\mysql\bin\mysql.exe' -u root gatefall_db

Get-Content server/migrations/update-gates-global-spawn.sql | 
  & 'C:\xampp\mysql\bin\mysql.exe' -u root gatefall_db
```

### Server starten
```powershell
cd c:\xampp\htdocs\Gatefall
node server/index.js
```

Gate-Spawning startet automatisch beim Server-Start und dann alle 6 Stunden.

## Fehlersuche

### "Keine Spawn-Zonen gefunden"
→ Keine Zonen erstellt! Im Admin-Editor mindestens 1 Zone pro Stadt erstellen.

### "Foreign Key constraint fails"
→ Migration `update-gates-global-spawn.sql` ausführen.

### "Column 'player_id' cannot be null"
→ Migration ausführen: `ALTER TABLE gates MODIFY player_id INT NULL;`

## Zukünftige Features

### Boss-Defeat → Gate Close
Wenn Boss besiegt:
```javascript
await gatesSystem.closeGate(gateId);
```

### Hospital-Respawn
Bei Spieler-Niederlage:
```javascript
// Player position = Hospital in current city
// Show Solo Leveling style defeat popup
```
