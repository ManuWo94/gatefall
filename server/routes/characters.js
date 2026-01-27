const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// Ensure characters table exists
async function ensureCharactersTable() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS characters (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            sprite LONGTEXT NOT NULL COMMENT 'Base64 encoded character sprite',
            class VARCHAR(50) DEFAULT 'hunter' COMMENT 'Character class',
            is_default TINYINT(1) DEFAULT 0 COMMENT 'Default character for new players',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    try {
        await db.query(createTableSQL);
        console.log('✅ Characters table ensured');
    } catch (error) {
        console.error('Error creating characters table:', error);
        throw error;
    }
}

// Get all characters
router.get('/', async (req, res) => {
    try {
        await ensureCharactersTable();
        const characters = await db.query('SELECT * FROM characters ORDER BY is_default DESC, created_at DESC');
        
        console.log(`👤 Loaded ${characters.length} characters`);
        
        res.json({ characters });
    } catch (error) {
        console.error('Error loading characters:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Characters' });
    }
});

// Get single character
router.get('/:id', async (req, res) => {
    try {
        await ensureCharactersTable();
        const character = await db.query('SELECT * FROM characters WHERE id = ?', [req.params.id]);
        
        if (character.length === 0) {
            return res.status(404).json({ error: 'Character nicht gefunden' });
        }
        
        res.json({ character: character[0] });
    } catch (error) {
        console.error('Error loading character:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Characters' });
    }
});

// Get current user's character sprite
router.get('/me/sprite', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Nicht eingeloggt' });
        }
        
        await ensureCharactersTable();
        
        // Get user's character_id
        const user = await db.query('SELECT character_id FROM users WHERE id = ?', [req.user.id]);
        
        if (!user || user.length === 0 || !user[0].character_id) {
            console.log(`⚠️ User ${req.user.id} has no character assigned`);
            return res.json({ character: null });
        }
        
        // Get character data
        const character = await db.query('SELECT * FROM characters WHERE id = ?', [user[0].character_id]);
        
        if (character.length === 0) {
            console.log(`⚠️ Character ${user[0].character_id} not found`);
            return res.json({ character: null });
        }
        
        console.log(`👤 Loaded character sprite for user ${req.user.id}: ${character[0].name} (${character[0].class})`);
        
        res.json({ character: character[0] });
    } catch (error) {
        console.error('Error loading user character:', error);
        res.status(500).json({ error: 'Fehler beim Laden des User Characters' });
    }
});

// Get default character
router.get('/default/sprite', async (req, res) => {
    try {
        await ensureCharactersTable();
        const character = await db.query('SELECT * FROM characters WHERE is_default = 1 LIMIT 1');
        
        if (character.length === 0) {
            return res.json({ character: null });
        }
        
        console.log(`🎨 Default character loaded: ${character[0].name}`);
        
        res.json({ character: character[0] });
    } catch (error) {
        console.error('Error loading default character:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Default Characters' });
    }
});

// Create/Update character
router.post('/', async (req, res) => {
    try {
        await ensureCharactersTable();
        
        console.log('📥 POST /api/characters - Request body:', {
            hasId: !!req.body.id,
            hasName: !!req.body.name,
            hasSprite: !!req.body.sprite,
            spriteLength: req.body.sprite ? req.body.sprite.length : 0
        });
        
        const { id, name, description, sprite, class: charClass, is_default } = req.body;
        
        if (!name || !sprite) {
            console.error('❌ Missing required fields:', { name: !!name, sprite: !!sprite });
            return res.status(400).json({ error: 'Name und Sprite sind erforderlich' });
        }
        
        const characterId = id || `char_${Date.now()}`;
        
        // If is_default is true, set all others to false
        if (is_default) {
            await db.query('UPDATE characters SET is_default = 0');
        }
        
        await db.query(
            `INSERT INTO characters (id, name, description, sprite, class, is_default)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                description = VALUES(description),
                sprite = VALUES(sprite),
                class = VALUES(class),
                is_default = VALUES(is_default),
                updated_at = CURRENT_TIMESTAMP`,
            [characterId, name, description || '', sprite, charClass || 'hunter', is_default ? 1 : 0]
        );
        
        console.log(`✅ Character saved: ${name} (${characterId})`);
        
        res.json({ 
            success: true, 
            character: { 
                id: characterId, 
                name, 
                description, 
                sprite, 
                class: charClass,
                is_default 
            } 
        });
    } catch (error) {
        console.error('Error saving character:', error);
        res.status(500).json({ error: 'Fehler beim Speichern des Characters' });
    }
});

// Delete character
router.delete('/:id', async (req, res) => {
    try {
        await ensureCharactersTable();
        
        await db.query('DELETE FROM characters WHERE id = ?', [req.params.id]);
        
        console.log(`🗑️ Character deleted: ${req.params.id}`);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting character:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Characters' });
    }
});

module.exports = router;
