/**
 * Core combat type definitions
 */
export interface Character {
    name: string;
    hp: number;
    maxHp: number;
}
export interface Player extends Character {
    mp: number;
    maxMp: number;
    role: Role;
    level: number;
    hunterRank: GateRank;
    autoAttackDamage: number;
    autoAttackCount: number;
    shield: number;
    damageReduction: number;
    statusEffects: StatusEffect[];
}
export declare enum Role {
    WAECHTER = "waechter",
    ASSASSINE = "assassine",
    MAGIER = "magier",
    SCHARFSCHUETZE = "scharfschuetze",
    HEILER = "heiler"
}
export declare const ROLE_DISPLAY_NAMES: Record<Role, string>;
/**
 * Gibt den Titel basierend auf Level und Rang zurück
 * Level 1-9: Rang + Rollenname (z.B. "D-Rang Heiler")
 * Level 10+: Rang + Hunter (z.B. "C-Rang Hunter")
 */
export declare function getPlayerTitle(level: number, rank: GateRank, role: Role): string;
export interface Enemy extends Character {
    statusEffects: StatusEffect[];
    damageMultiplier: number;
    autoAttackDamage: number;
}
export interface EnemyDefinition {
    id: number;
    name: string;
    maxHp: number;
    autoAttackDamage: number;
    currentHp?: number;
    isDefeated?: boolean;
    isBoss?: boolean;
}
export interface Dungeon {
    name: string;
    enemies: EnemyDefinition[];
    gateRank: GateRank;
}
export type GateRank = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
export interface DungeonState {
    isActive: boolean;
    currentDungeon: Dungeon | null;
    currentEnemyIndex: number;
}
export interface StatusEffect {
    type: StatusEffectType;
    duration: number;
    value: number;
}
export declare enum StatusEffectType {
    BLEED = "bleed",
    BURN = "burn",
    FORTIFY = "fortify",
    WEAK_SPOT = "weak_spot",
    STUNNED = "stunned"
}
export interface CombatState {
    player: Player;
    enemy: Enemy;
    isRunning: boolean;
    tickCount: number;
    skillCooldowns: SkillCooldowns;
    dungeonState: DungeonState;
    bossState: BossState;
    progression: Progression;
}
export interface Progression {
    level: number;
    xp: number;
    gold: number;
    hunterRank: GateRank;
    guildGoldBonus?: number;
}
export interface BossState {
    isFightingBoss: boolean;
    isEnraged: boolean;
    isPreparingSpecial: boolean;
    specialAttackDamage: number;
    interruptCooldown: number;
}
export interface SkillCooldowns {
    skill1: number;
    skill2: number;
    skill3: number;
    interrupt: number;
}
export interface Skill {
    id: number;
    name: string;
    manaCost: number;
    cooldown: number;
}
export declare enum CombatEventType {
    DAMAGE = "damage",
    VICTORY = "victory",
    DEFEAT = "defeat",
    SKILL = "skill",
    HEAL = "heal",
    STATUS = "status",
    INFO = "info"
}
export interface CombatEvent {
    type: CombatEventType;
    message: string;
    timestamp: number;
}
//# sourceMappingURL=types.d.ts.map