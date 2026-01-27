/**
 * Rundenbasiertes Kampfsystem - Initialisierung
 */

import { TurnBasedCombatEngine } from './turn-based-engine.js';
import { FFCombatUI } from './ff-combat-ui.js';
import {
    CombatState,
    Player,
    Enemy,
    Role,
    TurnPhase,
    StatusEffectType,
    EnemyBehavior,
    EnemyDefinition
} from './types.js';

export class TurnBasedCombatSystem {
    private engine: TurnBasedCombatEngine | null = null;
    private ui: FFCombatUI | null = null;

    /**
     * Startet einen neuen rundenbasierten Kampf
     */
    startCombat(options: {
        playerName: string;
        playerLevel: number;
        playerRole: Role;
        playerHunterRank: string;
        enemy: EnemyDefinition;
        enemies?: EnemyDefinition[]; // Optional: Mehrere Gegner
    }): void {
        // Spieler erstellen
        const player: Player = {
            name: options.playerName,
            hp: 1000 + (options.playerLevel * 50),
            maxHp: 1000 + (options.playerLevel * 50),
            mp: 300 + (options.playerLevel * 10),
            maxMp: 300 + (options.playerLevel * 10),
            stamina: 100,
            maxStamina: 100,
            role: options.playerRole,
            level: options.playerLevel,
            hunterRank: options.playerHunterRank as any,
            specialization: undefined,
            affinityCapBonus: 0,
            shield: 0,
            damageReduction: 0,
            statusEffects: [],
            isBlocking: false,
            autoAttackDamage: 25 + (options.playerLevel * 5),
            autoAttackCount: 0,
            awakeningState: 'locked'
        };

        // Gegner erstellen (erster Gegner oder einzelner)
        const enemyBehavior = this.getEnemyBehavior(options.enemy);
        const enemy: Enemy = {
            name: options.enemy.name,
            hp: options.enemy.currentHp || options.enemy.maxHp,
            maxHp: options.enemy.maxHp,
            statusEffects: [],
            damageMultiplier: 1.0,
            baseDamage: options.enemy.autoAttackDamage,
            behavior: enemyBehavior,
            isBlocking: false,
            autoAttackDamage: options.enemy.autoAttackDamage
        };

        // Combat State initialisieren
        const initialState: CombatState = {
            player,
            enemy,
            isRunning: true,
            round: 1,
            turnPhase: TurnPhase.PLAYER_TURN,
            skillCooldowns: {
                skill1: 0,
                skill2: 0,
                skill3: 0,
                interrupt: 0
            },
            dungeonState: {
                isActive: true,
                currentDungeon: null,
                currentEnemyIndex: 0
            },
            progression: {
                level: options.playerLevel,
                xp: 0,
                gold: 0,
                hunterRank: options.playerHunterRank as any
            },
            combatLog: [],
            bossState: {
                isFightingBoss: !!options.enemy.isBoss,
                isEnraged: false,
                isPreparingSpecial: false,
                specialAttackDamage: 0,
                interruptCooldown: 5000
            },
            tickCount: 0
        };

        // Engine und UI erstellen
        this.engine = new TurnBasedCombatEngine(initialState);
        this.ui = new FFCombatUI(this.engine, 'combat-container');
        
        // Wenn mehrere Gegner vorhanden sind, setze sie in der UI
        if (options.enemies && options.enemies.length > 0) {
            const enemyList = options.enemies.map(e => ({
                name: e.name,
                hp: e.currentHp || e.maxHp,
                maxHp: e.maxHp,
                behavior: this.getEnemyBehavior(e),
                autoAttackDamage: e.autoAttackDamage,
                isBoss: e.isBoss || false,
                sprite: e.sprite // Bild aus DB
            }));
            this.ui.setEnemies(enemyList);
            console.log(`⚔️ Multi-Enemy Kampf: ${enemyList.length} Gegner`);
        }
        
        // Verstecke Placeholder
        const placeholder = document.getElementById('combat-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        console.log('⚔️ Rundenbasierter Kampf gestartet!');
        console.log('👤 Spieler:', player.name, 'Lvl', player.level, player.role);
        console.log('👹 Gegner:', enemy.name, 'HP', enemy.maxHp, 'Verhalten:', enemy.behavior);
    }

    /**
     * Bestimmt das Verhalten des Gegners basierend auf Typ
     */
    private getEnemyBehavior(enemy: EnemyDefinition): EnemyBehavior {
        if (enemy.isBoss) {
            return EnemyBehavior.AGGRESSIVE;
        }

        // Basierend auf Namen/Typ
        const name = enemy.name.toLowerCase();
        if (name.includes('wolf') || name.includes('berserker') || name.includes('ork')) {
            return EnemyBehavior.AGGRESSIVE;
        } else if (name.includes('golem') || name.includes('wächter') || name.includes('schildträger')) {
            return EnemyBehavior.DEFENSIVE;
        }

        return EnemyBehavior.BALANCED;
    }

    /**
     * Kampf beenden
     */
    endCombat(): void {
        if (this.ui) {
            this.ui.destroy();
        }
        
        this.engine = null;
        this.ui = null;
        
        const container = document.getElementById('combat-container');
        if (container) {
            container.innerHTML = '';
        }
        
        // Zeige Placeholder wieder an
        const placeholder = document.getElementById('combat-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }

        console.log('⚔️ Kampf beendet');
    }

    /**
     * Gibt den aktuellen Combat-State zurück
     */
    getState(): CombatState | null {
        return this.engine ? this.engine.getState() : null;
    }

    /**
     * Prüft ob Kampf läuft
     */
    isActive(): boolean {
        return this.engine !== null && this.engine.getState().isRunning;
    }
    
    /**
     * Startet Gate-Combat mit mehreren Gegnern (für FF-UI)
     */
    startGateCombat(config: any): void {
        // Erster Gegner für Engine
        const firstEnemy = config.enemies && config.enemies.length > 0 ? config.enemies[0] : null;
        
        if (!firstEnemy) {
            console.error('Keine Gegner vorhanden!');
            return;
        }
        
        // Spieler erstellen
        const player: Player = {
            name: config.playerName,
            hp: 1000 + (config.playerLevel * 50),
            maxHp: 1000 + (config.playerLevel * 50),
            mp: 300 + (config.playerLevel * 10),
            maxMp: 300 + (config.playerLevel * 10),
            stamina: 100,
            maxStamina: 100,
            role: config.playerRole,
            level: config.playerLevel,
            hunterRank: config.playerHunterRank as any,
            specialization: undefined,
            affinityCapBonus: 0,
            shield: 0,
            damageReduction: 0,
            statusEffects: [],
            isBlocking: false,
            autoAttackDamage: 25 + (config.playerLevel * 5),
            autoAttackCount: 0,
            awakeningState: 'locked'
        };

        // Gegner erstellen
        const enemyBehavior = this.getEnemyBehavior(firstEnemy);
        const enemy: Enemy = {
            name: firstEnemy.name,
            hp: firstEnemy.maxHp,
            maxHp: firstEnemy.maxHp,
            statusEffects: [],
            damageMultiplier: 1.0,
            baseDamage: firstEnemy.autoAttackDamage,
            behavior: enemyBehavior,
            isBlocking: false,
            autoAttackDamage: firstEnemy.autoAttackDamage
        };

        // Combat State initialisieren
        const initialState: CombatState = {
            player,
            enemy,
            isRunning: true,
            round: 1,
            turnPhase: TurnPhase.PLAYER_TURN,
            skillCooldowns: {
                skill1: 0,
                skill2: 0,
                skill3: 0,
                interrupt: 0
            },
            dungeonState: {
                isActive: false,
                currentDungeon: null,
                currentEnemyIndex: 0
            },
            progression: {
                level: config.playerLevel,
                xp: 0,
                gold: 0,
                hunterRank: config.playerHunterRank as any
            },
            combatLog: [],
            bossState: {
                isFightingBoss: !!firstEnemy.isBoss,
                isEnraged: false,
                isPreparingSpecial: false,
                specialAttackDamage: 0,
                interruptCooldown: 5000
            },
            tickCount: 0
        };

        // Engine und UI erstellen
        this.engine = new TurnBasedCombatEngine(initialState);
        this.ui = new FFCombatUI(this.engine, 'combat-container');
        
        // ✨ Wichtig: Starte Gate Combat mit allen Gegnern (Multi-Enemy)
        // Dies setzt this.allEnemies in der UI und startet den Multi-Enemy Flow
        this.ui.startGateCombat(config);
        
        console.log(`⚔️ Gate "${config.gateName}" betreten - ${config.enemies.length} Gegner!`);
    }

    /**
     * Startet Kampf basierend auf Gate-Daten aus MySQL
     */
    async startGateCombatFromDB(gate: any): Promise<void> {
        console.log('🎮 startGateCombatFromDB called with gate:', gate);
        
        // Get player data
        const playerData = (window as any).gameState;
        console.log('👤 Player data:', playerData);
        
        // Load enemies from database based on gate rank and level
        const enemies = await this.loadGateEnemiesFromDB(gate);
        console.log('👹 Loaded enemies from DB:', enemies);
        
        const config = {
            gateName: gate.name,
            gateRank: gate.gate_rank,
            gateLevel: gate.level,
            playerName: playerData.playerName || 'Hunter',
            playerLevel: playerData.level || 1,
            playerRole: playerData.role || 'Krieger' as Role,
            playerHunterRank: playerData.hunterRank || 'E',
            enemies: enemies
        };
        
        console.log('⚙️ Combat config:', config);
        console.log('🚀 Starting gate combat...');
        
        this.startGateCombat(config);
        
        console.log('✅ startGateCombat called');
    }
    
    /**
     * Lädt echte Gegner aus der Datenbank basierend auf Gate-Daten
     * Flow: Erst normale Gegner (2-4 Stück), dann Boss am Ende
     */
    private async loadGateEnemiesFromDB(gate: any): Promise<EnemyDefinition[]> {
        try {
            const enemies: EnemyDefinition[] = [];
            
            // Bestimme Anzahl der normalen Gegner basierend auf Gate-Typ
            const normalEnemyCount = gate.gate_type === 'raid' ? 4 : 
                                    gate.gate_type === 'elite' ? 3 : 
                                    gate.gate_type === 'dungeon' ? 2 : 2;
            
            // 1. PHASE: Lade normale Gegner (kämpfen VOR dem Boss)
            console.log(`📦 Loading ${normalEnemyCount} normal enemies for gate level ${gate.level}...`);
            const enemiesResponse = await fetch(`http://localhost:3001/api/combat/enemies?is_boss=false&level=${gate.level}`);
            if (enemiesResponse.ok) {
                const enemyData = await enemiesResponse.json();
                if (enemyData.enemies && enemyData.enemies.length > 0) {
                    const availableEnemies = enemyData.enemies;
                    
                    // Nimm zufällige normale Gegner
                    for (let i = 0; i < normalEnemyCount; i++) {
                        const randomIndex = Math.floor(Math.random() * availableEnemies.length);
                        const enemy = availableEnemies[randomIndex];
                        enemies.push({
                            id: `${enemy.id}_${i}`,
                            name: enemy.name,
                            maxHp: enemy.hp,
                            autoAttackDamage: enemy.attack,
                            isBoss: false,
                            sprite: enemy.sprite
                        });
                        console.log(`👹 [${i+1}/${normalEnemyCount}] Enemy: ${enemy.name}`, enemy.sprite ? '🖼️' : '');
                    }
                }
            }
            
            // 2. PHASE: Lade Boss (kämpft am ENDE des Gates)
            console.log(`👑 Loading boss for gate level ${gate.level}...`);
            const bossResponse = await fetch(`http://localhost:3001/api/combat/enemies?is_boss=true&level=${gate.level}`);
            if (bossResponse.ok) {
                const bossData = await bossResponse.json();
                if (bossData.enemies && bossData.enemies.length > 0) {
                    const boss = bossData.enemies[0]; // Nimm ersten passenden Boss
                    enemies.push({
                        id: boss.id,
                        name: boss.name,
                        maxHp: boss.hp,
                        autoAttackDamage: boss.attack,
                        isBoss: true,
                        sprite: boss.sprite
                    });
                    console.log(`👑 Boss: ${boss.name}`, boss.sprite ? '🖼️' : '', '(fights LAST)');
                    
                    // Optional: Bei Raids/Elite-Gates kann Boss Begleiter haben
                    if (gate.gate_type === 'raid' || gate.gate_type === 'elite') {
                        // Füge 1-2 zusätzliche Gegner hinzu die MIT dem Boss kämpfen
                        const companionCount = gate.gate_type === 'raid' ? 2 : 1;
                        const companionsResponse = await fetch(`http://localhost:3001/api/combat/enemies?is_boss=false&level=${gate.level}`);
                        if (companionsResponse.ok) {
                            const companionData = await companionsResponse.json();
                            if (companionData.enemies && companionData.enemies.length > 0) {
                                for (let i = 0; i < companionCount; i++) {
                                    const randomIndex = Math.floor(Math.random() * companionData.enemies.length);
                                    const companion = companionData.enemies[randomIndex];
                                    enemies.push({
                                        id: `${companion.id}_boss_companion_${i}`,
                                        name: `${companion.name} (Wächter)`,
                                        maxHp: companion.hp,
                                        autoAttackDamage: companion.attack,
                                        isBoss: false,
                                        sprite: companion.sprite
                                    });
                                    console.log(`🛡️ Boss Companion [${i+1}]: ${companion.name}`);
                                }
                            }
                        }
                    }
                }
            }
            
            // Fallback: Wenn keine Gegner aus DB geladen wurden, generiere welche
            if (enemies.length === 0) {
                console.warn('⚠️ No enemies found in DB, generating fallback enemies');
                return this.generateGateEnemies(gate);
            }
            
            console.log(`✅ Loaded ${enemies.length} total enemies from DB`);
            return enemies;
        } catch (error) {
            console.error('❌ Error loading enemies from DB:', error);
            return this.generateGateEnemies(gate);
        }
    }
    
    /**
     * Fallback: Generiert Gegner basierend auf Gate-Daten (falls DB leer)
     */
    private generateGateEnemies(gate: any): EnemyDefinition[] {
        const enemies: EnemyDefinition[] = [];
        const rankMultiplier = this.getRankMultiplier(gate.gate_rank);
        const baseHp = 500 + (gate.level * 50);
        const baseDamage = 20 + (gate.level * 3);
        
        // Anzahl Gegner basierend auf Gate-Typ
        const enemyCount = gate.gate_type === 'raid' ? 5 : 
                          gate.gate_type === 'boss' ? 1 :
                          gate.gate_type === 'elite' ? 3 : 2;
        
        for (let i = 0; i < enemyCount; i++) {
            const isBoss = gate.gate_type === 'boss' || (i === enemyCount - 1 && gate.gate_type === 'dungeon');
            
            enemies.push({
                id: gate.id * 100 + i,
                name: isBoss ? `${gate.gate_rank}-Rang Boss` : `${gate.gate_rank}-Rang Monster`,
                maxHp: Math.floor(baseHp * rankMultiplier * (isBoss ? 3 : 1)),
                autoAttackDamage: Math.floor(baseDamage * rankMultiplier * (isBoss ? 1.5 : 1)),
                isBoss: isBoss
            });
        }
        
        return enemies;
    }
    
    /**
     * Rang-Multiplikator für Gegner-Stats
     */
    private getRankMultiplier(rank: string): number {
        const multipliers: Record<string, number> = {
            'E': 1.0,
            'D': 1.5,
            'C': 2.0,
            'B': 3.0,
            'A': 4.5,
            'S': 6.5,
            'SS': 9.0,
            'SSS': 12.0
        };
        return multipliers[rank] || 1.0;
    }
}

// Singleton-Instanz
export const turnBasedCombat = new TurnBasedCombatSystem();
