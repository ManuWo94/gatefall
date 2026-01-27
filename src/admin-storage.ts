/**
 * Admin Storage System für Gatefall
 * Verwaltet Skills, Gegner, Bosse, Characters, Attack Actions
 */

export interface AttackAction {
    id: string;
    action_id: string; // 'attack', 'strong-attack', 'block', 'dodge'
    name: string;
    description: string;
    icon?: string; // Base64 Data-URL
    base_damage?: number; // Basis-Schaden (z.B. 50)
    damage_multiplier: number; // 1.0 = normal, 1.5 = 150%
    stamina_cost: number;
    cooldown: number;
    can_block: boolean;
    can_dodge: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface SkillLevel {
    level: number;
    damage?: number;
    healing?: number;
    manaCost?: number;
    staminaCost?: number;
    cooldown?: number;
    description?: string;
}

export interface GameSkill {
    id: string;
    name: string;
    description: string;
    type: 'damage' | 'healing' | 'buff' | 'debuff' | 'utility';
    element?: 'physical' | 'fire' | 'ice' | 'lightning' | 'dark' | 'light';
    
    // Base Stats
    baseDamage?: number;
    baseHealing?: number;
    baseManaCost?: number;
    baseStaminaCost?: number;
    baseCooldown?: number;
    
    // Level Variants
    levels?: SkillLevel[];
    
    // Restrictions (Zweiphasiges System)
    roles: string[]; // ['waechter', 'assassine', 'magier', ...]
    canHunterUse: boolean; // Deprecated - Alle Skills nach Awakening nutzbar
    minPlayerLevel: number;
    requiresAwakening: boolean; // Skill erst ab Level 10 verfügbar
    
    // Hunter-Rang System
    moduleIndex?: number; // 0, 1, 2 für Modul 1, 2, 3
    requiresSpecialization?: string; // z.B. 'waechter_fortress'
    
    // Exklusive Skills (B-Rang+)
    isExclusive?: boolean; // Markiert exklusive Skills
    roleType?: 'tank' | 'dps' | 'support'; // Für rollenspezifische Mechaniken
    
    // Visual
    icon?: string; // Base64 Data-URL
    animation?: string;
    
    // Tags für Combat System
    tags?: string[];
    
    createdAt: number;
    updatedAt: number;
}

export interface Enemy {
    id: string;
    name: string;
    rank: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
    level: number;
    isBoss: boolean;
    description?: string;
    
    // Stats
    maxHp: number;
    baseDamage: number;
    defense: number;
    
    // Visual
    sprite?: string; // Base64 Data-URL (Icon für Kampfmenü)
    
    // Meta
    createdAt: number;
    updatedAt: number;
}

export interface CharacterTemplate {
    id: string;
    name: string;
    role: string;
    
    // Base Stats
    baseHp: number;
    baseMp: number;
    baseStamina: number;
    baseAttack: number;
    baseDefense: number;
    baseMagicPower: number;
    baseMagicDefense: number;
    baseSpeed: number;
    
    // Visuals
    sprite?: string; // Base64 Data-URL
    description?: string;
    
    // Starting Skills
    startingSkills: string[]; // Skill-IDs
    
    createdAt: number;
    updatedAt: number;
}

export interface NPCGuild {
    id: number;
    name: string;
    rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
    description?: string;
    members: number;
    
    // Benefits
    goldBonus: number; // Prozent
    expBonus: number; // Prozent
    
    // Requirements
    minHunterRank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
    minLevel: number;
    
    // Visual
    logo?: string; // Base64 Data-URL
    
    createdAt: number;
    updatedAt: number;
}

export interface GateImage {
    id: string;
    name: string;
    description?: string;
    image: string; // Base64 Data-URL or URL
    gateType: 'standard' | 'instabil' | 'elite' | 'katastrophe' | 'geheim';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

export interface BattleBackground {
    id: string;
    name: string;
    description?: string;
    image: string; // Base64 Data-URL
    cssClass: string; // z.B. 'bg-custom-1'
    createdAt: number;
    updatedAt: number;
}

export class AdminStorage {
    private static SKILLS_KEY = 'gatefall_admin_skills';
    private static ENEMIES_KEY = 'gatefall_admin_enemies';
    private static CHARACTERS_KEY = 'gatefall_admin_characters';
    private static GUILDS_KEY = 'gatefall_admin_guilds';
    private static BACKGROUNDS_KEY = 'gatefall_admin_backgrounds';
    private static ATTACK_ACTIONS_KEY = 'gatefall_admin_attack_actions';
    private static GATE_IMAGES_KEY = 'gatefall_admin_gate_images';
    
    // ==================== ATTACK ACTIONS ====================
    
    static getAllAttackActions(): AttackAction[] {
        const data = localStorage.getItem(this.ATTACK_ACTIONS_KEY);
        return data ? JSON.parse(data) : [];
    }
    
    static getAttackAction(id: string): AttackAction | null {
        const actions = this.getAllAttackActions();
        return actions.find(a => a.id === id) || null;
    }
    
