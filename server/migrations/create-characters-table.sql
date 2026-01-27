-- Characters Table für Spieler-Charaktere
CREATE TABLE IF NOT EXISTS characters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sprite LONGTEXT NOT NULL COMMENT 'Base64 encoded character sprite',
    class VARCHAR(50) DEFAULT 'hunter' COMMENT 'Character class: hunter, mage, warrior, etc',
    is_default TINYINT(1) DEFAULT 0 COMMENT 'Default character for new players',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add character_id to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS character_id VARCHAR(50) DEFAULT NULL,
ADD CONSTRAINT fk_user_character FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL;
