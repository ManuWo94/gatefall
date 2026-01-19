/**
 * SYSTEM UI - Main Application Controller
 * Handles authentication, panel navigation, and game state
 */
import { CombatEngine } from './combat/engine.js';
import { getPlayerTitle } from './combat/types.js';
import { GatesUIManager } from './gates-ui.js';
// ==================== AUTH API ====================
class AuthAPI {
    static async register(email, password, displayName, role) {
        const response = await fetch(`${this.baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password, displayName, role })
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
        // ========== GUILDS PANEL ==========
        this.currentSquad = [];
        this.currentGuildData = null;
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
        const regRoleInput = document.getElementById('register-role');
        registerBtn?.addEventListener('click', async () => {
            const email = regEmailInput?.value.trim();
            const password = regPasswordInput?.value;
            const displayName = regDisplayNameInput?.value.trim();
            const role = regRoleInput?.value;
            if (!email || !password || !displayName || !role) {
                this.showError('register-error', 'Bitte alle Felder ausfüllen');
                return;
            }
            try {
                registerBtn.textContent = 'Lädt...';
                registerBtn.setAttribute('disabled', 'true');
                await AuthAPI.register(email, password, displayName, role);
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
        const titleEl = document.getElementById('dash-title');
        const role = profile.progression.role || 'waechter';
        const level = profile.progression.level || 1;
        const rank = profile.progression.hunterRank || 'D';
        const title = getPlayerTitle(level, rank, role);
        if (rankEl)
            rankEl.textContent = rank;
        if (levelEl)
            levelEl.textContent = level;
        if (guildEl)
            guildEl.textContent = profile.progression.guildName || 'KEINE';
        if (titleEl)
            titleEl.textContent = title;
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
        // Setup combat controls
        this.setupCombatControls();
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
    async loadGatesPanel() {
        const level = this.currentProfile?.progression?.level || 1;
        const rank = this.currentProfile?.progression?.hunterRank || 'D';
        await this.gatesUI.init(level, rank);
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
    async loadGuildsPanel() {
        try {
            const data = await AuthAPI.getGuilds();
            // Cache guild data globally
            window.cachedGuilds = data;
            // Find current guild
            let currentGuild = data.npcGuilds?.find((g) => g.id === this.currentProfile?.progression?.guildId);
            if (!currentGuild) {
                currentGuild = data.playerGuilds?.find((g) => g.id === this.currentProfile?.progression?.guildId);
            }
            this.currentGuildData = currentGuild;
            // Update banner
            this.updateGuildBanner(currentGuild);
            // Render NPCs if in a guild
            this.renderGuildNPCs(currentGuild);
            // Setup buttons FIRST (before rendering)
            this.setupGuildButtons();
            // Render guilds in grid (after event delegation is set)
            this.renderGuildGrid(data.npcGuilds, data.playerGuilds, data.availableNpcGuilds);
            // Setup squad system
            this.setupSquadSystem();
            // Update squad display
            this.updateSquadDisplay();
        }
        catch (error) {
            console.error('Failed to load guilds:', error);
        }
    }
    updateGuildBanner(guild) {
        const bannerName = document.getElementById('guild-banner-name');
        const leaveBtn = document.getElementById('btn-leave-guild');
        if (bannerName) {
            bannerName.textContent = guild ? guild.name : 'KEINE VEREINIGUNG';
        }
        if (leaveBtn) {
            leaveBtn.style.display = guild ? 'inline-flex' : 'none';
        }
    }
    renderGuildGrid(npcGuilds, playerGuilds, availableIds) {
        const grid = document.getElementById('guilds-grid');
        const countEl = document.getElementById('guild-count');
        console.log('🏛️ renderGuildGrid called:', {
            npcGuilds: npcGuilds?.length,
            playerGuilds: playerGuilds?.length,
            availableIds: availableIds?.length,
            gridElement: !!grid
        });
        if (!grid) {
            console.error('❌ guilds-grid element not found!');
            return;
        }
        // Start with NPC guilds (official tab active by default)
        let currentGuilds = npcGuilds;
        const renderGuilds = (guilds, isNpc = true) => {
            console.log(`🎨 Rendering ${isNpc ? 'NPC' : 'Player'} guilds:`, guilds?.length);
            grid.innerHTML = '';
            if (!guilds || guilds.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);">Keine Vereinigungen verfügbar</div>';
                if (countEl)
                    countEl.textContent = '0';
                return;
            }
            guilds.forEach(guild => {
                const isAvailable = isNpc ? availableIds.includes(guild.id) : true;
                const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
                const card = document.createElement('div');
                card.className = `guild-portal-card ${isCurrent ? 'current' : ''} ${!isAvailable ? 'locked' : ''}`;
                const minRank = guild.minimumHunterRank || guild.minimum_hunter_rank || 'D';
                const goldBonus = guild.goldBonus || guild.gold_bonus || 0.10;
                card.innerHTML = `
          <div class="guild-card-header">
            <div class="guild-card-rank">MIN. ${minRank}</div>
          </div>
          <div class="guild-card-icon">🏛️</div>
          <div class="guild-card-name">${guild.name}</div>
          <div class="guild-card-desc">${guild.description}</div>
          <div class="guild-card-bonus">+${Math.round(goldBonus * 100)}% GOLDMÜNZEN</div>
          ${!isCurrent && isAvailable ?
                    `<button class="guild-apply-btn" data-guild-id="${guild.id}">${isNpc ? 'BEWERBEN' : 'BEITRETEN'}</button>` :
                    isCurrent ? '<div style="color: #10b981; font-weight: 700; text-align: center;">✓ AKTIVE VEREINIGUNG</div>' :
                        '<div style="color: rgba(255,255,255,0.5); text-align: center;">GESPERRT</div>'}
        `;
                grid.appendChild(card);
            });
            if (countEl) {
                countEl.textContent = guilds.length.toString();
            }
        };
        // Initial render
        renderGuilds(npcGuilds, true);
        // Tab switching
        const tabs = document.querySelectorAll('[data-guild-tab]');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.getAttribute('data-guild-tab');
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // Render appropriate guilds
                if (tabType === 'official') {
                    renderGuilds(npcGuilds, true);
                }
                else {
                    renderGuilds(playerGuilds, false);
                }
            });
        });
    }
    setupGuildButtons() {
        // Leave button
        const leaveBtn = document.getElementById('btn-leave-guild');
        if (leaveBtn) {
            const newLeaveBtn = leaveBtn.cloneNode(true);
            leaveBtn.parentNode?.replaceChild(newLeaveBtn, leaveBtn);
            newLeaveBtn.addEventListener('click', async () => {
                try {
                    await AuthAPI.leaveGuild();
                    await this.loadProfile();
                    await this.loadGuildsPanel();
                    this.showGuildModal('✅ Verlassen', 'Du hast die Vereinigung verlassen.', true);
                }
                catch (error) {
                    this.showGuildModal('❌ Fehler', error.message, false);
                }
            });
        }
        // Create button - öffnet Modal
        const createBtn = document.getElementById('btn-create-guild');
        if (createBtn) {
            const newCreateBtn = createBtn.cloneNode(true);
            createBtn.parentNode?.replaceChild(newCreateBtn, createBtn);
            newCreateBtn.addEventListener('click', () => {
                this.showGuildCreationModal();
            });
        }
        // Guild Creation Modal Buttons
        const confirmCreateBtn = document.getElementById('btn-confirm-create-guild');
        const cancelCreateBtn = document.getElementById('btn-cancel-create-guild');
        if (confirmCreateBtn) {
            confirmCreateBtn.addEventListener('click', () => {
                this.confirmGuildCreation();
            });
        }
        if (cancelCreateBtn) {
            cancelCreateBtn.addEventListener('click', () => {
                this.closeGuildCreationModal();
            });
        }
        // Guild cards - Event Delegation auf Grid (OHNE cloneNode!)
        const grid = document.getElementById('guilds-grid');
        if (grid) {
            // Remove old event listeners by setting a flag
            if (grid._hasGuildClickListener) {
                return; // Already set up
            }
            grid._hasGuildClickListener = true;
            grid.addEventListener('click', async (e) => {
                const target = e.target;
                const btn = target.closest('.guild-apply-btn');
                if (btn) {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('🎯 BEWERBEN clicked!', btn);
                    const guildId = btn.getAttribute('data-guild-id');
                    console.log('Guild ID:', guildId);
                    if (!guildId)
                        return;
                    try {
                        const result = await AuthAPI.applyGuild(guildId);
                        if (result.accepted) {
                            await this.loadProfile();
                            await this.loadGuildsPanel();
                            this.showGuildModal('✅ ANGENOMMEN!', result.message, true);
                        }
                        else {
                            this.showGuildModal('❌ ABGELEHNT', result.message, false);
                        }
                    }
                    catch (error) {
                        this.showGuildModal('❌ Fehler', error.message, false);
                    }
                }
            });
        }
    }
    renderGuildNPCs(guild) {
        const container = document.getElementById('guild-npc-grid');
        const section = document.getElementById('guild-npcs-section');
        const npcCount = document.getElementById('npc-count');
        if (!container || !section) {
            console.warn('NPC grid or section not found');
            return;
        }
        if (!guild?.npcs) {
            section.style.display = 'none';
            return;
        }
        // Show section and render NPCs
        section.style.display = 'block';
        // Event delegation VOR innerHTML - nur einmal setzen
        if (!container._hasRecruitListener) {
            container._hasRecruitListener = true;
            container.addEventListener('click', (e) => {
                const target = e.target;
                const btn = target.closest('.recruit-btn');
                if (btn) {
                    e.stopPropagation();
                    e.preventDefault();
                    const npcId = btn.getAttribute('data-npc-id');
                    const currentGuild = this.currentGuildData;
                    if (npcId && currentGuild?.npcs) {
                        const npc = currentGuild.npcs.find((n) => n.id === npcId);
                        if (npc) {
                            this.recruitToSquad(npc);
                        }
                    }
                }
            });
        }
        container.innerHTML = '';
        const roleNames = {
            'waechter': 'Wächter',
            'jaeger': 'Jäger',
            'magier': 'Magier',
            'heiler': 'Heiler'
        };
        guild.npcs.forEach((npc) => {
            const card = document.createElement('div');
            card.className = 'npc-portal-card';
            const isInSquad = this.currentSquad.some(m => m.id === npc.id);
            const canRecruit = this.currentSquad.length < 4 && !isInSquad;
            const roleName = roleNames[npc.role] || npc.role || 'Hunter';
            card.innerHTML = `
        <div class="npc-rank-badge rank-${npc.rank.toLowerCase()}">${npc.rank}</div>
        <div class="npc-avatar">👤</div>
        <div class="npc-name">${npc.name}</div>
        <div class="npc-role">${roleName}</div>
        <div class="npc-level">LEVEL ${npc.level}</div>
        ${canRecruit ? `<button class="system-btn primary recruit-btn" data-npc-id="${npc.id}">REKRUTIEREN</button>` : ''}
        ${isInSquad ? '<div class="npc-status">IM TRUPP</div>' : ''}
      `;
            container.appendChild(card);
        });
        if (npcCount) {
            npcCount.textContent = guild.npcs.length.toString();
        }
    }
    recruitToSquad(npc) {
        if (this.currentSquad.length >= 4) {
            this.showGuildModal('❌ Trupp voll', 'Dein Trupp kann maximal 4 Mitglieder haben.', false);
            return;
        }
        if (this.currentSquad.some(m => m.id === npc.id)) {
            this.showGuildModal('❌ Bereits im Trupp', 'Dieses Mitglied ist bereits im Trupp.', false);
            return;
        }
        this.currentSquad.push({
            id: npc.id,
            name: npc.name,
            rank: npc.rank,
            level: npc.level,
            isNPC: true
        });
        this.updateSquadDisplay();
        this.renderGuildNPCs(this.currentGuildData);
        this.showGuildModal('✅ Rekrutiert!', `${npc.name} wurde dem Trupp hinzugefügt.`, true);
    }
    updateSquadDisplay() {
        const container = document.getElementById('squad-grid-display');
        const counter = document.getElementById('squad-counter');
        if (!container) {
            console.warn('Squad display container not found');
            return;
        }
        container.innerHTML = '';
        if (this.currentSquad.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">Kein Trupp-Mitglied ausgewählt</div>';
            if (counter)
                counter.textContent = '0/4 MITGLIEDER';
            return;
        }
        if (counter) {
            counter.textContent = `${this.currentSquad.length}/4 MITGLIEDER`;
        }
        this.currentSquad.forEach((member, index) => {
            const card = document.createElement('div');
            card.className = 'squad-member-card';
            const roleNames = {
                'waechter': 'Wächter',
                'jaeger': 'Jäger',
                'magier': 'Magier',
                'heiler': 'Heiler'
            };
            const roleName = roleNames[member.role] || member.role || 'Hunter';
            card.innerHTML = `
        <div class="squad-rank-badge rank-${member.rank.toLowerCase()}">${member.rank}</div>
        <div class="squad-avatar">${member.isNPC ? '👤' : '👨‍🎤'}</div>
        <div class="squad-name">${member.name}</div>
        <div class="squad-role">${roleName}</div>
        <div class="squad-level">LEVEL ${member.level}</div>
        <button class="system-btn danger remove-btn" data-index="${index}">ENTFERNEN</button>
      `;
            container.appendChild(card);
        });
        // Event delegation OHNE cloneNode
        if (!container._hasRemoveListener) {
            container._hasRemoveListener = true;
            container.addEventListener('click', (e) => {
                const target = e.target;
                const btn = target.closest('.remove-btn');
                if (btn) {
                    const indexStr = btn.getAttribute('data-index');
                    if (indexStr !== null) {
                        const index = parseInt(indexStr);
                        const removed = this.currentSquad.splice(index, 1)[0];
                        this.updateSquadDisplay();
                        this.renderGuildNPCs(this.currentGuildData);
                        this.showGuildModal('✅ Entfernt', `${removed.name} wurde aus dem Trupp entfernt.`, true);
                    }
                }
            });
        }
    }
    async createGuildAsync(name, description, minRank) {
        try {
            const result = await AuthAPI.createGuild(name, description, minRank);
            await this.loadProfile();
            await this.loadGuildsPanel();
            this.showGuildModal('✅ VEREINIGUNG GEGRÜNDET!', result.message, true);
        }
        catch (error) {
            this.showGuildModal('❌ Fehler', error.message, false);
        }
    }
    // ========== GUILD CREATION MODAL ==========
    showGuildCreationModal() {
        // Prüfe SS-Rang Voraussetzung
        const hunterRank = this.currentProfile?.progression?.hunterRank || 'D';
        if (hunterRank !== 'SS') {
            this.showGuildModal('❌ VORAUSSETZUNGEN NICHT ERFÜLLT', `Du benötigst mindestens Rang SS, um eine Vereinigung zu gründen. Dein aktueller Rang: ${hunterRank}`, false);
            return;
        }
        const modal = document.getElementById('guild-creation-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    closeGuildCreationModal() {
        const modal = document.getElementById('guild-creation-modal');
        if (modal) {
            modal.style.display = 'none';
            // Clear inputs
            const nameInput = document.getElementById('guild-name-input');
            const descInput = document.getElementById('guild-desc-input');
            const rankInput = document.getElementById('guild-rank-input');
            if (nameInput)
                nameInput.value = '';
            if (descInput)
                descInput.value = '';
            if (rankInput)
                rankInput.value = 'SS';
        }
    }
    async confirmGuildCreation() {
        const nameInput = document.getElementById('guild-name-input');
        const descInput = document.getElementById('guild-desc-input');
        const rankInput = document.getElementById('guild-rank-input');
        const name = nameInput?.value.trim();
        const description = descInput?.value.trim();
        const minRank = rankInput?.value;
        // Validierung
        if (!name || name.length < 3) {
            this.showGuildModal('❌ Fehler', 'Der Name muss mindestens 3 Zeichen lang sein.', false);
            return;
        }
        if (!description || description.length < 10) {
            this.showGuildModal('❌ Fehler', 'Die Beschreibung muss mindestens 10 Zeichen lang sein.', false);
            return;
        }
        // Prüfe Goldmünzen
        const currentGold = this.currentProfile?.progression?.gold || 0;
        const cost = 1000000;
        if (currentGold < cost) {
            this.showGuildModal('❌ NICHT GENUG GOLDMÜNZEN', `Du benötigst ${cost.toLocaleString('de-DE')} Goldmünzen. Du hast: ${currentGold.toLocaleString('de-DE')}`, false);
            return;
        }
        this.closeGuildCreationModal();
        await this.createGuildAsync(name, description, minRank);
    }
    // ========== GUILD MODAL ==========
    showGuildModal(title, message, accepted) {
        const modal = document.getElementById('guild-application-modal');
        const modalTitle = document.getElementById('guild-modal-title');
        const modalIcon = document.getElementById('guild-modal-icon');
        const modalStatus = document.getElementById('guild-modal-status');
        const modalText = document.getElementById('guild-modal-text');
        const closeBtn = document.getElementById('btn-close-guild-modal');
        if (!modal || !modalTitle || !modalIcon || !modalStatus || !modalText)
            return;
        // Set content
        modalTitle.textContent = title.includes('VEREINIGUNG') ? 'VEREINIGUNG' : 'BEWERBUNG';
        modalStatus.textContent = title;
        modalText.textContent = message;
        // Set icon and classes
        if (accepted) {
            modalIcon.textContent = '✅';
            modalIcon.className = 'guild-modal-icon accepted';
            modalStatus.className = 'guild-modal-status accepted';
        }
        else {
            modalIcon.textContent = '❌';
            modalIcon.className = 'guild-modal-icon rejected';
            modalStatus.className = 'guild-modal-status rejected';
        }
        // Show modal
        modal.style.display = 'flex';
        // Close handler
        const closeHandler = () => {
            modal.style.display = 'none';
            closeBtn?.removeEventListener('click', closeHandler);
            modal?.removeEventListener('click', outsideClickHandler);
        };
        const outsideClickHandler = (e) => {
            if (e.target === modal) {
                closeHandler();
            }
        };
        closeBtn?.addEventListener('click', closeHandler);
        modal?.addEventListener('click', outsideClickHandler);
    }
    // ========== NPC & SQUAD SYSTEM ==========
    setupSquadSystem() {
        // Initialize - UI components handled in updateSquadDisplay
    }
    getCurrentGuild() {
        const guildId = this.currentProfile?.progression?.guildId;
        if (!guildId)
            return null;
        // Check in NPC guilds (from guilds.js)
        const guilds = window.cachedGuilds;
        if (guilds) {
            return guilds.npcGuilds?.find((g) => g.id === guildId) ||
                guilds.playerGuilds?.find((g) => g.id === guildId);
        }
        return null;
    }
    // ========== SKILLS PANEL ==========
    loadSkillsPanel() {
        // TODO: Implement skills panel rendering
        this.logSystem('Skills panel - Coming soon');
    }
    // ========== COMBAT CONTROLS ==========
    setupCombatControls() {
        const startBtn = document.getElementById('btn-start-combat');
        const stopBtn = document.getElementById('btn-stop-combat');
        startBtn?.addEventListener('click', () => {
            // Start combat
            this.engine.startCombat();
            if (startBtn)
                startBtn.style.display = 'none';
            if (stopBtn)
                stopBtn.style.display = 'block';
            this.logSystem('Kampf gestartet!');
        });
        stopBtn?.addEventListener('click', () => {
            // Reset combat state  
            const state = this.engine.getState();
            state.isRunning = false;
            if (startBtn)
                startBtn.style.display = 'block';
            if (stopBtn)
                stopBtn.style.display = 'none';
            this.logSystem('Kampf beendet');
        });
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
window.mainApp = systemUI; // Für Combat-System Zugriff
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
// ==================== NEUES KAMPFSYSTEM TEST ====================
// Debug: Test-Button für Combat-System
window.startTestCombat = () => {
    import('./combat/combat-init.js').then(({ startTestCombat }) => {
        startTestCombat();
    });
};
console.log('💡 Tipp: Nutze startTestCombat() in der Console um das neue Kampfsystem zu testen!');
//# sourceMappingURL=main.js.map