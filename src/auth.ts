// Auth API Client
export class AuthAPI {
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
}

// Auth UI Handler
export class AuthUI {
  private authScreen: HTMLElement;
  private gameScreen: HTMLElement;
  private loginTab: HTMLElement;
  private registerTab: HTMLElement;
  private loginForm: HTMLElement;
  private registerForm: HTMLElement;

  constructor() {
    this.authScreen = document.getElementById('auth-screen')!;
    this.gameScreen = document.getElementById('game-screen')!;
    this.loginTab = document.getElementById('tab-login')!;
    this.registerTab = document.getElementById('tab-register')!;
    this.loginForm = document.getElementById('form-login')!;
    this.registerForm = document.getElementById('form-register')!;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Tab-Wechsel
    this.loginTab.addEventListener('click', () => this.showLoginTab());
    this.registerTab.addEventListener('click', () => this.showRegisterTab());

    // Login
    document.getElementById('btn-login')!.addEventListener('click', () => this.handleLogin());
    document.getElementById('login-password')!.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });

    // Register
    document.getElementById('btn-register')!.addEventListener('click', () => this.handleRegister());
    document.getElementById('register-displayname')!.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleRegister();
    });

    // Logout
    document.getElementById('btn-logout')!.addEventListener('click', () => this.handleLogout());
  }

  private showLoginTab() {
    this.loginTab.classList.add('active');
    this.registerTab.classList.remove('active');
    this.loginForm.classList.add('active');
    this.registerForm.classList.remove('active');
    this.clearErrors();
  }

  private showRegisterTab() {
    this.registerTab.classList.add('active');
    this.loginTab.classList.remove('active');
    this.registerForm.classList.add('active');
    this.loginForm.classList.remove('active');
    this.clearErrors();
  }

  private clearErrors() {
    document.getElementById('login-error')!.textContent = '';
    document.getElementById('register-error')!.textContent = '';
  }

  private async handleLogin() {
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;
    const errorEl = document.getElementById('login-error')!;

    try {
      errorEl.textContent = '';
      await AuthAPI.login(email, password);
      await this.loadProfileAndShowGame();
    } catch (error: any) {
      errorEl.textContent = error.message;
    }
  }

  private async handleRegister() {
    const email = (document.getElementById('register-email') as HTMLInputElement).value;
    const password = (document.getElementById('register-password') as HTMLInputElement).value;
    const displayName = (document.getElementById('register-displayname') as HTMLInputElement).value;
    const errorEl = document.getElementById('register-error')!;

    try {
      errorEl.textContent = '';
      await AuthAPI.register(email, password, displayName);
      await this.loadProfileAndShowGame();
    } catch (error: any) {
      errorEl.textContent = error.message;
    }
  }

  private async handleLogout() {
    try {
      await AuthAPI.logout();
      this.showAuthScreen();
    } catch (error: any) {
      console.error('Logout error:', error);
      alert('Fehler beim Abmelden: ' + error.message);
    }
  }

  private async loadProfileAndShowGame() {
    try {
      const profile = await AuthAPI.getProfile();
      
      // Anzeigename setzen
      document.getElementById('user-display-name')!.textContent = profile.displayName;
      
      // Progression in die Game-Logik laden
      if (window.gameState) {
        window.gameState.level = profile.progression.level;
        window.gameState.xp = profile.progression.xp;
        window.gameState.gold = profile.progression.gold;
        window.gameState.updateUI();
      }
      
      this.showGameScreen();
    } catch (error: any) {
      console.error('Profile load error:', error);
      alert('Fehler beim Laden des Profils: ' + error.message);
    }
  }

  private showAuthScreen() {
    this.authScreen.style.display = 'flex';
    this.gameScreen.style.display = 'none';
    this.clearForms();
    this.clearErrors();
  }

  private showGameScreen() {
    this.authScreen.style.display = 'none';
    this.gameScreen.style.display = 'block';
  }

  private clearForms() {
    (document.getElementById('login-email') as HTMLInputElement).value = '';
    (document.getElementById('login-password') as HTMLInputElement).value = '';
    (document.getElementById('register-email') as HTMLInputElement).value = '';
    (document.getElementById('register-password') as HTMLInputElement).value = '';
    (document.getElementById('register-displayname') as HTMLInputElement).value = '';
  }

  async init() {
    // Prüfen ob bereits eingeloggt
    try {
      const profile = await AuthAPI.getProfile();
      document.getElementById('user-display-name')!.textContent = profile.displayName;
      
      // Warte kurz bis gameState verfügbar ist
      setTimeout(() => {
        if (window.gameState) {
          window.gameState.level = profile.progression.level;
          window.gameState.xp = profile.progression.xp;
          window.gameState.gold = profile.progression.gold;
          window.gameState.updateUI();
        }
        this.showGameScreen();
      }, 100);
    } catch {
      // Nicht eingeloggt, zeige Auth-Screen
      this.showAuthScreen();
    }
  }
}

// Global types
declare global {
  interface Window {
    gameState: any;
    authAPI: typeof AuthAPI;
  }
}

// Export für globalen Zugriff
window.authAPI = AuthAPI;
