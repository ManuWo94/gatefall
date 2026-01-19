# ⚔️ KAMPFSYSTEM - SCHNELLSTART

## Sofort Loslegen

### 1. Browser-Console öffnen (F12)

### 2. Test-Kampf starten:
```javascript
startTestCombat()
```

Das startet einen Beispiel-Kampf mit:
- **Spieler**: Level 45 Wächter (S-Rang)
- **Trupp**: Rookie Jin (Jäger, Lv.40) + Mage Sarah (Magier, Lv.42)
- **Gegner**: Schattenbestie (Lv.48) + Dungeon-Boss (Lv.50)

---

## Kampf-Ablauf

### Phase 1: Kampf beobachten
- **Tick-Counter** (oben rechts) zeigt die aktuelle Runde
- **Telegraph-Banner** (oben) warnt vor Gegner-Angriffen
- **HP-Bars** zeigen Gesundheit aller Teilnehmer

### Phase 2: Reagieren auf Telegraphs

Wenn der Boss angreift:
```
⚠️ Dungeon-Boss bereitet einen schweren Schlag vor (2 Ticks)
🔴 SYSTEM: Tödliche Aktion erkannt
```

**Du hast 2 Ticks Zeit zu reagieren:**
1. Klicke auf **"Block"** um Schaden zu reduzieren
2. Klicke auf **"Ausweichen"** um auszuweichen
3. Klicke auf **"Unterbrechen"** um Kanalisierungen zu stoppen

### Phase 3: Eigene Angriffe

Wähle aus den verfügbaren Aktionen:
- **Normaler Angriff** - Schnell, kein Cooldown
- **Schwerer Schlag** - Hoher Schaden, 2 Ticks Vorbereitung
- **Feuerball** - Flächenschaden, kanalisiert 3 Ticks
- **Schildwall** - Defensive Aktion

---

## Status-Anzeigen verstehen

### HP-Bar Farben:
- 🟢 **Grün** (>50%): Gesund
- 🟠 **Orange** (25-50%): Angeschlagen
- 🔴 **Rot** (<25%): Kritisch

### Status-Icons:
- 🩸 Blutung (DoT)
- 🔥 Verbrennung (DoT)
- 🛡️ Schild (Schutz)
- 💪 Verstärkung (Buff)
- 😨 Furcht (Debuff)
- 💫 Betäubung (Debuff)

### Telegraph-Farben:
- 🔵 **Blau** - Geringe Bedrohung
- 🟠 **Orange** - Hohe Bedrohung
- 🔴 **Rot** - Tödliche Bedrohung
- 🟣 **Lila** - Katastrophale Bedrohung (Boss-Ultimate)

---

## Tipps & Tricks

### ✅ Gute Strategien:
1. **Block gegen SCHLAG-Angriffe** - Reduziert 70% Schaden
2. **Ausweichen gegen PROJEKTILE** - Negiert komplett
3. **Unterbrechen gegen KANALISIERUNG** - Stoppt mächtige Angriffe
4. **Schild vor Boss-Ultimates** - Überlebt katastrophale Angriffe

### ❌ Häufige Fehler:
1. ~~Ausweichen gegen Flächenangriffe~~ - Funktioniert schlecht
2. ~~Block gegen MAGIE~~ - Physische Verteidigung stoppt keine Magie
3. ~~Ignorieren von Telegraphs~~ - Tödliche Angriffe können One-Shotten
4. ~~Spam-Klicken~~ - Nur 1 Aktion pro Tick möglich

### 🎯 Level-Unterschiede:
- **+5 Level über Gegner**: Dominiere komplett (95% Hit, 1.5x Damage)
- **Gleiche Level**: Ausgeglichen (85% Hit, 1.0x Damage)
- **-5 Level unter Gegner**: Sehr schwer (50% Hit, 0.3x Damage)

**Beispiel:**
```
Spieler Lv.45 vs Boss Lv.50 = ΔLevel -5
→ Deine Angriffe: 50% Trefferchance, 0.3x Schaden
→ Boss-Angriffe: 95% Trefferchance, 1.5x Schaden
→ Taktik erforderlich!
```

---

## Boss-Mechaniken

### Phasen-System:
Bosse haben **3 Phasen** basierend auf HP:

#### Phase 1 (100% - 75% HP):
- Normale Angriffe
- Wenige Specials

#### Phase 2 (75% - 50% HP):
```
⚠️ SYSTEM: Phase 2 aktiviert
```
- Schaltet "Verheerender Schlag" frei
- Normale Geschwindigkeit

