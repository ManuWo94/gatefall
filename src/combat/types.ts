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
    stamina: number;
    maxStamina: number;
    role: Role;
    level: number;
    hunterRank: GateRank;
    awakeningState: 'locked' | 'available' | 'in_progress' | 'completed';
    specialization?: RoleSpecialization; // Ab B-Rang
    affinityCapBonus: number; // SS/SSS Rang Bonus
    shield: number;
    damageReduction: number;
    statusEffects: StatusEffect[];
    isBlocking: boolean; // Blockt in dieser Runde
    autoAttackDamage: number;
    autoAttackCount: number;
    defense?: number; // Defense-Stat für Damage-Reduktion
}

export enum Role {
    WAECHTER = 'waechter',
    ASSASSINE = 'assassine',
    MAGIER = 'magier',
    HEILER = 'heiler',
    BESCHWOERER = 'beschwoerer',
    BERSERKER = 'berserker',
    FLUCHWIRKER = 'fluchwirker',
    HUNTER = 'hunter'
}

// Rollennamen für Titel (vor Level 10)
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
    [Role.WAECHTER]: 'Wächter',
    [Role.ASSASSINE]: 'Assassine',
    [Role.MAGIER]: 'Magier',
    [Role.HEILER]: 'Heiler',
    [Role.BESCHWOERER]: 'Beschwörer',
    [Role.BERSERKER]: 'Berserker',
    [Role.FLUCHWIRKER]: 'Fluchwirker',
    [Role.HUNTER]: 'Hunter'
};

// Rollen-Beschreibungen
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
    [Role.WAECHTER]: 'Frontkämpfer, Schutz, Aggro',
    [Role.ASSASSINE]: 'Mobilität, Burst, kritische Treffer',
    [Role.MAGIER]: 'Elementarzauber, AoE, Status',
    [Role.HEILER]: 'Heilung, Schutz, Buffs',
    [Role.BESCHWOERER]: 'Kreaturen, Zonen, Skalierung',
    [Role.BERSERKER]: 'Risiko-DPS, Wutmechaniken',
    [Role.FLUCHWIRKER]: 'Debuffs, Furcht, DoTs',
    [Role.HUNTER]: 'Vielseitiger Kämpfer'
};

// Rollen-Affinitäten
export const ROLE_AFFINITIES: Record<Role, string[]> = {
    [Role.WAECHTER]: ['Nahkampf', 'Unterstützung'],
    [Role.ASSASSINE]: ['Nahkampf', 'Kontrolle'],
    [Role.MAGIER]: ['Magie', 'Kontrolle'],
    [Role.HEILER]: ['Unterstützung', 'Magie'],
    [Role.BESCHWOERER]: ['Magie', 'Kontrolle'],
    [Role.BERSERKER]: ['Nahkampf', 'Kontrolle'],
    [Role.FLUCHWIRKER]: ['Kontrolle', 'Magie'],
    [Role.HUNTER]: ['Vielseitig']
};

/**
 * Gibt den Titel basierend auf Level und Rang zurück
 * Level 1-9: Rang + Rollenname (z.B. "D-Rang Heiler")
 * Level 10+: Rang + Hunter (z.B. "C-Rang Hunter")
 */
export function getPlayerTitle(level: number, rank: GateRank, role: Role | string): string {
    const roleKey = (typeof role === 'string' ? role : role) as Role;
    
    if (level < 10) {
        return `${rank}-Rang ${ROLE_DISPLAY_NAMES[roleKey] || 'Jäger'}`;
    } else {
        return `${rank}-Rang Hunter`;
    }
}

export interface Enemy extends Character {
    statusEffects: StatusEffect[];
    damageMultiplier: number;
    baseDamage: number;
    behavior: EnemyBehavior; // KI-Verhalten
    isBlocking: boolean;
    autoAttackDamage: number;
    rank?: string; // Hunter Rank des Gegners (für Dodge-Berechnung)
    defense?: number; // Defense-Stat für Damage-Reduktion
}

export enum EnemyBehavior {
    AGGRESSIVE = 'aggressive', // Greift häufig an
    DEFENSIVE = 'defensive',   // Blockt/weicht aus
    BALANCED = 'balanced'      // Mix
}

