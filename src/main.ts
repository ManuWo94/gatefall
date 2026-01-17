/**
 * Main entry point: Bootstraps the application
 */

import { CombatEngine } from './combat/engine.js';
import { UIRenderer } from './ui.js';
import { Role } from './combat/types.js';

// Auth API
class AuthAPI {
  private static baseUrl = '/api';

  static async register(email: string, password: string, displayName: string) {
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

  static async login(email: string, password: string) {
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

  static async saveProgression(level: number, xp: number, gold: number) {
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

  static async joinGuild(guildId: string) {
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

  static async applyGuild(guildId: string) {
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

  static async createGuild(name: string, description: string, minimumHunterRank: string) {
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

// Auth UI
class AuthUI {
  private currentProfile: any = null;
  private awakeningAvailable: boolean = false;

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

  private setupTabs() {
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

  private setupLoginForm() {
    const loginBtn = document.getElementById('btn-login');
    const emailInput = document.getElementById('login-email') as HTMLInputElement;
    const passwordInput = document.getElementById('login-password') as HTMLInputElement;

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
      } catch (error: any) {
        this.showError('login-error', error.message);
      } finally {
        loginBtn.textContent = 'Anmelden';
        loginBtn.removeAttribute('disabled');
      }
    });

    [emailInput, passwordInput].forEach(input => {
      input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loginBtn?.click();
      });
    });
  }

  private setupRegisterForm() {
    const registerBtn = document.getElementById('btn-register');
    const emailInput = document.getElementById('register-email') as HTMLInputElement;
    const passwordInput = document.getElementById('register-password') as HTMLInputElement;
    const displayNameInput = document.getElementById('register-displayname') as HTMLInputElement;

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
      } catch (error: any) {
        this.showError('register-error', error.message);
      } finally {
        registerBtn.textContent = 'Registrieren';
        registerBtn.removeAttribute('disabled');
      }
    });

    [emailInput, passwordInput, displayNameInput].forEach(input => {
      input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') registerBtn?.click();
      });
    });
  }

  private setupLogout() {
    const logoutBtn = document.getElementById('btn-logout');
    logoutBtn?.addEventListener('click', async () => {
      try {
        await AuthAPI.logout();
        this.showAuth();
        this.clearForms();
      } catch (error: any) {
        console.error('Logout-Fehler:', error);
        alert('Logout fehlgeschlagen');
      }
    });
  }

  private setupResendVerification() {
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
      } catch (error: any) {
        alert('Fehler: ' + error.message);
      } finally {
        resendBtn.textContent = 'Bestätigungslink erneut senden';
        resendBtn.removeAttribute('disabled');
      }
    });
  }

  private checkForVerificationToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token && window.location.pathname === '/verify-email') {
      this.verifyEmail(token);
    }
  }

  private async verifyEmail(token: string) {
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
      } else {
        alert('✗ ' + data.error);
      }
    } catch (error: any) {
      alert('Fehler bei der Bestätigung: ' + error.message);
    }
  }

  private checkDiscordLogin() {
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
      } else if (error === 'discord_not_configured') {
        alert('Discord-Login ist derzeit nicht verfügbar. Bitte melde dich mit E-Mail und Passwort an.');
        window.history.replaceState({}, '', '/');
      }
    }
  }

  private updateVerificationUI() {
    const banner = document.getElementById('verification-banner');
    const startDungeonBtn = document.getElementById('start-dungeon') as HTMLButtonElement;
    const startCombatBtn = document.getElementById('start-combat') as HTMLButtonElement;

    if (this.currentProfile && !this.currentProfile.emailVerified) {
      // Zeige Banner, deaktiviere Gameplay
      if (banner) banner.style.display = 'block';
      if (startDungeonBtn) {
        startDungeonBtn.disabled = true;
        startDungeonBtn.title = 'E-Mail muss erst bestätigt werden';
      }
      if (startCombatBtn) {
        startCombatBtn.disabled = true;
        startCombatBtn.title = 'E-Mail muss erst bestätigt werden';
      }
    } else {
      // Verstecke Banner, aktiviere Gameplay
      if (banner) banner.style.display = 'none';
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

  private async checkSession() {
    try {
      const profile = await AuthAPI.getProfile();
      this.currentProfile = profile;
      if ((window as any).gameState) {
        (window as any).gameState.level = profile.progression.level;
        (window as any).gameState.xp = profile.progression.xp;
        (window as any).gameState.gold = profile.progression.gold;
      }
      const displayNameEl = document.getElementById('user-display-name');
      if (displayNameEl) displayNameEl.textContent = profile.displayName;
      this.showGame();
      this.updateVerificationUI();
      this.checkAwakening();
    } catch (error) {
      this.showAuth();
    }
  }

  private async loadProfile() {
    const profile = await AuthAPI.getProfile();
    this.currentProfile = profile;
    const displayNameEl = document.getElementById('user-display-name');
    if (displayNameEl) displayNameEl.textContent = profile.displayName;
    
    // Update game state with progression and guild bonus
    if ((window as any).gameState) {
      (window as any).gameState.level = profile.progression.level;
      (window as any).gameState.xp = profile.progression.xp;
      (window as any).gameState.gold = profile.progression.gold;
      
      // Load guild bonus if in a guild
      if (profile.progression.guildId) {
        const guilds = await AuthAPI.getGuilds();
        const currentGuild = guilds.npcGuilds?.find((g: any) => g.id === profile.progression.guildId) 
                          || guilds.playerGuilds?.find((g: any) => g.id === profile.progression.guildId);
        
        if (currentGuild) {
          (window as any).gameState.guildGoldBonus = currentGuild.goldBonus || currentGuild.gold_bonus || 0;
        }
      } else {
        (window as any).gameState.guildGoldBonus = 0;
      }
      
      (window as any).gameState.updateUI();
    }
    this.updateVerificationUI();
    this.checkAwakening();
  }

  private showGame() {
    const authScreen = document.getElementById('auth-screen');
    const gameScreen = document.getElementById('game-screen');
    if (authScreen) authScreen.style.display = 'none';
    if (gameScreen) gameScreen.style.display = 'block';
  }

  private showAuth() {
    const authScreen = document.getElementById('auth-screen');
    const gameScreen = document.getElementById('game-screen');
    if (authScreen) authScreen.style.display = 'flex';
    if (gameScreen) gameScreen.style.display = 'none';
  }

  private showError(elementId: string, message: string) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) errorDiv.textContent = message;
  }

  private clearErrors() {
    ['login-error', 'register-error'].forEach(id => {
      const errorDiv = document.getElementById(id);
      if (errorDiv) errorDiv.textContent = '';
    });
  }

  private clearForms() {
    ['login-email', 'login-password', 'register-email', 'register-password', 'register-displayname'].forEach(id => {
      const input = document.getElementById(id) as HTMLInputElement;
      if (input) input.value = '';
    });
    this.clearErrors();
  }

  private setupAwakening() {
    const awakenBtn = document.getElementById('btn-awaken');
    awakenBtn?.addEventListener('click', async () => {
      try {
        await AuthAPI.completeAwakening();
        
        // Hide awakening modal
        const modal = document.getElementById('awakening-modal');
        if (modal) modal.style.display = 'none';
        
        // Log system message
        if ((window as any).ui) {
          (window as any).ui.log('SYSTEM: Erwachen abgeschlossen.');
        }
        
        // Reload profile to get updated awakening state
        await this.loadProfile();
        
        // Show status screen
        this.showStatusScreen();
      } catch (error: any) {
        console.error('Awakening error:', error);
        alert('Fehler beim Erwachen: ' + error.message);
      }
    });
  }

  private setupStatusScreen() {
    const closeBtn = document.getElementById('btn-close-status');
    closeBtn?.addEventListener('click', () => {
      const modal = document.getElementById('status-modal');
      if (modal) modal.style.display = 'none';
    });
  }

  private showStatusScreen() {
    if (!this.currentProfile) return;

    const modal = document.getElementById('status-modal');
    if (!modal) return;

    // Update level
    const levelEl = document.getElementById('status-level');
    if (levelEl) levelEl.textContent = this.currentProfile.progression.level.toString();

    // Update Hunter-Rang
    const hunterRankEl = document.getElementById('status-hunter-rank');
    if (hunterRankEl) {
      const rank = this.currentProfile.progression.hunterRank || 'D';
      hunterRankEl.textContent = rank;
      // Color based on rank
      const rankColors: Record<string, string> = {
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
    if (jobEl) jobEl.textContent = 'None';

    // Update HP/MP bars (placeholder values)
    const hpFill = document.getElementById('status-hp-fill');
    const hpValue = document.getElementById('status-hp-value');
    const mpFill = document.getElementById('status-mp-fill');
    const mpValue = document.getElementById('status-mp-value');

    // Use current combat state if available
    if ((window as any).engine) {
      const state = (window as any).engine.getState();
      if (hpFill) hpFill.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
      if (hpValue) hpValue.textContent = `${state.player.hp} / ${state.player.maxHp}`;
      if (mpFill) mpFill.style.width = `${(state.player.mp / state.player.maxMp) * 100}%`;
      if (mpValue) mpValue.textContent = `${state.player.mp} / ${state.player.maxMp}`;
    } else {
      if (hpFill) hpFill.style.width = '100%';
      if (hpValue) hpValue.textContent = '100 / 100';
      if (mpFill) mpFill.style.width = '100%';
      if (mpValue) mpValue.textContent = '50 / 50';
    }

    // Update attributes (placeholder - keine Attribute-Berechnung in diesem Schritt)
    const baseStats = { str: 10, vit: 10, agi: 10, int: 10, per: 10 };
    const level = this.currentProfile.progression.level;
    
    const strEl = document.getElementById('status-str');
    const vitEl = document.getElementById('status-vit');
    const agiEl = document.getElementById('status-agi');
    const intEl = document.getElementById('status-int');
    const perEl = document.getElementById('status-per');

    if (strEl) strEl.textContent = (baseStats.str + level * 2).toString();
    if (vitEl) vitEl.textContent = (baseStats.vit + level).toString();
    if (agiEl) agiEl.textContent = (baseStats.agi + level).toString();
    if (intEl) intEl.textContent = (baseStats.int + level).toString();
    if (perEl) perEl.textContent = (baseStats.per + level).toString();

    modal.style.display = 'flex';
  }

  checkAwakening() {
    if (!this.currentProfile) return;

    const awakeningState = this.currentProfile.progression.awakeningState || 'locked';
    const level = this.currentProfile.progression.level;

    // Check if awakening should be available
    if (level >= 10 && awakeningState === 'locked') {
      this.awakeningAvailable = true;
    }

    // Disable role switching if awakened
    if (awakeningState === 'awakened') {
      const roleSelect = document.getElementById('role-select') as HTMLSelectElement;
      if (roleSelect) {
        roleSelect.disabled = true;
        roleSelect.title = 'Rollenwechsel nach Erwachen deaktiviert';
      }
    }
  }

  showAwakeningModal() {
    if (!this.awakeningAvailable) return;

    const modal = document.getElementById('awakening-modal');
    if (modal) {
      modal.style.display = 'flex';
      
      // Log system message
      if ((window as any).ui) {
        (window as any).ui.log('SYSTEM: Erwachen verfügbar.');
      }
    }
  }

  private setupGuildPanel() {
    const openBtn = document.getElementById('btn-open-guild');
    const closeBtn = document.getElementById('guild-close-btn');
    const panel = document.getElementById('guild-panel');
    const leaveBtn = document.getElementById('btn-leave-guild');

    if (openBtn) {
      openBtn.addEventListener('click', async () => {
        await this.loadGuilds();
        if (panel) panel.style.display = 'block';
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
        } catch (error: any) {
          alert(error.message);
        }
      });
    }
  }

  private async loadGuilds() {
    try {
      const data = await AuthAPI.getGuilds();
      const currentGuildName = document.getElementById('current-guild-name');
      const leaveBtn = document.getElementById('btn-leave-guild');
      const guildList = document.getElementById('guild-list');

      // Aktuelle Guild anzeigen (NPC oder Player)
      let currentGuild = data.npcGuilds?.find((g: any) => g.id === this.currentProfile?.progression?.guildId);
      if (!currentGuild) {
        currentGuild = data.playerGuilds?.find((g: any) => g.id === this.currentProfile?.progression?.guildId);
      }
      
      if (currentGuildName) {
        currentGuildName.textContent = currentGuild ? currentGuild.name : 'Keine Vereinigung';
      }
      if (leaveBtn) {
        leaveBtn.style.display = currentGuild ? 'block' : 'none';
      }

      // Guild-Liste rendern
      if (guildList) {
        guildList.innerHTML = '';
        
        // "Vereinigung erstellen" Button
        if (!this.currentProfile?.progression?.guildId) {
          const createDiv = document.createElement('div');
          createDiv.className = 'guild-create-section';
          createDiv.innerHTML = `
            <button class="guild-create-btn" id="btn-create-guild">➕ Eigene Vereinigung gründen</button>
          `;
          guildList.appendChild(createDiv);
          
          const createBtn = createDiv.querySelector('#btn-create-guild');
          createBtn?.addEventListener('click', () => this.showCreateGuildDialog());
        }
        
        // NPC-Guilds Sektion
        const npcHeader = document.createElement('h4');
        npcHeader.textContent = '🏛️ Offizielle Hunter-Vereinigungen';
        npcHeader.style.color = '#ffd700';
        npcHeader.style.marginTop = '20px';
        guildList.appendChild(npcHeader);
        
        data.npcGuilds?.forEach((guild: any) => {
          const card = document.createElement('div');
          card.className = 'guild-card';
          
          const isAvailable = data.availableNpcGuilds?.includes(guild.id);
          const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
          
          if (!isAvailable) card.classList.add('guild-locked');
          if (isCurrent) card.classList.add('guild-current');

          card.innerHTML = `
            <div class="guild-card-header">
              <span class="guild-card-name">${guild.name}</span>
              <span class="guild-card-rank">Min. ${guild.minimumHunterRank}</span>
            </div>
            <div class="guild-card-desc">${guild.description}</div>
            <div class="guild-card-bonus">+${Math.round(guild.goldBonus * 100)}% Gold</div>
            ${!isCurrent && isAvailable ? `<button class="guild-apply-btn" data-guild-id="${guild.id}">🎲 Bewerben</button>` : ''}
            ${isCurrent ? '<span class="guild-current-badge">Aktuelle Vereinigung</span>' : ''}
            ${!isAvailable ? '<span class="guild-locked-badge">🔒 Gesperrt</span>' : ''}
          `;

          guildList.appendChild(card);
        });

        // Player-Guilds Sektion
        if (data.playerGuilds && data.playerGuilds.length > 0) {
          const playerHeader = document.createElement('h4');
          playerHeader.textContent = '👥 Spieler-Vereinigungen';
          playerHeader.style.color = '#66ccff';
          playerHeader.style.marginTop = '20px';
          guildList.appendChild(playerHeader);
          
          data.playerGuilds.forEach((guild: any) => {
            const card = document.createElement('div');
            card.className = 'guild-card guild-player';
            
            const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
            if (isCurrent) card.classList.add('guild-current');

            const goldBonus = guild.gold_bonus || 0.10;
            card.innerHTML = `
              <div class="guild-card-header">
                <span class="guild-card-name">${guild.name}</span>
                <span class="guild-card-rank">Min. ${guild.minimum_hunter_rank}</span>
              </div>
              <div class="guild-card-desc">${guild.description}</div>
              <div class="guild-card-owner">👑 Gründer: ${guild.owner_name}</div>
              <div class="guild-card-bonus">+${Math.round(goldBonus * 100)}% Gold</div>
              ${!isCurrent ? `<button class="guild-join-btn" data-guild-id="${guild.id}">Beitreten</button>` : ''}
              ${isCurrent ? '<span class="guild-current-badge">Aktuelle Vereinigung</span>' : ''}
            `;

            guildList.appendChild(card);
          });
        }

        // Apply-Buttons für NPC-Guilds (mit KI-Entscheidung)
        guildList.querySelectorAll('.guild-apply-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const guildId = (e.target as HTMLElement).dataset.guildId;
            if (!guildId) return;

            try {
              const result = await AuthAPI.applyGuild(guildId);
              if (result.accepted) {
                await this.loadProfile();
                await this.loadGuilds();
                alert(`✅ ${result.message}`);
              } else {
                alert(`❌ ${result.message}`);
              }
            } catch (error: any) {
              alert(error.message);
            }
          });
        });

        // Join-Buttons für Player-Guilds (sofortiger Beitritt)
        guildList.querySelectorAll('.guild-join-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const guildId = (e.target as HTMLElement).dataset.guildId;
            if (!guildId) return;

            try {
              await AuthAPI.joinGuild(guildId);
              await this.loadProfile();
              await this.loadGuilds();
              alert('Vereinigung beigetreten!');
            } catch (error: any) {
              alert(error.message);
            }
          });
        });
      }
    } catch (error) {
      console.error('Guild load error:', error);
    }
  }

  private showCreateGuildDialog() {
    const name = prompt('Name der Vereinigung:');
    if (!name) return;

    const description = prompt('Beschreibung:');
    if (!description) return;

    const minRank = prompt('Mindest-Hunter-Rang (D/C/B/A/S/SS):', 'D');
    if (!minRank) return;

    const validRanks = ['D', 'C', 'B', 'A', 'S', 'SS'];
    if (!validRanks.includes(minRank.toUpperCase())) {
      alert('Ungültiger Rang! Bitte D, C, B, A, S oder SS eingeben.');
      return;
    }

    this.createGuildAsync(name, description, minRank.toUpperCase());
  }

  private async createGuildAsync(name: string, description: string, minRank: string) {
    try {
      const result = await AuthAPI.createGuild(name, description, minRank);
      await this.loadProfile();
      await this.loadGuilds();
      alert(`✅ ${result.message}`);
    } catch (error: any) {
      alert(`❌ ${error.message}`);
    }
  }
}

