import { CombatState, Player, Enemy, TurnPhase, StatusEffectType, CombatEvent, CombatEventType, Skill, calculateExclusiveSkillCost, isExclusiveSkillAvailable } from './types.js';
import { BASE_ACTIONS, getSkillsForRole } from './skills.js';
import { getRankStats, calculateDamageWithRank, calculateBlockReduction, calculateDodgeChance } from './rank-stats.js';

/**
 * Rundenbasierte Combat Engine
 */

export class TurnBasedCombatEngine {
    private state: CombatState;
    private playerAction: any = null;
    private enemyAction: any = null;
    private onRoundEnd?: () => void;
    private loadedSkills: Skill[] = []; // ✨ NEU: Skills aus DB

    constructor(initialState: CombatState, onRoundEnd?: () => void) {
        this.state = initialState;
        this.onRoundEnd = onRoundEnd;
    }

    /**
     * ✨ NEU: Setze Skills aus der Datenbank
     */
    public setSkills(skills: Skill[]): void {
        this.loadedSkills = skills;
        console.log('📚 Skills loaded into engine:', skills.length, 'skills');
        console.log('📜 Skill IDs:', skills.map(s => s.id).join(', '));
    }

    /**
     * Spieler wählt Aktion (Grundaktion oder Skill)
     */
    selectPlayerAction(action: 'attack' | 'block' | 'dodge' | string) {
        console.log('🎯 selectPlayerAction called:', {
            action,
            currentPhase: this.state.turnPhase,
            requiredPhase: TurnPhase.PLAYER_TURN
        });
        
        if (this.state.turnPhase !== TurnPhase.PLAYER_TURN) {
            console.warn('⚠️ Wrong turn phase! Forcing PLAYER_TURN...');
            this.state.turnPhase = TurnPhase.PLAYER_TURN; // FIX: Force player turn
        }

        // Basis-Aktionen
        if (action === 'attack' || action === 'block' || action === 'dodge') {
            this.playerAction = { type: 'base', action };
            console.log('✅ Base action set:', this.playerAction);
        } else {
            // Skill
            // ✨ Zuerst in geladenen DB-Skills suchen, dann in statischen Skills
            let skills = this.loadedSkills.length > 0 ? this.loadedSkills : getSkillsForRole(this.state.player.role);
            console.log('🔍 Looking for skill:', action, 'in', skills.length, 'skills (DB skills:', this.loadedSkills.length, ')');
            console.log('📜 Available skill IDs:', skills.map(s => s.id).join(', '));
            const skill = skills.find(s => s.id === action);
            
            if (!skill) {
                console.error('❌ Skill not found:', action);
                return;
            }
            console.log('✅ Skill found:', skill.name);
            
            // Exklusive Skills: Berechne dynamische Kosten
            let manaCost = skill.manaCost;
            let staminaCost = skill.staminaCost || 0;
            
            if (skill.isExclusive) {
                // Prüfe ob exklusiver Skill verfügbar ist (globaler Cooldown)
                const isAvailable = isExclusiveSkillAvailable(
                    this.state.skillCooldowns.exclusiveSkillLastUsed,
                    this.state.player.hunterRank
                );
                
                if (!isAvailable) {
                    this.addLog('Exklusive Skills sind noch nicht bereit!', CombatEventType.INFO);
                    return;
                }
                
                // Berechne Kosten basierend auf Rang
                manaCost = calculateExclusiveSkillCost(
                    this.state.player.hunterRank,
                    this.state.player.role,
                    skill.roles,
                    this.state.player.maxMp
                );
                staminaCost = 0; // Exklusive Skills nutzen nur Mana
            }
            
            // Prüfe Ressourcen
            if (this.state.player.mp < manaCost) {
                this.addLog('Nicht genug Mana!', CombatEventType.INFO);
                return;
            }
            if (this.state.player.stamina < staminaCost) {
                this.addLog('Nicht genug Ausdauer!', CombatEventType.INFO);
                return;
            }
            
            // Normale Skills: Prüfe Cooldown
            if (!skill.isExclusive) {
                const cooldownKey = `skill${skills.indexOf(skill) + 1}` as keyof typeof this.state.skillCooldowns;
                const cooldown = this.state.skillCooldowns[cooldownKey];
                if (cooldown !== undefined && cooldown > 0) {
                    this.addLog(`${skill.name} ist noch nicht bereit!`, CombatEventType.INFO);
                    return;
                }
            }

            this.playerAction = { type: 'skill', skill, manaCost, staminaCost };
            console.log('✅ Skill action set:', this.playerAction);
        }

        // Wechsel zur Execute-Phase (UI führt manuell aus)
        this.state.turnPhase = TurnPhase.EXECUTE;
        console.log('✅ Action selected successfully, phase changed to EXECUTE');
    }
    
