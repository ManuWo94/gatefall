// Auth API Client
export class AuthAPI {
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
}
AuthAPI.baseUrl = '/api';
// Auth UI Handler
export class AuthUI {
    constructor() {
        this.authScreen = document.getElementById('auth-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.loginTab = document.getElementById('tab-login');
        this.registerTab = document.getElementById('tab-register');
        this.loginForm = document.getElementById('form-login');
        this.registerForm = document.getElementById('form-register');
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Tab-Wechsel
        this.loginTab.addEventListener('click', () => this.showLoginTab());
        this.registerTab.addEventListener('click', () => this.showRegisterTab());
        // Login
        document.getElementById('btn-login').addEventListener('click', () => this.handleLogin());
        document.getElementById('login-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                this.handleLogin();
        });
        // Register
        document.getElementById('btn-register').addEventListener('click', () => this.handleRegister());
        document.getElementById('register-displayname').addEventListener('keypress', (e) => {
            if (e.key === 'Enter')
                this.handleRegister();
        });
        // Logout
        document.getElementById('btn-logout').addEventListener('click', () => this.handleLogout());
    }
    showLoginTab() {
        this.loginTab.classList.add('active');
        this.registerTab.classList.remove('active');
        this.loginForm.classList.add('active');
        this.registerForm.classList.remove('active');
        this.clearErrors();
    }
    showRegisterTab() {
        this.registerTab.classList.add('active');
        this.loginTab.classList.remove('active');
        this.registerForm.classList.add('active');
        this.loginForm.classList.remove('active');
        this.clearErrors();
    }
    clearErrors() {
        document.getElementById('login-error').textContent = '';
        document.getElementById('register-error').textContent = '';
    }
    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        try {
            errorEl.textContent = '';
            await AuthAPI.login(email, password);
            await this.loadProfileAndShowGame();
        }
        catch (error) {
            errorEl.textContent = error.message;
        }
    }
    async handleRegister() {
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const displayName = document.getElementById('register-displayname').value;
        const errorEl = document.getElementById('register-error');
        try {
            errorEl.textContent = '';
            await AuthAPI.register(email, password, displayName);
            await this.loadProfileAndShowGame();
        }
        catch (error) {
            errorEl.textContent = error.message;
        }
    }
    async handleLogout() {
        try {
            await AuthAPI.logout();
            this.showAuthScreen();
        }
        catch (error) {
            console.error('Logout error:', error);
            alert('Fehler beim Abmelden: ' + error.message);
        }
    }
    async loadProfileAndShowGame() {
        try {
            const profile = await AuthAPI.getProfile();
            // Anzeigename setzen
            document.getElementById('user-display-name').textContent = profile.displayName;
            // Progression in die Game-Logik laden
            if (window.gameState) {
                window.gameState.level = profile.progression.level;
                window.gameState.xp = profile.progression.xp;
                window.gameState.gold = profile.progression.gold;
                window.gameState.updateUI();
            }
            this.showGameScreen();
        }
        catch (error) {
            console.error('Profile load error:', error);
            alert('Fehler beim Laden des Profils: ' + error.message);
        }
    }
    showAuthScreen() {
        this.authScreen.style.display = 'flex';
        this.gameScreen.style.display = 'none';
        this.clearForms();
        this.clearErrors();
    }
    showGameScreen() {
        this.authScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
    }
    clearForms() {
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-displayname').value = '';
    }
    async init() {
        // Prüfen ob bereits eingeloggt
        try {
            const profile = await AuthAPI.getProfile();
            document.getElementById('user-display-name').textContent = profile.displayName;
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
        }
        catch {
            // Nicht eingeloggt, zeige Auth-Screen
            this.showAuthScreen();
        }
    }
}
// Export für globalen Zugriff
window.authAPI = AuthAPI;
//# sourceMappingURL=auth.js.map