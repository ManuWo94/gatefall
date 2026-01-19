/**
 * COMBAT SYSTEM INITIALIZATION
 * Entry-Point für das neue Kampfsystem
 */
import { NewCombatEngine } from './new-engine.js';
import { CombatUI } from './combat-ui.js';
import { CombatRole } from './combat-types.js';
import { getActionsForRole, ENEMY_BASIC_ACTIONS, ENEMY_ADVANCED_ACTIONS, BOSS_ACTIONS } from './actions.js';
export class CombatSystem {
    constructor() {
        this.engine = null;
        this.ui = null;
    }
    /**
     * Startet einen neuen Kampf
     */
    startCombat(options) {
        // Spieler erstellen
        const playerActions = getActionsForRole(options.playerRole);
        console.log('🎮 Player Role:', options.playerRole);
        console.log('⚔️ Available Actions:', playerActions.length, playerActions.map(a => a.name));
        const player = {
            id: 'player',
            name: 'Du',
            isPlayer: true,
            level: options.playerLevel,
            hp: 1000 + (options.playerLevel * 50),
            maxHp: 1000 + (options.playerLevel * 50),
            mana: 300 + (options.playerLevel * 10),
            maxMana: 300 + (options.playerLevel * 10),
            hunterRank: options.playerHunterRank,
            role: options.playerRole,
            statusEffects: [],
            shield: 0,
            damageReduction: 0.1,
            availableActions: playerActions,
            currentAction: null,
            actionCooldowns: new Map(),
            isAI: false
        };
        // Gegner erstellen (max 3 für übersichtlichkeit)
        const enemies = options.enemies.slice(0, 3).map((e, idx) => {
            const isBoss = e.isBoss || false;
            const enemyLevel = e.level || options.playerLevel; // Fallback zum Player-Level
            console.log('👹 Creating enemy:', e.name, 'Level:', enemyLevel, 'Boss:', isBoss);
            return {
                id: `enemy_${idx}`,
                name: e.name,
                isPlayer: false,
                level: enemyLevel,
                hp: isBoss ? 5000 + (enemyLevel * 150) : 800 + (enemyLevel * 50),
                maxHp: isBoss ? 5000 + (enemyLevel * 150) : 800 + (enemyLevel * 50),
                statusEffects: [],
                shield: 0,
                damageReduction: isBoss ? 0.35 : 0.15,
                availableActions: isBoss
                    ? [...ENEMY_BASIC_ACTIONS, ...ENEMY_ADVANCED_ACTIONS, ...BOSS_ACTIONS]
                    : [...ENEMY_BASIC_ACTIONS, ...ENEMY_ADVANCED_ACTIONS],
                currentAction: null,
                actionCooldowns: new Map(),
                isAI: true,
                aiPattern: {
                    type: isBoss ? 'boss' : 'basic',
                    currentPhase: 0,
                    aggressiveness: isBoss ? 0.8 : 0.5,
                    preferredRange: 'mixed',
                    usesSpecials: isBoss,
                    phases: isBoss ? [
                        {
                            hpThreshold: 0.75,
                            newActions: ['devastating_blow'],
                            speedModifier: 1.0,
                            message: '⚠️ SYSTEM: Phase 2 aktiviert'
                        },
                        {
                            hpThreshold: 0.50,
                            newActions: ['dark_ritual'],
                            speedModifier: 1.2,
                            message: '🔴 SYSTEM: Phase 3 aktiviert - Erhöhte Geschwindigkeit'
                        },
                        {
                            hpThreshold: 0.25,
                            newActions: ['meteor_strike'],
                            speedModifier: 1.5,
                            message: '🔴🔴 SYSTEM: FINALE PHASE - Maximale Aggression'
                        }
                    ] : undefined
                }
            };
        });
        // Trupp-Mitglieder (max 2 für Übersichtlichkeit)
        const squadMembers = (options.squadMembers || []).slice(0, 2).map((s, idx) => ({
            id: `squad_${idx}`,
            name: s.name,
            isPlayer: true,
            level: s.level,
            hp: 800 + (s.level * 40),
            maxHp: 800 + (s.level * 40),
            mana: 200 + (s.level * 8),
            maxMana: 200 + (s.level * 8),
            role: s.role,
            statusEffects: [],
            shield: 0,
            damageReduction: 0.08,
            availableActions: getActionsForRole(s.role),
            currentAction: null,
            actionCooldowns: new Map(),
            isAI: true,
            aiPattern: {
                type: 'basic',
                currentPhase: 0,
                aggressiveness: 0.4,
                preferredRange: 'mixed',
                usesSpecials: false
            }
        }));
        // Combat State
        const initialState = {
            tickCount: 0,
            tickDuration: 5000, // 5000ms = 5 Sekunden pro Tick (SEHR langsam)
            isRunning: false,
            isPaused: false,
            player,
            enemies,
            squadMembers,
            currentTargetId: enemies[0]?.id || null,
            activeTelegraphs: [],
            combatLog: [],
            victor: null
        };
        // Engine & UI initialisieren
        this.engine = new NewCombatEngine(initialState);
        this.ui = new CombatUI(this.engine, 'combat-ui-container');
        console.log('🚀 Starting combat...');
        // Kampf starten
        this.engine.start();
        console.log('✅ Combat started, isRunning:', this.engine.getState().isRunning);
    }
    /**
     * Stoppt den aktuellen Kampf
     */
    stopCombat() {
        if (this.engine) {
            this.engine.stop('player'); // oder 'enemy'
        }
    }
    /**
     * Pausiert den Kampf
     */
    pauseCombat() {
        if (this.engine) {
            this.engine.pause();
        }
    }
    /**
     * Setzt den Kampf fort
     */
    resumeCombat() {
        if (this.engine) {
            this.engine.resume();
        }
    }
    /**
     * Gibt die aktuelle Engine zurück (für direkten Zugriff)
     */
    getEngine() {
        return this.engine;
    }
}
// Globale Instanz
export const combatSystem = new CombatSystem();
// Beispiel-Aufruf (kann später entfernt werden)
export function startTestCombat() {
    combatSystem.startCombat({
        playerLevel: 45,
        playerRole: CombatRole.WAECHTER,
        playerHunterRank: 'S',
        enemies: [
            { name: 'Schattenbestie', level: 48, isBoss: false },
            { name: 'Dungeon-Boss', level: 50, isBoss: true }
        ],
        squadMembers: [
            { name: 'Rookie Jin', level: 40, role: CombatRole.JAEGER },
            { name: 'Mage Sarah', level: 42, role: CombatRole.MAGIER }
        ]
    });
}
//# sourceMappingURL=combat-init.js.map