    /**
     * Führt nur Spieler-Aktion aus (für UI-gesteuerte Runden)
     */
    public executePlayerActionOnly(): void {
        this.executePlayerAction();
    }
    
    /**
     * Führt nur Gegner-Aktion aus (für UI-gesteuerte Runden)
     */
    public executeEnemyActionOnly(): void {
        // Gegner wählt Aktion
        this.selectEnemyAction();
        
        const { enemy } = this.state;
        const isStunned = enemy.statusEffects.some(e => e.type === StatusEffectType.STUNNED);
        if (!isStunned) {
            this.executeEnemyAction();
        } else {
            this.addLog(`${enemy.name} ist betäubt!`, CombatEventType.INFO);
        }
    }
    
    /**
     * Beendet Runde manuell (für UI-gesteuerte Runden)
     */
    public finishRound(): void {
        this.endRound();
    }

    /**
     * Gegner-KI wählt Aktion
     */
    private selectEnemyAction() {
        const enemy = this.state.enemy;
        const hpPercent = (enemy.hp / enemy.maxHp) * 100;

        // Entscheidungslogik basierend auf Verhalten und HP (AGGRESSIVE)
        let action: 'attack' | 'block' | 'dodge' = 'attack';

        if (enemy.behavior === 'aggressive') {
            action = Math.random() < 0.90 ? 'attack' : 'dodge';
        } else if (enemy.behavior === 'defensive') {
            if (hpPercent < 30) {
                action = Math.random() < 0.5 ? 'block' : 'dodge';
            } else {
                action = Math.random() < 0.6 ? 'attack' : 'block';
            }
        } else { // balanced
            if (hpPercent < 40) {
                action = Math.random() < 0.5 ? 'attack' : (Math.random() < 0.5 ? 'block' : 'dodge');
            } else {
                const roll = Math.random();
                action = roll < 0.75 ? 'attack' : (roll < 0.9 ? 'block' : 'dodge');
            }
        }

        this.enemyAction = { type: 'base', action };
    }

    /**
     * Führt beide Aktionen aus
     */
    private executeRound() {
        const { player, enemy } = this.state;

        // Reset Blocking-Status
        player.isBlocking = false;
        enemy.isBlocking = false;

        // 1. Spieler-Aktion ausführen
        this.executePlayerAction();

        // 2. Gegner-Aktion ausführen (wenn nicht betäubt)
        const isStunned = enemy.statusEffects.some(e => e.type === StatusEffectType.STUNNED);
        if (!isStunned) {
            this.executeEnemyAction();
        } else {
            this.addLog(`${enemy.name} ist betäubt!`, CombatEventType.INFO);
        }

        // 3. Runde beenden
        this.endRound();
    }

