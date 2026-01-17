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
    autoAttackCount: number; // for Marksman passive
    shield: number; // Ward/Schutzschild
    damageReduction: number; // percentage 0-100
    statusEffects: StatusEffect[];
}

export enum Role {
    WAECHTER = 'waechter',
    ASSASSINE = 'assassine',
    MAGIER = 'magier',
    SCHARFSCHUETZE = 'scharfschuetze',
    HEILER = 'heiler'
}

// Rollennamen für Titel (vor Level 10)
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
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
export function getPlayerTitle(level: number, rank: GateRank, role: Role): string {
    if (level < 10) {
        return `${rank}-Rang ${ROLE_DISPLAY_NAMES[role]}`;
    } else {
        return `${rank}-Rang Hunter`;
    }
}

export interface Enemy extends Character {
    statusEffects: StatusEffect[];
    damageMultiplier: number; // for Weak Spot debuff (1.0 = normal, 1.2 = +20%)
    autoAttackDamage: number; // enemy attack damage
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
    duration: number; // remaining ticks
    value: number; // damage/heal per tick
}

export enum StatusEffectType {
    BLEED = 'bleed',
    BURN = 'burn',
    FORTIFY = 'fortify',
    WEAK_SPOT = 'weak_spot',
    STUNNED = 'stunned'
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
    guildGoldBonus?: number; // Gold-Bonus der Gilde (0.10 = +10%)
}

export interface BossState {
    isFightingBoss: boolean;
    isEnraged: boolean; // Phase 2 (≤50% HP)
    isPreparingSpecial: boolean;
    specialAttackDamage: number;
    interruptCooldown: number; // in ms
}

export interface SkillCooldowns {
    skill1: number; // remaining cooldown in ms
    skill2: number;
    skill3: number;
    interrupt: number;
}

export interface Skill {
    id: number;
    name: string;
    manaCost: number;
    cooldown: number; // in ms
}

export enum CombatEventType {
    DAMAGE = 'damage',
    VICTORY = 'victory',
    DEFEAT = 'defeat',
    SKILL = 'skill',
    HEAL = 'heal',
    STATUS = 'status',
    INFO = 'info'
}

export interface CombatEvent {
    type: CombatEventType;
    message: string;
    timestamp: number;
}
