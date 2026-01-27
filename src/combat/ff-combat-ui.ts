/**
 * Final Fantasy Style Combat UI - Vollständige Version
 * Mit Skills, HP-Updates und korrekter Engine-Integration
 */

import { TurnBasedCombatEngine } from './turn-based-engine.js';
import { getSkillsForRole, BASE_ACTIONS } from './skills.js';
import { isSkillAvailableByRank } from './skill-system.js';
import { TurnPhase } from './types.js';
import { AdminStorage } from '../admin-storage.js';

export class FFCombatUI {
    private engine: TurnBasedCombatEngine;
    private container: HTMLElement;
    private isPlayerTurn: boolean = true; // Start with player turn
    private currentBattleBg: string = '';
    private selectedAction: string | null = null;
    private battleLog: HTMLElement | null = null;
    private logTimeout: any = null;
    private updateInterval: any = null;
    
    // Multi-Enemy System
    private allEnemies: any[] = [];
    private enemies: any[] = []; // Aktuelle Gegner im Kampf
    private selectedEnemyIndex: number = 0;
    private currentEnemyIndex: number = 0;
    private gateName: string = '';
    private gateRank: string = '';
    private playerConfig: any = null;
    private playerSprite: string = ''; // Character sprite from DB

    constructor(engine: TurnBasedCombatEngine, containerId: string) {
        this.engine = engine;
        const elem = document.getElementById(containerId);
        if (!elem) {
            throw new Error(`Container ${containerId} not found`);
        }
        this.container = elem;
        
        // Verstecke Placeholder sofort
        const placeholder = document.getElementById('combat-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Load background and character sprite asynchronously
        Promise.all([
            this.selectRandomBattleBg(),
            this.loadPlayerCharacterSprite()
        ]).then(() => {
            this.render();
        });
        this.startUpdateLoop();
    }
    
    private async selectRandomBattleBg(): Promise<void> {
        await this.loadRandomBattleBg();
    }

    private retryCount = 0;
    private maxRetries = 10;

    private async render(): Promise<void> {
        console.log('🎨 Render called');
        
        if (!this.engine) {
            console.error('❌ Engine not initialized');
            return;
        }
        
        const state = this.engine.getState() as any;
        if (!state || !state.player || !state.enemy) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.warn(`⚠️ State not ready yet, retry ${this.retryCount}/${this.maxRetries}...`);
                // ⚡ OPTIMIZED: Reduced retry delay from 100ms to 50ms
                setTimeout(() => this.render(), 50);
            } else {
                console.error('❌ Combat state failed to initialize after', this.maxRetries, 'retries');
            }
            return;
        }
        
        // Reset retry counter on successful render
        this.retryCount = 0;
        
        console.log('✅ Rendering combat UI with state:', {
            playerHp: state.player.hp,
            playerMaxHp: state.player.maxHp,
            enemyHp: state.enemy.hp,
            enemyMaxHp: state.enemy.maxHp
        });
        
        // Prefer loading skills from API (DB), fallback to static role skills
        const skills = await this.getDbSkillsForPlayer(state.player).catch(() => {
            const allSkills = getSkillsForRole(state.player.role);
            return allSkills.filter(skill => {
                const availability = isSkillAvailableByRank(
                    skill,
                    state.player.hunterRank,
                    state.player.specialization
                );
                return availability.available;
            });
        });
        
        // ✨ Übergebe Skills an die Engine
        this.engine.setSkills(skills);
        console.log('✅ Skills passed to engine:', skills.length);
        
        // Load attack actions from API
        const attackActions = await this.getAttackActions();
        
