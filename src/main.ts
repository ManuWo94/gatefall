/**
 * SYSTEM UI - Main Application Controller
 * Handles authentication, panel navigation, and game state
 */

import { CombatEngine } from './combat/engine.js';
import { Role, CombatState, getPlayerTitle } from './combat/types.js';
import { GatesUIManager } from './gates-ui.js';

// ==================== AUTH API ====================
class AuthAPI {
  private static baseUrl = '/api';

  static async register(email: string, password: string, displayName: string, role: string) {
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

// ==================== SYSTEM UI CONTROLLER ====================
class SystemUI {
  private currentProfile: any = null;
  private engine: CombatEngine;
  private gatesUI: GatesUIManager;

  constructor(engine: CombatEngine) {
    this.engine = engine;
    this.gatesUI = new GatesUIManager();
  }

  async init() {
    this.setupAuth();
    this.setupNavigation();
    await this.checkSession();
  }

  // ========== AUTHENTICATION ==========
  private setupAuth() {
    // Login
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
        this.showSystem();
      } catch (error: any) {
        this.showError('login-error', error.message);
      } finally {
        loginBtn.textContent = 'ZUGRIFF ANFORDERN';
        loginBtn.removeAttribute('disabled');
      }
    });

    // Register
    const registerBtn = document.getElementById('btn-register');
    const regEmailInput = document.getElementById('register-email') as HTMLInputElement;
    const regPasswordInput = document.getElementById('register-password') as HTMLInputElement;
    const regDisplayNameInput = document.getElementById('register-displayname') as HTMLInputElement;
    const regRoleInput = document.getElementById('register-role') as HTMLSelectElement;

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
      } catch (error: any) {
        this.showError('register-error', error.message);
      } finally {
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
      } catch (error: any) {
        alert(error.message);
      }
    });
  }

  private async checkSession() {
    try {
      await this.loadProfile();
      this.showSystem();
    } catch (error) {
      this.showAuth();
    }
  }

  private async loadProfile() {
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
      const currentGuild = guilds.npcGuilds?.find((g: any) => g.id === profile.progression.guildId) 
                        || guilds.playerGuilds?.find((g: any) => g.id === profile.progression.guildId);
      
      if (currentGuild) {
        (window as any).gameState.guildGoldBonus = currentGuild.goldBonus || currentGuild.gold_bonus || 0;
      }
    } else {
      (window as any).gameState.guildGoldBonus = 0;
    }

    // Sync with combat engine
    const state = this.engine.getState();
    state.progression.level = profile.progression.level;
    state.progression.xp = profile.progression.xp;
    state.progression.gold = profile.progression.gold;
  }

  private updateDashboard(profile: any) {
    const rankEl = document.getElementById('dash-hunter-rank');
    const levelEl = document.getElementById('dash-level');
    const guildEl = document.getElementById('dash-guild');
    const titleEl = document.getElementById('dash-title');

    const role = profile.progression.role || 'waechter';
    const level = profile.progression.level || 1;
    const rank = profile.progression.hunterRank || 'D';
    const title = getPlayerTitle(level, rank, role);

    if (rankEl) rankEl.textContent = rank;
    if (levelEl) levelEl.textContent = level;
    if (guildEl) guildEl.textContent = profile.progression.guildName || 'KEINE';
    if (titleEl) titleEl.textContent = title;
  }

  private updateStatusPanel(profile: any) {
    const levelEl = document.getElementById('status-level');
    const rankEl = document.getElementById('status-rank');

    // Titel basierend auf Level und Rolle
    const role = profile.progression.role || 'waechter';
    const level = profile.progression.level || 1;
    const rank = profile.progression.hunterRank || 'D';
    const title = getPlayerTitle(level, rank, role);

    if (levelEl) levelEl.textContent = `${level}`;
    if (rankEl) rankEl.textContent = title;
  }

  private showSystem() {
    const authScreen = document.getElementById('auth-screen');
    const systemInterface = document.getElementById('system-interface');
    if (authScreen) authScreen.style.display = 'none';
    if (systemInterface) systemInterface.style.display = 'flex';
  }

  private showAuth() {
    const authScreen = document.getElementById('auth-screen');
    const systemInterface = document.getElementById('system-interface');
    if (authScreen) authScreen.style.display = 'flex';
    if (systemInterface) systemInterface.style.display = 'none';
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

  // ========== NAVIGATION ==========
  private setupNavigation() {
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

  private switchPanel(panelId: string) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.classList.remove('active'));

    const targetPanel = document.getElementById(`panel-${panelId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');

      // Load panel data
      switch(panelId) {
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
  private async loadGatesPanel() {
    const level = this.currentProfile?.progression?.level || 1;
    const rank = this.currentProfile?.progression?.hunterRank || 'D';
    await this.gatesUI.init(level, rank);
  }

  private setupQuickActions() {
    const actions = document.querySelectorAll('[data-action]');
    
    actions.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        
        switch(action) {
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

  private switchToPanel(panelId: string) {
    // Update nav
    const navItems = document.querySelectorAll('.nav-item[data-panel]');
    navItems.forEach(item => {
      if (item.getAttribute('data-panel') === panelId) {
        item.classList.add('active');
        (item as HTMLElement).click();
      } else {
        item.classList.remove('active');
      }
    });
  }

  // ========== GUILDS PANEL ==========
  private currentSquad: any[] = [null, null, null, null];
  
  private async loadGuildsPanel() {
    try {
      const data = await AuthAPI.getGuilds();
      
      // Cache guild data globally
      (window as any).cachedGuilds = data;
      
      // Update current guild
      const currentGuildName = document.getElementById('current-guild-name');
      const leaveBtn = document.getElementById('btn-leave-guild');
      
      let currentGuild = data.npcGuilds?.find((g: any) => g.id === this.currentProfile?.progression?.guildId);
      if (!currentGuild) {
        currentGuild = data.playerGuilds?.find((g: any) => g.id === this.currentProfile?.progression?.guildId);
      }
      
      if (currentGuildName) {
        currentGuildName.textContent = currentGuild ? currentGuild.name : 'KEINE VEREINIGUNG';
      }
      if (leaveBtn) {
        leaveBtn.style.display = currentGuild ? 'block' : 'none';
      }

      // Render NPCs if in a guild
      this.renderGuildNPCs(currentGuild);

      // Render NPC guilds
      this.renderNPCGuilds(data.npcGuilds, data.availableNpcGuilds);
      
      // Render player guilds
      this.renderPlayerGuilds(data.playerGuilds);

      // Setup buttons
      this.setupGuildButtons();
      
      // Setup squad system
      this.setupSquadSystem();
    } catch (error) {
      console.error('Failed to load guilds:', error);
    }
  }

  private renderNPCGuilds(guilds: any[], availableIds: string[]) {
    const list = document.getElementById('npc-guild-list');
    if (!list) return;

    list.innerHTML = '';
    
    guilds.forEach(guild => {
      const isAvailable = availableIds.includes(guild.id);
      const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
      
      const item = document.createElement('div');
      item.className = 'guild-item';
      if (!isAvailable) item.classList.add('locked');
      if (isCurrent) item.classList.add('current');

      item.innerHTML = `
        <div class="guild-item-info">
          <div class="guild-item-name">${guild.name}</div>
          <div class="guild-item-desc">${guild.description}</div>
          <div class="guild-item-meta">MIN. ${guild.minimumHunterRank} · +${Math.round(guild.goldBonus * 100)}% GOLDMÜNZEN</div>
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

  private renderPlayerGuilds(guilds: any[]) {
    const list = document.getElementById('player-guild-list');
    if (!list) return;

    list.innerHTML = '';
    
    if (!guilds || guilds.length === 0) {
      list.innerHTML = '<div class="log-entry">Keine Spieler-Vereinigungen verfügbar</div>';
      return;
    }

    guilds.forEach(guild => {
      const isCurrent = guild.id === this.currentProfile?.progression?.guildId;
      
      const item = document.createElement('div');
      item.className = 'guild-item';
      if (isCurrent) item.classList.add('current');

      const goldBonus = guild.gold_bonus || 0.10;
      item.innerHTML = `
        <div class="guild-item-info">
          <div class="guild-item-name">${guild.name}</div>
          <div class="guild-item-desc">${guild.description}</div>
          <div class="guild-item-meta">GRÜNDER: ${guild.owner_name} · MIN. ${guild.minimum_hunter_rank} · +${Math.round(goldBonus * 100)}% GOLDMÜNZEN</div>
        </div>
        <div class="guild-item-actions">
          ${!isCurrent ? `<button class="system-btn secondary guild-join-btn" data-guild-id="${guild.id}">BEITRETEN</button>` : ''}
          ${isCurrent ? '<span style="color: var(--accent-primary);">AKTIV</span>' : ''}
        </div>
      `;

      list.appendChild(item);
    });
  }

  private setupGuildButtons() {
    // Leave button
    const leaveBtn = document.getElementById('btn-leave-guild');
    leaveBtn?.addEventListener('click', async () => {
      try {
        await AuthAPI.leaveGuild();
        await this.loadProfile();
        await this.loadGuildsPanel();
        this.logSystem('Vereinigung verlassen');
      } catch (error: any) {
        alert(error.message);
      }
    });

    // Create button
    const createBtn = document.getElementById('btn-create-guild');
    createBtn?.addEventListener('click', () => {
      const name = prompt('Name der Vereinigung:');
      if (!name) return;

      const description = prompt('Beschreibung:');
      if (!description) return;

      const minRank = prompt('Mindest-Hunter-Rang (D/C/B/A/S/SS):', 'D');
      if (!minRank) return;

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
        const guildId = (e.target as HTMLElement).getAttribute('data-guild-id');
        if (!guildId) return;

        try {
          const result = await AuthAPI.applyGuild(guildId);
          if (result.accepted) {
            await this.loadProfile();
            await this.loadGuildsPanel();
            this.logSystem(`✅ ${result.message}`);
          } else {
            this.logSystem(`❌ ${result.message}`);
          }
        } catch (error: any) {
          alert(error.message);
        }
      });
    });

    // Join buttons (Player)
    document.querySelectorAll('.guild-join-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const guildId = (e.target as HTMLElement).getAttribute('data-guild-id');
        if (!guildId) return;

        try {
          await AuthAPI.joinGuild(guildId);
          await this.loadProfile();
          await this.loadGuildsPanel();
          this.logSystem('Vereinigung beigetreten');
        } catch (error: any) {
          alert(error.message);
        }
      });
    });
  }

  private async createGuildAsync(name: string, description: string, minRank: string) {
    try {
      const result = await AuthAPI.createGuild(name, description, minRank);
      await this.loadProfile();
      await this.loadGuildsPanel();
      this.logSystem(`✅ ${result.message}`);
    } catch (error: any) {
      alert(error.message);
    }
  }

  // ========== NPC & SQUAD SYSTEM ==========
  private renderGuildNPCs(guild: any) {
    const list = document.getElementById('guild-npc-list');
    if (!list) return;

    if (!guild || !guild.npcs) {
      list.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">Tritt einer Vereinigung bei, um NPCs zu rekrutieren</div>';
      return;
    }

    list.innerHTML = '';
    
    guild.npcs.forEach((npc: any, index: number) => {
      const isInSquad = this.currentSquad.some(s => s && s.index === index);
      
      const card = document.createElement('div');
      card.className = `npc-card ${isInSquad ? 'in-squad' : ''}`;
      card.innerHTML = `
        <div class="npc-info">
          <div class="npc-name">${npc.name}</div>
          <div class="npc-stats">
            <span class="npc-rank">RANG ${npc.rank}</span>
            <span class="npc-level">Level ${npc.level}</span>
          </div>
        </div>
      `;
      
      if (!isInSquad) {
        card.addEventListener('click', () => this.addToSquad(npc, index));
      }
      
      list.appendChild(card);
    });
  }

  private setupSquadSystem() {
    const clearBtn = document.getElementById('btn-clear-squad');
    const deployBtn = document.getElementById('btn-deploy-squad');

    clearBtn?.addEventListener('click', () => {
      this.currentSquad = [null, null, null, null];
      this.updateSquadDisplay();
      this.updateDeployButton();
    });

    deployBtn?.addEventListener('click', () => {
      if (this.currentSquad.filter(s => s).length > 0) {
        this.logSystem(`🚀 Trupp mit ${this.currentSquad.filter(s => s).length} Mitgliedern wird zum Dungeon geschickt!`);
        // TODO: Integration mit Combat System
        alert('Trupp-Raids werden bald verfügbar sein!');
      }
    });

    // Tab switching
    const tabs = document.querySelectorAll('.guild-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabType = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show/hide lists
        const npcList = document.getElementById('npc-guild-list');
        const playerList = document.getElementById('player-guild-list');
        
        if (tabType === 'official') {
          if (npcList) npcList.style.display = 'block';
          if (playerList) playerList.style.display = 'none';
        } else {
          if (npcList) npcList.style.display = 'none';
          if (playerList) playerList.style.display = 'block';
        }
      });
    });

    this.updateSquadDisplay();
  }

  private addToSquad(npc: any, npcIndex: number) {
    // Find first empty slot
    const emptySlot = this.currentSquad.findIndex(s => !s);
    if (emptySlot !== -1) {
      this.currentSquad[emptySlot] = { ...npc, index: npcIndex };
    } else if (this.currentSquad.length < 4) {
      this.currentSquad.push({ ...npc, index: npcIndex });
    } else {
      alert('Trupp ist voll! Maximal 4 Mitglieder.');
      return;
    }
    
    this.updateSquadDisplay();
    this.updateDeployButton();
    this.renderGuildNPCs(this.getCurrentGuild());
    this.logSystem(`✅ ${npc.name} zum Trupp hinzugefügt`);
  }

  private removeFromSquad(slotIndex: number) {
    const member = this.currentSquad[slotIndex];
    if (member) {
      this.currentSquad[slotIndex] = null;
      this.updateSquadDisplay();
      this.updateDeployButton();
      this.renderGuildNPCs(this.getCurrentGuild());
      this.logSystem(`❌ ${member.name} aus Trupp entfernt`);
    }
  }

  private updateSquadDisplay() {
    const slots = document.querySelectorAll('.squad-slot');
    const countEl = document.getElementById('squad-count');
    
    let activeCount = 0;
    
    slots.forEach((slot, index) => {
      const member = this.currentSquad[index];
      
      if (member) {
        activeCount++;
        slot.classList.remove('empty');
        slot.classList.add('filled');
        slot.innerHTML = `
          <div class="squad-member-info">
            <div class="squad-member-name">${member.name}</div>
            <div class="squad-member-stats">
              <span>Rang ${member.rank}</span>
              <span>Level ${member.level}</span>
            </div>
          </div>
          <div class="squad-remove" data-slot="${index}">✕</div>
        `;
        
        const removeBtn = slot.querySelector('.squad-remove');
        removeBtn?.addEventListener('click', () => this.removeFromSquad(index));
      } else {
        slot.classList.remove('filled');
        slot.classList.add('empty');
        slot.innerHTML = `
          <div class="squad-slot-icon">👤</div>
          <div class="squad-slot-label">LEER</div>
        `;
      }
    });

    if (countEl) {
      countEl.textContent = `${activeCount}/4`;
    }
  }

  private updateDeployButton() {
    const deployBtn = document.getElementById('btn-deploy-squad') as HTMLButtonElement;
    if (deployBtn) {
      const hasMembers = this.currentSquad.filter(s => s).length > 0;
      deployBtn.disabled = !hasMembers;
    }
  }

  private getCurrentGuild() {
    const guildId = this.currentProfile?.progression?.guildId;
    if (!guildId) return null;
    
    // Check in NPC guilds (from guilds.js)
    const guilds = (window as any).cachedGuilds;
    if (guilds) {
      return guilds.npcGuilds?.find((g: any) => g.id === guildId) || 
             guilds.playerGuilds?.find((g: any) => g.id === guildId);
    }
    return null;
  }

  // ========== SKILLS PANEL ==========
  private loadSkillsPanel() {
    // TODO: Implement skills panel rendering
    this.logSystem('Skills panel - Coming soon');
  }

  // ========== COMBAT CONTROLS ==========
  private setupCombatControls() {
    const startBtn = document.getElementById('btn-start-combat');
    const stopBtn = document.getElementById('btn-stop-combat');
    
    startBtn?.addEventListener('click', () => {
      // Start combat
      this.engine.startCombat();
      
      if (startBtn) startBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'block';
      
      this.logSystem('Kampf gestartet!');
    });
    
    stopBtn?.addEventListener('click', () => {
      // Reset combat state  
      const state = this.engine.getState();
      state.isRunning = false;
      
      if (startBtn) startBtn.style.display = 'block';
      if (stopBtn) stopBtn.style.display = 'none';
      
      this.logSystem('Kampf beendet');
    });
  }

  // ========== LOGGING ==========
  private logSystem(message: string) {
    const dashLog = document.getElementById('dashboard-log');
    if (dashLog) {
      const entry = document.createElement('div');
      entry.className = 'log-entry system';
      entry.textContent = message;
      dashLog.prepend(entry);

      // Keep only last 10 entries
      while (dashLog.children.length > 10) {
        dashLog.removeChild(dashLog.lastChild!);
      }
    }
  }
}

// ==================== INITIALIZE ====================
const engine = new CombatEngine();
const systemUI = new SystemUI(engine);

// Make globally accessible
(window as any).engine = engine;
(window as any).systemUI = systemUI;

// Global game state
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
  }
};

// Initialize app
systemUI.init();

// Auto-save function
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
  }, 1000);
}

engine.setOnStateUpdate((state: CombatState) => {
  (window as any).gameState.level = state.progression.level;
  (window as any).gameState.xp = state.progression.xp;
  (window as any).gameState.gold = state.progression.gold;
  
  saveProgressionToServer(state.progression.level, state.progression.xp, state.progression.gold);
});

console.log('🎮 SYSTEM INITIALIZED');
