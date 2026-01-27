/**
 * ADMIN ROUTES - UI Background Settings
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
        const uploadDir = path.join(__dirname, '../../public/assets/sprites');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ui-background-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Nur Bilder erlaubt (JPEG, PNG, WebP)'));
        }
    }
});

// Create settings table if not exists
async function ensureSettingsTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS ui_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            setting_key VARCHAR(50) UNIQUE NOT NULL,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

// Get current UI background image
router.get('/ui-background', async (req, res) => {
    try {
        await ensureSettingsTable();
        const rows = await db.query(
            "SELECT setting_value FROM ui_settings WHERE setting_key = 'ui_background'"
        );

        if (rows.length > 0) {
            // Return absolute URL for Node server
            const imageUrl = `http://localhost:3001${rows[0].setting_value}`;
            res.json({ imageUrl });
        } else {
            // Default fallback - absolute URL
            res.json({ imageUrl: 'http://localhost:3001/public/assets/sprites/Hintergrund.png' });
        }
    } catch (error) {
        console.error('Error getting UI background:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Hintergrunds' });
    }
});

// Upload new UI background image
router.post('/ui-background', upload.single('background'), async (req, res) => {
    // TODO: Add admin authentication in production
    // For development: Allow uploads without auth
    
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            error: 'Keine Datei hochgeladen' 
        });
    }

    try {
        await ensureSettingsTable();
        
        // Generate URL path for the uploaded file
        const imageUrl = `/public/assets/sprites/${req.file.filename}`;
        
        // Save to database
        await db.query(`
            INSERT INTO ui_settings (setting_key, setting_value) 
            VALUES ('ui_background', ?)
            ON DUPLICATE KEY UPDATE setting_value = ?
        `, [imageUrl, imageUrl]);

        console.log('✅ UI background uploaded:', imageUrl);

        res.json({
            success: true,
            url: `http://localhost:3001${imageUrl}`,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading UI background:', error);
        
        // Delete uploaded file on error
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Fehler beim Speichern des Hintergrunds' 
        });
    }
});

// Reset to default background
router.post('/ui-background/reset', async (req, res) => {
    try {
        await ensureSettingsTable();
        
        // Delete custom background setting
        await db.query("DELETE FROM ui_settings WHERE setting_key = 'ui_background'");
        
        console.log('✅ UI background reset to default');
        
        res.json({
            success: true,
            url: 'public/assets/sprites/Hintergrund.png'
        });
    } catch (error) {
        console.error('Error resetting UI background:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Fehler beim Zurücksetzen des Hintergrunds' 
        });
    }
});

module.exports = router;
