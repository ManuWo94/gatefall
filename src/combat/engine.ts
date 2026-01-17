/**
 * Combat Engine: Handles tick-based combat simulation
 */

import { CombatState, CombatEvent, CombatEventType, Player, Enemy, Skill, StatusEffect, StatusEffectType, Role, Dungeon, EnemyDefinition } from './types.js';

// Predefined dungeons
const DUNGEONS: Record<string, Dungeon> = {
    VERLASSENER_DUNGEON: {
        name: 'Verlassener Dungeon',
        gateRank: 'D',
        enemies: [
            { id: 1, name: 'Goblin', maxHp: 80, autoAttackDamage: 6 },
            { id: 2, name: 'Goblin', maxHp: 80, autoAttackDamage: 6 },
            { id: 3, name: 'Goblin-Krieger', maxHp: 110, autoAttackDamage: 8 },
            { id: 4, name: 'Goblin-Hauptmann', maxHp: 160, autoAttackDamage: 10, isBoss: true }
        ]
    }
};

export class CombatEngine {
    private static readonly TICK_INTERVAL = 350; // ms
    private static readonly PLAYER_DAMAGE = 10;
    private static readonly ENEMY_DAMAGE = 6;

    // Role-specific skill definitions
    private static readonly ROLE_SKILLS: Record<Role, Record<number, Skill>> = {
        [Role.WAECHTER]: {
            1: { id: 1, name: 'Schildschlag', manaCost: 8, cooldown: 3000 },
            2: { id: 2, name: 'Bollwerk', manaCost: 12, cooldown: 8000 },
            3: { id: 3, name: 'Provokation', manaCost: 5, cooldown: 10000 }
        },
        [Role.ASSASSINE]: {
            1: { id: 1, name: 'Schattenstoß', manaCost: 12, cooldown: 4000 },
            2: { id: 2, name: 'Hinrichten', manaCost: 20, cooldown: 10000 },
            3: { id: 3, name: 'Blutung', manaCost: 15, cooldown: 8000 }
        },
        [Role.MAGIER]: {
            1: { id: 1, name: 'Arkanschlag', manaCost: 12, cooldown: 3000 },
            2: { id: 2, name: 'Manastrom', manaCost: 0, cooldown: 6000 },
            3: { id: 3, name: 'Verbrennung', manaCost: 14, cooldown: 8000 }
        },
        [Role.SCHARFSCHUETZE]: {
            1: { id: 1, name: 'Schnellschuss', manaCost: 6, cooldown: 2000 },
            2: { id: 2, name: 'Schwachstelle', manaCost: 10, cooldown: 8000 },
            3: { id: 3, name: 'Fokus', manaCost: 12, cooldown: 10000 }
        },
        [Role.HEILER]: {
            1: { id: 1, name: 'Zerschmettern', manaCost: 8, cooldown: 3000 },
            2: { id: 2, name: 'Heilung', manaCost: 18, cooldown: 6000 },
            3: { id: 3, name: 'Schutzschild', manaCost: 20, cooldown: 12000 }
        }
    };

    // Role base stats
    private static readonly ROLE_STATS: Record<Role, { maxHp: number; maxMp: number; autoAttackDamage: number }> = {
        [Role.WAECHTER]: { maxHp: 140, maxMp: 40, autoAttackDamage: 8 },
        [Role.ASSASSINE]: { maxHp: 85, maxMp: 60, autoAttackDamage: 14 },
        [Role.MAGIER]: { maxHp: 80, maxMp: 120, autoAttackDamage: 6 },
        [Role.SCHARFSCHUETZE]: { maxHp: 95, maxMp: 55, autoAttackDamage: 10 },
        [Role.HEILER]: { maxHp: 90, maxMp: 100, autoAttackDamage: 7 }
    };

    private state: CombatState;
    private tickTimer: number | null = null;
    private cooldownTimers: Record<number | 'interrupt', number | null> = { 1: null, 2: null, 3: null, interrupt: null };
    private onStateUpdate: ((state: CombatState) => void) | null = null;
    private onCombatEvent: ((event: CombatEvent) => void) | null = null;
    
    // Player buff tracking
    private fortifyDuration: number = 0;
    private weakSpotDuration: number = 0;
    
    // Boss mechanics
    private bossSpecialTimer: number | null = null;
    private bossSpecialTriggerTimer: number | null = null;
    private bossSpecialIntervalTimer: number | null = null;
    private shouldInterruptBossSpecial: boolean = false;
    
    // Awakening callback
    private onDungeonComplete: (() => void) | null = null;

    constructor() {
        this.state = this.createInitialState();
    }

