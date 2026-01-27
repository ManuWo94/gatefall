const mysql = require('mysql2/promise');

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '', // XAMPP default hat kein Passwort
    database: 'gatefall_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
    charset: 'utf8mb4'
});

// Set max_allowed_packet for large Base64 images
pool.query('SET GLOBAL max_allowed_packet=67108864').catch(err => {
    console.log('Note: max_allowed_packet already set or requires manual configuration');
});

// Test connection
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL Verbindung erfolgreich!');
        conn.release();
    })
    .catch(err => {
        console.error('⚠️ MySQL Verbindungsfehler:', err.message);
        console.error('⚠️ Server läuft weiter, aber Datenbankfunktionen sind eingeschränkt');
        console.error('⚠️ Stelle sicher, dass MySQL läuft (XAMPP Control Panel)');
    });

// ==================== HELPER FUNCTIONS ====================

async function query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
}

async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows[0] || null;
}

// ==================== USERS ====================

async function createUser(email, passwordHash, displayName, role = 'waechter') {
    const result = await query(
        'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
        [email, passwordHash, displayName]
    );
    
    const userId = result.insertId;
    
    // Player stats werden automatisch durch Trigger erstellt
    // Aber wir setzen die Rolle
    await query(
        'UPDATE player_stats SET role = ? WHERE user_id = ?',
        [role, userId]
    );
    
    return getUserById(userId);
}

async function getUserByEmail(email) {
    return queryOne(
        `SELECT u.*, ps.* 
         FROM users u 
         LEFT JOIN player_stats ps ON u.id = ps.user_id 
         WHERE u.email = ?`,
        [email]
    );
}

async function getUserById(id) {
    return queryOne(
        `SELECT u.*, ps.* 
         FROM users u 
         LEFT JOIN player_stats ps ON u.id = ps.user_id 
         WHERE u.id = ?`,
        [id]
    );
}

async function updateUser(userId, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), userId];
    
    await query(
        `UPDATE users SET ${fields} WHERE id = ?`,
        values
    );
    
    return getUserById(userId);
}

async function setUserOnline(userId, isOnline) {
    await query(
        'UPDATE users SET is_online = ?, last_login = NOW() WHERE id = ?',
        [isOnline, userId]
    );
}

// ==================== PLAYER STATS ====================

async function updatePlayerStats(userId, updates) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), userId];
    
    await query(
        `UPDATE player_stats SET ${fields} WHERE user_id = ?`,
        values
    );
    
    return getUserById(userId);
}

async function addExperience(userId, xp) {
    const player = await getUserById(userId);
    const newXp = player.experience + xp;
    let newLevel = player.level;
    
    // Simple leveling: 100 XP per level
    while (newXp >= newLevel * 100) {
        newLevel++;
    }
    
    await updatePlayerStats(userId, {
        experience: newXp,
        level: newLevel
    });
    
    return { leveledUp: newLevel > player.level, newLevel, newXp };
}

async function addGold(userId, amount) {
    await query(
        'UPDATE player_stats SET gold = gold + ? WHERE user_id = ?',
        [amount, userId]
    );
}

// ==================== SKILLS ====================

async function getPlayerSkills(userId) {
    return query(
        'SELECT * FROM player_skills WHERE user_id = ?',
        [userId]
    );
}

async function unlockSkill(userId, skillId) {
    await query(
        'INSERT INTO player_skills (user_id, skill_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE skill_id = skill_id',
        [userId, skillId]
    );
}

async function getGameSkills() {
    return query('SELECT * FROM game_skills ORDER BY min_player_level, name');
}

async function getGameSkillsForRole(role, playerLevel) {
    return query(
        `SELECT * FROM game_skills 
         WHERE JSON_CONTAINS(roles, ?) AND min_player_level <= ?
         ORDER BY min_player_level`,
        [JSON.stringify(role), playerLevel]
    );
}

