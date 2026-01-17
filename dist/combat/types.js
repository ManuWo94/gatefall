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