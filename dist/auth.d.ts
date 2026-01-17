export declare class AuthAPI {
    private static baseUrl;
    static register(email: string, password: string, displayName: string): Promise<any>;
    static login(email: string, password: string): Promise<any>;
    static logout(): Promise<any>;
    static getProfile(): Promise<any>;
    static saveProgression(level: number, xp: number, gold: number): Promise<any>;
}
export declare class AuthUI {
    private authScreen;
    private gameScreen;
    private loginTab;
    private registerTab;
    private loginForm;
    private registerForm;
    constructor();
    private setupEventListeners;
    private showLoginTab;
    private showRegisterTab;
    private clearErrors;
    private handleLogin;
    private handleRegister;
    private handleLogout;
    private loadProfileAndShowGame;
    private showAuthScreen;
    private showGameScreen;
    private clearForms;
    init(): Promise<void>;
}
declare global {
    interface Window {
        gameState: any;
        authAPI: typeof AuthAPI;
    }
}
//# sourceMappingURL=auth.d.ts.map