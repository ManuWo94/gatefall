/**
 * Combat Engine: Handles tick-based combat simulation
 */
import { CombatState, CombatEvent, Skill, Role } from './types.js';
export declare class CombatEngine {
    private static readonly TICK_INTERVAL;
    private static readonly PLAYER_DAMAGE;
    private static readonly ENEMY_DAMAGE;
    private static readonly ROLE_SKILLS;
    private static readonly ROLE_STATS;
    private state;
    private tickTimer;
    private cooldownTimers;
    private onStateUpdate;
    private onCombatEvent;
    private fortifyDuration;
    private weakSpotDuration;
    private bossSpecialTimer;
    private bossSpecialTriggerTimer;
    private bossSpecialIntervalTimer;
    private shouldInterruptBossSpecial;
    constructor();
    /**
     * Create the initial combat state
     */
    private createInitialState;
    /**
     * Register callback for state updates
     */
    setOnStateUpdate(callback: (state: CombatState) => void): void;
    /**
     * Register callback for combat events
     */
    setOnCombatEvent(callback: (event: CombatEvent) => void): void;
    /**
     * Get current combat state
     */
    getState(): CombatState;
    /**
     * Start combat loop
     */
    startCombat(): void;
    /**
     * Stop combat loop
     */
    stopCombat(): void;
    /**
     * Reset combat to initial state
     */
    reset(): void;
    /**
     * Change player role
     */
    changeRole(role: Role): void;
    /**
     * Start the combat tick loop
     */
    private startTick;
    /**
     * Execute one combat tick
     */
    private executeTick;
    /**
     * Execute player auto-attack with role-specific logic
     */
    private executePlayerAutoAttack;
    /**
     * Execute enemy auto-attack
     */
    private executeEnemyAutoAttack;
    /**
     * Apply passive healing (Healer role)
     */
    private applyPassiveHealing;
    /**
     * Apply damage to a character
     */
    private applyDamage;
    /**
     * Apply damage to enemy with Weak Spot multiplier and Mage bonus
     */
    private applyDamageToEnemy;
    /**
     * Apply skill damage to enemy with Mage bonus and Weak Spot
     */
    private applySkillDamageToEnemy;
    /**
     * Handle combat end
     */
    private handleCombatEnd;
    /**
     * Emit a combat event
     */
    private emitEvent;
    /**
     * Notify state update
     */
    private notifyStateUpdate;
    /**
     * Apply status effect damage/healing
     */
    private applyStatusEffects;
    /**
     * Update status effect durations and apply/remove buffs
     */
    private updateStatusEffects;
    /**
     * Start cooldown for a skill
     */
    private startCooldown;
    /**
     * Clear all cooldown timers
     */
    private clearAllCooldowns;
    /**
     * Check if player has enough mana
     */
    private hasEnoughMana;
    /**
     * Consume mana
     */
    private consumeMana;
    /**
     * Heal player
     */
    private healPlayer;
    /**
     * Get current skills for player's role
     */
    getCurrentSkills(): Record<number, Skill>;
    /**
     * Guardian Skill 1: Shield Slam (18 damage, 8 MP, 3s CD)
     */
    private executeGuardianSkill1;
    /**
     * Guardian Skill 2: Fortify (40% damage reduction for 3 ticks, 12 MP, 8s CD)
     */
    private executeGuardianSkill2;
    /**
     * Guardian Skill 3: Taunt (log only, 5 MP, 10s CD)
     */
    private executeGuardianSkill3;
    /**
     * Assassin Skill 1: Shadow Strike (30 damage, 12 MP, 4s CD)
     */
    private executeAssassinSkill1;
    /**
     * Assassin Skill 2: Execute (45 damage, only if enemy HP ≤ 30%, 20 MP, 10s CD)
     */
    private executeAssassinSkill2;
    /**
     * Assassin Skill 3: Bleed (5 damage/tick for 4 ticks, 15 MP, 8s CD)
     */
    private executeAssassinSkill3;
    /**
     * Mage Skill 1: Arcane Blast (22 damage, 12 MP, 3s CD)
     */
    private executeMageSkill1;
    /**
     * Mage Skill 2: Mana Surge (restore 25 MP, 6s CD)
     */
    private executeMageSkill2;
    /**
     * Mage Skill 3: Burn (6 damage/tick for 3 ticks, 14 MP, 8s CD)
     */
    private executeMageSkill3;
    /**
     * Marksman Skill 1: Rapid Shot (18 damage, 6 MP, 2s CD)
     */
    private executeMarksmanSkill1;
    /**
     * Marksman Skill 2: Weak Spot (enemy takes +20% damage for 3 ticks, 10 MP, 8s CD)
     */
    private executeMarksmanSkill2;
    /**
     * Marksman Skill 3: Focus (increase auto-attack speed for 3 ticks, 12 MP, 10s CD)
     */
    private executeMarksmanSkill3;
    /**
     * Healer Skill 1: Smite (15 damage, 8 MP, 3s CD)
     */
    private executeHealerSkill1;
    /**
     * Healer Skill 2: Heal (heal 30 HP, 18 MP, 6s CD)
     */
    private executeHealerSkill2;
    /**
     * Healer Skill 3: Ward (shield absorbs 20 damage, 20 MP, 12s CD)
     */
    private executeHealerSkill3;
    /**
     * Use a skill
     */
    useSkill(skillId: number): void;
    /**
     * Start a dungeon run
     */
    startDungeon(dungeonKey: string): void;
    /**
     * Select and load a specific enemy by ID
     */
    selectDungeonEnemy(enemyId: number): void;
    /**
     * Load a specific enemy from the current dungeon
     */
    private loadEnemy;
    /**
     * Clear all boss-related timers
     */
    private clearBossTimers;
    /**
     * Start the boss special attack cycle (~10 seconds)
     */
    private startBossSpecialCycle;
    /**
     * Boss prepares special attack (2 second telegraph)
     */
    private prepareBossSpecialAttack;
    /**
     * Execute boss special attack (if not interrupted)
     */
    private triggerBossSpecialAttack;
    /**
     * Apply damage to player (considering shield and damage reduction)
     */
    private applyDamageToPlayer;
    /**
     * Check and handle boss phase transitions
     */
    private checkBossPhase;
    /**
     * Update player status effects duration
     */
    private updatePlayerStatusEffects;
    /**
     * Player interrupt ability
     */
    useInterrupt(): void;
}
//# sourceMappingURL=engine.d.ts.map