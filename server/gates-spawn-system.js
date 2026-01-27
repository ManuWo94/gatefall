/**
 * GATES SPAWN SYSTEM - Stadtspezifisches Gate-Spawning
 * 
 * Spawning-Regeln:
 * - Mindestens 12 Gates alle 6 Stunden
 * - Maximal 24 Gates
 * - Verteilt auf alle Städte mit Spawn-Zonen
 * - Rang: Zufällig basierend auf Zone (min_rank bis max_rank)
 * - Typ: Zufällig gewählt
 */

const db = require('./db-mysql');

// Min/Max Gates pro 6-Stunden-Zyklus
const MIN_GATES_PER_CYCLE = 12;
const MAX_GATES_PER_CYCLE = 24;

// Rang-Hierarchie
const RANKS = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];

// Gate-Typen (alle gleichwertig - wird zufällig gewählt)
const GATE_TYPES = ['normal', 'elite', 'boss', 'raid', 'dungeon'];

/**
 * Wählt einen zufälligen Rang innerhalb der Zone-Limits (E-SSS)
 */
function selectRank(minRank, maxRank) {
    const minIndex = RANKS.indexOf(minRank);
    const maxIndex = RANKS.indexOf(maxRank);
    
    if (minIndex === -1 || maxIndex === -1) {
        return 'E'; // Fallback
    }
    
    const randomIndex = minIndex + Math.floor(Math.random() * (maxIndex - minIndex + 1));
    return RANKS[randomIndex];
}

/**
 * Wählt einen zufälligen Gate-Typ
 */
function selectGateType() {
    return GATE_TYPES[Math.floor(Math.random() * GATE_TYPES.length)];
}

/**
 * GLOBALES GATE-SPAWNING - Alle 6 Stunden
 * Spawnt 12-24 Gates verteilt auf alle Städte mit Spawn-Zonen
 */
async function spawnGatesGlobal() {
    try {
        console.log('🌀 Starting global gate spawn...');
        
        // Hole alle Städte mit aktiven Spawn-Zonen
        const zones = await db.query(`
            SELECT csz.*, c.name as city_name
            FROM city_spawn_zones csz
            JOIN cities c ON csz.city_id = c.id
            WHERE csz.map_x IS NOT NULL AND csz.map_y IS NOT NULL
            ORDER BY RAND()
        `);
        
        if (zones.length === 0) {
            console.log('⚠️ Keine Spawn-Zonen gefunden!');
            return 0;
        }
        
        // Zufällige Anzahl zwischen MIN_GATES_PER_CYCLE und MAX_GATES_PER_CYCLE
        const gateCount = MIN_GATES_PER_CYCLE + Math.floor(Math.random() * (MAX_GATES_PER_CYCLE - MIN_GATES_PER_CYCLE + 1));
        
        console.log(`🎲 Spawning ${gateCount} gates across ${zones.length} zones...`);
        
        let spawned = 0;
        
        for (let i = 0; i < gateCount; i++) {
            // Zufällige Zone auswählen
            const zone = zones[Math.floor(Math.random() * zones.length)];
            
            // Rang innerhalb Zone-Limits
            const rank = selectRank(zone.min_rank || 'E', zone.max_rank || 'D');
            
            // Zufälliger Gate-Typ
            const type = selectGateType();
            
            // Position = Zone-Punkt (map_x, map_y)
            const x = zone.map_x;
            const y = zone.map_y;
            
            // Level basierend auf Rang
            const levelRanges = {
                'E': [1, 5],
                'D': [6, 15],
                'C': [16, 30],
                'B': [31, 45],
                'A': [46, 60],
                'S': [61, 80],
                'SS': [81, 95],
                'SSS': [96, 100]
            };
            const [minLvl, maxLvl] = levelRanges[rank] || [1, 10];
            const level = minLvl + Math.floor(Math.random() * (maxLvl - minLvl + 1));
            
            // Gate-Name
            const gateNameTemplates = [
                'Dungeon', 'Höhle', 'Ruine', 'Tempel', 'Portal', 
                'Festung', 'Katakomben', 'Gruft', 'Verlies', 'Turm'
            ];
            const baseName = gateNameTemplates[Math.floor(Math.random() * gateNameTemplates.length)];
            const name = `${rank}-Rang ${baseName}`;
            
            // Ablaufzeit: 6 Stunden
            const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
            
            await db.query(`
                INSERT INTO gates 
                (city_id, zone_id, player_id, name, gate_rank, gate_type, level, map_x, map_y, status, expires_at)
                VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, 'active', ?)
            `, [zone.city_id, zone.id, name, rank, type, level, x, y, expiresAt]);
            
            spawned++;
        }
        
        console.log(`✅ Successfully spawned ${spawned} gates globally`);
        return spawned;
        
    } catch (error) {
        console.error('❌ Error spawning gates globally:', error);
        return 0;
    }
}

/**
 * Schließt abgelaufene Gates
 */
async function closeExpiredGates() {
    try {
        const result = await db.query(`
            UPDATE gates 
            SET status = 'expired' 
            WHERE status = 'active' AND expires_at < NOW()
        `);
        
        const closedCount = result.affectedRows || 0;
        if (closedCount > 0) {
            console.log(`⏰ Closed ${closedCount} expired gates`);
        }
        
        return closedCount;
    } catch (error) {
        console.error('❌ Error closing expired gates:', error);
        return 0;
    }
}

/**
 * Schließt ein Gate (z.B. nach Boss-Sieg)
 */
async function closeGate(gateId) {
    try {
        await db.query(`
            UPDATE gates 
            SET status = 'cleared', closed_at = NOW()
            WHERE id = ?
        `, [gateId]);
        
        console.log(`✅ Gate ${gateId} closed (boss defeated)`);
        return true;
    } catch (error) {
        console.error(`❌ Error closing gate ${gateId}:`, error);
        return false;
    }
}

/**
 * 6-STUNDEN SPAWN-ZYKLUS
 * Spawnt 12-24 Gates global verteilt auf alle Städte
 */
async function dailyGateSpawn() {
    try {
        console.log('🔄 6H GATE SPAWN CYCLE: Starting...');
        
        // Schließe abgelaufene Gates
        await closeExpiredGates();
        
        // Spawne neue Gates global
        const spawned = await spawnGatesGlobal();
        
        console.log(`✅ Spawn Cycle Complete: ${spawned} gates spawned globally`);
        console.log('⏰ Next spawn cycle in 6 hours');
        
        return spawned;
        
    } catch (error) {
        console.error('❌ Error in gate spawn cycle:', error);
        return 0;
    }
}

/**
 * Löscht Gates die älter als 24 Stunden sind
 */
async function deleteOldGates() {
    try {
        const result = await db.query(`
            DELETE FROM gates 
            WHERE status = 'expired' AND created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);
        
        const deletedCount = result.affectedRows || 0;
        if (deletedCount > 0) {
            console.log(`🗑️ Deleted ${deletedCount} old expired gates (>24h)`);
        }
        
        return deletedCount;
    } catch (error) {
        console.error('❌ Error deleting old gates:', error);
        return 0;
    }
}

module.exports = {
    spawnGatesGlobal,
    closeExpiredGates,
    closeGate,
    dailyGateSpawn,
    deleteOldGates
};
