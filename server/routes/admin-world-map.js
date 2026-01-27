/**
 * ADMIN ROUTES - World Map Settings
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../public/assets/maps');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'worldmap-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Nur Bilder erlaubt (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// Create settings table if not exists
async function ensureSettingsTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS world_map_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            setting_key VARCHAR(50) UNIQUE NOT NULL,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

// Get current world map image
router.get('/world-map-image', async (req, res) => {
    try {
        await ensureSettingsTable();
        const rows = await db.query(
            "SELECT setting_value FROM world_map_settings WHERE setting_key = 'world_map_image'"
        );

        if (rows.length > 0) {
            // Return absolute URL for Node server
            const imageUrl = `http://localhost:3001${rows[0].setting_value}`;
            res.json({ imageUrl });
        } else {
            // Default fallback - absolute URL
            res.json({ imageUrl: 'http://localhost:3001/public/assets/sprites/Weltkarte 1.png' });
        }
    } catch (error) {
        console.error('Error getting world map image:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Kartenbildes' });
    }
});

// Upload new world map image
router.post('/upload-world-map', upload.single('worldmap'), async (req, res) => {
    // TODO: Add admin authentication in production
    // For development: Allow uploads without auth
    
    if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    try {
        await ensureSettingsTable();
        const imageUrl = `/public/assets/maps/${req.file.filename}`;
        
        // Get old image to delete
        const oldRows = await db.query(
            "SELECT setting_value FROM world_map_settings WHERE setting_key = 'world_map_image'"
        );
        
        // Update or insert new image
        await db.query(`
            INSERT INTO world_map_settings (setting_key, setting_value) 
            VALUES ('world_map_image', ?)
            ON DUPLICATE KEY UPDATE setting_value = ?
        `, [imageUrl, imageUrl]);

        // Delete old image file if exists
        if (oldRows.length > 0 && oldRows[0].setting_value) {
            const oldPath = path.join(__dirname, '..', oldRows[0].setting_value);
            if (fs.existsSync(oldPath) && oldRows[0].setting_value.includes('/assets/maps/')) {
                fs.unlinkSync(oldPath);
            }
        }

        res.json({ 
            success: true, 
            imageUrl: `http://localhost:3001${imageUrl}`,
            message: 'Weltkarte erfolgreich hochgeladen' 
        });
    } catch (error) {
        console.error('Error uploading world map:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen' });
    }
});

module.exports = router;
