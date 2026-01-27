# NPC-Party-System für Gates

## Übersicht
Spieler können Gates entweder alleine oder mit NPCs aus ihrer Vereinigung (Guild) betreten. Das System ermöglicht es, bis zu 3 NPCs als Party-Mitglieder auszuwählen.

## Features

### 1. NPC-Auswahl vor Gate-Eintritt
- Wenn ein Spieler ein Gate betritt, wird ein Modal geöffnet
- Der Spieler kann NPCs aus seiner aktuellen Vereinigung auswählen
- Maximale Party-Größe: 1 Spieler + 3 NPCs
- NPCs haben verschiedene Rollen (Wächter, Assassine, Magier, Scharfschütze, Heiler)

### 2. NPC-Statistiken
NPCs haben basierend auf ihrer Rolle unterschiedliche Stats:
- **HP**: Lebenspunkte
- **MP**: Manapunkte
- **Schaden**: Grundschaden
- **Rolle**: Kampfklasse (entspricht den Spieler-Rollen)

### 3. NPC-Verhalten im Kampf
- **Automatische Angriffe**: NPCs greifen automatisch Gegner an
- **Skill-Nutzung**: NPCs verwenden ihre Fähigkeiten basierend auf ihrer Rolle
  - Wächter: Tanken und Verteidigung
  - Heiler: Heilt Party-Mitglieder
  - Magier/Assassine/Scharfschütze: Schadensdeal

### 4. NPC-Verfügbarkeit
- NPCs sind nur verfügbar, wenn der Spieler einer Vereinigung angehört
- Verschiedene Vereinigungen haben unterschiedliche NPCs
- NPC-Qualität steigt mit dem Vereinigungs-Rang

## Implementation (Geplant)

### Party-Selection-Modal
```typescript
interface NPCPartyMember {
    id: string;
    name: string;
    role: Role;
    level: number;
    hp: number;
    mp: number;
    damage: number;
    guildId: string;
}

// Modal zeigt verfügbare NPCs an
// Spieler wählt bis zu 3 NPCs
// Bei Gate-Start wird Party übergeben
```

### Combat-Integration
- Combat-Engine muss erweitert werden für Party-Kämpfe
- Turn-based System: Spieler → NPC1 → NPC2 → NPC3 → Gegner
- NPCs verwenden KI für Skill-Entscheidungen
- HP-Management für alle Party-Mitglieder

### NPC-Datenbank
NPCs werden in der Datenbank gespeichert pro Vereinigung:

```sql
CREATE TABLE guild_npcs (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    level INTEGER NOT NULL,
    base_hp INTEGER NOT NULL,
    base_mp INTEGER NOT NULL,
    base_damage INTEGER NOT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id)
);
```

## Vorteile des Systems
1. **Solo-Spieler Unterstützung**: Auch ohne andere Spieler kann man Gates betreten
2. **Taktik**: Verschiedene NPC-Kombinationen für verschiedene Gates
3. **Vereinigungs-Bonus**: Bessere NPCs = Anreiz Vereinigungen beizutreten
4. **Progression**: NPCs können mit der Vereinigung aufleveln

## Zukünftige Erweiterungen
- **Spieler-Parties**: Mehrere Spieler können zusammen Gates betreten
- **NPC-Ausrüstung**: NPCs können ausgerüstet werden
- **NPC-Skills**: Individuelle Skill-Trees für NPCs
- **NPC-Loyalität**: NPCs werden stärker je öfter man mit ihnen kämpft