    private executePlayerAction() {
        const { player, enemy } = this.state;
        const action = this.playerAction;

        console.log('🎯 executePlayerAction called:', { 
            action: action?.type, 
            actionName: action?.action || action?.skill?.name,
            enemyHpBefore: enemy.hp 
        });

        if (!action) {
            console.warn('⚠️ No action selected!');
            return;
        }

        if (action.type === 'base') {
            // Basis-Aktion
            switch (action.action) {
                case 'attack': {
                    // Stamina Cost aus BASE_ACTIONS
                    const staminaCost = BASE_ACTIONS.ATTACK.staminaCost || 0;
                    if (player.stamina < staminaCost) {
                        this.addLog('⚠️ Nicht genug Ausdauer!', CombatEventType.INFO);
                        break;
                    }
                    player.stamina -= staminaCost;
                    
                    // Rang-basierter Schaden
                    const baseDamage = player.autoAttackDamage || BASE_ACTIONS.ATTACK.baseDamage;
                    const damageWithRank = calculateDamageWithRank(baseDamage, player.hunterRank);
                    const damage = this.calculateDamage(damageWithRank, player, enemy);
                    enemy.hp = Math.max(0, enemy.hp - damage);
                    this.addLog(`Du triffst ${enemy.name} für ${damage} Schaden! (${player.hunterRank})`, CombatEventType.DAMAGE);
                    break;
                }
                case 'strong-attack': {
                    // Stamina Cost aus BASE_ACTIONS (sollte in skills.ts definiert sein)
                    const staminaCost = BASE_ACTIONS.STRONG_ATTACK?.staminaCost || 0;
                    if (player.stamina < staminaCost) {
                        this.addLog('⚠️ Nicht genug Ausdauer für starken Angriff!', CombatEventType.INFO);
                        break;
                    }
                    player.stamina -= staminaCost;
                    
                    // Starker Angriff (1.5x Basisschaden) + Rang-Multiplikator
                    const baseDmg = player.autoAttackDamage || BASE_ACTIONS.ATTACK.baseDamage;
                    const strongDmg = Math.floor(baseDmg * 1.5);
                    const damageWithRank = calculateDamageWithRank(strongDmg, player.hunterRank);
                    const damage = this.calculateDamage(damageWithRank, player, enemy);
                    enemy.hp = Math.max(0, enemy.hp - damage);
                    this.addLog(`⚡ Starker Angriff! ${damage} Schaden! (${player.hunterRank})`, CombatEventType.DAMAGE);
                    break;
                }
                case 'block': {
                    player.isBlocking = true;
                    player.mp = Math.min(player.maxMp, player.mp + BASE_ACTIONS.BLOCK.manaGain);
                    const rankStats = getRankStats(player.hunterRank);
                    this.addLog(`🛡️ Du blockst! (${rankStats.blockReduction}% Reduzierung, ${player.hunterRank})`, CombatEventType.INFO);
                    break;
                }
                case 'dodge': {
                    if (player.stamina >= BASE_ACTIONS.DODGE.staminaCost) {
                        player.stamina -= BASE_ACTIONS.DODGE.staminaCost;
                        const dodgeChance = calculateDodgeChance(player.hunterRank, enemy.rank);
                        this.addLog(`💨 Ausweichen bereit! (${dodgeChance}% Chance, ${player.hunterRank})`, CombatEventType.INFO);
                    } else {
                        this.addLog('Nicht genug Ausdauer zum Ausweichen!', CombatEventType.INFO);
                    }
                    break;
                }
            }
        } else if (action.type === 'skill') {
            // Skill ausführen
            const skill: Skill = action.skill;
            const manaCost = action.manaCost || skill.manaCost;
            const staminaCost = action.staminaCost || (skill.staminaCost || 0);
            
            // Kosten abziehen
            player.mp -= manaCost;
            player.stamina -= staminaCost;

            // Effekt anwenden
            console.log('🔮 Applying skill effect for:', skill.name);
            this.applySkillEffect(skill, player, enemy, true);
            console.log('✅ Skill effect applied, enemy HP:', enemy.hp);

            // Cooldown setzen
            if (skill.isExclusive) {
                // Exklusive Skills: Setze globalen Cooldown-Timestamp
                this.state.skillCooldowns.exclusiveSkillLastUsed = Date.now();
                this.addLog(`⚡ ${skill.name} eingesetzt! Globaler Exklusiv-Cooldown aktiv.`, CombatEventType.SKILL);
            } else {
                // Normale Skills: Rundenbasierter Cooldown
                const skills = getSkillsForRole(player.role);
                const skillIndex = skills.indexOf(skill);
                const cooldownKey = `skill${skillIndex + 1}` as keyof typeof this.state.skillCooldowns;
                this.state.skillCooldowns[cooldownKey] = skill.cooldown;
                this.addLog(`Du setzt ${skill.name} ein!`, CombatEventType.SKILL);
            }
        }
    }

