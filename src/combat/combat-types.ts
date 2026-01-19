/**
 * NEUES KAMPFSYSTEM - Type Definitions
 * Tick-basiertes, telegraph-gesteuertes System
 */

import { GateRank } from './types.js';

// ==================== TAGS ====================
export enum ActionTag {
    // Angriffstypen
    SCHLAG = 'schlag',
    STICH = 'stich',
    MAGIE = 'magie',
    SCHATTEN = 'schatten',
    
    // Eigenschaften
    KANALISIERUNG = 'kanalisierung',
    PROJEKTIL = 'projektil',
    FLAECHE = 'flaeche',
    DURCHDRINGEND = 'durchdringend',
    EXEKUTION = 'exekution',
    RITUAL = 'ritual',
    
    // Reaktionstypen
    BLOCK = 'block',
    AUSWEICHEN = 'ausweichen',
    UNTERBRECHEN = 'unterbrechen',
    SCHILD = 'schild'
}

// ==================== TELEGRAPH ====================
export enum TelegraphType {
    SCHWERER_SCHLAG = 'schwerer_schlag',
    MAGISCHE_KANALISIERUNG = 'magische_kanalisierung',
    PROJEKTILANGRIFF = 'projektilangriff',
    FLAECHENANGRIFF = 'flaechenangriff',
    EXEKUTION = 'exekution',
    RITUAL = 'ritual'
}

export enum ThreatLevel {
    GERING = 'gering',
    HOCH = 'hoch',
    TOEDLICH = 'toedlich',
    KATASTROPHAL = 'katastrophal'
}

export interface Telegraph {
    type: TelegraphType;
    threatLevel: ThreatLevel;
    preparationTicks: number; // Wie viele Ticks bis zur Ausführung
    remainingTicks: number;
    sourceId: string; // Wer bereitet die Aktion vor
    targetId: string; // Wer ist das Ziel
    actionId: string; // Unique ID der vorbereiteten Aktion
}

// ==================== ACTIONS ====================
export interface CombatAction {
    id: string;
    name: string;
    tags: ActionTag[];
    preparationTicks: number; // 0 = instant
    cooldownTicks: number;
    
    // Ressourcen
    manaCost?: number;
    rageCost?: number;
    focusCost?: number;
    
    // Effekte
    baseDamage?: number;
    baseHealing?: number;
    statusEffects?: StatusEffectApplication[];
    
    // Telegraph-Info
    telegraphType?: TelegraphType;
    threatLevel?: ThreatLevel;
    
    // Beschreibung für UI
    description: string;
}

export interface StatusEffectApplication {
    type: StatusEffectType;
    baseDuration: number; // in Ticks
    baseValue: number;
    levelScaling: boolean; // Wird durch Level beeinflusst?
}

// ==================== STATUS EFFECTS ====================
export enum StatusEffectType {
    // Schaden über Zeit
    BLUTUNG = 'blutung',
    VERBRENNUNG = 'verbrennung',
    VERGIFTUNG = 'vergiftung',
    
    // Buffs
    VERSTAERKUNG = 'verstaerkung',
    SCHILD = 'schild',
    REGENERATION = 'regeneration',
    WACHSAMKEIT = 'wachsamkeit',
    
    // Debuffs
    SCHWAECHUNG = 'schwaechung',
    VERLANGSAMUNG = 'verlangsamung',
    FURCHT = 'furcht',
    BETAEUBUNG = 'betaeubung',
    VERWUNDBARKEIT = 'verwundbarkeit'
}

export interface StatusEffect {
    type: StatusEffectType;
    duration: number; // verbleibende Ticks
    value: number; // Stärke des Effekts
    sourceLevel: number; // Level der Quelle (für Resistenz)
    stackCount: number; // Wie oft gestackt
}

// ==================== COMBATANT ====================
export interface Combatant {
    id: string;
    name: string;
    isPlayer: boolean;
    
