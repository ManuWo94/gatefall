/**
 * NEUE COMBAT ENGINE
 * Tick-basiertes System mit Telegraph-Mechanik
 */
import { NewCombatState, Combatant, PreparedAction } from './combat-types.js';
export declare class NewCombatEngine {
    private state;
    private tickInterval;
    private eventCallbacks;
    constructor(initialState: NewCombatState);
    start(): void;
    pause(): void;
    resume(): void;
    stop(victor: 'player' | 'enemy'): void;
    private processTick;
    private processStatusEffects;
    private applyStatusEffect;
    private updateTelegraphs;
    private updatePreparedActions;
    private updateCooldowns;
    executeAction(combatant: Combatant, preparedAction: PreparedAction): void;
    private dealDamage;
    private heal;
    private applyNewStatusEffect;
    playerUseAction(actionId: string, targetId: string): boolean;
    private processAI;
    private makeAIDecision;
    private checkVictoryConditions;
    private calculateRewards;
    private getCombatant;
    private log;
    on(event: string, callback: Function): void;
    private emit;
    getState(): NewCombatState;
}
//# sourceMappingURL=new-engine.d.ts.map