    /**
     * Create the initial combat state
     */
    private createInitialState(): CombatState {
        const role = Role.ASSASSINE;
        const stats = CombatEngine.ROLE_STATS[role];
        
        return {
            player: {
                name: 'Jäger',
                hp: stats.maxHp,
                maxHp: stats.maxHp,
                mp: stats.maxMp,
                maxMp: stats.maxMp,
                role: role,
                autoAttackDamage: stats.autoAttackDamage,
                autoAttackCount: 0,
                shield: 0,
                damageReduction: 0,
                statusEffects: []
            },
            enemy: {
                name: 'Goblin',
                hp: 80,
                maxHp: 80,
                statusEffects: [],
                damageMultiplier: 1.0,
                autoAttackDamage: 6
            },
            isRunning: false,
            tickCount: 0,
            skillCooldowns: {
                skill1: 0,
                skill2: 0,
                skill3: 0,
                interrupt: 0
            },
            bossState: {
                isFightingBoss: false,
                isEnraged: false,
                isPreparingSpecial: false,
                specialAttackDamage: 30,
                interruptCooldown: 12000
            },
            dungeonState: {
                isActive: false,
                currentDungeon: null,
                currentEnemyIndex: 0
            },
            progression: {
                level: 1,
                xp: 0,
                gold: 0
            }
        };
    }

    /**
     * Register callback for state updates
     */
    public setOnStateUpdate(callback: (state: CombatState) => void): void {
        this.onStateUpdate = callback;
    }

    /**
     * Register callback for combat events
     */
    public setOnCombatEvent(callback: (event: CombatEvent) => void): void {
        this.onCombatEvent = callback;
    }

    /**
     * Register callback for dungeon completion
     */
    public setOnDungeonComplete(callback: () => void): void {
        this.onDungeonComplete = callback;
    }

    /**
     * Get current combat state
     */
    public getState(): CombatState {
        return { ...this.state };
    }

    /**
     * Start combat loop
     */
    public startCombat(): void {
        if (this.state.isRunning) {
            return;
        }

        this.state.isRunning = true;
        this.emitEvent(CombatEventType.INFO, 'Kampf gestartet!');
        this.notifyStateUpdate();
        this.startTick();
    }

    /**
     * Stop combat loop
     */
    public stopCombat(): void {
        if (this.tickTimer !== null) {
            clearInterval(this.tickTimer);
            this.tickTimer = null;
        }
        this.clearBossTimers();
        this.state.isRunning = false;
        this.state.bossState.isFightingBoss = false;
        this.state.bossState.isPreparingSpecial = false;
        this.notifyStateUpdate();
    }

    /**
     * Reset combat to initial state
     */
    public reset(): void {
        this.stopCombat();
        this.clearAllCooldowns();
        this.clearBossTimers();
        this.state = this.createInitialState();
        this.emitEvent(CombatEventType.INFO, 'Kampf zurückgesetzt. Bereit zum Kampf...');
        this.notifyStateUpdate();
    }

    /**
     * Change player role
     */
    public changeRole(role: Role): void {
        this.stopCombat();
        this.clearAllCooldowns();
        
        const stats = CombatEngine.ROLE_STATS[role];
        this.state.player.role = role;
        this.state.player.hp = stats.maxHp;
        this.state.player.maxHp = stats.maxHp;
        this.state.player.mp = stats.maxMp;
        this.state.player.maxMp = stats.maxMp;
        this.state.player.autoAttackDamage = stats.autoAttackDamage;
        this.state.player.autoAttackCount = 0;
        this.state.player.shield = 0;
        this.state.player.damageReduction = 0;
        
        this.state.enemy.hp = this.state.enemy.maxHp;
        this.state.enemy.statusEffects = [];
        this.state.enemy.damageMultiplier = 1.0;
        
        this.state.tickCount = 0;
        this.state.skillCooldowns = { skill1: 0, skill2: 0, skill3: 0, interrupt: 0 };
        
        const roleNames: Record<Role, string> = {
            [Role.WAECHTER]: 'Wächter',
            [Role.ASSASSINE]: 'Assassine',
            [Role.MAGIER]: 'Magier',
            [Role.SCHARFSCHUETZE]: 'Scharfschütze',
            [Role.HEILER]: 'Heiler'
        };
        
        this.emitEvent(CombatEventType.INFO, `Rolle gewechselt zu ${roleNames[role]}`);
        this.notifyStateUpdate();
    }

    /**
     * Start the combat tick loop
     */
    private startTick(): void {
        this.tickTimer = window.setInterval(() => {
            this.executeTick();
        }, CombatEngine.TICK_INTERVAL);
    }

    /**
     * Execute one combat tick
     */
    private executeTick(): void {
        if (!this.state.isRunning) {
            return;
        }

        this.state.tickCount++;

        // Check boss phase
        this.checkBossPhase();

        // Apply status effects (Bleed, Burn, Stunned) and buffs
        this.applyStatusEffects();
        this.applyPassiveHealing();

        // Player attacks enemy
        this.executePlayerAutoAttack();

        // Check if enemy is defeated
        if (this.state.enemy.hp <= 0) {
            this.handleCombatEnd(true);
            return;
        }

        // Enemy attacks player
        this.executeEnemyAutoAttack();

        // Check if player is defeated
        if (this.state.player.hp <= 0) {
            this.handleCombatEnd(false);
            return;
        }

        // Update status effect durations
        this.updateStatusEffects();
        this.updatePlayerStatusEffects();

        this.notifyStateUpdate();
    }

