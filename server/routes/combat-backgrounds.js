/**
 * COMBAT BACKGROUNDS API
 * Routes für Kampf-Hintergründe
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
        const uploadDir = path.join(__dirname, '../../public/assets/combat-backgrounds');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'combat-bg-' + uniqueSuffix + path.extname(file.originalname));
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

// Create table if not exists
async function ensureBackgroundsTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS combat_backgrounds (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            image LONGTEXT NOT NULL,
            css_class VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
}

// Get all combat backgrounds
router.get('/', async (req, res) => {
    try {
        await ensureBackgroundsTable();
        const backgrounds = await db.query('SELECT * FROM combat_backgrounds ORDER BY created_at DESC');
        
        console.log(`🎨 Loaded ${backgrounds.length} combat backgrounds`);
        
        res.json({ backgrounds });
    } catch (error) {
        console.error('Error loading combat backgrounds:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Hintergründe' });
    }
});

// Get random combat background
router.get('/random', async (req, res) => {
    try {
        await ensureBackgroundsTable();
        const backgrounds = await db.query('SELECT * FROM combat_backgrounds');
        
        if (backgrounds.length === 0) {
            // Return default fallback
            return res.json({ background: null });
        }
        
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        
        console.log(`🎲 Random combat background: ${randomBg.name}`);
        
        res.json({ background: randomBg });
    } catch (error) {
        console.error('Error getting random background:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Hintergrunds' });
    }
});

// Create/Update combat background (JSON with Base64)
router.post('/', async (req, res) => {
    try {
        await ensureBackgroundsTable();
        
        console.log('📥 POST /api/combat/backgrounds - Request body:', {
            hasId: !!req.body.id,
            hasName: !!req.body.name,
            hasDescription: !!req.body.description,
            hasCssClass: !!req.body.css_class,
            hasImage: !!req.body.image,
            imageLength: req.body.image ? req.body.image.length : 0
        });
        
        const { id, name, description, css_class, image } = req.body;
        
        if (!name || !image) {
            console.error('❌ Missing required fields:', { name: !!name, image: !!image });
            return res.status(400).json({ error: 'Name und Bild sind erforderlich' });
        }
        
        const backgroundId = id || `bg_${Date.now()}`;
        
        await db.query(
            `INSERT INTO combat_backgrounds (id, name, description, image, css_class)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            image = VALUES(image),
            css_class = VALUES(css_class),
            updated_at = NOW()`,
            [backgroundId, name, description || '', image, css_class || '']
        );
        
        console.log(`✅ Combat background saved: ${name}`);
        
        res.json({ success: true, id: backgroundId });
    } catch (error) {
        console.error('Error saving combat background:', error);
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

// Upload combat background file (Multipart)
router.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }

    try {
        await ensureBackgroundsTable();
        
        const { id, name, description, cssClass } = req.body;
        const imageUrl = `/assets/combat-backgrounds/${req.file.filename}`;
        
        await db.query(
            `INSERT INTO combat_backgrounds (id, name, description, image, css_class)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description),
            image = VALUES(image),
            css_class = VALUES(css_class),
            updated_at = NOW()`,
            [id || `bg_${Date.now()}`, name, description || '', imageUrl, cssClass || '']
        );
        
        console.log(`✅ Combat background uploaded: ${name}`);
        
        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Error uploading combat background:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen' });
    }
});

// Update combat background
router.put('/:id', async (req, res) => {
    try {
        await ensureBackgroundsTable();
        
        const { id } = req.params;
        const { name, description, css_class, image } = req.body;
        
        if (!name || !image) {
            return res.status(400).json({ error: 'Name und Bild sind erforderlich' });
        }
        
        await db.query(
            `UPDATE combat_backgrounds 
            SET name = ?, description = ?, image = ?, css_class = ?, updated_at = NOW()
            WHERE id = ?`,
            [name, description || '', image, css_class || '', id]
        );
        
        console.log(`✅ Combat background updated: ${name}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating background:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

// Delete combat background
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM combat_backgrounds WHERE id = ?', [id]);
        
        console.log(`🗑️ Deleted combat background: ${id}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting background:', error);
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

module.exports = router;
