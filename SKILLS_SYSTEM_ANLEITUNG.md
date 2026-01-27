# 🎯 Skills System - Implementierungs-Anleitung

## Was wurde erstellt?

### 1. **Datenbank-Schema** (`server/migrations/create-skills-system.sql`)
- **skills Tabelle**: Speichert alle Skills (Spieler + Gegner)
  - Kosten: mana_cost, stamina_cost
  - Typen: damage, heal, buff, debuff, dot, stun, special
  - Elemente: physical, fire, ice, lightning, dark, light, poison, wind, earth
  - Eigenschaften: base_value, scaling_factor, duration, cooldown
  - Verfügbarkeit: usable_by (player/enemy/both)
  
- **enemy_skills Tabelle**: Verbindet Enemies mit ihren Skills
  - use_priority: Wie oft der Skill genutzt wird (0-100)
  - min_hp_percent, max_hp_percent: HP-Bedingungen

- **30+ Basis-Skills** bereits eingefügt (Feuer, Eis, Blitz, Gift, Physisch, etc.)

### 2. **Backend API** (`server/routes/skills.js`)
- `GET /api/skills` - Alle Skills laden
- `GET /api/skills/:id` - Einzelnen Skill laden
- `POST /api/skills` - Skill erstellen
- `PUT /api/skills/:id` - Skill aktualisieren
- `DELETE /api/skills/:id` - Skill löschen
- `GET /api/enemies/:id/skills` - Skills eines Gegners
- `POST /api/enemies/:id/skills` - Skill zu Gegner zuweisen
- `DELETE /api/enemies/:id/skills/:skillId` - Skill von Gegner entfernen

### 3. **Admin Panel** (`ADMIN_SKILLS_NEW_CODE.ts`)
- Skills-Liste mit Filtern (Alle, Schaden, Heilung, Buffs, etc.)
- Skill erstellen/bearbeiten Modal
- Skill-Zuweisungen zu Enemies (kommt noch)

### 4. **Frontend Integration** (TODO)
- Combat System muss Skills aus DB laden
- Enemy-Aktionen müssen Skills verwenden

---

## 🚀 Installation

### Schritt 1: Datenbank Migration ausführen

```bash
cd c:\xampp\htdocs\Gatefall
node server/migrations/run-skills-migration.js
```

**Erwartete Ausgabe:**
```
🔄 Starting Skills System Migration...

✅ Table created: skills
✅ Table created: enemy_skills  
✅ Data inserted into: skills

✅ Migration completed successfully!
📊 Skills system is now ready to use.
```

### Schritt 2: Server neu starten

Der Server wurde bereits aktualisiert mit der Skills-Route.

```bash
# Wenn Server läuft, neu starten (Ctrl+C und dann):
node server/index.js
```

### Schritt 3: Admin Panel Code aktualisieren

**WICHTIG:** Der Code in `ADMIN_SKILLS_NEW_CODE.ts` muss in `src/admin.ts` eingefügt werden!

**Wo die alten Funktionen ersetzen:**
- Suche nach `private async loadSkills()` (Zeile ~344)
- Lösche die alte Funktion bis zum Ende von `deleteSkill()`
- Füge den neuen Code ein

### Schritt 4: TypeScript kompilieren

```bash
cd c:\xampp\htdocs\Gatefall
npx tsc
```

### Schritt 5: Admin Panel testen

1. Öffne `http://localhost:3001/admin.html`
2. Klicke auf "✨ Skills" Tab
3. Du solltest die 30 Basis-Skills sehen
4. Teste "Neuer Skill" erstellen

---

## 📋 Wo werden Enemy-Skills aktuell definiert?

**ANTWORT:** Aktuell **GAR NICHT!**

Enemies haben aktuell:
- Generische Angriffe (attack/block/dodge)
- **KEINE Skills aus der Datenbank**
- Keine Verbindung zu skill system

## Was muss noch gemacht werden?