    private executeEnemyAction() {
        const { player, enemy } = this.state;
        const action = this.enemyAction;

        if (!action || action.type !== 'base') return;

        switch (action.action) {
            case 'attack': {
                // Prüfe ob Spieler ausweicht (rang-basiert)
                if (this.playerAction?.action === 'dodge') {
                    const dodgeChance = calculateDodgeChance(player.hunterRank, enemy.rank);
                    if (Math.random() * 100 < dodgeChance) {
                        this.addLog(`💨 Ausgewichen! (${dodgeChance}% Chance)`, CombatEventType.INFO);
                        return;
                    }
                }

                let damage = enemy.baseDamage;
                
                // Spieler blockt? (rang-basierte Reduzierung)
                if (player.isBlocking) {
                    damage = calculateBlockReduction(damage, player.hunterRank);
                    const rankStats = getRankStats(player.hunterRank);
                    this.addLog(`🛡️ Geblockt! ${rankStats.blockReduction}% reduziert → ${damage} Schaden`, CombatEventType.INFO);
                }

                // Schadensreduktion
                damage = Math.floor(damage * (1 - player.damageReduction / 100));
                
                // Schild
                if (player.shield > 0) {
                    const absorbed = Math.min(player.shield, damage);
                    player.shield -= absorbed;
                    damage -= absorbed;
                    this.addLog(`Schild absorbiert ${absorbed} Schaden!`, CombatEventType.INFO);
                }

                player.hp = Math.max(0, player.hp - damage);
                this.addLog(`${enemy.name} trifft dich für ${damage} Schaden!`, CombatEventType.DAMAGE);
                break;
            }
            case 'block': {
                enemy.isBlocking = true;
                this.addLog(`${enemy.name} blockt!`, CombatEventType.INFO);
                break;
            }
            case 'dodge': {
                this.addLog(`${enemy.name} weicht aus!`, CombatEventType.INFO);
                break;
            }
        }
    }

    private applySkillEffect(skill: Skill, caster: Player | Enemy, target: Player | Enemy, isPlayer: boolean) {
        const effect = skill.effect;
        
        console.log('⚔️ applySkillEffect called:', {
            skillName: skill.name,
            effectType: effect?.type,
            effectValue: effect?.value,
            targetName: target.name,
            targetHpBefore: target.hp
        });
        
        if (!effect) {
            console.warn('⚠️ No effect defined for skill:', skill.name);
            return;
        }

        switch (effect.type) {
            case 'damage': {
                let damage = effect.value;
                console.log('💥 Damage effect:', { baseDamage: damage, targetBlocking: target.isBlocking });
                
                if (target.isBlocking && 'hunterRank' in target) {
                    // Rang-basierte Block-Reduzierung
                    damage = calculateBlockReduction(damage, (target as Player).hunterRank);
                } else if (target.isBlocking) {
                    // Fallback für NPCs ohne Rang
                    damage = Math.floor(damage * 0.5);
                }
                
                const hpBefore = target.hp;
                target.hp = Math.max(0, target.hp - damage);
                console.log('❤️ HP changed:', { 
                    targetName: target.name,
                    before: hpBefore, 
                    after: target.hp, 
                    damage: damage,
                    actualDamage: hpBefore - target.hp
                });
                
                this.addLog(`${skill.name} verursacht ${damage} Schaden!`, CombatEventType.DAMAGE);
                
                // Status-Effekt?
                if (effect.statusEffect && effect.duration) {
                    target.statusEffects.push({
                        type: effect.statusEffect,
                        duration: effect.duration,
                        value: 0
                    });
                }
                break;
            }
            case 'heal': {
                if (isPlayer && 'maxHp' in caster) {
                    const oldHp = (caster as Player).hp;
                    (caster as Player).hp = Math.min((caster as Player).maxHp, (caster as Player).hp + effect.value);
                    const healed = (caster as Player).hp - oldHp;
                    this.addLog(`Du heilst ${healed} HP!`, CombatEventType.HEAL);
                }
                break;
            }
            case 'buff': {
                if (isPlayer && 'damageReduction' in caster) {
                    (caster as Player).damageReduction += effect.value;
                    this.addLog(`Verteidigung erhöht um ${effect.value}%!`, CombatEventType.INFO);
                }
                break;
            }
            case 'dot': {
                if (effect.statusEffect && effect.duration) {
                    target.statusEffects.push({
                        type: effect.statusEffect,
                        duration: effect.duration,
                        value: effect.value
                    });
                    this.addLog(`${target.name} leidet an ${effect.statusEffect}!`, CombatEventType.STATUS);
                }
                break;
            }
        }
    }

