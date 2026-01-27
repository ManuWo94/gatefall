/**
 * SKILLS SYSTEM - API Routes
 * Routes für Skills-Management
 */

const express = require('express');
const router = express.Router();
const db = require('../db-mysql');

// ==================== SKILLS ====================

// Get all skills
router.get('/', async (req, res) => {
    try {
        const { usable_by, skill_type, damage_type } = req.query;
        
        let query = 'SELECT * FROM skills WHERE 1=1';
        const params = [];
        
        if (usable_by) {
            query += ' AND (usable_by = ? OR usable_by = "both")';
            params.push(usable_by);
        }
        
        if (skill_type) {
            query += ' AND skill_type = ?';
            params.push(skill_type);
        }
        
        if (damage_type) {
            query += ' AND damage_type = ?';
            params.push(damage_type);
        }
        
        query += ' ORDER BY skill_type, name';
        
        const skills = await db.query(query, params);
        
        console.log(`📜 Loaded ${skills.length} skills`);
        
        res.json({ skills });
    } catch (error) {
        console.error('Error loading skills:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Skills' });
    }
});

// Get single skill
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const skill = await db.query('SELECT * FROM skills WHERE id = ?', [id]);
        
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
router.post('/', async (req, res) => {
    try {
        const skill = req.body;
        
        // Map frontend field names to database field names
        const skillType = skill.skill_type || skill.type || 'damage';
        const damageType = skill.damage_type || skill.element || 'physical';
        const baseValue = skill.base_value || skill.baseDamage || skill.baseHealing || 0;
        const manaCost = skill.mana_cost || skill.baseManaCost || 0;
        const staminaCost = skill.stamina_cost || skill.baseStaminaCost || 0;
        const cooldown = skill.cooldown || skill.baseCooldown || 0;
        const minLevel = skill.min_level || skill.minPlayerLevel || 1;
        
        await db.query(
            `INSERT INTO skills (
                id, name, description, icon,
                mana_cost, stamina_cost, cooldown,
                skill_type, damage_type, base_value, duration,
                status_effect, target_type, usable_by, min_level,
                animation, sound,
                roles, module_index, requires_specialization, specialization_tier, is_cross_class, role_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                skill.id || `skill_${Date.now()}`,
                skill.name,
                skill.description || '',
                skill.icon || null,
                manaCost,
                staminaCost,
                cooldown,
                skillType,
                damageType,
                baseValue,
                skill.duration || 0,
                skill.status_effect || null,
                skill.target_type || 'single_enemy',
                skill.usable_by || 'both',
                minLevel,
                skill.animation || 'attack',
                skill.sound || null,
                // Neue Felder
                skill.roles || null,
                skill.module_index !== undefined ? skill.module_index : null,
                skill.requires_specialization || null,
                skill.specialization_tier || 0,
                skill.is_cross_class || false,
                skill.role_type || null
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
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const skill = req.body;
        
        // Map frontend field names to database field names
        const skillType = skill.skill_type || skill.type || 'damage';
        const damageType = skill.damage_type || skill.element || 'physical';
        const baseValue = skill.base_value || skill.baseDamage || skill.baseHealing || 0;
        const manaCost = skill.mana_cost || skill.baseManaCost || 0;
        const staminaCost = skill.stamina_cost || skill.baseStaminaCost || 0;
        const cooldown = skill.cooldown || skill.baseCooldown || 0;
        const minLevel = skill.min_level || skill.minPlayerLevel || 1;
        
        await db.query(
            `UPDATE skills SET 
                name = ?, description = ?, icon = ?,
                mana_cost = ?, stamina_cost = ?, cooldown = ?,
                skill_type = ?, damage_type = ?, base_value = ?, 
                duration = ?,
                status_effect = ?, target_type = ?, usable_by = ?, 
                min_level = ?, animation = ?, sound = ?,
                roles = ?, module_index = ?, requires_specialization = ?,
                specialization_tier = ?, is_cross_class = ?, role_type = ?,
                updated_at = NOW()
            WHERE id = ?`,
            [
                skill.name,
                skill.description || '',
                skill.icon || null,
                manaCost,
                staminaCost,
                cooldown,
                skillType,
                damageType,
                baseValue,
                skill.duration || 0,
                skill.status_effect || null,
                skill.target_type || 'single_enemy',
                skill.usable_by || 'both',
                minLevel,
                skill.animation || 'attack',
                skill.sound || null,
                // Neue Felder
                skill.roles || null,
                skill.module_index !== undefined ? skill.module_index : null,
                skill.requires_specialization || null,
                skill.specialization_tier || 0,
                skill.is_cross_class || false,
                skill.role_type || null,
                id
            ]
        );
        
        console.log(`✅ Updated skill: ${skill.name}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating skill:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Skills' });
    }
});

// Delete skill
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.query('DELETE FROM skills WHERE id = ?', [id]);
        
        console.log(`🗑️ Deleted skill: ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting skill:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Skills' });
    }
});

// ==================== ENEMY SKILLS ====================

// Get skills for an enemy
router.get('/enemies/:enemyId/skills', async (req, res) => {
    try {
        const { enemyId } = req.params;
        
        const skills = await db.query(
            `SELECT s.*, es.use_priority, es.min_hp_percent, es.max_hp_percent
            FROM skills s
            JOIN enemy_skills es ON s.id = es.skill_id
            WHERE es.enemy_id = ?
            ORDER BY es.use_priority DESC`,
            [enemyId]
        );
        
        console.log(`📜 Loaded ${skills.length} skills for enemy ${enemyId}`);
        
        res.json({ skills });
    } catch (error) {
        console.error('Error loading enemy skills:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Enemy Skills' });
    }
});

// Assign skill to enemy
router.post('/enemies/:enemyId/skills', async (req, res) => {
    try {
        const { enemyId } = req.params;
        const { skill_id, use_priority, min_hp_percent, max_hp_percent } = req.body;
        
        await db.query(
            `INSERT INTO enemy_skills (enemy_id, skill_id, use_priority, min_hp_percent, max_hp_percent)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            use_priority = VALUES(use_priority),
            min_hp_percent = VALUES(min_hp_percent),
            max_hp_percent = VALUES(max_hp_percent)`,
            [enemyId, skill_id, use_priority || 50, min_hp_percent || 0, max_hp_percent || 100]
        );
        
        console.log(`✅ Assigned skill ${skill_id} to enemy ${enemyId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error assigning skill:', error);
        res.status(500).json({ error: 'Fehler beim Zuweisen des Skills' });
    }
});

// Remove skill from enemy
router.delete('/enemies/:enemyId/skills/:skillId', async (req, res) => {
    try {
        const { enemyId, skillId } = req.params;
        
        await db.query(
            'DELETE FROM enemy_skills WHERE enemy_id = ? AND skill_id = ?',
            [enemyId, skillId]
        );
        
        console.log(`🗑️ Removed skill ${skillId} from enemy ${enemyId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing skill:', error);
        res.status(500).json({ error: 'Fehler beim Entfernen des Skills' });
    }
});

module.exports = router;
