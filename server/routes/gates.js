/**
 * GATES SYSTEM - API Routes
 * Routes für Gates in Städten
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');
const gatesSpawnSystem = require('../gates-spawn-system');

// Get ALL gates from all cities with city names
router.get('/all', async (req, res) => {
    try {
        const gates = await db.query(`
            SELECT 
                g.*,
                c.name as city_name
            FROM gates g
            LEFT JOIN cities c ON g.city_id = c.id
            WHERE g.status = 'active'
            ORDER BY c.name, g.gate_rank, g.level DESC
        `);
        
        console.log(`🌐 Loaded ${gates.length} open gates from all cities`);
        
        res.json({ gates });
    } catch (error) {
        console.error('Error loading all gates:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Gates' });
    }
});

// Get all gates for a city
router.get('/city/:cityId', async (req, res) => {
    try {
        const { cityId } = req.params;
        
        const gates = await db.query(
            'SELECT * FROM gates WHERE city_id = ? AND status = ? ORDER BY created_at DESC',
            [cityId, 'active']
        );
        
        console.log(`🌀 Loaded ${gates.length} open gates for city ${cityId}`);
        
        res.json({ gates });
    } catch (error) {
        console.error('Error loading gates:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Gates' });
    }
});

// Get single gate
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const gate = await db.query('SELECT * FROM gates WHERE id = ?', [id]);
        
        if (gate.length === 0) {
            return res.status(404).json({ error: 'Gate nicht gefunden' });
        }
        
        res.json({ gate: gate[0] });
    } catch (error) {
        console.error('Error loading gate:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Gates' });
    }
});

// Close gate (after boss defeat)
router.put('/:id/close', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query(
            "UPDATE gates SET status = 'cleared', updated_at = NOW() WHERE id = ?",
            [id]
        );
        
        console.log(`🚪 Gate closed: ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error closing gate:', error);
        res.status(500).json({ error: 'Fehler beim Schließen des Gates' });
    }
});

// Admin: Manually spawn gates
router.post('/admin/spawn', async (req, res) => {
    try {
        console.log('👨‍💼 Admin manually triggered gate spawn');
        const spawned = await gatesSpawnSystem.dailyGateSpawn();
        res.json({ success: true, spawned });
    } catch (error) {
        console.error('Error spawning gates:', error);
        res.status(500).json({ error: 'Fehler beim Spawnen der Gates' });
    }
});

// Admin: Get gates statistics
router.get('/admin/stats', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                status,
                COUNT(*) as count
            FROM gates
            GROUP BY status
        `);
        
        const total = await db.query('SELECT COUNT(*) as total FROM gates');
        
        res.json({ 
            stats,
            total: total[0].total
        });
    } catch (error) {
        console.error('Error getting gate stats:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
    }
});

module.exports = router;
