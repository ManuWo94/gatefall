/**
 * Rang-basierte Kampf-Multiplikatoren
 * Hunter Rank Progression: E → D → C → B → A → S → SS → SSS
 */

export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export interface RankStats {
    damageMultiplier: number;    // Schaden-Multiplikator
    blockReduction: number;       // Block-Schadensreduzierung (%)
    dodgeChance: number;          // Basis-Ausweich-Chance (%)
}

/**
 * Rang-Stats Konfiguration
 */
export const RANK_STATS: Record<HunterRank, RankStats> = {
    'E': {
        damageMultiplier: 1.0,
        blockReduction: 30,
        dodgeChance: 40
    },
    'D': {
        damageMultiplier: 1.2,
        blockReduction: 40,
        dodgeChance: 45
    },
    'C': {
        damageMultiplier: 1.5,
        blockReduction: 50,
        dodgeChance: 50
    },
    'B': {
        damageMultiplier: 2.0,
        blockReduction: 60,
        dodgeChance: 55
    },
    'A': {
        damageMultiplier: 2.5,
        blockReduction: 70,
        dodgeChance: 60
    },
    'S': {
        damageMultiplier: 3.0,
        blockReduction: 80,
        dodgeChance: 65
    },
    'SS': {
        damageMultiplier: 3.5,
        blockReduction: 85,
        dodgeChance: 70
    },
    'SSS': {
        damageMultiplier: 4.0,
        blockReduction: 90,
        dodgeChance: 75
    }
};

/**
 * Holt Rang-Stats für einen Hunter Rank
 */
export function getRankStats(rank: string): RankStats {
    const normalizedRank = rank.toUpperCase() as HunterRank;
    return RANK_STATS[normalizedRank] || RANK_STATS['E'];
}

/**
 * Berechnet Ausweich-Chance basierend auf Rang-Unterschied
 */
export function calculateDodgeChance(playerRank: string, enemyRank?: string): number {
    const playerStats = getRankStats(playerRank);
    let baseDodge = playerStats.dodgeChance;
    
    if (!enemyRank) return baseDodge;
    
    // Rang-Unterschied berücksichtigen
    const rankOrder: HunterRank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
    const playerIndex = rankOrder.indexOf(playerRank.toUpperCase() as HunterRank);
    const enemyIndex = rankOrder.indexOf(enemyRank.toUpperCase() as HunterRank);
    
    if (playerIndex === -1 || enemyIndex === -1) return baseDodge;
    
    const rankDiff = playerIndex - enemyIndex;
    
    // +10% pro Rang höher, -10% pro Rang niedriger
    const bonus = rankDiff * 10;
    
    // Min 10%, Max 95%
    return Math.min(95, Math.max(10, baseDodge + bonus));
}

/**
 * Berechnet finalen Schaden mit Rang-Multiplikator
 */
export function calculateDamageWithRank(baseDamage: number, playerRank: string): number {
    const stats = getRankStats(playerRank);
    return Math.floor(baseDamage * stats.damageMultiplier);
}

/**
 * Berechnet Block-Reduzierung für einen Rang
 */
export function calculateBlockReduction(incomingDamage: number, playerRank: string): number {
    const stats = getRankStats(playerRank);
    const reduction = incomingDamage * (stats.blockReduction / 100);
    return Math.floor(incomingDamage - reduction);
}