        this.container.innerHTML = `
            <div class="ff-combat-container">
                <div class="ff-battle-bg ${this.currentBattleBg.startsWith('background-image') ? '' : this.currentBattleBg}" style="${this.currentBattleBg.startsWith('background-image') ? this.currentBattleBg + '; background-size: cover; background-position: center;' : ''}"></div>
                
                <div class="ff-battle-stage">
                    <div class="ff-party-container">
                        ${this.renderPlayer(state.player)}
                    </div>
                    
                    <div class="ff-enemies-container">
                        ${this.renderEnemies()}
                    </div>
                </div>
                
                <div class="ff-battle-ui">
                    <!-- Kompakte Hotbar beim Player: Angriffe vertikal, Skills quadratisch -->
                    <div class="combat-hotbar-compact">
                        <button class="hotbar-toggle" title="Ultra-kompakt umschalten">▤</button>
                        <div class="attacks-column">
                            ${attackActions.map((action, index) => `
                                <div class="hotbar-slot action-slot" data-action="${action.action_id}" title="${action.name}${action.description ? ' - ' + action.description : ''}">
                                    <div class="slot-key">${index + 1}</div>
                                    ${action.icon ? 
                                        `<img class="slot-img" src="${action.icon}" alt="${action.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
<span class="slot-emoji" style="display:none;">${this.getActionIcon(action)}</span>` : 
                                        `<span class="slot-emoji">${this.getActionIcon(action)}</span>`
                                    }
                                    ${action.stamina_cost > 0 ? `<div class="slot-cost stamina">${action.stamina_cost}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <div class="skills-grid">
                            ${skills.slice(0, 9).map((skill, index) => `
                                <div class="hotbar-slot skill-slot" data-skill="${skill.id}" title="${skill.name}${skill.description ? ' - ' + skill.description : ''}">
                                    <div class="slot-key">Q${index + 1}</div>
                                    ${(skill as any).icon ? 
                                        `<img class="slot-img" src="${(skill as any).icon}" alt="${skill.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
<span class="slot-emoji" style="display:none;">${this.getSkillIcon(skill)}</span>` : 
                                        `<span class="slot-emoji">${this.getSkillIcon(skill)}</span>`
                                    }
                                    ${skill.manaCost > 0 ? `<div class="slot-cost mana">${skill.manaCost}</div>` : (skill.staminaCost || 0) > 0 ? `<div class="slot-cost stamina">${skill.staminaCost}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.attachHotbarToggle();
    }
    private renderPlayer(player: any): string {
        const hpPercent = (player.hp / player.maxHp) * 100;
        const mpPercent = (player.mp / player.maxMp) * 100;
        const staminaPercent = (player.stamina / player.maxStamina) * 100;
        
        let hpClass = '';
        if (hpPercent < 25) hpClass = 'critical';
        else if (hpPercent < 50) hpClass = 'low';

        return `
            <div class="ff-character" data-character="player">
                <div class="ff-character-sprite">
                    ${this.playerSprite ? `<img src="${this.playerSprite}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.parentElement.innerHTML='${this.getRoleEmoji(player.role)}'">` : this.getRoleEmoji(player.role)}
                </div>
                <div class="ff-character-name">${player.name}</div>
                
                <!-- HP Bar -->
                <div class="ff-character-hp-bar">
                    <div class="ff-character-hp-fill ${hpClass}" data-hp-fill="player" style="width: ${hpPercent}%"></div>
                </div>
                <div class="ff-character-hp-text" data-hp-text="player">
                    HP: ${player.hp} / ${player.maxHp}
                </div>
                
                <!-- MP Bar -->
                <div class="ff-resource-bar mp-bar">
                    <div class="ff-resource-fill mp-fill" data-mp-fill="player" style="width: ${mpPercent}%"></div>
                </div>
                <div class="ff-resource-text" data-mp-text="player">
                    MP: ${player.mp} / ${player.maxMp}
                </div>
                
                <!-- Stamina Bar -->
                <div class="ff-resource-bar stamina-bar">
                    <div class="ff-resource-fill stamina-fill" data-stamina-fill="player" style="width: ${staminaPercent}%"></div>
                </div>
                <div class="ff-resource-text" data-stamina-text="player">
                    STA: ${player.stamina} / ${player.maxStamina}
                </div>
            </div>
        `;
    }

    private renderEnemy(enemy: any, index: number = 0): string {
        const hpPercent = (enemy.hp / enemy.maxHp) * 100;
        const isSelected = index === this.selectedEnemyIndex;
        const isDead = enemy.hp <= 0 || enemy.isDead;
        const isCurrent = enemy.isCurrent || (this.allEnemies.length > 0 && index === this.currentEnemyIndex);
        const isFuture = enemy.isFuture;
        const isBoss = enemy.isBoss || false;
        
        // Zeige Sprite aus DB oder Fallback-Emoji
        const spriteHtml = enemy.sprite 
            ? `<img src="${enemy.sprite}" alt="${enemy.name}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block; margin: 0 auto;">` 
            : (isDead ? '💀' : (isBoss ? '👑' : '👹'));

        return `
            <div class="ff-enemy ${isSelected ? 'selected' : ''} ${isDead ? 'dead' : ''} ${isCurrent ? 'current-target' : ''} ${isFuture ? 'future-enemy' : ''} ${isBoss ? 'boss-enemy' : ''}" 
                 data-enemy-index="${index}" 
                 onclick="window.selectEnemy && window.selectEnemy(${index})">
                <div class="ff-enemy-sprite ${isBoss ? 'boss-sprite' : ''}">
                    ${spriteHtml}
                </div>
                <div class="ff-enemy-name">${enemy.name}${isCurrent ? ' ⚔️' : ''}${isSelected ? ' 🎯' : ''}${isBoss ? ' 👑' : ''}</div>
                <div class="ff-enemy-hp-bar">
                    <div class="ff-enemy-hp-fill" data-hp-fill="enemy-${index}" style="width: ${hpPercent}%"></div>
                </div>
                <div class="ff-enemy-hp-text" data-hp-text="enemy-${index}" style="color: #ff6666; font-size: 11px; margin-top: 5px;">
                    ${enemy.hp} / ${enemy.maxHp}
                </div>
            </div>
        `;
    }

    private renderEnemies(): string {
        // Multi-Enemy Mode: Zeige alle Gegner aus allEnemies
        if (this.allEnemies.length > 0) {
            const state = this.engine?.getState() as any;
            
            // Prüfe ob alle normalen Gegner besiegt sind
            const normalEnemies = this.allEnemies.filter(e => !e.isBoss);
            const allNormalsDead = normalEnemies.every(e => e.hp <= 0);
            
            return this.allEnemies.map((enemy, index) => {
                const isCurrent = index === this.currentEnemyIndex;
                const isFuture = index > this.currentEnemyIndex;
                const isDead = enemy.hp <= 0;
                
                // ⭐ BOSS-LOGIK: Verstecke Boss bis alle normalen Gegner tot sind
                if (enemy.isBoss && !allNormalsDead && !isDead) {
                    return ''; // Boss noch nicht sichtbar
                }
                
                let enemyData;
                
                if (isDead) {
                    // Besiegte Gegner: 0 HP, .dead Klasse
                    enemyData = {
                        ...enemy,
                        hp: 0,
                        maxHp: enemy.maxHp,
                        isDead: true
                    };
                } else {
                    // Lebende Gegner: HP aus allEnemies Array
                    // (wurde bereits durch Sync-Logik aktualisiert)
                    enemyData = {
                        ...enemy,
                        hp: enemy.hp,
                        maxHp: enemy.maxHp,
                        isCurrent: isCurrent,
                        isFuture: isFuture,
                        isBoss: enemy.isBoss // Boss-Flag weitergeben
                    };
                }
                
                return this.renderEnemy(enemyData, index);
            }).join('');
        }
        
        // Legacy: Einzelner Gegner oder enemies Array
        if (this.enemies.length === 0) {
            const state = this.engine.getState() as any;
            if (state && state.enemy) {
                return this.renderEnemy(state.enemy, 0);
            }
            return '';
        }

        // Render alle aktiven Gegner
        return this.enemies
            .map((enemy, index) => this.renderEnemy(enemy, index))
            .join('');
    }

    /**
     * Setze mehrere Gegner für den Kampf
     */
    setEnemies(enemies: any[]): void {
        this.enemies = enemies.map(e => ({...e})); // Deep copy
        this.selectedEnemyIndex = 0;
        this.render();
    }

    /**
     * Wähle einen Gegner als Ziel aus
     */
    selectEnemy(index: number): void {
        // Multi-Enemy Mode: Freie Auswahl unter allen lebenden Gegnern
        if (this.allEnemies.length > 0) {
            // Prüfe ob Gegner tot ist
            if (this.allEnemies[index].hp <= 0) {
                this.showBattleLog('⚠️ Dieser Gegner wurde bereits besiegt!');
                return;
            }
            
            // Erlaube Auswahl unter allen noch lebenden Gegnern
            this.selectedEnemyIndex = index;
            this.showBattleLog(`🎯 Ziel gewechselt: ${this.allEnemies[index].name}!`);
            this.render();
            return;
        }
        
        // Legacy: Single/Multi-Enemy ohne allEnemies - erlaubt freie Auswahl
        if (index >= 0 && index < this.enemies.length) {
            this.selectedEnemyIndex = index;
            this.updateEnemySelection();
        }
    }
    
    /**
     * Auto-Select next alive enemy when current target dies
     */
    private autoSelectNextAliveEnemy(): void {
        if (this.allEnemies.length === 0) return;
        
        // Suche nächsten lebenden Gegner
        for (let i = 0; i < this.allEnemies.length; i++) {
            if (this.allEnemies[i].hp > 0) {
                this.selectedEnemyIndex = i;
                console.log(`🎯 Auto-switched to enemy ${i}: ${this.allEnemies[i].name}`);
                this.showBattleLog(`🎯 Neues Ziel: ${this.allEnemies[i].name}!`);
                return;
            }
        }
        
        // Keine lebenden Gegner mehr gefunden
        console.log('💀 No alive enemies left');
    }

    /**
     * Update Enemy Selection UI
     */
    private updateEnemySelection(): void {
        const enemyElements = this.container.querySelectorAll('.ff-enemy');
        enemyElements.forEach((elem, index) => {
            if (index === this.selectedEnemyIndex) {
                elem.classList.add('selected');
            } else {
                elem.classList.remove('selected');
            }
        });
    }

    private renderStatusChar(player: any): string {
        return `
            <div class="ff-status-char">
                <div class="ff-status-avatar">${this.getRoleEmoji(player.role)}</div>
                <div class="ff-status-info">
                    <div class="ff-status-name">${player.name}</div>
                    <div class="ff-status-hp" data-status-hp="player">HP: ${player.hp}/${player.maxHp}</div>
                    <div class="ff-status-mp" data-status-mp="player">MP: ${player.mp}/${player.maxMp}</div>
                </div>
            </div>
        `;
    }

    private getRoleEmoji(role: string): string {
        const emojis: any = {
            'waechter': '🛡️',
            'assassine': '🗡️',
            'magier': '🔮',
            'scharfschuetze': '🏹',
            'heiler': '✨'
        };
        return emojis[role] || '⚔️';
    }
    private getSkillIcon(skill: any): string {
        const name = skill.name.toLowerCase();
        if (name.includes('feuer') || name.includes('fire')) return '🔥';
        if (name.includes('eis') || name.includes('ice')) return '❄️';
        if (name.includes('blitz') || name.includes('thunder')) return '⚡';
        if (name.includes('heil') || name.includes('heal')) return '💚';
        if (name.includes('schutz') || name.includes('shield')) return '🛡️';
        if (name.includes('gift') || name.includes('poison')) return '☠️';
        if (name.includes('schatten') || name.includes('dark')) return '🌑';
        if (name.includes('licht') || name.includes('light')) return '☀️';
        if (name.includes('wind') || name.includes('sturm')) return '🌪️';
        if (name.includes('erde') || name.includes('earth')) return '🌍';
        return '✨';
    }

    private getActionIcon(action: any): string {
        if (action.can_block) return '🛡️';
        if (action.can_dodge) return '💨';
        if (action.damage_multiplier > 1.2) return '💥';
        return '⚔️';
    }

    private getSkillRarityClass(skill: any): string {
        // Bestimme Rarität basierend auf Mana-Kosten oder anderen Eigenschaften
        if (skill.manaCost >= 50 || (skill as any).minPlayerLevel >= 50) return 'legendary';
        if (skill.manaCost >= 30 || (skill as any).minPlayerLevel >= 30) return 'epic';
        if (skill.manaCost >= 15) return 'rare';
        return 'common';
    }

    private async getDbSkillsForPlayer(player: any): Promise<any[]> {
        try {
            const response = await fetch('http://localhost:3001/api/skills?usable_by=player');
            if (response.ok) {
                const data = await response.json();
                if (data.skills && data.skills.length > 0) {
                    const mapped = data.skills
                        .filter((s: any) => (s.min_level || 1) <= (player.level || player.hunterRank || 1))
                        .map((s: any) => ({
                            id: s.id,
                            name: s.name,
                            description: s.description || '',
                            manaCost: s.mana_cost || 0,
                            staminaCost: s.stamina_cost || 0,
                            cooldown: s.cooldown || 0,
                            icon: s.icon || null,
                            skill_type: s.skill_type,
                            damage_type: s.damage_type,
                            base_value: s.base_value || 0,
                            duration: s.duration || 0,
                            status_effect: s.status_effect || null,
                            target_type: s.target_type || 'single_enemy',
                            usable_by: s.usable_by || 'both',
                            minPlayerLevel: s.min_level || 1,
                            // ✨ Erstelle effect-Objekt für die Engine
                            effect: {
                                type: s.skill_type === 'heal' ? 'heal' : 
                                      s.skill_type === 'buff' ? 'buff' :
                                      s.skill_type === 'debuff' ? 'debuff' :
                                      s.skill_type === 'dot' ? 'dot' :
                                      s.skill_type === 'stun' ? 'stun' : 'damage',
                                value: s.base_value || 50,
                                statusEffect: s.status_effect || undefined,
                                duration: s.duration || undefined
                            }
                        }));
                    console.log('✅ Loaded', mapped.length, 'skills from DB for player');
                    console.log('📋 First skill example:', mapped[0]);
                    return mapped;
                }
            }
            throw new Error('No skills from DB');
        } catch (err) {
            console.warn('⚠️ Could not load skills from API, will fallback:', err);
            throw err;
        }
    }

    private async getAttackActions(): Promise<any[]> {
        try {
            // Load from API
            const response = await fetch('http://localhost:3001/api/combat/attack-actions');
            if (response.ok) {
                const data = await response.json();
                if (data.actions && data.actions.length > 0) {
                    console.log('✅ Loaded', data.actions.length, 'attack actions from DB');
                    return data.actions;
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load attack actions from API, using fallback:', error);
        }
        
        // Fallback to defaults
        return [
            {
                action_id: 'attack',
                name: 'Angriff',
                description: 'Normaler Angriff',
                icon: null,
                damage_multiplier: 1.0,
                stamina_cost: 0,
                cooldown: 0,
                can_block: false,
                can_dodge: false
            },
            {
                action_id: 'strong-attack',
                name: 'Stark',
                description: 'Starker Angriff (150% Schaden)',
                icon: null,
                damage_multiplier: 1.5,
                stamina_cost: 20,
                cooldown: 3,
                can_block: false,
                can_dodge: false
            },
            {
                action_id: 'block',
                name: 'Block',
                description: 'Verteidigung',
                icon: null,
                damage_multiplier: 0,
                stamina_cost: 0,
                cooldown: 0,
                can_block: true,
                can_dodge: false
            },
            {
                action_id: 'dodge',
                name: 'Dodge',
                description: 'Ausweichen',
                icon: null,
                damage_multiplier: 0,
                stamina_cost: 10,
                cooldown: 2,
                can_block: false,
                can_dodge: true
            }
        ];
    }

    private attachEventListeners(): void {
        console.log('🔗 Attaching event listeners...');
        
        // Register global enemy selection function
        (window as any).selectEnemy = (index: number) => {
            this.selectEnemy(index);
        };
        
        // Attack hotbar slots
        const attackSlots = this.container.querySelectorAll('.hotbar-slot[data-action]');
        console.log(`📌 Found ${attackSlots.length} attack slots`);
        attackSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                if (!this.isPlayerTurn) {
                    this.showBattleLog('⚠️ Warte auf deinen Zug!');
                    return;
                }
                const action = slot.getAttribute('data-action');
                if (action) {
                    this.highlightSelectedCard(slot);
                    this.executeAction(action);
                }
            });
        });

        // Skill hotbar slots
        const skillSlots = this.container.querySelectorAll('.hotbar-slot[data-skill]');
        console.log(`📌 Found ${skillSlots.length} skill slots`);
        skillSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                if (!this.isPlayerTurn) {
                    this.showBattleLog('⚠️ Warte auf deinen Zug!');
                    return;
                }
                const skillId = slot.getAttribute('data-skill');
                if (skillId) {
                    this.highlightSelectedCard(slot);
                    this.executeAction(skillId);
                }
            });
        });
        
        console.log('✅ Event listeners attached');
    }

    private attachHotbarToggle(): void {
        const container = this.container.querySelector('.combat-hotbar-compact') as HTMLElement | null;
        const toggle = this.container.querySelector('.hotbar-toggle') as HTMLButtonElement | null;
        if (!container || !toggle) return;

        // Apply saved preference
        const pref = localStorage.getItem('hotbarUltraCompact');
        if (pref === 'on') {
            container.classList.add('ultra');
        }

        toggle.addEventListener('click', () => {
            const isUltra = container.classList.toggle('ultra');
            localStorage.setItem('hotbarUltraCompact', isUltra ? 'on' : 'off');
        });
    }

    private highlightSelectedCard(card: Element): void {
        // Remove highlight from all slots
        this.container.querySelectorAll('.hotbar-slot').forEach(c => c.classList.remove('selected'));
        // Add highlight to selected slot
        card.classList.add('selected');
    }

    private executeAction(action: string): void {
        console.log('🎮 executeAction called with:', action);
        
        this.isPlayerTurn = false;

        // Remove highlight from all slots
        this.container.querySelectorAll('.hotbar-slot').forEach(c => c.classList.remove('selected'));

        // ✨ Multi-Enemy: Lade den ausgewählten Gegner in den State
        if (this.allEnemies.length > 0) {
            const targetEnemy = this.allEnemies[this.selectedEnemyIndex];
            
            // Wenn ein anderer Gegner ausgewählt ist, zeige Debug-Info
            if (this.selectedEnemyIndex !== this.currentEnemyIndex) {
                console.log(`🎯 Target switched: Index ${this.selectedEnemyIndex} (${targetEnemy.name})`);
            }
            
            // Ersetze IMMER den State mit dem ausgewählten Gegner (aktualisierte HP!)
            const state = this.engine.getState() as any;
            state.enemy = {
                ...targetEnemy,
                hp: targetEnemy.hp,
                maxHp: targetEnemy.maxHp,
                name: targetEnemy.name,
                autoAttackDamage: targetEnemy.autoAttackDamage || 10,
                statusEffects: targetEnemy.statusEffects || [],
                isBlocking: targetEnemy.isBlocking || false,
                behavior: targetEnemy.behavior || 'balanced',
                damageMultiplier: targetEnemy.damageMultiplier || 1.0,
                baseDamage: targetEnemy.baseDamage || targetEnemy.autoAttackDamage || 10,
                sprite: targetEnemy.sprite
            };
        }

        const state = this.engine.getState() as any;
        const actionName = this.getActionName(action);
        
        console.log('💬 Showing battle log:', `${state.player.name} → ${actionName}!`);
        this.showBattleLog(`${state.player.name} → ${actionName}!`);

        const playerSprite = this.container.querySelector('.ff-character');
        playerSprite?.classList.add('ff-attacking');
        
        // Step 1: Select action in engine
        if (action === 'strong-attack') {
            this.engine.selectPlayerAction('attack' as any);
        } else {
            this.engine.selectPlayerAction(action as any);
        }
        
        // Step 2: Player animation + execute
        setTimeout(() => {
            playerSprite?.classList.remove('ff-attacking');
            
            const stateBefore = this.engine.getState() as any;
            const enemyHpBefore = stateBefore.enemy.hp;
            const playerMpBefore = stateBefore.player.mp;
            const playerStaminaBefore = stateBefore.player.stamina;
            
            // Execute player action
            this.engine.executePlayerActionOnly();
            
            const stateAfter = this.engine.getState() as any;
            const enemyHpAfter = stateAfter.enemy.hp;
            const playerMpAfter = stateAfter.player.mp;
            const playerStaminaAfter = stateAfter.player.stamina;
            
            const damage = enemyHpBefore - enemyHpAfter;
            const mpCost = playerMpBefore - playerMpAfter;
            const staminaCost = playerStaminaBefore - playerStaminaAfter;
            
            // ✨ Sync enemy HP zurück zu allEnemies (falls anderer Gegner angegriffen wurde)
            if (this.allEnemies.length > 0 && this.selectedEnemyIndex < this.allEnemies.length) {
                this.allEnemies[this.selectedEnemyIndex].hp = stateAfter.enemy.hp;
                console.log(`🔄 Synced HP for enemy ${this.selectedEnemyIndex}:`, this.allEnemies[this.selectedEnemyIndex].hp);
                
                // ✨ Auto-Switch: Wenn ausgewählter Gegner besiegt wurde, wechsle zum nächsten lebenden
                if (this.allEnemies[this.selectedEnemyIndex].hp <= 0) {
                    console.log(`💀 Selected enemy ${this.selectedEnemyIndex} defeated, switching target...`);
                    this.autoSelectNextAliveEnemy();
                }
            }
            // Legacy: Sync to enemies array
            else if (this.enemies.length > 0 && this.currentEnemyIndex < this.enemies.length) {
                this.enemies[this.currentEnemyIndex].hp = stateAfter.enemy.hp;
                console.log('🔄 Synced enemy HP to array:', this.currentEnemyIndex, this.enemies[this.currentEnemyIndex].hp);
            }
            
            // Show damage popup on selected enemy
            if (damage > 0) {
                this.showDamagePopup(damage, false, this.selectedEnemyIndex);
            }
            
            // Show resource cost popup on player
            if (mpCost > 0) {
                this.showResourcePopup(mpCost, 'mp');
            }
            if (staminaCost > 0) {
                this.showResourcePopup(staminaCost, 'stamina');
            }
            
            // Re-render to update HP bars
            this.render();
            
            // Step 3: Show enemy turn after delay (nur currentEnemyIndex schlägt zurück!)
            setTimeout(() => {
                this.showEnemyTurn();
            }, 150); // Wait 150ms before enemy acts
        }, 200); // Player animation duration
    }
    
    private showEnemyTurn(): void {
        // ✨ Nur der currentEnemyIndex (aktiver Gegner) schlägt zurück!
        if (this.allEnemies.length > 0 && this.currentEnemyIndex < this.allEnemies.length) {
            const currentEnemy = this.allEnemies[this.currentEnemyIndex];
            
            // Prüfe ob aktueller Gegner tot ist - dann Skip
            if (currentEnemy.hp <= 0) {
                console.log(`⏭️ Current enemy ${this.currentEnemyIndex} is dead, skipping turn`);
                this.isPlayerTurn = true;
                this.showBattleLog('⚔️ Dein Zug!');
                this.render();
                return;
            }
            
            // Lade currentEnemy in State für Gegenangriff
            const state = this.engine.getState() as any;
            state.enemy = {
                ...currentEnemy,
                hp: currentEnemy.hp,
                maxHp: currentEnemy.maxHp,
                name: currentEnemy.name,
                autoAttackDamage: currentEnemy.autoAttackDamage || 10,
                statusEffects: currentEnemy.statusEffects || [],
                isBlocking: currentEnemy.isBlocking || false,
                behavior: currentEnemy.behavior || 'balanced',
                damageMultiplier: currentEnemy.damageMultiplier || 1.0,
                baseDamage: currentEnemy.baseDamage || currentEnemy.autoAttackDamage || 10,
                sprite: currentEnemy.sprite
            };
        }
        
        const state = this.engine.getState() as any;
        if (!state || !state.enemy) return;
        
        // Show what enemy is doing
        const enemyAction = this.predictEnemyAction();
        this.showBattleLog(`${state.enemy.name} → ${enemyAction}!`);
        
        // Enemy animation - aktueller Gegner per Index
        const enemySprite = this.container.querySelector(`[data-enemy-index="${this.currentEnemyIndex}"] .ff-enemy-sprite`);
        enemySprite?.classList.add('ff-attacking');
        
        setTimeout(() => {
            enemySprite?.classList.remove('ff-attacking');
            
            const playerHpBefore = state.player.hp;
            
            // Execute enemy action
            this.engine.executeEnemyActionOnly();
            
            const stateAfter = this.engine.getState() as any;
            const playerHpAfter = stateAfter.player.hp;
            const damage = playerHpBefore - playerHpAfter;
            
            // Show damage popup on player
            if (damage > 0) {
                this.showDamagePopup(damage, true);
            }
            
            // Finish round
            this.engine.finishRound();
            
            // Check if battle ended after finishing round
            const finalState = this.engine.getState() as any;
            
            // After animations, check if battle is still running
            setTimeout(() => {
                if (!finalState.isRunning) {
                    // Battle ended - check victory or defeat
                    if (finalState.player.hp <= 0) {
                        this.showBattleLog('💀 Du wurdest besiegt!');
                        setTimeout(() => this.showDefeat(), 500);
                    } else if (finalState.enemy.hp <= 0) {
                        this.showBattleLog('🎉 Gegner besiegt!');
                        setTimeout(() => this.showVictory(), 500);
                    }
                    return;
                }
                
                // Battle continues - enable player turn for next round
                this.isPlayerTurn = true;
                this.showBattleLog('⚔️ Dein Zug!');
                this.render(); // Re-render to update UI state
            }, 150);
        }, 200);
    }
    
    private showDamagePopup(damage: number, isPlayer: boolean, enemyIndex?: number): void {
        let target: Element | null;
        
        if (isPlayer) {
            target = this.container.querySelector('.ff-character');
        } else if (enemyIndex !== undefined) {
            // Spezifischer Gegner per Index
            target = this.container.querySelector(`[data-enemy-index="${enemyIndex}"]`);
        } else {
            // Fallback: Erster Gegner
            target = this.container.querySelector('.ff-enemy');
        }
        
        if (!target) return;
        
        const popup = document.createElement('div');
        popup.className = 'damage-popup';
        popup.textContent = `-${damage}`;
        popup.style.cssText = `
            position: absolute;
            color: #ff4444;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            animation: damageFloat 1s ease-out forwards;
            z-index: 1000;
        `;
        
        target.appendChild(popup);
        
        setTimeout(() => popup.remove(), 1000);
    }
    
    private showResourcePopup(cost: number, type: 'mp' | 'stamina'): void {
        const target = this.container.querySelector('.ff-character');
        if (!target) return;
        
        const popup = document.createElement('div');
        popup.className = 'resource-popup';
        popup.textContent = type === 'mp' ? `-${cost} MP` : `-${cost} STA`;
        popup.style.cssText = `
            position: absolute;
            color: ${type === 'mp' ? '#4488ff' : '#ffaa44'};
            font-size: 16px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            animation: resourceFloat 1s ease-out forwards;
            z-index: 1000;
            top: ${type === 'mp' ? '30%' : '40%'};
            left: 50%;
            transform: translateX(-50%);
        `;
        
        target.appendChild(popup);
        
        setTimeout(() => popup.remove(), 1000);
    }
    
    private predictEnemyAction(): string {
        const state = this.engine.getState() as any;
        const enemy = state.enemy;
        const hpPercent = (enemy.hp / enemy.maxHp) * 100;
        
        // Simple prediction based on enemy behavior (matches engine logic)
        if (enemy.behavior === 'aggressive') {
            return 'Angriff';
        } else if (enemy.behavior === 'defensive') {
            if (hpPercent < 50) return 'Verteidigung';
            return 'Angriff';
        } else {
            // balanced
            if (hpPercent < 30) return 'Verteidigung';
            return 'Angriff';
        }
    }

    private getActionName(action: string): string {
        if (action === 'attack') return 'Angriff';
        if (action === 'strong-attack') return 'Starker Angriff';
        if (action === 'block') return 'Verteidigung';
        if (action === 'dodge') return 'Ausweichen';
        
        // Prefer the displayed hotbar skill name
        const skillEl = this.container.querySelector(`.hotbar-slot[data-skill="${action}"]`) as HTMLElement | null;
        if (skillEl) {
            const name = skillEl.getAttribute('data-tooltip');
            if (name) return name;
        }
        
        // Fallback to static role skills
        const state = this.engine.getState() as any;
        const allSkills = getSkillsForRole(state.player.role);
        const skills = allSkills.filter(skill => {
            const availability = isSkillAvailableByRank(
                skill,
                state.player.hunterRank,
                state.player.specialization
            );
            return availability.available;
        });
        const skill = skills.find(s => s.id === action);
        return skill ? skill.name : action;
    }

    private startUpdateLoop(): void {
        // Clear existing interval if any
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Simple update loop for HP/MP display and win/loss checks
        this.updateInterval = setInterval(() => {
            if (!this.engine) return;
            
            const state = this.engine.getState() as any;
            if (!state || !state.player || !state.enemy) return;
            
            // Check win/loss conditions
            if (state.enemy.hp <= 0) {
                console.log('💀 Enemy defeated!', { selectedIndex: this.selectedEnemyIndex, currentIndex: this.currentEnemyIndex, totalEnemies: this.allEnemies.length });
                
                // ✨ Multi-Enemy: Prüfe ob ALLE Gegner tot sind
                if (this.allEnemies.length > 0) {
                    const allDead = this.allEnemies.every(e => e.hp <= 0);
                    
                    if (allDead) {
                        console.log('🎉 All enemies defeated!');
                        clearInterval(this.updateInterval!);
                        setTimeout(() => this.showVictory(), 500);
                        return;
                    } else {
                        // Es leben noch Gegner - setze State zurück für nächste Runde
                        console.log('✅ Enemy defeated, but others still alive');
                        // Finde den ersten lebenden Gegner und setze ihn als State
                        const firstAlive = this.allEnemies.find(e => e.hp > 0);
                        if (firstAlive) {
                            state.enemy = {
                                ...firstAlive,
                                hp: firstAlive.hp,
                                maxHp: firstAlive.maxHp,
                                name: firstAlive.name,
                                autoAttackDamage: firstAlive.autoAttackDamage || 10,
                                statusEffects: firstAlive.statusEffects || [],
                                isBlocking: firstAlive.isBlocking || false,
                                behavior: firstAlive.behavior || 'balanced',
                                damageMultiplier: firstAlive.damageMultiplier || 1.0,
                                baseDamage: firstAlive.baseDamage || firstAlive.autoAttackDamage || 10,
                                sprite: firstAlive.sprite
                            };
                            state.isRunning = true; // Kampf läuft weiter
                        }
                        this.render();
                    }
                    return;
                }
                
                // Legacy: Einzelner Gegner Modus
                clearInterval(this.updateInterval!);
                setTimeout(() => this.showVictory(), 500);
                return;
            }
            if (state.player.hp <= 0) {
                clearInterval(this.updateInterval!);
                setTimeout(() => this.showDefeat(), 500);
                return;
            }

            // Update HP display
            this.updateHP();
            
            // ✨ Update Skill Cooldowns
            this.updateSkillCooldowns();
        }, 100); // Check every 100ms
    }

    private updateSkillCooldowns(): void {
        if (!this.engine) return;
        
        const state = this.engine.getState() as any;
        if (!state || !state.skillCooldowns) return;
        
        // Update skill slots with cooldown overlays
        const skillSlots = this.container.querySelectorAll('.hotbar-slot[data-skill]');
        skillSlots.forEach((slot, index) => {
            const skillId = slot.getAttribute('data-skill');
            if (!skillId) return;
            
            // Map skill to cooldown key
            const cooldownKey = `skill${index + 1}` as 'skill1' | 'skill2' | 'skill3';
            const cooldown = state.skillCooldowns[cooldownKey];
            
            // Remove old overlay
            const oldOverlay = slot.querySelector('.cooldown-overlay');
            if (oldOverlay) oldOverlay.remove();
            
            // Add overlay if on cooldown
            if (cooldown && cooldown > 0) {
                slot.classList.add('on-cooldown');
                const overlay = document.createElement('div');
                overlay.className = 'cooldown-overlay';
                overlay.textContent = `${cooldown}`;
                slot.appendChild(overlay);
            } else {
                slot.classList.remove('on-cooldown');
            }
        });
    }

    private updateHP(): void {
        if (!this.engine) {
            console.warn('⚠️ updateHP: No engine');
            return;
        }
        
        const state = this.engine.getState() as any;
        if (!state || !state.player || !state.enemy) {
            console.warn('⚠️ updateHP: No state/player/enemy');
            return;
        }
        
        // Player HP
        const playerHpFill = this.container.querySelector('[data-hp-fill="player"]') as HTMLElement;
        const playerHpText = this.container.querySelector('[data-hp-text="player"]') as HTMLElement;
        const statusHp = this.container.querySelector('[data-status-hp="player"]') as HTMLElement;
        const statusMp = this.container.querySelector('[data-status-mp="player"]') as HTMLElement;
        
        if (playerHpFill) {
            const hpPercent = (state.player.hp / state.player.maxHp) * 100;
            playerHpFill.style.width = `${hpPercent}%`;
            
            playerHpFill.classList.remove('low', 'critical');
            if (hpPercent < 25) playerHpFill.classList.add('critical');
            else if (hpPercent < 50) playerHpFill.classList.add('low');
        }
        
        if (playerHpText) {
            playerHpText.textContent = `HP: ${state.player.hp} / ${state.player.maxHp}`;
        }
        
        if (statusHp) {
            statusHp.textContent = `HP: ${state.player.hp}/${state.player.maxHp}`;
        }
        
        if (statusMp) {
            statusMp.textContent = `MP: ${state.player.mp}/${state.player.maxMp}`;
        }

        // Player MP
        const playerMpFill = this.container.querySelector('[data-mp-fill="player"]') as HTMLElement;
        const playerMpText = this.container.querySelector('[data-mp-text="player"]') as HTMLElement;
        
        if (playerMpFill) {
            const mpPercent = (state.player.mp / state.player.maxMp) * 100;
            playerMpFill.style.width = `${mpPercent}%`;
        }
        
        if (playerMpText) {
            playerMpText.textContent = `MP: ${state.player.mp} / ${state.player.maxMp}`;
        }

        // Player Stamina
        const playerStaminaFill = this.container.querySelector('[data-stamina-fill="player"]') as HTMLElement;
        const playerStaminaText = this.container.querySelector('[data-stamina-text="player"]') as HTMLElement;
        
        if (playerStaminaFill) {
            const staminaPercent = (state.player.stamina / state.player.maxStamina) * 100;
            playerStaminaFill.style.width = `${staminaPercent}%`;
        }
        
        if (playerStaminaText) {
            playerStaminaText.textContent = `STA: ${state.player.stamina} / ${state.player.maxStamina}`;
        }

        // ✨ Update nur den aktuellen aktiven Gegner
        if (this.allEnemies.length > 0 && this.currentEnemyIndex < this.allEnemies.length) {
            const currentEnemy = this.allEnemies[this.currentEnemyIndex];
            const enemyHpFill = this.container.querySelector(`[data-hp-fill="enemy-${this.currentEnemyIndex}"]`) as HTMLElement;
            const enemyHpText = this.container.querySelector(`[data-hp-text="enemy-${this.currentEnemyIndex}"]`) as HTMLElement;
            
            if (enemyHpFill && currentEnemy) {
                const hpPercent = (state.enemy.hp / state.enemy.maxHp) * 100;
                enemyHpFill.style.width = `${hpPercent}%`;
            }
            
            if (enemyHpText && currentEnemy) {
                enemyHpText.textContent = `${Math.max(0, state.enemy.hp)} / ${state.enemy.maxHp}`;
            }
        } else if (this.enemies.length > 0) {
            // Legacy: Update alle Gegner wenn enemies array gesetzt ist
            this.enemies.forEach((enemy, index) => {
                const enemyHpFill = this.container.querySelector(`[data-hp-fill="enemy-${index}"]`) as HTMLElement;
                const enemyHpText = this.container.querySelector(`[data-hp-text="enemy-${index}"]`) as HTMLElement;
                
                if (enemyHpFill && enemy.hp !== undefined) {
                    const hpPercent = (enemy.hp / enemy.maxHp) * 100;
                    enemyHpFill.style.width = `${hpPercent}%`;
                }
                
                if (enemyHpText && enemy.hp !== undefined) {
                    enemyHpText.textContent = `${Math.max(0, enemy.hp)} / ${enemy.maxHp}`;
                }
            });
        } else {
            // Fallback: Single Enemy HP
            const enemyHpFill = this.container.querySelector('[data-hp-fill="enemy"]') as HTMLElement;
            const enemyHpText = this.container.querySelector('[data-hp-text="enemy"]') as HTMLElement;
            
            if (enemyHpFill) {
                const hpPercent = (state.enemy.hp / state.enemy.maxHp) * 100;
                enemyHpFill.style.width = `${hpPercent}%`;
            }
            
            if (enemyHpText) {
                enemyHpText.textContent = `${state.enemy.hp} / ${state.enemy.maxHp}`;
            }
        }
    }

    private showBattleLog(message: string): void {
        if (this.battleLog) {
            this.battleLog.remove();
        }
        if (this.logTimeout) {
            clearTimeout(this.logTimeout);
        }

        const log = document.createElement('div');
        log.className = 'ff-battle-log';
        log.textContent = message;
        this.container.appendChild(log);
        this.battleLog = log;

        this.logTimeout = setTimeout(() => {
            log.classList.add('hide');
            setTimeout(() => log.remove(), 300);
        }, 2000);
    }

    private async showVictory(): Promise<void> {
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        const state = this.engine.getState();
        const baseXP = 150;
        const baseGold = 100;
        
        // Check for gate completion
        const gateId = sessionStorage.getItem('current_gate_id');
        const gateData = sessionStorage.getItem('current_gate_data');
        
        let actualXP = baseXP;
        let actualGold = baseGold;
        let isGateVictory = false;
        
        if (gateId && gateData) {
            isGateVictory = true;
            const gate = JSON.parse(gateData);
            actualXP = gate.base_xp;
            actualGold = gate.base_gold;
            
            // Calculate clear time
            const clearTime = Math.floor((Date.now() - (parseInt(sessionStorage.getItem('combat_start_time') || '0'))) / 1000);
            
            // Send completion to server
            this.completeGate(parseInt(gateId), clearTime, {
                xp: actualXP,
                gold: actualGold
            }).catch(err => console.error('Failed to complete gate:', err));
            
            // Clear session storage
            sessionStorage.removeItem('current_gate_id');
            sessionStorage.removeItem('current_gate_data');
            sessionStorage.removeItem('combat_start_time');
        }

        // Load Victory Builder settings from API
        let victorySettings: any = null;
        let victoryCSS = '';
        let backgroundUrl = '';
        
        try {
            const [settingsRes, bgRes] = await Promise.all([
                fetch('http://localhost:3001/api/admin/victory-builder/load/default'),
                fetch('http://localhost:3001/api/admin/victory-builder/background')
            ]);
            
            const settingsData = await settingsRes.json();
            const bgData = await bgRes.json();
            
            if (settingsData.settings) {
                victorySettings = settingsData.settings;
                victoryCSS = settingsData.css || '';
            }
            if (bgData.imageUrl) {
                backgroundUrl = bgData.imageUrl;
            }
        } catch (error) {
            console.warn('⚠️ Could not load Victory Builder settings, using fallback', error);
        }

        // Inject Victory Builder CSS if available
        if (victoryCSS) {
            const styleEl = document.createElement('style');
            styleEl.id = 'victory-builder-styles';
            styleEl.textContent = victoryCSS;
            document.head.appendChild(styleEl);
        }

        // Render Victory Popup mit Builder-Struktur oder Fallback
        const victoryScreen = document.createElement('div');
        victoryScreen.className = 'ff-victory-screen';
        
        if (victorySettings) {
            // Victory Builder Template
            victoryScreen.innerHTML = `
                <div class="victory-popup" style="${backgroundUrl ? `background-image: url(${backgroundUrl}); background-size: cover; background-position: center;` : ''}">
                    <h1 class="victory-title">${victorySettings.titleText || (isGateVictory ? 'GATE CLEARED!' : 'SIEG!')}</h1>
                    <p class="victory-subtitle">${victorySettings.subtitleText || (isGateVictory ? 'Gate erfolgreich abgeschlossen!' : 'Alle Gegner besiegt!')}</p>
                    
                    <div class="rewards-container">
                        <div class="reward-row">
                            <span style="font-size: 24px;">⭐</span>
                            <span style="flex: 1; text-align: left; color: #ffd700; font-weight: bold;">XP erhalten</span>
                            <span style="font-size: 18px; color: #10b981;">+${actualXP.toLocaleString('de-DE')}</span>
                        </div>
                        <div class="reward-row">
                            <span style="font-size: 24px;">💰</span>
                            <span style="flex: 1; text-align: left; color: #ffd700; font-weight: bold;">Goldmünzen erhalten</span>
                            <span style="font-size: 18px; color: #10b981;">+${actualGold.toLocaleString('de-DE')}</span>
                        </div>
                    </div>
                    
                    <div class="loot-grid">
                        <div class="loot-item">🗡️</div>
                        <div class="loot-item">🛡️</div>
                        <div class="loot-item">💎</div>
                    </div>
                    
                    <div class="victory-buttons">
                        <button class="victory-btn primary">WEITER</button>
                        <button class="victory-btn secondary">INVENTAR</button>
                    </div>
                </div>
            `;
        } else {
            // Fallback zu altem Design
            victoryScreen.innerHTML = `
                <div class="ff-victory-title">⭐ ${isGateVictory ? 'GATE CLEARED!' : 'SIEG!'} ⭐</div>
                ${isGateVictory ? `<div class="ff-victory-subtitle">🌀 Gate erfolgreich abgeschlossen!</div>` : ''}
                <div class="ff-victory-rewards">
                    <div class="ff-victory-item">
                        <span class="ff-victory-label">XP erhalten:</span>
                        <span class="ff-victory-value">+${actualXP}</span>
                    </div>
                    <div class="ff-victory-item">
                        <span class="ff-victory-label">Goldmünzen erhalten:</span>
                        <span class="ff-victory-value">+${actualGold} 💰</span>
                    </div>
                </div>
                <button class="ff-victory-continue">WEITER</button>
            `;
        }

        this.container.appendChild(victoryScreen);

        // Event listeners für beide Designs
        const continueBtn = victoryScreen.querySelector('.ff-victory-continue, .victory-btn.primary');
        const inventoryBtn = victoryScreen.querySelector('.victory-btn.secondary');
        
        continueBtn?.addEventListener('click', () => {
            // Remove injected styles
            const styleEl = document.getElementById('victory-builder-styles');
            if (styleEl) styleEl.remove();
            
            const panel = document.getElementById('panel-gates');
            const combatPanel = document.getElementById('panel-combat');
            if (panel && combatPanel) {
                combatPanel.classList.remove('active');
                panel.classList.add('active');
            }
            this.container.innerHTML = '';
            
            // Reload gates list if it was a gate completion
            if (isGateVictory && (window as any).newGatesUI) {
                (window as any).newGatesUI.loadGates();
            }
        });
        
        inventoryBtn?.addEventListener('click', () => {
            alert('Inventar-System coming soon! 🎒');
        });
    }
    
    private async completeGate(gateId: number, clearTime: number, rewards: {xp: number, gold: number}) {
        try {
            const response = await fetch(`http://localhost:3001/api/gates/complete/${gateId}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clearTime, rewards })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Gate completed!', data.isFirstClear ? '🏆 FIRST CLEAR!' : '');
            }
        } catch (error) {
            console.error('❌ Error completing gate:', error);
        }
    }

    private showDefeat(): void {
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        const defeatScreen = document.createElement('div');
        defeatScreen.className = 'ff-victory-screen';
        defeatScreen.innerHTML = `
            <div class="ff-victory-title" style="color: #ff0000;">💀 NIEDERLAGE 💀</div>
            <div class="ff-victory-rewards">
                <div class="ff-victory-item">
                    <span class="ff-victory-label">Du wurdest besiegt...</span>
                </div>
            </div>
            <button class="ff-victory-continue">ZURÜCK</button>
        `;

        this.container.appendChild(defeatScreen);

        const continueBtn = defeatScreen.querySelector('.ff-victory-continue');
        continueBtn?.addEventListener('click', () => {
            const panel = document.getElementById('panel-gates');
            const combatPanel = document.getElementById('panel-combat');
            if (panel && combatPanel) {
                combatPanel.classList.remove('active');
                panel.classList.add('active');
            }
            this.container.innerHTML = '';
        });
    }
    
    /**
     * Startet Gate-Combat mit mehreren Gegnern
     */
    public async startGateCombat(config: any): Promise<void> {
        this.gateName = config.gateName;
        this.gateRank = config.gateRank;
        
        // ✨ Normalisiere Enemy-Objekte mit allen erforderlichen Feldern
        this.allEnemies = (config.enemies || []).map((enemy: any) => ({
            ...enemy,
            hp: enemy.hp !== undefined ? enemy.hp : enemy.maxHp, // Setze HP auf maxHp wenn nicht vorhanden
            maxHp: enemy.maxHp || 100, // Fallback falls maxHp fehlt
            statusEffects: enemy.statusEffects || [],
            isBlocking: enemy.isBlocking || false,
            behavior: enemy.behavior || 'balanced',
            damageMultiplier: enemy.damageMultiplier || 1.0,
            baseDamage: enemy.baseDamage || enemy.autoAttackDamage || 10
        }));
        
        console.log('✅ Normalized enemies:', this.allEnemies.map(e => ({ name: e.name, hp: e.hp, maxHp: e.maxHp })));
        
        this.enemies = []; // ✨ Leeres Array - wird beim Spawn gefüllt
        this.currentEnemyIndex = 0;
        this.playerConfig = config;
        
        console.log('🎮 startGateCombat:', { 
            enemies: this.allEnemies.length, 
            enemiesArray: this.enemies.length 
        });
        
        if (this.allEnemies.length > 0) {
            // Multi-Enemy Mode
            await this.spawnNextEnemy();
        }
    }
    
    private async spawnNextEnemy(): Promise<void> {
        if (this.currentEnemyIndex >= this.allEnemies.length) {
            this.showVictory();
            return;
        }
        
        const currentEnemy = this.allEnemies[this.currentEnemyIndex];
        
        // Clear all running intervals
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        // Preserve player HP from previous fight
        const previousState = this.engine ? this.engine.getState() : null;
        const preservedPlayerHp = previousState ? previousState.player.hp : null;
        
        // Erstelle Player mit Stats aus Config/DB
        const player: any = {
            name: this.playerConfig.playerName,
            hp: preservedPlayerHp || (200 + (this.playerConfig.playerLevel * 15)),
            maxHp: 200 + (this.playerConfig.playerLevel * 15),
            mp: 100 + (this.playerConfig.playerLevel * 5),
            maxMp: 100 + (this.playerConfig.playerLevel * 5),
            stamina: 100,
            maxStamina: 100,
            role: this.playerConfig.playerRole,
            level: this.playerConfig.playerLevel,
            hunterRank: this.playerConfig.playerHunterRank,
            specialization: undefined,
            affinityCapBonus: 0,
            shield: 0,
            damageReduction: 0,
            statusEffects: [],
            isBlocking: false,
            autoAttackDamage: 15 + (this.playerConfig.playerLevel * 2),
            defense: 3 + (this.playerConfig.playerLevel * 1),
            autoAttackCount: 0,
            awakeningState: 'locked'
        };
        
        // Erstelle Enemy
        const enemy: any = {
            name: currentEnemy.name,
            hp: currentEnemy.maxHp,
            maxHp: currentEnemy.maxHp,
            statusEffects: [],
            damageMultiplier: 1.0,
            baseDamage: currentEnemy.autoAttackDamage,
            behavior: 'BALANCED',
            isBlocking: false,
            autoAttackDamage: currentEnemy.autoAttackDamage,
            defense: currentEnemy.defense || 0,
            sprite: currentEnemy.sprite
        };
        
        // Erstelle vollständigen Combat State
        const initialState: any = {
            player,
            enemy,
            isRunning: true,
            round: 1,
            turnPhase: TurnPhase.PLAYER_TURN,
            skillCooldowns: {
                skill1: 0,
                skill2: 0,
                skill3: 0,
                interrupt: 0
            },
            dungeonState: {
                isActive: false,
                currentDungeon: null,
                currentEnemyIndex: 0
            },
            progression: {
                level: this.playerConfig.playerLevel,
                xp: 0,
                gold: 0,
                hunterRank: this.playerConfig.playerHunterRank
            },
            combatLog: [],
            bossState: {
                isFightingBoss: !!currentEnemy.isBoss,
                isEnraged: false,
                isPreparingSpecial: false,
                specialAttackDamage: 0,
                interruptCooldown: 5000
            },
            tickCount: 0
        };
        
        // Erstelle neue Engine (ohne Callback - UI steuert Rundenfluss)
        this.engine = new TurnBasedCombatEngine(initialState);
        
        // Reset State  
        this.isPlayerTurn = true;
        this.selectedAction = null;
        this.retryCount = 0;
        
        // Restart immediately
        await this.selectRandomBattleBg();
        this.render();
        this.startUpdateLoop();
    }

    private async loadRandomBattleBg(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3001/api/combat/backgrounds/random');
            if (response.ok) {
                const data = await response.json();
                if (data.background && data.background.image) {
                    // Das Bild ist bereits eine Data-URL (data:image/...)
                    this.currentBattleBg = `background-image: url('${data.background.image}')`;
                    console.log('🎨 Loaded combat background from DB:', data.background.name);
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load combat background from DB, using fallback:', error);
        }

        // Fallback: AdminStorage (Local) backgrounds
        try {
            const backgrounds = (AdminStorage as any).getAllBackgrounds ? AdminStorage.getAllBackgrounds() : [];
            if (backgrounds && backgrounds.length > 0) {
                const random = backgrounds[Math.floor(Math.random() * backgrounds.length)];
                if (random && random.image) {
                    this.currentBattleBg = `background-image: url('${random.image}')`;
                    console.log('🎨 Loaded combat background from AdminStorage:', random.name);
                    return;
                }
            }
        } catch (e) {
            console.warn('⚠️ AdminStorage backgrounds not available:', e);
        }
        
        // Fallback zu statischen CSS-Klassen
        const backgrounds = [
            'bg-forest',
            'bg-cave',
            'bg-dungeon',
            'bg-volcano',
            'bg-ice',
            'bg-desert',
            'bg-ruins',
            'bg-abyss'
        ];
        this.currentBattleBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    }
    
    private async loadPlayerCharacterSprite(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3001/api/characters/me/sprite', {
                credentials: 'include' // Send session cookie
            });
            if (response.ok) {
                const data = await response.json();
                if (data.character && data.character.sprite) {
                    this.playerSprite = data.character.sprite;
                    console.log('👤 Loaded player character sprite:', data.character.name, `(${data.character.class})`);
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load player character sprite:', error);
        }
        
        console.log('👤 Using default emoji sprite');
        this.playerSprite = ''; // Fallback to emoji
    }

    /**
     * Cleanup method - zeigt Placeholder wieder an
     */
    destroy(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.logTimeout) {
            clearTimeout(this.logTimeout);
        }
        
        const placeholder = document.getElementById('combat-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }
        
        console.log('🧹 FFCombatUI destroyed, placeholder restored');
    }
}
