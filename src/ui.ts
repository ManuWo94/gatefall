/**
 * UI Renderer: Updates DOM elements based on combat state
 */

import { CombatState, CombatEvent, CombatEventType, Role } from './combat/types.js';

export class UIRenderer {
    private combatLogEntries: CombatEvent[] = [];
    private static readonly MAX_LOG_ENTRIES = 10;

    private static readonly ROLE_SKILL_NAMES: Record<Role, Record<number, string>> = {
        [Role.WAECHTER]: { 1: 'Schildschlag', 2: 'Bollwerk', 3: 'Provokation' },
        [Role.ASSASSINE]: { 1: 'Schattenstoß', 2: 'Hinrichten', 3: 'Blutung' },
        [Role.MAGIER]: { 1: 'Arkanschlag', 2: 'Manastrom', 3: 'Verbrennung' },
        [Role.SCHARFSCHUETZE]: { 1: 'Schnellschuss', 2: 'Schwachstelle', 3: 'Fokus' },
        [Role.HEILER]: { 1: 'Zerschmettern', 2: 'Heilung', 3: 'Schutzschild' }
    };

    /**
     * Update all UI elements based on current combat state
     */
    public updateUI(state: CombatState): void {
        this.updatePlayer(state);
        this.updateEnemy(state);
        this.updateSkillButtons(state);
        this.updateDungeonEnemiesList(state);
    }

    /**
     * Update player UI elements
     */
    private updatePlayer(state: CombatState): void {
        const { player } = state;

        // Update name
        const nameEl = document.getElementById('player-name');
        if (nameEl) nameEl.textContent = player.name;

        // Update HP
        this.updateBar('player-hp-bar', player.hp, player.maxHp);
        this.updateStatText('player-hp-text', player.hp, player.maxHp);

        // Update MP
        this.updateBar('player-mp-bar', player.mp, player.maxMp);
        this.updateStatText('player-mp-text', player.mp, player.maxMp);
    }

    /**
     * Update enemy UI elements
     */
    private updateEnemy(state: CombatState): void {
        const { enemy, dungeonState } = state;

        // Update name
        const nameEl = document.getElementById('enemy-name');
        if (nameEl) {
            const bossLabel = state.bossState.isFightingBoss ? ' 👑 BOSS' : '';
            nameEl.textContent = enemy.name + bossLabel;
        }

        // Update HP
        this.updateBar('enemy-hp-bar', enemy.hp, enemy.maxHp);
        this.updateStatText('enemy-hp-text', enemy.hp, enemy.maxHp);

        // Update dungeon progress
        const dungeonInfoEl = document.getElementById('dungeon-info');
        const dungeonNameEl = document.getElementById('dungeon-name');
        const dungeonProgressEl = document.getElementById('dungeon-progress');
        
        if (dungeonState.isActive && dungeonState.currentDungeon) {
            if (dungeonInfoEl) dungeonInfoEl.style.display = 'block';
            if (dungeonNameEl) dungeonNameEl.textContent = `🏰 ${dungeonState.currentDungeon.name}`;
            if (dungeonProgressEl) {
                const current = dungeonState.currentEnemyIndex + 1;
                const total = dungeonState.currentDungeon.enemies.length;
                dungeonProgressEl.textContent = `Gegner ${current}/${total}`;
            }
        } else {
            if (dungeonInfoEl) dungeonInfoEl.style.display = 'none';
        }
    }

    /**
     * Update a stat bar's width
     */
    private updateBar(elementId: string, current: number, max: number): void {
        const barEl = document.getElementById(elementId);
        if (barEl) {
            const percentage = Math.max(0, (current / max) * 100);
            barEl.style.width = `${percentage}%`;
        }
    }

    /**
     * Update stat text display
     */
    private updateStatText(elementId: string, current: number, max: number): void {
        const textEl = document.getElementById(elementId);
        if (textEl) {
            textEl.textContent = `${current}/${max}`;
        }
    }

    /**
     * Add a combat event to the log
     */
    public addLogEntry(event: CombatEvent): void {
        this.combatLogEntries.push(event);

        // Keep only the last MAX_LOG_ENTRIES
        if (this.combatLogEntries.length > UIRenderer.MAX_LOG_ENTRIES) {
            this.combatLogEntries.shift();
        }

        this.renderCombatLog();
    }

    /**
     * Render the combat log
     */
    private renderCombatLog(): void {
        const logEl = document.getElementById('combat-log');
        if (!logEl) return;

        logEl.innerHTML = '';

        for (const event of this.combatLogEntries) {
            const entryEl = document.createElement('div');
            entryEl.className = 'log-entry';
            
            // Add specific class based on event type
            if (event.type === CombatEventType.DAMAGE) {
                entryEl.classList.add('damage');
            } else if (event.type === CombatEventType.VICTORY) {
                entryEl.classList.add('victory');
            } else if (event.type === CombatEventType.DEFEAT) {
                entryEl.classList.add('defeat');
            } else if (event.type === CombatEventType.HEAL) {
                entryEl.style.color = '#51cf66';
            } else if (event.type === CombatEventType.STATUS) {
                entryEl.style.color = '#ff922b';
            }

            entryEl.textContent = event.message;
            logEl.appendChild(entryEl);
        }

        // Auto-scroll to bottom
        logEl.scrollTop = logEl.scrollHeight;
    }

