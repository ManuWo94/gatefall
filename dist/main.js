/**
 * SYSTEM UI - Main Application Controller
 * Handles authentication, panel navigation, and game state
 */
import { CombatEngine } from './combat/engine.js';
import { getPlayerTitle } from './combat/types.js';
import { GatesUIManager } from './gates-ui.js';
// ==================== AUTH API ====================
class AuthAPI {
    static async register(email, password, displayName) {
        const response = await fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, displayName })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registrierung fehlgeschlagen');
        }
        return response.json();
    }
    static async login(email, password) {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login fehlgeschlagen');
        }
        return response.json();
    }
    static async logout() {
        const response = await fetch(`${this.baseUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Logout fehlgeschlagen');
        }
        return response.json();
    }
    static async getProfile() {
        const response = await fetch(`${this.baseUrl}/profile`, {
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Profil laden fehlgeschlagen');
        }
        return response.json();
    }
    static async saveProgression(level, xp, gold) {
        const response = await fetch(`${this.baseUrl}/progression/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ level, xp, gold })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Speichern fehlgeschlagen');
        }
        return response.json();
    }
    static async completeAwakening() {
        const response = await fetch('/api/awakening/complete', {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erwachen fehlgeschlagen');
        }
        return response.json();
    }
    static async getGuilds() {
        const response = await fetch(`${this.baseUrl}/profile/guilds`, {
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Gilden laden fehlgeschlagen');
        }
        return response.json();
    }
    static async joinGuild(guildId) {
        const response = await fetch(`${this.baseUrl}/profile/guild/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ guildId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Beitritt fehlgeschlagen');
        }
        return response.json();
    }
    static async applyGuild(guildId) {
        const response = await fetch(`${this.baseUrl}/profile/guild/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ guildId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Bewerbung fehlgeschlagen');
        }
        return response.json();
    }
    static async createGuild(name, description, minimumHunterRank) {
        const response = await fetch(`${this.baseUrl}/profile/guild/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, description, minimumHunterRank })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erstellen fehlgeschlagen');
        }
        return response.json();
    }
    static async leaveGuild() {
        const response = await fetch(`${this.baseUrl}/profile/guild/leave`, {
            method: 'POST',
            credentials: 'include'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Verlassen fehlgeschlagen');
        }
        return response.json();
    }
}
AuthAPI.baseUrl = '/api';
// ==================== SYSTEM UI CONTROLLER ====================
class SystemUI {
    constructor(engine) {
        this.currentProfile = null;
        this.engine = engine;
        this.gatesUI = new GatesUIManager();
    }
    async init() {
        this.setupAuth();
        this.setupNavigation();
        await this.checkSession();
    }
    // ========== AUTHENTICATION ==========
    setupAuth() {
        // Login
        const loginBtn = document.getElementById('btn-login');
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        loginBtn?.addEventListener('click', async () => {
            const email = emailInput?.value.trim();
            const password = passwordInput?.value;
            if (!email || !password) {
                this.showError('login-error', 'Bitte alle Felder ausfüllen');
                return;
            }
            try {
                loginBtn.textContent = 'Lädt...';
                loginBtn.setAttribute('disabled', 'true');
                await AuthAPI.login(email, password);
                await this.loadProfile();
                this.showSystem();
            }
            catch (error) {
                this.showError('login-error', error.message);
            }
            finally {
                loginBtn.textContent = 'ZUGRIFF ANFORDERN';
                loginBtn.removeAttribute('disabled');
            }
        });
        // Register
        const registerBtn = document.getElementById('btn-register');
        const regEmailInput = document.getElementById('register-email');
        const regPasswordInput = document.getElementById('register-password');
        const regDisplayNameInput = document.getElementById('register-displayname');
        registerBtn?.addEventListener('click', async () => {
            const email = regEmailInput?.value.trim();
            const password = regPasswordInput?.value;
            const displayName = regDisplayNameInput?.value.trim();
            if (!email || !password || !displayName) {
                this.showError('register-error', 'Bitte alle Felder ausfüllen');
                return;
            }
            try {
                registerBtn.textContent = 'Lädt...';
                registerBtn.setAttribute('disabled', 'true');
                await AuthAPI.register(email, password, displayName);
                await AuthAPI.login(email, password);
                await this.loadProfile();
                this.showSystem();
            }
            catch (error) {
                this.showError('register-error', error.message);
            }
            finally {
                registerBtn.textContent = 'REGISTRIEREN';
                registerBtn.removeAttribute('disabled');
            }
        });
        // Tabs
        const loginTab = document.getElementById('tab-login');
        const registerTab = document.getElementById('tab-register');
        const loginForm = document.getElementById('form-login');
        const registerForm = document.getElementById('form-register');
        loginTab?.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab?.classList.remove('active');
            loginForm?.classList.add('active');
            registerForm?.classList.remove('active');
            this.clearErrors();
        });
        registerTab?.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab?.classList.remove('active');
            registerForm?.classList.add('active');
            loginForm?.classList.remove('active');
            this.clearErrors();
        });
        // Logout
        const logoutBtn = document.getElementById('btn-logout');
        logoutBtn?.addEventListener('click', async () => {
            try {
                await AuthAPI.logout();
                this.showAuth();
                this.clearForms();
            }
            catch (error) {
                alert(error.message);
            }
        });
    }
    async checkSession() {
        try {
            await this.loadProfile();
            this.showSystem();
        }
        catch (error) {
            this.showAuth();
        }
    }
    async loadProfile() {
        const profile = await AuthAPI.getProfile();
        this.currentProfile = profile;
        // Update user display
        const userDisplayName = document.getElementById('user-display-name');
        if (userDisplayName) {
            userDisplayName.textContent = profile.displayName.toUpperCase();
        }
        // Update dashboard
        this.updateDashboard(profile);
        // Update status panel
        this.updateStatusPanel(profile);
        // Load guild bonus
        if (profile.progression.guildId) {
            const guilds = await AuthAPI.getGuilds();
            const currentGuild = guilds.npcGuilds?.find((g) => g.id === profile.progression.guildId)
                || guilds.playerGuilds?.find((g) => g.id === profile.progression.guildId);
            if (currentGuild) {
                window.gameState.guildGoldBonus = currentGuild.goldBonus || currentGuild.gold_bonus || 0;
            }
        }
        else {
            window.gameState.guildGoldBonus = 0;
        }
        // Sync with combat engine
        const state = this.engine.getState();
        state.progression.level = profile.progression.level;
        state.progression.xp = profile.progression.xp;
        state.progression.gold = profile.progression.gold;
    }
    updateDashboard(profile) {
        const rankEl = document.getElementById('dash-hunter-rank');
        const levelEl = document.getElementById('dash-level');
        const guildEl = document.getElementById('dash-guild');
        if (rankEl)
            rankEl.textContent = profile.progression.hunterRank || 'D';
        if (levelEl)
            levelEl.textContent = profile.progression.level;
        if (guildEl)
            guildEl.textContent = profile.progression.guildName || 'KEINE';
    }
    updateStatusPanel(profile) {
        const levelEl = document.getElementById('status-level');
        const rankEl = document.getElementById('status-rank');
        // Titel basierend auf Level und Rolle
        const role = profile.progression.role || 'waechter';
        const level = profile.progression.level || 1;
        const rank = profile.progression.hunterRank || 'D';
        const title = getPlayerTitle(level, rank, role);
        if (levelEl)
            levelEl.textContent = `${level}`;
        if (rankEl)
            rankEl.textContent = title;
    }
    showSystem() {
        const authScreen = document.getElementById('auth-screen');
        const systemInterface = document.getElementById('system-interface');
        if (authScreen)
            authScreen.style.display = 'none';
        if (systemInterface)
            systemInterface.style.display = 'flex';
    }
    showAuth() {
        const authScreen = document.getElementById('auth-screen');
        const systemInterface = document.getElementById('system-interface');
        if (authScreen)
            authScreen.style.display = 'flex';
        if (systemInterface)
            systemInterface.style.display = 'none';
    }
    showError(elementId, message) {
        const errorDiv = document.getElementById(elementId);
        if (errorDiv)
            errorDiv.textContent = message;
    }
    clearErrors() {
        ['login-error', 'register-error'].forEach(id => {
            const errorDiv = document.getElementById(id);
            if (errorDiv)
                errorDiv.textContent = '';
        });
    }
    clearForms() {
        ['login-email', 'login-password', 'register-email', 'register-password', 'register-displayname'].forEach(id => {
            const input = document.getElementById(id);
            if (input)
                input.value = '';
        });
        this.clearErrors();
    }
    // ========== NAVIGATION ==========
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-panel]');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const panelId = item.getAttribute('data-panel');
                if (panelId) {
                    this.switchPanel(panelId);
                    // Update nav active state
                    navItems.forEach(nav => nav.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });
        // Setup quick actions
        this.setupQuickActions();
    }
    switchPanel(panelId) {
        const panels = document.querySelectorAll('.panel');
        panels.forEach(panel => panel.classList.remove('active'));
        const targetPanel = document.getElementById(`panel-${panelId}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
            // Load panel data
            switch (panelId) {
                case 'vereinigung':
                    this.loadGuildsPanel();
                    break;
                case 'skills':
                    this.loadSkillsPanel();
                    break;
                case 'gates':
                    this.loadGatesPanel();
                    break;
            }
        }
    }
    // ========== GATES PANEL ==========
    loadGatesPanel() {
        const level = this.currentProfile?.progression?.level || 1;
        const rank = this.currentProfile?.progression?.hunterRank || 'D';
        this.gatesUI.init(level, rank);
    }
    setupQuickActions() {
        const actions = document.querySelectorAll('[data-action]');
        actions.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                switch (action) {
                    case 'enter-gate':
                        this.switchToPanel('gates');
                        break;
                    case 'start-dungeon':
                        this.switchToPanel('combat');
                        break;
                    case 'manage-skills':
                        this.switchToPanel('skills');
                        break;
                }
            });
        });
    }
    switchToPanel(panelId) {
        // Update nav
        const navItems = document.querySelectorAll('.nav-item[data-panel]');
        navItems.forEach(item => {
            if (item.getAttribute('data-panel') === panelId) {
                item.classList.add('active');
                item.click();
            }
            else {
                item.classList.remove('active');
            }
        });
    }
    // ========== GUILDS PANEL ==========
    async loadGuildsPanel() {
        try {
            const data = await AuthAPI.getGuilds();
            // Update current guild
            const currentGuildName = document.getElementById('current-guild-name');
            const leaveBtn = document.getElementById('btn-leave-guild');
            let currentGuild = data.npcGuilds?.find((g) => g.id === this.currentProfile?.progression?.guildId);
            if (!currentGuild) {
                currentGuild = data.playerGuilds?.find((g) => g.id === this.currentProfile?.progression?.guildId);
            }
            if (currentGuildName) {
                currentGuildName.textContent = currentGuild ? currentGuild.name : 'KEINE VEREINIGUNG';
            }
            if (leaveBtn) {
                leaveBtn.style.display = currentGuild ? 'block' : 'none';
            }
            // Render NPC guilds
            this.renderNPCGuilds(data.npcGuilds, data.availableNpcGuilds);
            // Render player guilds
            this.renderPlayerGuilds(data.playerGuilds);
            // Setup buttons
            this.setupGuildButtons();
        }
        catch (error) {
            console.error('Failed to load guilds:', error);
        }
    }
    renderNPCGuilds(guilds, availableIds) {
        const list = document.getElementById('npc-guild-list');
        if (!list)
            return;
        list.innerHTML = '';
        guilds.forEach(guild => {
            const isAvailable = availableIds.includes(guild.id);
            const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
            const item = document.createElement('div');
            item.className = 'guild-item';
            if (!isAvailable)
                item.classList.add('locked');
            if (isCurrent)
                item.classList.add('current');
            item.innerHTML = `
        <div class="guild-item-info">
          <div class="guild-item-name">${guild.name}</div>
          <div class="guild-item-desc">${guild.description}</div>
          <div class="guild-item-meta">MIN. ${guild.minimumHunterRank} · +${Math.round(guild.goldBonus * 100)}% GOLD</div>
        </div>
        <div class="guild-item-actions">
          ${!isCurrent && isAvailable ? `<button class="system-btn secondary guild-apply-btn" data-guild-id="${guild.id}">BEWERBEN</button>` : ''}
          ${!isAvailable ? '<span style="color: var(--text-dim);">GESPERRT</span>' : ''}
          ${isCurrent ? '<span style="color: var(--accent-primary);">AKTIV</span>' : ''}
        </div>
      `;
            list.appendChild(item);
        });
    }
    renderPlayerGuilds(guilds) {
        const list = document.getElementById('player-guild-list');
        if (!list)
            return;
        list.innerHTML = '';
        if (!guilds || guilds.length === 0) {
            list.innerHTML = '<div class="log-entry">Keine Spieler-Vereinigungen verfügbar</div>';
            return;
        }
        guilds.forEach(guild => {
            const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
            const item = document.createElement('div');
            item.className = 'guild-item';
            if (isCurrent)
                item.classList.add('current');
            const goldBonus = guild.gold_bonus || 0.10;
            item.innerHTML = `
        <div class="guild-item-info">
          <div class="guild-item-name">${guild.name}</div>
          <div class="guild-item-desc">${guild.description}</div>
          <div class="guild-item-meta">GRÜNDER: ${guild.owner_name} · MIN. ${guild.minimum_hunter_rank} · +${Math.round(goldBonus * 100)}% GOLD</div>
        </div>
        <div class="guild-item-actions">
          ${!isCurrent ? `<button class="system-btn secondary guild-join-btn" data-guild-id="${guild.id}">BEITRETEN</button>` : ''}
          ${isCurrent ? '<span style="color: var(--accent-primary);">AKTIV</span>' : ''}
        </div>
      `;
            list.appendChild(item);
        });
    }
    setupGuildButtons() {
        // Leave button
        const leaveBtn = document.getElementById('btn-leave-guild');
        leaveBtn?.addEventListener('click', async () => {
            try {
                await AuthAPI.leaveGuild();
                await this.loadProfile();
                await this.loadGuildsPanel();
                this.logSystem('Vereinigung verlassen');
            }
            catch (error) {
                alert(error.message);
            }
        });
        // Create button
        const createBtn = document.getElementById('btn-create-guild');
        createBtn?.addEventListener('click', () => {
            const name = prompt('Name der Vereinigung:');
            if (!name)
                return;
            const description = prompt('Beschreibung:');
            if (!description)
                return;
            const minRank = prompt('Mindest-Hunter-Rang (D/C/B/A/S/SS):', 'D');
            if (!minRank)
                return;
            const validRanks = ['D', 'C', 'B', 'A', 'S', 'SS'];
            if (!validRanks.includes(minRank.toUpperCase())) {
                alert('Ungültiger Rang!');
                return;
            }
            this.createGuildAsync(name, description, minRank.toUpperCase());
        });
        // Apply buttons (NPC)
        document.querySelectorAll('.guild-apply-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const guildId = e.target.getAttribute('data-guild-id');
                if (!guildId)
                    return;
                try {
                    const result = await AuthAPI.applyGuild(guildId);
                    if (result.accepted) {
                        await this.loadProfile();
                        await this.loadGuildsPanel();
                        this.logSystem(`✅ ${result.message}`);
                    }
                    else {
                        this.logSystem(`❌ ${result.message}`);
                    }
                }
                catch (error) {
                    alert(error.message);
                }
            });
        });
        // Join buttons (Player)
        document.querySelectorAll('.guild-join-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const guildId = e.target.getAttribute('data-guild-id');
                if (!guildId)
                    return;
                try {
                    await AuthAPI.joinGuild(guildId);
                    await this.loadProfile();
                    await this.loadGuildsPanel();
                    this.logSystem('Vereinigung beigetreten');
                }
                catch (error) {
                    alert(error.message);
                }
            });
        });
    }
    async createGuildAsync(name, description, minRank) {
        try {
            const result = await AuthAPI.createGuild(name, description, minRank);
            await this.loadProfile();
            await this.loadGuildsPanel();
            this.logSystem(`✅ ${result.message}`);
        }
        catch (error) {
            alert(error.message);
        }
    }
    // ========== SKILLS PANEL ==========
    loadSkillsPanel() {
        // TODO: Implement skills panel rendering
        this.logSystem('Skills panel - Coming soon');
    }
    // ========== LOGGING ==========
    logSystem(message) {
        const dashLog = document.getElementById('dashboard-log');
        if (dashLog) {
            const entry = document.createElement('div');
            entry.className = 'log-entry system';
            entry.textContent = message;
            dashLog.prepend(entry);
            // Keep only last 10 entries
            while (dashLog.children.length > 10) {
                dashLog.removeChild(dashLog.lastChild);
            }
        }
    }
}
// ==================== INITIALIZE ====================
const engine = new CombatEngine();
const systemUI = new SystemUI(engine);
// Make globally accessible
window.engine = engine;
window.systemUI = systemUI;
// Global game state
window.gameState = {
    level: 1,
    xp: 0,
    gold: 0,
    guildGoldBonus: 0,
    updateUI: () => {
        const state = engine.getState();
        state.progression.level = window.gameState.level;
        state.progression.xp = window.gameState.xp;
        state.progression.gold = window.gameState.gold;
        state.progression.guildGoldBonus = window.gameState.guildGoldBonus;
    }
};
// Initialize app
systemUI.init();
// Auto-save function
let saveTimeout = null;
async function saveProgressionToServer(level, xp, gold) {
    if (saveTimeout)
        clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(async () => {
        try {
            await AuthAPI.saveProgression(level, xp, gold);
            console.log('✓ Progression gespeichert');
        }
        catch (error) {
            console.error('Fehler beim Speichern:', error);
        }
    }, 1000);
}
engine.setOnStateUpdate((state) => {
    window.gameState.level = state.progression.level;
    window.gameState.xp = state.progression.xp;
    window.gameState.gold = state.progression.gold;
    saveProgressionToServer(state.progression.level, state.progression.xp, state.progression.gold);
});
console.log('🎮 SYSTEM INITIALIZED');
//# sourceMappingURL=main.js.map