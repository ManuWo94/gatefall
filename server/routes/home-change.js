/**
 * HOME CITY CHANGE - Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// Get home change cost
router.get('/home-change-cost', async (req, res) => {
    try {
        const setting = await db.query(`
            SELECT setting_value FROM game_settings WHERE setting_key = 'home_city_change_cost'
        `);
        
        const cost = setting.length > 0 ? parseInt(setting[0].setting_value) : 10000;
        res.json({ cost });
    } catch (error) {
        console.error('Error getting home change cost:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Kosten' });
    }
});

// Change home city
router.post('/change-home', async (req, res) => {
    try {
        const userId = req.session?.passport?.user;
        
        if (!userId) {
            return res.status(401).json({ error: 'Nicht eingeloggt' });
        }

        const { cityId } = req.body;

        if (!cityId) {
            return res.status(400).json({ error: 'Stadt-ID fehlt' });
        }

        // Get user data
        const user = await db.query('SELECT home_city_id, gold FROM users WHERE id = ?', [userId]);
        
        if (user.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        const userData = user[0];

        // Check if already home city
        if (userData.home_city_id === parseInt(cityId)) {
            return res.status(400).json({ error: 'Dies ist bereits deine Heimatstadt' });
        }

        // Get cost
        const costSetting = await db.query(`
            SELECT setting_value FROM game_settings WHERE setting_key = 'home_city_change_cost'
        `);
        const cost = costSetting.length > 0 ? parseInt(costSetting[0].setting_value) : 10000;

        // Check if user has enough gold
        if (userData.gold < cost) {
            return res.json({
                error: `Nicht genug Gold! Benötigt: ${cost}, Verfügbar: ${userData.gold}`
            });
        }

        // Deduct gold and change home city
        await db.query(`
            UPDATE users 
            SET home_city_id = ?, gold = gold - ?
            WHERE id = ?
        `, [cityId, cost, userId]);

        res.json({
            success: true,
            message: `Heimatstadt erfolgreich gewechselt! ${cost} Gold bezahlt.`,
            newGold: userData.gold - cost
        });

    } catch (error) {
        console.error('Error changing home city:', error);
        res.status(500).json({ error: 'Fehler beim Wechseln der Heimatstadt' });
    }
});

// Admin: Update home change cost
router.put('/admin/home-change-cost', async (req, res) => {
    try {
        // TODO: Add admin check
        const { cost } = req.body;

        if (cost === undefined || cost < 0) {
            return res.status(400).json({ error: 'Ungültiger Wert' });
        }

        await db.query(`
            INSERT INTO game_settings (setting_key, setting_value, description)
            VALUES ('home_city_change_cost', ?, 'Kosten in Goldmünzen für Heimatstadtwechsel')
            ON DUPLICATE KEY UPDATE setting_value = ?
        `, [cost, cost]);

        res.json({ success: true, message: 'Kosten aktualisiert' });

    } catch (error) {
        console.error('Error updating home change cost:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren der Kosten' });
    }
});

module.exports = router;