    // Stats
    level: number;
    hp: number;
    maxHp: number;
    
    // Ressourcen
    mana?: number;
    maxMana?: number;
    rage?: number;
    maxRage?: number;
    focus?: number;
    maxFocus?: number;
    
    // Hunter-spezifisch
    hunterRank?: GateRank;
    role?: CombatRole;
    
    // Kampf-Status
    statusEffects: StatusEffect[];
    shield: number; // Absorbiert Schaden
    damageReduction: number; // 0-1 (0.2 = 20% reduction)
    
    // Aktionen
    availableActions: CombatAction[];
    currentAction: PreparedAction | null;
    actionCooldowns: Map<string, number>; // actionId -> remaining ticks
    
    // AI (für Gegner)
    isAI: boolean;
    aiPattern?: AIPattern;
}

export enum CombatRole {
    WAECHTER = 'waechter',
    JAEGER = 'jaeger',
    MAGIER = 'magier',
    HEILER = 'heiler'
}

export interface PreparedAction {
    action: CombatAction;
    remainingPreparationTicks: number;
    targetId: string;
    canBeInterrupted: boolean;
}

// ==================== AI ====================
export interface AIPattern {
    type: 'basic' | 'boss';
    phases?: BossPhase[];
    currentPhase: number;
    
    // Behavior
    aggressiveness: number; // 0-1
    preferredRange: 'melee' | 'ranged' | 'mixed';
    usesSpecials: boolean;
}

export interface BossPhase {
    hpThreshold: number; // 0.75, 0.50, 0.25
    newActions: string[]; // Action IDs die freigeschaltet werden
    speedModifier: number; // Tick-Geschwindigkeit ändern
    message: string; // "SYSTEM: Muster-Änderung erkannt"
}

// ==================== COMBAT STATE ====================
export interface NewCombatState {
    tickCount: number;
    tickDuration: number; // ms pro Tick
    isRunning: boolean;
    isPaused: boolean;
    
    player: Combatant;
    enemies: Combatant[];
    currentTargetId: string | null;
    
    activeTelegraphs: Telegraph[];
    
    combatLog: CombatLogEntry[];
    
    // Trupp (NPC-System)
    squadMembers: Combatant[];
    
    // Sieg/Niederlage
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
    isImportant: boolean; // Für Highlighting
}

export interface CombatRewards {
    xp: number;
    gold: number;
    items?: any[]; // Später erweitern
}

// ==================== LEVEL CALCULATIONS ====================
export interface LevelInteraction {
    deltaLevel: number; // Angreifer - Verteidiger
    hitChance: number; // 0-1
    effectModifier: number; // 0-2 (0 = blockiert, 1 = normal, 2 = verstärkt)
    statusSuccessChance: number; // 0-1
    statusDurationModifier: number; // 0-2
}

/**
 * Berechnet Level-Interaktion zwischen zwei Combatants
 */
export function calculateLevelInteraction(attackerLevel: number, defenderLevel: number): LevelInteraction {
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
    } else if (delta >= 2) {
        // Überlegen
        hitChance = 0.90;
        effectModifier = 1.2;
        statusSuccessChance = 0.7;
        statusDurationModifier = 1.2;
    } else if (delta >= -1) {
        // Ausgeglichen
        hitChance = 0.85;
        effectModifier = 1.0;
        statusSuccessChance = 0.5;
        statusDurationModifier = 1.0;
    } else if (delta >= -4) {
        // Unterlegen
        hitChance = 0.70;
        effectModifier = 0.6;
        statusSuccessChance = 0.3;
        statusDurationModifier = 0.6;
    } else {
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

// ==================== TAG INTERACTIONS ====================
export interface TagInteraction {
    attackTag: ActionTag;
    defenseTag: ActionTag;
    modifier: number; // 0 = negiert, 0.5 = halbiert, 1 = normal, 1.5 = verstärkt
    message?: string;
}

export const TAG_INTERACTIONS: TagInteraction[] = [
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
