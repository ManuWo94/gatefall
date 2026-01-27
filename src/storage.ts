/**
 * Lokaler Speicher für Spielerdaten (ersetzt Datenbank)
 */

export interface PlayerData {
  id: number;
  email: string;
  passwordHash: string;
  displayName: string;
  role: string;
  level: number;
  experience: number;
  hunterRank: string;
  specialization?: string;
  affinityCapBonus?: number;
  stats: {
    strength: number;
    vitality: number;
    agility: number;
    intelligence: number;
    perception: number;
  };
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
  gold: number;
  equippedSkills: string[];
  guildId: number | null;
  isAdmin: boolean; // Admin-Flag
  createdAt: string;
}

export interface SessionData {
  playerId: number;
  email: string;
  loginTime: string;
}

class LocalStorage {
  private static PLAYERS_KEY = 'gatefall_players';
  private static SESSION_KEY = 'gatefall_session';
  private static NEXT_ID_KEY = 'gatefall_next_id';

  // ==================== Spieler-Verwaltung ====================
  
  static getAllPlayers(): PlayerData[] {
    const data = localStorage.getItem(this.PLAYERS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveAllPlayers(players: PlayerData[]): void {
    localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(players));
  }

  static getPlayerByEmail(email: string): PlayerData | null {
    const players = this.getAllPlayers();
    return players.find(p => p.email === email) || null;
  }

  static getPlayerById(id: number): PlayerData | null {
    const players = this.getAllPlayers();
    return players.find(p => p.id === id) || null;
  }

  static createPlayer(email: string, password: string, displayName: string, role: string): PlayerData {
    const players = this.getAllPlayers();
    
    // Prüfen ob Email schon existiert
    if (players.some(p => p.email === email)) {
      throw new Error('Email bereits registriert');
    }

    // Nächste ID
    let nextId = parseInt(localStorage.getItem(this.NEXT_ID_KEY) || '1');
    
    // Rolle Stats
    const roleStats = this.getRoleStats(role);
    
    const newPlayer: PlayerData = {
      id: nextId,
      email: email,
      passwordHash: this.simpleHash(password), // Einfacher Hash (nur für Demo)
      displayName: displayName,
      role: role,
      level: 1,
      experience: 0,
      hunterRank: 'D',
      stats: {
        strength: roleStats.str,
        vitality: roleStats.vit,
        agility: roleStats.agi,
        intelligence: roleStats.int,
        perception: roleStats.per
      },
      currentHp: roleStats.hp,
      maxHp: roleStats.hp,
      currentMp: roleStats.mp,
      maxMp: roleStats.mp,
      gold: 0,
      equippedSkills: [],
      guildId: null,
      isAdmin: false, // Normale User sind keine Admins
      createdAt: new Date().toISOString()
    };

    players.push(newPlayer);
    this.saveAllPlayers(players);
    localStorage.setItem(this.NEXT_ID_KEY, (nextId + 1).toString());
    
    return newPlayer;
  }

  static updatePlayer(id: number, updates: Partial<PlayerData>): PlayerData | null {
    const players = this.getAllPlayers();
    const index = players.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    players[index] = { ...players[index], ...updates };
    this.saveAllPlayers(players);
    
    return players[index];
  }

  // ==================== Session-Verwaltung ====================
  
  static getSession(): SessionData | null {
    const data = localStorage.getItem(this.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }

  static createSession(playerId: number, email: string): void {
    const session: SessionData = {
      playerId,
      email,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static isLoggedIn(): boolean {
    return this.getSession() !== null;
  }

  static getCurrentPlayer(): PlayerData | null {
    const session = this.getSession();
    if (!session) return null;
    return this.getPlayerById(session.playerId);
  }
  
  static updateCurrentPlayer(updates: Partial<PlayerData>): void {
    const session = this.getSession();
    if (!session) throw new Error('Nicht eingeloggt');
    
    const players = this.getAllPlayers();
    const playerIndex = players.findIndex(p => p.id === session.playerId);
    
    if (playerIndex === -1) throw new Error('Spieler nicht gefunden');
    
    players[playerIndex] = { ...players[playerIndex], ...updates };
    this.saveAllPlayers(players);
  }

  // ==================== Auth ====================
  
  static login(email: string, password: string): PlayerData {
    const player = this.getPlayerByEmail(email);
    
    if (!player) {
      throw new Error('Email oder Passwort falsch');
    }
    
    if (player.passwordHash !== this.simpleHash(password)) {
      throw new Error('Email oder Passwort falsch');
    }
    
    this.createSession(player.id, player.email);
    return player;
  }

  static register(email: string, password: string, displayName: string, role: string): PlayerData {
    const player = this.createPlayer(email, password, displayName, role);
    this.createSession(player.id, player.email);
    return player;
  }

  static logout(): void {
    this.clearSession();
  }

  // ==================== Hilfsfunktionen ====================
  
  private static simpleHash(text: string): string {
    // Einfacher Hash für Demo (NICHT sicher für Produktion!)
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private static getRoleStats(role: string): any {
    const stats: any = {
      'waechter': { hp: 140, mp: 60, str: 12, vit: 14, agi: 8, int: 6, per: 8 },
      'assassine': { hp: 85, mp: 60, str: 10, vit: 8, agi: 14, int: 6, per: 12 },
      'magier': { hp: 80, mp: 120, str: 6, vit: 7, agi: 8, int: 16, per: 10 },
      'heiler': { hp: 90, mp: 100, str: 7, vit: 10, agi: 9, int: 13, per: 11 },
      'beschwoerer': { hp: 85, mp: 110, str: 6, vit: 8, agi: 9, int: 15, per: 11 },
      'berserker': { hp: 120, mp: 50, str: 15, vit: 12, agi: 10, int: 5, per: 8 },
      'fluchwirker': { hp: 75, mp: 105, str: 7, vit: 7, agi: 8, int: 14, per: 12 }
    };
    return stats[role] || stats['waechter'];
  }

  // ==================== Debug ====================
  
  static clearAll(): void {
    localStorage.removeItem(this.PLAYERS_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.NEXT_ID_KEY);
  }

  static debugInfo(): void {
    console.log('=== Gatefall LocalStorage ===');
    console.log('Players:', this.getAllPlayers());
    console.log('Session:', this.getSession());
    console.log('Current Player:', this.getCurrentPlayer());
  }
  
  // ==================== Admin ====================
  
  static createAdminIfNotExists(): void {
    const admins = this.getAllPlayers().filter(p => p.isAdmin);
    if (admins.length === 0) {
      const adminPlayer: PlayerData = {
        id: 1,
        email: 'admin@gatefall.de',
        passwordHash: this.simpleHash('admin123'),
        displayName: '⚙️ ADMIN',
        role: 'admin',
        level: 99,
        experience: 0,
        hunterRank: 'S',
        stats: {
          strength: 999,
          vitality: 999,
          agility: 999,
          intelligence: 999,
          perception: 999
        },
        currentHp: 9999,
        maxHp: 9999,
        currentMp: 9999,
        maxMp: 9999,
        gold: 999999,
        equippedSkills: [],
        guildId: null,
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      const players = this.getAllPlayers();
      players.push(adminPlayer);
      this.saveAllPlayers(players);
      
      // Automatisch einloggen
      this.createSession(1, 'admin@gatefall.de');
      
      console.log('✅ Admin-Account erstellt: admin@gatefall.de / admin123');
    }
  }
}

export default LocalStorage;
