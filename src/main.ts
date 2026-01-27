/**
 * SYSTEM UI - Main Application Controller
 * Handles authentication, panel navigation, and game state
 */

import { Role, getPlayerTitle } from './combat/types.js';
import { turnBasedCombat } from './combat/turn-based-init.js';
import LocalStorage from './storage.js';
import { initMultiplayer, disconnectMultiplayer, setGuildChannel } from './multiplayer.js';
import { worldMap } from './world-map.js';
import { cityMap } from './city-map.js';

// API Base URL - Port 3001 für Node.js Server
const API_BASE_URL = 'http://localhost:3001';

// ==================== AUTH API (Local Storage) ====================
class AuthAPI {

  static async register(email: string, password: string, displayName: string, role: string, homeCity: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, displayName, role, homeCity })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registrierung fehlgeschlagen');
      }

      return { 
        success: true, 
        user: data.user
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registrierung fehlgeschlagen');
    }
  }

  static async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login fehlgeschlagen');
      }

      return { 
        success: true, 
        user: data.user
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login fehlgeschlagen');
    }
  }

  static async logout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      return { success: true };
    } catch (error) {
      return { success: true }; // Logout always succeeds locally
    }
  }

  static async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Nicht eingeloggt');
      }

      return await response.json();
    } catch (error: any) {
      // Fallback to LocalStorage if server unavailable
      const player = LocalStorage.getCurrentPlayer();
      if (player) {
        return {
          id: player.id,
          displayName: player.displayName,
          email: player.email,
          role: player.role,
          level: player.level,
          experience: player.experience,
          hunterRank: player.hunterRank,
          gold: player.gold,
          stats: player.stats,
          currentHp: player.currentHp,
          maxHp: player.maxHp,
          currentMp: player.currentMp,
          maxMp: player.maxMp,
          isAdmin: player.isAdmin
        };
      }
      throw new Error(error.message || 'Nicht eingeloggt');
    }
  }

  static async saveProgression(level: number, xp: number, gold: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/progression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ level, experience: xp, gold })
      });

      if (!response.ok) {
        throw new Error('Speichern fehlgeschlagen');
      }

      return { success: true };
    } catch (error: any) {
      console.warn('Progression save failed:', error);
      return { success: false };
    }
  }

  static async completeAwakening() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/awakening`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Awakening konnte nicht abgeschlossen werden');
      }

      return { success: true };
    } catch (error: any) {
      console.warn('Awakening failed:', error);
      return { success: false };
    }
  }

  static async getGuilds() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guilds`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Gilden konnten nicht geladen werden');
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Loading guilds failed, using fallback:', error);
      // Fallback zu statischen Gilden
      return {
        guilds: [
          { id: 1, name: 'Ahjin Guild', rank: 'S', members: 15 },
          { id: 2, name: 'White Tiger Guild', rank: 'A', members: 25 },
          { id: 3, name: 'Fiend Guild', rank: 'B', members: 30 }
        ],
        npcGuilds: [
          { id: 1, name: 'Ahjin Guild', rank: 'S', members: 15 },
          { id: 2, name: 'White Tiger Guild', rank: 'A', members: 25 },
          { id: 3, name: 'Fiend Guild', rank: 'B', members: 30 }
        ],
        playerGuilds: [],
        availableNpcGuilds: []
      };
    }
  }

  static async joinGuild(guildId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guilds/${guildId}/join`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Beitritt fehlgeschlagen');
      }

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Beitritt fehlgeschlagen');
    }
  }

  static async applyGuild(guildId: string) {
    // Für Demo: Direkt beitreten
    return this.joinGuild(guildId);
  }

  static async createGuild(name: string, description: string, minimumHunterRank: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guilds/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, description, minimumHunterRank })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gilde konnte nicht erstellt werden');
      }

      const data = await response.json();
      return { success: true, guildId: data.guildId };
    } catch (error: any) {
      throw new Error(error.message || 'Gildenerstellung fehlgeschlagen');
    }
  }

  static async leaveGuild() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/guilds/leave`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Verlassen fehlgeschlagen');
      }

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Verlassen fehlgeschlagen');
    }
  }
}

