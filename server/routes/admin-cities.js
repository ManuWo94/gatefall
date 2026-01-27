const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// Admin middleware
function requireAdmin(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Nicht authentifiziert' });
    }
    next();
}

// GET all cities (for editor)
router.get('/cities', requireAdmin, async (req, res) => {
    try {
        const cities = await db.query('SELECT * FROM cities ORDER BY id');
        res.json({ cities });
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Städte' });
    }
});

// UPDATE city
router.put('/cities/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { display_name, description, map_x, map_y, map_radius, travel_time_minutes } = req.body;

        await db.query(`
            UPDATE cities 
            SET display_name = ?, 
                description = ?, 
                map_x = ?, 
                map_y = ?, 
                map_radius = ?, 
                travel_time_minutes = ?
            WHERE id = ?
        `, [display_name, description, map_x, map_y, map_radius, travel_time_minutes, id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating city:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren der Stadt' });
    }
});

// DELETE city
router.delete('/cities/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Delete related gates and zones first
        await db.query('DELETE FROM gates WHERE zone_id IN (SELECT id FROM city_zones WHERE city_id = ?)', [id]);
        await db.query('DELETE FROM city_zones WHERE city_id = ?', [id]);
        await db.query('DELETE FROM cities WHERE id = ?', [id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting city:', error);
        res.status(500).json({ error: 'Fehler beim Löschen der Stadt' });
    }
});

// CREATE city
router.post('/cities', requireAdmin, async (req, res) => {
    try {
        const { name, display_name, map_x, map_y, map_radius, travel_time_minutes, description } = req.body;

        const result = await db.query(`
            INSERT INTO cities (name, display_name, map_x, map_y, map_radius, travel_time_minutes, description, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, true)
        `, [name, display_name, map_x, map_y, map_radius, travel_time_minutes, description]);

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Error creating city:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen der Stadt' });
    }
});

module.exports = router;
