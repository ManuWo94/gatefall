/**
 * CITIES & TRAVEL SYSTEM - API Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// ==================== CITIES ====================

// Get all cities
router.get('/cities', async (req, res) => {
    try {
        const cities = await db.query(`
            SELECT * FROM cities WHERE active = true ORDER BY display_name
        `);
        res.json({ cities });
    } catch (error) {
        console.error('Error loading cities:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Städte' });
    }
});

// Get single city with zones
router.get('/cities/:cityId', async (req, res) => {
    try {
        const { cityId } = req.params;
        
        const city = await db.query(`
            SELECT * FROM cities WHERE id = ? AND active = true
        `, [cityId]);
        
        if (city.length === 0) {
            return res.status(404).json({ error: 'Stadt nicht gefunden' });
        }
        
        const zones = await db.query(`
            SELECT * FROM city_zones WHERE city_id = ? AND active = true
        `, [cityId]);
        
        res.json({ city: city[0], zones });
    } catch (error) {
        console.error('Error loading city:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Stadt' });
    }
});

// ==================== TRAVEL SYSTEM ====================

// Start travel to city
router.post('/travel/start', async (req, res) => {
    try {
        // Try multiple sources for userId (same as travel/status)
        let userId = req.session?.passport?.user || req.user?.id || req.body.userId;
        
        // Fallback to session.userId
        if (!userId && req.session?.userId) {
            userId = req.session.userId;
        }
        
        const { cityId } = req.body;
        
        if (!userId) {
            console.error('❌ Travel start: No userId found in session or body');
            console.log('Session:', req.session);
            console.log('Body:', req.body);
            return res.status(401).json({ error: 'Nicht eingeloggt' });
        }
        
        console.log(`🚗 Starting travel for user ${userId} to city ${cityId}`);
        
        // Get user's current status
        const user = await db.query(`
            SELECT home_city_id, current_city_id, traveling_to_city_id, travel_started_at
            FROM users WHERE id = ?
        `, [userId]);
        
        if (user.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        
        const userData = user[0];
        
        // Check if already traveling
        if (userData.traveling_to_city_id) {
            return res.status(400).json({ 
                error: 'Du bist bereits unterwegs',
                travelingTo: userData.traveling_to_city_id,
                startedAt: userData.travel_started_at
            });
        }
        
        // Check if already in that city
        if (userData.current_city_id === parseInt(cityId)) {
            return res.status(400).json({ error: 'Du bist bereits in dieser Stadt' });
        }
        
        // Get city info
        const city = await db.query(`
            SELECT id, display_name, travel_time_minutes FROM cities WHERE id = ?
        `, [cityId]);
        
        if (city.length === 0) {
            return res.status(404).json({ error: 'Stadt nicht gefunden' });
        }
        
        // Check if user is admin (get admin status)
        const adminCheck = await db.query(`SELECT is_admin FROM users WHERE id = ?`, [userId]);
        const isAdmin = adminCheck[0]?.is_admin === 1;
        
        // Admin gets instant travel option (if skipTravel is set)
        if (isAdmin && req.body.skipTravel === true) {
            await db.query(`
                UPDATE users 
                SET current_city_id = ?, traveling_to_city_id = NULL, travel_started_at = NULL
                WHERE id = ?
            `, [cityId, userId]);
            
            return res.json({
                success: true,
                instant: true,
                isAdmin: true,
                message: `[ADMIN] Sofort-Teleport nach ${city[0].display_name}!`,
                currentCity: cityId
            });
        }
        
        // Check if it's home city (instant travel for normal users)
        if (userData.home_city_id === parseInt(cityId)) {
            await db.query(`
                UPDATE users 
                SET current_city_id = ?, traveling_to_city_id = NULL, travel_started_at = NULL
                WHERE id = ?
            `, [cityId, userId]);
            
            return res.json({
                success: true,
                instant: true,
                message: `Willkommen zurück in ${city[0].display_name}!`,
                currentCity: cityId
            });
        }
        
        // Start travel
        await db.query(`
            UPDATE users 
            SET traveling_to_city_id = ?, travel_started_at = NOW()
            WHERE id = ?
        `, [cityId, userId]);
        
        res.json({
            success: true,
            travelingTo: cityId,
            cityName: city[0].display_name,
            travelTimeMinutes: city[0].travel_time_minutes,
            startedAt: new Date()
        });
        
    } catch (error) {
        console.error('Error starting travel:', error);
        res.status(500).json({ error: 'Fehler beim Starten der Reise' });
    }
});

// Check travel status
router.get('/travel/status', async (req, res) => {
    try {
        // Versuche userId aus verschiedenen Quellen zu holen
        let userId = req.session?.passport?.user || req.user?.id || req.query.userId;
        
        // Wenn kein userId, versuche aus Session direkt
        if (!userId && req.session?.userId) {
            userId = req.session.userId;
        }
        
        if (!userId) {
            return res.status(401).json({ error: 'Nicht eingeloggt' });
        }
        
        const user = await db.query(`
            SELECT 
                u.home_city_id,
                u.current_city_id,
                u.traveling_to_city_id,
                u.travel_started_at,
                c1.display_name as current_city_name,
                c1.image_url as current_city_image,
                c2.display_name as traveling_to_city_name,
                c2.travel_time_minutes,
                c3.display_name as home_city_name
            FROM users u
            LEFT JOIN cities c1 ON u.current_city_id = c1.id
            LEFT JOIN cities c2 ON u.traveling_to_city_id = c2.id
            LEFT JOIN cities c3 ON u.home_city_id = c3.id
            WHERE u.id = ?
        `, [userId]);
        
        if (user.length === 0) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        
        const userData = user[0];
        
        // Check if travel is complete
        if (userData.traveling_to_city_id && userData.travel_started_at) {
            const travelStarted = new Date(userData.travel_started_at);
            const now = new Date();
            const elapsedMinutes = (now - travelStarted) / 1000 / 60;
            
            if (elapsedMinutes >= userData.travel_time_minutes) {
                // Travel complete - update user location
                await db.query(`
                    UPDATE users 
                    SET current_city_id = ?, traveling_to_city_id = NULL, travel_started_at = NULL
                    WHERE id = ?
                `, [userData.traveling_to_city_id, userId]);
                
                return res.json({
                    traveling: false,
                    arrived: true,
                    currentCity: userData.traveling_to_city_id,
                    currentCityName: userData.traveling_to_city_name,
                    currentCityImage: userData.current_city_image,
                    homeCity: userData.home_city_id,
                    homeCityName: userData.home_city_name
                });
            }
            
            // Still traveling
            return res.json({
                traveling: true,
                travelingTo: userData.traveling_to_city_id,
                travelingToCityName: userData.traveling_to_city_name,
                travelStartedAt: userData.travel_started_at,
                travelTimeMinutes: userData.travel_time_minutes,
                elapsedMinutes: Math.floor(elapsedMinutes),
                remainingMinutes: Math.ceil(userData.travel_time_minutes - elapsedMinutes),
                progress: Math.min(100, (elapsedMinutes / userData.travel_time_minutes) * 100),
                currentCity: userData.current_city_id,
                currentCityName: userData.current_city_name,
                homeCity: userData.home_city_id,
                homeCityName: userData.home_city_name
            });
        }
        
        // Not traveling
        const response = {
            traveling: false,
            currentCity: userData.current_city_id,
            currentCityName: userData.current_city_name,
            currentCityImage: userData.current_city_image,
            homeCity: userData.home_city_id,
            homeCityName: userData.home_city_name
        };
        
        console.log('🏙️ Travel status response:', response);
        res.json(response);
        
    } catch (error) {
        console.error('Error checking travel status:', error);
        res.status(500).json({ error: 'Fehler beim Prüfen des Reisestatus' });
    }
});

// Cancel travel
router.post('/travel/cancel', async (req, res) => {
    try {
        // Try multiple sources for userId
        let userId = req.session?.passport?.user || req.user?.id || req.body.userId;
        
        // Fallback to session.userId
        if (!userId && req.session?.userId) {
            userId = req.session.userId;
        }
        
        if (!userId) {
            console.error('❌ Travel cancel: No userId found');
            return res.status(401).json({ error: 'Nicht eingeloggt' });
        }
        
        console.log(`🚫 Canceling travel for user ${userId}`);
        
        await db.query(`
            UPDATE users 
            SET traveling_to_city_id = NULL, travel_started_at = NULL
            WHERE id = ?
        `, [userId]);
        
        res.json({ success: true, message: 'Reise abgebrochen' });
        
    } catch (error) {
        console.error('Error canceling travel:', error);
        res.status(500).json({ error: 'Fehler beim Abbrechen der Reise' });
    }
});

// ==================== GATES PER CITY ====================

// Get gates for current city
router.get('/gates/my-city', async (req, res) => {
    try {
        const userId = req.session?.passport?.user || req.query.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Nicht eingeloggt' });
        }
        
        const user = await db.query(`
            SELECT current_city_id FROM users WHERE id = ?
        `, [userId]);
        
        if (user.length === 0 || !user[0].current_city_id) {
            return res.json({ gates: [], zones: [] });
        }
        
        const cityId = user[0].current_city_id;
        
        const gates = await db.query(`
            SELECT * FROM gates 
            WHERE city_id = ? AND player_id = ? AND status = 'active'
            ORDER BY created_at DESC
        `, [cityId, userId]);
        
        const zones = await db.query(`
            SELECT * FROM city_zones WHERE city_id = ? AND active = true
        `, [cityId]);
        
        res.json({ gates, zones, cityId });
        
    } catch (error) {
        console.error('Error loading city gates:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Gates' });
    }
});

// Get gates for specific city
router.get('/gates/city/:cityId', async (req, res) => {
    try {
        const { cityId } = req.params;
        const userId = req.session?.passport?.user || req.query.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Nicht eingeloggt' });
        }
        
        const gates = await db.query(`
            SELECT * FROM gates 
            WHERE city_id = ? AND player_id = ? AND status = 'active'
            ORDER BY created_at DESC
        `, [cityId, userId]);
        
        const zones = await db.query(`
            SELECT * FROM city_zones WHERE city_id = ? AND active = true
        `, [cityId]);
        
        res.json({ gates, zones, cityId });
        
    } catch (error) {
        console.error('Error loading city gates:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Gates' });
    }
});

module.exports = router;
