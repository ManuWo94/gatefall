/**
 * UI Renderer: Updates DOM elements based on combat state
 */
import { CombatState, CombatEvent } from './combat/types.js';
export declare class UIRenderer {
    private combatLogEntries;
    private static readonly MAX_LOG_ENTRIES;
    private static readonly ROLE_SKILL_NAMES;
    /**
     * Update all UI elements based on current combat state
     */
    updateUI(state: CombatState): void;
    /**
     * Update player UI elements
     */
    private updatePlayer;
    /**
     * Update enemy UI elements
     */
    private updateEnemy;
    /**
     * Update a stat bar's width
     */
    private updateBar;
    /**
     * Update stat text display
     */
    private updateStatText;
    /**
     * Add a combat event to the log
     */
    addLogEntry(event: CombatEvent): void;
    /**
     * Render the combat log
     */
    private renderCombatLog;
    /**
     * Clear the combat log
     */
    clearLog(): void;
    /**
     * Update skill button states (cooldowns, enabled/disabled)
     */
    private updateSkillButtons;
    /**
     * Update individual skill button
     */
    private updateSkillButton;
    /**
     * Get skill name from role and skill number
     */
    private getSkillName;
    /**
     * Update interrupt button
     */
    private updateInterruptButton;
    /**
     * Update dungeon enemies list
     */
    private updateDungeonEnemiesList;
}
//# sourceMappingURL=ui.d.ts.map