    /**
     * Execute player auto-attack with role-specific logic
     */
    private executePlayerAutoAttack(): void {
        const player = this.state.player;
        let damage = player.autoAttackDamage;
        let isCrit = false;
        
        // Check for Stunned debuff (Benommen)
        const stunnedEffect = player.statusEffects.find(e => e.type === StatusEffectType.STUNNED);
        if (stunnedEffect) {
            damage = Math.floor(damage * 0.7); // -30% damage
        }
        
        // Assassin: 20% crit chance, +25% crit damage
        if (player.role === Role.ASSASSINE) {
            if (Math.random() < 0.20) {
                damage = Math.floor(damage * 1.25);
                isCrit = true;
            }
        }
        
        // Marksman: every 3rd attack deals double damage
        if (player.role === Role.SCHARFSCHUETZE) {
            player.autoAttackCount++;
            if (player.autoAttackCount % 3 === 0) {
                damage *= 2;
                this.emitEvent(CombatEventType.INFO, 'Perfekter Schuss!');
            }
        }
        
        this.applyDamageToEnemy(damage);
        
        if (isCrit) {
            this.emitEvent(
                CombatEventType.DAMAGE,
                `${player.name} greift ${this.state.enemy.name} an für ${damage} Schaden! KRITISCHER TREFFER!`
            );
        } else {
            this.emitEvent(
                CombatEventType.DAMAGE,
                `${player.name} greift ${this.state.enemy.name} an für ${damage} Schaden.`
            );
        }
    }

    /**
     * Execute enemy auto-attack
     */
    private executeEnemyAutoAttack(): void {
        let damage = this.state.enemy.autoAttackDamage;
        
        // Boss Phase 2: +30% damage when enraged
        if (this.state.bossState.isFightingBoss && this.state.bossState.isEnraged) {
            damage = Math.floor(damage * 1.3);
        }
        
        // Guardian: 25% damage reduction
        if (this.state.player.role === Role.WAECHTER) {
            damage = Math.floor(damage * 0.75);
        }
        
        // Apply Fortify buff damage reduction
        if (this.state.player.damageReduction > 0) {
            damage = Math.floor(damage * (1 - this.state.player.damageReduction / 100));
        }
        
        // Apply shield first
        if (this.state.player.shield > 0) {
            const shieldAbsorbed = Math.min(this.state.player.shield, damage);
            this.state.player.shield -= shieldAbsorbed;
            damage -= shieldAbsorbed;
            
            if (shieldAbsorbed > 0) {
                this.emitEvent(CombatEventType.INFO, `Schutzschild absorbiert ${shieldAbsorbed} Schaden!`);
            }
            
            if (this.state.player.shield === 0 && shieldAbsorbed > 0) {
                this.emitEvent(CombatEventType.STATUS, 'Schutzschild gebrochen!');
            }
        }
        
        if (damage > 0) {
            this.applyDamage(this.state.player, damage);
            this.emitEvent(
                CombatEventType.DAMAGE,
                `${this.state.enemy.name} greift ${this.state.player.name} an für ${damage} Schaden.`
            );
        }
    }

