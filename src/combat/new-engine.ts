/**
 * NEUE COMBAT ENGINE
 * Tick-basiertes System mit Telegraph-Mechanik
 */

import {
    NewCombatState,
    Combatant,
    CombatAction,
    PreparedAction,
    StatusEffect,
    StatusEffectType,
    CombatLogEntry,
    Telegraph,
    ThreatLevel,
    calculateLevelInteraction
} from './combat-types.js';
import { TagMatcher } from './tag-matcher.js';
import { TelegraphSystem } from './telegraph.js';
import { getActionsForRole, ENEMY_BASIC_ACTIONS } from './actions.js';

export class NewCombatEngine {
    private state: NewCombatState;
    private tickInterval: number | null = null;
    private eventCallbacks: Map<string, Function[]> = new Map();
    
    constructor(initialState: NewCombatState) {
        this.state = initialState;
    }
    
    // ==================== COMBAT LIFECYCLE ====================
    
    start(): void {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        this.log('system', '⚔️ SYSTEM: Kampf beginnt', true);
        
        // Starte Tick-Loop
        this.tickInterval = window.setInterval(() => {
            if (!this.state.isPaused) {
                this.processTick();
            }
        }, this.state.tickDuration);
        
        this.emit('combat-start', this.state);
    }
    
    pause(): void {
        this.state.isPaused = true;
        this.emit('combat-pause', this.state);
    }
    
    resume(): void {
        this.state.isPaused = false;
        this.emit('combat-resume', this.state);
    }
    
    stop(victor: 'player' | 'enemy'): void {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
        
        this.state.isRunning = false;
        this.state.victor = victor;
        
        if (victor === 'player') {
            this.log('system', '🎉 SIEG! Kampf gewonnen!', true);
            this.calculateRewards();
        } else {
            this.log('system', '💀 NIEDERLAGE! Du wurdest besiegt.', true);
        }
        
        this.emit('combat-end', { state: this.state, victor });
    }
    
    // ==================== TICK PROCESSING ====================
    
    private processTick(): void {
        this.state.tickCount++;
        
        // 1. Status-Effekte verarbeiten
        this.processStatusEffects();
        
        // 2. Telegraphs aktualisieren
        this.updateTelegraphs();
        
        // 3. Vorbereitete Aktionen fortschreiten
        this.updatePreparedActions();
        
        // 4. Cooldowns reduzieren
        this.updateCooldowns();
        
        // 5. AI Entscheidungen (wenn keine Aktion läuft)
        this.processAI();
        
        // 6. Check Sieg/Niederlage
        this.checkVictoryConditions();
        
        this.emit('tick', this.state);
    }
    
    // ==================== STATUS EFFECTS ====================
    
    private processStatusEffects(): void {
        const allCombatants = [this.state.player, ...this.state.enemies, ...this.state.squadMembers];
        
        for (const combatant of allCombatants) {
            const expiredEffects: StatusEffectType[] = [];
            
            for (const effect of combatant.statusEffects) {
                // Effekt anwenden
                this.applyStatusEffect(combatant, effect);
                
                // Duration reduzieren
                effect.duration--;
                
                if (effect.duration <= 0) {
                    expiredEffects.push(effect.type);
                }
            }
            
            // Abgelaufene Effekte entfernen
            combatant.statusEffects = combatant.statusEffects.filter(
                e => !expiredEffects.includes(e.type)
            );
            
            if (expiredEffects.length > 0) {
                this.log('status', `${combatant.name}: Effekte abgelaufen`, false);
            }
        }
    }
    
    private applyStatusEffect(combatant: Combatant, effect: StatusEffect): void {
        switch (effect.type) {
            case StatusEffectType.BLUTUNG:
            case StatusEffectType.VERBRENNUNG:
            case StatusEffectType.VERGIFTUNG:
                this.dealDamage(combatant, effect.value, 'DoT');
                break;
                
            case StatusEffectType.REGENERATION:
                this.heal(combatant, effect.value);
                break;
                
            case StatusEffectType.SCHILD:
                combatant.shield = Math.max(combatant.shield, effect.value);
                break;
        }
    }
    
    // ==================== TELEGRAPHS ====================
    
    private updateTelegraphs(): void {
        for (const telegraph of this.state.activeTelegraphs) {
            telegraph.remainingTicks--;
            
            if (telegraph.remainingTicks === 1) {
                this.log('telegraph', 
                    `⚠️ ${this.getCombatant(telegraph.sourceId)?.name || 'Gegner'} führt Aktion im nächsten Tick aus!`,
                    true
                );
            }
            
            if (telegraph.remainingTicks <= 0) {
                // Telegraph wurde ausgeführt, entfernen
                this.state.activeTelegraphs = this.state.activeTelegraphs.filter(
                    t => t.actionId !== telegraph.actionId
                );
            }
        }
    }
    
    // ==================== PREPARED ACTIONS ====================
    
