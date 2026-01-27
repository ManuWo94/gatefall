# Multi-Enemy Combat System

## Features

✅ Mehrere Gegner gleichzeitig anzeigen
✅ Gegner per Klick als Ziel auswählen
✅ Visuelles Targeting mit Highlight
✅ Tote Gegner werden ausgegraut
✅ Horizontales Layout für bis zu 5+ Gegner

## Verwendung

### Einzelner Gegner (Standard)
```javascript
// Funktioniert wie bisher - ein Gegner aus dem Engine State
const combat = new FFCombatUI(engine, 'combat-container');
```

### Mehrere Gegner
```javascript
const combat = new FFCombatUI(engine, 'combat-container');

// Setze mehrere Gegner
const enemies = [
    { name: 'Ork Krieger', hp: 500, maxHp: 500 },
    { name: 'Ork Schamane', hp: 300, maxHp: 300 },
    { name: 'Goblin', hp: 200, maxHp: 200 }
];

combat.setEnemies(enemies);
```

### Gegner auswählen
- **Per Klick**: Klicke auf einen Gegner um ihn auszuwählen
- **Programmatisch**: `combat.selectEnemy(index)`

Der ausgewählte Gegner wird mit einem goldenen Rand und 🎯 markiert.

## CSS Klassen

- `.ff-enemy` - Enemy Container
- `.ff-enemy.selected` - Aktuell ausgewählter Gegner (goldener Rand)
- `.ff-enemy.dead` - Toter Gegner (ausgegraut)
- `.ff-enemy:hover` - Hover-Effekt

## API

### `setEnemies(enemies: any[])`
Setzt mehrere Gegner für den Kampf.

```typescript
combat.setEnemies([
    { name: 'Enemy 1', hp: 500, maxHp: 500 },
    { name: 'Enemy 2', hp: 300, maxHp: 300 }
]);
```

### `selectEnemy(index: number)`
Wählt einen Gegner als Ziel aus.

```typescript
combat.selectEnemy(0); // Erster Gegner
combat.selectEnemy(1); // Zweiter Gegner
```

## Beispiel: Gate mit mehreren Gegnern

```javascript
// In turn-based-init.ts oder ähnlich
const enemies = gate.enemies.map(e => ({
    name: e.name,
    hp: e.maxHp,
    maxHp: e.maxHp,
    level: e.level,
    behavior: e.behavior || 'balanced'
}));

combat.setEnemies(enemies);
```

## Nächste Schritte

Um das Multi-Enemy System vollständig zu integrieren:

1. **Combat Engine erweitern** um mehrere Gegner zu verwalten
2. **Damage System** anpassen - Schaden nur an ausgewählten Gegner
3. **Enemy Turn Logic** - Alle lebenden Gegner greifen an
4. **Victory Condition** - Kampf endet wenn alle Gegner tot sind

## Visuals

- Gegner werden horizontal nebeneinander angezeigt
- Max 5-6 Gegner passen gut auf den Screen
- Tote Gegner bleiben sichtbar aber ausgegraut
- Hover-Effekt beim Überfahren mit der Maus
- Selected State mit goldenem Glow
