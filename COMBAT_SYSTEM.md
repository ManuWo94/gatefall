# NEUES KAMPFSYSTEM - Dokumentation

## 🎮 Übersicht

Das neue Kampfsystem ist ein **tick-basiertes, telegraph-gesteuertes System** inspiriert von Solo Leveling. Es ersetzt das bisherige simple Auto-Attack-System durch taktische, vorhersagbare Kämpfe.

## ⚙️ Kern-Mechaniken

### 1. Tick-System (700-1000ms pro Tick)
- Jeder Tick ist eine "Runde" im Kampf
- Cooldowns, Vorbereitungszeiten und Status-Effekte basieren auf Ticks
- Standard-Tick-Duration: **800ms**

### 2. Telegraph-System
Gegner und Spieler kündigen mächtige Aktionen an:
```
⚠️ Dungeon-Boss bereitet einen schweren Schlag vor (2 Ticks)
🔴 SYSTEM: Tödliche Aktion erkannt
```

#### Bedrohungslevel:
- **GERING** - Schwacher Angriff
- **HOCH** - Gefährlicher Angriff (benötigt Reaktion)
- **TOEDLICH** - Sehr gefährlich (defensive Aktion erforderlich)
- **KATASTROPHAL** - Boss-Spezial (sofortige Reaktion nötig)

### 3. Tag-System

Jede Aktion hat Tags die definieren wie sie wirkt:

#### Angriffstypen:
- `SCHLAG` - Nahkampf-Hieb
- `STICH` - Präziser Stoß
- `MAGIE` - Magischer Angriff
- `SCHATTEN` - Dunkle Magie

#### Eigenschaften:
- `KANALISIERUNG` - Aktion mit Vorbereitungszeit (kann unterbrochen werden)
- `PROJEKTIL` - Fernkampf-Geschoss
- `FLAECHE` - Trifft mehrere Ziele
- `DURCHDRINGEND` - Ignoriert Verteidigungen teilweise
- `EXEKUTION` - Erhöhter Schaden bei niedrigem HP
- `RITUAL` - Sehr lange Kanalisierung mit mächtiger Wirkung

#### Reaktionstypen:
- `BLOCK` - Blockt physische Angriffe (besonders SCHLAG)
- `AUSWEICHEN` - Weicht Projektilen aus
- `UNTERBRECHEN` - Stoppt Kanalisierungen
- `SCHILD` - Absorbiert Schaden

### 4. Tag-Interaktionen

Tags kontern sich gegenseitig:

```typescript
UNTERBRECHEN > KANALISIERUNG  // Negiert komplett
BLOCK > SCHLAG                // 70% Reduktion
AUSWEICHEN > PROJEKTIL        // Negiert komplett
DURCHDRINGEND > BLOCK/SCHILD  // Verstärkt Schaden
FLAECHE vs AUSWEICHEN         // Nur 30% Reduktion
```

### 5. Level-Dominanz-System

**ΔLevel = Angreifer-Level - Verteidiger-Level**

| ΔLevel | Trefferchance | Effekt-Modifier | Status-Erfolg | Dauer-Modifier |
|--------|--------------|----------------|---------------|----------------|
| ≥ +5   | 95%          | 1.5x           | 90%           | 1.5x           |
| +2 bis +4 | 90%      | 1.2x           | 70%           | 1.2x           |
| -1 bis +1 | 85%      | 1.0x           | 50%           | 1.0x           |
| -2 bis -4 | 70%      | 0.6x           | 30%           | 0.6x           |
| ≤ -5   | 50%          | 0.3x           | 10%           | 0.3x           |

**Beispiel:**
- Spieler (Level 45) vs Boss (Level 50): ΔLevel = -5
  - Trefferchance: 50%
  - Schaden: 0.3x (stark reduziert)
  - Status-Effekte: 10% Chance

### 6. Status-Effekte

#### Schaden über Zeit (DoT):
- **BLUTUNG** - Physischer DoT
- **VERBRENNUNG** - Feuer-DoT
- **VERGIFTUNG** - Gift-DoT

#### Buffs:
- **VERSTAERKUNG** - Erhöhter Schaden
- **SCHILD** - Absorbiert Schaden
- **REGENERATION** - Heilung über Zeit
- **WACHSAMKEIT** - Erhöhte Verteidigung

#### Debuffs:
- **SCHWAECHUNG** - Reduzierter Schaden
- **VERLANGSAMUNG** - Längere Cooldowns
- **FURCHT** - Reduzierte Verteidigung
- **BETAEUBUNG** - Kann 1 Tick nicht handeln
- **VERWUNDBARKEIT** - Erhält mehr Schaden

Status-Effekte haben:
- **Duration** (Ticks verbleibend)
- **Value** (Stärke)
- **SourceLevel** (für Resistenz-Check)
- **StackCount** (Stapelbar)

## 📁 Datei-Struktur

```
/src/combat/
  ├── combat-types.ts      # Alle Type-Definitionen
  ├── tag-matcher.ts       # Tag-Interaktions-Logik
  ├── telegraph.ts         # Telegraph-System
  ├── actions.ts           # Alle Kampf-Aktionen
  ├── new-engine.ts        # Haupt-Kampf-Engine
  ├── combat-ui.ts         # UI-Rendering
  ├── combat.css           # Styling
  └── combat-init.ts       # Initialisierung & Einstieg
```

## 🚀 Verwendung

### Kampf starten:

