-- ==========================================
-- GATEFALL MULTIPLAYER DATABASE SCHEMA
-- MySQL Version
-- ==========================================

SET FOREIGN_KEY_CHECKS = 0;

-- Users Tabelle (Basis Accounts)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    discord_id VARCHAR(100) UNIQUE,
    discord_username VARCHAR(100),
    discord_avatar VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified_at TIMESTAMP NULL,
    verify_token_hash VARCHAR(255),
    verify_token_expires_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    is_online BOOLEAN DEFAULT FALSE,
    INDEX idx_email (email),
    INDEX idx_discord_id (discord_id),
    INDEX idx_online (is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Guilds (Echte Spieler-Gilden)
CREATE TABLE IF NOT EXISTS guilds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    leader_id INT NOT NULL,
    min_hunter_rank ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS') DEFAULT 'E',
    min_level INT DEFAULT 1,
    max_members INT DEFAULT 50,
    current_members INT DEFAULT 1,
    guild_level INT DEFAULT 1,
    guild_exp INT DEFAULT 0,
    total_gold INT DEFAULT 0,
    emblem VARCHAR(10) DEFAULT '🛡️',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_leader (leader_id),
    INDEX idx_name (name),
    INDEX idx_level (guild_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player Stats (Spieler-Progression)
CREATE TABLE IF NOT EXISTS player_stats (
    user_id INT PRIMARY KEY,
    level INT NOT NULL DEFAULT 1,
    experience INT NOT NULL DEFAULT 0,
    hunter_rank ENUM('E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS') DEFAULT 'E',
    role VARCHAR(50) DEFAULT 'waechter',
    
    -- Base Stats
    strength INT DEFAULT 10,
    vitality INT DEFAULT 10,
    agility INT DEFAULT 10,
    intelligence INT DEFAULT 10,
    perception INT DEFAULT 10,
    
    -- Resources
    current_hp INT DEFAULT 100,
    max_hp INT DEFAULT 100,
    current_mp INT DEFAULT 50,
    max_mp INT DEFAULT 50,
    current_stamina INT DEFAULT 100,
    max_stamina INT DEFAULT 100,
    
    -- Economy
    gold INT DEFAULT 0,
    crystals INT DEFAULT 0,
    
    -- Guild
    guild_id INT NULL,
    
    -- Progression
    awakening_state ENUM('locked', 'available', 'in_progress', 'completed') DEFAULT 'locked',
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_level (level),
    INDEX idx_rank (hunter_rank),
    INDEX idx_guild (guild_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player Skills (Ausgerüstete Skills)
CREATE TABLE IF NOT EXISTS player_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skill_id VARCHAR(100) NOT NULL,
    skill_level INT DEFAULT 1,
    times_used INT DEFAULT 0,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parties (Gruppen für Co-op)
CREATE TABLE IF NOT EXISTS parties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    leader_id INT NOT NULL,
    max_members INT DEFAULT 4,
    current_members INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    current_dungeon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disbanded_at TIMESTAMP NULL,
    
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_active (is_active),
    INDEX idx_leader (leader_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Party Members
CREATE TABLE IF NOT EXISTS party_members (
    party_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50),
    is_ready BOOLEAN DEFAULT FALSE,
    
    PRIMARY KEY (party_id, user_id),
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Game Skills (Admin-definierte Skills)
CREATE TABLE IF NOT EXISTS game_skills (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('damage', 'healing', 'buff', 'debuff', 'utility') DEFAULT 'damage',
    element VARCHAR(50),
    base_damage INT,
    base_healing INT,
    base_mana_cost INT,
    base_stamina_cost INT,
    base_cooldown INT,
    min_player_level INT DEFAULT 1,
    roles JSON,
    can_hunter_use BOOLEAN DEFAULT FALSE,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_min_level (min_player_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enemies (Admin-definierte Gegner)
CREATE TABLE IF NOT EXISTS enemies (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INT NOT NULL,
    is_boss BOOLEAN DEFAULT FALSE,
    hp INT NOT NULL,
    attack INT NOT NULL,
    defense INT NOT NULL,
    speed INT NOT NULL,
    element VARCHAR(50),
    gold_reward INT DEFAULT 0,
    exp_reward INT DEFAULT 0,
    skills JSON,
    sprite TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_level (level),
    INDEX idx_boss (is_boss)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Combat Logs (für gemeinsame Kämpfe)
CREATE TABLE IF NOT EXISTS combat_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    party_id INT,
    enemy_id VARCHAR(100),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    result ENUM('victory', 'defeat', 'fled', 'ongoing') DEFAULT 'ongoing',
    total_damage_dealt INT DEFAULT 0,
    total_healing_done INT DEFAULT 0,
    turns_taken INT DEFAULT 0,
    
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL,
    INDEX idx_party (party_id),
    INDEX idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    channel ENUM('global', 'guild', 'party') DEFAULT 'global',
    guild_id INT NULL,
    party_id INT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
    INDEX idx_channel (channel),
    INDEX idx_created (created_at),
    INDEX idx_guild (guild_id),
    INDEX idx_party (party_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    item_type ENUM('weapon', 'armor', 'consumable', 'material', 'key_item') NOT NULL,
    quantity INT DEFAULT 1,
    is_equipped BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_type (item_type),
    INDEX idx_equipped (is_equipped)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Friend Lists
CREATE TABLE IF NOT EXISTS friendships (
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    
    PRIMARY KEY (user_id, friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions (für Online-Status)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    INDEX idx_expires (expires_at),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- VIEWS für häufige Abfragen
-- ==========================================

-- Online Players View
CREATE OR REPLACE VIEW online_players AS
SELECT 
    u.id,
    u.display_name,
    u.is_online,
    u.last_login,
    ps.level,
    ps.hunter_rank,
    ps.role,
    ps.guild_id,
    g.name as guild_name
FROM users u
LEFT JOIN player_stats ps ON u.id = ps.user_id
LEFT JOIN guilds g ON ps.guild_id = g.id
WHERE u.is_online = TRUE;

-- Guild Rankings View
CREATE OR REPLACE VIEW guild_rankings AS
SELECT 
    g.id,
    g.name,
    g.guild_level,
    g.guild_exp,
    g.current_members,
    g.total_gold,
    u.display_name as leader_name,
    COUNT(DISTINCT ps.user_id) as active_members,
    AVG(ps.level) as avg_member_level
FROM guilds g
LEFT JOIN users u ON g.leader_id = u.id
LEFT JOIN player_stats ps ON g.id = ps.guild_id
GROUP BY g.id, g.name, g.guild_level, g.guild_exp, g.current_members, g.total_gold, u.display_name
ORDER BY g.guild_level DESC, g.guild_exp DESC;

-- ==========================================
-- Enable Foreign Keys Again
-- ==========================================

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- Enable Foreign Keys Again
-- ==========================================

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- Initial Admin User
-- ==========================================
-- Note: Password hash will be created by setup script
