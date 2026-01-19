/**
 * NEUES KAMPFSYSTEM - Type Definitions
 * Tick-basiertes, telegraph-gesteuertes System
 */
// ==================== TAGS ====================
export var ActionTag;
(function (ActionTag) {
    // Angriffstypen
    ActionTag["SCHLAG"] = "schlag";
    ActionTag["STICH"] = "stich";
    ActionTag["MAGIE"] = "magie";
    ActionTag["SCHATTEN"] = "schatten";
    // Eigenschaften
    ActionTag["KANALISIERUNG"] = "kanalisierung";
    ActionTag["PROJEKTIL"] = "projektil";
    ActionTag["FLAECHE"] = "flaeche";
    ActionTag["DURCHDRINGEND"] = "durchdringend";
    ActionTag["EXEKUTION"] = "exekution";
    ActionTag["RITUAL"] = "ritual";
    // Reaktionstypen
    ActionTag["BLOCK"] = "block";
    ActionTag["AUSWEICHEN"] = "ausweichen";
    ActionTag["UNTERBRECHEN"] = "unterbrechen";
    ActionTag["SCHILD"] = "schild";
})(ActionTag || (ActionTag = {}));
// ==================== TELEGRAPH ====================
export var TelegraphType;
(function (TelegraphType) {
    TelegraphType["SCHWERER_SCHLAG"] = "schwerer_schlag";
    TelegraphType["MAGISCHE_KANALISIERUNG"] = "magische_kanalisierung";
    TelegraphType["PROJEKTILANGRIFF"] = "projektilangriff";
    TelegraphType["FLAECHENANGRIFF"] = "flaechenangriff";
    TelegraphType["EXEKUTION"] = "exekution";
    TelegraphType["RITUAL"] = "ritual";
})(TelegraphType || (TelegraphType = {}));
export var ThreatLevel;
(function (ThreatLevel) {
    ThreatLevel["GERING"] = "gering";
    ThreatLevel["HOCH"] = "hoch";
    ThreatLevel["TOEDLICH"] = "toedlich";
    ThreatLevel["KATASTROPHAL"] = "katastrophal";
})(ThreatLevel || (ThreatLevel = {}));
// ==================== STATUS EFFECTS ====================
export var StatusEffectType;
(function (StatusEffectType) {
    // Schaden über Zeit
    StatusEffectType["BLUTUNG"] = "blutung";
    StatusEffectType["VERBRENNUNG"] = "verbrennung";
    StatusEffectType["VERGIFTUNG"] = "vergiftung";
    // Buffs
    StatusEffectType["VERSTAERKUNG"] = "verstaerkung";
    StatusEffectType["SCHILD"] = "schild";
    StatusEffectType["REGENERATION"] = "regeneration";
    StatusEffectType["WACHSAMKEIT"] = "wachsamkeit";
    // Debuffs
    StatusEffectType["SCHWAECHUNG"] = "schwaechung";
    StatusEffectType["VERLANGSAMUNG"] = "verlangsamung";
    StatusEffectType["FURCHT"] = "furcht";
    StatusEffectType["BETAEUBUNG"] = "betaeubung";
    StatusEffectType["VERWUNDBARKEIT"] = "verwundbarkeit";
})(StatusEffectType || (StatusEffectType = {}));
export var CombatRole;
(function (CombatRole) {
    CombatRole["WAECHTER"] = "waechter";
    CombatRole["JAEGER"] = "jaeger";
    CombatRole["MAGIER"] = "magier";
    CombatRole["HEILER"] = "heiler";
})(CombatRole || (CombatRole = {}));
/**
 * Berechnet Level-Interaktion zwischen zwei Combatants
 */
export function calculateLevelInteraction(attackerLevel, defenderLevel) {
    const delta = attackerLevel - defenderLevel;
    let hitChance = 0.85; // Basis 85%
    let effectModifier = 1.0;
    let statusSuccessChance = 0.5;
    let statusDurationModifier = 1.0;
    if (delta >= 5) {
        // Stark überlegen
        hitChance = 0.95;
        effectModifier = 1.5;
        statusSuccessChance = 0.9;
        statusDurationModifier = 1.5;
    }
    else if (delta >= 2) {
        // Überlegen
        hitChance = 0.90;
        effectModifier = 1.2;
        statusSuccessChance = 0.7;
        statusDurationModifier = 1.2;
    }
    else if (delta >= -1) {
        // Ausgeglichen
        hitChance = 0.85;
        effectModifier = 1.0;
        statusSuccessChance = 0.5;
        statusDurationModifier = 1.0;
    }
    else if (delta >= -4) {
        // Unterlegen
        hitChance = 0.70;
        effectModifier = 0.6;
        statusSuccessChance = 0.3;
        statusDurationModifier = 0.6;
    }
    else {
        // Stark unterlegen
        hitChance = 0.50;
        effectModifier = 0.3;
        statusSuccessChance = 0.1;
        statusDurationModifier = 0.3;
    }
    return {
        deltaLevel: delta,
        hitChance,
        effectModifier,
        statusSuccessChance,
        statusDurationModifier
    };
}
export const TAG_INTERACTIONS = [
    // Unterbrechen vs Kanalisierung
    { attackTag: ActionTag.UNTERBRECHEN, defenseTag: ActionTag.KANALISIERUNG, modifier: 0, message: 'Kanalisierung unterbrochen!' },
    // Block vs physische Angriffe
    { attackTag: ActionTag.BLOCK, defenseTag: ActionTag.SCHLAG, modifier: 0.3, message: 'Schlag geblockt!' },
    { attackTag: ActionTag.BLOCK, defenseTag: ActionTag.STICH, modifier: 0.4, message: 'Stich teilweise geblockt!' },
    // Ausweichen vs Projektile
    { attackTag: ActionTag.AUSWEICHEN, defenseTag: ActionTag.PROJEKTIL, modifier: 0, message: 'Projektil ausgewichen!' },
    // Durchdringend schwächt Block/Schild
    { attackTag: ActionTag.DURCHDRINGEND, defenseTag: ActionTag.BLOCK, modifier: 1.5, message: 'Block durchdrungen!' },
    { attackTag: ActionTag.DURCHDRINGEND, defenseTag: ActionTag.SCHILD, modifier: 1.3, message: 'Schild durchdrungen!' },
    // Flächenangriffe schwer auszuweichen
    { attackTag: ActionTag.AUSWEICHEN, defenseTag: ActionTag.FLAECHE, modifier: 0.7, message: 'Teilweise ausgewichen!' }
];
//# sourceMappingURL=combat-types.js.map