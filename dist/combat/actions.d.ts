/**
 * COMBAT ACTIONS
 * Definiert alle verfügbaren Kampf-Aktionen
 */
import { CombatAction, CombatRole } from './combat-types.js';
export declare const PLAYER_BASIC_ACTIONS: CombatAction[];
export declare const PLAYER_ADVANCED_ACTIONS: CombatAction[];
export declare const ROLE_ACTIONS: Record<CombatRole, CombatAction[]>;
export declare const ENEMY_BASIC_ACTIONS: CombatAction[];
export declare const ENEMY_ADVANCED_ACTIONS: CombatAction[];
export declare const BOSS_ACTIONS: CombatAction[];
export declare function getActionsForRole(role: CombatRole): CombatAction[];
export declare function getActionById(actionId: string): CombatAction | undefined;
//# sourceMappingURL=actions.d.ts.map