    /**
     * Apply passive healing (Healer role)
     */
    private applyPassiveHealing(): void {
        if (this.state.player.role === Role.HEILER) {
            const healAmount = 2;
            const oldHp = this.state.player.hp;
            this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + healAmount);
            const actualHeal = this.state.player.hp - oldHp;
            
            if (actualHeal > 0) {
                this.emitEvent(CombatEventType.HEAL, `Regeneration heilt ${actualHeal} LP.`);
            }
        }
    }

    /**
     * Apply damage to a character
     */
    private applyDamage(target: Player | Enemy, damage: number): void {
        target.hp = Math.max(0, target.hp - damage);
    }

    /**
     * Apply damage to enemy with Weak Spot multiplier and Mage bonus
     */
    private applyDamageToEnemy(baseDamage: number): void {
        let damage = baseDamage;
        
        // Apply enemy damage multiplier (Weak Spot debuff)
        damage = Math.floor(damage * this.state.enemy.damageMultiplier);
        
        this.applyDamage(this.state.enemy, damage);
    }

    /**
     * Apply skill damage to enemy with Mage bonus and Weak Spot
     */
    private applySkillDamageToEnemy(baseDamage: number): void {
        let damage = baseDamage;
        
        // Mage: +20% skill damage
        if (this.state.player.role === Role.MAGIER) {
            damage = Math.floor(damage * 1.2);
        }
        
        // Apply enemy damage multiplier (Weak Spot debuff)
        damage = Math.floor(damage * this.state.enemy.damageMultiplier);
        
        this.applyDamage(this.state.enemy, damage);
    }

    /**
     * Handle combat end
     */
    private handleCombatEnd(playerWon: boolean): void {
        this.stopCombat();

        if (playerWon) {
            this.emitEvent(CombatEventType.VICTORY, `${this.state.enemy.name} wurde besiegt.`);
            
            // Check if in dungeon mode
            if (this.state.dungeonState.isActive && this.state.dungeonState.currentDungeon) {
                const dungeon = this.state.dungeonState.currentDungeon;
                const currentIndex = this.state.dungeonState.currentEnemyIndex;
                
                // Mark enemy as defeated
                if (currentIndex >= 0 && currentIndex < dungeon.enemies.length) {
                    dungeon.enemies[currentIndex].isDefeated = true;
                    dungeon.enemies[currentIndex].currentHp = 0;
                }
                
                // Check if all enemies defeated
                const allDefeated = dungeon.enemies.every(e => e.isDefeated);
                    
                    // Trigger awakening check callback
                    if (this.onDungeonComplete) {
                        this.onDungeonComplete();
                    }
                if (allDefeated) {
                    this.state.dungeonState.isActive = false;
                    this.emitEvent(CombatEventType.VICTORY, '=== Dungeon abgeschlossen! ===');
                } else {
                    this.emitEvent(CombatEventType.INFO, 'Wähle den nächsten Gegner!');
                }
            }
        } else {
            this.emitEvent(CombatEventType.DEFEAT, `Niederlage! ${this.state.player.name} wurde besiegt...`);
            this.state.dungeonState.isActive = false;
        }

        this.notifyStateUpdate();
    }

    /**
     * Emit a combat event
     */
    private emitEvent(type: CombatEventType, message: string): void {
        if (this.onCombatEvent) {
            this.onCombatEvent({
                type,
                message,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Notify state update
     */
    private notifyStateUpdate(): void {
        if (this.onStateUpdate) {
            this.onStateUpdate(this.getState());
        }
    }

    /**
     * Apply status effect damage/healing
     */
    private applyStatusEffects(): void {
        // Enemy DOTs
        for (const effect of this.state.enemy.statusEffects) {
            if (effect.type === StatusEffectType.BLEED) {
                this.applyDamage(this.state.enemy, effect.value);
                this.emitEvent(
                    CombatEventType.STATUS,
                    `${this.state.enemy.name} erleidet ${effect.value} Blutungsschaden!`
                );
            } else if (effect.type === StatusEffectType.BURN) {
                this.applyDamage(this.state.enemy, effect.value);
                this.emitEvent(
                    CombatEventType.STATUS,
                    `${this.state.enemy.name} erleidet ${effect.value} Verbrennungsschaden!`
                );
            }
        }
    }

    /**
     * Update status effect durations and apply/remove buffs
     */
    private updateStatusEffects(): void {
        // Update enemy status effects
        const expiredEnemyEffects: StatusEffectType[] = [];
        
        this.state.enemy.statusEffects = this.state.enemy.statusEffects
            .map(effect => {
                const updated = { ...effect, duration: effect.duration - 1 };
                if (updated.duration === 0) {
                    expiredEnemyEffects.push(effect.type);
                }
                return updated;
            })
            .filter(effect => effect.duration > 0);
        
        // Handle Weak Spot expiration
        if (expiredEnemyEffects.includes(StatusEffectType.WEAK_SPOT)) {
            this.state.enemy.damageMultiplier = 1.0;
            this.emitEvent(CombatEventType.STATUS, 'Schwachstelle läuft aus.');
        }
        
        // Update player Fortify buff
        if (this.fortifyDuration > 0) {
            this.fortifyDuration--;
            if (this.fortifyDuration === 0) {
                this.state.player.damageReduction = 0;
                this.emitEvent(CombatEventType.STATUS, 'Bollwerk läuft aus.');
            }
        }
    }

    /**
     * Start cooldown for a skill
     */
    private startCooldown(skillId: number): void {
        const skills = CombatEngine.ROLE_SKILLS[this.state.player.role];
        const skill = skills[skillId];
        if (!skill) return;

        const cooldownKey = `skill${skillId}` as keyof typeof this.state.skillCooldowns;
        this.state.skillCooldowns[cooldownKey] = skill.cooldown;

        // Clear existing timer if any
        if (this.cooldownTimers[skillId] !== null) {
            clearInterval(this.cooldownTimers[skillId]!);
        }

        // Update cooldown every 100ms
        this.cooldownTimers[skillId] = window.setInterval(() => {
            this.state.skillCooldowns[cooldownKey] = Math.max(
                0,
                this.state.skillCooldowns[cooldownKey] - 100
            );

            if (this.state.skillCooldowns[cooldownKey] === 0) {
                if (this.cooldownTimers[skillId] !== null) {
                    clearInterval(this.cooldownTimers[skillId]!);
                    this.cooldownTimers[skillId] = null;
                }
            }

            this.notifyStateUpdate();
        }, 100);
    }

    /**
     * Clear all cooldown timers
     */
    private clearAllCooldowns(): void {
        for (const skillId in this.cooldownTimers) {
            if (this.cooldownTimers[skillId] !== null) {
                clearInterval(this.cooldownTimers[skillId]!);
                this.cooldownTimers[skillId] = null;
            }
        }
    }

    /**
     * Check if player has enough mana
     */
    private hasEnoughMana(manaCost: number): boolean {
        return this.state.player.mp >= manaCost;
    }

    /**
     * Consume mana
     */
    private consumeMana(amount: number): void {
        this.state.player.mp = Math.max(0, this.state.player.mp - amount);
    }

    /**
     * Heal player
     */
    private healPlayer(amount: number): void {
        this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + amount);
    }

    /**
     * Get current skills for player's role
     */
    public getCurrentSkills(): Record<number, Skill> {
        return CombatEngine.ROLE_SKILLS[this.state.player.role];
    }

    // ==================== GUARDIAN SKILLS ====================

    /**
     * Guardian Skill 1: Shield Slam (18 damage, 8 MP, 3s CD)
     */
    private executeGuardianSkill1(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.WAECHTER][1];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.applySkillDamageToEnemy(18);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name} für 18 Schaden!`
        );
        this.startCooldown(1);
        this.notifyStateUpdate();

        if (this.state.enemy.hp <= 0) {
            this.handleCombatEnd(true);
        }
    }

    /**
     * Guardian Skill 2: Fortify (40% damage reduction for 3 ticks, 12 MP, 8s CD)
     */
    private executeGuardianSkill2(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.WAECHTER][2];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.state.player.damageReduction = 40;
        this.fortifyDuration = 3;
        
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name}! Schadensreduzierung +40% für 3 Ticks.`
        );
        this.startCooldown(2);
        this.notifyStateUpdate();
    }

    /**
     * Guardian Skill 3: Taunt (log only, 5 MP, 10s CD)
     */
    private executeGuardianSkill3(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.WAECHTER][3];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name}! Der Gegner ist provoziert.`
        );
        this.startCooldown(3);
        this.notifyStateUpdate();
    }

    // ==================== ASSASSIN SKILLS ====================

    /**
     * Assassin Skill 1: Shadow Strike (30 damage, 12 MP, 4s CD)
     */
    private executeAssassinSkill1(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.ASSASSINE][1];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.applySkillDamageToEnemy(30);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name} für 30 Schaden!`
        );
        this.startCooldown(1);
        this.notifyStateUpdate();

        if (this.state.enemy.hp <= 0) {
            this.handleCombatEnd(true);
        }
    }

    /**
     * Assassin Skill 2: Execute (45 damage, only if enemy HP ≤ 30%, 20 MP, 10s CD)
     */
    private executeAssassinSkill2(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.ASSASSINE][2];
        
        const enemyHpPercent = (this.state.enemy.hp / this.state.enemy.maxHp) * 100;
        if (enemyHpPercent > 30) {
            this.emitEvent(CombatEventType.INFO, 'Gegner hat zu viel Leben für Hinrichten!');
            return;
        }
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.applySkillDamageToEnemy(45);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name} für 45 Schaden!`
        );
        this.startCooldown(2);
        this.notifyStateUpdate();

        if (this.state.enemy.hp <= 0) {
            this.handleCombatEnd(true);
        }
    }

    /**
     * Assassin Skill 3: Bleed (5 damage/tick for 4 ticks, 15 MP, 8s CD)
     */
    private executeAssassinSkill3(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.ASSASSINE][3];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        
        const existingBleed = this.state.enemy.statusEffects.find(
            e => e.type === StatusEffectType.BLEED
        );

        if (existingBleed) {
            existingBleed.duration = 4;
        } else {
            this.state.enemy.statusEffects.push({
                type: StatusEffectType.BLEED,
                duration: 4,
                value: 5
            });
        }

        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name}! ${this.state.enemy.name} blutet!`
        );
        this.startCooldown(3);
        this.notifyStateUpdate();
    }

    // ==================== MAGE SKILLS ====================

    /**
     * Mage Skill 1: Arcane Blast (22 damage, 12 MP, 3s CD)
     */
    private executeMageSkill1(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.MAGIER][1];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.applySkillDamageToEnemy(22);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name} für 22 Schaden!`
        );
        this.startCooldown(1);
        this.notifyStateUpdate();

        if (this.state.enemy.hp <= 0) {
            this.handleCombatEnd(true);
        }
    }

    /**
     * Mage Skill 2: Mana Surge (restore 25 MP, 6s CD)
     */
    private executeMageSkill2(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.MAGIER][2];
        
        const oldMp = this.state.player.mp;
        this.state.player.mp = Math.min(this.state.player.maxMp, this.state.player.mp + 25);
        const restored = this.state.player.mp - oldMp;
        
        this.emitEvent(
            CombatEventType.HEAL,
            `${this.state.player.name} nutzt ${skill.name} und stellt ${restored} Mana wieder her!`
        );
        this.startCooldown(2);
        this.notifyStateUpdate();
    }

    /**
     * Mage Skill 3: Burn (6 damage/tick for 3 ticks, 14 MP, 8s CD)
     */
    private executeMageSkill3(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.MAGIER][3];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        
        const existingBurn = this.state.enemy.statusEffects.find(
            e => e.type === StatusEffectType.BURN
        );

        if (existingBurn) {
            existingBurn.duration = 3;
        } else {
            this.state.enemy.statusEffects.push({
                type: StatusEffectType.BURN,
                duration: 3,
                value: 6
            });
        }

        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name}! ${this.state.enemy.name} brennt!`
        );
        this.startCooldown(3);
        this.notifyStateUpdate();
    }

    // ==================== MARKSMAN SKILLS ====================

    /**
     * Marksman Skill 1: Rapid Shot (18 damage, 6 MP, 2s CD)
     */
    private executeMarksmanSkill1(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.SCHARFSCHUETZE][1];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.applySkillDamageToEnemy(18);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name} für 18 Schaden!`
        );
        this.startCooldown(1);
        this.notifyStateUpdate();

        if (this.state.enemy.hp <= 0) {
            this.handleCombatEnd(true);
        }
    }

    /**
     * Marksman Skill 2: Weak Spot (enemy takes +20% damage for 3 ticks, 10 MP, 8s CD)
     */
    private executeMarksmanSkill2(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.SCHARFSCHUETZE][2];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.state.enemy.damageMultiplier = 1.2;
        
        const existingWeakSpot = this.state.enemy.statusEffects.find(
            e => e.type === StatusEffectType.WEAK_SPOT
        );

        if (existingWeakSpot) {
            existingWeakSpot.duration = 3;
        } else {
            this.state.enemy.statusEffects.push({
                type: StatusEffectType.WEAK_SPOT,
                duration: 3,
                value: 0
            });
        }

        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name}! ${this.state.enemy.name} erleidet +20% Schaden für 3 Ticks.`
        );
        this.startCooldown(2);
        this.notifyStateUpdate();
    }

    /**
     * Marksman Skill 3: Focus (increase auto-attack speed for 3 ticks, 12 MP, 10s CD)
     */
    private executeMarksmanSkill3(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.SCHARFSCHUETZE][3];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name}! Angriffstempo erhöht (nicht implementiert).`
        );
        this.startCooldown(3);
        this.notifyStateUpdate();
    }

    // ==================== HEALER SKILLS ====================

    /**
     * Healer Skill 1: Smite (15 damage, 8 MP, 3s CD)
     */
    private executeHealerSkill1(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.HEILER][1];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.applySkillDamageToEnemy(15);
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name} für 15 Schaden!`
        );
        this.startCooldown(1);
        this.notifyStateUpdate();

        if (this.state.enemy.hp <= 0) {
            this.handleCombatEnd(true);
        }
    }

    /**
     * Healer Skill 2: Heal (heal 30 HP, 18 MP, 6s CD)
     */
    private executeHealerSkill2(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.HEILER][2];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        const oldHp = this.state.player.hp;
        this.healPlayer(30);
        const actualHeal = this.state.player.hp - oldHp;
        
        this.emitEvent(
            CombatEventType.HEAL,
            `${this.state.player.name} nutzt ${skill.name} und stellt ${actualHeal} LP wieder her!`
        );
        this.startCooldown(2);
        this.notifyStateUpdate();
    }

    /**
     * Healer Skill 3: Ward (shield absorbs 20 damage, 20 MP, 12s CD)
     */
    private executeHealerSkill3(): void {
        const skill = CombatEngine.ROLE_SKILLS[Role.HEILER][3];
        
        if (!this.hasEnoughMana(skill.manaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        this.consumeMana(skill.manaCost);
        this.state.player.shield = 20;
        
        this.emitEvent(
            CombatEventType.SKILL,
            `${this.state.player.name} nutzt ${skill.name}! Schutzschild absorbiert bis zu 20 Schaden.`
        );
        this.startCooldown(3);
        this.notifyStateUpdate();
    }

    /**
     * Use a skill
     */
    public useSkill(skillId: number): void {
        const cooldownKey = `skill${skillId}` as keyof typeof this.state.skillCooldowns;
        
        // Check if skill is on cooldown
        if (this.state.skillCooldowns[cooldownKey] > 0) {
            return;
        }

        const role = this.state.player.role;
        
        // Route to role-specific skill handler
        switch (role) {
            case Role.WAECHTER:
                if (skillId === 1) this.executeGuardianSkill1();
                else if (skillId === 2) this.executeGuardianSkill2();
                else if (skillId === 3) this.executeGuardianSkill3();
                break;
            case Role.ASSASSINE:
                if (skillId === 1) this.executeAssassinSkill1();
                else if (skillId === 2) this.executeAssassinSkill2();
                else if (skillId === 3) this.executeAssassinSkill3();
                break;
            case Role.MAGIER:
                if (skillId === 1) this.executeMageSkill1();
                else if (skillId === 2) this.executeMageSkill2();
                else if (skillId === 3) this.executeMageSkill3();
                break;
            case Role.SCHARFSCHUETZE:
                if (skillId === 1) this.executeMarksmanSkill1();
                else if (skillId === 2) this.executeMarksmanSkill2();
                else if (skillId === 3) this.executeMarksmanSkill3();
                break;
            case Role.HEILER:
                if (skillId === 1) this.executeHealerSkill1();
                else if (skillId === 2) this.executeHealerSkill2();
                else if (skillId === 3) this.executeHealerSkill3();
                break;
        }
    }

    /**
     * Start a dungeon run
     */
    public startDungeon(dungeonKey: string): void {
        const dungeon = DUNGEONS[dungeonKey];
        if (!dungeon) {
            this.emitEvent(CombatEventType.INFO, 'Dungeon nicht gefunden.');
            return;
        }

        // Reset player state
        this.stopCombat();
        this.clearAllCooldowns();
        
        const stats = CombatEngine.ROLE_STATS[this.state.player.role];
        this.state.player.hp = stats.maxHp;
        this.state.player.mp = stats.maxMp;
        this.state.player.shield = 0;
        this.state.player.damageReduction = 0;
        this.state.player.autoAttackCount = 0;
        
        // Initialize dungeon state
        this.state.dungeonState.isActive = true;
        this.state.dungeonState.currentDungeon = dungeon;
        this.state.dungeonState.currentEnemyIndex = 0;
        
        this.state.tickCount = 0;
        this.state.skillCooldowns = { skill1: 0, skill2: 0, skill3: 0, interrupt: 0 };
        
        // Initialize enemy HP tracking
        dungeon.enemies.forEach(enemy => {
            enemy.currentHp = enemy.maxHp;
            enemy.isDefeated = false;
        });
        
        this.emitEvent(CombatEventType.INFO, `=== ${dungeon.name} gestartet ===`);
        this.emitEvent(CombatEventType.INFO, 'Wähle einen Gegner zum Angreifen!');
        this.notifyStateUpdate();
    }

    /**
     * Select and load a specific enemy by ID
     */
    public selectDungeonEnemy(enemyId: number): void {
        const dungeon = this.state.dungeonState.currentDungeon;
        if (!dungeon || !this.state.dungeonState.isActive) {
            return;
        }

        const enemyIndex = dungeon.enemies.findIndex(e => e.id === enemyId);
        if (enemyIndex === -1 || dungeon.enemies[enemyIndex].isDefeated) {
            return;
        }

        // Stop any running combat
        this.stopCombat();
        
        const enemyDef = dungeon.enemies[enemyIndex];
        this.state.enemy = {
            name: enemyDef.name,
            hp: enemyDef.currentHp || enemyDef.maxHp,
            maxHp: enemyDef.maxHp,
            statusEffects: [],
            damageMultiplier: 1.0,
            autoAttackDamage: enemyDef.autoAttackDamage
        };
        
        this.state.dungeonState.currentEnemyIndex = enemyIndex;
        
        // Setup boss fight if this is a boss
        this.state.bossState.isFightingBoss = !!enemyDef.isBoss;
        this.state.bossState.isEnraged = false;
        this.state.bossState.isPreparingSpecial = false;
        
        this.emitEvent(CombatEventType.INFO, `${enemyDef.name} wird angegriffen!`);
        this.notifyStateUpdate();
        
        // Start combat automatically
        setTimeout(() => {
            this.startCombat();
            
            // Start boss special attack cycle if fighting a boss
            if (this.state.bossState.isFightingBoss) {
                this.startBossSpecialCycle();
            }
        }, 300);
    }

    /**
     * Load a specific enemy from the current dungeon
     */
    private loadEnemy(index: number): void {
        const dungeon = this.state.dungeonState.currentDungeon;
        if (!dungeon || index >= dungeon.enemies.length) {
            return;
        }

        const enemyDef = dungeon.enemies[index];
        this.state.enemy = {
            name: enemyDef.name,
            hp: enemyDef.currentHp || enemyDef.maxHp,
            maxHp: enemyDef.maxHp,
            statusEffects: [],
            damageMultiplier: 1.0,
            autoAttackDamage: enemyDef.autoAttackDamage
        };
        
        this.state.dungeonState.currentEnemyIndex = index;
        
        const progress = `Gegner ${index + 1} von ${dungeon.enemies.length}`;
        this.emitEvent(CombatEventType.INFO, `${enemyDef.name} erscheint! [${progress}]`);
        this.notifyStateUpdate();
    }

    // ==================== BOSS MECHANICS ====================

    /**
     * Clear all boss-related timers
     */
    private clearBossTimers(): void {
        if (this.bossSpecialTimer !== null) {
            clearTimeout(this.bossSpecialTimer);
            this.bossSpecialTimer = null;
        }
        if (this.bossSpecialTriggerTimer !== null) {
            clearTimeout(this.bossSpecialTriggerTimer);
            this.bossSpecialTriggerTimer = null;
        }
        if (this.bossSpecialIntervalTimer !== null) {
            clearInterval(this.bossSpecialIntervalTimer);
            this.bossSpecialIntervalTimer = null;
        }
        this.shouldInterruptBossSpecial = false;
    }

    /**
     * Start the boss special attack cycle (~10 seconds)
     */
    private startBossSpecialCycle(): void {
        this.clearBossTimers();
        
        // Start cycle after initial 10 seconds
        this.bossSpecialIntervalTimer = window.setInterval(() => {
            if (this.state.bossState.isFightingBoss && this.state.isRunning) {
                this.prepareBossSpecialAttack();
            }
        }, 10000);
    }

    /**
     * Boss prepares special attack (2 second telegraph)
     */
    private prepareBossSpecialAttack(): void {
        if (!this.state.bossState.isFightingBoss || this.state.bossState.isPreparingSpecial) {
            return;
        }

        this.state.bossState.isPreparingSpecial = true;
        this.shouldInterruptBossSpecial = false;
        this.emitEvent(CombatEventType.STATUS, `${this.state.enemy.name} bereitet einen schweren Angriff vor!`);
        this.notifyStateUpdate();

        // Trigger after 2 seconds
        this.bossSpecialTriggerTimer = window.setTimeout(() => {
            this.triggerBossSpecialAttack();
        }, 2000);
    }

    /**
     * Execute boss special attack (if not interrupted)
     */
    private triggerBossSpecialAttack(): void {
        if (!this.state.bossState.isFightingBoss || !this.state.bossState.isPreparingSpecial) {
            return;
        }

        this.state.bossState.isPreparingSpecial = false;

        if (this.shouldInterruptBossSpecial) {
            this.emitEvent(CombatEventType.STATUS, 'Der Angriff wurde unterbrochen!');
            this.shouldInterruptBossSpecial = false;
            this.notifyStateUpdate();
            return;
        }

        // Deal heavy damage
        const damage = this.state.bossState.specialAttackDamage;
        this.applyDamageToPlayer(damage);
        this.emitEvent(CombatEventType.DAMAGE, `${this.state.enemy.name} führt einen schweren Angriff aus! ${damage} Schaden!`);

        // Apply Stunned (Benommen) debuff for 3 ticks
        const existingStunned = this.state.player.statusEffects.find(e => e.type === StatusEffectType.STUNNED);
        if (existingStunned) {
            existingStunned.duration = 3;
        } else {
            this.state.player.statusEffects.push({
                type: StatusEffectType.STUNNED,
                duration: 3,
                value: 0
            });
        }
        this.emitEvent(CombatEventType.STATUS, `${this.state.player.name} ist benommen! (-30% Angriff für 3 Ticks)`);

        this.notifyStateUpdate();

        // Check if player died
        if (this.state.player.hp <= 0) {
            this.handleCombatEnd(false);
        }
    }

    /**
     * Apply damage to player (considering shield and damage reduction)
     */
    private applyDamageToPlayer(baseDamage: number): void {
        let damage = baseDamage;

        // Apply Fortify buff damage reduction
        if (this.state.player.damageReduction > 0) {
            damage = Math.floor(damage * (1 - this.state.player.damageReduction / 100));
        }

        // Apply shield first
        if (this.state.player.shield > 0) {
            const shieldAbsorbed = Math.min(this.state.player.shield, damage);
            this.state.player.shield -= shieldAbsorbed;
            damage -= shieldAbsorbed;

            if (shieldAbsorbed > 0) {
                this.emitEvent(CombatEventType.INFO, `Schutzschild absorbiert ${shieldAbsorbed} Schaden!`);
            }

            if (this.state.player.shield === 0 && shieldAbsorbed > 0) {
                this.emitEvent(CombatEventType.STATUS, 'Schutzschild gebrochen!');
            }
        }

        if (damage > 0) {
            this.applyDamage(this.state.player, damage);
        }
    }

    /**
     * Check and handle boss phase transitions
     */
    private checkBossPhase(): void {
        if (!this.state.bossState.isFightingBoss) {
            return;
        }

        const hpPercent = (this.state.enemy.hp / this.state.enemy.maxHp) * 100;

        // Enter Phase 2 (Enrage) at 50% HP
        if (hpPercent <= 50 && !this.state.bossState.isEnraged) {
            this.state.bossState.isEnraged = true;
            this.emitEvent(CombatEventType.STATUS, `${this.state.enemy.name} gerät in Raserei!`);
        }
    }

    /**
     * Update player status effects duration
     */
    private updatePlayerStatusEffects(): void {
        const expiredEffects: StatusEffectType[] = [];

        this.state.player.statusEffects = this.state.player.statusEffects
            .map(effect => {
                const updated = { ...effect, duration: effect.duration - 1 };
                if (updated.duration === 0) {
                    expiredEffects.push(effect.type);
                }
                return updated;
            })
            .filter(effect => effect.duration > 0);

        // Log expired effects
        if (expiredEffects.includes(StatusEffectType.STUNNED)) {
            this.emitEvent(CombatEventType.STATUS, 'Benommen läuft aus.');
        }
    }

    /**
     * Player interrupt ability
     */
    public useInterrupt(): void {
        const interruptManaCost = 15;
        const cooldownKey = 'interrupt';

        // Check cooldown
        if (this.state.skillCooldowns[cooldownKey] > 0) {
            return;
        }

        // Check if boss is preparing special
        if (!this.state.bossState.isPreparingSpecial) {
            this.emitEvent(CombatEventType.INFO, 'Unterbrechen fehlgeschlagen – kein Angriff zum Unterbrechen.');
            return;
        }

        // Check mana
        if (!this.hasEnoughMana(interruptManaCost)) {
            this.emitEvent(CombatEventType.INFO, 'Nicht genug Mana!');
            return;
        }

        // Execute interrupt
        this.consumeMana(interruptManaCost);
        this.shouldInterruptBossSpecial = true;
        this.emitEvent(CombatEventType.SKILL, `${this.state.player.name} nutzt Unterbrechen!`);

        // Start cooldown
        this.state.skillCooldowns[cooldownKey] = this.state.bossState.interruptCooldown;

        // Clear existing timer if any
        if (this.cooldownTimers.interrupt !== null) {
            clearInterval(this.cooldownTimers.interrupt);
        }

        // Update cooldown every 100ms
        this.cooldownTimers.interrupt = window.setInterval(() => {
            this.state.skillCooldowns[cooldownKey] = Math.max(0, this.state.skillCooldowns[cooldownKey] - 100);

            if (this.state.skillCooldowns[cooldownKey] === 0) {
                if (this.cooldownTimers.interrupt !== null) {
                    clearInterval(this.cooldownTimers.interrupt);
                    this.cooldownTimers.interrupt = null;
                }
            }

            this.notifyStateUpdate();
        }, 100);

        this.notifyStateUpdate();
    }

}
