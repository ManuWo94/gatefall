import { Role, Skill, StatusEffectType, RoleSpecialization } from './types.js';

/**
 * Komplettes Skill-Modul-System
 * Jede Rolle hat 3 Module mit je 3 aktiven Skills
 */

export const ROLE_SKILLS: Record<Role, Skill[]> = {
    // ========================================
    // 🛡️ WÄCHTER
    // ========================================
    [Role.WAECHTER]: [
        // Modul 1: Standhaftigkeit
        { id: 'waechter_shield_stance', name: 'Schildhaltung', description: 'Defensivhaltung - erhöht Schadensreduktion massiv', manaCost: 15, staminaCost: 20, cooldown: 3, effect: { type: 'buff', value: 50, duration: 2 }, moduleIndex: 0 },
        { id: 'waechter_firm_stand', name: 'Fester Stand', description: 'Kann nicht zurückgestoßen werden, reduziert Schaden', manaCost: 20, staminaCost: 15, cooldown: 4, effect: { type: 'buff', value: 40, duration: 3 }, moduleIndex: 0 },
        { id: 'waechter_damage_absorb', name: 'Schaden abfangen', description: 'Absorbiert den nächsten Angriff vollständig', manaCost: 30, staminaCost: 25, cooldown: 5, effect: { type: 'buff', value: 100, duration: 1 }, moduleIndex: 0 },
        // Modul 2: Schutzwall
        { id: 'waechter_provoke', name: 'Provokation', description: 'Zwingt Gegner zum Angriff', manaCost: 20, staminaCost: 10, cooldown: 3, effect: { type: 'debuff', value: 30, duration: 2 }, moduleIndex: 1 },
        { id: 'waechter_group_barrier', name: 'Gruppenbarriere', description: 'Schützt alle Verbündeten', manaCost: 40, staminaCost: 20, cooldown: 6, effect: { type: 'buff', value: 35, duration: 2 }, moduleIndex: 1 },
        { id: 'waechter_threat_bash', name: 'Bedrohungsstoß', description: 'Schlägt zu und erhöht Aggro', manaCost: 25, staminaCost: 20, cooldown: 4, effect: { type: 'damage', value: 45 }, moduleIndex: 1 },
        // Modul 3: Vergeltung
        { id: 'waechter_counter', name: 'Gegenschlag', description: 'Kontert den nächsten Angriff', manaCost: 25, staminaCost: 20, cooldown: 4, effect: { type: 'damage', value: 70 }, moduleIndex: 2 },
        { id: 'waechter_pushback', name: 'Zurückstoßen', description: 'Stößt Gegner zurück und betäubt', manaCost: 20, staminaCost: 25, cooldown: 5, effect: { type: 'damage', value: 40, statusEffect: StatusEffectType.STUNNED, duration: 1 }, moduleIndex: 2 },
        { id: 'waechter_revenge', name: 'Racheimpuls', description: 'Starker Angriff nach Schaden', manaCost: 30, staminaCost: 30, cooldown: 5, effect: { type: 'damage', value: 90 }, moduleIndex: 2 },
        // Spezialisierungs-exklusive Skills (B-Rang+) - Kosten/Cooldown rang-basiert
        { id: 'waechter_unshakeable', name: 'Unerschütterlich', description: 'Erleidet für kurze Zeit keinen kritischen Schaden, Schadensspitzen werden geglättet. Erzeugt hohe Aggro.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'buff', value: 75, duration: 4 }, moduleIndex: 0, requiresSpecialization: RoleSpecialization.WAECHTER_FORTRESS, isExclusive: true, roleType: 'tank' },
        { id: 'waechter_avenging_strike', name: 'Rächender Schlag', description: 'Kontert einen Angriff und verursacht erhöhten Schaden basierend auf erlittenem Schaden. Erzeugt hohe Aggro.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 140 }, moduleIndex: 2, requiresSpecialization: RoleSpecialization.WAECHTER_AVENGER, isExclusive: true, roleType: 'tank' },
        { id: 'waechter_protection_banner', name: 'Schutzbanner', description: 'Verbündete im Bereich erhalten Schadensreduktion. Erzeugt hohe Aggro.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'buff', value: 45, duration: 5 }, moduleIndex: 1, requiresSpecialization: RoleSpecialization.WAECHTER_PROTECTOR, isExclusive: true, roleType: 'tank' }
    ],

    // ========================================
    // 🗡️ ASSASSINE
    // ========================================
    [Role.ASSASSINE]: [
        // Modul 1: Schattenstoß
        { id: 'assassine_shadow_strike', name: 'Schattenstoß', description: 'Schneller Angriff aus dem Schatten', manaCost: 20, staminaCost: 15, cooldown: 2, effect: { type: 'damage', value: 65 } , moduleIndex: 0 },
        { id: 'assassine_backstab', name: 'Meucheln', description: 'Kritischer Treffer von hinten', manaCost: 30, staminaCost: 20, cooldown: 4, effect: { type: 'damage', value: 110 } , moduleIndex: 0 },
        { id: 'assassine_poison_blade', name: 'Giftklinge', description: 'Vergiftet den Gegner', manaCost: 25, staminaCost: 15, cooldown: 3, effect: { type: 'dot', value: 15, statusEffect: StatusEffectType.BLEED, duration: 3 } , moduleIndex: 0 },
        // Modul 2: Beweglichkeit
        { id: 'assassine_shadow_shift', name: 'Schattenverlagerung', description: 'Teleportiert hinter den Gegner', manaCost: 25, staminaCost: 20, cooldown: 4, effect: { type: 'damage', value: 50 } , moduleIndex: 1 },
        { id: 'assassine_precise_dodge', name: 'Präzises Ausweichen', description: 'Perfektes Ausweichen', manaCost: 20, staminaCost: 25, cooldown: 5, effect: { type: 'buff', value: 100, duration: 1 } , moduleIndex: 1 },
        { id: 'assassine_chase', name: 'Nachsetzen', description: 'Verfolgt und greift an', manaCost: 15, staminaCost: 20, cooldown: 3, effect: { type: 'damage', value: 55 } , moduleIndex: 1 },
        // Modul 3: Schwächung
        { id: 'assassine_bleed', name: 'Blutung', description: 'Starke Blutung', manaCost: 30, staminaCost: 20, cooldown: 4, effect: { type: 'dot', value: 20, statusEffect: StatusEffectType.BLEED, duration: 4 } , moduleIndex: 2 },
        { id: 'assassine_armor_break', name: 'Rüstungsbruch', description: 'Durchbricht Rüstung', manaCost: 25, staminaCost: 15, cooldown: 5, effect: { type: 'debuff', value: 30, statusEffect: StatusEffectType.WEAK_SPOT, duration: 3 } , moduleIndex: 2 },
        { id: 'assassine_weakening_cut', name: 'Schwächender Schnitt', description: 'Schwächt Gegner', manaCost: 20, staminaCost: 15, cooldown: 4, effect: { type: 'debuff', value: 25, duration: 2 }, moduleIndex: 2 },
        // Spezialisierungs-exklusive Skills (B-Rang+) - Kosten/Cooldown rang-basiert
        { id: 'assassine_deadly_appearance', name: 'Tödliche Erscheinung', description: 'Erster Treffer aus dem Hinterhalt verursacht massiv erhöhten Schaden. Verbraucht Position - verpufft bei Fehlnutzung.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 180 }, moduleIndex: 0, requiresSpecialization: RoleSpecialization.ASSASSINE_SHADOW, isExclusive: true, roleType: 'dps' },
        { id: 'assassine_perfect_cut', name: 'Perfekter Schnitt', description: 'Nächster Angriff ignoriert einen Teil der Verteidigung. Verbraucht Position - verpufft bei Fehlnutzung.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 130 }, moduleIndex: 1, requiresSpecialization: RoleSpecialization.ASSASSINE_BLADE, isExclusive: true, roleType: 'dps' },
        { id: 'assassine_bloodlust', name: 'Blutrausch', description: 'Schaden steigt pro aktivem Blutungseffekt. Verbraucht Position - verpufft bei Fehlnutzung.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'buff', value: 60, duration: 4 }, moduleIndex: 2, requiresSpecialization: RoleSpecialization.ASSASSINE_POISON, isExclusive: true, roleType: 'dps' }
    ],

    // ========================================
    // 🔮 MAGIER
    // ========================================
    [Role.MAGIER]: [
        // Modul 1: Elementare Zerstörung
        { id: 'magier_fire_missile', name: 'Feuerprojektil', description: 'Feuergeschoss', manaCost: 25, staminaCost: 5, cooldown: 2, effect: { type: 'damage', value: 60, statusEffect: StatusEffectType.BURN, duration: 2 } , moduleIndex: 0 },
        { id: 'magier_ice_lance', name: 'Eislanze', description: 'Durchbohrt mit Eis', manaCost: 30, staminaCost: 5, cooldown: 3, effect: { type: 'damage', value: 70 } , moduleIndex: 0 },
        { id: 'magier_lightning', name: 'Blitzschlag', description: 'Blitz vom Himmel', manaCost: 35, staminaCost: 10, cooldown: 4, effect: { type: 'damage', value: 85 } , moduleIndex: 0 },
        // Modul 2: Arkane Kontrolle
        { id: 'magier_slow_field', name: 'Verlangsamungsfeld', description: 'Verlangsamende Zone', manaCost: 30, staminaCost: 10, cooldown: 5, effect: { type: 'debuff', value: 40, duration: 3 } , moduleIndex: 1 },
        { id: 'magier_magic_bind', name: 'Magische Fessel', description: 'Fesselt Gegner', manaCost: 35, staminaCost: 5, cooldown: 6, effect: { type: 'debuff', value: 100, statusEffect: StatusEffectType.STUNNED, duration: 1 } , moduleIndex: 1 },
        { id: 'magier_suppression_zone', name: 'Unterdrückungszone', description: 'Reduziert Gegnerschaden', manaCost: 40, staminaCost: 10, cooldown: 6, effect: { type: 'debuff', value: 50, duration: 2 } , moduleIndex: 1 },
        // Modul 3: Manafluss
        { id: 'magier_mana_regen', name: 'Manaregeneration', description: 'Stellt Mana wieder her', manaCost: 0, staminaCost: 10, cooldown: 4, effect: { type: 'heal', value: 30, duration: 3 } , moduleIndex: 2 },
        { id: 'magier_spell_focus', name: 'Zauberfokus', description: 'Erhöht Zauberschaden', manaCost: 25, staminaCost: 5, cooldown: 5, effect: { type: 'buff', value: 30, duration: 3 } , moduleIndex: 2 },
        { id: 'magier_arcane_overload', name: 'Arkane Überladung', description: 'Massiver Schaden', manaCost: 60, staminaCost: 15, cooldown: 7, effect: { type: 'damage', value: 150 }, moduleIndex: 2 },
        // Spezialisierungs-exklusive Skills (B-Rang+) - Kosten/Cooldown rang-basiert
        { id: 'magier_inferno', name: 'Inferno', description: 'Massive Feuerexplosion verursacht Flächenschaden. Überhitzung bei Fehl-Timing (Mini-Debuff).', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 200 }, moduleIndex: 0, requiresSpecialization: RoleSpecialization.MAGIER_PYRO, isExclusive: true, roleType: 'dps' },
        { id: 'magier_absolute_zero', name: 'Absoluter Nullpunkt', description: 'Friert Gegner komplett ein und verursacht massiven Schaden. Überhitzung bei Fehl-Timing (Mini-Debuff).', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 170, statusEffect: StatusEffectType.FROZEN, duration: 2 }, moduleIndex: 1, requiresSpecialization: RoleSpecialization.MAGIER_FROST, isExclusive: true, roleType: 'dps' },
        { id: 'magier_chain_lightning', name: 'Kettenblitz', description: 'Springt zwischen mehreren Zielen. Überhitzung bei Fehl-Timing (Mini-Debuff).', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 150 }, moduleIndex: 2, requiresSpecialization: RoleSpecialization.MAGIER_STORM, isExclusive: true, roleType: 'dps' }
    ],

    // ========================================
    // ✨ HEILER
    // ========================================
    [Role.HEILER]: [
        // Modul 1: Lebenssicherung
        { id: 'heiler_heal_pulse', name: 'Heilimpuls', description: 'Sofortige Heilung', manaCost: 25, staminaCost: 5, cooldown: 2, effect: { type: 'heal', value: 60 } , moduleIndex: 0 },
        { id: 'heiler_emergency_heal', name: 'Notfallheilung', description: 'Starke Sofort-Heilung', manaCost: 40, staminaCost: 10, cooldown: 5, effect: { type: 'heal', value: 100 } , moduleIndex: 0 },
        { id: 'heiler_life_transfer', name: 'Lebensübertragung', description: 'Heilt über Zeit', manaCost: 35, staminaCost: 10, cooldown: 4, effect: { type: 'heal', value: 25, duration: 4 } , moduleIndex: 0 },
        // Modul 2: Segen
        { id: 'heiler_blessing', name: 'Schutzsegen', description: 'Schützt vor Schaden', manaCost: 30, staminaCost: 10, cooldown: 5, effect: { type: 'buff', value: 40, duration: 3 } , moduleIndex: 1 },
        { id: 'heiler_cleanse', name: 'Statusreinigung', description: 'Entfernt Debuffs', manaCost: 35, staminaCost: 5, cooldown: 6, effect: { type: 'buff', value: 0 } , moduleIndex: 1 },
        { id: 'heiler_resistance', name: 'Widerstandsverstärkung', description: 'Erhöht Resistenzen', manaCost: 30, staminaCost: 10, cooldown: 5, effect: { type: 'buff', value: 35, duration: 4 } , moduleIndex: 1 },
        // Modul 3: Wiederherstellung
        { id: 'heiler_regen_field', name: 'Regenerationsfeld', description: 'Heilt alle in Zone', manaCost: 40, staminaCost: 15, cooldown: 6, effect: { type: 'heal', value: 20, duration: 3 } , moduleIndex: 2 },
        { id: 'heiler_afterheal', name: 'Nachheilung', description: 'Heilt nach Angriffen', manaCost: 30, staminaCost: 10, cooldown: 5, effect: { type: 'heal', value: 15, duration: 5 } , moduleIndex: 2 },
        { id: 'heiler_life_anchor', name: 'Lebensanker', description: 'Verhindert Tod', manaCost: 50, staminaCost: 20, cooldown: 8, effect: { type: 'buff', value: 100, duration: 1 }, moduleIndex: 2 },
        // Spezialisierungs-exklusive Skills (B-Rang+) - Kosten/Cooldown rang-basiert
        { id: 'heiler_divine_resurrection', name: 'Göttliche Auferstehung', description: 'Bringt verbündete zurück ins Leben oder heilt massiv bei niedriger HP. Rettungsfenster: Bonus nur bei niedriger HP.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'heal', value: 300 }, moduleIndex: 0, requiresSpecialization: RoleSpecialization.HEILER_PRIEST, isExclusive: true, roleType: 'support' },
        { id: 'heiler_sacred_ground', name: 'Heiliger Boden', description: 'Schafft eine Zone die kontinuierlich heilt und Schutz bietet. Rettungsfenster: Bonus nur bei niedriger HP.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'buff', value: 50, duration: 5 }, moduleIndex: 1, requiresSpecialization: RoleSpecialization.HEILER_GUARDIAN, isExclusive: true, roleType: 'support' },
        { id: 'heiler_miracle', name: 'Wunder', description: 'Massive Heilung mit göttlicher Macht. Rettungsfenster: Bonus nur bei niedriger HP.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'heal', value: 250 }, moduleIndex: 2, requiresSpecialization: RoleSpecialization.HEILER_SAGE, isExclusive: true, roleType: 'support' }
    ],

    // ========================================
    // 🧿 BESCHWÖRER
    // ========================================
    [Role.BESCHWOERER]: [
        // Modul 1: Bindung
        { id: 'beschwoerer_summon', name: 'Kreatur beschwören', description: 'Beschwört Kampfkreatur', manaCost: 40, staminaCost: 10, cooldown: 6, effect: { type: 'damage', value: 50, duration: 5 } , moduleIndex: 0 },
        { id: 'beschwoerer_enhance_bond', name: 'Bindungsverstärkung', description: 'Verstärkt Kreaturen', manaCost: 25, staminaCost: 10, cooldown: 4, effect: { type: 'buff', value: 40, duration: 4 } , moduleIndex: 0 },
        { id: 'beschwoerer_essence_transfer', name: 'Essenzübertragung', description: 'Teilt Schaden', manaCost: 30, staminaCost: 15, cooldown: 5, effect: { type: 'buff', value: 50, duration: 3 } , moduleIndex: 0 },
        // Modul 2: Befehl
        { id: 'beschwoerer_focus_command', name: 'Fokusbefehl', description: 'Fokussierter Angriff', manaCost: 20, staminaCost: 10, cooldown: 3, effect: { type: 'damage', value: 60 } , moduleIndex: 1 },
        { id: 'beschwoerer_swap_position', name: 'Positionswechsel', description: 'Tauscht Position', manaCost: 25, staminaCost: 15, cooldown: 5, effect: { type: 'buff', value: 30, duration: 2 } , moduleIndex: 1 },
        { id: 'beschwoerer_sacrifice', name: 'Opferbefehl', description: 'Opfert Kreatur', manaCost: 35, staminaCost: 20, cooldown: 6, effect: { type: 'damage', value: 120 } , moduleIndex: 1 },
        // Modul 3: Überwältigung
        { id: 'beschwoerer_multi_summon', name: 'Mehrfachbeschwörung', description: 'Mehrere Kreaturen', manaCost: 50, staminaCost: 15, cooldown: 7, effect: { type: 'damage', value: 40, duration: 4 } , moduleIndex: 2 },
        { id: 'beschwoerer_swarm', name: 'Schwarmangriff', description: 'Alle greifen an', manaCost: 40, staminaCost: 20, cooldown: 6, effect: { type: 'damage', value: 80 } , moduleIndex: 2 },
        { id: 'beschwoerer_dominance', name: 'Dominanzimpuls', description: 'Schaden pro Kreatur', manaCost: 35, staminaCost: 15, cooldown: 5, effect: { type: 'damage', value: 70 }, moduleIndex: 2 },
        // Spezialisierungs-exklusive Skills (B-Rang+) - Kosten/Cooldown rang-basiert
        { id: 'beschwoerer_elemental_fury', name: 'Elementarwut', description: 'Beschwört alle 4 Elementare gleichzeitig für kurze Zeit. Bindungskosten: Opfer/Abschwächung nach Nutzung.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 160 }, moduleIndex: 0, requiresSpecialization: RoleSpecialization.BESCHWOERER_SUMMONER, isExclusive: true, roleType: 'dps' },
        { id: 'beschwoerer_swarm_attack', name: 'Schwarm-Angriff', description: 'Unzählige kleine Kreaturen überwältigen das Ziel. Bindungskosten: Opfer/Abschwächung nach Nutzung.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 140 }, moduleIndex: 1, requiresSpecialization: RoleSpecialization.BESCHWOERER_SWARM, isExclusive: true, roleType: 'dps' },
        { id: 'beschwoerer_alpha_beast', name: 'Alpha-Bestie', description: 'Beschwört eine mächtige Bestie mit erhöhten Stats. Bindungskosten: Opfer/Abschwächung nach Nutzung.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 180 }, moduleIndex: 2, requiresSpecialization: RoleSpecialization.BESCHWOERER_BEASTMASTER, isExclusive: true, roleType: 'dps' }
    ],

    // ========================================
    // 🩸 BERSERKER
    // ========================================
    [Role.BERSERKER]: [
        // Modul 1: Raserei
        { id: 'berserker_rage', name: 'Wutanfall', description: 'Wilde Angriffsserie', manaCost: 20, staminaCost: 30, cooldown: 3, effect: { type: 'damage', value: 75 } , moduleIndex: 0 },
        { id: 'berserker_escalating_strike', name: 'Eskalierender Schlag', description: 'Schaden steigt', manaCost: 25, staminaCost: 25, cooldown: 4, effect: { type: 'damage', value: 60 } , moduleIndex: 0 },
        { id: 'berserker_adrenaline', name: 'Adrenalinstoß', description: 'Erhöht Tempo', manaCost: 30, staminaCost: 35, cooldown: 5, effect: { type: 'buff', value: 50, duration: 3 } , moduleIndex: 0 },
        // Modul 2: Blutopfer
        { id: 'berserker_self_harm', name: 'Selbstverletzung', description: 'Opfert HP für Schaden', manaCost: 0, staminaCost: 20, cooldown: 4, effect: { type: 'damage', value: 100 } , moduleIndex: 1 },
        { id: 'berserker_blood_frenzy', name: 'Blutrausch', description: 'Mehr Schaden bei niedrig HP', manaCost: 15, staminaCost: 25, cooldown: 5, effect: { type: 'damage', value: 90 } , moduleIndex: 1 },
        { id: 'berserker_sacrifice_strike', name: 'Opferstoß', description: 'Verliert HP, massiv Schaden', manaCost: 25, staminaCost: 30, cooldown: 6, effect: { type: 'damage', value: 130 } , moduleIndex: 1 },
        // Modul 3: Unaufhaltsamkeit
        { id: 'berserker_cc_resist', name: 'CC-Resistenz', description: 'Immun gegen Kontrolle', manaCost: 20, staminaCost: 20, cooldown: 6, effect: { type: 'buff', value: 100, duration: 2 } , moduleIndex: 2 },
        { id: 'berserker_breakthrough', name: 'Durchbrechen', description: 'Durchbricht Verteidigung', manaCost: 30, staminaCost: 35, cooldown: 5, effect: { type: 'damage', value: 95 } , moduleIndex: 2 },
        { id: 'berserker_last_stand', name: 'Letzter Ansturm', description: 'Finaler Angriff', manaCost: 40, staminaCost: 40, cooldown: 7, effect: { type: 'damage', value: 150 }, moduleIndex: 2 },
        // Spezialisierungs-exklusive Skills (B-Rang+) - Kosten/Cooldown rang-basiert
        { id: 'berserker_bloodbath', name: 'Blutbad', description: 'Opfert HP für massiven Schaden. Nacherschöpfung nach Nutzung. Kosten: Leben/Wut.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 250 }, moduleIndex: 0, requiresSpecialization: RoleSpecialization.BERSERKER_BLOOD, isExclusive: true, roleType: 'dps' },
        { id: 'berserker_titanic_blow', name: 'Titanenschlag', description: 'Nutzt rohe Stärke für verheerenden Angriff. Nacherschöpfung nach Nutzung. Kosten: Leben/Wut.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 220 }, moduleIndex: 1, requiresSpecialization: RoleSpecialization.BERSERKER_TITAN, isExclusive: true, roleType: 'dps' },
        { id: 'berserker_reaper_strike', name: 'Sensenhieb', description: 'Massiver Execute-Schaden an geschwächten Zielen. Nacherschöpfung nach Nutzung. Kosten: Leben/Wut.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 280 }, moduleIndex: 2, requiresSpecialization: RoleSpecialization.BERSERKER_REAPER, isExclusive: true, roleType: 'dps' }
    ],

    // ========================================
    // ☠️ FLUCHWIRKER
    // ========================================
    [Role.FLUCHWIRKER]: [
        // Modul 1: Verfall
        { id: 'fluchwirker_plague', name: 'Seuchenfluch', description: 'Infiziert mit Seuche', manaCost: 30, staminaCost: 10, cooldown: 4, effect: { type: 'dot', value: 18, statusEffect: StatusEffectType.BLEED, duration: 5 } , moduleIndex: 0 },
        { id: 'fluchwirker_weakness', name: 'Schwächungszauber', description: 'Schwächt massiv', manaCost: 25, staminaCost: 10, cooldown: 4, effect: { type: 'debuff', value: 40, duration: 3 } , moduleIndex: 0 },
        { id: 'fluchwirker_decay_burst', name: 'Verfallsausbruch', description: 'DoTs explodieren', manaCost: 40, staminaCost: 15, cooldown: 6, effect: { type: 'damage', value: 110 } , moduleIndex: 0 },
        // Modul 2: Furcht & Kontrolle
        { id: 'fluchwirker_fear', name: 'Angstschrei', description: 'Verursacht Furcht', manaCost: 30, staminaCost: 10, cooldown: 5, effect: { type: 'debuff', value: 60, statusEffect: StatusEffectType.STUNNED, duration: 2 } , moduleIndex: 1 },
        { id: 'fluchwirker_ban_circle', name: 'Bannkreis', description: 'Bindet an Ort', manaCost: 35, staminaCost: 15, cooldown: 6, effect: { type: 'debuff', value: 100, duration: 2 } , moduleIndex: 1 },
        { id: 'fluchwirker_mind_shock', name: 'Gedankenschock', description: 'Schockt den Geist', manaCost: 25, staminaCost: 10, cooldown: 4, effect: { type: 'damage', value: 55, statusEffect: StatusEffectType.STUNNED, duration: 1 } , moduleIndex: 1 },
        // Modul 3: Verdammnis
        { id: 'fluchwirker_doom_mark', name: 'Verdammungsmarke', description: 'Markiert für Tod', manaCost: 35, staminaCost: 15, cooldown: 5, effect: { type: 'debuff', value: 50, duration: 4 } , moduleIndex: 2 },
        { id: 'fluchwirker_soul_break', name: 'Seelenbruch', description: 'Bricht die Seele', manaCost: 40, staminaCost: 20, cooldown: 6, effect: { type: 'damage', value: 100 } , moduleIndex: 2 },
        { id: 'fluchwirker_judgement', name: 'Urteil', description: 'Richtspruch, Schaden pro Debuff', manaCost: 50, staminaCost: 25, cooldown: 7, effect: { type: 'damage', value: 140 }, moduleIndex: 2 },
        // Spezialisierungs-exklusive Skills (B-Rang+) - Kosten/Cooldown rang-basiert
        { id: 'fluchwirker_overwhelming_curse', name: 'Überwältigender Fluch', description: 'Stapelt mehrere Debuffs auf das Ziel. Aufbau nötig: Requires Stacks/Debuffs.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'debuff', value: 60, duration: 5 }, moduleIndex: 0, requiresSpecialization: RoleSpecialization.FLUCHWIRKER_CORRUPTION, isExclusive: true, roleType: 'dps' },
        { id: 'fluchwirker_undead_army', name: 'Untotenarmee', description: 'Beschwört mehrere Untote gleichzeitig. Aufbau nötig: Requires Stacks/Debuffs.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 170 }, moduleIndex: 1, requiresSpecialization: RoleSpecialization.FLUCHWIRKER_NECRO, isExclusive: true, roleType: 'dps' },
        { id: 'fluchwirker_final_judgement', name: 'Letztes Urteil', description: 'Verursacht massiven Schaden an stark geschwächten Zielen. Aufbau nötig: Requires Stacks/Debuffs.', manaCost: 0, staminaCost: 0, cooldown: 0, effect: { type: 'damage', value: 220 }, moduleIndex: 2, requiresSpecialization: RoleSpecialization.FLUCHWIRKER_DOOM, isExclusive: true, roleType: 'dps' }
    ],

    // ========================================
    // 🎯 HUNTER (Universal)
    // ========================================
    [Role.HUNTER]: [
        { id: 'hunter_strike', name: 'Hunter-Schlag', description: 'Basisangriff', manaCost: 15, staminaCost: 10, cooldown: 2, effect: { type: 'damage', value: 50 } , moduleIndex: 0 },
        { id: 'hunter_awakened_power', name: 'Erwachte Kraft', description: 'Erwachte Energie', manaCost: 30, staminaCost: 20, cooldown: 4, effect: { type: 'damage', value: 85 } , moduleIndex: 0 },
        { id: 'hunter_double_strike', name: 'Doppelschlag', description: 'Zweimal zuschlagen', manaCost: 25, staminaCost: 25, cooldown: 3, effect: { type: 'damage', value: 70 }, moduleIndex: 0 }
    ]
};

/**
 * Basis-Aktionen die alle Rollen nutzen können
 * Hinweis: Schaden wird durch Rang-Multiplikator skaliert (E: 1.0x → SSS: 4.0x)
 * Block-Reduzierung und Dodge-Chance sind ebenfalls rang-basiert
 */
export const BASE_ACTIONS = {
    ATTACK: {
        id: 'attack',
        name: 'Angriff',
        baseDamage: 25,  // Wird mit Rang-Multiplikator skaliert
        staminaCost: 10
    },
    STRONG_ATTACK: {
        id: 'strong-attack',
        name: 'Starker Angriff',
        baseDamage: 25,  // 1.5x in Combat Engine
        staminaCost: 20,
        cooldown: 2
    },
    BLOCK: {
        id: 'block',
        name: 'Blocken',
        damageReduction: 50,  // Wird durch rang-basierte Reduzierung ersetzt
        manaGain: 10  // Mana-Regeneration beim Blocken
    },
    DODGE: {
        id: 'dodge',
        name: 'Ausweichen',
        staminaCost: 15,  // Ausdauer-Kosten
        dodgeChance: 60  // Wird durch rang-basierte Chance ersetzt
    }
};

export function getSkillsForRole(role: Role): Skill[] {
    return ROLE_SKILLS[role] || [];
}

export function getSkillById(skillId: string): Skill | undefined {
    for (const roleSkills of Object.values(ROLE_SKILLS)) {
        const skill = roleSkills.find(s => s.id === skillId);
        if (skill) return skill;
    }
    return undefined;
}