    private updatePreparedActions(): void {
        const allCombatants = [this.state.player, ...this.state.enemies, ...this.state.squadMembers];
        
        for (const combatant of allCombatants) {
            if (!combatant.currentAction) continue;
            
            combatant.currentAction.remainingPreparationTicks--;
            
            if (combatant.currentAction.remainingPreparationTicks <= 0) {
                // Aktion ist fertig - ausführen!
                this.executeAction(combatant, combatant.currentAction);
                combatant.currentAction = null;
            }
        }
    }
    
    // ==================== COOLDOWNS ====================
    
    private updateCooldowns(): void {
        const allCombatants = [this.state.player, ...this.state.enemies, ...this.state.squadMembers];
        
        for (const combatant of allCombatants) {
            for (const [actionId, remaining] of combatant.actionCooldowns.entries()) {
                if (remaining > 0) {
                    combatant.actionCooldowns.set(actionId, remaining - 1);
                }
            }
        }
    }
    
    // ==================== ACTION EXECUTION ====================
    
    executeAction(combatant: Combatant, preparedAction: PreparedAction): void {
        const action = preparedAction.action;
        const target = this.getCombatant(preparedAction.targetId);
        
        if (!target) {
            this.log('action', `${combatant.name}: Ziel nicht gefunden`, false);
            return;
        }
        
        // Cooldown setzen
        combatant.actionCooldowns.set(action.id, action.cooldownTicks);
        
        // Level-Interaktion berechnen
        const interaction = calculateLevelInteraction(combatant.level, target.level);
        
        // Schaden/Heilung
        if (action.baseDamage) {
            let damage = action.baseDamage * interaction.effectModifier;
            
            // Tag-Interaktionen prüfen (falls Ziel eine defensive Aktion vorbereitet)
            if (target.currentAction) {
                const tagResult = TagMatcher.checkInteraction(
                    action.tags,
                    target.currentAction.action.tags
                );
                
                damage *= tagResult.modifier;
                
                if (tagResult.message) {
                    this.log('action', tagResult.message, true);
                }
                
                if (tagResult.isCountered) {
                    this.log('action', `${target.name} kontert ${combatant.name}!`, true);
                    return;
                }
            }
            
            this.dealDamage(target, damage, combatant.name);
        }
        
        if (action.baseHealing) {
            const healing = action.baseHealing * interaction.effectModifier;
            this.heal(target, healing);
        }
        
        // Status-Effekte
        if (action.statusEffects) {
            for (const statusApp of action.statusEffects) {
                this.applyNewStatusEffect(target, statusApp, combatant.level, interaction);
            }
        }
        
        this.log('action', `${combatant.name} nutzt ${action.name}`, false);
    }
    
    // ==================== DAMAGE & HEALING ====================
    
    private dealDamage(target: Combatant, rawDamage: number, source: string): void {
        let damage = rawDamage;
        
        // Schild absorbiert zuerst
        if (target.shield > 0) {
            const absorbed = Math.min(target.shield, damage);
            target.shield -= absorbed;
            damage -= absorbed;
            
            if (absorbed > 0) {
                this.log('damage', `Schild absorbiert ${Math.round(absorbed)} Schaden`, false);
            }
        }
        
        // Damage Reduction
        damage *= (1 - target.damageReduction);
        
        // HP reduzieren
        target.hp -= damage;
        
        this.log('damage', 
            `${target.name} erleidet ${Math.round(damage)} Schaden`,
            damage > 100
        );
        
        this.emit('damage', { target, damage, source });
    }
    
    private heal(target: Combatant, amount: number): void {
        const oldHp = target.hp;
        target.hp = Math.min(target.hp + amount, target.maxHp);
        const actualHealing = target.hp - oldHp;
        
        if (actualHealing > 0) {
            this.log('heal', `${target.name} wird um ${Math.round(actualHealing)} HP geheilt`, false);
            this.emit('heal', { target, amount: actualHealing });
        }
    }
    
    private applyNewStatusEffect(
        target: Combatant,
        statusApp: any,
        sourceLevel: number,
        interaction: any
    ): void {
        // Prüfe ob Effekt erfolgreich ist
        const roll = Math.random();
        if (roll > interaction.statusSuccessChance) {
            this.log('status', `${target.name} widersetzt sich dem Effekt!`, true);
            return;
        }
        
        // Erstelle Status-Effekt
        const effect: StatusEffect = {
            type: statusApp.type,
            duration: Math.round(statusApp.baseDuration * interaction.statusDurationModifier),
            value: statusApp.levelScaling 
                ? statusApp.baseValue * (1 + sourceLevel / 100)
                : statusApp.baseValue,
            sourceLevel,
            stackCount: 1
        };
        
        // Prüfe ob bereits vorhanden
        const existing = target.statusEffects.find(e => e.type === effect.type);
        if (existing) {
            existing.stackCount++;
            existing.duration = Math.max(existing.duration, effect.duration);
        } else {
            target.statusEffects.push(effect);
        }
        
        this.log('status', `${target.name} erhält ${effect.type}`, true);
    }
    
    // ==================== PLAYER ACTIONS ====================
    
