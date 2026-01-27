/**
 * Admin Panel UI Controller
 */

import LocalStorage from './storage.js';
import { AdminStorage, GameSkill, Enemy, CharacterTemplate, NPCGuild, BattleBackground, AttackAction, GateImage } from './admin-storage.js';
import { initializeAdminData } from './admin-init.js';

class AdminUI {
    private currentTab: string = 'skills';
    private currentSkillFilter: string = 'all';
    
    constructor() {
        this.init();
    }
    
    private init(): void {
        // Check Admin Access
        const player = LocalStorage.getCurrentPlayer();
        if (!player || !player.isAdmin) {
            alert('⛔ Zugriff verweigert! Nur Admins haben Zugriff.');
            window.location.href = 'index.html';
            return;
        }
        
        // Initialisiere Default-Daten beim ersten Start
        initializeAdminData();
        
        // Set Admin Name
        const nameEl = document.getElementById('admin-name');
        if (nameEl) nameEl.textContent = player.displayName;
        
        // Setup Tabs
        this.setupTabs();
        
        // Load Initial Data
        this.loadAllData();
    }
    
    private setupTabs(): void {
        const tabs = document.querySelectorAll('.admin-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                if (tabName) this.switchTab(tabName);
            });
        });
    }
    
    private switchTab(tabName: string): void {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Update panels
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${tabName}`)?.classList.add('active');
        
        // Reload data for tab
        this.loadAllData();
    }
    
    private loadAllData(): void {
        this.loadAttackActions();
        this.loadSkills();
        this.loadEnemies();
        this.loadBosses();
        this.loadCharacters();
        this.loadGuilds();
        this.loadBackgrounds();
        this.loadGateImages();
        this.loadPlayerRankInfo();
        this.loadGatesStats();
    }
    
    // ==================== ATTACK ACTIONS ====================
    
    private async loadAttackActions(): Promise<void> {
        const container = document.getElementById('attack-actions-list');
        if (!container) return;
        
        container.innerHTML = '<div class="no-items">⏳ Lade Angriffe aus Datenbank...</div>';
        
        try {
            const response = await fetch('http://localhost:3001/api/combat/attack-actions');
            if (!response.ok) throw new Error('Failed to load attack actions');
            
            const data = await response.json();
            const actions = data.actions || [];
            
            if (actions.length === 0) {
                container.innerHTML = '<div class="no-items">Keine Angriffe vorhanden. Erstelle deinen ersten Angriff!</div>';
                return;
            }
        
            container.innerHTML = actions.map((action: any) => `
                <div class="item-card">
                    <div class="item-icon">
                        ${action.icon ? `<img src="${action.icon}" alt="${action.name}">` : '⚔️'}
                    </div>
                    <div class="item-name">${action.name}</div>
                    <div class="item-desc">${action.description}</div>
                    <div class="item-stats">
                        💥 ${Math.round(action.damage_multiplier * 100)} Schaden
                        ${action.stamina_cost > 0 ? `⚡ ${action.stamina_cost} STM` : ''}
                        ${action.cooldown > 0 ? `⏱️ ${action.cooldown}s CD` : ''}
                        ${action.can_block ? '🛡️ Blockbar' : ''}
                        ${action.can_dodge ? '💨 Ausweichbar' : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small" onclick="adminUI.editAttackAction('${action.action_id}')">Bearbeiten</button>
                        <button class="btn btn-small btn-danger" onclick="adminUI.deleteAttackAction('${action.action_id}')">Löschen</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading attack actions:', error);
            container.innerHTML = '<div class="no-items">❌ Fehler beim Laden der Angriffe</div>';
        }
    }
    
    async editAttackAction(id: string): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3001/api/combat/attack-actions/${id}`);
            if (!response.ok) throw new Error('Attack action not found');
            
            const data = await response.json();
            const action = data.action;
            if (!action) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Angriff Bearbeiten</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="edit-attack-action-form" onsubmit="return false;">
                    <input type="hidden" id="action-id" value="${action.id}">
                    
                    <div class="form-group">
                        <label class="form-label">Action ID</label>
                        <input type="text" class="form-input" id="action-action-id" value="${action.action_id}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="action-name" value="${action.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="action-description" rows="2" required>${action.description}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Schaden</label>
                            <input type="number" class="form-input" id="action-damage-mult" value="${Math.round(action.damage_multiplier * 100)}" step="5" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Stamina Kosten</label>
                            <input type="number" class="form-input" id="action-stamina" value="${action.stamina_cost}" min="0" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cooldown (Sekunden)</label>
                            <input type="number" class="form-input" id="action-cooldown" value="${action.cooldown}" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Eigenschaften</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="action-blockable" ${action.can_block ? 'checked' : ''}>
                                    <span>🛡️ Kann geblockt werden</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="action-dodgeable" ${action.can_dodge ? 'checked' : ''}>
                                    <span>💨 Kann ausgewichen werden</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Icon/Bild</label>
                        <input type="file" class="form-input" id="action-icon" accept="image/*">
                        ${action.icon ? `<div class="current-image"><img src="${action.icon}" alt="Current"></div>` : ''}
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                        <button type="submit" class="btn">Speichern</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#edit-attack-action-form') as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const damageValue = parseInt((document.getElementById('action-damage-mult') as HTMLInputElement).value);
            const updatedAction: any = {
                action_id: action.action_id,
                name: (document.getElementById('action-name') as HTMLInputElement).value,
                description: (document.getElementById('action-description') as HTMLTextAreaElement).value,
                damage_multiplier: damageValue / 100,
                stamina_cost: parseInt((document.getElementById('action-stamina') as HTMLInputElement).value),
                cooldown: parseInt((document.getElementById('action-cooldown') as HTMLInputElement).value),
                can_block: (document.getElementById('action-blockable') as HTMLInputElement).checked,
                can_dodge: (document.getElementById('action-dodgeable') as HTMLInputElement).checked,
                icon: action.icon
            };
            
            // Handle image upload
            const iconInput = document.getElementById('action-icon') as HTMLInputElement;
            if (iconInput.files && iconInput.files[0]) {
                const base64 = await this.handleImageUploadFromFile(iconInput.files[0]);
                if (base64) updatedAction.icon = base64;
            }
            
            // Speichere über API
            try {
                const response = await fetch(`http://localhost:3001/api/combat/attack-actions/${action.action_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedAction)
                });
                
                if (!response.ok) throw new Error('Failed to save attack action');
                
                await this.loadAttackActions();
                modal.remove();
                alert('✅ Angriff gespeichert!');
            } catch (error) {
                console.error('Error saving attack action:', error);
                alert('❌ Fehler beim Speichern!');
            }
        });
        } catch (error) {
            console.error('Error loading attack action:', error);
            alert('❌ Fehler beim Laden der Angriffsdaten!');
        }
    }
    
    async deleteAttackAction(id: string): Promise<void> {
        if (confirm('Möchtest du diesen Angriff wirklich löschen?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/combat/attack-actions/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) throw new Error('Failed to delete attack action');
                
                await this.loadAttackActions();
                alert('✅ Angriff gelöscht!');
            } catch (error) {
                console.error('Error deleting attack action:', error);
                alert('❌ Fehler beim Löschen!');
            }
        }
    }
    
    createAttackAction(): void {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Neuer Angriff</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="create-attack-action-form" onsubmit="return false;">
                    <div class="form-group">
                        <label class="form-label">Action ID</label>
                        <input type="text" class="form-input" id="new-action-action-id" required placeholder="z.B. heavy-strike">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="new-action-name" required placeholder="z.B. Schwerer Schlag">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="new-action-description" rows="2" required placeholder="Beschreibung des Angriffs"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">
                                Schaden
                                <small style="display: block; color: #888; font-size: 0.85em; margin-top: 4px;">
                                    Basis-Schadenswert (wird mit Hunter Rank skaliert: E=1x, D=1.5x, C=2x, B=2.5x, A=3x, S=3.5x, SS=3.8x, SSS=4x)
                                </small>
                            </label>
                            <input type="number" class="form-input" id="new-action-damage" value="100" min="0" step="10" required>
                        </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Stamina Kosten</label>
                            <input type="number" class="form-input" id="new-action-stamina" value="0" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Cooldown (Sekunden)</label>
                            <input type="number" class="form-input" id="new-action-cooldown" value="0" min="0" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Eigenschaften</label>
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="new-action-blockable" checked>
                                    <span>🛡️ Kann geblockt werden</span>
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="new-action-dodgeable" checked>
                                    <span>💨 Kann ausgewichen werden</span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Icon/Bild</label>
                            <input type="file" class="form-input" id="new-action-icon" accept="image/*">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                        <button type="submit" class="btn">Erstellen</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#create-attack-action-form') as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const damageValue = parseInt((document.getElementById('new-action-damage') as HTMLInputElement)?.value || '100');
            
            const newAction: import('./admin-storage.js').AttackAction = {
                id: `action_${Date.now()}`,
                action_id: (document.getElementById('new-action-action-id') as HTMLInputElement).value,
                name: (document.getElementById('new-action-name') as HTMLInputElement).value,
                description: (document.getElementById('new-action-description') as HTMLTextAreaElement).value,
                damage_multiplier: damageValue / 100,
                stamina_cost: parseInt((document.getElementById('new-action-stamina') as HTMLInputElement).value),
                cooldown: parseInt((document.getElementById('new-action-cooldown') as HTMLInputElement).value),
                can_block: (document.getElementById('new-action-blockable') as HTMLInputElement).checked,
                can_dodge: (document.getElementById('new-action-dodgeable') as HTMLInputElement).checked,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // Handle image upload
            const iconInput = document.getElementById('new-action-icon') as HTMLInputElement;
            if (iconInput.files && iconInput.files[0]) {
                const base64 = await this.handleImageUploadFromFile(iconInput.files[0]);
                if (base64) newAction.icon = base64;
            }
            
            // Speichere über API
            try {
                const response = await fetch('http://localhost:3001/api/combat/attack-actions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newAction)
                });
                
                if (!response.ok) throw new Error('Failed to create attack action');
                
                await this.loadAttackActions();
                modal.remove();
                alert('✅ Angriff erstellt!');
            } catch (error) {
                console.error('Error creating attack action:', error);
                alert('❌ Fehler beim Erstellen!');
            }
        });
    }
    
    // ==================== SKILLS ====================
    
    filterSkills(type: string): void {
        this.currentSkillFilter = type;
        document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
        (event?.target as HTMLElement)?.classList.add('active');
        this.loadSkills();
    }
    
    private async loadSkills(): Promise<void> {
        const container = document.getElementById('skills-list');
        if (!container) return;
        
        container.innerHTML = '<div class="no-items">⏳ Lade Skills aus Datenbank...</div>';
        
        try {
            const response = await fetch('http://localhost:3001/api/skills');
            if (!response.ok) {
                throw new Error('Failed to load skills from database');
            }
            
            const data = await response.json();
            const skills = data.skills || [];
            
            console.log('🎯 Loaded', skills.length, 'skills from database');
            
            if (skills.length === 0) {
                container.innerHTML = '<div class="no-items">Keine Skills in der Datenbank. Bitte importiere Skill-Daten!</div>';
                return;
            }
            
            container.innerHTML = skills.map((skill: any) => {
                // Determine value display based on skill type
                let valueDisplay = '';
                if (skill.skill_type === 'damage' || skill.skill_type === 'dot') {
                    valueDisplay = `🗡️ ${skill.base_value || 0} DMG`;
                } else if (skill.skill_type === 'heal') {
                    valueDisplay = `💚 ${skill.base_value || 0} HEAL`;
                } else if (skill.skill_type === 'buff' || skill.skill_type === 'debuff') {
                    valueDisplay = `✨ ${skill.base_value || 0}%`;
                }
                
                // Element icon mapping
                const elementIcons: Record<string, string> = {
                    'physical': '⚔️',
                    'fire': '🔥',
                    'ice': '❄️',
                    'lightning': '⚡',
                    'dark': '🌑',
                    'light': '✨',
                    'poison': '☠️',
                    'wind': '💨',
                    'earth': '🌍'
                };
                
                const skillIcon = skill.damage_type ? elementIcons[skill.damage_type] || '⚔️' : '⚔️';
                
                return `
                    <div class="item-card">
                        <div class="item-icon" style="font-size: 2em;">
                            ${skill.icon ? `<img src="${skill.icon}" alt="${skill.name}" style="width: 100%; height: 100%; object-fit: contain;">` : skillIcon}
                        </div>
                        <div class="item-name">${skill.name}</div>
                        <div class="item-desc">${skill.description || 'Keine Beschreibung'}</div>
                        <div class="item-stats">
                            <strong>${valueDisplay}</strong>
                            ${skill.mana_cost > 0 ? ` | 💧 ${skill.mana_cost} MP` : ''}
                            ${skill.stamina_cost > 0 ? ` | ⚡ ${skill.stamina_cost} STM` : ''}
                            ${skill.cooldown > 0 ? ` | ⏱️ ${skill.cooldown}R` : ''}
                            <br>
                            <small>Typ: ${skill.skill_type.toUpperCase()}</small>
                            ${skill.damage_type ? ` | <small>Element: ${skill.damage_type}</small>` : ''}
                            ${skill.status_effect ? ` | <small>Status: ${skill.status_effect}</small>` : ''}
                        </div>
                        <div class="item-actions">
                            <button class="btn btn-small" onclick="adminUI.editSkill('${skill.id}')">Bearbeiten</button>
                            <button class="btn btn-small btn-danger" onclick="adminUI.deleteSkill('${skill.id}')">Löschen</button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading skills from database:', error);
            container.innerHTML = '<div class="no-items" style="color: #ff4444;">❌ Fehler beim Laden der Skills aus der Datenbank</div>';
        }
    }
    
    async openSkillModal(skillId?: string): Promise<void> {
        let skill = null;
        
        if (skillId) {
            try {
                const response = await fetch(`http://localhost:3001/api/skills/${skillId}`);
                if (response.ok) {
                    const data = await response.json();
                    skill = data.skill;
                }
            } catch (error) {
                console.error('Error loading skill:', error);
            }
        }
        
        const isEdit = !!skill;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'Skill bearbeiten' : 'Neuer Skill'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="skill-form" onsubmit="return false;">
                    <input type="hidden" id="skill-id" value="${skill?.id || ''}">
                    
                    <div class="form-group">
                        <label class="form-label">Skill Name</label>
                        <input type="text" class="form-input" id="skill-name" value="${skill?.name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="skill-desc">${skill?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Typ</label>
                            <select class="form-select" id="skill-type">
                                <option value="damage" ${skill?.skill_type === 'damage' ? 'selected' : ''}>Schaden</option>
                                <option value="heal" ${skill?.skill_type === 'heal' ? 'selected' : ''}>Heilung</option>
                                <option value="buff" ${skill?.skill_type === 'buff' ? 'selected' : ''}>Buff</option>
                                <option value="debuff" ${skill?.skill_type === 'debuff' ? 'selected' : ''}>Debuff</option>
                                <option value="dot" ${skill?.skill_type === 'dot' ? 'selected' : ''}>DoT</option>
                                <option value="stun" ${skill?.skill_type === 'stun' ? 'selected' : ''}>Stun</option>
                                <option value="special" ${skill?.skill_type === 'special' ? 'selected' : ''}>Spezial</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Element</label>
                            <select class="form-select" id="skill-element">
                                <option value="">Kein Element</option>
                                <option value="physical" ${skill?.damage_type === 'physical' ? 'selected' : ''}>Physisch</option>
                                <option value="fire" ${skill?.damage_type === 'fire' ? 'selected' : ''}>Feuer</option>
                                <option value="ice" ${skill?.damage_type === 'ice' ? 'selected' : ''}>Eis</option>
                                <option value="lightning" ${skill?.damage_type === 'lightning' ? 'selected' : ''}>Blitz</option>
                                <option value="dark" ${skill?.damage_type === 'dark' ? 'selected' : ''}>Dunkel</option>
                                <option value="light" ${skill?.damage_type === 'light' ? 'selected' : ''}>Licht</option>
                                <option value="poison" ${skill?.damage_type === 'poison' ? 'selected' : ''}>Gift</option>
                                <option value="wind" ${skill?.damage_type === 'wind' ? 'selected' : ''}>Wind</option>
                                <option value="earth" ${skill?.damage_type === 'earth' ? 'selected' : ''}>Erde</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Basis Schaden/Heilung/Wert</label>
                            <input type="number" class="form-input" id="skill-damage" value="${skill?.base_value || 0}">
                            <small style="color: var(--text-dim);">Schaden, Heilung oder Effekt-Stärke je nach Typ</small>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Mana Kosten</label>
                            <input type="number" class="form-input" id="skill-mana" value="${skill?.mana_cost || 0}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Stamina Kosten</label>
                            <input type="number" class="form-input" id="skill-stamina" value="${skill?.stamina_cost || 0}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cooldown (Runden)</label>
                            <input type="number" class="form-input" id="skill-cooldown" value="${skill?.cooldown || 0}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Min. Level</label>
                            <input type="number" class="form-input" id="skill-minlevel" value="${skill?.min_level || 1}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Dauer (Runden)</label>
                            <input type="number" class="form-input" id="skill-duration" value="${skill?.duration || 0}">
                            <small style="color: var(--text-dim);">Für Buffs/Debuffs/DoT</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Status-Effekt</label>
                            <select class="form-select" id="skill-status">
                                <option value="">Kein Status</option>
                                <option value="burn" ${skill?.status_effect === 'burn' ? 'selected' : ''}>Brennen</option>
                                <option value="frozen" ${skill?.status_effect === 'frozen' ? 'selected' : ''}>Gefroren</option>
                                <option value="stunned" ${skill?.status_effect === 'stunned' ? 'selected' : ''}>Betäubt</option>
                                <option value="poisoned" ${skill?.status_effect === 'poisoned' ? 'selected' : ''}>Vergiftet</option>
                                <option value="bleeding" ${skill?.status_effect === 'bleeding' ? 'selected' : ''}>Blutend</option>
                                <option value="weak_spot" ${skill?.status_effect === 'weak_spot' ? 'selected' : ''}>Schwachstelle</option>
                                <option value="strengthened" ${skill?.status_effect === 'strengthened' ? 'selected' : ''}>Verstärkt</option>
                                <option value="protected" ${skill?.status_effect === 'protected' ? 'selected' : ''}>Geschützt</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Ziel-Typ</label>
                            <select class="form-select" id="skill-target">
                                <option value="single_enemy" ${skill?.target_type === 'single_enemy' ? 'selected' : ''}>Einzelner Gegner</option>
                                <option value="all_enemies" ${skill?.target_type === 'all_enemies' ? 'selected' : ''}>Alle Gegner</option>
                                <option value="self" ${skill?.target_type === 'self' ? 'selected' : ''}>Selbst</option>
                                <option value="single_ally" ${skill?.target_type === 'single_ally' ? 'selected' : ''}>Einzelner Verbündeter</option>
                                <option value="all_allies" ${skill?.target_type === 'all_allies' ? 'selected' : ''}>Alle Verbündete</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Nutzbar von</label>
                            <select class="form-select" id="skill-usable">
                                <option value="both" ${skill?.usable_by === 'both' ? 'selected' : ''}>Spieler & Gegner</option>
                                <option value="player" ${skill?.usable_by === 'player' ? 'selected' : ''}>Nur Spieler</option>
                                <option value="enemy" ${skill?.usable_by === 'enemy' ? 'selected' : ''}>Nur Gegner</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Rollen (mindestens eine auswählen)</label>
                        <div class="checkbox-group" id="skill-roles-checkboxes">
                            <label class="checkbox-label">
                                <input type="checkbox" value="waechter" class="role-checkbox">
                                🛡️ Wächter
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="assassine" class="role-checkbox">
                                🗡️ Assassine
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="magier" class="role-checkbox">
                                🔮 Magier
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="heiler" class="role-checkbox">
                                ✨ Heiler
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="beschwoerer" class="role-checkbox">
                                🐉 Beschwörer
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="berserker" class="role-checkbox">
                                ⚔️ Berserker
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" value="fluchwirker" class="role-checkbox">
                                💀 Fluchwirker
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">🎯 Modul (Hunter-Rang System)</label>
                            <select class="form-select" id="skill-module">
                                <option value="">Nicht zugewiesen</option>
                                <option value="0">Modul 1 (E-Rang+)</option>
                                <option value="1">Modul 2 (D-Rang+)</option>
                                <option value="2">Modul 3 (C-Rang+)</option>
                            </select>
                            <small style="color: var(--text-dim);">Bestimmt ab welchem Rang der Skill verfügbar ist</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">🎭 Rollentyp</label>
                            <select class="form-select" id="skill-roletype">
                                <option value="">Nicht festgelegt</option>
                                <option value="tank">Tank (Aggro, Verteidigung)</option>
                                <option value="dps">DPS (Schaden, Burst)</option>
                                <option value="support">Support (Heilung, Buffs)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">⚡ Spezialisierung (Ab C-Rang)</label>
                        <select class="form-select" id="skill-specialization">
                            <option value="">Keine (Alle Klassen)</option>
                            <optgroup label="🛡️ Wächter">
                                <option value="waechter_fortress">Bollwerk (Standhaftigkeit)</option>
                                <option value="waechter_protector">Beschützer (Alliierte unterstützen)</option>
                                <option value="waechter_avenger">Vergelter (Konter-Schaden)</option>
                            </optgroup>
                            <optgroup label="🗡️ Assassine">
                                <option value="assassine_shadow">Schatten (Heimlichkeit)</option>
                                <option value="assassine_blade">Klingen-Tänzer (Kritische Treffer)</option>
                                <option value="assassine_poison">Gift-Meister (DoT Schaden)</option>
                            </optgroup>
                            <optgroup label="🔮 Magier">
                                <option value="magier_pyro">Pyromant (Feuer-Spezialist)</option>
                                <option value="magier_frost">Eismage (Eis-Kontrolle)</option>
                                <option value="magier_storm">Sturmrufer (Blitz-Macht)</option>
                            </optgroup>
                            <optgroup label="✨ Heiler">
                                <option value="heiler_priest">Priester (Restaurierung)</option>
                                <option value="heiler_guardian">Wächter (Schutz-Buffs)</option>
                                <option value="heiler_sage">Weiser (Göttliche Macht)</option>
                            </optgroup>
                            <optgroup label="🐉 Beschwörer">
                                <option value="beschwoerer_summoner">Elementarrufer (Elementare)</option>
                                <option value="beschwoerer_swarm">Schwarm (Viele kleine Kreaturen)</option>
                                <option value="beschwoerer_beastmaster">Tiermeister (Bestien)</option>
                            </optgroup>
                            <optgroup label="⚔️ Berserker">
                                <option value="berserker_blood">Blutrausch (Blutdurst)</option>
                                <option value="berserker_titan">Titan (Rohe Stärke)</option>
                                <option value="berserker_reaper">Sensenmann (Execute-Schaden)</option>
                            </optgroup>
                            <optgroup label="💀 Fluchwirker">
                                <option value="fluchwirker_corruption">Verderber (Schwäche & Debuffs)</option>
                                <option value="fluchwirker_necro">Nekromant (Untote)</option>
                                <option value="fluchwirker_doom">Unheilsbringer (Unheil & Fluch)</option>
                            </optgroup>
                        </select>
                        <small style="color: var(--text-dim);">Nur für diese Spezialisierung verfügbar</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">📈 Spezialisierungs-Stufe</label>
                            <select class="form-select" id="skill-spec-tier">
                                <option value="0">Basis-Skill (Keine Spezialisierung)</option>
                                <option value="1">🟢 C-Rang: 1. Spezialisierung</option>
                                <option value="2">🔵 B-Rang: Vertiefung 1. Spec</option>
                                <option value="3">🟣 A-Rang: Vertiefung 2. Spec</option>
                            </select>
                            <small style="color: var(--text-dim);">Bestimmt ab welcher Stufe verfügbar</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="skill-cross-class">
                                🔀 Rollenfremde Spezialisierung (B-Rang+)
                            </label>
                            <small style="color: var(--text-dim); display: block; margin-top: 4px;">
                                Skill ist ab B-Rang als 2. Spezialisierung (klassenfremd) verfügbar
                            </small>
                        </div>
                    </div>
                    
                    <div style="background: rgba(52, 152, 219, 0.1); border-left: 3px solid #3498db; padding: 12px; border-radius: 6px; margin-top: 12px;">
                        <strong style="color: #3498db;">📋 Spezialisierungs-System:</strong><br>
                        <small style="color: #aaa; line-height: 1.6;">
                            • <strong>C-Rang:</strong> 1. Spezialisierung der eigenen Klasse<br>
                            • <strong>B-Rang:</strong> Vertiefung 1. Spec + 2. Spec (auch klassenfremd)<br>
                            • <strong>A-Rang:</strong> Vertiefung der 2. Spezialisierung
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Skill Icon (Bild hochladen)</label>
                        <div class="image-upload" onclick="document.getElementById('skill-icon-input').click()">
                            ${skill?.icon ? `<img src="${skill.icon}" class="image-preview" id="skill-icon-preview">` : '📤 Klicken um Bild hochzuladen'}
                        </div>
                        <input type="file" id="skill-icon-input" accept="image/*" style="display: none;" onchange="adminUI.handleImageUpload(this, 'skill-icon-preview')">
                    </div>
                    
                    <div class="form-group">
                        <button type="button" class="btn" onclick="adminUI.saveSkill()">${isEdit ? 'Speichern' : 'Erstellen'}</button>
                        <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Abbrechen</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('modal-container')!.appendChild(modal);
        
        // Setze Werte wenn es ein Edit ist
        if (skill) {
            console.log('🔧 Setze Skill-Werte:', skill);
            
            // Rollen setzen
            const roles = typeof skill.roles === 'string' ? JSON.parse(skill.roles) : (skill.roles || []);
            console.log('  Rollen:', roles);
            if (Array.isArray(roles)) {
                roles.forEach((role: string) => {
                    const checkbox = document.querySelector(`input.role-checkbox[value="${role}"]`) as HTMLInputElement;
                    if (checkbox) {
                        checkbox.checked = true;
                        console.log(`    ✓ Rolle ${role} aktiviert`);
                    }
                });
            }
            
            // Module setzen
            if (skill.module_index !== null && skill.module_index !== undefined) {
                const moduleSelect = document.getElementById('skill-module') as HTMLSelectElement;
                if (moduleSelect) {
                    moduleSelect.value = String(skill.module_index);
                    console.log('  Modul:', skill.module_index);
                }
            }
            
            // Spezialisierung setzen
            if (skill.requires_specialization) {
                const specSelect = document.getElementById('skill-specialization') as HTMLSelectElement;
                if (specSelect) {
                    specSelect.value = skill.requires_specialization;
                    console.log('  Spezialisierung:', skill.requires_specialization);
                }
            }
            
            // Spezialisierungs-Stufe setzen
            if (skill.specialization_tier !== null && skill.specialization_tier !== undefined) {
                const tierSelect = document.getElementById('skill-spec-tier') as HTMLSelectElement;
                if (tierSelect) {
                    tierSelect.value = String(skill.specialization_tier);
                    console.log('  Spec-Tier:', skill.specialization_tier);
                }
            }
            
            // Cross-Class setzen
            if (skill.is_cross_class) {
                const crossClassCheck = document.getElementById('skill-cross-class') as HTMLInputElement;
                if (crossClassCheck) {
                    crossClassCheck.checked = true;
                    console.log('  Cross-Class: aktiviert');
                }
            }
            
            // Rollentyp setzen
            if (skill.role_type) {
                const roleTypeSelect = document.getElementById('skill-roletype') as HTMLSelectElement;
                if (roleTypeSelect) {
                    roleTypeSelect.value = skill.role_type;
                    console.log('  Rollentyp:', skill.role_type);
                }
            }
            
            // Icon setzen (für Edit-Modus)
            if (skill.icon) {
                const iconInput = document.getElementById('skill-icon-input') as HTMLInputElement;
                if (iconInput) {
                    iconInput.setAttribute('data-image', skill.icon);
                    console.log('  Icon gesetzt');
                }
            }
        }
    }
    
    handleImageUpload(input: HTMLInputElement, previewId: string): void {
        const file = input.files?.[0];
        if (!file) return;
        
        // Prüfe Dateigröße (max 10MB vor Kompression)
        if (file.size > 10 * 1024 * 1024) {
            alert('⚠️ Bild ist zu groß! Bitte wähle ein Bild unter 10MB.');
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            
            // Komprimiere das Bild
            const img = new Image();
            img.onload = () => {
                // Maximale Größe bestimmen je nach Typ
                let maxWidth = 256;
                let maxHeight = 256;
                
                if (previewId.includes('bg-image')) {
                    // Battle Backgrounds größer (aber nicht zu groß)
                    maxWidth = 800;
                    maxHeight = 600;
                } else if (previewId.includes('guild-logo')) {
                    maxWidth = 128;
                    maxHeight = 128;
                }
                
                // Berechne neue Größe (behalte Seitenverhältnis)
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                // Erstelle Canvas und komprimiere
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                
                // ✨ Prüfe ob Bild Transparenz hat (PNG oder WebP können Transparenz haben)
                const hasTransparency = file.type === 'image/png' || 
                                       file.name.toLowerCase().endsWith('.png') ||
                                       file.type === 'image/webp' ||
                                       file.name.toLowerCase().endsWith('.webp');
                
                // Für PNG/WebP: Transparenter Hintergrund
                if (hasTransparency && ctx) {
                    ctx.clearRect(0, 0, width, height);
                }
                
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Konvertiere zu PNG (mit Transparenz) oder JPEG
                const format = hasTransparency ? 'image/png' : 'image/jpeg';
                const quality = hasTransparency ? 1.0 : 0.8; // PNG: keine Kompression, JPEG: 0.8
                const compressedDataUrl = canvas.toDataURL(format, quality);
                
                // Zeige Kompressionsinfo
                const originalSize = (dataUrl.length * 0.75 / 1024).toFixed(1);
                const compressedSize = (compressedDataUrl.length * 0.75 / 1024).toFixed(1);
                console.log(`🖼️ Bild komprimiert: ${originalSize}KB → ${compressedSize}KB (${width}x${height}px, Format: ${format})`);
                
                // Update Preview
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.innerHTML = `<img src="${compressedDataUrl}" class="image-preview" style="max-width: 100%; height: auto;">`;
                }
                input.setAttribute('data-image', compressedDataUrl);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }
    
    private async handleImageUploadFromFile(file: File): Promise<string | null> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                
                const img = new Image();
                img.onload = () => {
                    const maxWidth = 256;
                    const maxHeight = 256;
                    
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width = Math.floor(width * ratio);
                        height = Math.floor(height * ratio);
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve(null);
                        return;
                    }
                    
                    // ✨ PNG/WebP-Transparenz erhalten
                    const hasTransparency = file.type === 'image/png' || 
                                           file.name.toLowerCase().endsWith('.png') ||
                                           file.type === 'image/webp' ||
                                           file.name.toLowerCase().endsWith('.webp');
                    if (hasTransparency) {
                        ctx.clearRect(0, 0, width, height);
                    }
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // PNG oder JPEG basierend auf Transparenz
                    const format = hasTransparency ? 'image/png' : 'image/jpeg';
                    const quality = hasTransparency ? 1.0 : 0.8;
                    const compressedDataUrl = canvas.toDataURL(format, quality);
                    resolve(compressedDataUrl);
                };
                img.onerror = () => resolve(null);
                img.src = dataUrl;
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    }
    
    async saveSkill(): Promise<void> {
        const isEdit = !!(document.getElementById('skill-id') as HTMLInputElement).value;
        const id = (document.getElementById('skill-id') as HTMLInputElement).value || `skill_${Date.now()}`;
        const name = (document.getElementById('skill-name') as HTMLInputElement).value;
        const description = (document.getElementById('skill-desc') as HTMLTextAreaElement).value;
        const skill_type = (document.getElementById('skill-type') as HTMLSelectElement).value;
        const damage_type = (document.getElementById('skill-element') as HTMLSelectElement).value || null;
        
        const base_value = parseInt((document.getElementById('skill-damage') as HTMLInputElement).value) || 0;
        // scaling_factor entfernt - nicht mehr benötigt
        const mana_cost = parseInt((document.getElementById('skill-mana') as HTMLInputElement).value) || 0;
        const stamina_cost = parseInt((document.getElementById('skill-stamina') as HTMLInputElement).value) || 0;
        const cooldown = parseInt((document.getElementById('skill-cooldown') as HTMLInputElement).value) || 0;
        const duration = parseInt((document.getElementById('skill-duration') as HTMLInputElement).value) || 0;
        const min_level = parseInt((document.getElementById('skill-minlevel') as HTMLInputElement).value) || 1;
        const status_effect = (document.getElementById('skill-status') as HTMLSelectElement).value || null;
        const target_type = (document.getElementById('skill-target') as HTMLSelectElement).value || 'single_enemy';
        const usable_by = (document.getElementById('skill-usable') as HTMLSelectElement).value || 'both';
        
        // Skill-Icon auslesen
        const iconInput = document.getElementById('skill-icon-input') as HTMLInputElement;
        const icon = iconInput.getAttribute('data-image') || null;
        
        // Neue Felder: Rollen, Module, Spezialisierungen
        const roleCheckboxes = document.querySelectorAll<HTMLInputElement>('.role-checkbox:checked');
        const roles = Array.from(roleCheckboxes).map(cb => cb.value);
        
        const moduleValue = (document.getElementById('skill-module') as HTMLSelectElement).value;
        const module_index = moduleValue ? parseInt(moduleValue) : null;
        
        const requires_specialization = (document.getElementById('skill-specialization') as HTMLSelectElement).value || null;
        const specialization_tier = parseInt((document.getElementById('skill-spec-tier') as HTMLSelectElement).value) || 0;
        const is_cross_class = (document.getElementById('skill-cross-class') as HTMLInputElement).checked;
        const role_type = (document.getElementById('skill-roletype') as HTMLSelectElement).value || null;
        
        if (!name) {
            alert('Bitte gib einen Namen ein!');
            return;
        }
        
        if (roles.length === 0) {
            alert('Bitte wähle mindestens eine Rolle aus!');
            return;
        }
        
        const skill = {
            id,
            name,
            description,
            icon,
            skill_type,
            damage_type,
            base_value,
            // scaling_factor entfernt
            mana_cost,
            stamina_cost,
            cooldown,
            duration,
            status_effect,
            target_type,
            usable_by,
            min_level,
            // Neue Felder
            roles: JSON.stringify(roles),
            module_index,
            requires_specialization,
            specialization_tier,
            is_cross_class,
            role_type
        };
        
        try {
            const response = await fetch(
                isEdit ? `http://localhost:3001/api/skills/${id}` : 'http://localhost:3001/api/skills',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(skill)
                }
            );
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Save failed');
            }
            
            console.log('✅ Skill saved:', skill.name);
            document.querySelector('.modal')?.remove();
            this.loadSkills();
            
            alert(`✅ Skill "${name}" wurde ${isEdit ? 'aktualisiert' : 'erstellt'}!`);
        } catch (error: any) {
            console.error('Error saving skill:', error);
            alert(`Fehler beim Speichern: ${error.message || 'Unbekannter Fehler'}`);
        }
    }
    
    editSkill(id: string): void {
        this.openSkillModal(id);
    }
    
    async deleteSkill(id: string): Promise<void> {
        if (confirm('Skill wirklich löschen?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/skills/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Delete failed');
                }
                
                console.log('✅ Skill deleted:', id);
                this.loadSkills();
            } catch (error) {
                console.error('Error deleting skill:', error);
                alert('Fehler beim Löschen des Skills');
            }
        }
    }
    
    // ==================== ENEMIES ====================
    
    private async loadEnemies(): Promise<void> {
        const container = document.getElementById('enemies-list');
        if (!container) return;
        
        container.innerHTML = '<div class="no-items">⏳ Lade Gegner aus Datenbank...</div>';
        
        try {
            // Lade Gegner aus Datenbank-API
            const response = await fetch('http://localhost:3001/api/combat/enemies?is_boss=false');
            if (!response.ok) {
                throw new Error('Failed to load enemies from database');
            }
            
            const data = await response.json();
            const enemies = data.enemies || [];
            
            console.log('📦 Loaded', enemies.length, 'enemies from database');
            
            if (enemies.length === 0) {
                container.innerHTML = '<div class="no-items">Keine Gegner in der Datenbank. Bitte importiere Gegner-Daten!</div>';
                return;
            }
            
            // Gruppiere nach Level (als Proxy für Rang)
            const grouped: Record<string, any[]> = {};
            enemies.forEach((e: any) => {
                const rank = this.getLevelRank(e.level);
                if (!grouped[rank]) grouped[rank] = [];
                grouped[rank].push(e);
            });
            
            let html = '';
            ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'].forEach(rank => {
                if (grouped[rank] && grouped[rank].length > 0) {
                    const color = this.getRankColor(rank);
                    html += `<h3 style="grid-column: 1/-1; color: ${color}; margin: 20px 0 10px 0;">${rank}-Rang Gegner (${grouped[rank].length})</h3>`;
                    html += grouped[rank].map((enemy: any) => this.renderDBEnemyCard(enemy)).join('');
                }
            });
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading enemies from database:', error);
            container.innerHTML = '<div class="no-items" style="color: #ff4444;">❌ Fehler beim Laden der Gegner aus der Datenbank</div>';
        }
    }
    
    private getLevelRank(level: number): string {
        if (level <= 5) return 'E';
        if (level <= 15) return 'D';
        if (level <= 30) return 'C';
        if (level <= 45) return 'B';
        if (level <= 60) return 'A';
        if (level <= 80) return 'S';
        if (level <= 95) return 'SS';
        return 'SSS';
    }
    
    private renderDBEnemyCard(enemy: any): string {
        const rank = this.getLevelRank(enemy.level);
        const rankColor = this.getRankColor(rank);
        
        // Debug: Prüfe Sprite-Länge
        if (enemy.sprite) {
            const spriteLength = enemy.sprite.length;
            console.log(`🖼️ ${enemy.name}: Sprite-Länge = ${spriteLength} Zeichen`);
            if (spriteLength < 100) {
                console.warn(`⚠️ ${enemy.name}: Sprite ist verdächtig kurz (${spriteLength} Zeichen)!`);
            }
            if (!enemy.sprite.startsWith('data:image/')) {
                console.error(`❌ ${enemy.name}: Sprite hat kein gültiges Data-URL-Format!`);
            }
        }
        
        const icon = enemy.sprite ? `<img src="${enemy.sprite}" alt="${enemy.name}" style="width: 100%; height: 100%; object-fit: contain;">` : '👹';
        return `
            <div class="item-card" style="border-left: 3px solid ${rankColor};">
                <div class="item-icon">
                    ${icon}
                </div>
                <div class="item-name">${enemy.name}</div>
                <div class="item-desc">${enemy.description || 'Keine Beschreibung'}</div>
                <div class="item-stats">
                    <strong>Level:</strong> ${enemy.level} | <strong>Rang:</strong> ${rank}<br>
                    <strong>HP:</strong> ${enemy.hp} | <strong>ATK:</strong> ${enemy.attack} | <strong>DEF:</strong> ${enemy.defense}<br>
                    <strong>Speed:</strong> ${enemy.speed} | <strong>Element:</strong> ${enemy.element || 'None'}<br>
                    <strong>💰 Gold:</strong> ${enemy.gold_reward} | <strong>⭐ EXP:</strong> ${enemy.exp_reward}
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="adminUI.editEnemy('${enemy.id}')">Bearbeiten</button>
                    <button class="btn btn-small btn-danger" onclick="adminUI.deleteEnemy('${enemy.id}')">Löschen</button>
                </div>
            </div>
        `;
    }
    
    private renderEnemyCard(enemy: Enemy): string {
        const rankColor = this.getRankColor(enemy.rank);
        const icon = enemy.sprite ? `<img src="${enemy.sprite}" alt="${enemy.name}" style="width: 100%; height: 100%; object-fit: contain;">` : (enemy.isBoss ? '💀' : '👹');
        return `
            <div class="item-card" style="border-left: 3px solid ${rankColor};">
                <div class="item-icon">
                    ${icon}
                </div>
                <div class="item-name">${enemy.name} ${enemy.isBoss ? '⭐' : ''}</div>
                <div class="item-desc">${enemy.description || 'Keine Beschreibung'}</div>
                <div class="item-stats">
                    <strong>Rang:</strong> ${enemy.rank} | <strong>Level:</strong> ${enemy.level}<br>
                    <strong>HP:</strong> ${enemy.maxHp} | <strong>DMG:</strong> ${enemy.baseDamage} | <strong>DEF:</strong> ${enemy.defense || 0}
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="adminUI.editEnemy('${enemy.id}')">Bearbeiten</button>
                    <button class="btn btn-small btn-danger" onclick="adminUI.deleteEnemy('${enemy.id}')">Löschen</button>
                </div>
            </div>
        `;
    }
    
    private getRankColor(rank: string): string {
        const colors: Record<string, string> = {
            'E': '#A0522D',    // Saddle Brown
            'D': '#8B4513',    // Brown
            'C': '#4169E1',    // Royal Blue
            'B': '#32CD32',    // Lime Green
            'A': '#FFD700',    // Gold
            'S': '#FF4444',    // Red
            'SS': '#8B008B',   // Dark Magenta
            'SSS': '#FF00FF'   // Magenta
        };
        return colors[rank] || '#666';
    }
    
    async openEnemyModal(enemyId?: string): Promise<void> {
        let enemy = null;
        
        if (enemyId) {
            try {
                const response = await fetch(`http://localhost:3001/api/combat/enemies/${enemyId}`);
                if (response.ok) {
                    const data = await response.json();
                    enemy = data.enemy;
                }
            } catch (error) {
                console.error('Error loading enemy:', error);
            }
        }
        
        const isEdit = !!enemy;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'Gegner bearbeiten' : 'Neuer Gegner'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="enemy-form" onsubmit="return false;">
                    <input type="hidden" id="enemy-id" value="${enemy?.id || ''}">
                    
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="enemy-name" value="${enemy?.name || ''}" required placeholder="z.B. Schattenbestie">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Rang</label>
                            <select class="form-input" id="enemy-rank" required>
                                <option value="D" ${enemy?.rank === 'D' ? 'selected' : ''}>D</option>
                                <option value="C" ${enemy?.rank === 'C' ? 'selected' : ''}>C</option>
                                <option value="B" ${enemy?.rank === 'B' ? 'selected' : ''}>B</option>
                                <option value="A" ${enemy?.rank === 'A' ? 'selected' : ''}>A</option>
                                <option value="S" ${enemy?.rank === 'S' ? 'selected' : ''}>S</option>
                                <option value="SS" ${enemy?.rank === 'SS' ? 'selected' : ''}>SS</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Level</label>
                            <input type="number" class="form-input" id="enemy-level" value="${enemy?.level || 1}" required min="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="enemy-boss" ${enemy?.is_boss || enemy?.isBoss ? 'checked' : ''}>
                                Boss
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="enemy-desc">${enemy?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Max HP</label>
                            <input type="number" class="form-input" id="enemy-hp" value="${enemy?.maxHp || 100}" required min="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Base Damage</label>
                            <input type="number" class="form-input" id="enemy-damage" value="${enemy?.baseDamage || 10}" required min="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Defense</label>
                            <input type="number" class="form-input" id="enemy-defense" value="${enemy?.defense || 5}" required min="0">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Gegner-Sprite (Icon für Kampfmenü)</label>
                        <div class="image-upload" onclick="document.getElementById('enemy-sprite-input').click()">
                            <div id="enemy-sprite-preview">
                                ${enemy?.sprite ? `<img src="${enemy.sprite}" class="image-preview">` : '📤 Klicken um Sprite hochzuladen<br><small style="color: #aaa;">Empfohlen: 128x128px PNG mit <strong>transparentem Hintergrund</strong> (ausgeschnitten)</small>'}
                            </div>
                        </div>
                        <input type="file" id="enemy-sprite-input" accept="image/png" style="display: none;" onchange="adminUI.handleImageUpload(this, 'enemy-sprite-preview')">
                    </div>
                    
                    <div class="form-group">
                        <button type="button" class="btn" onclick="adminUI.saveEnemy()">${isEdit ? 'Speichern' : 'Erstellen'}</button>
                        <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Abbrechen</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('modal-container')!.appendChild(modal);
    }
    
    async saveEnemy(): Promise<void> {
        const id = (document.getElementById('enemy-id') as HTMLInputElement).value || `enemy_${Date.now()}`;
        const name = (document.getElementById('enemy-name') as HTMLInputElement).value;
        const rank = (document.getElementById('enemy-rank') as HTMLSelectElement).value as any;
        const level = parseInt((document.getElementById('enemy-level') as HTMLInputElement).value);
        const isBoss = (document.getElementById('enemy-boss') as HTMLInputElement).checked;
        const description = (document.getElementById('enemy-desc') as HTMLTextAreaElement).value;
        const maxHp = parseInt((document.getElementById('enemy-hp') as HTMLInputElement).value);
        const baseDamage = parseInt((document.getElementById('enemy-damage') as HTMLInputElement).value);
        const defense = parseInt((document.getElementById('enemy-defense') as HTMLInputElement).value);
        
        const spriteInput = document.getElementById('enemy-sprite-input') as HTMLInputElement;
        const sprite = spriteInput.getAttribute('data-image') || '';
        
        if (!name || !rank || isNaN(level) || isNaN(maxHp) || isNaN(baseDamage)) {
            alert('Bitte fülle alle Pflichtfelder korrekt aus!');
            return;
        }
        
        const enemy: any = {
            id,
            name,
            rank,
            level,
            isBoss,
            description,
            maxHp,
            baseDamage,
            defense: isNaN(defense) ? 0 : defense,
            speed: 50, // Default speed
            element: null, // Can be set later
            gold_reward: level * 10 * (isBoss ? 5 : 1), // 5x for bosses
            exp_reward: level * 20 * (isBoss ? 5 : 1), // 5x for bosses
            sprite,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        try {
            const isEdit = (document.getElementById('enemy-id') as HTMLInputElement).value !== '';
            
            const response = await fetch(
                isEdit ? `http://localhost:3001/api/combat/enemies/${id}` : 'http://localhost:3001/api/combat/enemies',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(enemy)
                }
            );
            
            if (!response.ok) {
                throw new Error('Save failed');
            }
            
            console.log('✅ Enemy saved:', enemy.name);
            document.querySelector('.modal')?.remove();
            this.loadEnemies();
            this.loadBosses();
            
            alert(`✅ ${isBoss ? 'Boss' : 'Gegner'} "${name}" wurde gespeichert!`);
        } catch (error) {
            console.error('Error saving enemy:', error);
            alert('Fehler beim Speichern des Gegners');
        }
    }
    
    editEnemy(id: string): void {
        this.openEnemyModal(id);
    }
    
    async deleteEnemy(id: string): Promise<void> {
        if (confirm('Gegner/Boss wirklich löschen?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/combat/enemies/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('Delete failed');
                }
                
                console.log('✅ Enemy deleted:', id);
                this.loadEnemies();
                this.loadBosses();
            } catch (error) {
                console.error('Error deleting enemy:', error);
                alert('Fehler beim Löschen des Gegners');
            }
        }
    }
    
    // ==================== BOSSES ====================
    
    private async loadBosses(): Promise<void> {
        const container = document.getElementById('bosses-list');
        if (!container) return;
        
        container.innerHTML = '<div class="no-items">⏳ Lade Bosse aus Datenbank...</div>';
        
        try {
            // Lade Bosse aus Datenbank-API
            const response = await fetch('http://localhost:3001/api/combat/enemies?is_boss=true');
            if (!response.ok) {
                throw new Error('Failed to load bosses from database');
            }
            
            const data = await response.json();
            const bosses = data.enemies || [];
            
            console.log('👑 Loaded', bosses.length, 'bosses from database');
            
            if (bosses.length === 0) {
                container.innerHTML = '<div class="no-items">Keine Bosse in der Datenbank. Bitte importiere Boss-Daten!</div>';
                return;
            }
            
            // Gruppiere nach Level (als Proxy für Rang)
            const grouped: Record<string, any[]> = {};
            bosses.forEach((e: any) => {
                const rank = this.getLevelRank(e.level);
                if (!grouped[rank]) grouped[rank] = [];
                grouped[rank].push(e);
            });
            
            let html = '';
            ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'].forEach(rank => {
                if (grouped[rank] && grouped[rank].length > 0) {
                    const color = this.getRankColor(rank);
                    html += `<h3 style="grid-column: 1/-1; color: ${color}; margin: 20px 0 10px 0;">👑 ${rank}-Rang Bosse (${grouped[rank].length})</h3>`;
                    html += grouped[rank].map((boss: any) => this.renderDBBossCard(boss)).join('');
                }
            });
            
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading bosses from database:', error);
            container.innerHTML = '<div class="no-items" style="color: #ff4444;">❌ Fehler beim Laden der Bosse aus der Datenbank</div>';
        }
    }
    
    private renderDBBossCard(boss: any): string {
        const rank = this.getLevelRank(boss.level);
        const rankColor = this.getRankColor(rank);
        const icon = boss.sprite ? `<img src="${boss.sprite}" alt="${boss.name}" style="width: 100%; height: 100%; object-fit: contain;">` : '💀';
        return `
            <div class="item-card" style="border-left: 3px solid ${rankColor}; background: linear-gradient(135deg, rgba(139,0,0,0.1), rgba(0,0,0,0.3));">
                <div class="item-icon">
                    ${icon}
                </div>
                <div class="item-name">👑 ${boss.name}</div>
                <div class="item-desc">${boss.description || 'Keine Beschreibung'}</div>
                <div class="item-stats">
                    <strong>Level:</strong> ${boss.level} | <strong>Rang:</strong> ${rank}<br>
                    <strong>HP:</strong> ${boss.hp} | <strong>ATK:</strong> ${boss.attack} | <strong>DEF:</strong> ${boss.defense}<br>
                    <strong>Speed:</strong> ${boss.speed} | <strong>Element:</strong> ${boss.element || 'None'}<br>
                    <strong>💰 Gold:</strong> ${boss.gold_reward} | <strong>⭐ EXP:</strong> ${boss.exp_reward}
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="adminUI.editEnemy('${boss.id}')">Bearbeiten</button>
                    <button class="btn btn-small btn-danger" onclick="adminUI.deleteEnemy('${boss.id}')">Löschen</button>
                </div>
            </div>
        `;
    }
    
    openBossModal(): void {
        // Boss ist auch ein Enemy, nur mit isBoss=true flag
        // Modal vorbefüllen mit Boss-Flag
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Neuer Boss ⭐</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="enemy-form" onsubmit="return false;">
                    <input type="hidden" id="enemy-id" value="">
                    
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="enemy-name" value="" required placeholder="z.B. Dämonenfürst Khar'zul">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Rang</label>
                            <select class="form-input" id="enemy-rank" required>
                                <option value="D">D</option>
                                <option value="C">C</option>
                                <option value="B">B</option>
                                <option value="A">A</option>
                                <option value="S">S</option>
                                <option value="SS">SS</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Level</label>
                            <input type="number" class="form-input" id="enemy-level" value="1" required min="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <input type="checkbox" id="enemy-boss" checked disabled>
                                Boss ⭐
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="enemy-desc"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Max HP</label>
                            <input type="number" class="form-input" id="enemy-hp" value="1000" required min="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Base Damage</label>
                            <input type="number" class="form-input" id="enemy-damage" value="50" required min="1">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Defense</label>
                            <input type="number" class="form-input" id="enemy-defense" value="20" required min="0">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Boss-Sprite (Icon für Kampfmenü)</label>
                        <div class="image-upload" onclick="document.getElementById('enemy-sprite-input').click()">
                            <div id="enemy-sprite-preview">
                                📤 Klicken um Sprite hochzuladen<br><small style="color: #aaa;">Empfohlen: 256x256px PNG mit <strong>transparentem Hintergrund</strong> (ausgeschnitten)</small>
                            </div>
                        </div>
                        <input type="file" id="enemy-sprite-input" accept="image/png" style="display: none;" onchange="adminUI.handleImageUpload(this, 'enemy-sprite-preview')">
                    </div>
                    
                    <div class="form-group">
                        <button type="button" class="btn" onclick="adminUI.saveEnemy()">Erstellen</button>
                        <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Abbrechen</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('modal-container')!.appendChild(modal);
    }
    
    // ==================== GUILDS ====================
    
    private loadGuilds(): void {
        const guilds = AdminStorage.getAllGuilds();
        const container = document.getElementById('guilds-list');
        if (!container) return;
        
        if (guilds.length === 0) {
            container.innerHTML = '<div class="no-items">Keine Gilden vorhanden.</div>';
            return;
        }
        
        container.innerHTML = guilds.map(guild => `
            <div class="item-card">
                <div class="item-icon">
                    ${guild.logo ? `<img src="${guild.logo}" alt="${guild.name}">` : '🏛️'}
                </div>
                <div class="item-name">[${guild.rank}] ${guild.name}</div>
                <div class="item-desc">${guild.description || 'Keine Beschreibung'}</div>
                <div class="item-stats">
                    👥 ${guild.members} Mitglieder<br>
                    💰 +${guild.goldBonus}% Gold | ⭐ +${guild.expBonus}% EXP<br>
                    Benötigt: ${guild.minHunterRank}-Rang | Lvl ${guild.minLevel}
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="adminUI.editGuild(${guild.id})">Bearbeiten</button>
                    <button class="btn btn-small btn-danger" onclick="adminUI.deleteGuild(${guild.id})">Löschen</button>
                </div>
            </div>
        `).join('');
    }
    
    openGuildModal(guildId?: number): void {
        const guild = guildId ? AdminStorage.getGuild(guildId) : null;
        const isEdit = !!guild;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'Gilde bearbeiten' : 'Neue Gilde'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="guild-form" onsubmit="return false;">
                    <input type="hidden" id="guild-id" value="${guild?.id || ''}">
                    
                    <div class="form-group">
                        <label class="form-label">Gilden Name</label>
                        <input type="text" class="form-input" id="guild-name" value="${guild?.name || ''}" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Rang</label>
                            <select class="form-select" id="guild-rank">
                                <option value="E" ${guild?.rank === 'E' ? 'selected' : ''}>E</option>
                                <option value="D" ${guild?.rank === 'D' ? 'selected' : ''}>D</option>
                                <option value="C" ${guild?.rank === 'C' ? 'selected' : ''}>C</option>
                                <option value="B" ${guild?.rank === 'B' ? 'selected' : ''}>B</option>
                                <option value="A" ${guild?.rank === 'A' ? 'selected' : ''}>A</option>
                                <option value="S" ${guild?.rank === 'S' ? 'selected' : ''}>S</option>
                                <option value="SS" ${guild?.rank === 'SS' ? 'selected' : ''}>SS</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Mitglieder</label>
                            <input type="number" class="form-input" id="guild-members" value="${guild?.members || 10}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="guild-desc">${guild?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Gold Bonus (%)</label>
                            <input type="number" class="form-input" id="guild-gold" value="${guild?.goldBonus || 10}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">EXP Bonus (%)</label>
                            <input type="number" class="form-input" id="guild-exp" value="${guild?.expBonus || 10}">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Min. Hunter Rang</label>
                            <select class="form-select" id="guild-minrank">
                                <option value="E" ${guild?.minHunterRank === 'E' ? 'selected' : ''}>E</option>
                                <option value="D" ${guild?.minHunterRank === 'D' ? 'selected' : ''}>D</option>
                                <option value="C" ${guild?.minHunterRank === 'C' ? 'selected' : ''}>C</option>
                                <option value="B" ${guild?.minHunterRank === 'B' ? 'selected' : ''}>B</option>
                                <option value="A" ${guild?.minHunterRank === 'A' ? 'selected' : ''}>A</option>
                                <option value="S" ${guild?.minHunterRank === 'S' ? 'selected' : ''}>S</option>
                                <option value="SS" ${guild?.minHunterRank === 'SS' ? 'selected' : ''}>SS</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Min. Level</label>
                            <input type="number" class="form-input" id="guild-minlevel" value="${guild?.minLevel || 1}">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Gilden Logo (Bild hochladen)</label>
                        <div class="image-upload" onclick="document.getElementById('guild-logo-input').click()">
                            ${guild?.logo ? `<img src="${guild.logo}" class="image-preview" id="guild-logo-preview">` : '📤 Klicken um Logo hochzuladen'}
                        </div>
                        <input type="file" id="guild-logo-input" accept="image/*" style="display: none;" onchange="adminUI.handleImageUpload(this, 'guild-logo-preview')">
                    </div>
                    
                    <div class="form-group">
                        <button type="button" class="btn" onclick="adminUI.saveGuild()">${isEdit ? 'Speichern' : 'Erstellen'}</button>
                        <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Abbrechen</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('modal-container')!.appendChild(modal);
    }
    
    saveGuild(): void {
        const idStr = (document.getElementById('guild-id') as HTMLInputElement).value;
        const id = idStr ? parseInt(idStr) : Date.now();
        const name = (document.getElementById('guild-name') as HTMLInputElement).value;
        const rank = (document.getElementById('guild-rank') as HTMLSelectElement).value as any;
        const description = (document.getElementById('guild-desc') as HTMLTextAreaElement).value;
        const members = parseInt((document.getElementById('guild-members') as HTMLInputElement).value) || 10;
        const goldBonus = parseInt((document.getElementById('guild-gold') as HTMLInputElement).value) || 10;
        const expBonus = parseInt((document.getElementById('guild-exp') as HTMLInputElement).value) || 10;
        const minHunterRank = (document.getElementById('guild-minrank') as HTMLSelectElement).value as any;
        const minLevel = parseInt((document.getElementById('guild-minlevel') as HTMLInputElement).value) || 1;
        
        const logoInput = document.getElementById('guild-logo-input') as HTMLInputElement;
        const logo = logoInput.getAttribute('data-image') || undefined;
        
        if (!name) {
            alert('Bitte fülle mindestens den Namen aus!');
            return;
        }
        
        const guild: NPCGuild = {
            id,
            name,
            rank,
            description,
            members,
            goldBonus,
            expBonus,
            minHunterRank,
            minLevel,
            logo,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        AdminStorage.saveGuild(guild);
        document.querySelector('.modal')?.remove();
        this.loadGuilds();
        
        alert(`✅ Gilde "${name}" wurde gespeichert!`);
    }
    
    editGuild(id: number): void {
        this.openGuildModal(id);
    }
    
    deleteGuild(id: number): void {
        if (confirm('Gilde wirklich löschen?')) {
            AdminStorage.deleteGuild(id);
            this.loadGuilds();
        }
    }
    
    // ==================== BATTLE BACKGROUNDS ====================
    
    private async loadBackgrounds(): Promise<void> {
        const container = document.getElementById('backgrounds-list');
        if (!container) return;
        
        container.innerHTML = '<div class="no-items">⏳ Lade Hintergründe...</div>';
        
        try {
            const response = await fetch('http://localhost:3001/api/combat/backgrounds');
            if (!response.ok) throw new Error('Failed to load backgrounds');
            
            const data = await response.json();
            const backgrounds = data.backgrounds || [];
            
            if (backgrounds.length === 0) {
                container.innerHTML = '<div class="no-items">Keine Hintergründe vorhanden. Lade dein erstes Kampf-BG hoch!</div>';
                return;
            }
            
            container.innerHTML = backgrounds.map((bg: any) => `
                <div class="item-card">
                    <div class="item-icon" style="background: none; height: 120px; overflow: hidden; border-radius: 8px;">
                        ${bg.image ? `<img src="${bg.image}" alt="${bg.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px;">🎨</div>'}
                    </div>
                    <div class="item-name">${bg.name}</div>
                    <div class="item-desc">${bg.description || 'Keine Beschreibung'}</div>
                    <div class="item-stats">
                        CSS-Klasse: ${bg.css_class || bg.cssClass}
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small" onclick="adminUI.editBackground('${bg.id}')">Bearbeiten</button>
                        <button class="btn btn-small btn-danger" onclick="adminUI.deleteBackground('${bg.id}')">Löschen</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading backgrounds:', error);
            container.innerHTML = '<div class="no-items">❌ Fehler beim Laden</div>';
        }
    }
    
    // ==================== CHARACTERS ====================
    
    private async loadCharacters(): Promise<void> {
        const container = document.getElementById('characters-list');
        if (!container) return;
        
        container.innerHTML = '<div class="no-items">⏳ Lade Characters...</div>';
        
        try {
            const response = await fetch('http://localhost:3001/api/characters');
            if (!response.ok) throw new Error('Failed to load characters');
            
            const data = await response.json();
            const characters = data.characters || [];
            
            if (characters.length === 0) {
                container.innerHTML = '<div class="no-items">Keine Characters vorhanden. Erstelle deinen ersten Character!</div>';
                return;
            }
            
            container.innerHTML = characters.map((char: any) => `
                <div class="item-card">
                    <div class="item-icon" style="background: none; height: 150px;">
                        ${char.sprite ? `<img src="${char.sprite}" alt="${char.name}" style="width: 100%; height: 100%; object-fit: contain;">` : '👤'}
                    </div>
                    <div class="item-name">${char.name}${char.is_default ? ' ⭐' : ''}</div>
                    <div class="item-desc">${char.description || 'Kein Beschreibung'}</div>
                    <div class="item-stats">
                        Klasse: ${char.class || 'Hunter'}
                        ${char.is_default ? '<span style="color: #ffa500; margin-left: 10px;">✨ Standard</span>' : ''}
                    </div>
                    <div class="item-actions">
                        <button class="btn btn-small" onclick="adminUI.editCharacter('${char.id}')">Bearbeiten</button>
                        <button class="btn btn-small btn-danger" onclick="adminUI.deleteCharacter('${char.id}')">Löschen</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading characters:', error);
            container.innerHTML = '<div class="no-items">❌ Fehler beim Laden</div>';
        }
    }
    
    public openCharacterModal(id?: string): void {
        // Erstelle Modal HTML dynamisch
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'character-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${id ? 'Character bearbeiten' : 'Neuer Character'}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="char-name" class="form-input" placeholder="z.B. Hunter Alpha">
                    </div>
                    <div class="form-group">
                        <label>Beschreibung</label>
                        <textarea id="char-description" class="form-input" rows="3" placeholder="Charakter-Beschreibung..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Klasse</label>
                        <select id="char-class" class="form-input">
                            <option value="hunter">Hunter</option>
                            <option value="mage">Mage</option>
                            <option value="warrior">Warrior</option>
                            <option value="ranger">Ranger</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="char-is-default">
                            Als Standard-Character markieren (für neue Spieler)
                        </label>
                    </div>
                    <div class="form-group">
                        <label>Character Sprite (PNG, max 2MB)</label>
                        <input type="file" id="char-sprite-upload" accept="image/*" class="form-input">
                        <div id="char-sprite-preview" style="margin-top: 10px; max-height: 200px; overflow: hidden;"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                    <button class="btn" onclick="adminUI.saveCharacter('${id || ''}')">Speichern</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        
        // Setup Image Upload Preview
        const fileInput = document.getElementById('char-sprite-upload') as HTMLInputElement;
        const preview = document.getElementById('char-sprite-preview') as HTMLElement;
        
        fileInput?.addEventListener('change', (e: any) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Load existing data if editing
        if (id) {
            this.loadCharacterData(id);
        }
    }
    
    private async loadCharacterData(id: string): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3001/api/characters/${id}`);
            if (!response.ok) throw new Error('Failed to load character');
            
            const data = await response.json();
            const char = data.character;
            
            (document.getElementById('char-name') as HTMLInputElement).value = char.name;
            (document.getElementById('char-description') as HTMLTextAreaElement).value = char.description || '';
            (document.getElementById('char-class') as HTMLSelectElement).value = char.class || 'hunter';
            (document.getElementById('char-is-default') as HTMLInputElement).checked = char.is_default === 1;
            
            // Show current sprite
            const preview = document.getElementById('char-sprite-preview');
            if (preview && char.sprite) {
                preview.innerHTML = `<img src="${char.sprite}" style="max-width: 100%; max-height: 200px; object-fit: contain;">`;
            }
        } catch (error) {
            console.error('Error loading character data:', error);
            alert('Fehler beim Laden des Characters');
        }
    }
    
    public async saveCharacter(id?: string): Promise<void> {
        const name = (document.getElementById('char-name') as HTMLInputElement).value.trim();
        const description = (document.getElementById('char-description') as HTMLTextAreaElement).value.trim();
        const charClass = (document.getElementById('char-class') as HTMLSelectElement).value;
        const isDefault = (document.getElementById('char-is-default') as HTMLInputElement).checked;
        const fileInput = document.getElementById('char-sprite-upload') as HTMLInputElement;
        
        if (!name) {
            alert('Bitte gib einen Namen ein!');
            return;
        }
        
        // If editing, sprite is optional. If creating new, sprite is required.
        const file = fileInput?.files?.[0];
        if (!id && !file) {
            alert('Bitte wähle ein Sprite-Bild aus!');
            return;
        }
        
        try {
            let spriteData = '';
            
            if (file) {
                // New sprite uploaded
                spriteData = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e: any) => resolve(e.target.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            } else if (id) {
                // Editing: Keep existing sprite
                const response = await fetch(`http://localhost:3001/api/characters/${id}`);
                const data = await response.json();
                spriteData = data.character.sprite;
            }
            
            const payload = {
                id: id || undefined,
                name,
                description,
                sprite: spriteData,
                class: charClass,
                is_default: isDefault
            };
            
            const response = await fetch('http://localhost:3001/api/characters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) throw new Error('Save failed');
            
            alert('✅ Character gespeichert!');
            document.getElementById('character-modal')?.remove();
            await this.loadCharacters();
        } catch (error) {
            console.error('Error saving character:', error);
            alert('❌ Fehler beim Speichern!');
        }
    }
    
    public async editCharacter(id: string): Promise<void> {
        this.openCharacterModal(id);
    }
    
    public async deleteCharacter(id: string): Promise<void> {
        if (!confirm('Character wirklich löschen?')) return;
        
        try {
            const response = await fetch(`http://localhost:3001/api/characters/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Delete failed');
            
            alert('✅ Character gelöscht!');
            await this.loadCharacters();
        } catch (error) {
            console.error('Error deleting character:', error);
            alert('❌ Fehler beim Löschen!');
        }
    }
    
    // ==================== GATE IMAGES ====================
    
    private loadGateImages(): void {
        const images = AdminStorage.getAllGateImages();
        const container = document.getElementById('gate-images-list');
        if (!container) return;
        
        if (images.length === 0) {
            container.innerHTML = '<div class="no-items">Keine Gate-Bilder vorhanden. Erstelle dein erstes Gate-Bild!</div>';
            return;
        }
        
        const rarityColors: Record<string, string> = {
            common: '#888',
            uncommon: '#00ff88',
            rare: '#00d4ff',
            epic: '#ff00ff',
            legendary: '#ffa500'
        };
        
        const gateTypeLabels: Record<string, string> = {
            standard: '📘 Standard',
            instabil: '⚡ Instabil',
            elite: '👑 Elite',
            katastrophe: '💥 Katastrophe',
            geheim: '🔮 Geheim'
        };
        
        container.innerHTML = images.map(img => `
            <div class="item-card">
                <div class="item-icon" style="background: none; height: 150px; position: relative;">
                    ${img.image ? `<img src="${img.image}" alt="${img.name}" style="width: 100%; height: 100%; object-fit: contain;">` : '🌀'}
                    ${!img.isActive ? '<div style="position: absolute; top: 5px; right: 5px; background: #ff5555; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px;">Deaktiviert</div>' : ''}
                </div>
                <div class="item-name">${img.name}</div>
                <div class="item-desc">${img.description || 'Keine Beschreibung'}</div>
                <div class="item-stats">
                    ${gateTypeLabels[img.gateType]}
                    <span style="color: ${rarityColors[img.rarity]}; margin-left: 10px;">
                        ⭐ ${img.rarity.toUpperCase()}
                    </span>
                </div>
                <div class="item-actions">
                    <button class="btn btn-small" onclick="adminUI.editGateImage('${img.id}')">Bearbeiten</button>
                    <button class="btn btn-small btn-danger" onclick="adminUI.deleteGateImage('${img.id}')">Löschen</button>
                </div>
            </div>
        `).join('');
    }
    
    createGateImage(): void {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Neues Gate-Bild</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="create-gate-image-form" onsubmit="return false;">
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="new-gate-name" required placeholder="z.B. Feuer-Rift">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="new-gate-description" rows="2" placeholder="Beschreibung des Gate-Bildes"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Gate-Typ</label>
                            <select class="form-select" id="new-gate-type">
                                <option value="standard">📘 Standard</option>
                                <option value="instabil">⚡ Instabil</option>
                                <option value="elite">👑 Elite</option>
                                <option value="katastrophe">💥 Katastrophe</option>
                                <option value="geheim">🔮 Geheim</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Seltenheit</label>
                            <select class="form-select" id="new-gate-rarity">
                                <option value="common">Common</option>
                                <option value="uncommon">Uncommon</option>
                                <option value="rare">Rare</option>
                                <option value="epic">Epic</option>
                                <option value="legendary">Legendary</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="new-gate-active" checked>
                            <span>Aktiv (kann spawnen)</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Bild</label>
                        <input type="file" class="form-input" id="new-gate-image" accept="image/*" required>
                        <div id="new-gate-preview" style="margin-top: 10px;"></div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                        <button type="submit" class="btn">Erstellen</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Image preview
        const imageInput = document.getElementById('new-gate-image') as HTMLInputElement;
        imageInput?.addEventListener('change', () => {
            const preview = document.getElementById('new-gate-preview');
            if (imageInput.files && imageInput.files[0] && preview) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target?.result}" style="max-width: 200px; max-height: 200px; object-fit: contain;">`;
                };
                reader.readAsDataURL(imageInput.files[0]);
            }
        });
        
        const form = modal.querySelector('#create-gate-image-form') as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const imageFile = (document.getElementById('new-gate-image') as HTMLInputElement).files?.[0];
            if (!imageFile) {
                alert('Bitte wähle ein Bild aus!');
                return;
            }
            
            const base64 = await this.handleImageUploadFromFile(imageFile);
            if (!base64) {
                alert('❌ Fehler beim Hochladen des Bildes!');
                return;
            }
            
            const newImage: import('./admin-storage.js').GateImage = {
                id: `gate_img_${Date.now()}`,
                name: (document.getElementById('new-gate-name') as HTMLInputElement).value,
                description: (document.getElementById('new-gate-description') as HTMLTextAreaElement).value,
                image: base64,
                gateType: (document.getElementById('new-gate-type') as HTMLSelectElement).value as any,
                rarity: (document.getElementById('new-gate-rarity') as HTMLSelectElement).value as any,
                isActive: (document.getElementById('new-gate-active') as HTMLInputElement).checked,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            AdminStorage.saveGateImage(newImage);
            this.loadGateImages();
            modal.remove();
            alert('✅ Gate-Bild erstellt!');
        });
    }
    
    editGateImage(id: string): void {
        const img = AdminStorage.getGateImage(id);
        if (!img) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Gate-Bild Bearbeiten</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="edit-gate-image-form" onsubmit="return false;">
                    <input type="hidden" id="edit-gate-id" value="${img.id}">
                    
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="edit-gate-name" value="${img.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="edit-gate-description" rows="2">${img.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Gate-Typ</label>
                            <select class="form-select" id="edit-gate-type">
                                <option value="standard" ${img.gateType === 'standard' ? 'selected' : ''}>📘 Standard</option>
                                <option value="instabil" ${img.gateType === 'instabil' ? 'selected' : ''}>⚡ Instabil</option>
                                <option value="elite" ${img.gateType === 'elite' ? 'selected' : ''}>👑 Elite</option>
                                <option value="katastrophe" ${img.gateType === 'katastrophe' ? 'selected' : ''}>💥 Katastrophe</option>
                                <option value="geheim" ${img.gateType === 'geheim' ? 'selected' : ''}>🔮 Geheim</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Seltenheit</label>
                            <select class="form-select" id="edit-gate-rarity">
                                <option value="common" ${img.rarity === 'common' ? 'selected' : ''}>Common</option>
                                <option value="uncommon" ${img.rarity === 'uncommon' ? 'selected' : ''}>Uncommon</option>
                                <option value="rare" ${img.rarity === 'rare' ? 'selected' : ''}>Rare</option>
                                <option value="epic" ${img.rarity === 'epic' ? 'selected' : ''}>Epic</option>
                                <option value="legendary" ${img.rarity === 'legendary' ? 'selected' : ''}>Legendary</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            <input type="checkbox" id="edit-gate-active" ${img.isActive ? 'checked' : ''}>
                            <span>Aktiv (kann spawnen)</span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Bild ändern (optional)</label>
                        <input type="file" class="form-input" id="edit-gate-image" accept="image/*">
                        <div class="current-image" style="margin-top: 10px;">
                            <img src="${img.image}" style="max-width: 200px; max-height: 200px; object-fit: contain;">
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                        <button type="submit" class="btn">Speichern</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#edit-gate-image-form') as HTMLFormElement;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedImage: import('./admin-storage.js').GateImage = {
                id: (document.getElementById('edit-gate-id') as HTMLInputElement).value,
                name: (document.getElementById('edit-gate-name') as HTMLInputElement).value,
                description: (document.getElementById('edit-gate-description') as HTMLTextAreaElement).value,
                image: img.image,
                gateType: (document.getElementById('edit-gate-type') as HTMLSelectElement).value as any,
                rarity: (document.getElementById('edit-gate-rarity') as HTMLSelectElement).value as any,
                isActive: (document.getElementById('edit-gate-active') as HTMLInputElement).checked,
                createdAt: img.createdAt,
                updatedAt: Date.now()
            };
            
            // Handle image upload if new image selected
            const imageInput = document.getElementById('edit-gate-image') as HTMLInputElement;
            if (imageInput.files && imageInput.files[0]) {
                const base64 = await this.handleImageUploadFromFile(imageInput.files[0]);
                if (base64) updatedImage.image = base64;
            }
            
            AdminStorage.saveGateImage(updatedImage);
            this.loadGateImages();
            modal.remove();
            alert('✅ Gate-Bild gespeichert!');
        });
    }
    
    deleteGateImage(id: string): void {
        if (confirm('Gate-Bild wirklich löschen?')) {
            AdminStorage.deleteGateImage(id);
            this.loadGateImages();
            alert('✅ Gate-Bild gelöscht!');
        }
    }
    
    openBackgroundModal(bgId?: string): void {
        const bg = bgId ? AdminStorage.getBackground(bgId) : null;
        const isEdit = !!bg;
        
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'Hintergrund bearbeiten' : 'Neuer Kampf-Hintergrund'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                
                <form id="bg-form" onsubmit="return false;">
                    <input type="hidden" id="bg-id" value="${bg?.id || ''}">
                    
                    <div class="form-group">
                        <label class="form-label">Name</label>
                        <input type="text" class="form-input" id="bg-name" value="${bg?.name || ''}" required placeholder="z.B. Vulkan-Arena">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-textarea" id="bg-desc">${bg?.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">CSS-Klasse</label>
                        <input type="text" class="form-input" id="bg-class" value="${bg?.cssClass || ''}" required placeholder="bg-custom-1">
                        <small style="color: #aaa; font-size: 12px;">Eindeutiger Name für CSS (z.B. bg-volcano-1)</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Hintergrundbild (hochladen)</label>
                        <div class="image-upload" onclick="document.getElementById('bg-image-input').click()">
                            ${bg?.image ? `<img src="${bg.image}" class="image-preview" id="bg-image-preview" style="max-height: 300px;">` : '📤 Klicken um Bild hochzuladen<br><small style="color: #aaa;">Empfohlen: 1920x1080px</small>'}
                        </div>
                        <input type="file" id="bg-image-input" accept="image/*" style="display: none;" onchange="adminUI.handleImageUpload(this, 'bg-image-preview')">
                    </div>
                    
                    <div class="form-group">
                        <button type="button" class="btn" onclick="adminUI.saveBackground()">${isEdit ? 'Speichern' : 'Erstellen'}</button>
                        <button type="button" class="btn btn-danger" onclick="this.closest('.modal').remove()">Abbrechen</button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('modal-container')!.appendChild(modal);
    }
    
    async saveBackground(): Promise<void> {
        const id = (document.getElementById('bg-id') as HTMLInputElement).value || `bg_${Date.now()}`;
        const name = (document.getElementById('bg-name') as HTMLInputElement).value;
        const description = (document.getElementById('bg-desc') as HTMLTextAreaElement).value;
        const cssClass = (document.getElementById('bg-class') as HTMLInputElement).value;
        
        const imageInput = document.getElementById('bg-image-input') as HTMLInputElement;
        const image = imageInput.getAttribute('data-image');
        
        if (!name || !cssClass || !image) {
            alert('Bitte fülle Name, CSS-Klasse und lade ein Bild hoch!');
            return;
        }
        
        const bg: any = {
            id,
            name,
            description,
            css_class: cssClass,
            image
        };
        
        try {
            const isEdit = !!(document.getElementById('bg-id') as HTMLInputElement).value;
            const response = await fetch(
                isEdit ? `http://localhost:3001/api/combat/backgrounds/${id}` : 'http://localhost:3001/api/combat/backgrounds',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bg)
                }
            );
            
            if (!response.ok) throw new Error('Failed to save background');
            
            document.querySelector('.modal')?.remove();
            await this.loadBackgrounds();
            
            alert(`✅ Hintergrund "${name}" wurde gespeichert!\\n\\nCSS-Klasse: ${cssClass}\\nDieser Hintergrund erscheint jetzt zufällig in Kämpfen.`);
        } catch (error) {
            console.error('Error saving background:', error);
            alert('Fehler beim Speichern des Hintergrunds');
        }
    }
    
    editBackground(id: string): void {
        this.openBackgroundModal(id);
    }
    
    async deleteBackground(id: string): Promise<void> {
        if (confirm('Hintergrund wirklich löschen?')) {
            try {
                const response = await fetch(`http://localhost:3001/api/combat/backgrounds/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) throw new Error('Failed to delete background');
                
                await this.loadBackgrounds();
            } catch (error) {
                console.error('Error deleting background:', error);
                alert('Fehler beim Löschen');
            }
        }
    }
    
    // ==================== DATABASE ====================
    
    // ==================== MYSQL ONLY - JSON STORAGE REMOVED ====================
    // Alle Daten werden nur noch in MySQL gespeichert
    // Sessions bleiben in JSON-Dateien (server/sessions/)
    
    // ==================== CHAT CONTROL ====================
    
    toggleChat(enable: boolean): void {
        const statusText = document.getElementById('chat-status-text');
        if (!statusText) return;
        
        if (enable) {
            localStorage.setItem('gatefall_chat_enabled', 'true');
            statusText.textContent = 'Aktiv';
            statusText.style.color = '#00ff88';
            alert('✅ Chat wurde aktiviert!');
        } else {
            localStorage.setItem('gatefall_chat_enabled', 'false');
            statusText.textContent = 'Deaktiviert';
            statusText.style.color = '#ff5555';
            alert('⏸️ Chat wurde deaktiviert! Benutzer können keine Nachrichten senden.');
        }
        
        // Send event to server
        this.sendChatControlCommand('toggle', enable);
    }
    
    restartChat(): void {
        const lastRestartEl = document.getElementById('chat-last-restart');
        
        // Clear chat from localStorage
        localStorage.removeItem('gatefall_chat_messages');
        
        // Update timestamp
        const now = new Date();
        localStorage.setItem('gatefall_chat_last_restart', now.toISOString());
        if (lastRestartEl) {
            lastRestartEl.textContent = now.toLocaleTimeString('de-DE');
        }
        
        // Send restart command to server
        this.sendChatControlCommand('restart', true);
        
        alert('🔄 Chat wurde neugestartet! Alle Verbindungen werden neu aufgebaut.');
    }
    
    clearChatHistory(): void {
        if (!confirm('Möchtest du wirklich den gesamten Chat-Verlauf löschen?')) {
            return;
        }
        
        localStorage.removeItem('gatefall_chat_messages');
        
        // Send clear command to server
        this.sendChatControlCommand('clear', true);
        
        alert('🗑️ Chat-Verlauf wurde gelöscht!');
    }
    
    private sendChatControlCommand(command: string, value: any): void {
        // Send command to backend via fetch
        fetch('http://localhost:3001/api/admin/chat-control', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ command, value })
        }).catch(err => {
            console.error('Failed to send chat control command:', err);
        });
    }
    
    private updateChatStats(): void {
        const usersCount = document.getElementById('chat-users-count');
        const messagesCount = document.getElementById('chat-messages-count');
        const lastRestart = document.getElementById('chat-last-restart');
        const statusText = document.getElementById('chat-status-text');
        
        // Get chat status
        const enabled = localStorage.getItem('gatefall_chat_enabled') !== 'false';
        if (statusText) {
            statusText.textContent = enabled ? 'Aktiv' : 'Deaktiviert';
            statusText.style.color = enabled ? '#00ff88' : '#ff5555';
        }
        
        // Get last restart
        const lastRestartTime = localStorage.getItem('gatefall_chat_last_restart');
        if (lastRestart && lastRestartTime) {
            const date = new Date(lastRestartTime);
            lastRestart.textContent = date.toLocaleTimeString('de-DE');
        }
        
        // Fetch stats from server
        fetch('http://localhost:3001/api/admin/chat-stats', {
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (usersCount) usersCount.textContent = data.activeUsers || '0';
            if (messagesCount) messagesCount.textContent = data.messagesToday || '0';
        })
        .catch(() => {
            // Fallback to localStorage
            const messages = JSON.parse(localStorage.getItem('gatefall_chat_messages') || '[]');
            const today = new Date().toDateString();
            const todayMessages = messages.filter((m: any) => {
                return new Date(m.timestamp).toDateString() === today;
            });
            if (messagesCount) messagesCount.textContent = todayMessages.length.toString();
        });
    }
    
    // ==================== HUNTER RANKS ====================
    
    private loadPlayerRankInfo(): void {
        const player = LocalStorage.getCurrentPlayer();
        if (!player) return;
        
        const displayNameEl = document.getElementById('player-display-name') as HTMLInputElement;
        const currentRankEl = document.getElementById('current-rank') as HTMLInputElement;
        const newRankEl = document.getElementById('new-rank') as HTMLSelectElement;
        const specializationEl = document.getElementById('player-specialization') as HTMLSelectElement;
        const affinityCapEl = document.getElementById('current-affinity-cap') as HTMLInputElement;
        const affinityBonusEl = document.getElementById('affinity-cap-bonus') as HTMLInputElement;
        
        if (displayNameEl) displayNameEl.value = player.displayName;
        if (currentRankEl) currentRankEl.value = player.hunterRank || 'E';
        if (newRankEl) newRankEl.value = player.hunterRank || 'E';
        if (specializationEl) specializationEl.value = player.specialization || '';
        
        // Calculate current affinity cap
        const rank = player.hunterRank || 'E';
        const bonus = player.affinityCapBonus || 0;
        const baseCap = this.getBaseAffinityCap(rank);
        const totalCap = baseCap + bonus;
        
        if (affinityCapEl) affinityCapEl.value = `${totalCap} (Basis: ${baseCap} + Bonus: ${bonus})`;
        if (affinityBonusEl) affinityBonusEl.value = bonus.toString();
    }
    
    private getBaseAffinityCap(rank: string): number {
        const caps: Record<string, number> = {
            'E': 1, 'D': 1, 'C': 2, 'B': 2, 'A': 3, 'S': 3, 'SS': 5, 'SSS': 5
        };
        return caps[rank] || 1;
    }
    
    updatePlayerRank(): void {
        const newRankEl = document.getElementById('new-rank') as HTMLSelectElement;
        if (!newRankEl) return;
        
        const newRank = newRankEl.value as any;
        
        LocalStorage.updateCurrentPlayer({ hunterRank: newRank });
        
        alert(`✅ Hunter-Rang auf ${newRank} aktualisiert!`);
        this.loadPlayerRankInfo();
    }
    
    updatePlayerSpecialization(): void {
        const specializationEl = document.getElementById('player-specialization') as HTMLSelectElement;
        if (!specializationEl) return;
        
        const specialization = specializationEl.value || undefined;
        const player = LocalStorage.getCurrentPlayer();
        if (!player) return;
        
        // Check if player rank is B or higher
        const rankOrder = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
        const playerRankIndex = rankOrder.indexOf(player.hunterRank || 'E');
        const minRankIndex = rankOrder.indexOf('B');
        
        if (playerRankIndex < minRankIndex) {
            alert('⚠️ Spezialisierung ist erst ab B-Rang verfügbar!');
            return;
        }
        
        LocalStorage.updateCurrentPlayer({ specialization });
        
        alert(specialization 
            ? `✅ Spezialisierung auf ${specialization} gesetzt!`
            : '✅ Spezialisierung entfernt!');
        this.loadPlayerRankInfo();
    }
    
    updateAffinityCapBonus(): void {
        const affinityBonusEl = document.getElementById('affinity-cap-bonus') as HTMLInputElement;
        if (!affinityBonusEl) return;
        
        const bonus = parseInt(affinityBonusEl.value) || 0;
        
        // Validate bonus range
        if (bonus < 0 || bonus > 10) {
            alert('⚠️ Bonus muss zwischen 0 und 10 liegen!');
            return;
        }
        
        const player = LocalStorage.getCurrentPlayer();
        if (!player) return;
        
        // Check if player rank is SS or SSS
        const rank = player.hunterRank || 'E';
        if (rank !== 'SS' && rank !== 'SSS') {
            alert('⚠️ Affinität-Cap Bonus ist nur für SS/SSS-Rang verfügbar!');
            return;
        }
        
        LocalStorage.updateCurrentPlayer({ affinityCapBonus: bonus });
        
        const baseCap = this.getBaseAffinityCap(rank);
        const totalCap = baseCap + bonus;
        
        alert(`✅ Affinität-Cap auf ${totalCap} aktualisiert! (Basis: ${baseCap} + Bonus: ${bonus})`);
        this.loadPlayerRankInfo();
    }

    // ==================== GATES MANAGEMENT ====================

    async spawnGates(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3001/api/gates/admin/spawn', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                alert(`✅ ${data.spawned} Gates erfolgreich gespawnt!`);
                this.loadGatesStats();
            } else {
                alert('❌ Fehler beim Spawnen der Gates');
            }
        } catch (error) {
            console.error('Error spawning gates:', error);
            alert('❌ Fehler beim Spawnen der Gates');
        }
    }

    async loadGatesStats(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3001/api/gates/admin/stats', {
                credentials: 'include'
            });

            const data = await response.json();
            const statsEl = document.getElementById('gates-stats');
            
            if (statsEl && data.stats) {
                let html = `<div style="color: #64c8ff; margin-bottom: 10px;"><strong>📊 Gesamt: ${data.total} Gates</strong></div>`;
                
                data.stats.forEach((stat: any) => {
                    const statusEmoji = stat.status === 'active' ? '🟢' : 
                                       stat.status === 'expired' ? '⚫' :
                                       stat.status === 'cleared' ? '✅' : '⏳';
                    html += `<div style="color: rgba(255,255,255,0.8); margin: 5px 0;">
                        ${statusEmoji} ${stat.status}: <strong>${stat.count}</strong>
                    </div>`;
                });
                
                statsEl.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading gates stats:', error);
            const statsEl = document.getElementById('gates-stats');
            if (statsEl) {
                statsEl.innerHTML = '<div style="color: #dc3545;">❌ Fehler beim Laden der Statistiken</div>';
            }
        }
    }
}

// Global Instance
const adminUI = new AdminUI();
(window as any).adminUI = adminUI;

// Update chat stats every 5 seconds if on chat tab
setInterval(() => {
    const chatPanel = document.getElementById('panel-chat');
    if (chatPanel && chatPanel.classList.contains('active')) {
        adminUI['updateChatStats']();
    }
}, 5000);