export interface EnemyDefinition {
    id: number | string;
    name: string;
    maxHp: number;
    autoAttackDamage: number;
    currentHp?: number;
    isDefeated?: boolean;
    isBoss?: boolean;
    sprite?: string; // Bildpfad aus DB
}

export interface Dungeon {
    name: string;
    enemies: EnemyDefinition[];
    gateRank: GateRank;
}

export type GateRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

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
    FROZEN = 'frozen',
    FORTIFY = 'fortify',
    WEAK_SPOT = 'weak_spot',
    STUNNED = 'stunned'
}

export interface CombatState {
    player: Player;
    enemy: Enemy;
    isRunning: boolean;
    round: number; // Aktuelle Runde
    turnPhase: TurnPhase; // Player wählt, Execute, usw.
    skillCooldowns: SkillCooldowns;
    dungeonState: DungeonState;
    progression: Progression;
    combatLog: CombatEvent[];
    bossState: BossState;
    tickCount: number;
}

export enum TurnPhase {
    PLAYER_TURN = 'player_turn',     // Spieler wählt Aktion
    ENEMY_TURN = 'enemy_turn',       // Gegner wählt (unsichtbar)
    EXECUTE = 'execute',             // Beide Aktionen ausführen
    END_ROUND = 'end_round'          // Effekte/DoTs berechnen
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
    skill1: number; // Runden bis verfügbar
    skill2: number;
    skill3: number;
    interrupt: number;
    exclusiveSkillCooldown?: number; // Globaler Cooldown für exklusive Skills in Sekunden
    exclusiveSkillLastUsed?: number; // Timestamp des letzten exklusiven Skills
}

export interface BaseAction {
    type: 'attack' | 'block' | 'dodge';
    name: string;
}

export interface Skill {
    id: string | number;
    name: string;
    description?: string;
    icon?: string; // Skill icon image URL from admin panel
    manaCost: number;
    staminaCost?: number;
    cooldown: number; // in Runden (für normale Skills) oder Sekunden (für exklusive Skills)
    effect?: SkillEffect;
    roles?: string[]; // Rollen die diesen Skill nutzen können
    requiresAwakening?: boolean; // Skill erst nach Erwachen verfügbar
    moduleIndex?: number; // 0 = Modul 1, 1 = Modul 2, 2 = Modul 3
    requiresSpecialization?: RoleSpecialization; // Nur für Spezialisierungs-exklusive Skills
    isExclusive?: boolean; // Markiert exklusive Skills für Cooldown-System
    roleType?: 'tank' | 'dps' | 'support'; // Für rollenspezifische Mechaniken
}