    playerUseAction(actionId: string, targetId: string): boolean {
        const action = this.state.player.availableActions.find(a => a.id === actionId);
        
        if (!action) {
            this.log('action', 'Aktion nicht verfügbar', false);
            return false;
        }
        
        // Check Cooldown
        const cooldown = this.state.player.actionCooldowns.get(actionId) || 0;
        if (cooldown > 0) {
            this.log('action', `Aktion noch ${cooldown} Ticks auf Cooldown`, false);
            return false;
        }
        
        // Check Ressourcen
        if (action.manaCost && this.state.player.mana! < action.manaCost) {
            this.log('action', 'Nicht genug Mana', false);
            return false;
        }
        
        // Erstelle PreparedAction
        const preparedAction: PreparedAction = {
            action,
            remainingPreparationTicks: action.preparationTicks,
            targetId,
            canBeInterrupted: action.tags.some(t => 
                t === 'kanalisierung' as any || t === 'ritual' as any
            )
        };
        
        this.state.player.currentAction = preparedAction;
        
        // Wenn instant (0 ticks), sofort ausführen
        if (action.preparationTicks === 0) {
            this.executeAction(this.state.player, preparedAction);
            this.state.player.currentAction = null;
        } else {
            // Telegraph erstellen
            const telegraph = TelegraphSystem.createTelegraph(action, this.state.player.id, targetId);
            this.state.activeTelegraphs.push(telegraph);
            
            this.log('telegraph', 
                TelegraphSystem.formatTelegraph(telegraph, this.state.player.name),
                true
            );
        }
        
        // Mana abziehen
        if (action.manaCost) {
            this.state.player.mana! -= action.manaCost;
        }
        
        return true;
    }
    
    // ==================== AI ====================
    
    private processAI(): void {
        for (const enemy of this.state.enemies) {
            if (!enemy.isAI || enemy.currentAction || enemy.hp <= 0) continue;
            
            this.makeAIDecision(enemy);
        }
    }
    
    private makeAIDecision(enemy: Combatant): void {
        // Wähle zufällige Aktion
        const availableActions = enemy.availableActions.filter(action => {
            const cooldown = enemy.actionCooldowns.get(action.id) || 0;
            return cooldown === 0;
        });
        
        if (availableActions.length === 0) return;
        
        const action = availableActions[Math.floor(Math.random() * availableActions.length)];
        
        // Ziel wählen (immer Spieler für jetzt)
        const targetId = this.state.player.id;
        
        const preparedAction: PreparedAction = {
            action,
            remainingPreparationTicks: action.preparationTicks,
            targetId,
            canBeInterrupted: action.tags.some(t => 
                t === 'kanalisierung' as any || t === 'ritual' as any
            )
        };
        
        enemy.currentAction = preparedAction;
        
        if (action.preparationTicks === 0) {
            this.executeAction(enemy, preparedAction);
            enemy.currentAction = null;
        } else {
            const telegraph = TelegraphSystem.createTelegraph(action, enemy.id, targetId);
            this.state.activeTelegraphs.push(telegraph);
            
            this.log('telegraph', 
                TelegraphSystem.formatTelegraph(telegraph, enemy.name),
                true
            );
            
            // Bedrohungs-Warnung
            if (TelegraphSystem.isCritical(telegraph)) {
                this.log('system', 
                    TelegraphSystem.formatThreatWarning(telegraph.threatLevel),
                    true
                );
            }
        }
    }
    
    // ==================== VICTORY CONDITIONS ====================
    
    private checkVictoryConditions(): void {
        const playerAlive = this.state.player.hp > 0;
        const enemiesAlive = this.state.enemies.some(e => e.hp > 0);
        
        if (!playerAlive) {
            this.stop('enemy');
        } else if (!enemiesAlive) {
            this.stop('player');
        }
    }
    
    private calculateRewards(): void {
        let totalXP = 0;
        let totalGold = 0;
        
        for (const enemy of this.state.enemies) {
            totalXP += enemy.level * 50;
            totalGold += enemy.level * 100;
        }
        
        this.state.rewards = {
            xp: totalXP,
            gold: totalGold,
            items: []
        };
        
        this.log('system', `Belohnungen: ${totalXP} XP, ${totalGold} Gold`, true);
    }
    
    // ==================== HELPERS ====================
    
    private getCombatant(id: string): Combatant | undefined {
        if (this.state.player.id === id) return this.state.player;
        
        const enemy = this.state.enemies.find(e => e.id === id);
        if (enemy) return enemy;
        
        return this.state.squadMembers.find(s => s.id === id);
    }
    
    private log(type: string, message: string, important: boolean): void {
        const entry: CombatLogEntry = {
            tick: this.state.tickCount,
            type: type as any,
            source: 'system',
            message,
            isImportant: important
        };
        
        this.state.combatLog.push(entry);
        
        // Begrenze Log-Größe
        if (this.state.combatLog.length > 100) {
            this.state.combatLog.shift();
        }
        
        this.emit('log', entry);
    }
    
    // ==================== EVENTS ====================
    
    on(event: string, callback: Function): void {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event)!.push(callback);
    }
    
    private emit(event: string, data: any): void {
        const callbacks = this.eventCallbacks.get(event) || [];
        for (const callback of callbacks) {
            callback(data);
        }
    }
    
    getState(): NewCombatState {
        return this.state;
    }
}