    static saveAttackAction(action: AttackAction): void {
        const actions = this.getAllAttackActions();
        const index = actions.findIndex(a => a.id === action.id);
        
        action.updatedAt = Date.now();
        
        if (index >= 0) {
            actions[index] = action;
        } else {
            action.createdAt = Date.now();
            actions.push(action);
        }
        
        localStorage.setItem(this.ATTACK_ACTIONS_KEY, JSON.stringify(actions));
    }
    
    static deleteAttackAction(id: string): void {
        let actions = this.getAllAttackActions();
        actions = actions.filter(a => a.id !== id);
        localStorage.setItem(this.ATTACK_ACTIONS_KEY, JSON.stringify(actions));
    }
    
    // ==================== SKILLS ====================
    
    static getAllSkills(): GameSkill[] {
        const data = localStorage.getItem(this.SKILLS_KEY);
        return data ? JSON.parse(data) : [];
    }
    
    static getSkill(id: string): GameSkill | null {
        const skills = this.getAllSkills();
        return skills.find(s => s.id === id) || null;
    }
    
    static saveSkill(skill: GameSkill): void {
        const skills = this.getAllSkills();
        const index = skills.findIndex(s => s.id === skill.id);
        
        skill.updatedAt = Date.now();
        
        if (index >= 0) {
            skills[index] = skill;
        } else {
            skill.createdAt = Date.now();
            skills.push(skill);
        }
        
        localStorage.setItem(this.SKILLS_KEY, JSON.stringify(skills));
    }
    
    static deleteSkill(id: string): void {
        let skills = this.getAllSkills();
        skills = skills.filter(s => s.id !== id);
        localStorage.setItem(this.SKILLS_KEY, JSON.stringify(skills));
    }
    
    static getSkillsForRole(role: string, playerLevel: number = 1): GameSkill[] {
        const skills = this.getAllSkills();
        return skills.filter(s => 
            s.roles.includes(role) && 
            s.minPlayerLevel <= playerLevel
        );
    }
    
    // ==================== ENEMIES ====================
    
    static getAllEnemies(): Enemy[] {
        const data = localStorage.getItem(this.ENEMIES_KEY);
        return data ? JSON.parse(data) : [];
    }
    
    static getEnemy(id: string): Enemy | null {
        const enemies = this.getAllEnemies();
        return enemies.find(e => e.id === id) || null;
    }
    
    static saveEnemy(enemy: Enemy): void {
        const enemies = this.getAllEnemies();
        const index = enemies.findIndex(e => e.id === enemy.id);
        
        enemy.updatedAt = Date.now();
        
        if (index >= 0) {
            enemies[index] = enemy;
        } else {
            enemy.createdAt = Date.now();
            enemies.push(enemy);
        }
        
        localStorage.setItem(this.ENEMIES_KEY, JSON.stringify(enemies));
    }
    
    static deleteEnemy(id: string): void {
        let enemies = this.getAllEnemies();
        enemies = enemies.filter(e => e.id !== id);
        localStorage.setItem(this.ENEMIES_KEY, JSON.stringify(enemies));
    }
    
    static getBosses(): Enemy[] {
        return this.getAllEnemies().filter(e => e.isBoss);
    }
    
    static getNormalEnemies(): Enemy[] {
        return this.getAllEnemies().filter(e => !e.isBoss);
    }
    
    // ==================== CHARACTERS ====================
    
    static getAllCharacters(): CharacterTemplate[] {
        const data = localStorage.getItem(this.CHARACTERS_KEY);
        return data ? JSON.parse(data) : [];
    }
    
    static getCharacter(id: string): CharacterTemplate | null {
        const chars = this.getAllCharacters();
        return chars.find(c => c.id === id) || null;
    }
    
    static saveCharacter(char: CharacterTemplate): void {
        const chars = this.getAllCharacters();
        const index = chars.findIndex(c => c.id === char.id);
        
        char.updatedAt = Date.now();
        
        if (index >= 0) {
            chars[index] = char;
        } else {
            char.createdAt = Date.now();
            chars.push(char);
        }
        
        localStorage.setItem(this.CHARACTERS_KEY, JSON.stringify(chars));
    }
    
    static deleteCharacter(id: string): void {
        let chars = this.getAllCharacters();
        chars = chars.filter(c => c.id !== id);
        localStorage.setItem(this.CHARACTERS_KEY, JSON.stringify(chars));
    }
    
    // ==================== GUILDS ====================
    
    static getAllGuilds(): NPCGuild[] {
        const data = localStorage.getItem(this.GUILDS_KEY);
        return data ? JSON.parse(data) : this.getDefaultGuilds();
    }
    
    static getGuild(id: number): NPCGuild | null {
        const guilds = this.getAllGuilds();
        return guilds.find(g => g.id === id) || null;
    }
    
    static saveGuild(guild: NPCGuild): void {
        const guilds = this.getAllGuilds();
        const index = guilds.findIndex(g => g.id === guild.id);
        
        guild.updatedAt = Date.now();
        
        if (index >= 0) {
            guilds[index] = guild;
        } else {
            guild.createdAt = Date.now();
            guilds.push(guild);
        }
        
        localStorage.setItem(this.GUILDS_KEY, JSON.stringify(guilds));
    }
    