async function saveGameSkill(skill) {
    const exists = await queryOne('SELECT id FROM game_skills WHERE id = ?', [skill.id]);
    
    if (exists) {
        await query(
            `UPDATE game_skills SET 
             name = ?, description = ?, type = ?, element = ?,
             base_damage = ?, base_healing = ?, base_mana_cost = ?,
             base_stamina_cost = ?, base_cooldown = ?, min_player_level = ?,
             roles = ?, can_hunter_use = ?, icon = ?
             WHERE id = ?`,
            [
                skill.name, skill.description, skill.type, skill.element,
                skill.baseDamage, skill.baseHealing, skill.baseManaCost,
                skill.baseStaminaCost, skill.baseCooldown, skill.minPlayerLevel,
                JSON.stringify(skill.roles), skill.canHunterUse, skill.icon,
                skill.id
            ]
        );
    } else {
        await query(
            `INSERT INTO game_skills 
             (id, name, description, type, element, base_damage, base_healing,
              base_mana_cost, base_stamina_cost, base_cooldown, min_player_level,
              roles, can_hunter_use, icon)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                skill.id, skill.name, skill.description, skill.type, skill.element,
                skill.baseDamage, skill.baseHealing, skill.baseManaCost,
                skill.baseStaminaCost, skill.baseCooldown, skill.minPlayerLevel,
                JSON.stringify(skill.roles), skill.canHunterUse, skill.icon
            ]
        );
    }
}

async function deleteGameSkill(skillId) {
    await query('DELETE FROM game_skills WHERE id = ?', [skillId]);
}

// ==================== GUILDS ====================

async function createGuild(name, description, leaderId, minRank = 'E', minLevel = 1) {
    const result = await query(
        `INSERT INTO guilds (name, description, leader_id, min_hunter_rank, min_level)
         VALUES (?, ?, ?, ?, ?)`,
        [name, description, leaderId, minRank, minLevel]
    );
    
    const guildId = result.insertId;
    
    // Leader joins guild
    await query(
        'UPDATE player_stats SET guild_id = ? WHERE user_id = ?',
        [guildId, leaderId]
    );
    
    return queryOne('SELECT * FROM guilds WHERE id = ?', [guildId]);
}

async function getAllGuilds() {
    return query(
        `SELECT g.*, u.display_name as leader_name
         FROM guilds g
         LEFT JOIN users u ON g.leader_id = u.id
         ORDER BY g.guild_level DESC, g.current_members DESC`
    );
}

async function joinGuild(userId, guildId) {
    await query(
        'UPDATE player_stats SET guild_id = ? WHERE user_id = ?',
        [guildId, userId]
    );
}

async function leaveGuild(userId) {
    await query(
        'UPDATE player_stats SET guild_id = NULL WHERE user_id = ?',
        [userId]
    );
}

// ==================== PARTIES ====================

async function createParty(leaderId, name = null) {
    const result = await query(
        'INSERT INTO parties (leader_id, name) VALUES (?, ?)',
        [leaderId, name]
    );
    
    const partyId = result.insertId;
    
    // Leader joins party
    await query(
        'INSERT INTO party_members (party_id, user_id) VALUES (?, ?)',
        [partyId, leaderId]
    );
    
    return queryOne('SELECT * FROM parties WHERE id = ?', [partyId]);
}

async function joinParty(userId, partyId, role = null) {
    const party = await queryOne('SELECT * FROM parties WHERE id = ?', [partyId]);
    
    if (party.current_members >= party.max_members) {
        throw new Error('Party ist voll');
    }
    
    await query(
        'INSERT INTO party_members (party_id, user_id, role) VALUES (?, ?, ?)',
        [partyId, userId, role]
    );
    
    await query(
        'UPDATE parties SET current_members = current_members + 1 WHERE id = ?',
        [partyId]
    );
}

async function leaveParty(userId, partyId) {
    await query(
        'DELETE FROM party_members WHERE party_id = ? AND user_id = ?',
        [partyId, userId]
    );
    
    await query(
        'UPDATE parties SET current_members = current_members - 1 WHERE id = ?',
        [partyId]
    );
}

async function getPartyMembers(partyId) {
    return query(
        `SELECT pm.*, u.display_name, ps.level, ps.role, ps.hunter_rank
         FROM party_members pm
         JOIN users u ON pm.user_id = u.id
         LEFT JOIN player_stats ps ON u.id = ps.user_id
         WHERE pm.party_id = ?`,
        [partyId]
    );
}

// ==================== CHAT ====================

async function saveChatMessage(userId, channel, message, guildId = null, partyId = null) {
    await query(
        'INSERT INTO chat_messages (user_id, channel, message, guild_id, party_id) VALUES (?, ?, ?, ?, ?)',
        [userId, channel, message, guildId, partyId]
    );
}

async function getChatMessages(channel, targetId = null, limit = 50) {
    let sql = 'SELECT cm.*, u.display_name FROM chat_messages cm JOIN users u ON cm.user_id = u.id WHERE channel = ?';
    let params = [channel];
    
    if (channel === 'guild' && targetId) {
        sql += ' AND guild_id = ?';
        params.push(targetId);
    } else if (channel === 'party' && targetId) {
        sql += ' AND party_id = ?';
        params.push(targetId);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    
    return query(sql, params);
}

// ==================== ONLINE PLAYERS ====================

async function getOnlinePlayers() {
    return query(
        `SELECT u.id, u.display_name, u.last_login, 
                ps.level, ps.hunter_rank, ps.role, ps.guild_id,
                g.name as guild_name
         FROM users u
         LEFT JOIN player_stats ps ON u.id = ps.user_id
         LEFT JOIN guilds g ON ps.guild_id = g.id
         WHERE u.is_online = TRUE`
    );
}

// ==================== ADMIN ====================

async function createAdminUser() {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);
    
    const existing = await getUserByEmail('admin@gatefall.de');
    if (existing) {
        console.log('Admin user already exists');
        return;
    }
    
    const result = await query(
        `INSERT INTO users (email, password_hash, display_name, is_admin, email_verified_at)
         VALUES (?, ?, ?, ?, NOW())`,
        ['admin@gatefall.de', hash, '⚙️ ADMIN', true]
    );
    
    console.log('✅ Admin user created: admin@gatefall.de / admin123');
}

// ==================== VICTORY BUILDER ====================

async function saveVictoryBuilderSettings(settingName, cssCode, settingsJson) {
    return await query(
        `INSERT INTO victory_builder_settings (setting_name, css_code, settings_json) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE css_code = ?, settings_json = ?, updated_at = CURRENT_TIMESTAMP`,
        [settingName, cssCode, settingsJson, cssCode, settingsJson]
    );
}

async function getVictoryBuilderSettings(settingName) {
    return await queryOne(
        'SELECT * FROM victory_builder_settings WHERE setting_name = ?',
        [settingName]
    );
}

async function getAllVictoryBuilderSettings() {
    return await query('SELECT * FROM victory_builder_settings ORDER BY updated_at DESC');
}

// ==================== EXPORTS ====================

module.exports = {
    pool,
    query,
    queryOne,
    
    // Users
    createUser,
    getUserByEmail,
    getUserById,
    updateUser,
    setUserOnline,
    
    // Player Stats
    updatePlayerStats,
    addExperience,
    addGold,
    
    // Skills
    getPlayerSkills,
    unlockSkill,
    getGameSkills,
    getGameSkillsForRole,
    saveGameSkill,
    deleteGameSkill,
    
    // Guilds
    createGuild,
    getAllGuilds,
    joinGuild,
    leaveGuild,
    
    // Parties
    createParty,
    joinParty,
    leaveParty,
    getPartyMembers,
    
    // Chat
    saveChatMessage,
    getChatMessages,
    
    // Online
    getOnlinePlayers,
    
    // Admin
    createAdminUser,
    
    // Victory Builder
    saveVictoryBuilderSettings,
    getVictoryBuilderSettings,
    getAllVictoryBuilderSettings
};