export interface SkillEffect {
    type: 'damage' | 'heal' | 'buff' | 'debuff' | 'dot' | 'stun';
    value: number;
    statusEffect?: StatusEffectType;
    duration?: number; // für DoTs/Buffs in Runden
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

/**
 * Skill-System Konstanten
 */
export const SKILL_SYSTEM_CONSTANTS = {
    // Phase 1: Vor Erwachen (Level 1-9)
    PRE_AWAKENING_LEVEL: 10,
    
    // Phase 2: Nach Erwachen (Level 10+)
    FOREIGN_SKILL_EFFECT_MALUS: 0.30,    // -30% Effekt
    FOREIGN_SKILL_COST_INCREASE: 0.20,   // +20% Kosten
    FOREIGN_SKILL_COOLDOWN_INCREASE: 0.15 // +15% Cooldown
} as const;

/**
 * Exklusive Skills: Rang-basierte Cooldowns (in Sekunden)
 */
export const EXCLUSIVE_SKILL_COOLDOWNS: Record<GateRank, number> = {
    E: 0, D: 0, C: 0, // Keine exklusiven Skills
    B: 120,  // 2 Minuten
    A: 100,
    S: 80,
    SS: 70,
    SSS: 60  // 1 Minute
};

/**
 * Exklusive Skills: Rang-basierte Kosten (% der max Ressource)
 * Rollenfremde Nutzung: +20% Kosten
 */
export const EXCLUSIVE_SKILL_COSTS: Record<GateRank, { min: number; max: number }> = {
    E: { min: 0, max: 0 }, D: { min: 0, max: 0 }, C: { min: 0, max: 0 },
    B: { min: 0.35, max: 0.40 },    // 35-40%
    A: { min: 0.30, max: 0.35 },    // 30-35%
    S: { min: 0.25, max: 0.30 },    // 25-30%
    SS: { min: 0.20, max: 0.25 },   // 20-25%
    SSS: { min: 0.20, max: 0.20 }   // 20%
};

/**
 * Rollentyp-Zuordnung für exklusive Skills
 */
export const ROLE_TYPE_MAP: Record<Role, 'tank' | 'dps' | 'support'> = {
    [Role.WAECHTER]: 'tank',
    [Role.ASSASSINE]: 'dps',
    [Role.MAGIER]: 'dps',
    [Role.HEILER]: 'support',
    [Role.BESCHWOERER]: 'dps',
    [Role.BERSERKER]: 'dps',
    [Role.FLUCHWIRKER]: 'dps',
    [Role.HUNTER]: 'dps'
};

/**
 * Berechnet exklusive Skill-Kosten basierend auf Rang und Rolle
 * @param hunterRank Hunter-Rang des Spielers
 * @param playerRole Rolle des Spielers
 * @param skillRoles Rollen des Skills
 * @param maxResource Max Mana/Stamina
 * @returns Kosten in Ressourcenpunkten
 */
export function calculateExclusiveSkillCost(
    hunterRank: GateRank,
    playerRole: Role,
    skillRoles: string[] | undefined,
    maxResource: number
): number {
    const costRange = EXCLUSIVE_SKILL_COSTS[hunterRank];
    if (!costRange || costRange.max === 0) return 0;
    
    // Basis-Kosten: Durchschnitt der Range
    let baseCost = (costRange.min + costRange.max) / 2;
    
    // Rollenfremde Nutzung: +20% Kosten
    const isNativeRole = skillRoles && skillRoles.includes(playerRole);
    if (!isNativeRole) {
        baseCost += SKILL_SYSTEM_CONSTANTS.FOREIGN_SKILL_COST_INCREASE;
    }
    
    return Math.floor(maxResource * baseCost);
}

/**
 * Gibt den Cooldown für exklusive Skills basierend auf Rang zurück
 * @param hunterRank Hunter-Rang des Spielers
 * @returns Cooldown in Sekunden
 */
export function getExclusiveSkillCooldown(hunterRank: GateRank): number {
    return EXCLUSIVE_SKILL_COOLDOWNS[hunterRank] || 0;
}

/**
 * Prüft ob ein exklusiver Skill gerade verfügbar ist
 * @param lastUsedTimestamp Timestamp des letzten exklusiven Skills
 * @param hunterRank Hunter-Rang des Spielers
 * @returns true wenn verfügbar
 */
export function isExclusiveSkillAvailable(
    lastUsedTimestamp: number | undefined,
    hunterRank: GateRank
): boolean {
    if (!lastUsedTimestamp) return true;
    
    const cooldown = getExclusiveSkillCooldown(hunterRank);
    if (cooldown === 0) return false; // Kein Zugriff auf exklusive Skills
    
    const elapsed = (Date.now() - lastUsedTimestamp) / 1000; // in Sekunden
    return elapsed >= cooldown;
}

/**
 * Skill-Effektivität Ergebnis
 */
export interface SkillEffectiveness {
    effectMultiplier: number;   // 1.0 = 100%, 0.7 = 70%
    costMultiplier: number;     // 1.0 = normal, 1.2 = +20%
    cooldownMultiplier: number; // 1.0 = normal, 1.15 = +15%
    isForeignSkill: boolean;
}

export function calculateSkillEffectiveness(
    playerRole: Role,
    skillRoles: string[] | undefined,
    isAwakened: boolean,
    playerRank?: GateRank
): SkillEffectiveness {
    // Kein Rollen-Array = Universal-Skill (z.B. Hunter-Skills)
    if (!skillRoles || skillRoles.length === 0) {
        return {
            effectMultiplier: 1.0,
            costMultiplier: 1.0,
            cooldownMultiplier: 1.0,
            isForeignSkill: false
        };
    }
    
    const isOwnRole = skillRoles.includes(playerRole);
    
    // Phase 1: Vor Erwachen - nur eigene Skills
    if (!isAwakened) {
        return {
            effectMultiplier: isOwnRole ? 1.0 : 0,  // Fremde Skills nicht verfügbar
            costMultiplier: 1.0,
            cooldownMultiplier: 1.0,
            isForeignSkill: !isOwnRole
        };
    }
    
    // Phase 2: Nach Erwachen - alle Skills, aber mit Rang-basiertem Malus
    if (isOwnRole) {
        // Eigene Rolle: Volle Effektivität
        return {
            effectMultiplier: 1.0,
            costMultiplier: 1.0,
            cooldownMultiplier: 1.0,
            isForeignSkill: false
        };
    } else {
        // Fremde Rolle: Rang-basierte Effektivität
        let effectMalus: number = SKILL_SYSTEM_CONSTANTS.FOREIGN_SKILL_EFFECT_MALUS; // Default 30%
        let costIncrease: number = SKILL_SYSTEM_CONSTANTS.FOREIGN_SKILL_COST_INCREASE; // Default 20%
        let cooldownIncrease: number = SKILL_SYSTEM_CONSTANTS.FOREIGN_SKILL_COOLDOWN_INCREASE; // Default 15%
        
        // SSS-Rang: KEIN Malus (Systembeherrschung)
        if (playerRank === 'SSS') {
            effectMalus = 0;
            costIncrease = 0;
            cooldownIncrease = 0;
        }
        // Rang-basierte Malus-Reduktion
        else if (playerRank) {
            effectMalus = getForeignSkillMalus(playerRank, isAwakened);
            // Kosten und Cooldown proportional skalieren
            const malusRatio = effectMalus / 0.3; // 0.3 = D-Rang Basis
            costIncrease = SKILL_SYSTEM_CONSTANTS.FOREIGN_SKILL_COST_INCREASE * malusRatio;
            cooldownIncrease = SKILL_SYSTEM_CONSTANTS.FOREIGN_SKILL_COOLDOWN_INCREASE * malusRatio;
        }
        
        return {
            effectMultiplier: 1.0 - effectMalus,
            costMultiplier: 1.0 + costIncrease,
            cooldownMultiplier: 1.0 + cooldownIncrease,
            isForeignSkill: true
        };
    }
}

/**
 * ========================================
 * HUNTER-RANG PROGRESSIONSSYSTEM
 * ========================================
 */

export enum RoleSpecialization {
    // Wächter
    WAECHTER_FORTRESS = 'waechter_fortress',           // Standhaftigkeit-Fokus
    WAECHTER_PROTECTOR = 'waechter_protector',         // Schutzwall-Fokus
    WAECHTER_AVENGER = 'waechter_avenger',             // Vergeltung-Fokus
    
