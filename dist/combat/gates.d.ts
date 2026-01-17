/**
 * Gate & Boss Definitions
 * Prozedural generierte Dungeons mit verschiedenen Schwierigkeitsgraden
 */
import { GateRank, EnemyDefinition } from './types.js';
export interface BossDefinition {
    name: string;
    rank: GateRank;
    type: 'boss' | 'elite-mini-boss';
    baseHp: number;
    baseDamage: number;
}
/**
 * Boss-Pool nach Rang organisiert
 */
export declare const BOSS_POOL: Record<GateRank, BossDefinition[]>;
export declare const NORMAL_ENEMIES: Record<GateRank, string[]>;
export declare const GATE_PREFIXES: Record<GateRank, string[]>;
export interface Gate {
    id: string;
    rank: GateRank;
    name: string;
    enemies: EnemyDefinition[];
    boss: BossDefinition;
    difficulty: number;
    createdAt: Date;
    completedAt?: Date;
}
export declare class GateGenerator {
    private static idCounter;
    /**
     * Generiert ein zufälliges Gate basierend auf Rang
     */
    static generateGate(rank: GateRank, playerLevel: number, seed?: number): Gate;
    /**
     * Generiert normale Gegner
     */
    private static generateNormalEnemies;
    /**
     * Generiert Elite/Mini-Bosse
     */
    private static generateMiniBosses;
    /**
     * Gibt Basis-Stats für Rang zurück
     */
    private static getBaseStatsForRank;
    /**
     * Gibt Anzahl normaler Gegner für Rang zurück
     */
    private static getEnemyCountForRank;
    /**
     * Gibt Anzahl Mini-Bosse für Rang zurück
     */
    private static getMiniBossCountForRank;
    /**
     * Berechnet Level-Multiplikator
     */
    private static getLevelMultiplier;
    /**
     * Berechnet Schwierigkeit (1-10)
     */
    private static calculateDifficulty;
    /**
     * Seeded Random für deterministische Generierung
     */
    private static seededRandom;
    /**
     * Generiert einen Pool von 60 Gates für einen Spieler
     */
    static generateGatePool(playerLevel: number, playerRank: GateRank): Gate[];
    /**
     * Mischt ein Array deterministisch
     */
    private static shuffleArray;
}
//# sourceMappingURL=gates.d.ts.map