    private endRound() {
        const { player, enemy } = this.state;

        // Status-Effekte abarbeiten
        this.processStatusEffects(player, 'Spieler');
        this.processStatusEffects(enemy, enemy.name);

        // Cooldowns reduzieren
        this.state.skillCooldowns.skill1 = Math.max(0, this.state.skillCooldowns.skill1 - 1);
        this.state.skillCooldowns.skill2 = Math.max(0, this.state.skillCooldowns.skill2 - 1);
        this.state.skillCooldowns.skill3 = Math.max(0, this.state.skillCooldowns.skill3 - 1);

        // Stamina-Regeneration pro Runde
        const staminaRegen = 10;
        if (player.stamina < player.maxStamina) {
            player.stamina = Math.min(player.maxStamina, player.stamina + staminaRegen);
            this.addLog(`+${staminaRegen} Ausdauer regeneriert`, CombatEventType.INFO);
        }

        // Mana-Regeneration pro Runde
        const manaRegen = 5;
        if (player.mp < player.maxMp) {
            player.mp = Math.min(player.maxMp, player.mp + manaRegen);
            this.addLog(`+${manaRegen} Mana regeneriert`, CombatEventType.INFO);
        }

        // Runde erhöhen
        this.state.round++;

        // Prüfe Kampfende
        if (enemy.hp <= 0) {
            this.addLog(`${enemy.name} wurde besiegt!`, CombatEventType.VICTORY);
            this.state.isRunning = false;
            return;
        }

        if (player.hp <= 0) {
            this.addLog('Du wurdest besiegt!', CombatEventType.DEFEAT);
            this.state.isRunning = false;
            return;
        }

        // Nächste Runde
        this.state.turnPhase = TurnPhase.PLAYER_TURN;
        this.playerAction = null;
        this.enemyAction = null;
        
        // Benachrichtige UI dass neue Runde beginnt
        if (this.onRoundEnd) {
            this.onRoundEnd();
        }
    }

    private processStatusEffects(character: Player | Enemy, name: string) {
        const toRemove: number[] = [];

        character.statusEffects.forEach((effect, index) => {
            switch (effect.type) {
                case StatusEffectType.BLEED:
                case StatusEffectType.BURN:
                    character.hp = Math.max(0, character.hp - effect.value);
                    this.addLog(`${name} erleidet ${effect.value} ${effect.type}-Schaden!`, CombatEventType.DAMAGE);
                    break;
            }

            effect.duration--;
            if (effect.duration <= 0) {
                toRemove.push(index);
            }
        });

        // Entferne abgelaufene Effekte
        toRemove.reverse().forEach(i => character.statusEffects.splice(i, 1));
    }

    private calculateDamage(baseDamage: number, attacker: Player | Enemy, target: Player | Enemy): number {
        let damage = baseDamage;
        
        // Defense-Reduktion falls vorhanden
        const targetDefense = ('defense' in target) ? Number(target.defense || 0) : 0;
        if (targetDefense > 0) {
            damage -= Math.floor(targetDefense * 0.5);
        }
        
        // Mindestschaden 1
        damage = Math.max(1, damage);
        
        // Multiplikator vom Ziel (Schwachstelle)
        if ('damageMultiplier' in target) {
            damage *= target.damageMultiplier;
        }
        
        // Kritischer Treffer Chance (5%)
        if (Math.random() < 0.05) {
            damage *= 2;
            this.addLog('💥 KRITISCHER TREFFER!', CombatEventType.DAMAGE);
        }

        return Math.floor(damage);
    }

    private addLog(message: string, type: CombatEventType) {
        this.state.combatLog.push({
            type,
            message,
            timestamp: Date.now()
        });

        // Behalte nur letzte 50 Einträge
        if (this.state.combatLog.length > 50) {
            this.state.combatLog.shift();
        }
    }

    getState(): CombatState {
        return this.state;
    }
}