#### Phase 3 (50% - 25% HP):
```
🔴 SYSTEM: Phase 3 aktiviert - Erhöhte Geschwindigkeit
```
- Schaltet "Dunkles Ritual" frei
- 1.2x Geschwindigkeit

#### Finale Phase (< 25% HP):
```
🔴🔴 SYSTEM: FINALE PHASE - Maximale Aggression
```
- Schaltet "Meteoriteneinschlag" frei
- 1.5x Geschwindigkeit
- Nutzt alle Ultimates

---

## Eigenes Kampf-Setup

### Kampf konfigurieren:

```javascript
import { combatSystem } from './dist/combat/combat-init.js';
import { CombatRole } from './dist/combat/combat-types.js';

combatSystem.startCombat({
    playerLevel: 30,                    // Dein Level
    playerRole: CombatRole.MAGIER,      // Deine Rolle
    playerHunterRank: 'A',              // Dein Rang
    
    enemies: [
        { 
            name: 'Goblin-Schamane', 
            level: 28, 
            isBoss: false 
        },
        { 
            name: 'Goblin-König', 
            level: 35, 
            isBoss: true    // Boss-Mechaniken
        }
    ],
    
    squadMembers: [                     // Optional: Trupp
        { 
            name: 'Tank-NPC', 
            level: 28, 
            role: CombatRole.WAECHTER 
        }
    ]
});
```

### Verfügbare Rollen:
- `CombatRole.WAECHTER` - Tank, hohe Verteidigung
- `CombatRole.JAEGER` - Fernkampf, Projektile
- `CombatRole.MAGIER` - Magie, Flächenschaden
- `CombatRole.HEILER` - Heilung, Support

---

## Combat-Log lesen

```
[Tick 5] ⚠️ Dungeon-Boss bereitet einen schweren Schlag vor (2 Ticks)
[Tick 6] 🔴 SYSTEM: Tödliche Aktion erkannt
[Tick 7] Du nutzt Block
[Tick 7] Schlag geblockt!
[Tick 7] Dungeon-Boss erleidet 30 Schaden
[Tick 8] Schattenbestie nutzt Klauenangriff
[Tick 8] Du erleidest 45 Schaden
```

### Log-Farben:
- **Weiß** - Normale Ereignisse
- **Orange** - Wichtige Ereignisse (Telegraphs, Counters)
- **Rot** - System-Warnungen

---

## Performance & Settings

### Tick-Geschwindigkeit anpassen:
```javascript
// Im combat-init.ts:
tickDuration: 800  // Standard: 800ms pro Tick

// Schneller (härter):
tickDuration: 600  // 600ms = weniger Reaktionszeit

// Langsamer (einfacher):
tickDuration: 1000 // 1000ms = mehr Reaktionszeit
```

### Combat-Log-Größe:
```javascript
// In new-engine.ts, log():
if (this.state.combatLog.length > 100) {  // Standard: 100
    this.state.combatLog.shift();
}
```

---

## Troubleshooting

### Kampf startet nicht?
1. Check Browser-Console für Fehler (F12)
2. Stelle sicher dass TypeScript kompiliert wurde: `npx tsc`
3. Prüfe ob `combat-ui-container` in index.html existiert

### UI wird nicht angezeigt?
1. Prüfe ob `combat.css` geladen ist
2. Check ob Container-Element vorhanden: `document.getElementById('combat-ui-container')`

### Aktionen funktionieren nicht?
1. Prüfe Cooldowns (Zahl auf Button)
2. Prüfe Mana-Kosten (💧 Symbol)
3. Warte bis vorherige Aktion fertig ist

### Combat-Log zu voll?
- Nur letzte 10 Einträge werden angezeigt
- Voller Log ist in `state.combatLog` verfügbar

---

## Nächste Schritte

### Integration ins Haupt-System:
1. Kampf-Button in Gates-Panel hinzufügen
2. Gate-Completion startet Kampf automatisch
3. Belohnungen werden in Spieler-Progression gespeichert
4. Trupp-System mit Vereinigungs-NPCs verbinden

### Geplante Features:
- [ ] Items & Equipment-System
- [ ] Skill-Trees für Rollen
- [ ] Combo-Attacken
- [ ] Elemental-Schwächen
- [ ] Team-Koordination (Trupp-Synergien)
- [ ] Boss-Bestiary mit Infos

---

**Viel Erfolg beim Kämpfen! ⚔️**

Bei Fragen: Siehe [COMBAT_SYSTEM.md](COMBAT_SYSTEM.md) für volle Dokumentation.