### 1. **Enemy-Skill Zuweisungs-UI** (Admin Panel)
Wenn man einen Boss/Enemy bearbeitet, muss es eine Sektion geben:
```
[Enemy Editor Modal]
┌─────────────────────────────────────┐
│ Skills für diesen Gegner             │
├─────────────────────────────────────┤
│ [+] Skill hinzufügen                 │
│                                      │
│ ⚔️ Schwerer Schlag                   │
│    Priority: 70  HP: 0-100%          │
│    [Bearbeiten] [Entfernen]          │
│                                      │
│ 🔥 Feuerball                         │
│    Priority: 50  HP: 50-100%         │
│    [Bearbeiten] [Entfernen]          │
└─────────────────────────────────────┘
```

### 2. **Combat Engine Integration**
`src/combat/turn-based-engine.ts` muss geändert werden:

**Aktuell:**
```typescript
selectEnemyAction() {
    // Wählt nur: attack, block, dodge
}
```

**Neu:**
```typescript
async selectEnemyAction() {
    // 1. Lade Skills aus DB für aktuellen Enemy
    // 2. Filtere nach HP-Bedingungen
    // 3. Wähle basierend auf Priority
    // 4. Führe Skill aus statt generischem Angriff
}
```

### 3. **Enemy Loading aus DB**
`src/combat/turn-based-init.ts` - `generateGateEnemies()`:

**Aktuell:**
```typescript
private generateGateEnemies(gate: any): EnemyDefinition[] {
    // Erstellt generische Gegner
}
```

**Neu:**
```typescript
private async generateGateEnemies(gate: any): Promise<EnemyDefinition[]> {
    // 1. Lade echte Enemies aus DB basierend auf Gate-Level/Rang
    // 2. Lade ihre Skills mit
    // 3. Erstelle EnemyDefinition mit Skills
}
```

---

## 🎮 Verwendung im Admin Panel

### Skill erstellen
1. Admin Panel → "✨ Skills"
2. Klick "Neuer Skill"
3. Fülle Formular aus:
   - Name: z.B. "Feuerball"
   - Typ: Schaden
   - Element: Feuer
   - Basis-Wert: 120
   - Mana-Kosten: 25
   - Cooldown: 2 Runden
4. Speichern

### Skill einem Enemy zuweisen (TODO - Code muss noch geschrieben werden)
1. Admin Panel → "👹 Gegner"  
2. Gegner bearbeiten
3. Sektion "Skills"
4. "Skill hinzufügen" klicken
5. Skill auswählen, Priority festlegen
6. HP-Bedingungen setzen (z.B. nur unter 50% HP)

---

## 🔧 Nächste Schritte

1. **JETZT:** Migration ausführen → Skills-Tabelle wird erstellt
2. **JETZT:** Admin-Code in src/admin.ts einfügen → Skills-Management funktioniert
3. **DANN:** Enemy-Editor erweitern → Skill-Zuweisungs-UI
4. **DANN:** Combat Engine anpassen → Skills aus DB laden und nutzen
5. **SPÄTER:** Spieler-Skills auch aus DB laden (statt hardcoded TypeScript)

---

## ❓ FAQ

**Q: Woher kommen die Enemy-Skills jetzt?**
A: Nirgendwo - Enemies nutzen aktuell nur generische Aktionen (attack/block/dodge).

**Q: Müssen Spieler-Skills auch in die DB?**
A: Langfristig ja, aber aktuell funktionieren sie hardcoded im TypeScript-Code.

**Q: Was ist mit den Typen (Feuer vs Eis)?**
A: Das System unterstützt alle Element-Typen! Später kann Resistenz/Schwäche-System implementiert werden.

**Q: Wie setze ich Priority richtig?**
A: 
- 100 = Wird fast immer genutzt (Spam-Skill)
- 70 = Oft genutzt (Haupt-Angriff)
- 50 = Mittel (Spezial-Skill)
- 20 = Selten (Ultimative Fähigkeit)

**Q: Was sind HP-Bedingungen?**
A: min_hp_percent: 0, max_hp_percent: 30 → Nur wenn Enemy HP unter 30%