    static deleteGuild(id: number): void {
        let guilds = this.getAllGuilds();
        guilds = guilds.filter(g => g.id !== id);
        localStorage.setItem(this.GUILDS_KEY, JSON.stringify(guilds));
    }
    
    static getDefaultGuilds(): NPCGuild[] {
        return [
            {
                id: 1,
                name: 'Ahjin Guild',
                rank: 'S',
                description: 'Die elitärste Gilde, geführt von Sung Jin-Woo',
                members: 15,
                goldBonus: 50,
                expBonus: 30,
                minHunterRank: 'A',
                minLevel: 50,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 2,
                name: 'White Tiger Guild',
                rank: 'A',
                description: 'Eine starke Kampfgilde',
                members: 25,
                goldBonus: 30,
                expBonus: 20,
                minHunterRank: 'B',
                minLevel: 30,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 3,
                name: 'Fiend Guild',
                rank: 'B',
                description: 'Eine aufstrebende Gilde',
                members: 30,
                goldBonus: 20,
                expBonus: 15,
                minHunterRank: 'C',
                minLevel: 15,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];
    }
    
    // ==================== GATE IMAGES ====================
    
    static getAllGateImages(): GateImage[] {
        const data = localStorage.getItem(this.GATE_IMAGES_KEY);
        return data ? JSON.parse(data) : [];
    }
    
    static getGateImage(id: string): GateImage | null {
        const images = this.getAllGateImages();
        return images.find(img => img.id === id) || null;
    }
    
    static saveGateImage(image: GateImage): void {
        const images = this.getAllGateImages();
        const index = images.findIndex(img => img.id === image.id);
        
        image.updatedAt = Date.now();
        
        if (index >= 0) {
            images[index] = image;
        } else {
            image.createdAt = Date.now();
            images.push(image);
        }
        
        localStorage.setItem(this.GATE_IMAGES_KEY, JSON.stringify(images));
    }
    
    static deleteGateImage(id: string): void {
        let images = this.getAllGateImages();
        images = images.filter(img => img.id !== id);
        localStorage.setItem(this.GATE_IMAGES_KEY, JSON.stringify(images));
    }
    
    // ==================== UTILITIES ====================
    
    static exportAll(): string {
        return JSON.stringify({
            skills: this.getAllSkills(),
            enemies: this.getAllEnemies(),
            characters: this.getAllCharacters(),
            guilds: this.getAllGuilds(),
            backgrounds: this.getAllBackgrounds()
        }, null, 2);
    }
    
    static importAll(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.skills) {
                localStorage.setItem(this.SKILLS_KEY, JSON.stringify(data.skills));
            }
            if (data.enemies) {
                localStorage.setItem(this.ENEMIES_KEY, JSON.stringify(data.enemies));
            }
            if (data.characters) {
                localStorage.setItem(this.CHARACTERS_KEY, JSON.stringify(data.characters));
            }
            if (data.guilds) {
                localStorage.setItem(this.GUILDS_KEY, JSON.stringify(data.guilds));
            }
            if (data.backgrounds) {
                localStorage.setItem(this.BACKGROUNDS_KEY, JSON.stringify(data.backgrounds));
            }
        } catch (e) {
            throw new Error('Invalid JSON data');
        }
    }
    
    // ==================== BATTLE BACKGROUNDS ====================
    
    static getAllBackgrounds(): BattleBackground[] {
        const data = localStorage.getItem(this.BACKGROUNDS_KEY);
        return data ? JSON.parse(data) : [];
    }
    
    static getBackground(id: string): BattleBackground | null {
        const backgrounds = this.getAllBackgrounds();
        return backgrounds.find(b => b.id === id) || null;
    }
    
    static saveBackground(bg: BattleBackground): void {
        const backgrounds = this.getAllBackgrounds();
        const index = backgrounds.findIndex(b => b.id === bg.id);
        
        bg.updatedAt = Date.now();
        
        if (index >= 0) {
            backgrounds[index] = bg;
        } else {
            bg.createdAt = Date.now();
            backgrounds.push(bg);
        }
        
        localStorage.setItem(this.BACKGROUNDS_KEY, JSON.stringify(backgrounds));
    }
    
    static deleteBackground(id: string): void {
        let backgrounds = this.getAllBackgrounds();
        backgrounds = backgrounds.filter(b => b.id !== id);
        localStorage.setItem(this.BACKGROUNDS_KEY, JSON.stringify(backgrounds));
    }
    
    static resetAll(): void {
        if (confirm('WARNUNG: Alle Admin-Daten werden gelöscht! Fortfahren?')) {
            localStorage.removeItem(this.SKILLS_KEY);
            localStorage.removeItem(this.ENEMIES_KEY);
            localStorage.removeItem(this.CHARACTERS_KEY);
            localStorage.removeItem(this.GUILDS_KEY);
            localStorage.removeItem(this.BACKGROUNDS_KEY);
        }
    }
}
