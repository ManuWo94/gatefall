/**
 * COMBAT UI
 * Zeigt Telegraph-Banner, Aktionen, Status-Effekte
 */
import { TelegraphSystem } from './telegraph.js';
export class CombatUI {
    constructor(engine, containerId) {
        this.engine = engine;
        const elem = document.getElementById(containerId);
        if (!elem)
            throw new Error(`Container ${containerId} not found`);
        this.container = elem;
        this.setupEventListeners();
        this.render();
    }
    setupEventListeners() {
        this.engine.on('tick', () => this.render());
        this.engine.on('damage', () => this.flashDamage());
        this.engine.on('heal', () => this.flashHeal());
        this.engine.on('combat-end', (data) => this.showVictoryScreen(data.victor));
    }
    render() {
        const state = this.engine.getState();
        // Verstecke Platzhalter
        const placeholder = document.getElementById('combat-placeholder');
        if (placeholder)
            placeholder.style.display = 'none';
        this.container.innerHTML = `
            <div class="combat-screen">
                <!-- Player HP Bar - Oben Links -->
                <div class="player-hp-bar">
                    ${this.renderPlayerHPBar(state.player)}
                </div>

                <!-- Enemy HP Bars - Oben Rechts -->
                <div class="enemy-hp-bars">
                    ${state.enemies.map(e => this.renderEnemyHPBar(e)).join('')}
                </div>
                
                <!-- Character Sprites - Mitte -->
                <div class="battle-stage">
                    <div class="player-sprites">
                        ${this.renderPlayerSprite(state.player)}
                        ${state.squadMembers.slice(0, 2).map(s => this.renderSquadSprite(s)).join('')}
                    </div>
                    <div class="enemy-sprites">
                        ${state.enemies.map(e => this.renderEnemySprite(e)).join('')}
                    </div>
                </div>
                
                <!-- Skill Icons - Unten -->
                ${this.renderSkillBar(state)}
                
                <!-- Combat Log - Rechts Unten -->
                ${this.renderCombatLog(state)}
                
                <!-- Tick Counter -->
                <div class="tick-counter">
                    ⏱️ Tick: ${state.tickCount} | ${state.isPaused ? '⏸️ PAUSIERT' : '▶️ LÄUFT'}
                </div>
            </div>
        `;
        this.attachActionHandlers(state);
    }
    renderTelegraphs(state) {
        if (state.activeTelegraphs.length === 0) {
            return '<div class="telegraph-banner empty">Keine angekündigten Aktionen</div>';
        }
        return state.activeTelegraphs.map(telegraph => {
            const source = this.getCombatantById(state, telegraph.sourceId);
            const isCritical = TelegraphSystem.isCritical(telegraph);
            const color = TelegraphSystem.getThreatColor(telegraph.threatLevel);
            return `
                <div class="telegraph-banner ${isCritical ? 'critical' : ''}" 
                     style="border-left-color: ${color}">
                    <div class="telegraph-icon">⚠️</div>
                    <div class="telegraph-content">
                        <div class="telegraph-message">
                            ${TelegraphSystem.formatTelegraph(telegraph, source?.name || 'Gegner')}
                        </div>
                        <div class="telegraph-timer" style="background: ${color}; width: ${(telegraph.remainingTicks / telegraph.preparationTicks) * 100}%"></div>
                    </div>
                    <div class="telegraph-ticks">${telegraph.remainingTicks}</div>
                </div>
            `;
        }).join('');
    }
    renderEnemyHPBar(enemy) {
        const hpPercent = (enemy.hp / enemy.maxHp) * 100;
        const hpColor = hpPercent > 50 ? '#ff4444' : hpPercent > 25 ? '#ff8800' : '#cc0000';
        return `
            <div class="enemy-hp-entry ${enemy.hp <= 0 ? 'defeated' : ''}" data-id="${enemy.id}">
                <div class="enemy-name">${enemy.name} <span class="enemy-level">Lv.${enemy.level}</span></div>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" style="width: ${hpPercent}%; background: ${hpColor}"></div>
                    <div class="hp-text">${Math.round(enemy.hp)}/${enemy.maxHp}</div>
                </div>
            </div>
        `;
    }
    renderPlayerHPBar(player) {
        const hpPercent = (player.hp / player.maxHp) * 100;
        const hpColor = hpPercent > 50 ? '#00ff88' : hpPercent > 25 ? '#ffaa00' : '#ff4444';
        return `
            <div class="player-hp-entry">
                <div class="player-name">${player.name} <span class="player-level">Lv.${player.level}</span></div>
                <div class="hp-bar-container">
                    <div class="hp-bar-fill" style="width: ${hpPercent}%; background: ${hpColor}"></div>
                    <div class="hp-text">${Math.round(player.hp)}/${player.maxHp}</div>
                </div>
            </div>
        `;
    }
    renderPlayerSprite(player) {
        const role = player.role || 'waechter';
        return `
            <div class="character-sprite player ${player.hp <= 0 ? 'defeated' : ''}" data-id="${player.id}">
                <div class="sprite-character sprite-${role}"></div>
                ${this.renderStatusEffects(player)}
                ${player.currentAction ? '<div class="preparing-indicator"></div>' : ''}
            </div>
        `;
    }
    renderSquadSprite(member) {
        const role = member.role || 'jaeger';
        return `
            <div class="character-sprite squad ${member.hp <= 0 ? 'defeated' : ''}" data-id="${member.id}">
                <div class="sprite-character sprite-${role}"></div>
                ${this.renderStatusEffects(member)}
            </div>
        `;
    }
    renderEnemySprite(enemy) {
        const isBoss = enemy.name.includes('Boss') || enemy.name.includes('Eis');
        const enemyType = isBoss ? 'boss' : 'monster';
        return `
            <div class="character-sprite enemy ${enemy.hp <= 0 ? 'defeated' : ''}" data-id="${enemy.id}">
                <div class="sprite-character sprite-enemy-${enemyType}"></div>
                ${this.renderStatusEffects(enemy)}
                ${enemy.currentAction ? '<div class="preparing-indicator"></div>' : ''}
            </div>
        `;
    }
    renderStatusEffects(combatant) {
        if (combatant.statusEffects.length === 0)
            return '';
        return `
            <div class="status-effects">
                ${combatant.statusEffects.map(effect => `
                    <div class="status-effect" title="${effect.type} (${effect.duration} Ticks)">
                        ${this.getStatusIcon(effect.type)}
                        ${effect.stackCount > 1 ? `<span class="stack-count">${effect.stackCount}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    getStatusIcon(type) {
        const icons = {
            'blutung': '🩸',
            'verbrennung': '🔥',
            'vergiftung': '☠️',
            'verstaerkung': '💪',
            'schild': '🛡️',
            'regeneration': '💚',
            'wachsamkeit': '👁️',
            'schwaechung': '⬇️',
            'verlangsamung': '🐌',
            'furcht': '😨',
            'betaeubung': '💫',
            'verwundbarkeit': '🎯'
        };
        return icons[type] || '❓';
    }
    getActionIcon(action) {
        // Icon basierend auf Action-Name oder Tags
        const name = action.name.toLowerCase();
        if (name.includes('schlag') || name.includes('hieb'))
            return '👊';
        if (name.includes('stich') || name.includes('durchbohren'))
            return '🗡️';
        if (name.includes('feuer') || name.includes('flammen'))
            return '🔥';
        if (name.includes('blitz') || name.includes('donner'))
            return '⚡';
        if (name.includes('eis') || name.includes('frost'))
            return '❄️';
        if (name.includes('schatten') || name.includes('dunkel'))
            return '🌑';
        if (name.includes('licht') || name.includes('heilig'))
            return '✨';
        if (name.includes('gift') || name.includes('vergift'))
            return '☠️';
        if (name.includes('schild') || name.includes('block'))
            return '🛡️';
        if (name.includes('heil') || name.includes('regen'))
            return '💚';
        if (name.includes('buff') || name.includes('stärk'))
            return '💪';
        if (name.includes('debuff') || name.includes('schwäch'))
            return '⬇️';
        if (name.includes('betäub') || name.includes('stun'))
            return '💫';
        if (name.includes('kritisch') || name.includes('wut'))
            return '💥';
        // Tag-basiert
        if (action.tags.includes('magie'))
            return '🔮';
        if (action.tags.includes('schild'))
            return '🛡️';
        if (action.tags.includes('schatten'))
            return '🌑';
        return '⚔️'; // Default
    }
    getActionType(action) {
        // Kategorisierung für Farb-Coding
        const name = action.name.toLowerCase();
        if (name.includes('heil') || name.includes('regen') || name.includes('stärk')) {
            return 'unterstuetzung';
        }
        if (action.tags.includes('schild') || action.tags.includes('block') || name.includes('block')) {
            return 'verteidigung';
        }
        if (name.includes('schwäch') || name.includes('debuff') || name.includes('unterbrech')) {
            return 'kontrolle';
        }
        if (name.includes('kritisch') || name.includes('exekution') || action.preparationTicks >= 3) {
            return 'kritisch';
        }
        return 'angriff'; // Default
    }
    renderSkillBar(state) {
        console.log('🎯 renderSkillBar called');
        console.log('  - isRunning:', state.isRunning);
        console.log('  - player.hp:', state.player.hp);
        console.log('  - player.availableActions:', state.player.availableActions.length);
        if (!state.isRunning || state.player.hp <= 0)
            return '';
        // Nur wenn Spieler keine Aktion vorbereitet
        if (state.player.currentAction) {
            return `
                <div class="skill-bar">
                    <div class="skill-bar-preparing">⏳ Bereite Aktion vor...</div>
                </div>
            `;
        }
        const target = state.currentTargetId || state.enemies[0]?.id;
        const targetName = this.getCombatantById(state, target)?.name || 'Unbekannt';
        console.log('  - Rendering', state.player.availableActions.length, 'skill icons');
        return `
            <div class="skill-bar">
                <div class="skill-bar-target">🎯 ${targetName}</div>
                <div class="skill-icons">
                    ${state.player.availableActions.map(action => {
            const cooldown = state.player.actionCooldowns.get(action.id) || 0;
            const isOnCooldown = cooldown > 0;
            const canAfford = !action.manaCost || (state.player.mana || 0) >= action.manaCost;
            const actionType = this.getActionType(action);
            const actionIcon = this.getActionIcon(action);
            const isDisabled = isOnCooldown || !canAfford;
            let tooltipText = action.name;
            if (action.description)
                tooltipText += '\\n' + action.description;
            if (action.manaCost)
                tooltipText += '\\n💧 ' + action.manaCost;
            if (isOnCooldown)
                tooltipText += '\\n⏱️ ' + cooldown + ' Ticks';
            return `
                            <button class="skill-icon ${actionType}"
                                    data-action-id="${action.id}"
                                    data-target-id="${target}"
                                    title="${tooltipText}"
                                    ${isDisabled ? 'disabled' : ''}>
                                <div class="skill-icon-bg">
                                    <div class="skill-icon-symbol">${actionIcon}</div>
                                    ${isOnCooldown ? `<div class="skill-cooldown">${cooldown}</div>` : ''}
                                    ${!canAfford ? '<div class="skill-locked"></div>' : ''}
                                </div>
                                <div class="skill-name">${action.name}</div>
                            </button>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }
    renderCombatLog(state) {
        // Nur wichtige Einträge anzeigen
        const importantLogs = state.combatLog
            .filter(entry => entry.isImportant || entry.type === 'telegraph' || entry.type === 'system')
            .slice(-5) // Nur letzte 5
            .reverse();
        return `
            <div class="combat-log">
                <div class="combat-log-header">Wichtige Ereignisse</div>
                <div class="combat-log-entries">
                    ${importantLogs.length > 0 ? importantLogs.map(entry => `
                        <div class="log-entry ${entry.isImportant ? 'important' : ''}">
                            <span class="log-tick">[${entry.tick}]</span>
                            <span class="log-message">${entry.message}</span>
                        </div>
                    `).join('') : '<div class="log-entry">Keine wichtigen Ereignisse</div>'}
                </div>
            </div>
        `;
    }
    attachActionHandlers(state) {
        const actionButtons = this.container.querySelectorAll('.skill-icon');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const actionId = btn.dataset.actionId;
                const targetId = btn.dataset.targetId;
                this.engine.playerUseAction(actionId, targetId);
                this.render();
            });
        });
    }
    getCombatantById(state, id) {
        if (state.player.id === id)
            return state.player;
        const enemy = state.enemies.find(e => e.id === id);
        if (enemy)
            return enemy;
        return state.squadMembers.find(s => s.id === id);
    }
    flashDamage() {
        this.container.classList.add('damage-flash');
        setTimeout(() => this.container.classList.remove('damage-flash'), 200);
    }
    flashHeal() {
        this.container.classList.add('heal-flash');
        setTimeout(() => this.container.classList.remove('heal-flash'), 200);
    }
    showVictoryScreen(victor) {
        const state = this.engine.getState();
        if (victor === 'player' && state.rewards) {
            const rewards = state.rewards;
            setTimeout(() => {
                const overlay = document.createElement('div');
                overlay.className = 'victory-overlay';
                overlay.innerHTML = `
                    <div class="victory-content">
                        <div class="victory-title">🎉 SIEG! 🎉</div>
                        <div class="victory-rewards">
                            <div class="reward-item">
                                <span class="reward-icon">⭐</span>
                                <span class="reward-value">+${rewards.xp} XP</span>
                            </div>
                            <div class="reward-item">
                                <span class="reward-icon">💰</span>
                                <span class="reward-value">+${rewards.gold} Gold</span>
                            </div>
                        </div>
                        <button class="victory-btn" id="victory-btn-close">
                            Weiter
                        </button>
                    </div>
                `;
                this.container.appendChild(overlay);
                // Event-Listener für Schließen-Button
                const closeBtn = overlay.querySelector('#victory-btn-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        overlay.remove();
                        this.container.innerHTML = '';
                        const placeholder = document.getElementById('combat-placeholder');
                        if (placeholder)
                            placeholder.style.display = 'block';
                    });
                }
            }, 500);
        }
        else {
            setTimeout(() => {
                const overlay = document.createElement('div');
                overlay.className = 'defeat-overlay';
                overlay.innerHTML = `
                    <div class="defeat-content">
                        <div class="defeat-title">💀 NIEDERLAGE 💀</div>
                        <button class="defeat-btn" id="defeat-btn-close">
                            Zurück
                        </button>
                    </div>
                `;
                this.container.appendChild(overlay);
                // Event-Listener für Schließen-Button
                const closeBtn = overlay.querySelector('#defeat-btn-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        overlay.remove();
                        this.container.innerHTML = '';
                        const placeholder = document.getElementById('combat-placeholder');
                        if (placeholder)
                            placeholder.style.display = 'block';
                    });
                }
            }, 500);
        }
    }
}
//# sourceMappingURL=combat-ui.js.map