// ==================== SYSTEM UI CONTROLLER ====================
class SystemUI {
  private currentProfile: any = null;
  private travelCheckInterval: number | null = null;

  constructor() {
  }

  async init() {
    this.setupAuth();
    this.setupNavigation();
    await this.checkSession();
    this.setupTravelSystem();
    this.setupGateEventListener();
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
        
        // Load travel status
        await this.checkTravelStatus();
        
        // Initialize multiplayer
        if (this.currentProfile) {
          initMultiplayer(this.currentProfile.id, this.currentProfile.displayName);
        }
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
    const regHomeCityInput = document.getElementById('register-home-city') as HTMLSelectElement;

    registerBtn?.addEventListener('click', async () => {
      const email = regEmailInput?.value.trim();
      const password = regPasswordInput?.value;
      const displayName = regDisplayNameInput?.value.trim();
      const role = regRoleInput?.value;
      const homeCity = regHomeCityInput?.value;

      if (!email || !password || !displayName || !role) {
        this.showError('register-error', 'Bitte alle Felder ausfüllen');
        return;
      }

      if (!homeCity) {
        this.showError('register-error', 'Bitte wähle eine Heimatstadt');
        return;
      }

      try {
        registerBtn.textContent = 'Lädt...';
        registerBtn.setAttribute('disabled', 'true');
        await AuthAPI.register(email, password, displayName, role, homeCity);
        await AuthAPI.login(email, password);
        await this.loadProfile();
        this.showSystem();
        
        // Load travel status
        await this.checkTravelStatus();
        
        // Initialize multiplayer
        if (this.currentProfile) {
          initMultiplayer(this.currentProfile.id, this.currentProfile.displayName);
        }
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
        disconnectMultiplayer();
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
      
      // Load travel status after profile is loaded
      await this.checkTravelStatus();
      
      // Initialize multiplayer if already logged in
      if (this.currentProfile) {
        initMultiplayer(this.currentProfile.id, this.currentProfile.displayName);
      }
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
    
    // Show admin link if user is admin
    const player = LocalStorage.getCurrentPlayer();
    const adminNavButton = document.getElementById('admin-nav-button');
    if (player?.isAdmin && adminNavButton) {
      adminNavButton.style.display = 'flex';
      // Add click handler for admin button
      adminNavButton.onclick = () => window.location.href = 'admin.html';
    }

    // Update dashboard
    this.updateDashboard(profile);
    
    // Update status panel
    this.updateStatusPanel(profile);

    // ⚡ FIXED: Sync hunterRank to gameState for combat system
    (window as any).gameState.hunterRank = profile.progression?.hunterRank || profile.hunterRank || 'D';

    // Load guild bonus
    if (profile.guildId) {
      const guilds = await AuthAPI.getGuilds();
      const currentGuild = guilds.npcGuilds?.find((g: any) => g.id === profile.guildId) 
                        || guilds.playerGuilds?.find((g: any) => g.id === profile.guildId);
      
      if (currentGuild) {
        (window as any).gameState.guildGoldBonus = 10; // Standard Bonus
      }
    } else {
      (window as any).gameState.guildGoldBonus = 0;
    }

    // Sync with combat engine (commented out - engine moved to turn-based-combat)
    // const state = this.engine.getState();
    // state.progression.level = profile.progression.level;
    // state.progression.xp = profile.progression.xp;
    // state.progression.gold = profile.progression.gold;
  }

  private updateDashboard(profile: any) {
    const rankEl = document.getElementById('dash-hunter-rank');
    const levelEl = document.getElementById('dash-level');
    const guildEl = document.getElementById('dash-guild');
    const titleEl = document.getElementById('dash-title');

    const role = profile.role || 'waechter';
    const level = profile.level || 1;
    const rank = profile.hunterRank || 'D';
    const title = getPlayerTitle(level, rank, role);

    if (rankEl) rankEl.textContent = rank;
    if (levelEl) levelEl.textContent = level;
    if (guildEl) guildEl.textContent = 'KEINE'; // TODO: Guild name lookup
    if (titleEl) titleEl.textContent = title;
  }

  private updateStatusPanel(profile: any) {
    const levelEl = document.getElementById('status-level');
    const rankEl = document.getElementById('status-rank');

    // Titel basierend auf Level und Rolle
    const role = profile.role || 'waechter';
    const level = profile.level || 1;
    const rank = profile.hunterRank || 'D';
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
        case 'world':
          this.loadWorldMapPanel();
          break;
      }
    }
  }

  // ========== WORLD MAP & TRAVEL SYSTEM ==========
  private citySelectionHandler: EventListener | null = null;
  
  private setupTravelSystem() {
    // Remove old listener if exists
    if (this.citySelectionHandler) {
      window.removeEventListener('citySelected', this.citySelectionHandler);
    }
    
    // Listen for city selection from world map
    this.citySelectionHandler = ((e: CustomEvent) => {
      this.handleCitySelection(e.detail);
    }) as EventListener;
    
    window.addEventListener('citySelected', this.citySelectionHandler);

    // Cancel travel button
    const cancelBtn = document.getElementById('cancel-travel-btn');
    cancelBtn?.addEventListener('click', () => this.cancelTravel());

    // Check travel status every 10 seconds
    this.travelCheckInterval = window.setInterval(() => {
      this.checkTravelStatus();
    }, 10000);

    // Initial check
    this.checkTravelStatus();
  }

  private async loadWorldMapPanel() {
    await worldMap.init();
    await this.checkTravelStatus();
  }

  private async loadCityMapPanel() {
    try {
      const player = LocalStorage.getCurrentPlayer();
      if (!player?.id) {
        console.error('No player found for city map');
        return;
      }

      // Get current city from travel status
      const response = await fetch(`${API_BASE_URL}/api/cities/travel/status?userId=${player.id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const currentCityId = data.currentCity || (player.id === 1 ? 19 : 1);
        console.log(`📍 Loading city map for city ${currentCityId} (${data.currentCityName})`);
        await cityMap.init(currentCityId);
      } else {
        // Fallback
        const cityId = player.id === 1 ? 19 : 1;
        await cityMap.init(cityId);
      }
    } catch (error) {
      console.error('Error loading city map panel:', error);
    }
  }

  private async updateCityInfo() {
    try {
      const player = LocalStorage.getCurrentPlayer();
      if (!player?.id) return;

      const response = await fetch(`${API_BASE_URL}/api/cities/travel/status?userId=${player.id}`, {
        credentials: 'include'
      });

      if (!response.ok) return;
      const data = await response.json();

      // Update City Map panel
      const currentCityMapEl = document.getElementById('current-city-name-citymap');
      const homeCityMapEl = document.getElementById('home-city-name-citymap');

      if (currentCityMapEl) {
        currentCityMapEl.textContent = data.currentCityName || 'Keine Stadt';
      }
      if (homeCityMapEl) {
        homeCityMapEl.textContent = data.homeCityName || 'Nicht festgelegt';
      }
    } catch (error) {
      console.error('Error updating city info:', error);
    }
  }

  private async handleCitySelection(city: any) {
    const player = LocalStorage.getCurrentPlayer();
    if (!player?.id) {
      alert('Fehler: Spieler nicht gefunden. Bitte neu einloggen.');
      return;
    }
    
    // Check if admin
    const isAdmin = player.id === 1 || player.isAdmin;
    let skipTravel = false;
    
    if (isAdmin) {
      // Ask admin if they want instant teleport or normal travel
      const wantsInstant = confirm(`[ADMIN] Sofort nach ${city.display_name} teleportieren?\n\nOK = Sofort-Teleport\nAbbrechen = Normale Reise (${city.travel_time_minutes} min)`);
      skipTravel = wantsInstant;
      // No second confirmation needed
    } else {
      if (!confirm(`Möchtest du nach ${city.display_name} reisen?\n\nReisezeit: ${city.travel_time_minutes} Minuten`)) {
        return;
      }
    }

    try {

      const response = await fetch(`${API_BASE_URL}/api/cities/travel/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          cityId: city.id,
          userId: player.id,
          skipTravel: skipTravel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Reise konnte nicht gestartet werden');
        return;
      }

      if (data.instant) {
        alert(data.message);
        await this.checkTravelStatus();
      } else {
        alert(`Reise nach ${data.cityName} gestartet!\n\nAnkunft in ${data.travelTimeMinutes} Minuten.`);
        await this.checkTravelStatus();
      }

    } catch (error: any) {
      console.error('Error starting travel:', error);
      alert('Fehler beim Starten der Reise');
    }
  }

  private async checkTravelStatus() {
    try {
      console.log('🔍 Checking travel status...');
      
      // Get userId from localStorage
      const player = LocalStorage.getCurrentPlayer();
      if (!player?.id) {
        console.warn('⚠️ No player ID found in localStorage');
        console.log('📋 Current session:', LocalStorage.getSession());
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/cities/travel/status?userId=${player.id}`, {
        credentials: 'include'
      });

      console.log('📡 Response status:', response.status);
      if (!response.ok) {
        console.error('❌ Response not OK:', response.status);
        return;
      }

      const data = await response.json();
      console.log('📦 Travel status data:', data);
      console.log('🏙️ Current city name:', data.currentCityName);
      console.log('🏠 Home city name:', data.homeCityName);

      // Update current city display
      const currentCityEl = document.getElementById('current-city-name');
      const currentCityMapEl = document.getElementById('current-city-name-citymap');
      const currentCityHeaderEl = document.getElementById('current-city-name-header');
      const currentCityImageEl = document.getElementById('current-city-image');
      const homeCityEl = document.getElementById('home-city-name');
      const homeCityMapEl = document.getElementById('home-city-name-citymap');

      console.log('🔍 Elements found:', {
        currentCityEl: !!currentCityEl,
        currentCityMapEl: !!currentCityMapEl,
        homeCityEl: !!homeCityEl,
        homeCityMapEl: !!homeCityMapEl
      });

      if (currentCityEl) {
        currentCityEl.textContent = data.currentCityName || 'Keine Stadt';
        console.log('✅ Updated current city to:', currentCityEl.textContent);
      }
      if (currentCityMapEl) {
        currentCityMapEl.textContent = data.currentCityName || 'Keine Stadt';
        console.log('✅ Updated current city (map) to:', currentCityMapEl.textContent);
      }
      if (currentCityHeaderEl) {
        currentCityHeaderEl.textContent = data.currentCityName || 'Keine Stadt';
      }
      
      // Show city image if available
      if (currentCityImageEl && data.currentCityImage) {
        currentCityImageEl.style.backgroundImage = `url(${API_BASE_URL}${data.currentCityImage})`;
        currentCityImageEl.style.display = 'block';
      } else if (currentCityImageEl) {
        currentCityImageEl.style.display = 'none';
      }
      
      if (homeCityEl) {
        homeCityEl.textContent = data.homeCityName || 'Nicht festgelegt';
        console.log('✅ Updated home city to:', homeCityEl.textContent);
      }
      if (homeCityMapEl) {
        homeCityMapEl.textContent = data.homeCityName || 'Nicht festgelegt';
        console.log('✅ Updated home city (map) to:', homeCityMapEl.textContent);
      }

      // Update travel status
      const travelStatus = document.getElementById('travel-status');
      const currentCityInfo = document.getElementById('current-city-info');

      if (data.traveling) {
        // Show travel progress in World Map
        if (travelStatus) {
          travelStatus.style.display = 'block';
          
          const destinationEl = document.getElementById('travel-destination');
          const remainingEl = document.getElementById('travel-remaining');
          const progressBar = document.getElementById('travel-progress-bar');
          const progressText = document.getElementById('travel-progress-text');

          if (destinationEl) destinationEl.textContent = data.travelingToCityName;
          if (remainingEl) remainingEl.textContent = `${data.remainingMinutes} Minuten`;
          if (progressBar) progressBar.style.width = `${data.progress}%`;
          if (progressText) progressText.textContent = `${Math.floor(data.progress)}%`;
        }
        if (currentCityInfo) currentCityInfo.style.display = 'none';
        
        // Show travel overlay in City Map
        this.showCityMapTravelOverlay(data);
        
        // Show travel visualization in World Map
        worldMap.setTravelData({
          currentCity: data.currentCity,
          travelingTo: data.travelingTo,
          progress: data.progress
        });

      } else {
        // Not traveling
        if (travelStatus) travelStatus.style.display = 'none';
        if (currentCityInfo) currentCityInfo.style.display = 'block';

        // Hide travel overlay in City Map
        this.hideCityMapTravelOverlay();
        
        // Clear travel visualization in World Map
        worldMap.setTravelData(null);
        
        // Check if just arrived
        if (data.arrived) {
          console.log(`✈️ Arrived in city ${data.currentCity} (${data.currentCityName})`);
          // Switch to city map panel and reload with new city
          await this.switchToPanel('city-map');
          alert(`Du bist in ${data.currentCityName} angekommen!`);
        }
      }

    } catch (error) {
      console.error('Error checking travel status:', error);
    }
  }

  private async cancelTravel() {
    if (!confirm('Möchtest du die Reise wirklich abbrechen?')) {
      return;
    }

    try {
      const player = LocalStorage.getCurrentPlayer();
      const response = await fetch(`${API_BASE_URL}/api/cities/travel/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: player?.id })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Reise abgebrochen');
        await this.checkTravelStatus();
      } else {
        alert(data.error || 'Fehler beim Abbrechen');
      }
    } catch (error) {
      console.error('Error canceling travel:', error);
      alert('Fehler beim Abbrechen der Reise');
    }
  }

  private showCityMapTravelOverlay(travelData: any) {
    let overlay = document.getElementById('city-map-travel-overlay');
    
    if (!overlay) {
      // Create overlay
      overlay = document.createElement('div');
      overlay.id = 'city-map-travel-overlay';
      overlay.innerHTML = `
        <div class="travel-overlay-content">
          <h2>🚶 Auf Reise...</h2>
          <p class="travel-destination">Ziel: <span id="overlay-destination"></span></p>
          <div class="travel-progress-container">
            <div class="travel-progress-bar" id="overlay-progress-bar"></div>
            <div class="travel-progress-text" id="overlay-progress-text">0%</div>
          </div>
          <p class="travel-remaining">Noch <span id="overlay-remaining"></span></p>
          <button id="overlay-cancel-btn" class="cancel-travel-btn">Reise abbrechen</button>
        </div>
      `;
      
      const cityMapPanel = document.getElementById('city-map');
      if (cityMapPanel) {
        cityMapPanel.appendChild(overlay);
        
        // Cancel button handler
        const cancelBtn = overlay.querySelector('#overlay-cancel-btn');
        cancelBtn?.addEventListener('click', () => this.cancelTravel());
      }
    }
    
    // Update overlay data
    const destinationEl = overlay.querySelector('#overlay-destination');
    const remainingEl = overlay.querySelector('#overlay-remaining');
    const progressBar = overlay.querySelector('#overlay-progress-bar') as HTMLElement;
    const progressText = overlay.querySelector('#overlay-progress-text');
    
    if (destinationEl) destinationEl.textContent = travelData.travelingToCityName;
    if (remainingEl) remainingEl.textContent = `${travelData.remainingMinutes} Minuten`;
    if (progressBar) progressBar.style.width = `${travelData.progress}%`;
    if (progressText) progressText.textContent = `${Math.floor(travelData.progress)}%`;
    
    overlay.style.display = 'flex';
  }

  private hideCityMapTravelOverlay() {
    const overlay = document.getElementById('city-map-travel-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  private setupQuickActions() {
    const actions = document.querySelectorAll('[data-action]');
    
    actions.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        
        switch(action) {
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

  public async switchToPanel(panelId: string) {
    // Update skill-bar buttons
    const skillBtns = document.querySelectorAll('.skill-btn[data-panel]');
    skillBtns.forEach(btn => {
      if (btn.getAttribute('data-panel') === panelId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update chat floating button
    const chatBtn = document.querySelector('.chat-floating-btn');
    if (chatBtn) {
      if (panelId === 'chat') {
        chatBtn.classList.add('active');
      } else {
        chatBtn.classList.remove('active');
      }
    }

    // Switch panels
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.classList.remove('active'));
    
    const targetPanel = document.getElementById(`panel-${panelId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update nav (legacy support)
    const navItems = document.querySelectorAll('.nav-item[data-panel]');
    navItems.forEach(item => {
      if (item.getAttribute('data-panel') === panelId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Load panel-specific data
    switch(panelId) {
      case 'vereinigung':
        this.loadGuildsPanel();
        break;
      case 'skills':
        this.loadSkillsPanel();
        break;
      case 'world':
        this.loadWorldMapPanel();
        break;
      case 'city-map':
        await this.loadCityMapPanel();
        break;
      case 'city-map':
        await this.loadCityMapPanel();
        // Force update city info after panel is loaded
        await this.updateCityInfo();
        break;
    }
  }

  // ========== GUILDS PANEL ==========
  private currentSquad: any[] = [];
  private currentGuildData: any = null;
  
  private async loadGuildsPanel() {
    try {
      const data = await AuthAPI.getGuilds();
      
      // Cache guild data globally
      (window as any).cachedGuilds = data;
      
      // Find current guild
      let currentGuild = data.npcGuilds?.find((g: any) => g.id === this.currentProfile?.progression?.guildId);
      if (!currentGuild) {
        currentGuild = data.playerGuilds?.find((g: any) => g.id === this.currentProfile?.progression?.guildId);
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
    } catch (error) {
      console.error('Failed to load guilds:', error);
    }
  }

  private updateGuildBanner(guild: any) {
    const bannerName = document.getElementById('guild-banner-name');
    const leaveBtn = document.getElementById('btn-leave-guild');
    
    if (bannerName) {
      bannerName.textContent = guild ? guild.name : 'KEINE VEREINIGUNG';
    }
    if (leaveBtn) {
      leaveBtn.style.display = guild ? 'inline-flex' : 'none';
    }
  }

  private renderGuildGrid(npcGuilds: any[], playerGuilds: any[], availableIds: string[]) {
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
    
    const renderGuilds = (guilds: any[], isNpc: boolean = true) => {
      console.log(`🎨 Rendering ${isNpc ? 'NPC' : 'Player'} guilds:`, guilds?.length);
      grid.innerHTML = '';
      
      if (!guilds || guilds.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: rgba(255,255,255,0.5);">Keine Vereinigungen verfügbar</div>';
        if (countEl) countEl.textContent = '0';
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
            '<div style="color: rgba(255,255,255,0.5); text-align: center;">GESPERRT</div>'
          }
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
        } else {
          renderGuilds(playerGuilds, false);
        }
      });
    });
  }

  private setupGuildButtons() {
    // Leave button
    const leaveBtn = document.getElementById('btn-leave-guild');
    if (leaveBtn) {
      const newLeaveBtn = leaveBtn.cloneNode(true) as HTMLElement;
      leaveBtn.parentNode?.replaceChild(newLeaveBtn, leaveBtn);
      
      newLeaveBtn.addEventListener('click', async () => {
        try {
          await AuthAPI.leaveGuild();
          await this.loadProfile();
          await this.loadGuildsPanel();
          this.showGuildModal('✅ Verlassen', 'Du hast die Vereinigung verlassen.', true);
        } catch (error: any) {
          this.showGuildModal('❌ Fehler', error.message, false);
        }
      });
    }

    // Create button - öffnet Modal
    const createBtn = document.getElementById('btn-create-guild');
    if (createBtn) {
      const newCreateBtn = createBtn.cloneNode(true) as HTMLElement;
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
      if ((grid as any)._hasGuildClickListener) {
        return; // Already set up
      }
      (grid as any)._hasGuildClickListener = true;
      
      grid.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.guild-apply-btn') as HTMLElement;
        
        if (btn) {
          e.stopPropagation();
          e.preventDefault();
          
          console.log('🎯 BEWERBEN clicked!', btn);
          const guildId = btn.getAttribute('data-guild-id');
          console.log('Guild ID:', guildId);
          
          if (!guildId) return;

          try {
            const result = await AuthAPI.applyGuild(guildId);
            
            await this.loadProfile();
            await this.loadGuildsPanel();
            this.showGuildModal('✅ BEIGETRETEN!', 'Du bist der Vereinigung beigetreten!', true);
          } catch (error: any) {
            this.showGuildModal('❌ Fehler', error.message, false);
          }
        }
      });
    }
  }

  private renderGuildNPCs(guild: any) {
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
    if (!(container as any)._hasRecruitListener) {
      (container as any)._hasRecruitListener = true;
      
      container.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.recruit-btn') as HTMLElement;
        
        if (btn) {
          e.stopPropagation();
          e.preventDefault();
          
          const npcId = btn.getAttribute('data-npc-id');
          const currentGuild = this.currentGuildData;
          if (npcId && currentGuild?.npcs) {
            const npc = currentGuild.npcs.find((n: any) => n.id === npcId);
            if (npc) {
              this.recruitToSquad(npc);
            }
          }
        }
      });
    }
    
    container.innerHTML = '';

    const roleNames: {[key: string]: string} = {
      'waechter': 'Wächter',
      'jaeger': 'Jäger', 
      'magier': 'Magier',
      'heiler': 'Heiler'
    };

    guild.npcs.forEach((npc: any) => {
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

  private recruitToSquad(npc: any) {
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

  private updateSquadDisplay() {
    const container = document.getElementById('squad-grid-display');
    const counter = document.getElementById('squad-counter');
    
    if (!container) {
      console.warn('Squad display container not found');
      return;
    }

    container.innerHTML = '';

    if (this.currentSquad.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">Kein Trupp-Mitglied ausgewählt</div>';
      if (counter) counter.textContent = '0/4 MITGLIEDER';
      return;
    }

    if (counter) {
      counter.textContent = `${this.currentSquad.length}/4 MITGLIEDER`;
    }

    this.currentSquad.forEach((member, index) => {
      const card = document.createElement('div');
      card.className = 'squad-member-card';
      
      const roleNames: {[key: string]: string} = {
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
    if (!(container as any)._hasRemoveListener) {
      (container as any)._hasRemoveListener = true;
      
      container.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest('.remove-btn') as HTMLElement;
        
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

  private async createGuildAsync(name: string, description: string, minRank: string) {
    try {
      const result = await AuthAPI.createGuild(name, description, minRank);
      await this.loadProfile();
      await this.loadGuildsPanel();
      this.showGuildModal('✅ VEREINIGUNG GEGRÜNDET!', 'Deine Vereinigung wurde erfolgreich gegründet!', true);
    } catch (error: any) {
      this.showGuildModal('❌ Fehler', error.message, false);
    }
  }

  // ========== GUILD CREATION MODAL ==========
  private showGuildCreationModal() {
    // Prüfe SS-Rang Voraussetzung
    const hunterRank = this.currentProfile?.progression?.hunterRank || 'D';
    if (hunterRank !== 'SS') {
      this.showGuildModal(
        '❌ VORAUSSETZUNGEN NICHT ERFÜLLT',
        `Du benötigst mindestens Rang SS, um eine Vereinigung zu gründen. Dein aktueller Rang: ${hunterRank}`,
        false
      );
      return;
    }

    const modal = document.getElementById('guild-creation-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private closeGuildCreationModal() {
    const modal = document.getElementById('guild-creation-modal');
    if (modal) {
      modal.style.display = 'none';
      
      // Clear inputs
      const nameInput = document.getElementById('guild-name-input') as HTMLInputElement;
      const descInput = document.getElementById('guild-desc-input') as HTMLTextAreaElement;
      const rankInput = document.getElementById('guild-rank-input') as HTMLSelectElement;
      
      if (nameInput) nameInput.value = '';
      if (descInput) descInput.value = '';
      if (rankInput) rankInput.value = 'SS';
    }
  }

  private async confirmGuildCreation() {
    const nameInput = document.getElementById('guild-name-input') as HTMLInputElement;
    const descInput = document.getElementById('guild-desc-input') as HTMLTextAreaElement;
    const rankInput = document.getElementById('guild-rank-input') as HTMLSelectElement;

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
      this.showGuildModal(
        '❌ NICHT GENUG GOLDMÜNZEN',
        `Du benötigst ${cost.toLocaleString('de-DE')} Goldmünzen. Du hast: ${currentGold.toLocaleString('de-DE')}`,
        false
      );
      return;
    }

    this.closeGuildCreationModal();
    await this.createGuildAsync(name, description, minRank);
  }

  // ========== GUILD MODAL ==========
  private showGuildModal(title: string, message: string, accepted: boolean) {
    const modal = document.getElementById('guild-application-modal');
    const modalTitle = document.getElementById('guild-modal-title');
    const modalIcon = document.getElementById('guild-modal-icon');
    const modalStatus = document.getElementById('guild-modal-status');
    const modalText = document.getElementById('guild-modal-text');
    const closeBtn = document.getElementById('btn-close-guild-modal');

    if (!modal || !modalTitle || !modalIcon || !modalStatus || !modalText) return;

    // Set content
    modalTitle.textContent = title.includes('VEREINIGUNG') ? 'VEREINIGUNG' : 'BEWERBUNG';
    modalStatus.textContent = title;
    modalText.textContent = message;

    // Set icon and classes
    if (accepted) {
      modalIcon.textContent = '✅';
      modalIcon.className = 'guild-modal-icon accepted';
      modalStatus.className = 'guild-modal-status accepted';
    } else {
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

    const outsideClickHandler = (e: Event) => {
      if (e.target === modal) {
        closeHandler();
      }
    };

    closeBtn?.addEventListener('click', closeHandler);
    modal?.addEventListener('click', outsideClickHandler);
  }

  // ========== NPC & SQUAD SYSTEM ==========
  private setupSquadSystem() {
    // Initialize - UI components handled in updateSquadDisplay
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
    // Combat wird jetzt über Gates-UI gestartet
    // Entfernt alte Start/Stop Buttons
    const startBtn = document.getElementById('btn-start-combat');
    const stopBtn = document.getElementById('btn-stop-combat');
    
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'none';
  }

  // ========== GATE COMBAT EVENT ==========
  private setupGateEventListener() {
    console.log('🎧 Setting up gate event listener...');
    
    window.addEventListener('startGateCombat', async (event: any) => {
      const { gateId } = event.detail;
      console.log('🌀 Gate Combat Event received! GateId:', gateId);
      
      try {
        // Load gate data from API
        console.log('📞 Fetching gate data from API...');
        const response = await fetch(`${API_BASE_URL}/api/gates/${gateId}`, {
          credentials: 'include'
        });
        
        console.log('📞 API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Gate nicht gefunden');
        }
        
        const { gate } = await response.json();
        console.log('📦 Gate loaded from API:', gate);
        
        // Switch to combat panel
        console.log('🔄 Switching to combat panel...');
        this.switchToPanel('combat');
        
        console.log('⚔️ Calling turnBasedCombat.startGateCombatFromDB...');
        
        // Start combat with gate data (combat system generates enemies)
        await turnBasedCombat.startGateCombatFromDB(gate);
        
        console.log('✅ Gate combat started successfully!');
        
      } catch (error) {
        console.error('❌ Error starting gate combat:', error);
        alert('Fehler beim Betreten des Gates: ' + (error as Error).message);
      }
    });
    
    console.log('✅ Gate event listener setup complete');
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

// Create admin account on first load
LocalStorage.createAdminIfNotExists();

const systemUI = new SystemUI();

// Make globally accessible
(window as any).systemUI = systemUI;
(window as any).turnBasedCombat = turnBasedCombat;
(window as any).switchPanel = (panelId: string) => systemUI.switchToPanel(panelId);
(window as any).cityMap = cityMap;
(window as any).LocalStorage = LocalStorage;

// Global game state
(window as any).gameState = {
  level: 1,
  xp: 0,
  gold: 0,
  guildGoldBonus: 0,
  hunterRank: 'D' // ⚡ FIXED: Add hunterRank to gameState
};

// Initialize app
systemUI.init();

console.log('🎮 SYSTEM INITIALIZED');

