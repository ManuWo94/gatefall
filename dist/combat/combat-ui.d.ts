/**
 * COMBAT UI
 * Zeigt Telegraph-Banner, Aktionen, Status-Effekte
 */
import { NewCombatEngine } from './new-engine.js';
export declare class CombatUI {
    private engine;
    private container;
    constructor(engine: NewCombatEngine, containerId: string);
    private setupEventListeners;
    render(): void;
    private renderTelegraphs;
    private renderEnemyHPBar;
    private renderPlayerHPBar;
    private renderPlayerSprite;
    private renderSquadSprite;
    private renderEnemySprite;
    private renderStatusEffects;
    private getStatusIcon;
    private getActionIcon;
    private getActionType;
    private renderSkillBar;
    private renderCombatLog;
    private attachActionHandlers;
    private getCombatantById;
    private flashDamage;
    private flashHeal;
    private showVictoryScreen;
}
//# sourceMappingURL=combat-ui.d.ts.map