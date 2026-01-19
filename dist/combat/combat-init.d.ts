/**
 * COMBAT SYSTEM INITIALIZATION
 * Entry-Point für das neue Kampfsystem
 */
import { NewCombatEngine } from './new-engine.js';
import { CombatRole } from './combat-types.js';
export declare class CombatSystem {
    private engine;
    private ui;
    /**
     * Startet einen neuen Kampf
     */
    startCombat(options: {
        playerLevel: number;
        playerRole: CombatRole;
        playerHunterRank: string;
        enemies: {
            name: string;
            level: number;
            isBoss?: boolean;
        }[];
        squadMembers?: {
            name: string;
            level: number;
            role: CombatRole;
        }[];
    }): void;
    /**
     * Stoppt den aktuellen Kampf
     */
    stopCombat(): void;
    /**
     * Pausiert den Kampf
     */
    pauseCombat(): void;
    /**
     * Setzt den Kampf fort
     */
    resumeCombat(): void;
    /**
     * Gibt die aktuelle Engine zurück (für direkten Zugriff)
     */
    getEngine(): NewCombatEngine | null;
}
export declare const combatSystem: CombatSystem;
export declare function startTestCombat(): void;
//# sourceMappingURL=combat-init.d.ts.map