```typescript
import { combatSystem } from './src/combat/combat-init.js';
import { CombatRole } from './src/combat/combat-types.js';

combatSystem.startCombat({
    playerLevel: 45,
    playerRole: CombatRole.WAECHTER,
    playerHunterRank: 'S',
    enemies: [
        { name: 'Schattenbestie', level: 48, isBoss: false },
        { name: 'Dungeon-Boss', level: 50, isBoss: true }
    ],
    squadMembers: [
        { name: 'Rookie Jin', level: 40, role: CombatRole.JAEGER }
    ]
});
```

### Test-Kampf starten:

```typescript
import { startTestCombat } from './src/combat/combat-init.js';

// Startet Beispiel-Kampf
startTestCombat();
```

## 🎯 Gameplay-Flow

### 1. Kampf-Start
- Spieler, Gegner und Trupp werden erstellt
- Tick-Loop beginnt (800ms Intervall)
- Combat-Log wird initialisiert

### 2. Jeder Tick:
```
1. Status-Effekte verarbeiten (DoTs, Buffs, Debuffs)
2. Telegraphs aktualisieren (Countdown)
3. Vorbereitete Aktionen fortschreiten
4. Cooldowns reduzieren
5. AI Entscheidungen treffen
6. Sieg/Niederlage prüfen
```

### 3. Spieler-Aktion:
```
1. Spieler wählt Aktion + Ziel
2. Check: Cooldown? Ressourcen?
3. Ist Preparation > 0?
   → JA: Telegraph erstellen, Countdown starten
   → NEIN: Sofort ausführen
```

### 4. Aktion ausführen:
```
1. Level-Interaktion berechnen
2. Tag-Interaktionen prüfen (Counter?)
3. Schaden/Heilung anwenden
4. Status-Effekte anwenden (mit Resistenz-Check)
5. Cooldown setzen
6. Combat-Log aktualisieren
```

### 5. Telegraph-Reaktion:
Wenn Gegner Telegraph hat:
```
⚠️ Boss bereitet EXEKUTION vor (3 Ticks)
→ Spieler hat 3 Ticks Zeit zu reagieren:
  - BLOCK nutzen
  - AUSWEICHEN nutzen
  - UNTERBRECHEN nutzen
  - Oder selbst angreifen
```

## 🎨 UI-Komponenten

### Telegraph-Banner
```html
<div class="telegraph-banner critical">
  ⚠️ Dungeon-Boss bereitet Meteoriteneinschlag vor (2 Ticks)
  [████████░░░░░░░░░░░░] 40% verbleibend
</div>
```

### Combatant-Karte
```
┌─────────────────────────┐
│ Dungeon-Boss      Lv.50 │
│ HP: ████████░░ 8000/10000
│ 🛡️ 200 Shield           │
│ Status: 🔥 💀            │
│ Bereitet vor: Dark Ritual
│ (3 Ticks)               │
└─────────────────────────┘
```

### Action-Grid
```
[Normaler Angriff]  [Block]        [Schwerer Schlag]
[Ausweichen]        [Unterbrechen]  [Feuerball]
```

## 🤖 AI-System

### Basic AI:
- Wählt zufällige Aktion (nicht auf Cooldown)
- Greift immer Spieler an
- 50% Aggressivität

### Boss AI:
- Hat **Phasen** basierend auf HP:
  - **75% HP**: Phase 2 (neue Angriffe)
  - **50% HP**: Phase 3 (erhöhte Geschwindigkeit)
  - **25% HP**: Finale Phase (Ultimates)
  
- Nutzt Special-Aktionen (EXEKUTION, RITUAL, etc.)
- 80% Aggressivität

```typescript
phases: [
  {
    hpThreshold: 0.75,
    newActions: ['devastating_blow'],
    speedModifier: 1.0,
    message: '⚠️ SYSTEM: Phase 2 aktiviert'
  },
  {
    hpThreshold: 0.25,
    newActions: ['meteor_strike'],
    speedModifier: 1.5,
    message: '🔴🔴 SYSTEM: FINALE PHASE'
  }
]
```

## ✨ Belohnungen

Nach Sieg:
```typescript
rewards: {
  xp: enemy.level * 50,  // Pro Gegner
  gold: enemy.level * 100,
  items: []  // Später erweitern
}
```

UI zeigt Victory-Screen:
```
🎉 SIEG! 🎉
⭐ +2,500 XP
💰 +5,000 Gold
```

## 🔧 Erweiterungen (Zukunft)

- [ ] Items und Equipment
- [ ] Skill-Trees
- [ ] Combo-System
- [ ] Elemental-Weaknesses
- [ ] Team-Koordination (Trupp-Synergien)
- [ ] Achievements für Kampf-Leistung
- [ ] Replay-System
- [ ] PvP-Support

## 🐛 Bekannte Limitationen

- Trupp-Mitglieder nutzen aktuell nur Basic AI
- Keine Multi-Target-Aktionen (kommt später)
- Status-Effekt-Stacking ist simpel (nur Duration-Refresh)
- Boss-Phases sind statisch definiert

## 📊 Performance

- Tick-Duration: 800ms (anpassbar)
- Combat-Log: Max 100 Einträge
- Event-System für Updates (keine direkten DOM-Manipulationen im Loop)
- Status-Effekte werden effizient verarbeitet

## 🎓 Design-Philosophie

**"Taktik über Reflexe"**

1. **Vorhersagbarkeit**: Telegraphs zeigen was kommt
2. **Kein RNG-Casino**: Level-Dominanz statt Glück
3. **Strategische Tiefe**: Tag-Counters belohnen Wissen
4. **Solo Leveling Feeling**: SYSTEM-Nachrichten, Bedrohungs-Analysen
5. **Faire Herausforderungen**: Höherstufige Gegner sind schwer, aber nicht unmöglich

---

**Entwickelt für Gatefall - Solo Leveling Inspired System** ⚔️