    // Assassine
    ASSASSINE_SHADOW = 'assassine_shadow',             // Schatten-Fokus
    ASSASSINE_BLADE = 'assassine_blade',               // Klingen-Fokus
    ASSASSINE_POISON = 'assassine_poison',             // Gift-Fokus
    
    // Magier
    MAGIER_PYRO = 'magier_pyro',                       // Feuer-Fokus
    MAGIER_FROST = 'magier_frost',                     // Eis-Fokus
    MAGIER_STORM = 'magier_storm',                     // Sturm-Fokus (Blitz)
    
    // Heiler
    HEILER_PRIEST = 'heiler_priest',                   // Heilung-Fokus
    HEILER_GUARDIAN = 'heiler_guardian',               // Schutz-Fokus
    HEILER_SAGE = 'heiler_sage',                       // Weisheit-Fokus
    
    // Beschwörer
    BESCHWOERER_SUMMONER = 'beschwoerer_summoner',     // Beschwörung-Fokus
    BESCHWOERER_BEASTMASTER = 'beschwoerer_beastmaster', // Beherrschung-Fokus
    BESCHWOERER_SWARM = 'beschwoerer_swarm',           // Schwarm-Fokus
    
    // Berserker
    BERSERKER_BLOOD = 'berserker_blood',               // Blut-Fokus
    BERSERKER_TITAN = 'berserker_titan',               // Titan-Fokus
    BERSERKER_REAPER = 'berserker_reaper',             // Sensenmann-Fokus
    
