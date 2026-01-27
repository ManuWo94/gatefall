/**
 * Attack Actions Route
 * Verwaltet Basis-Kampfaktionen (Angriff, Block, Dodge, etc.)
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// GET all attack actions
router.get('/', async (req, res) => {
    try {
        const { min_level, awakening } = req.query;
        
        let query = 'SELECT * FROM attack_actions WHERE 1=1';
        const params = [];
        
        // Filter by minimum level
        if (min_level) {
            query += ' AND min_level <= ?';
            params.push(parseInt(min_level));
        }
        
        // Filter by awakening requirement
        if (awakening !== undefined) {
            query += ' AND requires_awakening = ?';
            params.push(awakening === 'true' || awakening === '1');
        }
        
        query += ' ORDER BY min_level, action_id';
        
        const actions = await db.query(query, params);
        console.log(`📜 Loaded ${actions.length} attack actions`);
        
        res.json({ actions });
    } catch (error) {
        console.error('Error loading attack actions:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Angriffsaktionen' });
    }
});

// GET single attack action
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const action = await db.query(
            'SELECT * FROM attack_actions WHERE action_id = ?',
            [id]
        );
        
        if (action.length === 0) {
            return res.status(404).json({ error: 'Aktion nicht gefunden' });
        }
        
        res.json({ action: action[0] });
    } catch (error) {
        console.error('Error loading attack action:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Aktion' });
    }
});

// POST create new attack action
router.post('/', async (req, res) => {
    try {
        const action = req.body;
        
        await db.query(
            `INSERT INTO attack_actions (
                action_id, name, description, icon, base_damage,
                damage_multiplier, stamina_cost, cooldown,
                can_block, can_dodge
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                action.action_id || `action_${Date.now()}`,
                action.name,
                action.description || '',
                action.icon || null,
                action.base_damage || 50,
                action.damage_multiplier || 1.0,
                action.stamina_cost || 0,
                action.cooldown || 0,
                action.can_block || false,
                action.can_dodge || false
            ]
        );
        
        console.log(`✅ Created attack action: ${action.name}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating attack action:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen der Aktion' });
    }
});

// PUT update attack action
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const action = req.body;
        
        await db.query(
            `UPDATE attack_actions SET 
                name = ?, description = ?, icon = ?, base_damage = ?,
                damage_multiplier = ?, stamina_cost = ?, cooldown = ?,
                can_block = ?, can_dodge = ?,
                updated_at = NOW()
            WHERE action_id = ?`,
            [
                action.name,
                action.description || '',
                action.icon || null,
                action.base_damage || 50,
                action.damage_multiplier || 1.0,
                action.stamina_cost || 0,
                action.cooldown || 0,
                action.can_block || false,
                action.can_dodge || false,
                id
            ]
        );
        
        console.log(`✅ Updated attack action: ${action.name}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating attack action:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren der Aktion' });
    }
});

// DELETE attack action
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM attack_actions WHERE action_id = ?', [id]);
        
        console.log(`🗑️ Deleted attack action: ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting attack action:', error);
        res.status(500).json({ error: 'Fehler beim Löschen der Aktion' });
    }
});

module.exports = router;
