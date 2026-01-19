/**
 * NEUES KAMPFSYSTEM - Type Definitions
 * Tick-basiertes, telegraph-gesteuertes System
 */
import { GateRank } from './types.js';
export declare enum ActionTag {
    SCHLAG = "schlag",
    STICH = "stich",
    MAGIE = "magie",
    SCHATTEN = "schatten",
    KANALISIERUNG = "kanalisierung",
    PROJEKTIL = "projektil",
    FLAECHE = "flaeche",
    DURCHDRINGEND = "durchdringend",
    EXEKUTION = "exekution",
    RITUAL = "ritual",
    BLOCK = "block",
    AUSWEICHEN = "ausweichen",
    UNTERBRECHEN = "unterbrechen",
    SCHILD = "schild"
}
export declare enum TelegraphType {
    SCHWERER_SCHLAG = "schwerer_schlag",
    MAGISCHE_KANALISIERUNG = "magische_kanalisierung",
    PROJEKTILANGRIFF = "projektilangriff",
    FLAECHENANGRIFF = "flaechenangriff",
    EXEKUTION = "exekution",
    RITUAL = "ritual"
}
export declare enum ThreatLevel {
    GERING = "gering",
    HOCH = "hoch",
    TOEDLICH = "toedlich",
    KATASTROPHAL = "katastrophal"
}
export interface Telegraph {
    type: TelegraphType;
    threatLevel: ThreatLevel;
    preparationTicks: number;
    remainingTicks: number;
    sourceId: string;
    targetId: string;
    actionId: string;
}
export interface CombatAction {
    id: string;
    name: string;
    tags: ActionTag[];
    preparationTicks: number;
    cooldownTicks: number;
    manaCost?: number;
    rageCost?: number;
    focusCost?: number;
    baseDamage?: number;
    baseHealing?: number;
    statusEffects?: StatusEffectApplication[];
    telegraphType?: TelegraphType;
    threatLevel?: ThreatLevel;
    description: string;
}
export interface StatusEffectApplication {
    type: StatusEffectType;
    baseDuration: number;
    baseValue: number;
    levelScaling: boolean;
}
export declare enum StatusEffectType {
    BLUTUNG = "blutung",
    VERBRENNUNG = "verbrennung",
    VERGIFTUNG = "vergiftung",
    VERSTAERKUNG = "verstaerkung",
    SCHILD = "schild",
    REGENERATION = "regeneration",
    WACHSAMKEIT = "wachsamkeit",
    SCHWAECHUNG = "schwaechung",
    VERLANGSAMUNG = "verlangsamung",
    FURCHT = "furcht",
    BETAEUBUNG = "betaeubung",
    VERWUNDBARKEIT = "verwundbarkeit"
}
export interface StatusEffect {
    type: StatusEffectType;
    duration: number;
    value: number;
    sourceLevel: number;
    stackCount: number;
}
export interface Combatant {
    id: string;
    name: string;
    isPlayer: boolean;
    level: number;
    hp: number;
    maxHp: number;
    mana?: number;
    maxMana?: number;
    rage?: number;
    maxRage?: number;
    focus?: number;
    maxFocus?: number;
    hunterRank?: GateRank;
    role?: CombatRole;
    statusEffects: StatusEffect[];
    shield: number;
    damageReduction: number;
    availableActions: CombatAction[];
    currentAction: PreparedAction | null;
    actionCooldowns: Map<string, number>;
    isAI: boolean;
    aiPattern?: AIPattern;
}
export declare enum CombatRole {
    WAECHTER = "waechter",
    JAEGER = "jaeger",
    MAGIER = "magier",
    HEILER = "heiler"
}
export interface PreparedAction {
    action: CombatAction;
    remainingPreparationTicks: number;
    targetId: string;
    canBeInterrupted: boolean;
}
export interface AIPattern {
    type: 'basic' | 'boss';
    phases?: BossPhase[];
    currentPhase: number;
    aggressiveness: number;
    preferredRange: 'melee' | 'ranged' | 'mixed';
    usesSpecials: boolean;
}
export interface BossPhase {
    hpThreshold: number;
    newActions: string[];
    speedModifier: number;
    message: string;
}
export interface NewCombatState {
    tickCount: number;
    tickDuration: number;
    isRunning: boolean;
    isPaused: boolean;
    player: Combatant;
    enemies: Combatant[];
    currentTargetId: string | null;
    activeTelegraphs: Telegraph[];
    combatLog: CombatLogEntry[];
    squadMembers: Combatant[];
    victor: 'player' | 'enemy' | null;
    rewards?: CombatRewards;
}
export interface CombatLogEntry {
    tick: number;
    type: 'action' | 'damage' | 'heal' | 'status' | 'telegraph' | 'system';
    source: string;
    target?: string;
    message: string;
    value?: number;
    isImportant: boolean;
}
export interface CombatRewards {
    xp: number;
    gold: number;
    items?: any[];
}
export interface LevelInteraction {
    deltaLevel: number;
    hitChance: number;
    effectModifier: number;
    statusSuccessChance: number;
    statusDurationModifier: number;
}
/**
 * Berechnet Level-Interaktion zwischen zwei Combatants
 */
export declare function calculateLevelInteraction(attackerLevel: number, defenderLevel: number): LevelInteraction;
export interface TagInteraction {
    attackTag: ActionTag;
    defenseTag: ActionTag;
    modifier: number;
    message?: string;
}
export declare const TAG_INTERACTIONS: TagInteraction[];
//# sourceMappingURL=combat-types.d.ts.map