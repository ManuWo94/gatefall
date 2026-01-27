/**
 * Admin Routes - City Map Editor
 * Manage POIs and Spawn Zones for city maps
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Multer config for city map images
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const dir = path.join(__dirname, '../public/assets/maps/cities');
        try {
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `citymap-${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Nur Bilder erlaubt'));
        }
    }
});

// ==================== POI Management ====================

// Get POIs for a city
router.get('/city-pois/:cityId', async (req, res) => {
    try {
        const { cityId } = req.params;
        const pois = await db.query(
            'SELECT * FROM city_pois WHERE city_id = ? ORDER BY created_at DESC',
            [cityId]
        );
        res.json(pois);
    } catch (error) {
        console.error('Error fetching city POIs:', error);
        res.status(500).json({ error: 'Fehler beim Laden der POIs' });
    }
});

// Create or update POI
router.post('/city-pois', async (req, res) => {
    try {
        const { id, city_id, name, type, map_x, map_y, icon, description, action } = req.body;

        if (id) {
            // Update existing
            await db.query(
                `UPDATE city_pois 
                 SET name = ?, type = ?, map_x = ?, map_y = ?, icon = ?, description = ?, action = ?
                 WHERE id = ?`,
                [name, type, map_x, map_y, icon, description, action, id]
            );
            res.json({ success: true, id });
        } else {
            // Create new
            const result = await db.query(
                `INSERT INTO city_pois (city_id, name, type, map_x, map_y, icon, description, action)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [city_id, name, type, map_x, map_y, icon, description, action]
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (error) {
        console.error('Error saving POI:', error);
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

// Delete POI
router.delete('/city-pois/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM city_pois WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting POI:', error);
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

// ==================== Spawn Zone Management (Point-Based) ====================

// Get spawn zones for a city
router.get('/city-spawn-zones/:cityId', async (req, res) => {
    try {
        const { cityId } = req.params;
        const zones = await db.query(
            'SELECT * FROM city_spawn_zones WHERE city_id = ? ORDER BY created_at DESC',
            [cityId]
        );
        res.json(zones);
    } catch (error) {
        console.error('Error fetching spawn zones:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Zonen' });
    }
});

// Create or update spawn zone
router.post('/city-spawn-zones', async (req, res) => {
    try {
        const { id, city_id, name, map_x, map_y, min_rank, max_rank } = req.body;

        if (id) {
            // Update existing
            await db.query(
                `UPDATE city_spawn_zones 
                 SET name = ?, map_x = ?, map_y = ?, min_rank = ?, max_rank = ?
                 WHERE id = ?`,
                [name, map_x, map_y, min_rank || 'E', max_rank || 'D', id]
            );
            res.json({ success: true, id });
        } else {
            // Create new
            const result = await db.query(
                `INSERT INTO city_spawn_zones (city_id, name, map_x, map_y, min_rank, max_rank)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [city_id, name, map_x, map_y, min_rank || 'E', max_rank || 'D']
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (error) {
        console.error('Error saving spawn zone:', error);
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

// Delete spawn zone
router.delete('/city-spawn-zones/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM city_spawn_zones WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting spawn zone:', error);
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

// ==================== OLD Zone Management (kept for backwards compatibility) ====================

// Get zones for a city
router.get('/city-zones/:cityId', async (req, res) => {
    try {
        const { cityId } = req.params;
        const zones = await db.query(
            'SELECT * FROM city_spawn_zones WHERE city_id = ? ORDER BY created_at DESC',
            [cityId]
        );
        res.json(zones);
    } catch (error) {
        console.error('Error fetching city zones:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Zonen' });
    }
});

// Create or update zone
router.post('/city-zones', async (req, res) => {
    try {
        const { id, city_id, name, zone_type, min_level, max_level, gate_type, spawn_chance, polygon_points } = req.body;

        if (id) {
            // Update existing
            await db.query(
                `UPDATE city_spawn_zones 
                 SET name = ?, zone_type = ?, min_level = ?, max_level = ?, gate_type = ?, spawn_chance = ?, polygon_points = ?
                 WHERE id = ?`,
                [name, zone_type, min_level, max_level, gate_type, spawn_chance, polygon_points, id]
            );
            res.json({ success: true, id });
        } else {
            // Create new
            const result = await db.query(
                `INSERT INTO city_spawn_zones (city_id, name, zone_type, min_level, max_level, gate_type, spawn_chance, polygon_points)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [city_id, name, zone_type || 'spawn', min_level, max_level, gate_type, spawn_chance, polygon_points]
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (error) {
        console.error('Error saving zone:', error);
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

// Delete zone
router.delete('/city-zones/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM city_spawn_zones WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting zone:', error);
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

// ==================== City Map Image ====================

// Upload city map image
router.post('/city-map-image', upload.single('image'), async (req, res) => {
    try {
        const { cityId } = req.body;
        const imageUrl = `/assets/maps/cities/${req.file.filename}`;

        await db.query(
            'UPDATE cities SET map_image_url = ? WHERE id = ?',
            [imageUrl, cityId]
        );

        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Error uploading city map image:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen' });
    }
});

module.exports = router;
