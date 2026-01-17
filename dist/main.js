/**
 * Main entry point: Bootstraps the application
 */
import { CombatEngine } from './combat/engine.js';
import { UIRenderer } from './ui.js';
// Auth API
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
// Auth UI
class AuthUI {
    constructor() {
        this.currentProfile = null;
        this.awakeningAvailable = false;
    }
    async init() {
        this.setupTabs();
        this.setupLoginForm();
        this.setupRegisterForm();
        this.setupLogout();
        this.setupResendVerification();
        this.setupAwakening();
        this.setupStatusScreen();
        this.setupGuildPanel();
        await this.checkSession();
        this.checkForVerificationToken();
        this.checkDiscordLogin();
    }
    setupTabs() {
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
    }
    setupLoginForm() {
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
                this.showGame();
            }
            catch (error) {
                this.showError('login-error', error.message);
            }
            finally {
                loginBtn.textContent = 'Anmelden';
                loginBtn.removeAttribute('disabled');
            }
        });
        [emailInput, passwordInput].forEach(input => {
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter')
                    loginBtn?.click();
            });
        });
    }
    setupRegisterForm() {
        const registerBtn = document.getElementById('btn-register');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const displayNameInput = document.getElementById('register-displayname');
        registerBtn?.addEventListener('click', async () => {
            const email = emailInput?.value.trim();
            const password = passwordInput?.value;
            const displayName = displayNameInput?.value.trim();
            if (!email || !password || !displayName) {
                this.showError('register-error', 'Bitte alle Felder ausfüllen');
                return;
            }
            try {
                registerBtn.textContent = 'Lädt...';
                registerBtn.setAttribute('disabled', 'true');
                await AuthAPI.register(email, password, displayName);
                await this.loadProfile();
                this.showGame();
            }
            catch (error) {
                this.showError('register-error', error.message);
            }
            finally {
                registerBtn.textContent = 'Registrieren';
                registerBtn.removeAttribute('disabled');
            }
        });
        [emailInput, passwordInput, displayNameInput].forEach(input => {
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter')
                    registerBtn?.click();
            });
        });
    }
    setupLogout() {
        const logoutBtn = document.getElementById('btn-logout');
        logoutBtn?.addEventListener('click', async () => {
            try {
                await AuthAPI.logout();
                this.showAuth();
                this.clearForms();
            }
            catch (error) {
                console.error('Logout-Fehler:', error);
                alert('Logout fehlgeschlagen');
            }
        });
    }
    setupResendVerification() {
        const resendBtn = document.getElementById('btn-resend-verification');
        resendBtn?.addEventListener('click', async () => {
            try {
                resendBtn.setAttribute('disabled', 'true');
                resendBtn.textContent = 'Wird gesendet...';
                const response = await fetch('/api/auth/resend-verification', {
                    method: 'POST',
                    credentials: 'include'
                });
                const data = await response.json();
                const messageEl = document.getElementById('resend-message');
                if (messageEl) {
                    messageEl.textContent = data.message || data.error;
                    messageEl.classList.add('show');
                    setTimeout(() => messageEl.classList.remove('show'), 5000);
                }
                if (response.ok && data.success) {
                    // Wenn bereits bestätigt, aktualisiere Profil
                    if (data.message.includes('bereits bestätigt')) {
                        await this.loadProfile();
                        this.updateVerificationUI();
                    }
                }
            }
            catch (error) {
                alert('Fehler: ' + error.message);
            }
            finally {
                resendBtn.textContent = 'Bestätigungslink erneut senden';
                resendBtn.removeAttribute('disabled');
            }
        });
    }
    checkForVerificationToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token && window.location.pathname === '/verify-email') {
            this.verifyEmail(token);
        }
    }
    async verifyEmail(token) {
        try {
            const response = await fetch(`/api/auth/verify-email?token=${token}`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                alert('✓ ' + data.message);
                // Aktualisiere Profil und UI
                await this.loadProfile();
                this.updateVerificationUI();
                // Navigiere zur Hauptseite
                window.location.href = '/';
            }
            else {
                alert('✗ ' + data.error);
            }
        }
        catch (error) {
            alert('Fehler bei der Bestätigung: ' + error.message);
        }
    }
    checkDiscordLogin() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('discord_login')) {
            // Entferne Parameter aus URL
            window.history.replaceState({}, '', '/');
            // Lade Profil und zeige Game-Screen
            this.checkSession();
        }
        if (urlParams.has('error')) {
            const error = urlParams.get('error');
            if (error === 'discord_auth_failed') {
                alert('Discord-Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
                window.history.replaceState({}, '', '/');
            }
            else if (error === 'discord_not_configured') {
                alert('Discord-Login ist derzeit nicht verfügbar. Bitte melde dich mit E-Mail und Passwort an.');
                window.history.replaceState({}, '', '/');
            }
        }
    }
    updateVerificationUI() {
        const banner = document.getElementById('verification-banner');
        const startDungeonBtn = document.getElementById('start-dungeon');
        const startCombatBtn = document.getElementById('start-combat');
        if (this.currentProfile && !this.currentProfile.emailVerified) {
            // Zeige Banner, deaktiviere Gameplay
            if (banner)
                banner.style.display = 'block';
            if (startDungeonBtn) {
                startDungeonBtn.disabled = true;
                startDungeonBtn.title = 'E-Mail muss erst bestätigt werden';
            }
            if (startCombatBtn) {
                startCombatBtn.disabled = true;
                startCombatBtn.title = 'E-Mail muss erst bestätigt werden';
            }
        }
        else {
            // Verstecke Banner, aktiviere Gameplay
            if (banner)
                banner.style.display = 'none';
            if (startDungeonBtn) {
                startDungeonBtn.disabled = false;
                startDungeonBtn.title = '';
            }
            if (startCombatBtn) {
                startCombatBtn.disabled = false;
                startCombatBtn.title = '';
            }
        }
    }
    async checkSession() {
        try {
            const profile = await AuthAPI.getProfile();
            this.currentProfile = profile;
            if (window.gameState) {
                window.gameState.level = profile.progression.level;
                window.gameState.xp = profile.progression.xp;
                window.gameState.gold = profile.progression.gold;
            }
            const displayNameEl = document.getElementById('user-display-name');
            if (displayNameEl)
                displayNameEl.textContent = profile.displayName;
            this.showGame();
            this.updateVerificationUI();
            this.checkAwakening();
        }
        catch (error) {
            this.showAuth();
        }
    }
    async loadProfile() {
        const profile = await AuthAPI.getProfile();
        this.currentProfile = profile;
        const displayNameEl = document.getElementById('user-display-name');
        if (displayNameEl)
            displayNameEl.textContent = profile.displayName;
        if (window.gameState) {
            window.gameState.level = profile.progression.level;
            window.gameState.xp = profile.progression.xp;
            window.gameState.gold = profile.progression.gold;
            window.gameState.updateUI();
        }
        this.updateVerificationUI();
        this.checkAwakening();
    }
    showGame() {
        const authScreen = document.getElementById('auth-screen');
        const gameScreen = document.getElementById('game-screen');
        if (authScreen)
            authScreen.style.display = 'none';
        if (gameScreen)
            gameScreen.style.display = 'block';
    }
    showAuth() {
        const authScreen = document.getElementById('auth-screen');
        const gameScreen = document.getElementById('game-screen');
        if (authScreen)
            authScreen.style.display = 'flex';
        if (gameScreen)
            gameScreen.style.display = 'none';
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
    setupAwakening() {
        const awakenBtn = document.getElementById('btn-awaken');
        awakenBtn?.addEventListener('click', async () => {
            try {
                await AuthAPI.completeAwakening();
                // Hide awakening modal
                const modal = document.getElementById('awakening-modal');
                if (modal)
                    modal.style.display = 'none';
                // Log system message
                if (window.ui) {
                    window.ui.log('SYSTEM: Erwachen abgeschlossen.');
                }
                // Reload profile to get updated awakening state
                await this.loadProfile();
                // Show status screen
                this.showStatusScreen();
            }
            catch (error) {
                console.error('Awakening error:', error);
                alert('Fehler beim Erwachen: ' + error.message);
            }
        });
    }
    setupStatusScreen() {
        const closeBtn = document.getElementById('btn-close-status');
        closeBtn?.addEventListener('click', () => {
            const modal = document.getElementById('status-modal');
            if (modal)
                modal.style.display = 'none';
        });
    }
    showStatusScreen() {
        if (!this.currentProfile)
            return;
        const modal = document.getElementById('status-modal');
        if (!modal)
            return;
        // Update level
        const levelEl = document.getElementById('status-level');
        if (levelEl)
            levelEl.textContent = this.currentProfile.progression.level.toString();
        // Update Hunter-Rang
        const hunterRankEl = document.getElementById('status-hunter-rank');
        if (hunterRankEl) {
            const rank = this.currentProfile.progression.hunterRank || 'D';
            hunterRankEl.textContent = rank;
            // Color based on rank
            const rankColors = {
                'SS': '#ff0066',
                'S': '#ff6600',
                'A': '#ffcc00',
                'B': '#66ff66',
                'C': '#66ccff',
                'D': '#cccccc'
            };
            hunterRankEl.style.color = rankColors[rank] || '#cccccc';
        }
        // Update job (original role - nicht implementiert in diesem Schritt)
        const jobEl = document.getElementById('status-job');
        if (jobEl)
            jobEl.textContent = 'None';
        // Update HP/MP bars (placeholder values)
        const hpFill = document.getElementById('status-hp-fill');
        const hpValue = document.getElementById('status-hp-value');
        const mpFill = document.getElementById('status-mp-fill');
        const mpValue = document.getElementById('status-mp-value');
        // Use current combat state if available
        if (window.engine) {
            const state = window.engine.getState();
            if (hpFill)
                hpFill.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
            if (hpValue)
                hpValue.textContent = `${state.player.hp} / ${state.player.maxHp}`;
            if (mpFill)
                mpFill.style.width = `${(state.player.mp / state.player.maxMp) * 100}%`;
            if (mpValue)
                mpValue.textContent = `${state.player.mp} / ${state.player.maxMp}`;
        }
        else {
            if (hpFill)
                hpFill.style.width = '100%';
            if (hpValue)
                hpValue.textContent = '100 / 100';
            if (mpFill)
                mpFill.style.width = '100%';
            if (mpValue)
                mpValue.textContent = '50 / 50';
        }
        // Update attributes (placeholder - keine Attribute-Berechnung in diesem Schritt)
        const baseStats = { str: 10, vit: 10, agi: 10, int: 10, per: 10 };
        const level = this.currentProfile.progression.level;
        const strEl = document.getElementById('status-str');
        const vitEl = document.getElementById('status-vit');
        const agiEl = document.getElementById('status-agi');
        const intEl = document.getElementById('status-int');
        const perEl = document.getElementById('status-per');
        if (strEl)
            strEl.textContent = (baseStats.str + level * 2).toString();
        if (vitEl)
            vitEl.textContent = (baseStats.vit + level).toString();
        if (agiEl)
            agiEl.textContent = (baseStats.agi + level).toString();
        if (intEl)
            intEl.textContent = (baseStats.int + level).toString();
        if (perEl)
            perEl.textContent = (baseStats.per + level).toString();
        modal.style.display = 'flex';
    }
    checkAwakening() {
        if (!this.currentProfile)
            return;
        const awakeningState = this.currentProfile.progression.awakeningState || 'locked';
        const level = this.currentProfile.progression.level;
        // Check if awakening should be available
        if (level >= 10 && awakeningState === 'locked') {
            this.awakeningAvailable = true;
        }
        // Disable role switching if awakened
        if (awakeningState === 'awakened') {
            const roleSelect = document.getElementById('role-select');
            if (roleSelect) {
                roleSelect.disabled = true;
                roleSelect.title = 'Rollenwechsel nach Erwachen deaktiviert';
            }
        }
    }
    showAwakeningModal() {
        if (!this.awakeningAvailable)
            return;
        const modal = document.getElementById('awakening-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Log system message
            if (window.ui) {
                window.ui.log('SYSTEM: Erwachen verfügbar.');
            }
        }
    }
    setupGuildPanel() {
        const openBtn = document.getElementById('btn-open-guild');
        const closeBtn = document.getElementById('guild-close-btn');
        const panel = document.getElementById('guild-panel');
        const leaveBtn = document.getElementById('btn-leave-guild');
        if (openBtn) {
            openBtn.addEventListener('click', async () => {
                await this.loadGuilds();
                if (panel)
                    panel.style.display = 'block';
            });
        }
        if (closeBtn && panel) {
            closeBtn.addEventListener('click', () => {
                panel.style.display = 'none';
            });
        }
        if (leaveBtn) {
            leaveBtn.addEventListener('click', async () => {
                try {
                    await AuthAPI.leaveGuild();
                    await this.loadGuilds();
                    alert('Vereinigung verlassen!');
                }
                catch (error) {
                    alert(error.message);
                }
            });
        }
    }
    async loadGuilds() {
        try {
            const data = await AuthAPI.getGuilds();
            const currentGuildName = document.getElementById('current-guild-name');
            const leaveBtn = document.getElementById('btn-leave-guild');
            const guildList = document.getElementById('guild-list');
            // Aktuelle Guild anzeigen
            const currentGuild = data.guilds.find((g) => g.id === this.currentProfile?.progression?.guildId);
            if (currentGuildName) {
                currentGuildName.textContent = currentGuild ? currentGuild.name : 'Keine Vereinigung';
            }
            if (leaveBtn) {
                leaveBtn.style.display = currentGuild ? 'block' : 'none';
            }
            // Guild-Liste rendern
            if (guildList) {
                guildList.innerHTML = '';
                data.guilds.forEach((guild) => {
                    const card = document.createElement('div');
                    card.className = 'guild-card';
                    const isAvailable = data.availableGuilds.includes(guild.id);
                    const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
                    if (!isAvailable)
                        card.classList.add('guild-locked');
                    if (isCurrent)
                        card.classList.add('guild-current');
                    card.innerHTML = `
            <div class="guild-card-header">
              <span class="guild-card-name">${guild.name}</span>
              <span class="guild-card-rank">Min. ${guild.minimumHunterRank}</span>
            </div>
            <div class="guild-card-desc">${guild.description}</div>
            <div class="guild-card-bonus">+${Math.round(guild.goldBonus * 100)}% Gold</div>
            ${!isCurrent && isAvailable ? `<button class="guild-join-btn" data-guild-id="${guild.id}">Beitreten</button>` : ''}
            ${isCurrent ? '<span class="guild-current-badge">Aktuelle Vereinigung</span>' : ''}
            ${!isAvailable ? '<span class="guild-locked-badge">🔒 Gesperrt</span>' : ''}
          `;
                    guildList.appendChild(card);
                });
                // Join-Buttons
                guildList.querySelectorAll('.guild-join-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const guildId = e.target.dataset.guildId;
                        if (!guildId)
                            return;
                        try {
                            await AuthAPI.joinGuild(guildId);
                            await this.loadProfile();
                            await this.loadGuilds();
                            alert('Vereinigung beigetreten!');
                        }
                        catch (error) {
                            alert(error.message);
                        }
                    });
                });
            }
        }
        catch (error) {
            console.error('Guild load error:', error);
        }
    }
}
// Initialize combat engine and UI renderer
const engine = new CombatEngine();
const ui = new UIRenderer();
const authUI = new AuthUI();
// Make globally accessible
window.engine = engine;
window.ui = ui;
window.authUI = authUI;
// Make gameState globally accessible for auth integration
window.gameState = {
    level: 1,
    xp: 0,
    gold: 0,
    updateUI: () => {
        const state = engine.getState();
        state.progression.level = window.gameState.level;
        state.progression.xp = window.gameState.xp;
        state.progression.gold = window.gameState.gold;
        ui.updateUI(state);
    }
};
// Wire up callbacks
engine.setOnStateUpdate((state) => {
    // Sync progression to global state
    window.gameState.level = state.progression.level;
    window.gameState.xp = state.progression.xp;
    window.gameState.gold = state.progression.gold;
    ui.updateUI(state);
    // Auto-save progression to server
    saveProgressionToServer(state.progression.level, state.progression.xp, state.progression.gold);
});
engine.setOnCombatEvent((event) => {
    ui.addLogEntry(event);
});
// Register dungeon completion callback for awakening
engine.setOnDungeonComplete(() => {
    if (window.authUI) {
        window.authUI.showAwakeningModal();
    }
});
// Auto-save function with debounce
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
    }, 1000); // 1 Sekunde Debounce
}
// Initialize UI with starting state
ui.updateUI(engine.getState());
// Attach event listeners to buttons
function setupEventListeners() {
    // Role selector
    const roleSelect = document.getElementById('role-select');
    if (roleSelect) {
        roleSelect.addEventListener('change', () => {
            const selectedRole = roleSelect.value;
            engine.changeRole(selectedRole);
        });
    }
    // Start Combat button
    const startBtn = document.getElementById('start-combat');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            engine.startCombat();
        });
    }
    // Reset button
    const resetBtn = document.getElementById('reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            ui.clearLog();
            engine.reset();
        });
    }
    // Skill buttons
    for (let i = 1; i <= 3; i++) {
        const skillBtn = document.getElementById(`skill-${i}`);
        if (skillBtn) {
            skillBtn.addEventListener('click', () => {
                console.log(`Skill ${i} button clicked`);
                engine.useSkill(i);
            });
        }
    }
    // Interrupt button
    const interruptBtn = document.getElementById('interrupt-btn');
    if (interruptBtn) {
        interruptBtn.addEventListener('click', () => {
            engine.useInterrupt();
        });
    }
    // Dungeon button
    const dungeonBtn = document.getElementById('start-dungeon');
    if (dungeonBtn) {
        dungeonBtn.addEventListener('click', () => {
            ui.clearLog();
            engine.startDungeon('VERLASSENER_DUNGEON');
        });
    }
    // Dungeon enemy selection
    document.addEventListener('click', (event) => {
        const target = event.target;
        const enemyCard = target.closest('.dungeon-enemy-card.selectable');
        if (enemyCard && enemyCard.dataset.enemyId) {
            const enemyId = parseInt(enemyCard.dataset.enemyId);
            engine.selectDungeonEnemy(enemyId);
        }
    });
    // Glossar button
    const glossarBtn = document.getElementById('glossar');
    const glossarModal = document.getElementById('glossar-modal');
    const closeBtn = glossarModal?.querySelector('.close');
    if (glossarBtn && glossarModal) {
        glossarBtn.addEventListener('click', () => {
            glossarModal.style.display = 'block';
        });
    }
    if (closeBtn && glossarModal) {
        closeBtn.addEventListener('click', () => {
            glossarModal.style.display = 'none';
        });
    }
    // Close modal when clicking outside
    if (glossarModal) {
        window.addEventListener('click', (event) => {
            if (event.target === glossarModal) {
                glossarModal.style.display = 'none';
            }
        });
    }
}
// Setup immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupEventListeners();
        authUI.init();
    });
}
else {
    setupEventListeners();
    authUI.init();
}
//# sourceMappingURL=main.js.map