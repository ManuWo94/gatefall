/**
 * COMBAT SYSTEM - API Routes
 * Routes für Gegner, Bosse und Kampf-Aktionen
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// ==================== ENEMIES ====================

// Get all enemies
router.get('/enemies', async (req, res) => {
    try {
        const { level, is_boss } = req.query;
        
        let query = 'SELECT * FROM enemies WHERE 1=1';
        const params = [];
        
        if (level) {
            query += ' AND level <= ?';
            params.push(parseInt(level) + 5); // +5 levels for variety
        }
        
        if (is_boss !== undefined) {
            query += ' AND is_boss = ?';
            params.push(is_boss === 'true' ? 1 : 0);
        }
        
        query += ' ORDER BY level, name';
        
        const enemies = await db.query(query, params);
        
        console.log(`📜 Loaded ${enemies.length} enemies (level: ${level}, boss: ${is_boss})`);
        
        res.json({ enemies });
    } catch (error) {
        console.error('Error loading enemies:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Gegner' });
    }
});

// Get single enemy
router.get('/enemies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const enemy = await db.query('SELECT * FROM enemies WHERE id = ?', [id]);
        
        if (enemy.length === 0) {
            return res.status(404).json({ error: 'Gegner nicht gefunden' });
        }
        
        res.json({ enemy: enemy[0] });
    } catch (error) {
        console.error('Error loading enemy:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Gegners' });
    }
});

// Create new enemy
router.post('/enemies', async (req, res) => {
    try {
        const enemy = req.body;
        
        await db.query(
            `INSERT INTO enemies (
                id, name, description, level, hp, attack, defense, speed, element,
                gold_reward, exp_reward, sprite, is_boss, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                enemy.id || `enemy_${Date.now()}`,
                enemy.name,
                enemy.description || '',
                enemy.level,
                enemy.maxHp || enemy.hp,
                enemy.baseDamage || enemy.attack,
                enemy.defense || 0,
                enemy.speed || 50,
                enemy.element || null,
                enemy.gold_reward || (enemy.level * 10),
                enemy.exp_reward || (enemy.level * 20),
                enemy.sprite,
                enemy.isBoss ? 1 : 0
            ]
        );
        
        console.log(`✅ Created enemy: ${enemy.name}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating enemy:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen des Gegners' });
    }
});

// Update enemy
router.put('/enemies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const enemy = req.body;
        
        await db.query(
            `UPDATE enemies SET 
                name = ?, description = ?, level = ?, hp = ?, attack = ?, 
                defense = ?, speed = ?, element = ?, gold_reward = ?, exp_reward = ?,
                sprite = ?, is_boss = ?, updated_at = NOW()
            WHERE id = ?`,
            [
                enemy.name,
                enemy.description || '',
                enemy.level,
                enemy.maxHp || enemy.hp,
                enemy.baseDamage || enemy.attack,
                enemy.defense || 0,
                enemy.speed || 50,
                enemy.element || null,
                enemy.gold_reward || (enemy.level * 10),
                enemy.exp_reward || (enemy.level * 20),
                enemy.sprite,
                enemy.isBoss ? 1 : 0,
                id
            ]
        );
        
        console.log(`✏️ Updated enemy: ${enemy.name} (${id})`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating enemy:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Gegners' });
    }
});

// Get random enemies for gate/dungeon
router.get('/enemies/random/:count', async (req, res) => {
    try {
        const { count } = req.params;
        const { level, include_boss } = req.query;
        
        const maxLevel = level ? parseInt(level) + 5 : 100;
        const minLevel = level ? Math.max(1, parseInt(level) - 2) : 1;
        
        let query = `
            SELECT * FROM enemies 
            WHERE level BETWEEN ? AND ?
            ${include_boss === 'false' ? 'AND is_boss = 0' : ''}
            ORDER BY RAND()
            LIMIT ?
        `;
        
        const enemies = await db.query(query, [minLevel, maxLevel, parseInt(count)]);
        
        console.log(`🎲 Random enemies: ${enemies.length} (level ${minLevel}-${maxLevel})`);
        
        res.json({ enemies });
    } catch (error) {
        console.error('Error getting random enemies:', error);
        res.status(500).json({ error: 'Fehler beim Laden zufälliger Gegner' });
    }
});

// ==================== ATTACK ACTIONS ====================

// Get all attack actions
router.get('/attack-actions', async (req, res) => {
    try {
        const actions = await db.query('SELECT * FROM attack_actions ORDER BY name');
        
        console.log(`⚔️ Loaded ${actions.length} attack actions`);
        
        res.json({ actions });
    } catch (error) {
        console.error('Error loading attack actions:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Angriffe' });
    }
});

// Note: Attack Actions routes are now in server/routes/attack-actions.js

// ==================== SKILLS ====================

// Get all skills
router.get('/skills', async (req, res) => {
    try {
        const skills = await db.query('SELECT * FROM game_skills ORDER BY name');
        
        console.log(`🎯 Loaded ${skills.length} skills`);
        
        res.json({ skills });
    } catch (error) {
        console.error('Error loading skills:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Skills' });
    }
});

// Get single skill
router.get('/skills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const skill = await db.query('SELECT * FROM game_skills WHERE id = ?', [id]);
        
        if (skill.length === 0) {
            return res.status(404).json({ error: 'Skill nicht gefunden' });
        }
        
        res.json({ skill: skill[0] });
    } catch (error) {
        console.error('Error loading skill:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Skills' });
    }
});

// Create new skill
router.post('/skills', async (req, res) => {
    try {
        const skill = req.body;
        
        await db.query(
            `INSERT INTO game_skills (
                id, name, description, rank, icon, type, 
                cost_type, cost_value, effects, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                skill.id || `skill_${Date.now()}`,
                skill.name,
                skill.description,
                skill.rank || 'E',
                skill.icon,
                skill.type,
                skill.cost_type || 'mana',
                skill.cost_value || 0,
                JSON.stringify(skill.effects || {})
            ]
        );
        
        console.log(`✅ Created skill: ${skill.name}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen des Skills' });
    }
});

// Update skill
router.put('/skills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const skill = req.body;
        
        await db.query(
            `UPDATE game_skills SET 
                name = ?, description = ?, rank = ?, icon = ?, 
                type = ?, cost_type = ?, cost_value = ?, effects = ?, updated_at = NOW()
            WHERE id = ?`,
            [
                skill.name,
                skill.description,
                skill.rank,
                skill.icon,
                skill.type,
                skill.cost_type,
                skill.cost_value,
                JSON.stringify(skill.effects || {}),
                id
            ]
        );
        
        console.log(`✏️ Updated skill: ${skill.name} (${id})`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Skills' });
    }
});

// Delete skill
router.delete('/skills/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM game_skills WHERE id = ?', [id]);
        
        console.log(`🗑️ Deleted skill: ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Skills' });
    }
});

// Update enemy
router.put('/enemies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, hp, mana, attack, defense, sprite, is_boss } = req.body;
        
        await db.query(
            `UPDATE enemies SET 
                name = ?, level = ?, hp = ?, mana = ?, 
                attack = ?, defense = ?, sprite = ?, is_boss = ?
            WHERE id = ?`,
            [name, level, hp, mana, attack, defense, sprite, is_boss ? 1 : 0, id]
        );
        
        console.log(`✏️ Updated enemy: ${name} (${id})`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating enemy:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Gegners' });
    }
});

// Delete enemy
router.delete('/enemies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM enemies WHERE id = ?', [id]);
        
        console.log(`🗑️ Deleted enemy: ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting enemy:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Gegners' });
    }
});

module.exports = router;