    /**
     * Clear the combat log
     */
    public clearLog(): void {
        this.combatLogEntries = [];
        this.renderCombatLog();
    }

    /**
     * Update skill button states (cooldowns, enabled/disabled)
     */
    private updateSkillButtons(state: CombatState): void {
        this.updateSkillButton('skill-1', state.skillCooldowns.skill1, state, 1);
        this.updateSkillButton('skill-2', state.skillCooldowns.skill2, state, 2);
        this.updateSkillButton('skill-3', state.skillCooldowns.skill3, state, 3);
        this.updateInterruptButton(state);
    }

    /**
     * Update individual skill button
     */
    private updateSkillButton(elementId: string, cooldownMs: number, state: CombatState, skillNum: number): void {
        const button = document.getElementById(elementId) as HTMLButtonElement;
        if (!button) return;

        const skillName = this.getSkillName(state.player.role, skillNum);
        
        // Check special conditions for Execute (Assassin Skill 2)
        let isDisabled = cooldownMs > 0;
        if (state.player.role === Role.ASSASSINE && skillNum === 2) {
            const enemyHpPercent = (state.enemy.hp / state.enemy.maxHp) * 100;
            if (enemyHpPercent > 30) {
                isDisabled = true;
                button.textContent = `${skillName} (>30% HP)`;
                button.disabled = true;
                return;
            }
        }

        if (cooldownMs > 0) {
            const cooldownSec = (cooldownMs / 1000).toFixed(1);
            button.textContent = `${skillName} (${cooldownSec}s)`;
            button.disabled = true;
        } else {
            button.textContent = skillName;
            button.disabled = false;
        }
    }

    /**
     * Get skill name from role and skill number
     */
    private getSkillName(role: Role, skillNum: number): string {
        return UIRenderer.ROLE_SKILL_NAMES[role][skillNum] || 'Fähigkeit';
    }

    /**
     * Update interrupt button
     */
    private updateInterruptButton(state: CombatState): void {
        const button = document.getElementById('interrupt-btn') as HTMLButtonElement;
        if (!button) return;

        const cooldownMs = state.skillCooldowns.interrupt;
        const isPreparingSpecial = state.bossState.isPreparingSpecial;

        // Only show button during boss fight
        if (state.bossState.isFightingBoss) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
            return;
        }

        if (cooldownMs > 0) {
            const cooldownSec = (cooldownMs / 1000).toFixed(1);
            button.textContent = `Unterbrechen (${cooldownSec}s)`;
            button.disabled = true;
        } else if (!isPreparingSpecial) {
            button.textContent = 'Unterbrechen';
            button.disabled = true;
            button.classList.remove('interrupt-ready');
        } else {
            button.textContent = '⚡ Unterbrechen!';
            button.disabled = false;
            button.classList.add('interrupt-ready');
        }
    }

    /**
     * Update dungeon enemies list
     */
    private updateDungeonEnemiesList(state: CombatState): void {
        const panelEl = document.getElementById('dungeon-enemies-panel');
        const listEl = document.getElementById('dungeon-enemies-list');
        
        if (!panelEl || !listEl) return;

        if (state.dungeonState.isActive && state.dungeonState.currentDungeon) {
            panelEl.style.display = 'block';
            listEl.innerHTML = '';

            const dungeon = state.dungeonState.currentDungeon;
            
            dungeon.enemies.forEach((enemy) => {
                const enemyCard = document.createElement('div');
                enemyCard.className = 'dungeon-enemy-card';
                
                if (enemy.isDefeated) {
                    enemyCard.classList.add('defeated');
                } else if (state.dungeonState.currentEnemyIndex >= 0 && 
                           dungeon.enemies[state.dungeonState.currentEnemyIndex]?.id === enemy.id &&
                           state.isRunning) {
                    enemyCard.classList.add('active');
                } else {
                    enemyCard.classList.add('selectable');
                    enemyCard.dataset.enemyId = enemy.id.toString();
                }

                const currentHp = enemy.currentHp ?? enemy.maxHp;
                const hpPercent = (currentHp / enemy.maxHp) * 100;

                enemyCard.innerHTML = `
                    <div class="enemy-card-header">
                        <span class="enemy-card-name">${enemy.name}</span>
                        ${enemy.isDefeated ? '<span class="enemy-defeated-badge">☠️ Besiegt</span>' : ''}
                    </div>
                    <div class="enemy-card-hp">
                        <div class="enemy-card-hp-bar">
                            <div class="enemy-card-hp-fill" style="width: ${hpPercent}%"></div>
                        </div>
                        <span class="enemy-card-hp-text">${currentHp}/${enemy.maxHp} LP</span>
                    </div>
                    <div class="enemy-card-stats">
                        <span>⚔️ ${enemy.autoAttackDamage} Schaden</span>
                    </div>
                `;

                listEl.appendChild(enemyCard);
            });
        } else {
            panelEl.style.display = 'none';
        }
    }
}