    // Fluchwirker
    FLUCHWIRKER_CORRUPTION = 'fluchwirker_corruption', // Verderben-Fokus
    FLUCHWIRKER_NECRO = 'fluchwirker_necro',           // Nekromantie-Fokus
    FLUCHWIRKER_DOOM = 'fluchwirker_doom',             // Untergang-Fokus
}

/**
 * Hunter-Rang Freischaltungen und Eigenschaften
 */
export interface HunterRankFeatures {
    rank: GateRank;
    minLevel: number;                    // Mindestlevel für diesen Rang
    modulesUnlocked: number;             // Anzahl freigeschalteter Module (1-3)
    allowsSpecialization: boolean;       // Spezialisierung möglich (ab B-Rang)
    specializationLevel: number;         // 0=keine, 1=erste, 2=zweite, 3=Meisterschaft
    skillSlots: number;                  // Aktive Skill-Slots
    affinityCap: number;                 // Max Affinitäts-Punkte
    passiveBonus: number;                // Passive Stat-Bonus (Multiplikator)
    foreignSkillMalus: number;           // Malus für fremde Skills (0.3 = 30% Malus)
    features: string[];                  // Feature-Beschreibungen
}

export const HUNTER_RANK_SYSTEM: Record<GateRank, HunterRankFeatures> = {
    'E': {
        rank: 'E',
        minLevel: 1,
        modulesUnlocked: 1,
        allowsSpecialization: false,
        specializationLevel: 0,
        skillSlots: 3,
        affinityCap: 1,
        passiveBonus: 1.0,
        foreignSkillMalus: 1.0,  // Alle Skills gesperrt vor Erwachen
        features: ['Basis-Training', '1 Modul (3 Skills)', 'Kein Gate-Zugang']
    },
    'D': {
        rank: 'D',
        minLevel: 1,
        modulesUnlocked: 2,
        allowsSpecialization: false,
        specializationLevel: 0,
        skillSlots: 4,
        affinityCap: 1,
        passiveBonus: 1.0,
        foreignSkillMalus: 0.3,
        features: ['Erwachen-Einstieg', '1-2 Module', 'Basis-Gates', 'Lernen & Überleben']
    },
    'C': {
        rank: 'C',
        minLevel: 10,
        modulesUnlocked: 3,
        allowsSpecialization: false,
        specializationLevel: 0,
        skillSlots: 5,
        affinityCap: 2,
        passiveBonus: 1.1,
        foreignSkillMalus: 0.3,
        features: ['Volle Modul-Auswahl', 'Bessere Gates', 'Erste Gruppengates', 'Grundrolle beherrschen']
    },
    'B': {
        rank: 'B',
        minLevel: 25,
        modulesUnlocked: 3,
        allowsSpecialization: true,
        specializationLevel: 1,
        skillSlots: 6,
        affinityCap: 2,
        passiveBonus: 1.2,
        foreignSkillMalus: 0.25,
        features: ['Individualisierung', 'Spezialisierung freischalten', '1 exklusiver Skill', 'Bessere Skalierung']
    },
    'A': {
        rank: 'A',
        minLevel: 40,
        modulesUnlocked: 3,
        allowsSpecialization: true,
        specializationLevel: 2,
        skillSlots: 7,
        affinityCap: 3,
        passiveBonus: 1.35,
        foreignSkillMalus: 0.2,
        features: ['Zweite Modul-Vertiefung', 'Mehr Skill-Slots', 'Stärkere Passivs', 'Elite-Gates', 'Build verfeinern']
    },
    'S': {
        rank: 'S',
        minLevel: 60,
        modulesUnlocked: 3,
        allowsSpecialization: true,
        specializationLevel: 3,
        skillSlots: 8,
        affinityCap: 3,
        passiveBonus: 1.5,
        foreignSkillMalus: 0.15,
        features: ['Meisterschaft', 'Exklusiver Bonus-Effekt', 'Sonder-Gates', 'Story-Inhalte', 'Elite-Status']
    },
    'SS': {
        rank: 'SS',
        minLevel: 80,
        modulesUnlocked: 3,
        allowsSpecialization: true,
        specializationLevel: 3,
        skillSlots: 9,
        affinityCap: 5,
        passiveBonus: 1.75,
        foreignSkillMalus: 0.1,
        features: ['System erkennt Ausnahme', 'Affinitäts-Cap erhöht', 'Sondermechaniken', 'Anomalie-Stufe']
    },
    'SSS': {
        rank: 'SSS',
        minLevel: 100,
        modulesUnlocked: 3,
        allowsSpecialization: true,
        specializationLevel: 3,
        skillSlots: 10,
        affinityCap: 5,
        passiveBonus: 2.0,
        foreignSkillMalus: 0.0,  // KEIN Malus!
        features: ['Maximale Systemfreigabe', 'Kein Rollen-Malus', 'Affinitäts-Cap 5', 'Systembeherrschung', 'Endgame']
    }
};

/**
 * Prüft ob ein Hunter-Rang freigeschaltet ist
 */
export function isRankUnlocked(currentLevel: number, targetRank: GateRank): boolean {
    const features = HUNTER_RANK_SYSTEM[targetRank];
    return currentLevel >= features.minLevel;
}

/**
 * Gibt verfügbare Module basierend auf Rang zurück
 */
export function getAvailableModules(rank: GateRank): number {
    return HUNTER_RANK_SYSTEM[rank].modulesUnlocked;
}

/**
 * Prüft ob Spezialisierung verfügbar ist
 */
export function canSpecialize(rank: GateRank): boolean {
    return HUNTER_RANK_SYSTEM[rank].allowsSpecialization;
}

/**
 * Gibt Skill-Malus basierend auf Rang zurück (SSS = kein Malus)
 */
export function getForeignSkillMalus(rank: GateRank, isAwakened: boolean): number {
    if (!isAwakened) return 1.0; // Vor Erwachen: voller Malus
    return HUNTER_RANK_SYSTEM[rank].foreignSkillMalus;
}

/**
 * Berechnet das maximale Affinität-Cap basierend auf Rang und Bonus
 * SS/SSS-Rang haben Cap 5, können aber weiter erhöht werden
 */
export function getAffinityCap(rank: GateRank, affinityCapBonus: number = 0): number {
    const baseCap = HUNTER_RANK_SYSTEM[rank].affinityCap;
    return baseCap + affinityCapBonus;
}

/**
 * Gibt Skill-Slots basierend auf Rang zurück
 */
export function getSkillSlots(rank: GateRank): number {
    return HUNTER_RANK_SYSTEM[rank].skillSlots;
}

/**
 * Gibt passiven Stat-Bonus basierend auf Rang zurück
 */
export function getPassiveBonus(rank: GateRank): number {
    return HUNTER_RANK_SYSTEM[rank].passiveBonus;
}

/**
 * Validiert ob ein Skill basierend auf Affinität-Cap ausgerüstet werden kann
 * @param equippedSkills Bereits ausgerüstete Skills
 * @param skillToEquip Der Skill, der ausgerüstet werden soll
 * @param playerRole Die Rolle des Spielers
 * @param playerRank Der Hunter-Rang des Spielers
 * @param affinityCapBonus Bonus zum Affinität-Cap (SS/SSS-Rang)
 * @returns { canEquip: boolean, reason?: string, currentAffinityUse: number, maxAffinity: number }
 */
export function canEquipSkill(
    equippedSkills: Skill[],
    skillToEquip: Skill,
    playerRole: Role,
    playerRank: GateRank,
    affinityCapBonus: number = 0
): { canEquip: boolean; reason?: string; currentAffinityUse: number; maxAffinity: number } {
    const maxAffinity = getAffinityCap(playerRank, affinityCapBonus);
    
    // Berechne aktuelle Affinität-Nutzung
    let currentAffinityUse = 0;
    
    for (const skill of equippedSkills) {
        // Eigene Rollen-Skills zählen nicht zum Affinität-Cap
        const isOwnRole = skill.roles?.includes(playerRole) || false;
        if (!isOwnRole) {
            currentAffinityUse += 1;
        }
    }
    
    // Prüfe ob der neue Skill eine fremde Rolle ist
    const isNewSkillForeignRole = !(skillToEquip.roles?.includes(playerRole) || false);
    
    if (isNewSkillForeignRole) {
        if (currentAffinityUse >= maxAffinity) {
            return {
                canEquip: false,
                reason: `Affinität-Cap erreicht (${currentAffinityUse}/${maxAffinity}). Entferne fremde Skills oder erhöhe deinen Rang.`,
                currentAffinityUse,
                maxAffinity
            };
        }
    }
    
    return {
        canEquip: true,
        currentAffinityUse: isNewSkillForeignRole ? currentAffinityUse + 1 : currentAffinityUse,
        maxAffinity
    };
}
