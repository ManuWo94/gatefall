/**
 * Gate & Boss Definitions
 * Prozedural generierte Dungeons mit verschiedenen Schwierigkeitsgraden
 */
/**
 * Boss-Pool nach Rang organisiert
 */
export const BOSS_POOL = {
    'D': [
        // D-RANG BOSSGEGNER
        { name: '🟤 Höhlentroll', rank: 'D', type: 'boss', baseHp: 500, baseDamage: 25 },
        { name: '🟤 Der Grabwächter', rank: 'D', type: 'boss', baseHp: 450, baseDamage: 30 },
        { name: '🟤 Verseuchter Oger', rank: 'D', type: 'boss', baseHp: 550, baseDamage: 22 },
        { name: '🟤 Knochenkoloss', rank: 'D', type: 'boss', baseHp: 600, baseDamage: 20 },
        { name: '🟤 Der Steinbrut-Hüter', rank: 'D', type: 'boss', baseHp: 520, baseDamage: 28 },
        { name: '🟤 Verrotteter Kriegsgolem', rank: 'D', type: 'boss', baseHp: 480, baseDamage: 26 },
        // D-RANG ELITE/MINI-BOSSE
        { name: 'Verfluchte Bestie', rank: 'D', type: 'elite-mini-boss', baseHp: 250, baseDamage: 18 },
        { name: 'Untoter Wächter', rank: 'D', type: 'elite-mini-boss', baseHp: 220, baseDamage: 20 },
        { name: 'Primitiver Dämon', rank: 'D', type: 'elite-mini-boss', baseHp: 200, baseDamage: 22 },
        { name: 'Berserker-Kreatur', rank: 'D', type: 'elite-mini-boss', baseHp: 280, baseDamage: 16 }
    ],
    'C': [
        // C-RANG BOSSGEGNER
        { name: '🔵 Schattenbestie', rank: 'C', type: 'boss', baseHp: 800, baseDamage: 35 },
        { name: '🔵 Flammenhüter', rank: 'C', type: 'boss', baseHp: 750, baseDamage: 40 },
        { name: '🔵 Der Blutritter', rank: 'C', type: 'boss', baseHp: 900, baseDamage: 32 },
        { name: '🔵 Der Aschefürst', rank: 'C', type: 'boss', baseHp: 850, baseDamage: 38 },
        { name: '🔵 Der Knochensammler', rank: 'C', type: 'boss', baseHp: 820, baseDamage: 36 },
        { name: '🔵 Der Sturmjäger', rank: 'C', type: 'boss', baseHp: 780, baseDamage: 42 },
        // C-RANG ELITE/MINI-BOSSE
        { name: 'Schattenläufer', rank: 'C', type: 'elite-mini-boss', baseHp: 350, baseDamage: 25 },
        { name: 'Flammenpriester', rank: 'C', type: 'elite-mini-boss', baseHp: 380, baseDamage: 28 },
        { name: 'Blutverderbter Soldat', rank: 'C', type: 'elite-mini-boss', baseHp: 320, baseDamage: 30 },
        { name: 'Elementarwächter', rank: 'C', type: 'elite-mini-boss', baseHp: 400, baseDamage: 24 }
    ],
    'B': [
        // B-RANG BOSSGEGNER
        { name: '🟢 Der Kettenrichter ⭐', rank: 'B', type: 'boss', baseHp: 1200, baseDamage: 48 },
        { name: '🟢 Der Blutarchivar ⭐', rank: 'B', type: 'boss', baseHp: 1150, baseDamage: 52 },
        { name: '🟢 Der Vergessene Vollstrecker', rank: 'B', type: 'boss', baseHp: 1300, baseDamage: 45 },
        { name: '🟢 Der Flüsternde Schlächter', rank: 'B', type: 'boss', baseHp: 1250, baseDamage: 50 },
        { name: '🟢 Der Stille Kerkermeister', rank: 'B', type: 'boss', baseHp: 1180, baseDamage: 54 },
        { name: '🟢 Der Runenexekutor', rank: 'B', type: 'boss', baseHp: 1220, baseDamage: 46 },
        { name: '🟢 Der Schwarze Inquisitor', rank: 'B', type: 'boss', baseHp: 1280, baseDamage: 48 },
        // B-RANG ELITE/MINI-BOSSE
        { name: 'Verlorener Hunter', rank: 'B', type: 'elite-mini-boss', baseHp: 500, baseDamage: 35 },
        { name: 'Runenwächter', rank: 'B', type: 'elite-mini-boss', baseHp: 550, baseDamage: 32 },
        { name: 'Kettenknecht', rank: 'B', type: 'elite-mini-boss', baseHp: 480, baseDamage: 38 },
        { name: 'Beschwörerkonstrukt', rank: 'B', type: 'elite-mini-boss', baseHp: 520, baseDamage: 36 },
        { name: 'Blutritualist', rank: 'B', type: 'elite-mini-boss', baseHp: 460, baseDamage: 40 }
    ],
    'A': [
        // A-RANG BOSSGEGNER
        { name: '🟡 Dämonenfürst Khar\'zul', rank: 'A', type: 'boss', baseHp: 1800, baseDamage: 65 },
        { name: '🟡 Der Seelenverschlinger', rank: 'A', type: 'boss', baseHp: 1900, baseDamage: 62 },
        { name: '🟡 Der Runenarchitekt', rank: 'A', type: 'boss', baseHp: 1750, baseDamage: 68 },
        { name: '🟡 Der Leerenkommandant', rank: 'A', type: 'boss', baseHp: 2000, baseDamage: 60 },
        { name: '🟡 Der Verderber', rank: 'A', type: 'boss', baseHp: 1850, baseDamage: 66 },
        { name: '🟡 Der Astralrichter', rank: 'A', type: 'boss', baseHp: 1920, baseDamage: 64 },
        { name: '🟡 Die Aschekönigin', rank: 'A', type: 'boss', baseHp: 1780, baseDamage: 70 },
        // A-RANG ELITE/MINI-BOSSE
        { name: 'Dämonenoffizier', rank: 'A', type: 'elite-mini-boss', baseHp: 700, baseDamage: 48 },
        { name: 'Seelenjäger', rank: 'A', type: 'elite-mini-boss', baseHp: 750, baseDamage: 45 },
        { name: 'Elite-Wächter', rank: 'A', type: 'elite-mini-boss', baseHp: 680, baseDamage: 50 },
        { name: 'Verderbter Magister', rank: 'A', type: 'elite-mini-boss', baseHp: 720, baseDamage: 52 }
    ],
    'S': [
        // S-RANG BOSSGEGNER
        { name: '🔴 Erzdrache Vorthyx', rank: 'S', type: 'boss', baseHp: 3000, baseDamage: 85 },
        { name: '🔴 Leviathan der Tiefe', rank: 'S', type: 'boss', baseHp: 3200, baseDamage: 80 },
        { name: '🔴 Der König der Verdammten', rank: 'S', type: 'boss', baseHp: 2900, baseDamage: 90 },
        { name: '🔴 Der Weltenrichter', rank: 'S', type: 'boss', baseHp: 3100, baseDamage: 82 },
        { name: '🔴 Der Leerenmonarch', rank: 'S', type: 'boss', baseHp: 3300, baseDamage: 78 },
        { name: '🔴 Der Zeitverzerrer', rank: 'S', type: 'boss', baseHp: 2850, baseDamage: 95 },
        { name: '🔴 Der Thronlose König', rank: 'S', type: 'boss', baseHp: 3050, baseDamage: 88 },
        // S-RANG ELITE/MINI-BOSSE
        { name: 'Katastrophenbestie', rank: 'S', type: 'elite-mini-boss', baseHp: 1100, baseDamage: 65 },
        { name: 'Monarchen-Herold', rank: 'S', type: 'elite-mini-boss', baseHp: 1200, baseDamage: 60 },
        { name: 'Apokalyptischer Wächter', rank: 'S', type: 'elite-mini-boss', baseHp: 1000, baseDamage: 70 }
    ],
    'SS': [
        // SS-RANG BOSSGEGNER
        { name: '⚫ Der Namenlose Monarch', rank: 'SS', type: 'boss', baseHp: 5000, baseDamage: 120 },
        { name: '⚫ Der Erste Schatten', rank: 'SS', type: 'boss', baseHp: 4800, baseDamage: 125 },
        { name: '⚫ Der Weltenverschlinger', rank: 'SS', type: 'boss', baseHp: 5500, baseDamage: 115 },
        { name: '⚫ Der Architekt des Systems', rank: 'SS', type: 'boss', baseHp: 5200, baseDamage: 118 },
        { name: '⚫ Der Letzte Richter', rank: 'SS', type: 'boss', baseHp: 4900, baseDamage: 122 },
        { name: '⚫ Der Nullpunkt', rank: 'SS', type: 'boss', baseHp: 5300, baseDamage: 110 },
        { name: '⚫ Die Entität jenseits der Tore', rank: 'SS', type: 'boss', baseHp: 6000, baseDamage: 100 },
        // SS-RANG ELITE/MINI-BOSSE
        { name: 'Manifestation', rank: 'SS', type: 'elite-mini-boss', baseHp: 1800, baseDamage: 85 },
        { name: 'Systemfehler', rank: 'SS', type: 'elite-mini-boss', baseHp: 2000, baseDamage: 80 },
        { name: 'Schattenaspekt', rank: 'SS', type: 'elite-mini-boss', baseHp: 1700, baseDamage: 90 },
        { name: 'Realitätsriss', rank: 'SS', type: 'elite-mini-boss', baseHp: 1900, baseDamage: 82 }
    ]
};
// ==================== NORMALE GEGNER ====================
export const NORMAL_ENEMIES = {
    'D': [
        'Infizierte Ratte', 'Höhlengoblin', 'Skelettkrieger', 'Wütender Wolf',
        'Zombie-Soldat', 'Giftspinne', 'Fledermauskreatur', 'Steingolem'
    ],
    'C': [
        'Schattenkrieger', 'Flammendiener', 'Blutwolf', 'Aschewache',
        'Knochenwächter', 'Sturmbestie', 'Dunkler Kultist', 'Feuerschlange'
    ],
    'B': [
        'Kettenkrieger', 'Blutmagier', 'Runensoldat', 'Verdorbener Ritter',
        'Schattenassassine', 'Schmerzenswächter', 'Fluchpriester', 'Blutbestie'
    ],
    'A': [
        'Dämonenwache', 'Seelenschatten', 'Leerensoldat', 'Verderbtes Konstrukt',
        'Astralkrieger', 'Höllenhund', 'Dämonenbeschwörer', 'Aschekrieger'
    ],
    'S': [
        'Drachenwache', 'Tiefseehorror', 'Verdammter Ritter', 'Weltenkrieger',
        'Leerenhorror', 'Zeitkrieger', 'Königs-Wächter', 'Katastrophendämon'
    ],
    'SS': [
        'Monarchenwache', 'Schattenkrieger der Leere', 'Systemwächter',
        'Realitätsfragment', 'Weltenfresser', 'Entropiesoldat', 'Nullpunkt-Wächter'
    ]
};
// ==================== GATE NAMEN-PRÄFIXE ====================
export const GATE_PREFIXES = {
    'D': [
        'Verlassene Höhle', 'Finstere Katakomben', 'Vergessene Gruft', 'Dunkler Stollen',
        'Verwüstete Mine', 'Verfluchte Ruine', 'Alte Nekropole', 'Düsteres Grab'
    ],
    'C': [
        'Brennende Festung', 'Schattentempel', 'Blutaltar', 'Aschezitadelle',
        'Sturmruinen', 'Dunkle Kathedrale', 'Flammenhalle', 'Todesschrein'
    ],
    'B': [
        'Kerker der Qual', 'Halle der Vergessenen', 'Ketten-Labyrinth', 'Blutarchiv',
        'Runengefängnis', 'Schmerzenszitadelle', 'Schattendomäne', 'Fluchfestung'
    ],
    'A': [
        'Dämonenpalast', 'Seelenzitadelle', 'Leerenturm', 'Verderbte Domäne',
        'Astrale Festung', 'Höllenschloss', 'Aschereich', 'Dämonenzitadelle'
    ],
    'S': [
        'Drachenhort', 'Tiefseeabgrund', 'Reich der Verdammten', 'Weltentor',
        'Leerenthron', 'Zeitverwerfung', 'Königszitadelle', 'Apokalypse-Domäne'
    ],
    'SS': [
        'Monarchenthron', 'Schatten-Ursprung', 'Weltenende', 'Systemkern',
        'Ewiges Gericht', 'Nullpunkt-Domäne', 'Grenze der Realität', 'Letzte Bastion'
    ]
};
export class GateGenerator {
    /**
     * Generiert ein zufälliges Gate basierend auf Rang
     */
    static generateGate(rank, playerLevel, seed) {
        const random = seed ? this.seededRandom(seed) : Math.random;
        // Gate-Name erstellen
        const prefixes = GATE_PREFIXES[rank];
        const gateName = prefixes[Math.floor(random() * prefixes.length)];
        // Anzahl der Gegner basierend auf Rang
        const enemyCount = this.getEnemyCountForRank(rank);
        // Boss auswählen
        const bosses = BOSS_POOL[rank].filter(b => b.type === 'boss');
        const boss = bosses[Math.floor(random() * bosses.length)];
        // Normale Gegner generieren
        const normalEnemies = this.generateNormalEnemies(rank, enemyCount, playerLevel, random);
        // Mini-Bosse hinzufügen (je nach Rang)
        const miniBosses = this.generateMiniBosses(rank, playerLevel, random);
        // Alle Gegner kombinieren
        const allEnemies = [...normalEnemies, ...miniBosses];
        // Boss am Ende hinzufügen
        const bossEnemy = {
            id: this.idCounter++,
            name: boss.name,
            maxHp: Math.floor(boss.baseHp * this.getLevelMultiplier(playerLevel)),
            autoAttackDamage: Math.floor(boss.baseDamage * this.getLevelMultiplier(playerLevel)),
            isBoss: true
        };
        allEnemies.push(bossEnemy);
        // Schwierigkeit berechnen (1-10)
        const difficulty = this.calculateDifficulty(rank, playerLevel);
        return {
            id: `gate-${rank}-${Date.now()}-${this.idCounter}`,
            rank,
            name: `${gateName}`,
            enemies: allEnemies,
            boss,
            difficulty,
            createdAt: new Date()
        };
    }
    /**
     * Generiert normale Gegner
     */
    static generateNormalEnemies(rank, count, playerLevel, random) {
        const enemies = [];
        const enemyPool = NORMAL_ENEMIES[rank];
        // Base stats basierend auf Rang
        const baseStats = this.getBaseStatsForRank(rank);
        for (let i = 0; i < count; i++) {
            const enemyName = enemyPool[Math.floor(random() * enemyPool.length)];
            const variance = 0.8 + random() * 0.4; // 80%-120% variance
            enemies.push({
                id: this.idCounter++,
                name: enemyName,
                maxHp: Math.floor(baseStats.hp * variance * this.getLevelMultiplier(playerLevel)),
                autoAttackDamage: Math.floor(baseStats.damage * variance * this.getLevelMultiplier(playerLevel))
            });
        }
        return enemies;
    }
    /**
     * Generiert Elite/Mini-Bosse
     */
    static generateMiniBosses(rank, playerLevel, random) {
        const miniBosses = [];
        const miniBossPool = BOSS_POOL[rank].filter(b => b.type === 'elite-mini-boss');
        // Anzahl Mini-Bosse basierend auf Rang
        const miniBossCount = this.getMiniBossCountForRank(rank);
        for (let i = 0; i < miniBossCount; i++) {
            const miniBoss = miniBossPool[Math.floor(random() * miniBossPool.length)];
            miniBosses.push({
                id: this.idCounter++,
                name: `⚔️ ${miniBoss.name}`,
                maxHp: Math.floor(miniBoss.baseHp * this.getLevelMultiplier(playerLevel)),
                autoAttackDamage: Math.floor(miniBoss.baseDamage * this.getLevelMultiplier(playerLevel))
            });
        }
        return miniBosses;
    }
    /**
     * Gibt Basis-Stats für Rang zurück
     */
    static getBaseStatsForRank(rank) {
        const stats = {
            'D': { hp: 100, damage: 12 },
            'C': { hp: 180, damage: 18 },
            'B': { hp: 280, damage: 26 },
            'A': { hp: 450, damage: 38 },
            'S': { hp: 700, damage: 55 },
            'SS': { hp: 1200, damage: 75 }
        };
        return stats[rank];
    }
    /**
     * Gibt Anzahl normaler Gegner für Rang zurück
     */
    static getEnemyCountForRank(rank) {
        const counts = {
            'D': 3,
            'C': 4,
            'B': 5,
            'A': 6,
            'S': 7,
            'SS': 8
        };
        return counts[rank];
    }
    /**
     * Gibt Anzahl Mini-Bosse für Rang zurück
     */
    static getMiniBossCountForRank(rank) {
        const counts = {
            'D': 1,
            'C': 1,
            'B': 2,
            'A': 2,
            'S': 3,
            'SS': 4
        };
        return counts[rank];
    }
    /**
     * Berechnet Level-Multiplikator
     */
    static getLevelMultiplier(playerLevel) {
        return 1 + (playerLevel - 1) * 0.15;
    }
    /**
     * Berechnet Schwierigkeit (1-10)
     */
    static calculateDifficulty(rank, playerLevel) {
        const rankDifficulty = {
            'D': 2,
            'C': 4,
            'B': 5,
            'A': 7,
            'S': 9,
            'SS': 10
        };
        const base = rankDifficulty[rank];
        const levelAdjust = Math.floor(playerLevel / 10);
        return Math.min(10, Math.max(1, base + levelAdjust));
    }
    /**
     * Seeded Random für deterministische Generierung
     */
    static seededRandom(seed) {
        let x = Math.sin(seed++) * 10000;
        return () => {
            x = Math.sin(x) * 10000;
            return x - Math.floor(x);
        };
    }
    /**
     * Generiert einen Pool von 60 Gates für einen Spieler
     */
    static generateGatePool(playerLevel, playerRank) {
        const gates = [];
        const dateSeed = new Date().toISOString().split('T')[0]; // Tägliches Seed
        const baseSeed = parseInt(dateSeed.replace(/-/g, ''));
        // Verteilung der Gates nach Rang
        const distribution = {
            'D': 15,
            'C': 15,
            'B': 12,
            'A': 10,
            'S': 6,
            'SS': 2
        };
        let counter = 0;
        for (const [rank, count] of Object.entries(distribution)) {
            for (let i = 0; i < count; i++) {
                const seed = baseSeed + counter++;
                gates.push(this.generateGate(rank, playerLevel, seed));
            }
        }
        // Mischen der Gates
        return this.shuffleArray(gates, baseSeed);
    }
    /**
     * Mischt ein Array deterministisch
     */
    static shuffleArray(array, seed) {
        const arr = [...array];
        const random = this.seededRandom(seed);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}
GateGenerator.idCounter = 0;
//# sourceMappingURL=gates.js.map