/**
 * Core combat type definitions
 */
export var Role;
(function (Role) {
    Role["WAECHTER"] = "waechter";
    Role["ASSASSINE"] = "assassine";
    Role["MAGIER"] = "magier";
    Role["SCHARFSCHUETZE"] = "scharfschuetze";
    Role["HEILER"] = "heiler";
})(Role || (Role = {}));
// Rollennamen für Titel (vor Level 10)
export const ROLE_DISPLAY_NAMES = {
    [Role.WAECHTER]: 'Wächter',
    [Role.ASSASSINE]: 'Assassine',
    [Role.MAGIER]: 'Magier',
    [Role.SCHARFSCHUETZE]: 'Scharfschütze',
    [Role.HEILER]: 'Heiler'
};
/**
 * Gibt den Titel basierend auf Level und Rang zurück
 * Level 1-9: Rang + Rollenname (z.B. "D-Rang Heiler")
 * Level 10+: Rang + Hunter (z.B. "C-Rang Hunter")
 */
export function getPlayerTitle(level, rank, role) {
    const roleKey = (typeof role === 'string' ? role : role);
    if (level < 10) {
        return `${rank}-Rang ${ROLE_DISPLAY_NAMES[roleKey] || 'Jäger'}`;
    }
    else {
        return `${rank}-Rang Hunter`;
    }
}
export var StatusEffectType;
(function (StatusEffectType) {
    StatusEffectType["BLEED"] = "bleed";
    StatusEffectType["BURN"] = "burn";
    StatusEffectType["FORTIFY"] = "fortify";
    StatusEffectType["WEAK_SPOT"] = "weak_spot";
    StatusEffectType["STUNNED"] = "stunned";
})(StatusEffectType || (StatusEffectType = {}));
export var CombatEventType;
(function (CombatEventType) {
    CombatEventType["DAMAGE"] = "damage";
    CombatEventType["VICTORY"] = "victory";
    CombatEventType["DEFEAT"] = "defeat";
    CombatEventType["SKILL"] = "skill";
    CombatEventType["HEAL"] = "heal";
    CombatEventType["STATUS"] = "status";
    CombatEventType["INFO"] = "info";
})(CombatEventType || (CombatEventType = {}));
//# sourceMappingURL=types.js.map