// Initialize combat engine and UI renderer
const engine = new CombatEngine();
const ui = new UIRenderer();
const authUI = new AuthUI();

// Make globally accessible
(window as any).engine = engine;
(window as any).ui = ui;
(window as any).authUI = authUI;

// Make gameState globally accessible for auth integration
(window as any).gameState = {
    level: 1,
    xp: 0,
    gold: 0,
    guildGoldBonus: 0,
    updateUI: () => {
        const state = engine.getState();
        state.progression.level = (window as any).gameState.level;
        state.progression.xp = (window as any).gameState.xp;
        state.progression.gold = (window as any).gameState.gold;
        state.progression.guildGoldBonus = (window as any).gameState.guildGoldBonus;
        ui.updateUI(state);
    }
};

// Wire up callbacks
engine.setOnStateUpdate((state) => {
    // Sync progression to global state
    (window as any).gameState.level = state.progression.level;
    (window as any).gameState.xp = state.progression.xp;
    (window as any).gameState.gold = state.progression.gold;
    
    ui.updateUI(state);
    
    // Auto-save progression to server
    saveProgressionToServer(state.progression.level, state.progression.xp, state.progression.gold);
});

engine.setOnCombatEvent((event) => {
    ui.addLogEntry(event);
});

// Register dungeon completion callback for awakening
engine.setOnDungeonComplete(() => {
    if ((window as any).authUI) {
        (window as any).authUI.showAwakeningModal();
    }
});

// Auto-save function with debounce
let saveTimeout: number | null = null;
async function saveProgressionToServer(level: number, xp: number, gold: number) {
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = window.setTimeout(async () => {
        try {
            await AuthAPI.saveProgression(level, xp, gold);
            console.log('✓ Progression gespeichert');
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
        }
    }, 1000); // 1 Sekunde Debounce
}

// Initialize UI with starting state
ui.updateUI(engine.getState());

// Attach event listeners to buttons
function setupEventListeners() {
    // Role selector
    const roleSelect = document.getElementById('role-select') as HTMLSelectElement;
    if (roleSelect) {
        roleSelect.addEventListener('change', () => {
            const selectedRole = roleSelect.value as Role;
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
        const target = event.target as HTMLElement;
        const enemyCard = target.closest('.dungeon-enemy-card.selectable') as HTMLElement;
        
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
} else {
    setupEventListeners();
    authUI.init();
}
